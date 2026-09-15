import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Shiftautography',
  description: 'Learn more about Shiftautography and automotive photography',
};

export default function AboutPage() {
  // Placeholder bio - replace with your actual content
  const bio = `I'm a passionate automotive photographer based in [Your Location]. Specializing in capturing the essence and artistry of cars, I bring out the unique character of each vehicle through thoughtful composition and lighting. Whether it's a classic restoration, a modern supercar, or a personal project, I approach every shoot with the same dedication to quality and storytelling.

My journey in photography began with a fascination for automotive design and has evolved into a professional practice that combines technical precision with artistic vision. I believe every car has a story to tell, and my goal is to translate that narrative into compelling images that resonate with collectors, enthusiasts, and owners alike.`;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <p className="text-gray-600 text-lg">Automotive Photographer & Storyteller</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="prose prose-lg text-gray-700">
            <p className="whitespace-pre-wrap">{bio}</p>
            <p className="mt-6 text-sm text-gray-500">
              Feel free to reach out with any questions about my services, booking a session, or just to say hello!
            </p>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
            <Image
              src="/images/about-portrait.jpg"
              alt="Portrait of the photographer"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </main>
  );
}