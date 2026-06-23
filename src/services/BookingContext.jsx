import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../i18n';

const BookingContext = createContext(null);

const CLEANING_FEE = 250;
const TAX_RATE = 0.14975;
const LODGING_TAX_RATE = 0.035;

export const MAX_GUESTS = 8;
export const MAX_NIGHTS = 30;

const HIGH_SEASON = 425;
const LOW_SEASON = 275;

export function getDailyPrice(isoDate) {
  if (!isoDate) return LOW_SEASON;
  const [y, m, d] = isoDate.split('-').map(Number);
  const month = m;
  const day = d;
  if ((month === 6 && day >= 1) || month === 7 || month === 8 || month === 9 || (month === 10 && day === 1)) return HIGH_SEASON;
  if ((month === 12 && day >= 20) || (month === 1 && day <= 10)) return HIGH_SEASON;
  if ((month === 2 && day >= 25) || (month === 3 && day <= 10)) return HIGH_SEASON;
  return LOW_SEASON;
}

export function BookingProvider({ children }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);

  const [bookedDates, setBookedDates] = useState([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  const [contactEmail, setContactEmail] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactCountry, setContactCountry] = useState('CA');
  const [contactPhone, setContactPhone] = useState('');
  const [contactComments, setContactComments] = useState('');

  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState(null);

  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('currency');
      if (['CAD', 'USD', 'EUR', 'GBP'].includes(saved)) return saved;
    } catch { }
    return 'CAD';
  });

  const [exchangeRates, setExchangeRates] = useState({ CAD: 1, USD: 1, EUR: 1, GBP: 1 });
  const [ratesReady, setRatesReady] = useState(false);

  const setCurrency = useCallback((c) => {
    if (!['CAD', 'USD', 'EUR', 'GBP'].includes(c)) return;
    setCurrencyState(c);
    try { localStorage.setItem('currency', c); } catch { }
  }, []);

  useEffect(() => {
    fetch('/api/calendar')
      .then((r) => r.json())
      .then((data) => setBookedDates(data.bookedDates || []))
      .catch(() => setBookedDates([]))
      .finally(() => setIsLoadingCalendar(false));
  }, []);

  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/latest?base=CAD&symbols=USD,EUR,GBP')
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          setExchangeRates({ CAD: 1, ...data.rates });
        }
      })
      .catch(() => { })
      .finally(() => setRatesReady(true));
  }, []);

  function nightCount() {
    if (!checkIn || !checkOut) return 0;
    return Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  }

  function rentalTotal() {
    if (!checkIn || !checkOut) return 0;
    let total = 0;
    const cur = new Date(checkIn + 'T00:00:00');
    const end = new Date(checkOut + 'T00:00:00');
    while (cur < end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      total += getDailyPrice(key);
      cur.setDate(cur.getDate() + 1);
    }
    return total;
  }

  const taxAmount = () => (rentalTotal() + CLEANING_FEE) * TAX_RATE;
  const lodgingTaxAmount = () => rentalTotal() * LODGING_TAX_RATE;
  const feesTotal = () => CLEANING_FEE + taxAmount() + lodgingTaxAmount();
  const grandTotal = () => rentalTotal() + feesTotal();

  const convertFromCAD = (amountCAD) => {
    const rate = exchangeRates[currency] ?? 1;
    return amountCAD * rate;
  };

  const formatMoney = (amountCAD) => {
    return formatCurrency(convertFromCAD(amountCAD), currency);
  };

  return (
    <BookingContext.Provider
      value={{
        checkIn, setCheckIn,
        checkOut, setCheckOut,
        guests, setGuests,
        bookedDates,
        isLoadingCalendar,
        contactEmail, setContactEmail,
        contactFirstName, setContactFirstName,
        contactLastName, setContactLastName,
        contactCountry, setContactCountry,
        contactPhone, setContactPhone,
        contactComments, setContactComments,
        stripeClientSecret, setStripeClientSecret,
        stripePaymentIntentId, setStripePaymentIntentId,
        currency, setCurrency,
        exchangeRates, ratesReady,
        CLEANING_FEE,
        MAX_GUESTS,
        MAX_NIGHTS,
        getDailyPrice,
        nightCount,
        rentalTotal,
        taxAmount,
        lodgingTaxAmount,
        feesTotal,
        grandTotal,
        convertFromCAD,
        formatMoney,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
