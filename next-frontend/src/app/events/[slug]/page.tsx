import React from "react";
import Link from "next/link";
import { getEventBySlug, type Event } from "../../../services/eventsService";
import EmptyState from "../../../components/EmptyState";
import SafeHTML from "../../../components/SafeHTML";
import { formatDateDisplay } from "../../../utils/helpers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const event = await getEventBySlug(slug);
    
    if (!event) {
      return {
        title: "Event Not Found",
        description: "This event could not be found.",
      };
    }

    const title = event.seo_title || `${event.event_name} | Sadhana Kala Kendra`;
    const description = event.seo_description || event.description?.substring(0, 160) || `Join us for ${event.event_name}`;

    const eventDate = formatDateDisplay(event.event_date);

    return {
      title,
      description,
      keywords: event.seo_keywords || `${event.event_name}, event, sadhana kala kendra`,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: "/1626688345_logo.png",
            width: 1200,
            height: 630,
            alt: event.event_name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/1626688345_logo.png"],
      },
    };
  } catch (error) {
    return {
      title: "Event",
      description: "Explore events at Sadhana Kala Kendra",
    };
  }
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let event: Event | null = null;
  let error: string | null = null;

  try {
    event = await getEventBySlug(slug);
    
    if (!event) {
      notFound();
    }
  } catch (err: any) {
    error = err?.message || "Failed to load event";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Event Not Found"
            description={error || "The event could not be found"}
          />
          <Link
            href="/events"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "TBD";
    const [h, m] = String(timeStr).split(":");
    const hours = Number(h);
    const minutes = Number(m);
    const displayHour = hours % 12 || 12;
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${displayHour}:${String(minutes || 0).padStart(2, "0")} ${suffix}`;
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50 font-Roboto">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition"
        >
          <span className="mr-2">←</span> Back to all events
        </Link>

        {/* Event Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#191938] mb-6 font-Inter">
              {event.event_name || event.title}
            </h1>

            {/* Event Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 py-8 border-y border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-sm mb-2">📅 DATE</p>
                <p className="text-xl font-bold text-[#191938]">{formatDateDisplay(event.event_date)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-sm mb-2">⏰ TIME</p>
                <p className="text-xl font-bold text-[#191938]">{formatTime(event.event_time)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-sm mb-2">📍 LOCATION</p>
                <p className="text-xl font-bold text-[#191938]">{event.venue || event.location || "TBD"}</p>
              </div>
            </div>

            {/* Description & Rich Content */}
            <div className="mb-12">
              {event.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#191938] mb-4 font-Inter">Summary</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {event.rich_content && (
                <div>
                  <h2 className="text-2xl font-bold text-[#191938] mb-4 font-Inter">Event Details</h2>
                  <SafeHTML 
                    html={event.rich_content}
                    className="text-gray-700 leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="flex gap-4">
              <Link
                href="/register"
                className="flex-1 inline-flex items-center justify-center bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
              >
                Register for Event
              </Link>
              <Link
                href="/events"
                className="flex-1 inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
              >
                View More Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
