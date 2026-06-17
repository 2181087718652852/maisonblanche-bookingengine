import React from 'react';
import { Outlet } from 'react-router-dom';
import ReservationSummary from './ReservationSummary';

export default function BookingLayout() {
  return (
    <div className="booking-main">
      <div className="booking-content">
        <Outlet />
      </div>
      <div className="booking-sidebar">
        <ReservationSummary />
      </div>
    </div>
  );
}
