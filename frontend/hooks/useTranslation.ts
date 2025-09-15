import { useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const getDeepValue = (obj: any, path: string[]): any => {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

export const useTranslation = (namespaces: string | string[] = 'common') => {
  const { translations, loadNamespace } = useLanguage();
  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces];

  useEffect(() => {
    nsArray.forEach(ns => {
      loadNamespace(ns);
    });
  }, [nsArray, loadNamespace]);

  const isLoading = useMemo(() => {
    return nsArray.some(ns => translations[ns] === undefined);
  }, [nsArray, translations]);
  
  const t = (key: string, options?: Record<string, string | number>): string => {
      // Prevent running t function if translations are not ready
      if (isLoading) return '';

      const keyParts = key.split(':');
      let result: any;

      if (keyParts.length > 1) {
          const [ns, lookupKey] = keyParts;
          const path = lookupKey.split('.');
          result = getDeepValue(translations[ns], path);
      } else {
          const path = key.split('.');
          for (const searchNs of nsArray) {
              const found = getDeepValue(translations[searchNs], path);
              if (found !== undefined) {
                  result = found;
                  break;
              }
          }
      }

      if (result === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
      }
      
      if (options && typeof result === 'string') {
          return Object.keys(options).reduce((acc, optionKey) => {
              const regex = new RegExp(`{${optionKey}}`, 'g');
              return acc.replace(regex, String(options[optionKey]));
          }, result);
      }

      return result;
  };

  return { t, isLoading };
};