import Image from 'next/image';
import Link from 'next/link';
import { getPhotosBySessionId } from '@/lib/db';
import { Photo } from '@/lib/db';

type SessionCardProps = {
  session: {
    id: string;
    slug: string;
    title: string;
    car_name?: string | null;
    description?: string | null;
    cover_asset_id?: string | null;
    started_at: string;
    ended_at?: string | null;
    created_at: string;
  };
};

export default async function SessionCard({ session }: SessionCardProps) {
  // Fetch the cover photo for this session if we have a cover_asset_id
  let coverPhoto: Photo | null = null;
  if (session.cover_asset_id) {
    const photos = await getPhotosBySessionId(session.id);
    // Find the photo with the matching immich_asset_id
    coverPhoto = photos.find(p => p.immich_asset_id === session.cover_asset_id) || null;
  }

  // Format the date from started_at (assuming ISO string)
  const startDate = new Date(session.started_at);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/sessions/${session.slug}`} className="group block overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-w-4 aspect-h-3">
        {coverPhoto ? (
          <Image
            src={`/api/image/${coverPhoto.immich_asset_id}?size=thumbnail`}
            alt={session.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          // Placeholder when no cover photo
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-gray-500">No cover</span>
          </div>
        )}
        {/* Overlay for session info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex flex-col justify-end">
          <h2 className="text-white font-semibold text-lg mb-1">{session.title}</h2>
          {session.car_name && (
            <p className="text-white/80 text-sm">{session.car_name}</p>
          )}
          <p className="text-white/70 text-xs mt-2">{formattedDate}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-gray-600 text-sm line-clamp-2">
          {session.description || 'No description available'}
        </p>
      </div>
    </Link>
  );
}