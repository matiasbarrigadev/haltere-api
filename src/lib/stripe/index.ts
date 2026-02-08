import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = {
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
};

// Membership pricing (in CLP cents)
export const MEMBERSHIP_PRICE = 240000000; // $2,400,000 CLP

// Bonus package prices (in CLP cents)
export const BONUS_PACKAGES = {
  starter: { bonos: 5, price: 15000000, name: 'Starter Pack' },    // $150,000
  regular: { bonos: 10, price: 28000000, name: 'Regular Pack' },   // $280,000
  premium: { bonos: 20, price: 50000000, name: 'Premium Pack' },   // $500,000
  elite: { bonos: 50, price: 100000000, name: 'Elite Pack' },      // $1,000,000
};

export type PackageType = keyof typeof BONUS_PACKAGES;