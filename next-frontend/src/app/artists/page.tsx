"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getArtists, type Artist } from "../../services/artistsService";
import { getApiUrl } from "../../config/api";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import { getImageUrl, getImagePlaceholder } from "../../utils/helpers";

const ARTIST_IMAGE_FALLBACK = getImagePlaceholder("Artist+Image");

const Artists = () => {
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArtists();
      setArtistsList(data);
    } catch (err) {
      setError("Failed to load artists. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArtists();
  }, [fetchArtists]);

  if (loading) {
    return <PageLoader message="Loading artists content..." />;
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 min-h-screen">
        <div className="text-center text-xl text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 font-Roboto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">
            Pride of <span className="text-red-600 font-Inter">Sadhana Kala Kendra</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-Roboto">
            Celebrating the talented artists who began their journey with us.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {artistsList.length > 0 ? (
            artistsList.map((artist) => {
              const cardContent = (
                <>
                  <div className="overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(artist.profile_image)}
                      alt={artist.full_name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = ARTIST_IMAGE_FALLBACK;
                      }}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-[#191938] mb-3 font-Inter">{artist.full_name}</h3>
                    {artist.stage_name && (
                      <p className="text-gray-600 font-Roboto">
                        {artist.stage_name}
                      </p>
                    )}
                    <span className="inline-block mt-3 text-indigo-700 font-semibold hover:text-indigo-900">
                      View Details
                    </span>
                  </div>
                </>
              );
              return artist.slug ? (
                <Link
                  key={artist.artist_id}
                  href={`/artists/${artist.slug}`}
                  className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden text-left"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={artist.artist_id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden text-left"
                >
                  {cardContent}
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No Artists Found"
              description="Check back soon for featured artists and alumni updates."
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Artists;
