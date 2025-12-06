import { MetadataRoute } from 'next';
import { getPhotos, Photo } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  let photos: Photo[] = [];
  try {
    // Fetch all photos for sitemap - use a large page size to get all photos
    // If there are more than 1000 photos, we'd need to paginate, but for now this should work
    const response = await getPhotos(1, 1000);
    photos = response.photos;
  } catch (error) {
    console.error('Error fetching photos for sitemap:', error);
  }

  const photoEntries = photos.map((photo) => ({
    url: `${baseUrl}/photos/${photo.id}`,
    lastModified: new Date(photo.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...photoEntries,
  ];
}




