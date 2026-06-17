import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../services/BookingContext';
import Footer from '../components/Footer';
import { t, getLocale } from '../i18n';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(enLocale);
countries.registerLocale(frLocale);

export default function ContactPage() {
  const booking = useBooking();
  const navigate = useNavigate();
  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!booking.checkIn || !booking.checkOut) navigate('/');
  }, []);

  const countryList = useMemo(() => {
    const locale = getLocale();
    const names = countries.getNames(locale, { select: 'official' });
    return Object.entries(names)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [getLocale()]);

  useEffect(() => {
    if (!phoneInputRef.current || !window.intlTelInput) return;

    const iti = window.intlTelInput(phoneInputRef.current, {
      initialCountry: 'ca',
      separateDialCode: true,
      nationalMode: true,
      formatOnDisplay: true,
      autoPlaceholder: 'aggressive',
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js',
    });
    itiRef.current = iti;

    const handleInput = () => {
      const value = phoneInputRef.current.value;
      if (window.intlTelInputUtils) {
        const countryData = iti.getSelectedCountryData();
        const formatted = window.intlTelInputUtils.formatNumberAsYouType(
          value,
          countryData.iso2
        );
        if (formatted !== value) {
          phoneInputRef.current.value = formatted;
        }
      }
      booking.setContactPhone(iti.getNumber());
    };

    const handleCountryChange = () => {
      const fullNumber = iti.getNumber();
      iti.setNumber(fullNumber);
      booking.setContactPhone(iti.getNumber());
    };

    phoneInputRef.current.addEventListener('input', handleInput);
    phoneInputRef.current.addEventListener('countrychange', handleCountryChange);

    return () => {
      phoneInputRef.current?.removeEventListener('input', handleInput);
      phoneInputRef.current?.removeEventListener('countrychange', handleCountryChange);
      iti.destroy();
    };
  }, []);

  const canContinue =
    booking.contactEmail.trim() &&
    booking.contactFirstName.trim() &&
    booking.contactLastName.trim();

  async function proceed() {
    if (!canContinue || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fullPhone = itiRef.current ? itiRef.current.getNumber() : booking.contactPhone;
      const totalCAD = booking.grandTotal();
      const convertedTotal = booking.convertFromCAD(totalCAD);
      const res = await fetch('https://api.lamaisonblanche.ca/v1/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(convertedTotal * 100),
          currency: booking.currency.toLowerCase(),
          metadata: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: String(booking.guests),
            email: booking.contactEmail,
            firstName: booking.contactFirstName,
            lastName: booking.contactLastName,
            phone: fullPhone,
          },
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        booking.setStripeClientSecret(data.clientSecret);
        booking.setStripePaymentIntentId(data.paymentIntentId);
        navigate('/payment');
      } else {
        console.error('No clientSecret returned', data);
      }
    } catch (e) {
      console.error('Payment intent error:', e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="section-title">{t('contactDetails')}</h1>

      <div className="form-field">
        <input type="email" className="form-input" placeholder={t('email')}
          value={booking.contactEmail}
          onChange={(e) => booking.setContactEmail(e.target.value)} />
      </div>

      <div className="form-row form-field">
        <input type="text" className="form-input" placeholder={t('firstName')}
          value={booking.contactFirstName}
          onChange={(e) => booking.setContactFirstName(e.target.value)} />
        <input type="text" className="form-input" placeholder={t('lastName')}
          value={booking.contactLastName}
          onChange={(e) => booking.setContactLastName(e.target.value)} />
      </div>

      <div className="form-row form-field">
        <select className="form-input"
          value={booking.contactCountry}
          onChange={(e) => booking.setContactCountry(e.target.value)}
        >
          {countryList.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        <div className="iti-wrapper">
          <input ref={phoneInputRef} type="tel" className="form-input iti-input" />
        </div>
      </div>

      <div className="form-field">
        <textarea className="form-textarea" placeholder={t('commentsPlaceholder')}
          value={booking.contactComments}
          onChange={(e) => booking.setContactComments(e.target.value)} />

        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', lineHeight: '1.4' }}>
          {t('sms_opt_in')}
        </p>
      </div>
      <Footer
        rightSlot={
          <>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              {t('back')}
            </button>
            <button type="button" className="btn-primary"
              disabled={!canContinue || isSubmitting} onClick={proceed}>
              {isSubmitting ? <span className="spinner-sm" /> : t('continue')}
            </button>
          </>
        }
      />
    </>
  );
}
