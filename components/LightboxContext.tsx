'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Photo } from '@/lib/db';

const EMPTY_PHOTOS: Photo[] = [];

interface LightboxContextType {
  isOpen: boolean;
  currentIndex: number;
  photos: Photo[];
  openAt: (index: number) => void;
  close: () => void;
  goNext: () => void;
  goPrev: () => void;
  setPhotos: (photos: Photo[]) => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

interface LightboxProviderProps {
  children: ReactNode;
  initialPhotos?: Photo[];
}

export function LightboxProvider({ children, initialPhotos = EMPTY_PHOTOS }: LightboxProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>(() => initialPhotos);

  const openAt = useCallback((index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
      setIsOpen(true);
    }
  }, [photos.length]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  return (
    <LightboxContext.Provider value={{ isOpen, currentIndex, photos, openAt, close, goNext, goPrev, setPhotos }}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
}