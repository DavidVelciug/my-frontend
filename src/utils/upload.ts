import { apiUrl } from '../config/api';

type UploadResponse = {
  isSuccess: boolean;
  message: string;
  path?: string;
};

export async function uploadFile(file: File, folder: 'avatars' | 'capsules' | 'products' | 'files'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(apiUrl('/api/upload/file'), {
    method: 'POST',
    body: formData,
    headers: {
      'X-User-Role': localStorage.getItem('memorylane-role') ?? 'guest',
    },
  });

  const data = (await res.json()) as UploadResponse;
  if (!res.ok || !data.isSuccess || !data.path) {
    throw new Error(data.message || 'Не удалось загрузить файл.');
  }

  return data.path;
}
