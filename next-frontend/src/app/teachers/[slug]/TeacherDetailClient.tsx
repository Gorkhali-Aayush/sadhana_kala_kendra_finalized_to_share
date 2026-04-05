'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { getImageUrl, getImagePlaceholder } from "@/utils/helpers";

interface Teacher {
  teacher_id?: number;
  full_name: string;
  specialization?: string;
  description?: string;
  profile_image?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface TeacherDetailClientProps {
  teacher: Teacher | null;
  error: string | null;
  slug: string;
}

export default function TeacherDetailClient({
  teacher,
  error,
  slug,
}: TeacherDetailClientProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Teacher Not Found"
            description={error || "The teacher you are looking for does not exist."}
          />
          <Link
            href="/teachers"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Teachers
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(teacher.profile_image);

  return (
    <section className="min-h-screen bg-gradient-to-b from-red-50/25 to-white font-Roboto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-[#cf0408] hover:text-[#a90306] font-semibold mb-12 transition-colors duration-200 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to all teachers</span>
        </Link>

        {/* Teacher Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Image with Overlay */}
            <div className="md:col-span-2 h-80 md:h-auto overflow-hidden relative group">
              <img
                src={imageUrl}
                alt={teacher.full_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>

            {/* Content Section */}
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-between">
              {/* Title and Badge */}
              <div className="mb-8">
                <div className="inline-block bg-[#cf0408]/10 text-[#cf0408] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  Expert Instructor
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#191938] mb-4 leading-tight font-Inter">
                  {teacher.full_name}
                </h1>
                <p className="text-[#cf0408] font-semibold text-lg">
                  {teacher.specialization || "Classical Arts"}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {teacher.description || `Experienced instructor specializing in ${teacher.specialization || "classical arts"} with a passion for nurturing talent and fostering artistic excellence. Join their classes to develop your skills and artistic abilities.`}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-[#cf0408] to-[#a90306] hover:shadow-lg text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  🎯 Register Now
                </Link>
                <Link
                  href="/courses"
                  className="flex-1 inline-flex items-center justify-center border-2 border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300"
                >
                  📚 View Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
