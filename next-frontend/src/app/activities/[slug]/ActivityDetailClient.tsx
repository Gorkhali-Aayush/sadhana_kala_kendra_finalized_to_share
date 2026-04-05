'use client';

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";

interface Activity {
  activity_id?: number;
  title: string;
  description?: string;
  video_url?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
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

function ActivityVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
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
            onClick={() => {
              sendYouTubeCommand('stopVideo');
              setIsPaused(false);
              setIsPlaying(false);
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
      onClick={() => setIsPlaying(true)}
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

export default function ActivityDetailClient({
  activity: initialActivity,
  error: initialError,
  slug,
}: {
  activity: Activity | null;
  error: string | null;
  slug: string;
}) {
  const [activity, setActivity] = useState<Activity | null>(initialActivity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <PageLoader message="Loading activity details..." />;
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Activity Not Found"
            description={error || "The activity you are looking for does not exist."}
          />
          <Link
            href="/activities"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50 font-Roboto">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/activities"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition"
        >
          <span className="mr-2">←</span> Back to all activities
        </Link>

        {/* Activity Header */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#191938] mb-4 font-Inter">
              {activity.title}
            </h1>
            <div className="text-gray-600 mb-8 text-lg leading-relaxed whitespace-pre-wrap">
              {activity.description || "No description available"}
            </div>

            {/* Video Section */}
            {activity.video_url && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#191938] mb-4 font-Inter">Activity Video</h2>
                <ActivityVideoPlayer videoUrl={activity.video_url} title={activity.title} />
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Link
                href="/register"
                className="flex-1 inline-flex items-center justify-center bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
              >
                Join this Activity
              </Link>
              <Link
                href="/activities"
                className="flex-1 inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
              >
                Explore More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
