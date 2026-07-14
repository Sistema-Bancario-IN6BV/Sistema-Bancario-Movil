// src/security/biometric.js
import * as LocalAuthentication from 'expo-local-authentication';

import { useSecurityStore } from '@/security/securityStore';

export async function biometricAvailable() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(promptMessage) {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}

// Decide el método para confirmar una operación sensible.
// 'biometric' | 'pin' | 'none'
export async function getPreferredAuth() {
  const { biometricEnabled, hasPin } = useSecurityStore.getState();
  if (biometricEnabled && (await biometricAvailable())) return 'biometric';
  if (hasPin) return 'pin';
  return 'none';
}
