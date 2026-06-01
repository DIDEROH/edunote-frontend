import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importations des fichiers FR
import frCommon from './locales/fr/common.json';
import frHome from './locales/fr/home.json';

// Importations des fichiers EN
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';

const resources = {
  fr: {
    common: frCommon,   // Le nom de la clé devient le nom du namespace
    home: frHome
  },
  en: {
    common: enCommon,
    home: enHome
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common', // Si vous ne précisez pas de namespace, i18next cherchera ici
    interpolation: { escapeValue: false }
  });

export default i18n;