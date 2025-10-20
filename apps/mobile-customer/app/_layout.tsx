import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { RealtimeProvider } from '../lib/realtime';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [initialized, setInitialized] = useState(false);
  const { token, setToken } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [setToken]);

  if (!initialized) {
    // Show splash screen while checking auth
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {token ? (
            // Authenticated screens
            <Stack.Screen
              name="(tabs)"
              options={{
                gestureEnabled: false,
              }}
            />
          ) : (
            // Authentication screens
            <Stack.Screen name="auth" />
          )}
        </Stack>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
