"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  fallback?: string;
}

// 🔑 Safe images — empty string / whitespace sob filter
const getSafeImages = (images: string[] | null | undefined): string[] => {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img) => typeof img === "string" && img.trim().length > 0
  );
};

export function ProductGallery({
  images,
  productName,
  fallback,
}: ProductGalleryProps) {
  // Filter valid images
  const safeImages = getSafeImages(images);

  // Fallback safe
  const safeFallback =
    typeof fallback === "string" && fallback.trim().length > 0
      ? fallback
      : null;

  // Gallery — safe images or [safeFallback] or []
  const gallery =
    safeImages.length > 0
      ? safeImages
      : safeFallback
      ? [safeFallback]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex];

  // ✅ No images — show placeholder
  if (gallery.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="h-12 w-12" />
            <p className="text-xs">No image available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            {/* ✅ Guard — activeImage jodi falsy hoy, kichu render korbo na */}
            {activeImage && activeImage.trim().length > 0 ? (
              <Image
                src={activeImage}
                alt={productName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                idx === activeIndex
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* ✅ Guard */}
              {img && img.trim().length > 0 ? (
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}