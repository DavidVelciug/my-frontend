export type AppRole = 'guest' | 'user' | 'moderator' | 'admin';

const STORAGE_KEY = 'memorylane-role';
const USER_ID_STORAGE_KEY = 'memorylane-user-id';
const USER_NAME_STORAGE_KEY = 'memorylane-user-name';

export function getRole(): AppRole {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === 'user' || value === 'moderator' || value === 'admin' || value === 'guest') {
    return value;
  }

  return 'guest';
}

export function setRole(role: AppRole): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function setCurrentUser(userId: number, displayName?: string | null): void {
  localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
  if (displayName) {
    localStorage.setItem(USER_NAME_STORAGE_KEY, displayName);
  }
}

export function getCurrentUserId(): number | null {
  const value = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(USER_NAME_STORAGE_KEY);
}

export function canAccess(role: AppRole, page: 'moderation' | 'stats'): boolean {
  if (page === 'stats') {
    return role === 'admin';
  }

  if (page === 'moderation') {
    return role === 'moderator' || role === 'admin';
  }

  return false;
}

export function canUseExtendedFeatures(role: AppRole): boolean {
  return role !== 'guest';
}
