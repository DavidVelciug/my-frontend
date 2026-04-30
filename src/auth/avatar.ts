const DEFAULT_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=MemoryLane';
const AVATAR_KEY = 'memorylane-avatar';

export function getAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) || DEFAULT_AVATAR;
}

export function setAvatar(url: string): void {
  if (!url.trim()) {
    localStorage.setItem(AVATAR_KEY, DEFAULT_AVATAR);
    return;
  }
  localStorage.setItem(AVATAR_KEY, url.trim());
}
