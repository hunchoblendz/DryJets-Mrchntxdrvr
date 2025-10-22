import { useState } from 'react';
import { Alert } from 'react-native';
import { isStripeConfigured, getStripeConfigError, isStripeAvailable } from './stripeConfig';

interface UsePaymentSheetParams {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
}

// Stripe SDK is not installed for Expo Go compatibility
// When you need Stripe, reinstall @stripe/stripe-react-native and create a development build
const useStripe: any = null;

export function usePaymentSheet({ onSuccess, onError }: UsePaymentSheetParams = {}) {
  const [loading, setLoading] = useState(false);

  // Get Stripe hooks only if available
  let stripeHooks = null;
  if (useStripe) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      stripeHooks = useStripe();
    } catch (error) {
      console.warn('Stripe hooks not available:', error);
    }
  }

  /**
   * Initialize the payment sheet with payment intent from backend
   */
  const initializePaymentSheet = async (
    paymentIntentClientSecret: string,
    ephemeralKey: string,
    customerId: string,
    merchantDisplayName: string = 'DryJets',
  ) => {
    if (!isStripeConfigured()) {
      const errorMessage = getStripeConfigError();
      Alert.alert('Payment Not Available', errorMessage || 'Stripe is not configured');
      return { error: new Error('Stripe not configured') };
    }

    if (!stripeHooks) {
      Alert.alert('Payment Not Available', 'Stripe SDK is not available in Expo Go');
      return { error: new Error('Stripe SDK not available') };
    }

    try {
      const { error } = await stripeHooks.initPaymentSheet({
        merchantDisplayName,
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: '',
        },
        returnURL: 'dryjets://payment-return', // For redirects after 3D Secure
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error initializing payment sheet:', error);
      return { error };
    }
  };

  /**
   * Present the payment sheet to the user
   */
  const openPaymentSheet = async () => {
    if (!isStripeConfigured()) {
      const errorMessage = getStripeConfigError();
      Alert.alert('Payment Not Available', errorMessage || 'Stripe is not configured');
      return { error: new Error('Stripe not configured') };
    }

    if (!stripeHooks) {
      Alert.alert('Payment Not Available', 'Stripe SDK is not available in Expo Go');
      return { error: new Error('Stripe SDK not available') };
    }

    setLoading(true);

    try {
      const { error } = await stripeHooks.presentPaymentSheet();

      if (error) {
        // User cancelled or error occurred
        if (error.code === 'Canceled') {
          console.log('Payment cancelled by user');
        } else {
          console.error('Payment error:', error);
          if (onError) {
            onError(new Error(error.message));
          } else {
            Alert.alert('Payment Error', error.message);
          }
        }
        return { error };
      }

      // Payment successful
      console.log('Payment successful');
      return { error: null };
    } catch (err) {
      const error = err as Error;
      console.error('Error presenting payment sheet:', error);
      if (onError) {
        onError(error);
      } else {
        Alert.alert('Payment Error', 'An unexpected error occurred');
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    initializePaymentSheet,
    openPaymentSheet,
    loading,
  };
}
