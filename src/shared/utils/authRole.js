// src/shared/utils/authRole.js
// Normalización de roles. El backend emite "USER_ROLE" / "ADMIN_ROLE".

export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  USER: 'USER_ROLE',
};

const ALIASES = {
  ADMIN_ROLE: ROLES.ADMIN,
  USER_ROLE: ROLES.USER,
  ADMIN: ROLES.ADMIN,
  USER: ROLES.USER,
  CLIENT: ROLES.USER,
  CUSTOMER: ROLES.USER,
};

export function normalizeRole(role) {
  if (!role) return ROLES.USER;
  const key = String(role).trim().toUpperCase();
  return ALIASES[key] || key;
}

export function isClient(role) {
  return normalizeRole(role) === ROLES.USER;
}

export function isAdmin(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}
