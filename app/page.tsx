import { getAllSessions } from '@/lib/db';
import SessionCard from '@/components/SessionCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shiftautography Portfolio',
  description: 'Explore automotive photography shoots by Shiftautography',
};

export default async function Home() {
  const sessions = await getAllSessions();

  // Sort by created_at descending (newest first)
  const sortedSessions = sessions.slice().sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          Shiftautography Portfolio
        </h1>

        {sortedSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">No shoots yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}