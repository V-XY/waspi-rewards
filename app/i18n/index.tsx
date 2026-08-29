'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

type Locale = 'en' | 'fr';
type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    language: 'Language', english: 'English', french: 'French', solutions: 'Solutions', allSolutions: 'All solutions', exploreTenantOffers: 'Explore what this tenant offers', about: 'About', contact: 'Contact', signIn: 'Sign in', viewCart: 'View cart', navigation: 'Navigation', tenant: 'Tenant', workspace: 'Workspace', commandCenter: 'Command Center', leads: 'Leads', orders: 'Orders', operations: 'Operations', kycReview: 'KYC Review', revenue: 'Revenue', administration: 'Administration', settings: 'Settings', signOut: 'Sign out', loadingWorkspace: 'Loading workspace...', systemActivity: 'System activity', notifications: 'Notifications', lightTheme: 'Use light theme', darkTheme: 'Use dark theme', closeNavigation: 'Close navigation', openNavigation: 'Open navigation', searchSolutions: 'Search solutions', exploreCatalogue: 'Explore catalogue', company: 'Company', legal: 'Legal', trackOrder: 'Track an order', viewSolutions: 'View solutions'
  },
  fr: {
    language: 'Langue', english: 'Anglais', french: 'Français', solutions: 'Solutions', allSolutions: 'Toutes les solutions', exploreTenantOffers: 'Découvrir les offres de cet espace', about: 'À propos', contact: 'Contact', signIn: 'Connexion', viewCart: 'Voir le panier', navigation: 'Navigation', tenant: 'Organisation', workspace: 'Espace de travail', commandCenter: 'Centre de commande', leads: 'Prospects', orders: 'Commandes', operations: 'Opérations', kycReview: 'Vérification KYC', revenue: 'Revenus', administration: 'Administration', settings: 'Paramètres', signOut: 'Déconnexion', loadingWorkspace: 'Chargement de l’espace...', systemActivity: 'Activité système', notifications: 'Notifications', lightTheme: 'Utiliser le thème clair', darkTheme: 'Utiliser le thème sombre', closeNavigation: 'Fermer la navigation', openNavigation: 'Ouvrir la navigation', searchSolutions: 'Rechercher des solutions', exploreCatalogue: 'Explorer le catalogue', company: 'Entreprise', legal: 'Mentions légales', trackOrder: 'Suivre une commande', viewSolutions: 'Voir les solutions'
  }
};

const listeners = new Set<() => void>();
const STORAGE_KEY = 'ebu-locale';

function readLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'fr' ? 'fr' : 'en';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getServerLocale(): Locale { return 'en'; }

function setStoredLocale(locale: Locale): void {
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  listeners.forEach((listener) => listener());
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, getServerLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: setStoredLocale,
    toggleLocale: () => setStoredLocale(locale === 'en' ? 'fr' : 'en'),
    t: (key) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, toggleLocale, t } = useI18n();
  const nextLabel = locale === 'en' ? 'Passer au français' : 'Switch to English';
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-midnight dark:border-white/10 dark:bg-ebony dark:text-slate-300 dark:hover:text-white"
      aria-label={`${t('language')}: ${locale === 'en' ? t('english') : t('french')}. ${nextLabel}`}
      title={nextLabel}
    >
      <span className="font-bold">{locale.toUpperCase()}</span>
      {!compact && <span className="hidden sm:inline">{locale === 'en' ? 'FR' : 'EN'}</span>}
    </button>
  );
}
