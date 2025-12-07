'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Photo, getPhotoUrl } from '@/lib/api';

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#666]">No photos available yet.</p>
      </div>
    );
  }

  const handleImageError = (photoId: string) => {
    setImageErrors((prev) => new Set(prev).add(photoId));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const photoUrl = getPhotoUrl(photo);
        const hasError = imageErrors.has(photo.id);
        
        return (
          <Link
            key={photo.id}
            href={`/photos/${photo.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[#f8fafc] hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
          >
            {hasError ? (
              <div className="w-full h-full flex items-center justify-center bg-[#e8ecf0]">
                <div className="text-center p-4">
                  <p className="text-[#888] text-sm mb-1">Image unavailable</p>
                  {photo.title && (
                    <p className="text-[#666] text-xs">{photo.title}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={photoUrl}
                  alt={photo.title || photo.fileName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={() => handleImageError(photo.id)}
                  loading="lazy"
                />
                {photo.title && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                    <p className="text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.title}
                    </p>
                  </div>
                )}
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}








