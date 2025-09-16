import * as React from 'react';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { translations as localeTranslations, SupportedLocale, TranslationNamespace } from '../locales';

type Locale = SupportedLocale;
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

    // Use ref to check current state to avoid dependency on state
    setLoadingNamespaces(prev => {
      if (prev[namespaceKey]) return prev; // Already loading
      return { ...prev, [namespaceKey]: true };
    });

    setLoadedNamespaces(prev => {
      if (prev[namespaceKey]) return prev; // Already loaded

      try {
        // Use the TypeScript translations instead of fetching JSON
        const currentLocaleTranslations = localeTranslations[locale];
        const namespaceData = currentLocaleTranslations[namespace as TranslationNamespace];

        if (!namespaceData) {
          throw new Error(`Namespace ${namespace} not found for locale ${locale}`);
        }

        setTranslations(prevTranslations => ({
          ...prevTranslations,
          [namespace]: namespaceData,
        }));

        setLoadingNamespaces(prevLoading => ({ ...prevLoading, [namespaceKey]: false }));

        return { ...prev, [namespaceKey]: true };
      } catch (error) {
        console.error(error);
        setLoadingNamespaces(prevLoading => ({ ...prevLoading, [namespaceKey]: false }));
        return prev;
      }
    });
  }, [locale]); // Only depend on locale

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
