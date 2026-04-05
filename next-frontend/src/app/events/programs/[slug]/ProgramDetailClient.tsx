"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SafeHTML from "@/components/SafeHTML";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Program {
  id?: number;
  program_id?: number;
  title?: string;
  program_name?: string;
  slug?: string;
  description?: string;
  program_description?: string;
  rich_content?: string;
  image_url?: string;
  feature_image?: string;
  program_date?: string;
  date?: string;
  created_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface ProgramResource {
  resource_id: number;
  program_id: number;
  resource_type: 'image' | 'youtube';
  resource_url: string;
  caption?: string;
  sort_order?: number;
}

function getYouTubeId(url: string) {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split(/[?&]/)[0];
  } else if (url.includes('/embed/')) {
    return url.split('/embed/')[1].split(/[?&]/)[0];
  } else if (url.includes('/shorts/')) {
    return url.split('/shorts/')[1].split(/[?&]/)[0];
  } else if (url.includes('/live/')) {
    return url.split('/live/')[1].split(/[?&]/)[0];
  } else {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : '';
  }
}

function ProgramVideoPlayer({ videoUrl, title, resourceId, activeVideoId, onVideoPlay }: { videoUrl: string; title: string; resourceId: number; activeVideoId: number | null; onVideoPlay: (id: number) => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPlaying = activeVideoId === resourceId;

  const sendYouTubeCommand = (command: string) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: command,
        args: [],
      }),
      '*'
    );
  };

  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  if (isPlaying) {
    return (
      <div className="relative w-full bg-black rounded-2xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
        <iframe
          ref={iframeRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isPaused) {
                sendYouTubeCommand('playVideo');
                setIsPaused(false);
              } else {
                sendYouTubeCommand('pauseVideo');
                setIsPaused(true);
              }
            }}
            className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1f2a44] shadow-md hover:bg-white transition"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sendYouTubeCommand('stopVideo');
              setIsPaused(false);
              onVideoPlay(null as any);
            }}
            className="rounded-full bg-[#cf0408] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md hover:bg-red-700 transition"
          >
            Stop
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onVideoPlay(resourceId)}
      className="group relative w-full overflow-hidden rounded-2xl"
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={`${title} thumbnail`}
        className="w-full object-cover rounded-2xl"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45 rounded-2xl" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}

export default function ProgramDetailClient({ program, resources }: { program: Program; resources: ProgramResource[] }) {
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    if (selectedImageIndex !== null) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedImageIndex]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  const imageResources = resources.filter(r => r.resource_type === 'image');
  const videoResources = resources.filter(r => r.resource_type === 'youtube');

  // Create combined images list for modal
  const allImages = [
    ...(program.image_url || program.feature_image ? [{
      type: 'featured',
      url: program.image_url || program.feature_image || '',
      caption: program.title || program.program_name || 'Program image'
    }] : []),
    ...imageResources.map(r => ({
      type: 'gallery',
      url: r.resource_url,
      caption: r.caption || 'Gallery image'
    }))
  ];

  const handlePrevious = () => {
    setSelectedImageIndex(prev => 
      prev === null ? 0 : prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex(prev => 
      prev === null ? 0 : prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const programTitle = program.title || program.program_name || 'Program';
  const programDescription = program.description || program.program_description || '';

  return (
    <section className="py-12 md:py-16 bg-gray-50 font-Roboto">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition"
        >
          <span className="mr-2">←</span> Back to Events
        </Link>

        {/* Program Article */}
        <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {program.image_url || program.feature_image ? (
            <button
              type="button"
              onClick={() => setSelectedImageIndex(0)}
              className="w-full h-80 overflow-hidden bg-gray-200 hover:opacity-90 transition cursor-pointer"
              aria-label="Click to view full image"
            >
              <img
                src={getFullImageUrl(program.image_url || program.feature_image || "")}
                alt={programTitle}
                className="w-full h-full object-contain"
              />
            </button>
          ) : null}

          {/* Content */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#191938] mb-4 font-Inter">
              {programTitle}
            </h1>

            {/* Date */}
            {(program.program_date || program.date || program.created_at) && (
              <p className="text-gray-500 text-sm mb-6">
                {new Date(program.program_date || program.date || program.created_at || '').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}

            {/* Description */}
            {programDescription && (
              <div className="mb-8">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {programDescription}
                </p>
              </div>
            )}

            {/* Rich Content */}
            {program.rich_content ? (
              <div className="mb-12">
                <SafeHTML 
                  html={program.rich_content}
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            ) : null}

            {/* Additional Images */}
            {imageResources.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#191938] mb-6">Program Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {imageResources.map((resource, idx) => (
                    <button
                      key={resource.resource_id}
                      type="button"
                      onClick={() => {
                        const imageIndex = (program.image_url || program.feature_image ? 1 : 0) + idx;
                        setSelectedImageIndex(imageIndex);
                      }}
                      className="w-full overflow-hidden rounded-2xl shadow-xl bg-white group cursor-pointer transform hover:scale-[1.02] transition-all duration-300 relative border-0 p-0"
                    >
                      {/* Gallery Image */}
                      <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 overflow-hidden">
                        <img
                          src={getFullImageUrl(resource.resource_url)}
                          alt={resource.caption || "Gallery image"}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-85"
                          loading="lazy"
                        />
                      </div>

                      {/* Caption Overlay */}
                      {resource.caption && (
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white font-semibold text-sm truncate">
                            {resource.caption}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Videos */}
            {videoResources.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#191938] mb-6">Program Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videoResources.map((resource) => (
                    <div key={resource.resource_id}>
                      <ProgramVideoPlayer 
                        videoUrl={resource.resource_url} 
                        title={resource.caption || "Video"} 
                        resourceId={resource.resource_id}
                        activeVideoId={activeVideoId}
                        onVideoPlay={setActiveVideoId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/events"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition"
              >
                <span className="mr-2">←</span> Back to Events
              </Link>
            </div>

            {/* CTA */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/register"
                className="flex-1 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition"
              >
                Register Now
              </Link>
              <Link
                href="/events"
                className="flex-1 inline-flex items-center justify-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-full transition"
              >
                Back to Events
              </Link>
            </div>
          </div>
        </article>

        {/* Image Modal */}
        {selectedImageIndex !== null && allImages[selectedImageIndex] && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div
              className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white text-3xl font-light p-2 w-10 h-10 flex items-center justify-center bg-red-600/80 rounded-full hover:bg-red-600 transition z-10 shadow-lg"
                onClick={() => setSelectedImageIndex(null)}
                aria-label="Close image viewer"
              >
                &times;
              </button>

              {/* Header with Title */}
              <div className="text-center py-4 border-b border-white/10">
                <h2 className="text-white text-xl font-bold">{programTitle}</h2>
                <p className="text-white/60 text-sm">
                  Image {selectedImageIndex + 1} of {allImages.length}
                </p>
              </div>

              {/* Main Image */}
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={getFullImageUrl(allImages[selectedImageIndex].url)}
                    alt={allImages[selectedImageIndex].caption}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between py-4 px-4 border-t border-white/10">
                <button
                  onClick={handlePrevious}
                  className="text-white bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg font-semibold"
                >
                  ← Previous
                </button>

                {/* Image Counter */}
                <span className="text-white/60 text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </span>

                <button
                  onClick={handleNext}
                  className="text-white bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg font-semibold"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
