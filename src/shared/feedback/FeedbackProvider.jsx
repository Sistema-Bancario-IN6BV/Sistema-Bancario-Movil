// src/shared/feedback/FeedbackProvider.jsx
// Sustituto con tema de Alert.alert nativo: confirm()/alert() (modal) y
// showToast() (banner no bloqueante). Mismo patrón que ThemeProvider.jsx
// (un archivo agrupa contexto + provider + hooks).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState({ message: '', variant: 'info', visible: false });
  const toastTimer = useRef(null);
  const pendingResolve = useRef(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showDialog = useCallback((options) => {
    return new Promise((resolve) => {
      // Defensivo: si ya había un diálogo sin resolver, se resuelve como
      // cancelado antes de mostrar el nuevo (no debería pasar en la práctica).
      if (pendingResolve.current) pendingResolve.current(false);
      pendingResolve.current = resolve;
      setDialog(options);
    });
  }, []);

  const closeDialog = useCallback((result) => {
    setDialog(null);
    const resolve = pendingResolve.current;
    pendingResolve.current = null;
    resolve?.(result);
  }, []);

  // Confirmación con 2 botones (cancelar/confirmar), opcionalmente destructiva.
  const confirm = useCallback(
    ({ title, message, confirmText, cancelText, destructive = false }) =>
      showDialog({
        title,
        message,
        destructive,
        confirmText: confirmText || t('common.confirm'),
        cancelText: cancelText || t('common.cancel'),
      }),
    [showDialog, t],
  );

  // Aviso de un solo botón (sin opción de cancelar) — reemplazo directo de
  // los Alert.alert de "éxito + botón que navega".
  const alert = useCallback(
    ({ title, message, confirmText }) =>
      showDialog({
        title,
        message,
        destructive: false,
        confirmText: confirmText || t('common.continue'),
        cancelText: undefined,
      }),
    [showDialog, t],
  );

  const showToast = useCallback((message, { variant = 'info', duration = 2500 } = {}) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, variant, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  const value = useMemo(() => ({ confirm, alert, showToast }), [confirm, alert, showToast]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ConfirmDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        confirmText={dialog?.confirmText}
        cancelText={dialog?.cancelText}
        destructive={dialog?.destructive}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
      <Toast visible={toast.visible} message={toast.message} variant={toast.variant} />
    </FeedbackContext.Provider>
  );
}

function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return ctx;
}

export function useConfirm() {
  return useFeedback().confirm;
}

export function useAlert() {
  return useFeedback().alert;
}

export function useToast() {
  return useFeedback().showToast;
}

export default FeedbackProvider;
