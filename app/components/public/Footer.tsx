 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PublicCatalog } from '@/app/lib/types';
import { LanguageSwitcher, useI18n } from '@/app/i18n';

export function Footer() {
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null);
  const { t } = useI18n();
  const pathname = usePathname();
  const tenantSlug = pathname.startsWith('/t/') ? pathname.split('/')[2] : undefined;
  const publicBase = tenantSlug ? `/t/${tenantSlug}` : '';

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/catalog/summary${tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : ''}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json() as Promise<PublicCatalog>;
      })
      .then((data) => { if (!cancelled) setCatalog(data); })
      .catch(() => { if (!cancelled) setCatalog(null); });

    return () => { cancelled = true; };
  }, [tenantSlug]);

  return (
    <footer className="border-t border-white/10 bg-midnight text-white">
      <div className="site-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-solar-flare text-sm font-bold">E</span>
              <span className="font-bold tracking-tight">{catalog?.tenant.name ?? 'EBU Flow'}</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              A configurable sales and fulfillment experience for modern business operators.
            </p>
            <a href="https://wa.me/237676648875" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          <div>
            <h2 className="footer-heading">{t('solutions')}</h2>
            <div className="grid gap-2">
              {(catalog?.solutions ?? []).slice(0, 6).map((solution) => (
                <Link key={solution.id} href={`${publicBase}/products?category=${encodeURIComponent(solution.slug)}`} className="footer-link">
                  {solution.name}
                </Link>
              ))}
              {!catalog?.solutions.length && <Link href={`${publicBase}/products`} className="footer-link">{t('exploreCatalogue')}</Link>}
            </div>
          </div>

          <div>
            <h2 className="footer-heading">{t('company')}</h2>
            <div className="grid gap-2">
              <Link href="/about" className="footer-link">{t('about')}</Link>
              <Link href="/contact" className="footer-link">{t('contact')}</Link>
              <Link href="/auth/signin" className="footer-link">{t('signIn')}</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">{t('legal')}</h2>
            <div className="grid gap-2">
              <Link href="/terms" className="footer-link">Terms</Link>
              <Link href="/privacy" className="footer-link">Privacy</Link>
              <Link href="/track" className="footer-link">{t('trackOrder')}</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>EBU Flow by VIRXEE</span>
          <span>© {new Date().getFullYear()} VIRXEE. All rights reserved.</span>
          <LanguageSwitcher compact />
          <Link href={`${publicBase}/products`} className="inline-flex items-center gap-1 text-slate-400 hover:text-white">
            {t('viewSolutions')} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
