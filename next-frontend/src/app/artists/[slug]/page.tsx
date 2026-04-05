import { Metadata } from "next";
import { getArtistBySlug } from "@/services/artistsService";
import ArtistDetailClient from "./ArtistDetailClient";

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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const artist = await getArtistBySlug(slug);

    if (!artist) {
      return {
        title: "Artist Not Found",
        robots: { index: false },
      };
    }

    const baseUrl = "https://www.sadhanakalakendra.com";
    const canonicalUrl = `${baseUrl}/artists/${artist.slug || slug}`;

    return {
      title: artist.seo_title || artist.full_name,
      description: artist.seo_description || artist.bio || `Meet ${artist.full_name}, acclaimed artist performing at Sadhana Kala Kendra`,
      keywords: artist.seo_keywords || "classical artist, performer, dance, music",
      openGraph: {
        title: artist.seo_title || artist.full_name,
        description: artist.seo_description || artist.bio || `Meet ${artist.full_name}, acclaimed artist performing at Sadhana Kala Kendra`,
        type: "profile",
        url: canonicalUrl,
        siteName: "Sadhana Kala Kendra",
      },
      twitter: {
        card: "summary",
        title: artist.seo_title || artist.full_name,
        description: artist.seo_description || artist.bio || `Meet ${artist.full_name}, acclaimed artist performing at Sadhana Kala Kendra`,
      },
    };
  } catch (error) {
    return {
      title: "Artist Profile",
      description: "Artist profile page",
    };
  }
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let artist: Artist | null = null;
  let error: string | null = null;

  try {
    artist = await getArtistBySlug(slug);
  } catch (err) {
    error = "Failed to load artist profile";
  }

  return <ArtistDetailClient artist={artist} error={error} slug={slug} />;
}
