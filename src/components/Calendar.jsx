import React, { useState } from 'react';
import { useBooking, getDailyPrice, MAX_NIGHTS } from '../services/BookingContext';
import { t } from '../i18n';

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const locale = (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
const WEEKDAYS = locale === 'fr' ? WEEKDAYS_FR : WEEKDAYS_EN;
const MONTHS = locale === 'fr' ? MONTHS_FR : MONTHS_EN;

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayKey() { return isoDate(new Date()); }

function addDays(isoStr, n) {
  const d = new Date(isoStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function buildDays(year, month, bookedDates, checkIn, checkOut, hoverKey) {
  const today = todayKey();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const maxCheckout = checkIn && !checkOut ? addDays(checkIn, MAX_NIGHTS) : null;

  let firstBookedAfter = null;
  if (checkIn && !checkOut) {
    for (const bd of bookedDates) {
      if (bd > checkIn) { firstBookedAfter = bd; break; }
    }
  }

  const days = [];
  for (let i = 0; i < firstWeekday; i++) days.push({ empty: true, key: `e-${i}` });

  for (let n = 1; n <= daysInMonth; n++) {
    const d = new Date(year, month, n);
    const key = isoDate(d);
    const isPast = key < today;
    const isBooked = bookedDates.includes(key);
    const price = getDailyPrice(key);

    const beyondMaxStay = maxCheckout && key > maxCheckout;
    const crossesBooked = firstBookedAfter && key >= firstBookedAfter;

    let effectiveEnd = checkOut || hoverKey;
    let rangeStart = checkIn;
    let rangeEnd = effectiveEnd;
    if (rangeStart && rangeEnd && rangeEnd < rangeStart) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    days.push({
      key,
      number: n,
      price: `$${price}`,
      isToday: key === today,
      isPast,
      isBooked,
      beyondMaxStay,
      crossesBooked,
      isSelStart: key === checkIn,
      isSelEnd: !!checkOut && key === checkOut,
      isInRange: !!(rangeStart && rangeEnd && key > rangeStart && key < rangeEnd),
      disabled: isPast || isBooked || beyondMaxStay || crossesBooked,
    });
  }
  return days;
}

function dayClass(day) {
  if (day.empty) return 'cal-day empty';
  let c = 'cal-day';
  if (day.isToday && !day.isSelStart && !day.isSelEnd) c += ' today';
  if (day.isBooked) c += ' booked';
  else if (day.disabled) c += ' disabled';
  if (day.isSelStart) c += ' sel-start';
  if (day.isSelEnd) c += ' sel-end';
  if (day.isInRange && !day.isSelStart && !day.isSelEnd) c += ' in-range';
  return c;
}

export default function Calendar({ onClose }) {
  const booking = useBooking();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoverKey, setHoverKey] = useState(null);

  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const canGoPrev = !(viewYear === now.getFullYear() && viewMonth === now.getMonth());

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(day) {
    if (day.empty || day.disabled) return;
    const { key } = day;

    if (!booking.checkIn || (booking.checkIn && booking.checkOut)) {
      booking.setCheckIn(key);
      booking.setCheckOut(null);
      setHoverKey(null);
      return;
    }
    if (key <= booking.checkIn) {
      booking.setCheckIn(key);
      booking.setCheckOut(null);
      return;
    }
    booking.setCheckOut(key);
    setHoverKey(null);
    onClose?.();
  }

  function handleMouseEnter(day) {
    if (day.empty || day.disabled) return;
    if (booking.checkIn && !booking.checkOut) setHoverKey(day.key);
  }

  const leftDays = buildDays(viewYear, viewMonth, booking.bookedDates, booking.checkIn, booking.checkOut, hoverKey);
  const rightDays = buildDays(rightYear, rightMonth, booking.bookedDates, booking.checkIn, booking.checkOut, hoverKey);

  const showStayLimit = booking.checkIn && !booking.checkOut;

  function MonthGrid({ days }) {
    return (
      <div>
        <div className="cal-weekdays">
          {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
        </div>
        <div className="cal-days">
          {days.map(day => (
            <button
              key={day.key}
              type="button"
              className={dayClass(day)}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              disabled={!day.empty && day.disabled}
              title={day.beyondMaxStay ? t('maxStayMsg') : undefined}
            >
              {!day.empty && (
                <>
                  <span className="dn">{day.number}</span>
                  {day.price && <span className="dp">{day.price}</span>}
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-wrap" onMouseLeave={() => setHoverKey(null)}>
      <div className="calendar-nav">
        <button type="button" className="cal-nav-btn" onClick={prevMonth} disabled={!canGoPrev}>←</button>
        <div className="cal-month-title">{MONTHS[viewMonth]} {viewYear}</div>
        <div className="cal-month-title">{MONTHS[rightMonth]} {rightYear}</div>
        <button type="button" className="cal-nav-btn" onClick={nextMonth}>→</button>
      </div>
      {showStayLimit && (
        <div className="calendar-notice">{t('maxStayMsg')}</div>
      )}
      <div className="calendar-months-grid">
        <MonthGrid days={leftDays} />
        <MonthGrid days={rightDays} />
      </div>
    </div>
  );
}
