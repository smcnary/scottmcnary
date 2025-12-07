import { Metadata } from 'next';
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
  let error: string | null = null;
  
  try {
    paginatedResponse = await getPhotos(currentPage, 24);
  } catch (err) {
    console.error('Error fetching photos:', err);
    error = err instanceof Error ? err.message : 'An error occurred while loading photos';
    paginatedResponse = null;
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 pb-12">
      <header className="text-center pt-10 px-4 pb-6">
        <h1 className="text-[2.1rem] tracking-[0.06em] uppercase m-0 font-normal text-[#444]">
          Photo Gallery
        </h1>
        <div className="text-base my-2 text-[#555]">
          In memory of Scott R. McNary
        </div>
      </header>

      <div 
        className="h-px bg-gradient-to-r from-transparent via-[#c1c7d0] to-transparent my-8"
        aria-hidden="true"
      />

      {error ? (
        <div className="bg-white/90 rounded-2xl p-8 shadow-lg backdrop-blur-[10px] text-center">
          <h2 className="text-[1.3rem] mb-3 uppercase tracking-[0.12em] text-[#444] font-normal m-0">
            Unable to Load Photos
          </h2>
          <p className="text-[#666] mb-4 leading-[1.7]">
            {error}
          </p>
          <div className="text-sm text-[#777] space-y-2">
            <p>Please check:</p>
            <ul className="list-none text-left max-w-md mx-auto space-y-1">
              <li>• The backend API is running and accessible</li>
              <li>• The API URL is correctly configured</li>
              <li>• Your network connection is working</li>
              <li>• CORS is properly configured on the backend</li>
            </ul>
            <p className="mt-4">If the problem persists, try refreshing the page.</p>
          </div>
        </div>
      ) : paginatedResponse && paginatedResponse.photos.length === 0 ? (
        <div className="bg-white/90 rounded-2xl p-8 shadow-lg backdrop-blur-[10px] text-center">
          <p className="text-[#666] leading-[1.7] mb-0">
            No photos available yet. Check back soon for memories and photos of Scott.
          </p>
        </div>
      ) : paginatedResponse ? (
        <>
          <PhotoGallery photos={paginatedResponse.photos} />
          <Suspense fallback={<div className="mt-8 text-center text-[#666]">Loading pagination...</div>}>
            <PaginationControls
              currentPage={paginatedResponse.page}
              totalPages={paginatedResponse.totalPages}
            />
          </Suspense>
        </>
      ) : null}

      <footer className="text-center text-[0.85rem] text-[#777] mt-8">
        <p>
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </p>
      </footer>
    </div>
  );
}

