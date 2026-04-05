"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCourses } from "../../services/coursesService";
import { getApiUrl } from "../../config/api";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";

const Courses = () => {
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await getCourses();
      setCoursesList(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCourses();
  }, [fetchCourses]);



  if (loading) {
    return <PageLoader message="Loading courses content..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50 font-Roboto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl text-[#0f0f50] font-extrabold font-Inter">
          Our <span className="text-[#cf0408]">Courses</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          All Types Of Dance, Vocal And Instruments Classes Are Based On the
          International Staff Notation
        </p>
        <p className="text-blue-700 text-base md:text-lg mt-4 underline underline-offset-4">
          Click on any course card to view full details.
        </p>
      </div>

      {coursesList && coursesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {coursesList.map((course: any) => (
            <Link
              key={course?.course_id || Math.random()}
              href={course?.slug ? `/courses/${course.slug}` : "/courses"}
              className="group cursor-pointer bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="overflow-hidden">
                <img
                  src={course.image_url ? getApiUrl(course.image_url) : "/placeholder.png"}
                  alt={course.course_name}
                  loading="lazy"
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-[#191938] mb-3 font-Inter">
                  {course.course_name}
                </h3>
                <p className="text-gray-600 mb-2 font-Roboto">{course.description}</p>
                <span className="inline-block mt-3 text-indigo-700 font-semibold hover:text-indigo-900">
                  View Details
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            title="No Courses Found"
            description="Please check back soon for our latest class offerings."
          />
        </div>
      )}
    </section>
  );
};

export default Courses;
