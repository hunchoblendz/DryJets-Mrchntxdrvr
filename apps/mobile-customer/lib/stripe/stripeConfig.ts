import Constants from 'expo-constants';

/**
 * Stripe Configuration
 *
 * Setup Instructions:
 * 1. Sign up for a Stripe account at https://stripe.com
 * 2. Get your publishable key from the Stripe Dashboard
 * 3. Add to .env file: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
 * 4. For production, use your live publishable key (pk_live_xxxxx)
 * 5. For full Stripe features, create a development build (not available in Expo Go)
 *
 * Stripe Dashboard: https://dashboard.stripe.com/apikeys
 */

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Check if running in Expo Go
 * Stripe native modules are NOT available in Expo Go
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * Check if Stripe SDK is available (development build only)
 * Always returns false since @stripe/stripe-react-native is not installed for Expo Go
 * When you need Stripe, reinstall the package and create a development build
 */
export const isStripeAvailable = (): boolean => {
  // Package is not installed to avoid Expo Go compatibility issues
  return false;
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
  return STRIPE_PUBLISHABLE_KEY.length > 0 && isStripeAvailable();
};

/**
 * Get configuration error message if Stripe is not configured
 */
export const getStripeConfigError = (): string | null => {
  if (isExpoGo()) {
    return `Stripe Payment requires a Development Build

Expo Go does not support native payment modules.

To use Stripe payments:
1. Create a development build:
   npx expo prebuild
   npx expo run:ios  (or npx expo run:android)

2. Add your Stripe key to .env:
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

3. Run the development build on your device

For now, you can test all other features in Expo Go!`;
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return `Stripe is not configured. To enable payments:

1. Sign up at https://stripe.com
2. Get your publishable key from the Dashboard
3. Add to .env: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
4. Restart the development server

For testing, use Stripe test mode keys (pk_test_xxxxx).`;
  }

  return null;
};

/**
 * Stripe Provider Props (only use in development builds)
 */
export const stripeProviderProps = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: 'merchant.com.dryjets', // For Apple Pay
};

/**
 * Test card numbers for Stripe test mode
 * See: https://stripe.com/docs/testing#cards
 */
export const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  insufficient_funds: '4000 0000 0000 9995',
  expired_card: '4000 0000 0000 0069',
  processing_error: '4000 0000 0000 0119',
  incorrect_cvc: '4000 0000 0000 0127',
};

/**
 * Payment method types supported
 */
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
