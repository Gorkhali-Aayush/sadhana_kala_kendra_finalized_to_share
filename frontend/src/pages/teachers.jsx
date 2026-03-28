import React, { useEffect, useState, useCallback } from "react";
import { getAllTeachers } from "../admin/services/teachersService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

const SERVER_BASE_URL = SERVER_ROOT_URL;
const TEACHER_IMAGE_FALLBACK = "https://via.placeholder.com/300x400?text=Teacher+Image";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);


  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setError("Failed to load our teachers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTeachers(); 
  }, [fetchTeachers]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return TEACHER_IMAGE_FALLBACK;

    // Backend may return either absolute URLs or relative upload paths.
    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${SERVER_BASE_URL}${normalizedPath}`;
  };

  if (loading) {
    return (
      <PageLoader message="Loading teachers content..." />
    );
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
    <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-['Roboto']">
      <Seo
        title="Our Teachers and Instructors | Sadhana Kala Kendra Nepal"
        description="Meet the experienced teachers of Sadhana Kala Kendra guiding students in music, dance, and performing arts through practical, disciplined, and creative training."
        keywords="music teachers Nepal, dance instructors Nepal, Sadhana Kala Kendra faculty, performing arts mentors, vocal and instrument trainers"
        canonicalPath="/teachers"
      />
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
          Meet Our <span className="text-red-600">Teachers</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
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
            <div
              key={teacher.teacher_id}
            >
              <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2">
                <div className="overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(teacher.profile_image)}
                    alt={teacher.full_name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = TEACHER_IMAGE_FALLBACK;
                    }}
                    className="w-full h-56 object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-8 text-center">
                  <h3 className="text-2xl font-semibold text-[#191938] mb-3 font-['Playfair Display']">
                    {teacher.full_name} 
                  </h3>
                  <p className="text-gray-600 mb-6 font-['Roboto']">
                    {teacher.specialization} 
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Teachers;