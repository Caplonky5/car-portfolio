import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact Shiftautography',
  description: 'Get in touch with Shiftautography for automotive photography services',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-600 text-lg">
            Have a question about my services? Ready to book a session? I&apos;d love to hear from you!
          </p>
        </header>

        <ContactForm />

      </div>
    </main>
  );
}