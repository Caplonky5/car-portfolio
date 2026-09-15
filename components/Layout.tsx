'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: 'https://www.instagram.com/shiftautography/', label: 'Instagram' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Shiftautography
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-900 font-semibold">Shiftautography</p>
              <p className="text-sm text-gray-600 mt-1">
                Automotive Photography Portfolio
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-sm text-gray-600">
              <p>
                <a
                  href="mailto:shiftautography@gmail.com"
                  className="hover:underline"
                >
                  shiftautography@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="https://www.instagram.com/shiftautography/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  @shiftautography on Instagram
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}