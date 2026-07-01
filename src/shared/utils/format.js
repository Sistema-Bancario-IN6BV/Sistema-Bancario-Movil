// src/shared/utils/format.js
// Helpers de formato (moneda, fechas, enmascarado de cuentas).

const QUETZAL = 'es-GT';

export function formatCurrency(value, currency = 'GTQ') {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  const symbol = currency === 'GTQ' ? 'Q' : '';
  const formatted = safe.toLocaleString(QUETZAL, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol} ${formatted}` : `${formatted} ${currency}`;
}

// Enmascara un número de cuenta dejando visibles los últimos `visible` dígitos.
export function maskAccountNumber(accountNumber, visible = 4) {
  const str = String(accountNumber ?? '');
  if (str.length <= visible) return str;
  const last = str.slice(-visible);
  return `•••• ${last}`;
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(QUETZAL, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(QUETZAL, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
