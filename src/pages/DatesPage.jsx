import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBooking, MAX_GUESTS, MAX_NIGHTS } from '../services/BookingContext';
import Calendar from '../components/Calendar';
import Footer from '../components/Footer';
import { t, formatDateShort } from '../i18n';

function isValidIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
}

function rangeContainsBookedDate(startISO, endISO, bookedDates) {
  const cur = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  while (cur < end) {
    const k = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    if (bookedDates.includes(k)) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

export default function DatesPage() {
  const booking = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeField, setActiveField] = useState(null);
  const [prefillError, setPrefillError] = useState(null);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const checkInDisplay = booking.checkIn ? formatDateShort(booking.checkIn) : '--';
  const checkOutDisplay = booking.checkOut ? formatDateShort(booking.checkOut) : '--';
  const canContinue = !!(booking.checkIn && booking.checkOut);
 
  useEffect(() => {
    if (hasPrefilled || booking.isLoadingCalendar) return;

    const arrival = searchParams.get('arrivalDate');
    const departure = searchParams.get('departureDate');
    const adults = parseInt(searchParams.get('adults') || '0', 10);
    const kids = parseInt(searchParams.get('kids') || '0', 10);
    const totalGuests = adults + kids;

    let didSetSomething = false;

    if (totalGuests > 0) {
      if (totalGuests > MAX_GUESTS) {
        setPrefillError(t('maxGuestsMsg'));
        booking.setGuests(MAX_GUESTS);
      } else {
        booking.setGuests(totalGuests);
      }
      didSetSomething = true;
    }

    if (arrival || departure) {
      if (!isValidIsoDate(arrival) || !isValidIsoDate(departure)) {
        setPrefillError(t('prefillBadDates'));
      } else if (arrival >= departure) {
        setPrefillError(t('prefillBadOrder'));
      } else {
        const today = new Date().toISOString().slice(0, 10);
        if (arrival < today) {
          setPrefillError(t('prefillPastDate'));
        } else {
          const ms = (new Date(departure) - new Date(arrival)) / 86400000;
          if (ms > MAX_NIGHTS) {
            setPrefillError(t('maxStayMsg'));
          } else if (rangeContainsBookedDate(arrival, departure, booking.bookedDates)) {
            setPrefillError(t('prefillUnavailable'));
          } else {
            booking.setCheckIn(arrival);
            booking.setCheckOut(departure);
            didSetSomething = true;
          }
        }
      }
    }

    setHasPrefilled(true);
  }, [booking.isLoadingCalendar]);

  useEffect(() => {
    if (booking.nightCount() > MAX_NIGHTS) booking.setCheckOut(null);
  }, [booking.checkIn, booking.checkOut]);

  return (
    <>
      <h1 className="section-title">{t('dates')}</h1>

      {prefillError && (
        <div className="prefill-error" role="alert">
          {prefillError}
        </div>
      )}

      <div className="dates-inputs">
        <div
          className={`date-field${activeField === 'checkIn' ? ' active' : ''}`}
          role="button" tabIndex={0}
          onClick={() => setActiveField('checkIn')}
        >
          <label>{t('checkIn')}</label>
          <div className={`val${checkInDisplay === '--' ? ' ph' : ''}`}>{checkInDisplay}</div>
        </div>

        <div
          className={`date-field${activeField === 'checkOut' ? ' active' : ''}`}
          role="button" tabIndex={0}
          onClick={() => setActiveField(booking.checkIn ? 'checkOut' : 'checkIn')}
        >
          <label>{t('checkOut')}</label>
          <div className={`val${checkOutDisplay === '--' ? ' ph' : ''}`}>{checkOutDisplay}</div>
          {booking.checkOut && (
            <button type="button" className="clear-btn"
              onClick={(e) => { e.stopPropagation(); booking.setCheckIn(null); booking.setCheckOut(null); setActiveField('checkIn'); }}
            >✕</button>
          )}
        </div>

        <div className="guests-field">
          <button type="button" className="guests-btn"
            disabled={booking.guests <= 1}
            onClick={() => booking.setGuests((g) => Math.max(1, g - 1))}
          >−</button>
          <span className="guests-count">
            {booking.guests}&nbsp;{booking.guests === 1 ? t('guest') : t('guests')}
          </span>
          <button type="button" className="guests-btn"
            disabled={booking.guests >= MAX_GUESTS}
            title={booking.guests >= MAX_GUESTS ? t('maxGuestsMsg') : undefined}
            onClick={() => booking.setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
          >+</button>
        </div>
      </div>

      {booking.guests >= MAX_GUESTS && (
        <p className="hint-text">{t('maxGuestsMsg')}</p>
      )}

      {booking.isLoadingCalendar ? (
        <div className="loading-wrap"><div className="spinner" /><span>{t('loading')}</span></div>
      ) : activeField ? (
        <Calendar onClose={() => setActiveField(null)} />
      ) : null}

      <Footer
        rightSlot={
          <button type="button" className="btn-primary" disabled={!canContinue} onClick={() => navigate('/contact')}>
            {t('continue')}
          </button>
        }
      />
    </>
  );
}
