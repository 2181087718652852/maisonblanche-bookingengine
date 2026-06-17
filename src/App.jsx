import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './services/BookingContext';
import { subscribeLocale } from './i18n';
import BookingLayout from './components/BookingLayout';
import DatesPage from './pages/DatesPage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';

export default function App() {
  const [, force] = useState(0);
  useEffect(() => {
    return subscribeLocale(() => force((n) => n + 1));
  }, []);
  return (
    <BookingProvider>
      <Routes>
        <Route element={<BookingLayout />}>
          <Route path="/" element={<DatesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BookingProvider>
  );
}
