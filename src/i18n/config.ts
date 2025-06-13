
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
import enZones from './locales/en/zones.json';
import enAutomation from './locales/en/automation.json';
import enCrops from './locales/en/crops.json';
import enWeather from './locales/en/weather.json';
import enMap from './locales/en/map.json';
import enConnectivity from './locales/en/connectivity.json';
import enLanding from './locales/en/landing.json';
import enSubscription from './locales/en/subscription.json';

import frCommon from './locales/fr/common.json';
import frDashboard from './locales/fr/dashboard.json';
import frAuth from './locales/fr/auth.json';
import frDevices from './locales/fr/devices.json';
import frSettings from './locales/fr/settings.json';
import frNavigation from './locales/fr/navigation.json';
import frZones from './locales/fr/zones.json';
import frAutomation from './locales/fr/automation.json';
import frCrops from './locales/fr/crops.json';
import frWeather from './locales/fr/weather.json';
import frMap from './locales/fr/map.json';
import frConnectivity from './locales/fr/connectivity.json';
import frLanding from './locales/fr/landing.json';
import frSubscription from './locales/fr/subscription.json';

import arCommon from './locales/ar/common.json';
import arDashboard from './locales/ar/dashboard.json';
import arAuth from './locales/ar/auth.json';
import arDevices from './locales/ar/devices.json';
import arSettings from './locales/ar/settings.json';
import arNavigation from './locales/ar/navigation.json';
import arZones from './locales/ar/zones.json';
import arAutomation from './locales/ar/automation.json';
import arCrops from './locales/ar/crops.json';
import arWeather from './locales/ar/weather.json';
import arMap from './locales/ar/map.json';
import arConnectivity from './locales/ar/connectivity.json';
import arLanding from './locales/ar/landing.json';
import arSubscription from './locales/ar/subscription.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    devices: enDevices,
    settings: enSettings,
    navigation: enNavigation,
    zones: enZones,
    automation: enAutomation,
    crops: enCrops,
    weather: enWeather,
    map: enMap,
    connectivity: enConnectivity,
    landing: enLanding,
    subscription: enSubscription,
  },
  fr: {
    common: frCommon,
    dashboard: frDashboard,
    auth: frAuth,
    devices: frDevices,
    settings: frSettings,
    navigation: frNavigation,
    zones: frZones,
    automation: frAutomation,
    crops: frCrops,
    weather: frWeather,
    map: frMap,
    connectivity: frConnectivity,
    landing: frLanding,
    subscription: frSubscription,
  },
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    auth: arAuth,
    devices: arDevices,
    settings: arSettings,
    navigation: arNavigation,
    zones: arZones,
    automation: arAutomation,
    crops: arCrops,
    weather: arWeather,
    map: arMap,
    connectivity: arConnectivity,
    landing: arLanding,
    subscription: arSubscription,
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
