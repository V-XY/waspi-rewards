 'use client';

import { CartProvider } from '@/app/context/CartContext';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/app/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" richColors />
      </CartProvider>
    </I18nProvider>
  );
}
