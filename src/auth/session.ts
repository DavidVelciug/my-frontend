export type AppRole = 'guest' | 'user' | 'moderator' | 'admin';

const STORAGE_KEY = 'memorylane-role';

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

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
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
