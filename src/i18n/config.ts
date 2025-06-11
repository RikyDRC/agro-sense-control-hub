
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';
import enDevices from './locales/en/devices.json';
import enSettings from './locales/en/settings.json';
import enNavigation from './locales/en/navigation.json';

import frCommon from './locales/fr/common.json';
import frDashboard from './locales/fr/dashboard.json';
import frAuth from './locales/fr/auth.json';
import frDevices from './locales/fr/devices.json';
import frSettings from './locales/fr/settings.json';
import frNavigation from './locales/fr/navigation.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    devices: enDevices,
    settings: enSettings,
    navigation: enNavigation,
  },
  fr: {
    common: frCommon,
    dashboard: frDashboard,
    auth: frAuth,
    devices: frDevices,
    settings: frSettings,
    navigation: frNavigation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
