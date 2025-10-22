import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0084FF',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Shopping Cart',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
