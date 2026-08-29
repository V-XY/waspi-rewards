 'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import {
  Activity,
  Bell,
  ChevronRight,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  Sun,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { MemberRole } from '@/app/lib/types';
import { Toaster } from 'sonner';
import { LanguageSwitcher, useI18n } from '@/app/i18n';

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: MemberRole[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Leads', href: '/dashboard/leads', icon: Users },
      { label: 'Orders', href: '/dashboard/orders', icon: Package },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'KYC Review', href: '/dashboard/kyc', icon: FileCheck2 },
      { label: 'Revenue', href: '/dashboard/commissions', icon: WalletCards },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['superadmin', 'tenant_admin'] },
    ],
  },
];

function matchesPath(pathname: string, href: string): boolean {
  return href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}


function translateNav(label: string, t: (key: string) => string): string {
  const keys: Record<string, string> = {
    Workspace: 'workspace',
    'Command Center': 'commandCenter',
    Leads: 'leads',
    Orders: 'orders',
    Operations: 'operations',
    'KYC Review': 'kycReview',
    Revenue: 'revenue',
    Administration: 'administration',
    Settings: 'settings',
  };
  return keys[label] ? t(keys[label]) : label;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<MemberRole | null>(null);
  const [tenantName, setTenantName] = useState('Workspace');
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);

      if (!data.session) {
        router.replace('/auth/signin');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/me', { cache: 'no-store' });
      if (response.ok) {
        const payload = await response.json() as {
          membership?: { role?: MemberRole; tenants?: { name?: string } };
        };
        if (mounted) {
          setRole(payload.membership?.role ?? null);
          setTenantName(payload.membership?.tenants?.name ?? 'Workspace');
        }
      }
      if (mounted) setLoading(false);
    };

    void loadSession();

    const { data: auth } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) router.replace('/auth/signin');
    });

    return () => {
      mounted = false;
      auth.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const restoreTheme = () => {
      const saved = window.localStorage.getItem('ebu-theme') === 'dark';
      document.documentElement.classList.toggle('dark', saved);
      setDark(saved);
    };
    restoreTheme();
  }, []);

  const visibleGroups = useMemo(
    () => groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    })).filter((group) => group.items.length > 0),
    [role],
  );

  const current = visibleGroups.flatMap((group) => group.items).find((item) => matchesPath(pathname, item.href));
  const pageTitle = current?.label ?? 'Command Center';

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('ebu-theme', next ? 'dark' : 'light');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/signin');
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-solar-flare border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">{t('loadingWorkspace')}</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-slate-50 dark:bg-midnight">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-midnight/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-200 bg-white transition-transform dark:border-white/10 dark:bg-ebony lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-solar-flare text-sm font-bold text-white">E</span>
            <span className="font-bold tracking-tight text-midnight dark:text-white">EBU Flow</span>
          </Link>
          <button type="button" className="icon-button lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('tenant')}</p>
          <p className="mt-1 truncate text-sm font-semibold text-midnight dark:text-white">{tenantName}</p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Workspace navigation">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{translateNav(group.label, t)}</p>
              <div className="grid gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = matchesPath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? 'bg-orange-50 text-solar-flare dark:bg-solar-flare/10' : 'text-slate-600 hover:bg-slate-50 hover:text-midnight dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'}`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{translateNav(item.label, t)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-white/10">
          <button type="button" onClick={() => void signOut()} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-ebony/90">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
            <button type="button" className="icon-button lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                <span>{t('workspace')}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate">{tenantName}</span>
              </div>
              <h1 className="truncate text-base font-semibold text-midnight dark:text-white sm:text-lg">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button type="button" className="icon-button hidden sm:inline-flex" aria-label={t('systemActivity')}>
                <Activity className="h-5 w-5" />
              </button>
              <button type="button" className="icon-button relative" aria-label={t('notifications')}>
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-solar-flare" />
              </button>
              <button type="button" className="icon-button" onClick={toggleTheme} aria-label={dark ? t('lightTheme') : t('darkTheme')}>
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <LanguageSwitcher compact />
              <div className="ml-1 hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 sm:flex dark:border-white/10">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-solar-flare text-xs font-bold text-white">
                  {(session.user.user_metadata?.full_name ?? session.user.email ?? 'A').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-36 truncate text-sm font-medium text-midnight dark:text-white">
                  {session.user.user_metadata?.full_name ?? session.user.email ?? 'Operator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
