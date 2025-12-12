'use client';

import Link from 'next/link';

interface PhotoNavigationButtonsProps {
  previousId: string | null;
  nextId: string | null;
}

export default function PhotoNavigationButtons({ previousId, nextId }: PhotoNavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center gap-4 mt-6">
      {previousId ? (
        <Link
          href={`/photos/${previousId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 hover:bg-white border border-[#d0d7e2] text-[#555] hover:text-[#333] transition-colors shadow-sm hover:shadow-md text-sm uppercase tracking-[0.08em]"
        >
          <span>←</span>
          <span>Previous</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      
      {nextId ? (
        <Link
          href={`/photos/${nextId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 hover:bg-white border border-[#d0d7e2] text-[#555] hover:text-[#333] transition-colors shadow-sm hover:shadow-md text-sm uppercase tracking-[0.08em]"
        >
          <span>Next</span>
          <span>→</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

