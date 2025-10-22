import { Stack } from 'expo-router';

export default function AddressesLayout() {
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
          title: 'My Addresses',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Address',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: 'Edit Address',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
