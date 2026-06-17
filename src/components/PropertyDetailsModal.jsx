import React, { useState, useEffect } from 'react';
import { t } from '../i18n';

const PHOTOS = [
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/house-picture.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/living-room.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/kitchen.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/main-room.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/room-1.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/room-2.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/room-3.jpeg',
  'https://d2bx08r96gstzo.cloudfront.net/booking-engine/photos/balcony.jpeg',
];

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const LAT = 46.871689;
const LNG = -71.092786;
const MAPBOX_URL =
  `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
  `pin-l+1a1a1a(${LNG},${LAT})/${LNG},${LAT},14,0/600x300@2x` +
  `?access_token=${MAPBOX_TOKEN}`;

const Icon = {
  Sqft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h6M9 3v6M21 15h-6M15 21v-6" />
    </svg>
  ),
  Guests: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Bedroom: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13" />
      <path d="M3 14h18" />
      <path d="M7 14v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      <path d="M3 18h18" />
    </svg>
  ),
  Bed: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9v10" />
      <path d="M22 19V11a2 2 0 0 0-2-2h-9v10" />
      <path d="M2 14h20" />
      <circle cx="6.5" cy="12.5" r="1.5" />
    </svg>
  ),
  Bath: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3z" />
      <path d="M6 19v2M18 19v2" />
    </svg>
  ),
  Parking: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  ),
};

const FEATURES = [
  { icon: Icon.Sqft, value: '1500', suffix: 'sqft' },
  { icon: Icon.Guests, value: '8', suffix: 'guestsCount' },
  { icon: Icon.Bedroom, value: '4', suffix: 'bedrooms' },
  { icon: Icon.Bed, value: '5', suffix: 'beds' },
  { icon: Icon.Bath, value: '2', suffix: 'bathrooms' },
  { icon: Icon.Parking, value: null, suffix: 'parking' },
];

export default function PropertyDetailsModal({ open, onClose }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev2();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function prev2() { setIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); }
  function next() { setIndex((i) => (i + 1) % PHOTOS.length); }

  if (!open) return null;

  return (
    <div
      className="pd-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pd-modal">
        <button type="button" className="pd-close" onClick={onClose} aria-label={t('close')}>✕</button>

        <h1 className="pd-title">{t('discoverTitle')}</h1>

        <div className="pd-carousel">
          <img src={PHOTOS[index]} alt={`La Maison Blanche ${index + 1}`} />
          <button type="button" className="pd-arrow pd-arrow-left" onClick={prev2} aria-label={t('previousImage')}>‹</button>
          <button type="button" className="pd-arrow pd-arrow-right" onClick={next} aria-label={t('nextImage')}>›</button>
          <div className="pd-counter">{index + 1} / {PHOTOS.length}</div>
        </div>

        <section className="pd-section">
          <h2>{t('description')}</h2>
          <p>{t('houseDescription')}</p>
        </section>

        <section className="pd-section">
          <h2>{t('mainFeatures')}</h2>
          <ul className="pd-features">
            {FEATURES.map((f, i) => {
              const IconCmp = f.icon;
              return (
                <li key={i} className="pd-feature">
                  <span className="pd-feature-icon"><IconCmp /></span>
                  <span className="pd-feature-text">
                    {f.value && <span className="pd-feature-num">{f.value}</span>}
                    {f.value && ' '}
                    {t(f.suffix)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pd-section">
          <h2>{t('location')}</h2>
          <img src={MAPBOX_URL} alt="Map of La Maison Blanche" className="pd-map" />
        </section>

        <section className="pd-section">
          <h2>{t('video')}</h2>
          <media-player title="Découvrez La Maison Blanche" src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/video/1080p.mp4" playsinline>
            <media-provider>
              <media-poster class="vds-poster" src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/video/thumbnail.png"></media-poster>
              <track src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/video/english_subtitles.vtt" kind="subtitles" label="English" srclang="en-US" default />
              <track src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/video/french_subtitles.vtt" kind="subtitles" label="French" srclang="fr-FR" />
              <track src="https://d2bx08r96gstzo.cloudfront.net/booking-engine/video/spanish_subtitles.vtt" kind="subtitles" label="Spanish" srclang="es-ES" />
            </media-provider>
            <media-video-layout></media-video-layout>
          </media-player>
          <br></br>
        </section>
      </div>
    </div>
  );
}
