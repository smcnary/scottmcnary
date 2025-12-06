import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotos } from '@/lib/api';
import PaginationControls from '@/components/PaginationControls';

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Photo Gallery - Scott R. McNary',
  description: 'Browse photos in memory of Scott R. McNary',
};

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10) || 1;

  let paginatedResponse;
  try {
    paginatedResponse = await getPhotos(currentPage, 24);
  } catch (error) {
    console.error('Error fetching photos:', error);
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Photo Gallery
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            In memory of Scott R. McNary
          </p>
        </div>

        {paginatedResponse.photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No photos available yet.</p>
          </div>
        ) : (
          <>
            <PhotoGallery photos={paginatedResponse.photos} />
            <Suspense fallback={<div className="mt-8 text-center text-gray-600 dark:text-gray-400">Loading pagination...</div>}>
              <PaginationControls
                currentPage={paginatedResponse.page}
                totalPages={paginatedResponse.totalPages}
              />
            </Suspense>
          </>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

