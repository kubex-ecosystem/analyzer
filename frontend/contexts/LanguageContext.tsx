import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Locale = 'en-US' | 'pt-BR';
type Translations = Record<string, any>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
  isLoading: boolean;
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
  const [locale, setLocale] = useState<Locale>(getInitialLocale());
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/locales/${locale}/translation.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${locale}`);
        }
        const data = await response.json();
        setTranslations(data);
        localStorage.setItem('locale', locale);
      } catch (error) {
        console.error(error);
        // Fallback to English if loading fails
        if (locale !== 'en-US') {
            setLocale('en-US');
        } else {
             setTranslations({}); // Clear translations on error
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, [locale]);

  const value = {
    locale,
    setLocale,
    translations,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {!isLoading && children}
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
