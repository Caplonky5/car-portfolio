'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Photo } from '@/lib/db';

interface LightboxProps {
  photos: Photo[];
}

export default function Lightbox({ photos }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || photos.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev + 1) % photos.length);
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, photos]);

  if (!isOpen || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex] ?? photos[0];
  if (!currentPhoto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
    >
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {photos.length > 1 && (
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
          className="absolute left-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Previous photo"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
          className="absolute right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Next photo"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] px-4">
        <Image
          src={`/api/image/${currentPhoto.immich_asset_id}?size=original`}
          alt={`Photo ${currentIndex + 1}`}
          width={currentPhoto.width || 1920}
          height={currentPhoto.height || 1080}
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs hidden md:block">
        Use arrow keys to navigate
      </div>
    </div>
  );
}