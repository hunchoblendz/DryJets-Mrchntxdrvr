import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DryJets - Premium Dry Cleaning & Laundry Delivery',
  description: 'Reclaim your time. Professional dry cleaning and laundry service with free pickup and delivery in 48 hours.',
  keywords: 'dry cleaning, laundry service, pickup delivery, professional cleaning, same day laundry',
  openGraph: {
    title: 'DryJets - Life\'s Too Short for Laundry Day',
    description: 'Order pickup in 60 seconds. We\'ll do the rest.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1E293B',
                color: '#fff',
                borderRadius: '0.75rem',
                padding: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
