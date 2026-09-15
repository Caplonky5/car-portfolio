import { getSessionBySlug, getPhotosBySessionId } from '@/lib/db';
import { Metadata } from 'next';
import Image from 'next/image';
import Lightbox from '@/components/Lightbox';

type SessionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);
  if (!session) return {};

  const coverPhotoId = session.cover_asset_id;
  const coverPhotoUrl = coverPhotoId
    ? `https://your-domain.com/api/image/${coverPhotoId}?size=thumbnail`
    : 'https://your-domain.com/images/default-og.jpg';

  return {
    title: `${session.title} | Shiftautography`,
    description: session.description || 'Automotive photography session by Shiftautography',
    openGraph: {
      title: session.title,
      description: session.description || 'Automotive photography session by Shiftautography',
      images: [
        {
          url: coverPhotoUrl,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: session.title,
      description: session.description || 'Automotive photography session by Shiftautography',
      images: [coverPhotoUrl],
    },
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <p className="text-red-500 text-center">Session not found</p>
      </main>
    );
  }

  const photos = await getPhotosBySessionId(session.id);

  // Sort photos by taken_at ascending (oldest first for chronological viewing)
  const sortedPhotos = photos.slice().sort((a, b) =>
    new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
  );

  // Format the date range for the session header
  const startDate = new Date(session.started_at);
  const endDate = session.ended_at
    ? new Date(session.ended_at)
    : new Date(session.started_at); // fallback to start date if no end date

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const dateRange =
    startDate.toDateString() === endDate.toDateString()
      ? formatDate(startDate)
      : `${formatDate(startDate)} – ${formatDate(endDate)}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold">{session.title}</h1>
            {session.car_name && (
              <p className="text-lg text-gray-600">{session.car_name}</p>
            )}
            <p className="text-gray-500">{dateRange}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {sortedPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No photos in this session yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedPhotos.map((photo) => (
                <div key={photo.id} className="relative group overflow-hidden rounded-lg bg-white shadow-sm">
                  <Image
                    src={`/api/image/${photo.immich_asset_id}?size=thumbnail`}
                    alt={session.title}
                    width={600}
                    height={400}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-lg font-semibold">View Photo</span>
                  </div>
                </div>
              ))}
            </div>
            <Lightbox photos={sortedPhotos} />
          </>
        )}
      </div>
    </main>
  );
}