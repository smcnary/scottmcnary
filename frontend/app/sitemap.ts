import { MetadataRoute } from 'next';
import { getPhotos } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  let photos = [];
  try {
    photos = await getPhotos();
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

