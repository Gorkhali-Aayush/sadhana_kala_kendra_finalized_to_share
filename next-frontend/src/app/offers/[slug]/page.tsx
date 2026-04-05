import React from "react";
import { getOfferBySlug } from "../../../services/offersService";
import { notFound } from "next/navigation";
import DetailPageLayout from "../../../components/DetailPageLayout";

import { buildImageUrl, normalizeCtaUrl, formatDateOnly } from "../../../utils/helpers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug).catch(() => null);
  if (!offer) return { title: "Offer Not Found" };
  return {
    title: `${offer.title} | Sadhana Kala Kendra`,
    description: offer.description?.substring(0, 160),
  };
}

export default async function OfferDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug).catch(() => null);

  if (!offer) {
    notFound();
  }

  const stats = [
    {
      label: "Status",
      value: "Active Offer",
    },
  ];

  const actions = (
    <>
      {offer.cta_link ? (
        <a
          href={normalizeCtaUrl(offer.cta_link)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition"
        >
          {offer.cta_text || "Know More"}
        </a>
      ) : null}
    </>
  );

  return (
    <DetailPageLayout
      backTo="/offers"
      backLabel="Back to all offers"
      imageSrc={buildImageUrl(offer.image_url || "")}
      imageAlt={offer.title}
      title={offer.title}
      description={offer.description || "Offer details will be updated soon."}
      stats={stats}
      actions={actions}
    />
  );    
}
