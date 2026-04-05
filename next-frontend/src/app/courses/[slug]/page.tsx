import React, { use } from "react";
import Link from "next/link";
import { getCourseBySlug } from "../../../services/coursesService";
import { getOffersByCourse, type Offer } from "../../../services/offersService";
import { getApiUrl } from "../../../config/api";
import PageLoader from "../../../components/PageLoader";
import EmptyState from "../../../components/EmptyState";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Course {
  id?: number;
  course_id?: number;
  title?: string;
  course_name: string;
  slug?: string;
  description: string;
  level: string;
  price: number;
  course_image?: string;
  image_url?: string;
  teacher_id?: number;
  teacher_name?: string;
  schedules?: any[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface OfferExtended extends Offer {
  offer_id?: number;
  course_id?: number;
  subtitle?: string;
  discount_type?: 'percentage' | 'fixed';
  valid_to?: string;
  valid_from?: string;
  is_active?: number;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const course = await getCourseBySlug(slug);
    
    if (!course) {
      return {
        title: "Course Not Found",
        description: "This course could not be found.",
      };
    }

    const title = course.seo_title || `${course.course_name} | Sadhana Kala Kendra`;
    const description = course.seo_description || course.description?.substring(0, 160) || "Learn " + course.course_name;
    const imageUrl = course.image_url?.startsWith("http") 
      ? course.image_url 
      : (course.image_url ? `${API_BASE_URL}${course.image_url}` : "/1626688345_logo.png");

    return {
      title,
      description,
      keywords: course.seo_keywords || `${course.course_name}, music, performing arts`,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: course.course_name,
          },
        ],
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
      title: "Course",
      description: "Explore our courses at Sadhana Kala Kendra",
    };
  }
}

