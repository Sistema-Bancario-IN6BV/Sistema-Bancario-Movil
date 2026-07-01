// src/shared/store/secureStorage.js
// Abstracción de almacenamiento seguro para datos sensibles (JWT, hash de PIN).
// Usa expo-secure-store en nativo y cae a AsyncStorage en web (donde SecureStore
// no está disponible).
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export async function secureGet(key) {
  try {
    if (isNative) return await SecureStore.getItemAsync(key);
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function secureSet(key, value) {
  try {
    if (value == null) return secureDelete(key);
    if (isNative) return await SecureStore.setItemAsync(key, value);
    return await AsyncStorage.setItem(key, value);
  } catch {
    return undefined;
  }
}

export async function secureDelete(key) {
  try {
    if (isNative) return await SecureStore.deleteItemAsync(key);
    return await AsyncStorage.removeItem(key);
  } catch {
    return undefined;
  }
}

export const SECURE_KEYS = {
  TOKEN: 'cb_access_token',
  PIN_HASH: 'cb_pin_hash',
  BIOMETRIC_ENABLED: 'cb_biometric_enabled',
};
