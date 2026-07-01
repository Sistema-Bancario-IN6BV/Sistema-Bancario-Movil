// src/shared/i18n/index.js
// i18next en español por defecto, listo para inglés. La preferencia se persiste
// en AsyncStorage y se aplica de forma asíncrona al arrancar.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';

export const LANGUAGE_KEY = 'cb_language';
export const SUPPORTED_LANGUAGES = ['es', 'en'];

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// Cargar preferencia guardada sin bloquear el render inicial.
AsyncStorage.getItem(LANGUAGE_KEY)
  .then((stored) => {
    if (stored && SUPPORTED_LANGUAGES.includes(stored) && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  })
  .catch(() => {});

export async function setAppLanguage(lng) {
  if (!SUPPORTED_LANGUAGES.includes(lng)) return;
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // preferencia no persistida; no crítico
  }
}

export default i18n;
