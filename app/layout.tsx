import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { LiveChatButton } from '@/app/components/shared/LiveChatButton';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EBU Flow - Enterprise Business Solutions',
    template: '%s | EBU Flow',
  },
  description: 'A configurable business sales and fulfillment platform.',
  keywords: 'EBU Flow, sales automation, business solutions, KYC, payments, order management',
  authors: [{ name: 'VIRXEE' }],
  creator: 'VIRXEE',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF6B35',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-midnight antialiased">
        <Providers>
          {children}
          <LiveChatButton phoneNumber="237676648875" />
        </Providers>
      </body>
    </html>
  );
}
