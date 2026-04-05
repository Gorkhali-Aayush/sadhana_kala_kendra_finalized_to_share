"use client";
import React, { useState, useEffect } from "react";
import { type Gallery, type GalleryImage } from "@/services/galleryService";
import { getApiUrl } from "@/config/api";
import { buildImageUrl } from "@/utils/helpers";

export default function GalleryClient({ items }: { items: Gallery[] }) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedGallery(null);
        setCurrentImageIndex(0);
      }
    };

    if (selectedGallery) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedGallery]);

  // Create a combined list: thumbnail first, then collection images
  const getDisplayImages = () => {
    if (!selectedGallery) return [];
    const combined: (GalleryImage | { isThumbnail: true; image_url: string })[] = [];
    
    // Add thumbnail as first item if it exists
    if (selectedGallery.thumbnail_image_url) {
      combined.push({
        isThumbnail: true,
        image_url: selectedGallery.thumbnail_image_url
      });
    }
    
    // Add all collection images
    if (selectedGallery.images) {
      combined.push(...selectedGallery.images);
    }
    
    return combined;
  };

  const displayImages = getDisplayImages();
  const totalImages = displayImages.length;

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? totalImages - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === totalImages - 1 ? 0 : prev + 1
    );
  };

  const currentImage = displayImages[currentImageIndex];
  const isThumbnailShown = currentImage && 'isThumbnail' in currentImage && currentImage.isThumbnail === true;

  return (
    <>
      {/* Gallery Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((gallery) => (
          <button
            key={gallery.gallery_id}
            onClick={() => {
              setSelectedGallery(gallery);
              setCurrentImageIndex(0);
            }}
            className="w-full overflow-hidden rounded-2xl shadow-xl bg-white group cursor-pointer transform hover:scale-[1.02] transition-all duration-300 relative border-0 p-0"
          >
            {/* Thumbnail Image */}
            <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 overflow-hidden">
              <img
                src={buildImageUrl(gallery.thumbnail_image_url)}
                alt={gallery.title}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-85"
              />
            </div>

            {/* Gallery Info Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-white font-semibold text-sm truncate">
                {gallery.title}
              </h3>
              <p className="text-white/80 text-xs">
                {gallery.image_count} {gallery.image_count === 1 ? "image" : "images"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Full Screen Image Viewer Modal */}
      {selectedGallery && currentImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedGallery(null);
            setCurrentImageIndex(0);
          }}
        >
          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-3xl font-light p-2 w-10 h-10 flex items-center justify-center bg-red-600/80 rounded-full hover:bg-red-600 transition z-10 shadow-lg"
              onClick={() => {
                setSelectedGallery(null);
                setCurrentImageIndex(0);
              }}
              aria-label="Close image viewer"
            >
              &times;
            </button>

            {/* Header with Gallery Title */}
            <div className="text-center py-4 border-b border-white/10">
              <h2 className="text-white text-xl font-bold">{selectedGallery.title}</h2>
              <p className="text-white/60 text-sm">
                {isThumbnailShown ? "Thumbnail" : `Image ${currentImageIndex} of ${totalImages}`}
              </p>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
              <img
                src={buildImageUrl(currentImage.image_url)}
                alt={selectedGallery.title}
                loading="lazy"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Navigation Controls */}
            {totalImages > 1 && (
              <div className="flex items-center justify-between py-4 px-4 border-t border-white/10">
                <button
                  onClick={handlePrevious}
                  className="text-white bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg font-semibold"
                >
                  ← Previous
                </button>

                {/* Image Counter */}
                <span className="text-white/60 text-sm">
                  {currentImageIndex + 1} / {totalImages}
                </span>

                <button
                  onClick={handleNext}
                  className="text-white bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg font-semibold"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
