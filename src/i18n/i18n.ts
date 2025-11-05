// src/i18n/i18n.ts - i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './am.json';
import en from './en.json';

const resources = {
  en: {
    translation: en,
  },
  am: {
    translation: am,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'am',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;