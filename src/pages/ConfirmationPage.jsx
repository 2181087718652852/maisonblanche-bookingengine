import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { t, formatDateLong } from '../i18n';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK;
const stripePromise = loadStripe(STRIPE_PK);

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState(null);
  const emailsSentRef = useRef(false);

  const bookingId = searchParams.get('bookingId') || searchParams.get('payment_intent');
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');

    function fireEmails() {
      if (emailsSentRef.current) return;
      emailsSentRef.current = true;
      fetch('https://api.lamaisonblanche.ca/v1/send-confirmation-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId, firstName, lastName, email, phone,
          checkIn, checkOut, guests,
        }),
      }).catch((e) => console.error('Email send failed:', e));
    }

    if (!clientSecret) {
      if (bookingId) {
        setStatus('succeeded');
        fireEmails();
      } else {
        setStatus('failed');
      }
      return;
    }

    stripePromise.then((stripe) => {
      if (!stripe) { setStatus('failed'); return; }
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) { setStatus('failed'); return; }
        switch (paymentIntent.status) {
          case 'succeeded':
          case 'requires_capture':
            setStatus('succeeded');
            fireEmails();
            break;
          case 'processing':
            setStatus('processing');
            break;
          default:
            setStatus('failed');
            setErrorMsg('Payment could not be authorized.');
        }
      }).catch(() => setStatus('failed'));
    });
  }, []);

  if (status === 'processing') {
    return (
      <div className="confirmation-wrap">
        <div className="loading-wrap">
          <div className="spinner" />
          <span>{t('processing')}</span>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="confirmation-wrap">
        <div className="confirmation-card">
          <div className="confirmation-icon failed">✕</div>
          <h1>{t('paymentFailed')}</h1>
          <p className="confirmation-sub">{errorMsg || t('paymentFailedSub')}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>{t('backHome')}</button>
        </div>
      </div>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const guestCount = parseInt(guests || '1', 10);

  return (
    <div className="confirmation-wrap">
      <div className="confirmation-card">
        <div className="confirmation-icon success">✓</div>
        <h1>{t('bookingConfirmed')}</h1>
        <p className="confirmation-sub">{t('bookingConfirmedSub')}</p>

        {bookingId && (
          <div className="confirmation-id">
            <span className="confirmation-id-label">{t('bookingId')}</span>
            <span className="confirmation-id-value">{bookingId}</span>
          </div>
        )}

        <hr className="confirmation-divider" />

        <h2 className="confirmation-section-title">{t('guestInfo')}</h2>
        <dl className="confirmation-details">
          {fullName && (<><dt>{t('name')}</dt><dd>{fullName}</dd></>)}
          {email && (<><dt>{t('email')}</dt><dd>{email}</dd></>)}
          {phone && (<><dt>{t('phoneNumber')}</dt><dd>{phone}</dd></>)}
          {checkIn && (<><dt>{t('arrival')}</dt><dd>{formatDateLong(checkIn)}</dd></>)}
          {checkOut && (<><dt>{t('departure')}</dt><dd>{formatDateLong(checkOut)}</dd></>)}
          {guests && (
            <><dt>{t('numberOfGuests')}</dt><dd>{guestCount} {guestCount === 1 ? t('guest') : t('guests')}</dd></>
          )}
        </dl>
      </div>
    </div>
  );
}
