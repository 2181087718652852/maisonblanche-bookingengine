const TRANSLATIONS = {
  en: {
    video: 'Watch this short video to learn more',
    dates: 'Dates',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guest: 'guest',
    guests: 'guests',
    continue: 'Continue',
    back: 'Back',
    reservationSummary: 'Reservation summary',
    moreDetails: 'More details',
    rental: 'Rental',
    fees: 'Fees',
    cleaning: 'Cleaning',
    taxes: 'GST/QST',
    lodgingTax: 'Lodging tax',
    total: 'Total',
    taxesIncluded: 'Taxes included',
    contactDetails: 'Your contact details',
    email: 'Email',
    firstName: 'First name',
    lastName: 'Last name',
    doubleSpace: '  ',
    country: 'Country',
    phoneNumber: 'Phone number',
    comments: 'Comments (optional)',
    commentsPlaceholder:
      'Write any additional questions or let us know about anything else you may need here.',
    paymentDetails: 'Payment details',
    card: 'Card',
    cardConsent:
      'By providing your card information, you allow La Maison Blanche to charge your card for future payments in accordance with their terms.',
    address: 'Address',
    cancellationPolicy: 'Cancellation policy',
    cancellationPolicyText:
      '100% of prepaid amounts are refundable if cancelled 14 days or more before arrival. ' +
      '50% of prepaid amounts are refundable if cancelled 7 days or more before arrival. ' +
      'No refund if cancelled later.',
    securityDeposit: 'Security deposit policy',
    securityDepositText: 'A refundable security deposit of CA$500 is due one week before your arrival.',
    pay: 'Pay now',
    edit: 'Edit',
    loading: 'Loading availability…',
    night: 'night',
    nights: 'nights',
    sms_opt_in: 'By providing your phone number and clicking "Continue", you agree to receive WhatsApp messages regarding your booking status. You may opt out at any time.',
    reviews: 'reviews',
    privacy: 'Privacy',
    terms: 'Terms',
    maxStayMsg: 'The maximum amount of bookable dates is 30 days.',
    maxGuestsMsg: 'Maximum 8 guests.',
    bookingConfirmed: 'Your booking is confirmed!',
    bookingConfirmedSub:
      "Thank you. We've sent a confirmation email with all the details.",
    bookingId: 'Booking ID',
    guestInfo: 'Guest information',
    name: 'Name',
    arrival: 'Arrival',
    departure: 'Departure',
    numberOfGuests: 'Number of guests',
    backHome: 'Back to home',
    processing: 'Processing your payment…',
    paymentFailed: 'Payment was not completed',
    paymentFailedSub: 'Please try again or use a different payment method.',
    discoverTitle: 'Discover La Maison Blanche',
    description: 'Description',
    mainFeatures: 'Main features',
    sqft: 'sq ft',
    guestsCount: 'guests',
    bedrooms: 'bedrooms',
    beds: 'beds',
    bathrooms: 'bathrooms',
    parking: 'Parking',
    location: 'Location',
    close: 'Close',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    manageTitle: 'Manage your booking',
    manageSubtitle: "Review your booking, change your dates, or cancel.",
    manageLoading: 'Loading your booking…',
    manageNotFound: 'Booking not found',
    manageError: 'Something went wrong. Please try again.',
    manageNoBookingId: 'No booking ID provided.',
    manageChangeDates: 'Change dates',
    manageCancel: 'Cancel booking',
    manageCancelConfirmTitle: 'Cancel your booking?',
    manageCancelConfirmMsg: 'Based on our cancellation policy, the refund amount below is what you will receive.',
    manageRefundEstimate: 'Estimated refund',
    manageRefundPolicyNote: '100% if cancelled 14+ days before arrival · 50% if 7+ days · 0% otherwise.',
    manageConfirmCancel: 'Confirm cancellation',
    manageCanceledTitle: 'Booking canceled',
    manageCanceledMsg: 'This booking has been canceled. We will process your refund shortly.',
    manageCancelDoneMsg: 'Your booking has been canceled. We have notified our team and will process your refund shortly.',
    manageChangeDatesTitle: 'Change your dates',
    manageChangeDatesMsg: "Pick the new dates you'd like. We will review your request and confirm by email.",
    manageSendRequest: 'Send request',
    manageDateChangeSentTitle: 'Request sent',
    manageDateChangeSentMsg: "Thanks. We've received your request and will get back to you by email shortly.",
    manageBadDates: 'Departure must be after arrival.',
    houseDescription:
      'A beautiful house offering a spacious and inviting setting in the heart of nature, ' +
      'close to Old Quebec and several renowned ski resorts. 4 bedrooms for 6 adults, 2 children and 1 baby.',
    verifyingHuman: 'Verifying that you are human …',
    prefillBadDates: 'The dates in the link are invalid.',
    prefillBadOrder: 'The departure date must be after the arrival date.',
    prefillPastDate: 'The arrival date is in the past.',
    prefillUnavailable: 'Sorry, those dates are not available. Please pick others.',
    purchasingAsBusiness: "I'm purchasing as a business",
    language: 'Language',
    currency: 'Currency'
  },

  fr: {
    video: 'Regarder cette courte vidéo pour en savoir plus',
    doubleSpace: '  ',
    language: 'Langue',
    currency: 'Devise',
    dates: 'Dates',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guest: 'voyageur',
    guests: 'voyageurs',
    continue: 'Continuer',
    back: 'Retour',
    reservationSummary: 'Résumé de la réservation',
    moreDetails: 'Plus de détails',
    rental: 'Location',
    fees: 'Frais',
    cleaning: 'Ménage',
    taxes: 'TVQ/TPS',
    lodgingTax: "Taxes d'hébergement",
    total: 'Total',
    taxesIncluded: 'Taxes incluses',
    contactDetails: 'Vos coordonnées',
    email: 'Courriel',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    country: 'Pays',
    phoneNumber: 'Numéro de téléphone',
    comments: 'Commentaires (facultatif)',
    sms_opt_in: 'En fournissant votre numéro de téléphone et en cliquant sur « Continuer », vous acceptez de recevoir des messages WhatsApp concernant l\'état de votre réservation. Vous pouvez vous désabonner à tout moment.',
    commentsPlaceholder:
      'Posez vos questions ou faites-nous part de vos besoins supplémentaires ici.',
    paymentDetails: 'Informations de paiement',
    card: 'Carte',
    cardConsent:
      "En fournissant vos informations de carte, vous autorisez La Maison Blanche à débiter votre carte pour les paiements futurs conformément à leurs conditions.",
    address: 'Adresse',
    cancellationPolicy: "Politique d'annulation",
    cancellationPolicyText:
      "100% des règlements pré-payés sont remboursables en cas d'annulation 14 jour(s) avant l'arrivée ou plus tôt. " +
      "50% des règlements pré-payés sont remboursables en cas d'annulation 7 jour(s) avant l'arrivée ou plus tôt. " +
      "0% remboursable si annulation après.",
    securityDeposit: 'Politique de dépôt de garantie',
    securityDepositText: 'Un dépôt de garantie remboursable de 500$CA est requis une semaine avant votre arrivée.',
    pay: 'Payer maintenant',
    edit: 'Modifier',
    loading: 'Chargement des disponibilités…',
    night: 'nuit',
    nights: 'nuits',
    reviews: 'avis',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    maxStayMsg: 'La durée maximale de réservation est de 30 jours.',
    maxGuestsMsg: 'Maximum 8 voyageurs.',
    bookingConfirmed: 'Votre réservation est confirmée!',
    bookingConfirmedSub:
      "Merci. Nous vous avons envoyé un courriel de confirmation avec tous les détails.",
    bookingId: 'Numéro de réservation',
    guestInfo: 'Informations du voyageur',
    name: 'Nom',
    arrival: 'Arrivée',
    departure: 'Départ',
    numberOfGuests: 'Nombre de voyageurs',
    backHome: "Retour à l'accueil",
    processing: 'Traitement de votre paiement…',
    paymentFailed: "Le paiement n'a pas été complété",
    paymentFailedSub: 'Veuillez réessayer ou utiliser un autre mode de paiement.',
    discoverTitle: 'Découvrez La Maison Blanche',
    description: 'Description',
    mainFeatures: 'Caractéristiques principales',
    sqft: 'pi²',
    guestsCount: 'invités',
    bedrooms: 'chambres',
    beds: 'lits',
    bathrooms: 'salles de bain',
    parking: 'Stationnement',
    location: 'Emplacement',
    close: 'Fermer',
    previousImage: 'Image précédente',
    nextImage: 'Image suivante',
    houseDescription:
      "Une magnifique maison offrant un environnement spacieux et invitant au cœur de la nature, " +
      "à proximité du Vieux-Québec et de plusieurs stations de ski réputées. " +
      "4 chambres pour 6 adultes, 2 enfants et 1 bébé.",
    manageTitle: 'Gérer votre réservation',
    manageSubtitle: 'Consultez votre réservation, modifiez vos dates ou annulez.',
    manageLoading: 'Chargement de votre réservation…',
    manageNotFound: 'Réservation introuvable',
    manageError: "Une erreur est survenue. Veuillez réessayer.",
    manageNoBookingId: 'Aucun numéro de réservation fourni.',
    manageChangeDates: 'Modifier les dates',
    manageCancel: 'Annuler la réservation',
    manageCancelConfirmTitle: 'Annuler votre réservation ?',
    manageCancelConfirmMsg: "Selon notre politique d'annulation, voici le montant que vous serez remboursé.",
    manageRefundEstimate: 'Remboursement estimé',
    manageRefundPolicyNote: "100% si annulation 14 jours avant l'arrivée · 50% si 7 jours · 0% après.",
    manageConfirmCancel: "Confirmer l'annulation",
    manageCanceledTitle: 'Réservation annulée',
    manageCanceledMsg: 'Cette réservation a été annulée. Nous traiterons votre remboursement sous peu.',
    manageCancelDoneMsg: 'Votre réservation a été annulée. Notre équipe a été notifiée et traitera votre remboursement sous peu.',
    manageChangeDatesTitle: 'Modifier vos dates',
    manageChangeDatesMsg: 'Choisissez les nouvelles dates souhaitées. Nous reviendrons vers vous par courriel pour confirmer.',
    manageSendRequest: 'Envoyer la demande',
    manageDateChangeSentTitle: 'Demande envoyée',
    manageDateChangeSentMsg: 'Merci. Nous avons reçu votre demande et reviendrons vers vous par courriel sous peu.',
    manageBadDates: "La date de départ doit être après l'arrivée.",
    verifyingHuman: 'Vérification que vous êtes humain…',
    prefillBadDates: 'Les dates fournies dans le lien sont invalides.',
    prefillBadOrder: 'La date de départ doit être après la date d\'arrivée.',
    prefillPastDate: 'La date d\'arrivée est dans le passé.',
    prefillUnavailable: 'Désolé, ces dates ne sont pas disponibles. Veuillez en choisir d\'autres.',
    purchasingAsBusiness: "J'achète en tant qu'entreprise",
  },
};
function detectInitial() {
  try {
    const saved = window.localStorage.getItem('locale');
    if (saved === 'en' || saved === 'fr') return saved;
  } catch { }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

let currentLocale = detectInitial();
const localeListeners = new Set();

export function getLocale() { return currentLocale; }

export function setLocale(newLocale) {
  if (newLocale !== 'en' && newLocale !== 'fr') return;
  if (newLocale === currentLocale) return;
  currentLocale = newLocale;
  try { localStorage.setItem('locale', newLocale); } catch { }
  localeListeners.forEach((fn) => fn());
}

export function subscribeLocale(fn) {
  localeListeners.add(fn);
  return () => localeListeners.delete(fn);
}

export function t(key) {
  return TRANSLATIONS[currentLocale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function formatCurrency(amount, currency = 'CAD') {
  return new Intl.NumberFormat(currentLocale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(amount);
}

export function formatDateShort(iso) {
  if (!iso) return '--';
  const [y, m, d] = iso.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

export function formatDateMedium(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(currentLocale === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(currentLocale === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
