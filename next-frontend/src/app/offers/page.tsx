"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicOffers } from "../../services/offersService";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import { buildImageUrl, normalizeCtaUrl, formatDateOnly } from "../../utils/helpers";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicOffers()
      .then(setOffers)
      .catch(() => setError("Failed to load offers."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading offers..." />;

  return (
    <section className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] font-['Inter']">
            Special <span className="text-red-600">Offers</span>
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-3xl mx-auto font-['Roboto']">
            Explore ongoing offers and limited-time opportunities at Sadhana Kala Kendra.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center mb-8">
            {error}
          </div>
        )}

        {offers.length === 0 ? (
          <EmptyState
            title="No Offers Found"
            description="No active offers are available right now."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {offers.map((offer: any) => (
              <article
                key={offer.offer_id}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col"
              >
                <div className="h-52 bg-gray-100 overflow-hidden">
                  {offer.image_url ? (
                    <img
                      src={buildImageUrl(offer.image_url)}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-[#191938] mb-1 font-['Inter'] line-clamp-2">{offer.title}</h2>
                  {offer.subtitle && (
                    <p className="text-sm font-semibold text-red-600 mb-3 line-clamp-1">{offer.subtitle}</p>
                  )}
                  {(offer.valid_from || offer.valid_to) && (
                    <p className="text-xs text-gray-500 mb-2 font-['Roboto']">
                      Valid: {formatDateOnly(offer.valid_from) || "Any"} to {formatDateOnly(offer.valid_to) || "Any"}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 font-['Roboto'] flex-1">
                    {offer.description || "Offer details will be updated soon."}
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    {offer.slug && (
                      <Link
                        href={`/offers/${offer.slug}`}
                        className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 font-semibold hover:bg-indigo-50 transition"
                      >
                        View Detail Page
                      </Link>
                    )}

                    {offer.cta_link && (
                      <a
                        href={normalizeCtaUrl(offer.cta_link)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                      >
                        {offer.cta_text || "Know More"}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
