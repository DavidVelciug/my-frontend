import type { Product } from '../data/products';

const likesKey = 'memorylane-product-likes';
const openedKey = 'memorylane-opened-capsules';

export type OpenedCapsuleItem = Product & { openedAtUtc: string };

export function getLikesMap(): Record<number, number> {
  const raw = localStorage.getItem(likesKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<number, number>;
  } catch {
    return {};
  }
}

export function addLike(productId: number): number {
  const map = getLikesMap();
  const current = map[productId] ?? 0;
  map[productId] = current + 1;
  localStorage.setItem(likesKey, JSON.stringify(map));
  return map[productId];
}

export function getTotalLikes(): number {
  const map = getLikesMap();
  return Object.values(map).reduce((acc, v) => acc + v, 0);
}

export function getOpenedCapsules(): OpenedCapsuleItem[] {
  const raw = localStorage.getItem(openedKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OpenedCapsuleItem[];
  } catch {
    return [];
  }
}

export function addOpenedCapsule(product: Product): void {
  const list = getOpenedCapsules();
  list.unshift({ ...product, openedAtUtc: new Date().toISOString() });
  localStorage.setItem(openedKey, JSON.stringify(list));
}
