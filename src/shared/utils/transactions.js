// src/shared/utils/transactions.js
// Normaliza una transacción del backend a un "movimiento" para la UI, resolviendo
// la dirección (ingreso/egreso) respecto a las cuentas propias.

function accountKeys(ref) {
  // ref puede ser un ObjectId (string) o un objeto poblado.
  if (!ref) return [];
  if (typeof ref === 'string') return [ref];
  return [ref._id, ref.id, ref.accountNumber].filter(Boolean).map(String);
}

function accountNumberOf(ref) {
  if (!ref || typeof ref === 'string') return null;
  return ref.accountNumber || null;
}

export function normalizeMovement(tx, ownedKeys = new Set()) {
  const sourceKeys = accountKeys(tx?.sourceAccount);
  const destKeys = accountKeys(tx?.destinationAccount);

  const isOut = sourceKeys.some((k) => ownedKeys.has(k));
  const isIn = destKeys.some((k) => ownedKeys.has(k));
  // Si la cuenta origen es propia => egreso; si solo el destino es propio => ingreso.
  const direction = isOut && !isIn ? 'out' : isIn && !isOut ? 'in' : isOut ? 'out' : 'in';

  return {
    id: tx?._id || tx?.id,
    type: tx?.type || 'TRANSFER',
    status: tx?.status || 'COMPLETED',
    amount: Number(tx?.amount) || 0,
    currency: tx?.currency || 'GTQ',
    createdAt: tx?.createdAt || tx?.updatedAt,
    description: tx?.description || '',
    reference: tx?.reference || '',
    direction,
    sourceNumber: accountNumberOf(tx?.sourceAccount),
    destinationNumber: accountNumberOf(tx?.destinationAccount),
  };
}

export function normalizeMovements(list = [], ownedKeys = new Set()) {
  return list.map((tx) => normalizeMovement(tx, ownedKeys));
}
