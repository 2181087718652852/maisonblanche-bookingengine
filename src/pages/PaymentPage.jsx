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

      <div className="powered-by-badges">
        <span className="powered-by-stripe">
          Powered by{' '}
          <svg className="stripe-logo" viewBox="0 0 512 214">
            <path fill="#555555" d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138-33.85 0-54.33 28.73-54.33 64.854 0 42.808 24.179 64.426 58.88 64.426 16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756 8.675 0 17.92 6.685 17.92 22.756zm-90.31-51.627c-13.939 0-22.899 6.542-27.876 11.094l-1.85-8.818h-31.288v165.83l35.555-7.537.143-40.249c5.12 3.698 12.657 8.96 25.173 8.96 25.458 0 48.64-20.48 48.64-65.564-.142-41.245-23.609-63.716-48.498-63.716m-8.534 97.991c-8.391 0-13.37-2.986-16.782-6.684l-.143-52.765c3.698-4.124 8.818-6.968 16.925-6.968 12.942 0 21.902 14.506 21.902 33.137 0 19.058-8.818 33.28-21.902 33.28M241.493 36.551l35.698-7.68V0l-35.698 7.538zm0 10.809h35.698v124.444h-35.698zm-38.257 10.524L200.96 47.36h-30.72v124.444h35.556V87.467c8.39-10.951 22.613-8.96 27.022-7.396V47.36c-4.551-1.707-21.191-4.836-29.582 10.524m-71.112-41.386-34.702 7.395-.142 113.92c0 21.05 15.787 36.551 36.836 36.551 11.662 0 20.195-2.133 24.888-4.693V140.8c-4.55 1.849-27.022 8.391-27.022-12.658V77.653h27.022V47.36h-27.022zM35.982 83.484c0-5.546 4.551-7.68 12.09-7.68 10.808 0 24.461 3.272 35.27 9.103V51.484c-11.804-4.693-23.466-6.542-35.27-6.542C19.2 44.942 0 60.018 0 85.192c0 39.252 54.044 32.995 54.044 49.92 0 6.541-5.688 8.675-13.653 8.675-11.804 0-26.88-4.836-38.827-11.378v33.849c13.227 5.689 26.596 8.106 38.827 8.106 29.582 0 49.92-14.648 49.92-40.106-.142-42.382-54.329-34.845-54.329-50.774" />
          </svg>
        </span>
        <svg className="pci-dss-logo" viewBox="0 0 652 652" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0.000000, -8.000000)">
            <g>
              <path fill="#225E63" d="M430.5,345.2l6,1.8c-0.4,1.7-1,3.1-1.9,4.2c-0.9,1.1-1.9,2-3.2,2.5c-1.3,0.6-2.9,0.9-4.9,0.9 c-2.4,0-4.3-0.3-5.9-1c-1.5-0.7-2.8-1.9-3.9-3.7c-1.1-1.7-1.7-4-1.7-6.7c0-3.6,1-6.4,2.9-8.4c1.9-2,4.7-2.9,8.2-2.9 c2.8,0,4.9,0.6,6.5,1.7c1.6,1.1,2.8,2.8,3.5,5.2l-6,1.3c-0.2-0.7-0.4-1.2-0.7-1.5c-0.4-0.5-0.8-0.9-1.4-1.2 c-0.6-0.3-1.2-0.4-1.8-0.4c-1.5,0-2.7,0.6-3.5,1.9c-0.6,0.9-0.9,2.4-0.9,4.3c0,2.4,0.4,4.1,1.1,5c0.7,0.9,1.8,1.4,3.1,1.4 c1.3,0,2.3-0.4,2.9-1.1C429.7,347.6,430.2,346.6,430.5,345.2z" />
              <path fill="#225E63" d="M438.9,343.2c0-3.6,1-6.4,3-8.4c2-2,4.8-3,8.4-3c3.7,0,6.5,1,8.5,2.9c2,2,3,4.7,3,8.3c0,2.6-0.4,4.7-1.3,6.3 c-0.9,1.6-2.1,2.9-3.8,3.8c-1.6,0.9-3.7,1.4-6.1,1.4c-2.5,0-4.5-0.4-6.2-1.2c-1.6-0.8-2.9-2-4-3.8S438.9,345.8,438.9,343.2z M445.7,343.2c0,2.2,0.4,3.8,1.2,4.8c0.8,1,1.9,1.5,3.4,1.5c1.5,0,2.6-0.5,3.4-1.4c0.8-1,1.2-2.7,1.2-5.1c0-2.1-0.4-3.6-1.3-4.5 c-0.8-1-2-1.4-3.4-1.4c-1.4,0-2.5,0.5-3.3,1.5C446.1,339.4,445.7,341,445.7,343.2z" />
              <path fill="#225E63" d="M465.3,332.2h8.9l3.4,13.4l3.4-13.4h8.9v22h-5.6v-16.8l-4.3,16.8h-5l-4.3-16.8v16.8h-5.6V332.2z" />
              <path fill="#225E63" d="M494.3,332.2h11.3c2.5,0,4.3,0.6,5.5,1.8c1.2,1.2,1.8,2.8,1.8,5c0,2.2-0.7,4-2,5.2c-1.3,1.3-3.4,1.9-6.1,1.9 h-3.7v8.2h-6.8V332.2z M501.1,341.6h1.7c1.3,0,2.2-0.2,2.8-0.7c0.5-0.5,0.8-1,0.8-1.7c0-0.7-0.2-1.3-0.7-1.8 c-0.5-0.5-1.3-0.7-2.6-0.7h-1.9V341.6z" />
              <path fill="#225E63" d="M516.5,332.2h6.8v16.6h10.6v5.4h-17.4V332.2z" />
              <path fill="#225E63" d="M537.3,332.2h6.8v22h-6.8V332.2z" />
              <path fill="#225E63" d="M562.5,350.5h-7.7l-1.1,3.6h-6.9l8.3-22h7.4l8.3,22h-7.1L562.5,350.5z M561.1,345.8l-2.4-7.9l-2.4,7.9H561.1z" />
              <path fill="#225E63" d="M572.9,332.2h6.3l8.3,12.2v-12.2h6.4v22h-6.4l-8.2-12.1v12.1h-6.4V332.2z" />
              <path fill="#225E63" d="M596.9,332.2h20.7v5.4h-6.9v16.6h-6.8v-16.6h-6.9V332.2z" />
            </g>
            <g transform="translate(0.000000, 8.500000)">
              <path fill="#225E63" d="M348.7,357.2l19.7-6.2l-6.4-14.2C357.3,342.7,352.6,350.3,348.7,357.2z M342,292.3 l-38.6-86l-282.6,16l78.3,213.6l150.7-47.5c-9.6-13.8-13.1-30.2-2-38.2c12.4-9,31.1,1.4,43,16.1 C302.3,347.1,334.6,302.4,342,292.3z" />
              <g transform="translate(101.995804, 41.349650)">
                <path fill="#FEFEFE" d="M192.6,227.1c11.8,0,21.4-9,21.4-20.2c0-11.2-9.6-20.2-21.4-20.2c-11.8,0-21.4,9-21.4,20.2 C171.2,218,180.8,227.1,192.6,227.1z M175.1,235.8h35v91.5h-35V235.8z" />
                <path fill="#FEFEFE" d="M157.8,262.5c0.3,0.1,0.5,0,0.5-0.3v-23.2c0-0.3-0.2-0.6-0.5-0.8c0,0-4.6-3-18.6-3.8 c-0.7-0.4-13-0.5-16.3,0c-51,4.1-52.9,41-52.9,42.6v9c0,1.1,0,38.8,52.9,42.1c5.2,0.4,15.3,0,16.3,0c12.2,0,20.6-3.7,20.6-3.7 c0.3-0.1,0.5-0.4,0.5-0.7v-21.7c0-0.3-0.2-0.4-0.4-0.2c0,0-3.8,3-20.4,4.7c-4.7,0.5-7,0.3-8.7,0c-23.6-4-24.7-21.2-24.7-21.2 c0-0.3-0.1-0.8-0.1-1v-6.6c0-0.3,0-0.8,0.1-1c0,0,1.6-18.5,24.7-20.5h8.7C149.6,257.5,157.8,262.5,157.8,262.5z" />
                <path fill="#FEFEFE" d="M-27.2,327c0,0.3,0.2,0.5,0.5,0.5H7.4c0.3,0,0.5-0.2,0.5-0.5v-26.6c0-0.3,0.2-0.5,0.5-0.5 c0,0,54.5,3.9,54.5-32.6c0-28.9-34.2-32-45.4-31.5c-0.2,0-44.2,0-44.2,0c-0.3,0-0.5,0.2-0.5,0.5L-27.2,327z M7.3,279.6v-23.9 h8.4c0,0,12.1,0.5,13.1,8.8c0.2,0.6,0.2,4.7,0,4.9c-1.6,9.7-12.1,10.2-12.1,10.2L7.3,279.6z" />
              </g>
              <path fill="#2BBC5D" d="M295.6,412.8c2.8,0,5,0,8.6-1.6c12.4-6.5,54.3-108.8,98.5-140.3c0.3-0.2,0.6-0.5,0.8-0.8 c0.3-0.4,0.3-0.8,0.3-0.8s0-2.1-6.5-2.1c-39.3-1.1-80.2,81.4-101.7,114c-0.3,0.4-1.7,0-1.7,0s-14.4-17-26.9-23.5 c-0.3-0.1-1.7-0.6-3.2-0.5c-1,0-6.8,1.2-9.5,4c-3.2,3.4-3.1,5.3-3.1,9.4c0,0.3,0.2,1.7,0.6,2.4c3.1,5.4,17,24.6,28.5,35.2 C282,409.5,284.7,412.8,295.6,412.8z" />
            </g>
          </g>
        </svg>
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
