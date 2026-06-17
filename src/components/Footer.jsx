import React from 'react';
import { t } from '../i18n';

const CARD_ICONS = [
  { name: 'Visa',       src: 'https://d2bx08r96gstzo.cloudfront.net/booking-engine/visa-brand-icon.svg' },
  { name: 'Mastercard', src: 'https://d2bx08r96gstzo.cloudfront.net/booking-engine/mastercard-brand-icon.svg' },
  { name: 'Amex',       src: 'https://d2bx08r96gstzo.cloudfront.net/booking-engine/amex-brand-icon.svg' },
];

export default function Footer({ leftSlot, rightSlot }) {
   return ( 
    <div className="booking-footer">
      <div className="footer-left">
        <div className="footer-links">
          <a href="https://www.lamaisonblanche.ca/privacy" target="_blank" rel="noopener noreferrer">{t('privacy')}</a>
          <span className="footer-dot">·</span>
          <a href="https://www.lamaisonblanche.ca/terms" target="_blank" rel="noopener noreferrer">{t('terms')}</a>
          <span className="footer-dot">·</span>
          <a href="https://www.lamaisonblanche.ca/contact" target="_blank" rel="noopener noreferrer">Support</a>
        </div>
        <div className="footer-cards">
          {CARD_ICONS.map((c) => (
            <img key={c.name} src={c.src} alt={c.name} width="36" height="36" className="footer-card-icon" />
          ))}
        </div>
        {leftSlot}
      </div>
      <div className="footer-actions">{rightSlot}</div>
    </div>
  );
}
