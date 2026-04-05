import React from "react";
import Link from "next/link";
import { getNewsBySlug, getNewsResources } from "../../../services/newsService";
import EmptyState from "../../../components/EmptyState";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsDetailClient from "./NewsDetailClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface News {
  id?: number;
  news_id?: number;
  title: string;
  slug?: string;
  description?: string;
  rich_content?: string;
  image_url?: string;
  feature_image?: string;
  news_date?: string;
  date?: string;
  created_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface NewsResource {
  resource_id: number;
  resource_type: 'image' | 'youtube';
  resource_url: string;
  caption?: string;
  sort_order?: number;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const news = await getNewsBySlug(slug);
    
    if (!news) {
      return {
        title: "News Not Found",
        description: "This news article could not be found.",
      };
    }

    const title = news.seo_title || `${news.title} | Sadhana Kala Kendra`;
    const description = news.seo_description || news.description?.substring(0, 160) || news.title;
    const imageUrl = news.image_url?.startsWith("http") 
      ? news.image_url 
      : (news.image_url ? `${API_BASE_URL}${news.image_url}` : (news.feature_image?.startsWith("http") 
        ? news.feature_image 
        : (news.feature_image ? `${API_BASE_URL}${news.feature_image}` : "/1626688345_logo.png")));

    const newsDate = news.news_date || news.date || news.created_at;
    const publishedTime = newsDate ? new Date(newsDate).toISOString() : undefined;

    return {
      title,
      description,
      keywords: news.seo_keywords || `${news.title}, news, updates`,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: news.title,
          },
        ],
        ...(publishedTime && { publishedTime }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "News",
      description: "Latest news and updates from Sadhana Kala Kendra",
    };
  }
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let news: News | null = null;
  let resources: NewsResource[] = [];
  let error: string | null = null;

  try {
    news = await getNewsBySlug(slug);
    
    if (!news) {
      notFound();
    }

    // Fetch resources if news_id is available
    if (news?.news_id) {
      try {
        const resourcesData = await getNewsResources(String(news.news_id));
        // Sort resources by sort_order to maintain proper display order
        const sortedResources = (resourcesData || []).sort((a: any, b: any) =>
          (a.sort_order || 0) - (b.sort_order || 0)
        );
        resources = sortedResources;
      } catch (err) {
        // Error fetching resources, continue without them
        resources = [];
      }
    }
  } catch (err: any) {
    error = err?.message || "Failed to load news";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="News Not Found"
            description={error || "The news article could not be found"}
          />
          <Link
            href="/news"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  if (!news) {
    notFound();
  }

  return <NewsDetailClient news={news} resources={resources} />;
}
