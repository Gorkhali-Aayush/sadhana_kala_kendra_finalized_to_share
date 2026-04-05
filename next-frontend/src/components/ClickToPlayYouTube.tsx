'use client';

import React, { useRef, useEffect, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  isPlaying: boolean;
  onPlay: () => void;
}

export function ClickToPlayYouTube({ videoId, title, isPlaying, onPlay }: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      setIsPaused(false);
    }
  }, [isPlaying]);

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

  if (!videoId) return null;

  if (isPlaying) {
    return (
      <div className="relative h-full w-full">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="rounded-lg w-full aspect-video pointer-events-none"
        ></iframe>

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
              onPlay();
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
      onClick={onPlay}
      className="group relative h-full w-full overflow-hidden rounded-lg"
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={`${title} thumbnail`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
