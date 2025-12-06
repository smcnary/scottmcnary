export interface Photo {
  id: string;
  title?: string;
  description?: string;
  keywords?: string[];
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPhotosResponse {
  photos: Photo[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getPhotos(page: number = 1, pageSize: number = 24): Promise<PaginatedPhotosResponse> {
  const response = await fetch(`${API_URL}/api/photos?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }
  const data = await response.json();
  // Map backend response to frontend interface (backend uses PascalCase, frontend uses camelCase)
  return {
    photos: data.Photos || data.photos || [],
    page: data.Page ?? data.page ?? 1,
    pageSize: data.PageSize ?? data.pageSize ?? 24,
    totalCount: data.TotalCount ?? data.totalCount ?? 0,
    totalPages: data.TotalPages ?? data.totalPages ?? 0,
  };
}

export async function getPhoto(id: string): Promise<Photo> {
  const response = await fetch(`${API_URL}/api/photos/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch photo');
  }
  return response.json();
}

export async function uploadPhotos(
  zipFile: File,
  password: string
): Promise<{ message: string; count: number; photos: Array<{ id: string; fileName: string }> }> {
  const formData = new FormData();
  formData.append('zipFile', zipFile);

  const response = await fetch(`${API_URL}/api/photos/upload`, {
    method: 'POST',
    headers: {
      'X-Upload-Password': password,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function updatePhotoMetadata(
  id: string,
  metadata: { title?: string; description?: string; keywords?: string[] },
  password: string
): Promise<Photo> {
  const response = await fetch(`${API_URL}/api/photos/metadata/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Upload-Password': password,
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Update failed');
  }

  return response.json();
}

export function getPhotoUrl(photo: Photo): string {
  if (photo.filePath.startsWith('http')) {
    return photo.filePath;
  }
  return `${API_URL}${photo.filePath}`;
}




