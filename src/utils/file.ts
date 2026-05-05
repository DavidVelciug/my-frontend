import { apiUrl } from '../config/api';

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsDataURL(file);
  });
}

export function resolveMediaUrl(value?: string | null, fallback = ''): string {
  const src = value?.trim().replace(/\\/g, '/');
  if (!src) return fallback;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return src;

  if (src.startsWith('/')) {
    // `/uploads/...` должен грузиться с бэкенда (API_BASE), а не с origin фронтенда.
    if (src.startsWith('/uploads/')) return apiUrl(src);
    return src;
  }

  if (src.startsWith('uploads/')) {
    return apiUrl(`/${src}`);
  }

  return `/${src}`;
}

export function isImageSource(value?: string | null): boolean {
  if (!value) return false;
  const src = value.trim().toLowerCase();
  if (!src) return false;
  if (src.startsWith('data:image/')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/.test(src);
}

export function extractAttachmentPaths(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function resolveUserAvatar(ownerUserId: number, ownerDisplayName?: string | null): string {
  const seed = `${ownerUserId}-${ownerDisplayName ?? 'user'}`;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}
