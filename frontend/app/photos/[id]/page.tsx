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
      <div className="max-w-[900px] mx-auto px-4 pb-12">
        <div className="bg-white/90 rounded-2xl shadow-lg backdrop-blur-[10px] overflow-hidden mt-10">
          <div className="relative aspect-video w-full bg-[#f8fafc]">
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
              <h1 className="text-[1.8rem] mb-4 uppercase tracking-[0.08em] text-[#444] font-normal m-0">
                {photo.title}
              </h1>
            )}
            
            {photo.description && (
              <p className="leading-[1.7] mb-4 text-[#333] whitespace-pre-line m-0">
                {photo.description}
              </p>
            )}
            
            {photo.keywords && photo.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {photo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-sm text-[#777] mt-4">
              <p>Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/gallery"
            className="text-blue-600 hover:underline text-[0.85rem]"
          >
            ← Back to Gallery
          </a>
        </div>
      </div>
    </>
  );
}

