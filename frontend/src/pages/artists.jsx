import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllArtists } from "../admin/services/artistsService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

const SERVER_BASE_URL = SERVER_ROOT_URL;
const ARTIST_IMAGE_FALLBACK = "https://via.placeholder.com/300x400?text=Artist+Image";

const Artists = () => {
  const [artistsList, setArtistsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllArtists();
      setArtistsList(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch artists:", err);
      setError("Failed to load artists. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArtists();
  }, [fetchArtists]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ARTIST_IMAGE_FALLBACK;

    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${SERVER_BASE_URL}${normalizedPath}`;
  };

  const seoProps = {
    title: "Featured Artists and Alumni | Sadhana Kala Kendra",
    description:
      "Discover featured artists and alumni of Sadhana Kala Kendra, showcasing performance journeys, creative achievements, and training rooted in Nepali arts.",
    keywords:
      "Sadhana Kala Kendra artists, music school alumni, featured performers Nepal, artist profiles, performing arts alumni",
    canonicalPath: "/artists",
  };

  if (loading) {
    return (
      <>
        <Seo {...seoProps} />
        <PageLoader message="Loading artists content..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Seo {...seoProps} />
        <section className="py-20 bg-gray-50 min-h-screen">
          <div className="text-center text-xl text-red-600">{error}</div>
        </section>
      </>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <Seo {...seoProps} />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* ===== PAGE HEADER ===== */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
            Pride of{" "}
            <span className="text-red-600 font-['Playfair_Display']">
              Sadhana Kala Kendra
            </span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
            Celebrating the talented artists who began their journey with us.
          </p>
        </div>

        {/* ===== ARTISTS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artistsList.length > 0 ? (
            artistsList.map((artist) => {
              const cardContent = (
                <>
                  {/* IMAGE */}
                  <div className="overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(artist.profile_image)}
                      alt={artist.full_name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = ARTIST_IMAGE_FALLBACK;
                      }}
                      className="w-full h-56 object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-8">
                    <h3 className="text-2xl font-semibold text-[#191938] mb-3 text-center font-['Playfair Display']">
                      {artist.full_name}
                    </h3>

                    {artist.stage_name && (
                      <p className="text-gray-600 font-['Roboto'] text-center">
                        {artist.stage_name}
                      </p>
                    )}
                  </div>
                </>
              );

              return artist.slug ? (
                <Link
                  key={artist.artist_id}
                  to={`/artists/${artist.slug}`}    
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
