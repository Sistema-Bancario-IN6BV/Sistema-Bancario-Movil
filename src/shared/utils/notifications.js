// src/shared/utils/notifications.js
// Notificaciones locales con expo-notifications. En Expo Go (SDK 53+) las
// notificaciones push remotas no funcionan, pero las LOCALES sí en build de
// desarrollo. Todo va envuelto en try/catch para no romper el flujo si el módulo
// no está disponible en el entorno actual.
import * as Notifications from 'expo-notifications';

let configured = false;

export function configureNotifications() {
  if (configured) return;
  configured = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // entorno sin soporte
  }
}

export async function ensureNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  } catch {
    return false;
  }
}

export async function notifyLocal(title, body) {
  try {
    const ok = await ensureNotificationPermission();
    if (!ok) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // inmediata
    });
  } catch {
    // silencioso: la notificación es un extra, no debe bloquear la operación
  }
}
