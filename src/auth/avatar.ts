import { getCurrentUserId } from './session';

const DEFAULT_AVATAR = '/assets/default-avatar.svg';
const AVATAR_KEY_PREFIX = 'memorylane-avatar-';

function getKey(): string {
  const userId = getCurrentUserId();
  return `${AVATAR_KEY_PREFIX}${userId ?? 'guest'}`;
}

export function getAvatar(): string {
  return localStorage.getItem(getKey()) || DEFAULT_AVATAR;
}

export function setAvatar(url: string): void {
  if (!url.trim()) {
    localStorage.setItem(getKey(), DEFAULT_AVATAR);
    return;
  }
  localStorage.setItem(getKey(), url.trim());
}
