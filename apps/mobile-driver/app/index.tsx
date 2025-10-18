import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to home tab
  return <Redirect href="/(tabs)/home" />;
}
