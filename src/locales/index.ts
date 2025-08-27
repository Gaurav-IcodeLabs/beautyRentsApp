// import i18n from 'i18next'
import { createInstance } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

const i18n = createInstance();

const resources = {
  en: {
    translation: en,
  },
};

i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

export const mergeTranslations = translations => ({
  ...en,
  ...translations,
});

export default i18n;
