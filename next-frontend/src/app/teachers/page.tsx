"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getTeachers, generateTeacherSlug } from "../../services/teachersService";
import { getApiUrl } from "../../config/api";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import { getImageUrl, getImagePlaceholder } from "../../utils/helpers";

interface Teacher {
  teacher_id: number;
  full_name: string;
  specialization: string;
  profile_image?: string;
}

const TEACHER_IMAGE_FALLBACK = getImagePlaceholder("Teacher+Image");


const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError("Failed to load our teachers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTeachers();
  }, [fetchTeachers]);

  const getImageUrlWithFallback = (imagePath?: string) => {
    return getImageUrl(imagePath) || TEACHER_IMAGE_FALLBACK;
  };

  if (loading) {
    return <PageLoader message="Loading teachers content..." />;
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-['Roboto']">
        <div className="max-w-7xl mx-auto text-center py-20 p-8 bg-red-100 border border-red-300 rounded-xl">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-Roboto">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">
          Meet Our <span className="text-red-600">Teachers</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto font-Roboto">
          Learn from our expert instructors who are passionate about teaching
          music, dance, and performing arts.
        </p>
      </div>
      {teachers.length === 0 ? (
        <div className="max-w-7xl mx-auto">
          <EmptyState
            title="No Teachers Found"
            description="Please check back soon for faculty updates."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {teachers.map((teacher) => (
            <Link key={teacher.teacher_id} href={`/teachers/${generateTeacherSlug(teacher.full_name)}`}>
              <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
                <div className="overflow-hidden bg-gray-100 h-80">
                  <img
                    src={getImageUrl(teacher.profile_image) || TEACHER_IMAGE_FALLBACK}
                    alt={teacher.full_name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = TEACHER_IMAGE_FALLBACK;
                    }}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-[#191938] mb-3 font-Inter">{teacher.full_name}</h3>
                  <p className="text-gray-600 mb-6 font-Roboto">
                    {teacher.specialization}
                  </p>
                  <span className="text-indigo-700 hover:text-indigo-900 font-semibold inline-block">View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Teachers;
