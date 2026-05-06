import { getCurrentUserId } from './session';

const catalogReactionsKey = 'memorylane-catalog-reactions';
const feedReactionsKey = 'memorylane-feed-reactions';

type Reaction = 'like' | 'dislike';
type ReactionsByUser = Record<string, Record<number, Reaction>>;

function readMap(storageKey: string): ReactionsByUser {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ReactionsByUser;
  } catch {
    return {};
  }
}

function writeMap(storageKey: string, value: ReactionsByUser): void {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function getUserKey(): string {
  return String(getCurrentUserId() ?? 0);
}

export function toggleCatalogReaction(productId: number, reaction: Reaction): Reaction | null {
  const map = readMap(catalogReactionsKey);
  const userKey = getUserKey();
  const current = map[userKey]?.[productId] ?? null;

  if (!map[userKey]) map[userKey] = {};
  if (current === reaction) {
    delete map[userKey][productId];
  } else {
    map[userKey][productId] = reaction;
  }
  writeMap(catalogReactionsKey, map);
  return map[userKey]?.[productId] ?? null;
}

export function getCatalogCounts(productId: number): { likes: number; dislikes: number } {
  const map = readMap(catalogReactionsKey);
  let likes = 0;
  let dislikes = 0;
  Object.values(map).forEach((userMap) => {
    if (userMap[productId] === 'like') likes += 1;
    if (userMap[productId] === 'dislike') dislikes += 1;
  });
  return { likes, dislikes };
}

export function getCatalogUserReaction(productId: number): Reaction | null {
  const map = readMap(catalogReactionsKey);
  const userKey = getUserKey();
  return map[userKey]?.[productId] ?? null;
}

export function toggleFeedReaction(capsuleId: number, reaction: Reaction): Reaction | null {
  const map = readMap(feedReactionsKey);
  const userKey = getUserKey();
  const current = map[userKey]?.[capsuleId] ?? null;
  if (!map[userKey]) map[userKey] = {};
  if (current === reaction) {
    delete map[userKey][capsuleId];
  } else {
    map[userKey][capsuleId] = reaction;
  }
  writeMap(feedReactionsKey, map);
  return map[userKey]?.[capsuleId] ?? null;
}

export function getFeedCounts(capsuleId: number): { likes: number; dislikes: number } {
  const map = readMap(feedReactionsKey);
  let likes = 0;
  let dislikes = 0;
  Object.values(map).forEach((userMap) => {
    if (userMap[capsuleId] === 'like') likes += 1;
    if (userMap[capsuleId] === 'dislike') dislikes += 1;
  });
  return { likes, dislikes };
}

export function getFeedUserReaction(capsuleId: number): Reaction | null {
  const map = readMap(feedReactionsKey);
  const userKey = getUserKey();
  return map[userKey]?.[capsuleId] ?? null;
}
