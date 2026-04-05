'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

import { getImageUrl } from '@/utils/helpers';

interface Artist {
  artist_id?: number;
  full_name: string;
  bio?: string;
  profile_image?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface ArtistDetailClientProps {
  artist: Artist | null;
  error: string | null;
  slug: string;
}

export default function ArtistDetailClient({
  artist,
  error,
  slug,
}: ArtistDetailClientProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Artist Not Found"
            description={error || "The artist you are looking for does not exist."}
          />
          <Link
            href="/artists"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Artists
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(artist.profile_image);

  return (
    <section className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 font-Roboto">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/artists"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition"
        >
          <span className="mr-2">←</span> Back to all artists
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Profile Image */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <img
                  src={imageUrl}
                  alt={artist.full_name}
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full text-center bg-[#cf0408] hover:bg-[#a90306] text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Discover Activities
                </Link>
                <Link
                  href="/artists"
                  className="block w-full text-center border-2 border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  View More Artists
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Artist Info */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              {/* Name */}
              <h1 className="text-4xl md:text-5xl font-bold text-[#191938] mb-2 font-Inter">
                {artist.full_name}
              </h1>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm">
                  🎭 Professional Artist
                </span>
              </div>

              {/* Divider */}
              <hr className="my-6 border-slate-200" />

              {/* Bio Section */}
              {artist.bio && (
                <div className="mb-8">
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                    {artist.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
