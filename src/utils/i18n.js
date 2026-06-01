import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importation de tes fichiers de traduction
import translationFR from '../locales/fr.json';
import translationEN from '../locales/en.json';

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector) // Détecte la langue du navigateur automatiquement
  .use(initReactI18next) // Lie i18next à React
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut si la traduction est manquante
    interpolation: {
      escapeValue: false // React protège déjà contre les injections XSS
    }
  });

export default i18n;