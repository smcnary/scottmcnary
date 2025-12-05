import { getPhotos, Photo } from '@/lib/api';
import PhotoGallery from '@/components/PhotoGallery';
import Link from 'next/link';

export default async function Home() {
  let photos: Photo[] = [];
  try {
    photos = await getPhotos();
  } catch (error) {
    console.error('Error fetching photos:', error);
  }

  return (
    <main className="min-h-screen">
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
            In Memory of Scott Roberts McNary
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Celebrating a life well-lived
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
          <Link
            href="/upload"
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Upload Photos
          </Link>
        </div>
        <PhotoGallery photos={photos} />
      </div>

      <footer className="mt-12 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Memorial Site</p>
      </footer>
    </main>
  );
}

