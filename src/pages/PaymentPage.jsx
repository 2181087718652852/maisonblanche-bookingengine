import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Ring2 } from 'ldrs/react'
import 'ldrs/react/Ring2.css'
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, AddressElement, useStripe, useElements, } from '@stripe/react-stripe-js';
import { useBooking } from '../services/BookingContext';
import Footer from '../components/Footer';
import { t } from '../i18n';
import { stripePromise } from '../stripeClient';

const TURNSTILE_SITE_KEY = '0x4AAAAAADFM67QgHv49_HTv';

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  labels: 'floating',
  variables: {
    fontFamily: 'SourceSansPro, Arial, sans-serif',
    fontSizeBase: '15px',
    colorText: '#1a1a1a',
    colorBackground: '#ffffff',
    colorPrimary: '#1a1a1a',
    borderRadius: '8px',
    spacingUnit: '4px',
    gridColumnSpacing: '12px',
    gridRowSpacing: '12px',
  },
  rules: {
    '.Input': {
      border: '1px solid #dddddd',
      boxShadow: 'none',
      padding: '15px 16px',
      fontFamily: 'SourceSansPro, Arial, sans-serif',
    },
    '.Input:focus': {
      border: '1px solid #1a1a1a',
      boxShadow: 'none',
      outline: 'none',
    },
    '.Tab': { fontFamily: 'SourceSansPro, Arial, sans-serif' },
    '.TabLabel': { fontFamily: 'SourceSansPro, Arial, sans-serif' },
    '.Text': { fontFamily: 'SourceSansPro, Arial, sans-serif' },
    '.Error': { fontFamily: 'SourceSansPro, Arial, sans-serif' },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const booking = useBooking();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isBusiness, setIsBusiness] = useState(false);

  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);

  const taxIdMountRef = useRef(null);
  const taxIdElementRef = useRef(null);

  useEffect(() => {
    if (!isBusiness) {
      if (taxIdElementRef.current) {
        try {
          taxIdElementRef.current.unmount();
          taxIdElementRef.current.destroy();
        } catch { }
        taxIdElementRef.current = null;
      }
      return;
    }

    if (!elements || !taxIdMountRef.current) return;
    if (taxIdElementRef.current) return;

    const taxIdEl = elements.create('taxId', { visibility: 'always' });
    taxIdEl.mount(taxIdMountRef.current);
    taxIdElementRef.current = taxIdEl;

    return () => {
      if (taxIdElementRef.current) {
        try {
          taxIdElementRef.current.unmount();
          taxIdElementRef.current.destroy();
        } catch { }
        taxIdElementRef.current = null;
      }
    };
  }, [isBusiness, elements]);

  useEffect(() => {
    let mounted = true;
    function tryRender() {
      if (!mounted) return;
      if (!window.turnstile || !turnstileContainerRef.current) {
        setTimeout(tryRender, 100);
        return;
      }
      if (turnstileWidgetIdRef.current) return;
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: 'invisible',
      });
    }
    tryRender();
    return () => {
      mounted = false;
      if (turnstileWidgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(turnstileWidgetIdRef.current); } catch { }
      }
    };
  }, []);

  function getTurnstileToken() {
    return new Promise((resolve, reject) => {
      if (!window.turnstile || !turnstileWidgetIdRef.current) {
        return reject(new Error('Turnstile not ready'));
      }
      try { window.turnstile.reset(turnstileWidgetIdRef.current); } catch { }
      window.turnstile.execute(turnstileWidgetIdRef.current, {
        callback: (token) => resolve(token),
        'error-callback': () => reject(new Error('Turnstile failed')),
        'timeout-callback': () => reject(new Error('Turnstile timed out')),
      });
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    setIsVerifying(true);
    let turnstileToken;
    try {
      turnstileToken = await getTurnstileToken();
    } catch {
      setErrorMessage('Bot verification failed. Please refresh and try again.');
      setIsSubmitting(false);
      setIsVerifying(false);
      return;
    }
    setIsVerifying(false);

    try {
      const verifyRes = await fetch('https://api.lamaisonblanche.ca/v1/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.ok) {
        setErrorMessage(verifyData.error || 'Verification failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
    } catch {
      setErrorMessage('Verification failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    if (isBusiness && taxIdElementRef.current) {
      try {
        const { value: taxIdValue } = await taxIdElementRef.current.getValue();
        if (taxIdValue?.value) {
          await fetch('https://api.lamaisonblanche.ca/v1/update-payment-intent-metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: booking.stripePaymentIntentId,
              metadata: {
                taxIdType: taxIdValue.type || '',
                taxIdValue: taxIdValue.value || '',
                isBusiness: 'true',
              },
            }),
          });
        }
      } catch (err) {
        console.error('Tax ID save failed:', err);
      }
    }

    const params = new URLSearchParams({
      bookingId: booking.stripePaymentIntentId,
      firstName: booking.contactFirstName,
      lastName: booking.contactLastName,
      email: booking.contactEmail,
      phone: booking.contactPhone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: String(booking.guests),
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation?${params.toString()}`,
        payment_method_data: {
          billing_details: {
            name: `${booking.contactFirstName} ${booking.contactLastName}`.trim(),
            email: booking.contactEmail,
            phone: booking.contactPhone,
          },
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="section-title">{t('paymentDetails')}</h1>

      {errorMessage && <div className="error-msg">{errorMessage}</div>}

      <PaymentElement
        options={{
          layout: { type: 'accordion', defaultCollapsed: false, radios: 'never', spacedAccordionItems: false },
          wallets: { applePay: 'auto', googlePay: 'auto' },
          fields: { billingDetails: { address: 'never' } },
          defaultValues: {
            billingDetails: {
              email: booking.contactEmail,
            },
          },
        }}
      />
      <br></br>
      <AddressElement
        options={{
          mode: 'billing',
          autocomplete: { mode: 'automatic' },
          defaultValues: {
            name: `${booking.contactFirstName} ${booking.contactLastName}`.trim(),
            address: { country: booking.contactCountry || 'CA' },
          },
        }}
      />

      <label className="business-checkbox">
        <input
          type="checkbox"
          checked={isBusiness}
          onChange={(e) => setIsBusiness(e.target.checked)}
        />
        <span>{t('purchasingAsBusiness')}</span>
      </label>

      {isBusiness && (
        <div className="tax-id-wrap">
          <div ref={taxIdMountRef} />
        </div>
      )}

      <div className="policy-block">
        <h3>{t('cancellationPolicy')}</h3>
        <p>{t('cancellationPolicyText')}</p>
      </div>
      <div className="policy-block">
        <h3>{t('securityDeposit')}</h3>
        <p>{t('securityDepositText')}</p>
      </div>

      <div ref={turnstileContainerRef} />

      <Footer
        leftSlot={
          isVerifying && (
            <div className="turnstile-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ring2
                size="17"
                stroke="3"
                strokeLength="0.35"
                bgOpacity="0.1"
                speed="0.3"
                color="gray"
              />
              <span>{t('verifyingHuman')}</span>
            </div>
          )
        }
        rightSlot={
          <>
            <button type="button" className="btn-secondary" onClick={() => navigate('/contact')} disabled={isSubmitting}>
              {t('back')}
            </button>
            <button type="submit" className="btn-primary" disabled={!stripe || isSubmitting}>
              {isSubmitting ? <span className="spinner-sm" /> : t('pay')}
            </button>
          </>
        }
      />
    </form>
  );
}

export default function PaymentPage() {
  const booking = useBooking();
  const navigate = useNavigate();

  const hasBookingBasics = Boolean(
    booking.checkIn && booking.checkOut && booking.contactEmail,
  );

  useLayoutEffect(() => {
    if (!booking.stripeClientSecret) return;
    if (!booking.checkIn || !booking.checkOut) {
      navigate('/', { replace: true });
      return;
    }
    if (!booking.contactEmail) {
      navigate('/contact', { replace: true });
    }
  }, [
    booking.stripeClientSecret,
    booking.checkIn,
    booking.checkOut,
    booking.contactEmail,
    navigate,
  ]);

  if (!booking.stripeClientSecret) {
    return <div className="loading-wrap"><div className="spinner" /></div>;
  }

  if (!hasBookingBasics) {
    return <div className="loading-wrap"><div className="spinner" /></div>;
  }

  return (
    <Elements stripe={stripePromise} options={{
      clientSecret: booking.stripeClientSecret,
      appearance: STRIPE_APPEARANCE,
    }}>
      <CheckoutForm />
    </Elements>
  );
}