export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let course: Course | null = null;
  let offers: OfferExtended[] = [];
  let error: string | null = null;

  try {
    course = await getCourseBySlug(slug);
    
    if (!course) {
      notFound();
    }

    // Fetch offers for this course
    const courseId = course.course_id || course.id;
    if (courseId) {
      try {
        const offersData = await getOffersByCourse(courseId);
        offers = Array.isArray(offersData) ? offersData : [];
      } catch {
        offers = [];
      }
    }
  } catch (err: any) {
    error = err?.message || "Failed to load course";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Course Not Found"
            description={error || "The course could not be found"}
          />
          <Link
            href="/courses"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const formatTime = (timeValue: string) => {
    if (!timeValue) return "";
    const [h, m] = String(timeValue).split(":");
    const hours = Number(h);
    const minutes = Number(m);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeValue);
    const displayHour = hours % 12 || 12;
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const imageUrl = course.image_url ? `${API_BASE_URL}${course.image_url}` : "/placeholder.png";
  const hasSchedules = course.schedules && course.schedules.length > 0;

  // Calculate active offer and final price
  const activeOffer = offers && offers.length > 0 ? (offers[0] as OfferExtended) : null;
  let finalPrice = course.price;
  let discountAmount = 0;
  let badgeText = "";

  if (activeOffer && activeOffer.discount_percentage) {
    if (activeOffer.discount_type === "fixed") {
      discountAmount = Number(activeOffer.discount_percentage);
      finalPrice = course.price - discountAmount;
      badgeText = `NPR ${discountAmount.toLocaleString()} OFF`;
    } else {
      discountAmount = (course.price * Number(activeOffer.discount_percentage)) / 100;
      finalPrice = course.price - discountAmount;
      badgeText = `${Number(activeOffer.discount_percentage)}% OFF`;
    }
  }

  const hasDiscount = activeOffer !== null;

  return (
    <section className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 font-Roboto">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-[#cf0408] hover:text-[#a90306] font-semibold mb-12 transition-colors duration-200 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to all courses</span>
        </Link>

        {/* Course Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-slate-100">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Image with Overlay */}
            <div className="md:col-span-2 h-80 md:h-auto overflow-hidden relative group">
              <img
                src={imageUrl}
                alt={course.course_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent"></div>
            </div>

            {/* Content Section */}
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-between">
              {/* Title and Description */}
              <div className="mb-8">
                <div className="inline-block bg-[#cf0408]/10 text-[#cf0408] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  Sadhana Kala Kendra
                </div>
                <h1 className="text-4xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight font-Inter">
                  {course.course_name}
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Key Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-linear-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">
                    Instructor
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {course.teacher_name || "TBA"}
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs uppercase tracking-wide text-green-600 font-semibold mb-1">
                    Price
                  </p>
                  {hasDiscount ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 line-through text-sm font-semibold">
                          NPR {course.price.toLocaleString()}
                        </span>
                        <span className="text-green-600 font-bold text-lg">
                          NPR {Math.round(finalPrice).toLocaleString()}
                        </span>
                      </div>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold w-fit">
                        {badgeText}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-green-700">
                      NPR {Number(course.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="flex-1 inline-flex items-center justify-center bg-linear-to-r from-[#cf0408] to-[#a90306] hover:shadow-lg text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span>🎯 Apply Now</span>
                </Link>
                <Link
                  href="/courses"
                  className="flex-1 inline-flex items-center justify-center border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300"
                >
                  <span>📚 Explore More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offers Section */}
        {hasDiscount && activeOffer && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-12">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">Special Offer Available!</h2>
            <div className="space-y-3">
              {[activeOffer].map((offer) => (
                <div
                  key={offer.offer_id}
                  className="rounded-lg bg-white px-4 py-3 border border-yellow-300 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">{offer.title}</p>
                      {offer.subtitle && (
                        <p className="text-xs text-yellow-700 mt-1">{offer.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {offer.discount_type === "fixed"
                          ? `NPR ${Number(offer.discount_percentage).toLocaleString()} OFF`
                          : `${Number(offer.discount_percentage)}% OFF`}
                      </span>
                    </div>
                  </div>
                  {offer.description && (
                    <p className="text-xs text-gray-600 mt-2">{offer.description}</p>
                  )}
                  {offer.valid_to && (
                    <p className="text-xs text-yellow-700 font-semibold mt-2">
                      Valid until: {new Date(offer.valid_to).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedules Section */}
        {hasSchedules && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-Inter">
                Class Schedules
              </h2>
              <div className="text-3xl">📅</div>
            </div>
            <div className="space-y-3">
              {(() => {
                // Group schedules by class_day
                const groupedSchedules = (course.schedules || []).reduce((acc: Record<string, any[]>, schedule: any) => {
                  const day = schedule.class_day || "N/A";
                  if (!acc[day]) {
                    acc[day] = [];
                  }
                  acc[day].push(schedule);
                  return acc;
                }, {});

                return Object.entries(groupedSchedules).map(([day, schedules]: [string, any[]]) => {
                  // Get first schedule's teacher and frequency (assuming they're the same for the day)
                  const firstSchedule = schedules[0];
                  const teacher = firstSchedule?.teacher_name;
                  const frequency = firstSchedule?.frequency || "Regular";

                  return (
                    <div
                      key={day}
                      className="group rounded-xl bg-linear-to-r from-slate-50 to-slate-100/50 px-6 py-5 border-2 border-slate-200 hover:border-[#cf0408] hover:bg-linear-to-r hover:from-red-50/30 hover:to-orange-50/30 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-lg flex items-center gap-2 mb-3">
                            <span className="text-xl">📍</span>
                            {day}
                          </p>
                          <div className="space-y-2 ml-8">
                            {(schedules as any[]).map((schedule: any, idx: number) => (
                              <div key={idx} className="font-medium text-slate-600 block">
                                ⏰ {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          {teacher && (
                            <span className="text-sm text-slate-600">
                              👨‍🏫 {teacher}
                            </span>
                          )}
                          <span className="text-xs font-bold text-white bg-linear-to-r from-[#cf0408] to-[#a90306] px-3 py-1 rounded-full">
                            {frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="mt-8 bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg px-5 py-4">
              <p className="text-sm font-semibold text-amber-900">
                <span className="text-lg">📌</span> Note: Special classes are available upon request based on student needs.
              </p>
            </div>
          </div>
        )}

        {!hasSchedules && (
          <div className="bg-linear-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-8 md:p-12 text-center shadow-lg">
            <p className="text-blue-900 font-semibold text-xl">
              📅 Class schedules will be updated soon.
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Check back later or contact us for more information.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
