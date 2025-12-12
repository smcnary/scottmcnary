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

export interface PhotoNeighborsResponse {
  previousId: string | null;
  nextId: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Log API URL in development for debugging (server-side only)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Using API URL:', API_URL);
}

export async function getPhotos(page: number = 1, pageSize: number = 24): Promise<PaginatedPhotosResponse> {
  // Create timeout controller for better compatibility
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(`${API_URL}/api/photos?page=${page}&pageSize=${pageSize}`, {
      cache: 'no-store', // Ensure fresh data on each request
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch photos';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = 'Photos endpoint not found. Please check API configuration.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status === 0 || response.status === 503) {
          errorMessage = 'Unable to connect to server. Please check if the API is running.';
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Map backend response to frontend interface (backend uses PascalCase, frontend uses camelCase)
    const photos = (data.Photos || data.photos || []).map((photo: any) => ({
      id: photo.Id || photo.id || '',
      title: photo.Title || photo.title,
      description: photo.Description || photo.description,
      keywords: photo.Keywords || photo.keywords,
      filePath: photo.FilePath || photo.filePath || '',
      fileName: photo.FileName || photo.fileName || '',
      fileSize: photo.FileSize ?? photo.fileSize ?? 0,
      mimeType: photo.MimeType || photo.mimeType,
      uploadedAt: photo.UploadedAt || photo.uploadedAt || '',
      createdAt: photo.CreatedAt || photo.createdAt || '',
      updatedAt: photo.UpdatedAt || photo.updatedAt || '',
    }));
    
    return {
      photos,
      page: data.Page ?? data.page ?? 1,
      pageSize: data.PageSize ?? data.pageSize ?? 24,
      totalCount: data.TotalCount ?? data.totalCount ?? 0,
      totalPages: data.TotalPages ?? data.totalPages ?? 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      // Handle network errors, timeouts, and CORS errors
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
        throw new Error(`Connection timeout. The API at ${API_URL} did not respond within 10 seconds. Please check if the backend is running and accessible.`);
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error(`Unable to connect to the API at ${API_URL}. Please check if the backend server is running and the URL is correct.`);
      }
      if (error.message.includes('CORS') || error.message.includes('cors')) {
        throw new Error('CORS error: The API server is not allowing requests from this origin. Please check CORS configuration on the backend.');
      }
      // Re-throw the error if it's already a descriptive Error
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching photos');
  }
}

export async function getPhoto(id: string): Promise<Photo> {
  try {
    const response = await fetch(`${API_URL}/api/photos/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Photo not found');
      }
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch photo';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Map backend response to frontend interface
    return {
      id: data.Id || data.id || '',
      title: data.Title || data.title,
      description: data.Description || data.description,
      keywords: data.Keywords || data.keywords,
      filePath: data.FilePath || data.filePath || '',
      fileName: data.FileName || data.fileName || '',
      fileSize: data.FileSize ?? data.fileSize ?? 0,
      mimeType: data.MimeType || data.mimeType,
      uploadedAt: data.UploadedAt || data.uploadedAt || '',
      createdAt: data.CreatedAt || data.createdAt || '',
      updatedAt: data.UpdatedAt || data.updatedAt || '',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching photo');
  }
}

export async function getPhotoNeighbors(id: string): Promise<PhotoNeighborsResponse> {
  try {
    const response = await fetch(`${API_URL}/api/photos/${id}/neighbors`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Photo not found');
      }
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch photo neighbors';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Map backend response to frontend interface (handle both PascalCase and camelCase)
    return {
      previousId: data.PreviousId || data.previousId || null,
      nextId: data.NextId || data.nextId || null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching photo neighbors');
  }
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




