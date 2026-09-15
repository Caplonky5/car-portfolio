import { Metadata } from 'next';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'Shiftautography',
  description: 'Automotive photography portfolio by Shiftautography',
  openGraph: {
    type: 'website',
    url: 'https://your-domain.com', // Update with your actual domain
    title: 'Shiftautography',
    description: 'Automotive photography portfolio by Shiftautography',
    images: [
      {
        url: 'https://your-domain.com/images/og-image.jpg', // Add OG image path
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiftautography',
    description: 'Automotive photography portfolio by Shiftautography',
    images: ['https://your-domain.com/images/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}