import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeInitializer } from '@/components/ThemeInitializer';

export const metadata: Metadata = {
  title: 'TravelConnect - Travel Networking Platform',
  description: 'Connect with travelers, share rides, and network on the go',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E8654B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
