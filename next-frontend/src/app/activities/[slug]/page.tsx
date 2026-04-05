import { Metadata } from "next";
import { getActivityBySlug } from "@/services/activitiesService";
import ActivityDetailClient from "./ActivityDetailClient";

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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const activity = await getActivityBySlug(slug);

    if (!activity) {
      return {
        title: "Activity Not Found",
        robots: { index: false},
      };
    }

    const baseUrl = "https://www.sadhanakalakendra.com";
    const canonicalUrl = `${baseUrl}/activities/${activity.slug || slug}`;

    return {
      title: activity.seo_title || activity.title,
      description: activity.seo_description || activity.description || "Explore this cultural activity",
      keywords: activity.seo_keywords || "classical music, cultural activity",
      openGraph: {
        title: activity.seo_title || activity.title,
        description: activity.seo_description || activity.description || "Explore this cultural activity",
        type: "article",
        url: canonicalUrl,
        siteName: "Sadhana Kala Kendra",
      },
      twitter: {
        card: "summary_large_image",
        title: activity.seo_title || activity.title,
        description: activity.seo_description || activity.description || "Explore this cultural activity",
      },
    };
  } catch (error) {
    return {
      title: "Activity",
      description: "Cultural activity details",
    };
  }
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let activity: Activity | null = null;
  let error: string | null = null;

  try {
    activity = await getActivityBySlug(slug);
  } catch (err) {
    error = "Failed to load activity details";
  }

  return <ActivityDetailClient activity={activity} error={error} slug={slug} />;
}
