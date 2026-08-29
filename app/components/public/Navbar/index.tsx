 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, UserRound, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { LanguageSwitcher, useI18n } from '@/app/i18n';
import type { PublicCatalog } from '@/app/lib/types';

type NavItem = { label: string; href: string };

const primaryLinks: NavItem[] = [
  { label: 'Solutions', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const tenantSlug = pathname.startsWith('/t/') ? pathname.split('/')[2] : undefined;
  const { items } = useCart();
  const { t } = useI18n();
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/catalog/summary${tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : ''}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json() as Promise<PublicCatalog>;
      })
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalog(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const tenantName = catalog?.tenant.name ?? 'EBU Flow';
  const publicBase = tenantSlug ? `/t/${tenantSlug}` : '';
  const solutionsHref = `${publicBase}/products`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="site-container">
        <div className="flex h-16 min-w-0 items-center gap-3">
          <Link href={publicBase || '/'} className="flex min-w-0 shrink-0 items-center gap-2" aria-label={`${tenantName} home`}>
            {catalog?.tenant.logo_url ? (
              <img src={catalog.tenant.logo_url} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-solar-flare text-sm font-bold text-white">E</span>
            )}
            <span className="hidden text-base font-bold tracking-tight text-midnight sm:block">
              {tenantName}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSolutionsOpen((value) => !value)}
                aria-expanded={solutionsOpen}
                className={`nav-link ${isActivePath(pathname, solutionsHref) ? 'nav-link-active' : ''}`}
              >
                {t('solutions')}
                <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {solutionsOpen && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <Link href={solutionsHref} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50">
                    <span>
                      <span className="block text-sm font-semibold text-midnight">{t('allSolutions')}</span>
                      <span className="block text-xs text-slate-500">{t('exploreTenantOffers')}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-solar-flare" />
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {catalog?.solutions.slice(0, 6).map((solution) => (
                    <Link
                      key={solution.id}
                      href={`${solutionsHref}?category=${encodeURIComponent(solution.slug)}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
                    >
                      <span className="text-sm text-slate-700">{solution.name}</span>
                      <span className="text-xs text-slate-400">{solution.productCount}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {primaryLinks.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${isActivePath(pathname, item.href) ? 'nav-link-active' : ''}`}>
                {item.href === '/about' ? t('about') : t('contact')}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-4">
            <Link href={solutionsHref} className="icon-button hidden sm:inline-flex" aria-label={t('searchSolutions')}>
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/checkout" className="icon-button relative" aria-label={`Cart with ${items.length} items`}>
              <ShoppingBag className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-solar-flare px-1 text-[10px] font-bold text-white">
                  {items.length > 9 ? '9+' : items.length}
                </span>
              )}
            </Link>
            <LanguageSwitcher compact />
            <Link href="/auth/signin" className="icon-button hidden sm:inline-flex" aria-label={t('signIn')}>
              <UserRound className="h-5 w-5" />
            </Link>
            <button
              type="button"
              className="icon-button lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={t('openNavigation')}
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-midnight/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[min(88vw,380px)] flex-col bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-midnight">{t('navigation')}</span>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={t('closeNavigation')}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-1">
              <Link href={solutionsHref} className="mobile-nav-link">
                {t('solutions')}
                <span className="text-xs text-slate-400">{catalog?.solutions.length ?? 0}</span>
              </Link>
              {catalog?.solutions.map((solution) => (
                <Link key={solution.id} href={`${solutionsHref}?category=${encodeURIComponent(solution.slug)}`} className="mobile-nav-link pl-6 text-slate-600">
                  {solution.name}
                  <span className="text-xs text-slate-400">{solution.productCount}</span>
                </Link>
              ))}
              {primaryLinks.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="mobile-nav-link">
                  {item.href === '/about' ? t('about') : t('contact')}
                </Link>
              ))}
            </div>

            <div className="mt-auto grid gap-2 border-t border-slate-200 pt-5">
              <Link href="/auth/signin" className="btn-primary w-full justify-center">
                {t('signIn')}
              </Link>
              <Link href="/checkout" className="btn-secondary w-full justify-center">
                {t('viewCart')}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
