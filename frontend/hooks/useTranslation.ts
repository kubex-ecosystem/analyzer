import { useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationNamespace } from '../locales';

const getDeepValue = (obj: any, path: string[]): any => {
  let current = obj;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];

    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    if (!(key in current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}; export const useTranslation = (namespaces: TranslationNamespace | TranslationNamespace[] = 'common') => {
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
    const keyParts = key.split(':');
    let result: any;

    if (keyParts.length > 1) {
      // Explicit namespace syntax: "namespace:key.subkey"
      const [ns, lookupKey] = keyParts;
      const path = lookupKey.split('.');

      // Make sure the namespace is loaded
      if (translations[ns] === undefined) {
        loadNamespace(ns);
        return ''; // Return empty while loading
      }

      result = getDeepValue(translations[ns], path);
    } else {
      // Check if this might be implicit namespace syntax: "namespace.key.subkey"
      const path = key.split('.');

      if (path.length > 1) {
        const potentialNamespace = path[0];

        // Check if the first part is a valid namespace that we haven't loaded yet
        const validNamespaces = ['common', 'analysis', 'auth', 'chat', 'dashboard', 'dataSources', 'example', 'files', 'githubSearch', 'history', 'importExport', 'input', 'kanban', 'landing', 'notifications', 'profile', 'settings', 'tabs', 'tokenUsage'];

        if (validNamespaces.includes(potentialNamespace) && translations[potentialNamespace] === undefined) {
          // Load the namespace and return empty for now
          loadNamespace(potentialNamespace);
          return '';
        }

        if (validNamespaces.includes(potentialNamespace) && translations[potentialNamespace] !== undefined) {
          // Use the specific namespace
          const namespaceKey = path.slice(1); // Remove namespace from path
          result = getDeepValue(translations[potentialNamespace], namespaceKey);
        }
      }

      // If we haven't found anything yet, search in the currently loaded namespaces
      if (result === undefined) {
        for (const searchNs of nsArray) {
          if (translations[searchNs] !== undefined) {
            const found = getDeepValue(translations[searchNs], path);
            if (found !== undefined) {
              result = found;
              break;
            }
          }
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
