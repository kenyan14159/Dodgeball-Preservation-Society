"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

interface ImageData {
  url: string;
  id: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // R2 CDN URL Generation
    const loadImages = () => {
      const baseUrl = "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/dozzi";
      const totalImages = 1093;
      const urls: string[] = [];

      for (let i = 1; i <= totalImages; i++) {
        urls.push(`${baseUrl}${i}.JPEG`);
      }

      // Fisher-Yates shuffle
      for (let i = urls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [urls[i], urls[j]] = [urls[j], urls[i]];
      }

      const imageData: ImageData[] = urls.map((url, index) => ({
        url,
        id: `img-${index}`,
      }));

      setImages(imageData);
      setLoading(false);
    };

    // Short delay for smooth transition
    setTimeout(loadImages, 100);

  }, [mounted]);

  // Reshuffle
  const shuffleImages = () => {
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setImages(shuffled);
  };

  // Lightbox key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  if (!mounted) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest uppercase animate-pulse">GALLERY</h1>
          <p className="mt-2 text-xs font-mono tracking-[0.3em] text-[var(--muted-foreground)]">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--card)] border border-[var(--border)] px-6 py-4 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="underline mt-2">Reload</button>
        </div>
      )}

      <Header currentPath="/gallery" />

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 pt-32">
        {/* Title Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                GALLERY
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-12 h-px bg-[var(--foreground)] opacity-20" />
                <span className="text-sm font-mono text-[var(--muted-foreground)]">
                  {images.length} PHOTOS
                </span>
              </div>
            </div>

            <button
              onClick={shuffleImages}
              className="px-6 py-2 border border-[var(--border)] rounded-full font-mono uppercase tracking-widest text-xs hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
            >
              Shuffle
            </button>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)] text-lg">No Images Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className="group relative aspect-square overflow-hidden bg-[var(--secondary)] cursor-pointer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom Nav */}
        <div className="mt-24 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt="Full size"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
