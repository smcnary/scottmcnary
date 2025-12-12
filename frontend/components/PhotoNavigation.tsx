'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PhotoNavigationProps {
  previousId: string | null;
  nextId: string | null;
}

export default function PhotoNavigation({ previousId, nextId }: PhotoNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in an input, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle arrow key navigation
      if (event.key === 'ArrowLeft' && previousId) {
        event.preventDefault();
        router.push(`/photos/${previousId}`);
      } else if (event.key === 'ArrowRight' && nextId) {
        event.preventDefault();
        router.push(`/photos/${nextId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, previousId, nextId]);

  // This component doesn't render anything, it just handles keyboard events
  return null;
}

