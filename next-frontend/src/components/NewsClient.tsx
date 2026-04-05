"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllNews } from "../services/newsService";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";

type NewsItem = {
  news_id: number;
  title: string;
  content: string;
  image_url?: string;
  news_date?: string;
  slug?: string;
};

export default function NewsClient() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllNews()
      .then(setNews)
      .catch(() => setError("Failed to load news. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto mb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-10 border-b border-gray-200 pb-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">
              Latest <span className="text-red-600 font-Inter">News</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-Roboto max-w-2xl mx-auto">
              Stay updated with the latest happenings and announcements at Sadhana Kala Kendra.
            </p>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <PageLoader message="Loading latest news..." />
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-center">
            {error}
          </div>
        ) : news.length === 0 ? (
          <EmptyState
            title="No News Updates Found"
            description="Check back soon for the latest institutional announcements."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => {
              const newsDate = item.news_date ? new Date(item.news_date) : null;
              const newsHref = `/news/${item.slug || item.news_id}`;
              
              const articleContent = (
                <>
                  <div className="relative h-52 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url.startsWith("http") ? item.image_url : (process.env.NEXT_PUBLIC_API_BASE_URL + item.image_url)}
                        alt={item.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 bg-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">No image</span>
                    )}
                    {newsDate && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-center shadow-md">
                        <span className="block text-xs font-bold text-red-600 uppercase tracking-wider">
                          {newsDate.toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="block text-lg font-black text-indigo-900 leading-none">
                          {newsDate.getDate()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-indigo-950 mb-3 group-hover:text-red-600 transition-colors line-clamp-2 font-Inter">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 font-Roboto">
                      {item.content}
                    </p>
                    <span className="mt-auto text-center text-sm font-bold text-indigo-700 group-hover:text-indigo-900 transition-colors">
                      View Details
                    </span>
                  </div>
                </>
              );

              return (
                <Link key={item.news_id} href={newsHref}>
                  <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden cursor-pointer h-full">
                    {articleContent}
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
