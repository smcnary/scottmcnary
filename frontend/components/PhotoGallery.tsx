'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Photo, getPhotoUrl } from '@/lib/api';

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No photos available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo) => {
        const photoUrl = getPhotoUrl(photo);
        return (
          <Link
            key={photo.id}
            href={`/photos/${photo.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 hover:opacity-90 transition-opacity"
          >
            <Image
              src={photoUrl}
              alt={photo.title || photo.fileName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {photo.title && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                <p className="text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.title}
                </p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

