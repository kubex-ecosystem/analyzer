import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { translations } = useLanguage();

  const t = (key: string, options?: Record<string, string | number>): string => {
    // Navigate through nested keys
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
      if (acc && typeof acc === 'object' && currentKey in acc) {
        return acc[currentKey];
      }
      return undefined;
    }, translations as any);

    if (result === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key as a fallback
    }
    
    // Handle interpolation
    if (options && typeof result === 'string') {
        Object.keys(options).forEach(optionKey => {
            const regex = new RegExp(`{${optionKey}}`, 'g');
            result = result.replace(regex, String(options[optionKey]));
        });
    }

    return result;
  };

  return { t };
};
