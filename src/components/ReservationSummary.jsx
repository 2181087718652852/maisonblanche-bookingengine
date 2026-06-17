import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../services/BookingContext';
import { t, formatDateMedium, formatDateLong, getLocale, setLocale } from '../i18n';
import PropertyDetailsModal from './PropertyDetailsModal';

export default function ReservationSummary() {
  const booking = useBooking();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [feesOpen, setFeesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const hasSelection = !!(booking.checkIn && booking.checkOut);
  const isPaymentPage = pathname === '/payment';
  const nights = booking.nightCount();
  const rental = booking.rentalTotal();
  const fees = booking.feesTotal();
  const total = booking.grandTotal();

  const rentalLabel = hasSelection
    ? `${t('rental')} (${nights} ${nights === 1 ? t('night') : t('nights')})`
    : t('rental');

  const placeholder = booking.formatMoney(0);

  return (
    <>
      <div className="summary-card">
        <div className="summary-prefs">
          <div className="summary-pref">
            <label>{t('language')}</label>
            <select
              value={getLocale()}
              onChange={(e) => setLocale(e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div className="summary-pref">
            <label>{t('currency')}</label>
            <select
              value={booking.currency}
              onChange={(e) => booking.setCurrency(e.target.value)}
            >
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <h2>{t('reservationSummary')}</h2>
        <hr className="summary-divider" />

        <div className="summary-property">
          <img src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/house-picture.jpeg" alt="La Maison Blanche" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="summary-property-name">La Maison Blanche</div>
            <div className="summary-property-rating">
              <span>★</span>
              <span>4.9</span>
              <span style={{ color: '#717171' }}>&nbsp;(27 {t('reviews')})</span>
            </div>
          </div>
          <button
            type="button"
            className="summary-more-btn"
            onClick={() => setDetailsOpen(true)}
          >
            {t('moreDetails')}
          </button>
        </div>

        {hasSelection && (
          <>
            <hr className="summary-divider" />
            <div className="summary-dates-section">
              {isPaymentPage ? (
                <div className="summary-dates-row">
                  <div className="summary-dates-info">
                    <div className="label">{t('dates')}</div>
                    <div>{formatDateLong(booking.checkIn)} – {formatDateLong(booking.checkOut)}</div>
                    <p style={{ color: '#717171', fontSize: 13 }}>
                      {booking.guests} {booking.guests === 1 ? t('guest') : t('guests')}
                    </p>
                  </div>
                  <button type="button" className="summary-edit-btn" onClick={() => navigate('/')}>
                    {t('edit')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="label">{t('dates')}</div>
                  <div>{formatDateMedium(booking.checkIn)} – {formatDateMedium(booking.checkOut)}</div>
                  <p style={{ color: '#717171', fontSize: 13 }}>
                    {booking.guests} {booking.guests === 1 ? t('guest') : t('guests')}
                  </p>
                </>
              )}
            </div>
          </>
        )}

        {isPaymentPage && booking.contactEmail && (
          <>
            <hr className="summary-divider" />
            <div className="summary-dates-section">
              <div className="summary-dates-row">
                <div className="summary-dates-info">
                  <div className="label">{t('contactDetails')}</div>
                  <div>{booking.contactEmail}</div>
                </div>
                <button type="button" className="summary-edit-btn" onClick={() => navigate('/contact')}>
                  {t('edit')}
                </button>
              </div>
            </div>
          </>
        )}

        <hr className="summary-divider" />

        <div className="summary-row">
          <span>{rentalLabel}</span>
          <span>{hasSelection ? booking.formatMoney(rental) : placeholder}</span>
        </div>

        {hasSelection ? (
          <>
            <div className="summary-row">
              <span className="summary-row-label" role="button" onClick={() => setFeesOpen((v) => !v)}>
                {t('fees')} <span className={`chevron${feesOpen ? ' open' : ''}`}>▾</span>
              </span>
              <span>{booking.formatMoney(fees)}</span>
            </div>
            {feesOpen && (
              <>
                <div className="summary-sub-row">
                  <span>{t('cleaning')}</span>
                  <span>{booking.formatMoney(booking.CLEANING_FEE)}</span>
                </div>
                <div className="summary-sub-row">
                  <span>{t('taxes')}</span>
                  <span>{booking.formatMoney(booking.taxAmount())}</span>
                </div>
                <div className="summary-sub-row">
                  <span>{t('lodgingTax')}</span>
                  <span>{booking.formatMoney(booking.lodgingTaxAmount())}</span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="summary-row">
            <span>{t('fees')}</span>
            <span>{placeholder}</span>
          </div>
        )}

        <hr className="summary-divider" />

        <div className="summary-row total">
          <span>{t('total')} ({booking.currency})</span>
          <span>{hasSelection ? booking.formatMoney(total) : placeholder}</span>
        </div>
        <div className="summary-taxes-note">{t('taxesIncluded')}</div>
      </div>

      <PropertyDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  );
}
