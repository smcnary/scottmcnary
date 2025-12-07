'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const searchParams = useSearchParams();
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return `/gallery${queryString ? `?${queryString}` : ''}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Link
          href={createPageUrl(currentPage - 1)}
          className={`px-4 py-2 rounded-md border transition-colors ${
            currentPage === 1
              ? 'bg-[#f8fafc] text-[#999] border-[#d0d7e2] cursor-not-allowed'
              : 'bg-white text-[#555] border-[#d0d7e2] hover:bg-[#f8fafc]'
          }`}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : 0}
        >
          Previous
        </Link>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-[#888]"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  isActive
                    ? 'bg-[#444] text-white border-[#444]'
                    : 'bg-white text-[#555] border-[#d0d7e2] hover:bg-[#f8fafc]'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next button */}
        <Link
          href={createPageUrl(currentPage + 1)}
          className={`px-4 py-2 rounded-md border transition-colors ${
            currentPage === totalPages
              ? 'bg-[#f8fafc] text-[#999] border-[#d0d7e2] cursor-not-allowed'
              : 'bg-white text-[#555] border-[#d0d7e2] hover:bg-[#f8fafc]'
          }`}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : 0}
        >
          Next
        </Link>
      </div>

      <div className="text-sm text-[#666]">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}





