'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClickToPlayYouTube } from './ClickToPlayYouTube';
import { generateActivitySlug } from '../services/activitiesService';

interface Activity {
  activity_id: string | number;
  title: string;
  description?: string;
  video_url: string;
}

interface ActivitiesClientProps {
  activities: Activity[];
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

function renderVideoEmbed(url: string, videoKey: string | number, activeVideoKey: string | number | null, setActiveVideoKey: (key: string | number | null) => void) {
  if (!url) return null;
  
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return (
      <ClickToPlayYouTube
        videoId={videoId}
        title="YouTube video player"
        isPlaying={activeVideoKey === videoKey}
        onPlay={() => setActiveVideoKey(activeVideoKey === videoKey ? null : videoKey)}
      />
    );
  }
  
  // Facebook
  if (url.includes('facebook.com')) {
    return (
      <iframe
        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`}
        width="100%"
        height="315"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        className="rounded-lg w-full aspect-video"
        title="Facebook video player"
      ></iframe>
    );
  }
  
  // Fallback
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Watch Video</a>;
}

export function ActivitiesClient({ activities }: ActivitiesClientProps) {
  const [activeVideoKey, setActiveVideoKey] = useState<string | number | null>(null);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {activities.map((activity, i) => (
        <Link key={activity.activity_id} href={`/activities/${generateActivitySlug(activity.title)}`}>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl hover:shadow-gray-300/60 hover:scale-[1.02] overflow-hidden group cursor-pointer h-full">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-md flex items-center justify-center mb-4">
              {renderVideoEmbed(activity.video_url, activity.activity_id || i, activeVideoKey, setActiveVideoKey)}
            </div>
            <div className="p-2 text-center">
              <h3 className="text-lg font-bold text-[#0f0f50] mb-1 font-Inter">{activity.title}</h3>
              {activity.description && <p className="text-gray-600 text-sm font-['Roboto'] mb-3">{activity.description}</p>}
              <span className="text-indigo-700 hover:text-indigo-900 font-semibold inline-block">View Details</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
