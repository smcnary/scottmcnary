import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPhoto, getPhotoUrl } from '@/lib/api';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const photo = await getPhoto(id);
    const photoUrl = getPhotoUrl(photo);
    
    return {
      title: photo.title || `Photo - ${photo.fileName}`,
      description: photo.description || `A memorial photo of Scott Roberts McNary`,
      keywords: photo.keywords || ['Scott Roberts McNary', 'memorial', 'photo'],
      openGraph: {
        title: photo.title || `Photo - ${photo.fileName}`,
        description: photo.description || `A memorial photo of Scott Roberts McNary`,
        images: [
          {
            url: photoUrl,
            width: 1200,
            height: 1200,
            alt: photo.title || photo.fileName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: photo.title || `Photo - ${photo.fileName}`,
        description: photo.description || `A memorial photo of Scott Roberts McNary`,
        images: [photoUrl],
      },
    };
  } catch {
    return {
      title: 'Photo Not Found',
    };
  }
}

export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  let photo;
  try {
    photo = await getPhoto(id);
  } catch {
    notFound();
  }

  const photoUrl = getPhotoUrl(photo);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: photo.title || photo.fileName,
    description: photo.description,
    contentUrl: photoUrl,
    keywords: photo.keywords?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-700">
              <Image
                src={photoUrl}
                alt={photo.title || photo.fileName}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <div className="p-6">
              {photo.title && (
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {photo.title}
                </h1>
              )}
              
              {photo.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                  {photo.description}
                </p>
              )}
              
              {photo.keywords && photo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {photo.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                <p>Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Gallery
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

