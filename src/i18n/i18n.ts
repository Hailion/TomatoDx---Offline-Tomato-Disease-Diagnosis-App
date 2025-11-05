import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './am.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  lng: 'am', // Default to Amharic
  fallbackLng: 'en',
  resources: { en: { translation: en }, am: { translation: am } },
  interpolation: { escapeValue: false }
});

export default i18n;
