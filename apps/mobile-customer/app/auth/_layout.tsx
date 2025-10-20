import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="phone-login"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="phone-otp" />
    </Stack>
  );
}
