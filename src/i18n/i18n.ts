import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './am.json';
import en from './en.json';
import oro from './oro.json';

i18n.use(initReactI18next).init({
  lng: 'oro', // Default to Amharic
  fallbackLng: 'en',
  resources: { en: { translation: en }, am: { translation: am }, oro: { translation: oro } },
  interpolation: { escapeValue: false }
});

export default i18n;
