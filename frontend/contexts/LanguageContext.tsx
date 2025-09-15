import * as React from 'react';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

type Locale = 'en-US' | 'pt-BR';
type Translations = Record<string, any>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
  loadNamespace: (namespace: string) => Promise<void>;
  isLoading?: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const storedLocale = localStorage.getItem('locale') as Locale;
  if (storedLocale && ['en-US', 'pt-BR'].includes(storedLocale)) {
    return storedLocale;
  }
  const browserLang = navigator.language;
  if (browserLang.startsWith('pt')) {
    return 'pt-BR';
  }
  return 'en-US';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale());
  const [translations, setTranslations] = useState<Translations>({});
  const [loadedNamespaces, setLoadedNamespaces] = useState<Record<string, boolean>>({});
  const [loadingNamespaces, setLoadingNamespaces] = useState<Record<string, boolean>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations({});
    setLoadedNamespaces({});
    setLoadingNamespaces({});
    setIsInitialLoad(true);
    localStorage.setItem('locale', newLocale);
  };

  const loadNamespace = useCallback(async (namespace: string) => {
    const namespaceKey = `${locale}-${namespace}`;
    if (loadedNamespaces[namespaceKey] || loadingNamespaces[namespaceKey]) {
      return;
    }

    setLoadingNamespaces(prev => ({ ...prev, [namespaceKey]: true }));
    try {
      const response = await fetch(`/locales/${locale}/${namespace}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}/${namespace}`);
      }
      const data = await response.json();
      setTranslations(prev => ({
        ...prev,
        [namespace]: data,
      }));
      setLoadedNamespaces(prev => ({ ...prev, [namespaceKey]: true }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingNamespaces(prev => ({ ...prev, [namespaceKey]: false }));
    }
  }, [locale, loadedNamespaces, loadingNamespaces]);

  useEffect(() => {
    if (isInitialLoad) {
      loadNamespace('common').finally(() => {
        setIsInitialLoad(false);
      });
    }
  }, [locale, isInitialLoad, loadNamespace]);

  const value = {
    locale,
    setLocale,
    translations,
    loadNamespace,
  };

  return (
    <LanguageContext.Provider value={value}>
      {!isInitialLoad ? children : null}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
