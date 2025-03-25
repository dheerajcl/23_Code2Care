// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

export type SupportedLanguages = 'en' | 'hi' | 'ta' | 'bn' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      [key in SupportedLanguages]: {
        translation: {
          welcome: string;
          goodbye: string;
          changeLanguage: string;
          switchToDarkMode: string;
          switchToLightMode: string;
          openMenu: string;
          closeMenu: string;
          home: string;
          events: string;
          about: string;
          donate: string;
          volunteer: string;
          dashboard: string;
          login: string;
          logout: string;
          language: string;
          english: string;
          hindi: string;
          kannada: string;
          userMenu: string;
        };
      };
    };
  }
}

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ta', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;