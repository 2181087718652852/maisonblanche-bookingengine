import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK, {
  betas: ['elements_tax_id_1'],
});
