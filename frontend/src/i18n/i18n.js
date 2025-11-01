import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import id from './locales/id.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  id: { translation: id }
};

// Get device language
const findBestLanguage = () => {
  const fallback = { languageTag: 'en', isRTL: false };
  const locales = RNLocalize.getLocales();

  if (!Array.isArray(locales) || locales.length === 0) {
    return fallback;
  }

  const supportedLanguages = Object.keys(resources);
  const preferredLanguage = locales.find((locale) =>
    supportedLanguages.includes(locale.languageTag)
  );

  return preferredLanguage || fallback;
};

const { languageTag, isRTL } = findBestLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: languageTag,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Set RTL if needed
if (isRTL) {
  // Configure RTL support
}

export default i18n;
