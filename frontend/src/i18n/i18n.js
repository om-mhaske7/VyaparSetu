// src/i18n/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../locales/en/translation.json';
import translationHI from '../locales/hi/translation.json';
import translationGU from '../locales/gu/translation.json';
import translationMR from '../locales/mr/translation.json';

// All translations
const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  gu: { translation: translationGU },
  mr: { translation: translationMR },
};

i18n
  .use(LanguageDetector) // Detects browser language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
