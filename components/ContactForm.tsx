'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  carType: z.string().optional(),
  eventType: z.string().optional(),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: () => void;
}

export default function ContactForm({ onSuccess, onError }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    // Check honeypot (should be empty)
    if (data.honeypot) {
      console.warn('Spam detected - honeypot filled');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          carType: data.carType || null,
          eventType: data.eventType || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        reset();
        onSuccess?.();
      } else {
        onError?.();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Tell me about your car, project, or question..."
        ></textarea>
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Optional fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="carType" className="block text-sm font-medium text-gray-700 mb-1">
            Car Type (optional)
          </label>
          <input
            {...register('carType')}
            id="carType"
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Classic, Supercar, Daily Driver"
          />
        </div>
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type (optional)
          </label>
          <input
            {...register('eventType')}
            id="eventType"
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Show, Meet, Personal Project"
          />
        </div>
      </div>

      {/* Honeypot for spam protection */}
      <div className="hidden">
        <label htmlFor="honeypot" className="sr-only">Leave empty</label>
        <input
          {...register('honeypot')}
          id="honeypot"
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300"
          placeholder=""
          autoComplete="off"
        />
      </div>

      {/* Submit button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  )}
