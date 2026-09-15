'use client';

import Image from 'next/image';
import { useLightbox } from './LightboxContext';
import { Photo } from '@/lib/db';

interface PhotoGridItemProps {
  photo: Photo;
  index: number;
  total: number;
}

export default function PhotoGridItem({ photo, index, total }: PhotoGridItemProps) {
  const { openAt } = useLightbox();

  return (
    <button
      type="button"
      onClick={() => openAt(index)}
      className="relative group overflow-hidden rounded-lg bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Open photo ${index + 1} of ${total}`}
    >
      <Image
        src={`/api/image/${photo.immich_asset_id}?size=thumbnail`}
        alt={`Photo ${index + 1}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-300 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white opacity-0 group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
    </button>
  );
}