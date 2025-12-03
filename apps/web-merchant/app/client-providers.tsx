'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="dryjets-ui-theme">
      <Providers>
        {children}
      </Providers>
      <Toaster />
    </ThemeProvider>
  );
}
