import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="fulfillment-mode" />
      <Stack.Screen name="address" />
      <Stack.Screen name="scheduling" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
