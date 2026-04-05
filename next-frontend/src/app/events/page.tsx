"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getUpcomingEvents, getPastEvents, getAllPrograms, type Event } from "../../services/eventsService";
import { getApiUrl } from "../../config/api";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import { toSlug, formatDateDisplay } from "../../utils/helpers";

const UpcomingEventCard = ({ event }: { event: Event }) => {
  if (!event.slug) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 flex flex-col">
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#191938] mb-2 font-Inter">
            {event.event_name}
          </h3>
          <p className="text-red-600 text-sm font-bold mb-1 font-Inter flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDateDisplay(event.event_date)} | {event.event_time}
          </p>
          <p className="text-gray-500 text-sm mb-4 font-Roboto flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {event.venue}
          </p>
          <p className="text-gray-700 text-sm sm:text-base font-Roboto flex-1 leading-relaxed">
            {event.description}
          </p>
          <p className="mt-4 text-xs text-gray-500 italic">
            Organized by: {event.organized_by || "Our School"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300 flex flex-col cursor-pointer h-full">
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#191938] mb-2 font-Inter">
            {event.event_name}
          </h3>
          <p className="text-red-600 text-sm font-bold mb-1 font-Inter flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDateDisplay(event.event_date)} | {event.event_time}
          </p>
          <p className="text-gray-500 text-sm mb-4 font-Roboto flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {event.venue}
          </p>
          <p className="text-gray-700 text-sm sm:text-base font-Roboto flex-1 leading-relaxed">
            {event.description}
          </p>
          <p className="mt-4 text-xs text-gray-500 italic">
            Organized by: {event.organized_by || "Our School"}
          </p>
          <p className="mt-4 text-sm font-semibold text-indigo-700 group-hover:text-indigo-900">View Details</p>
        </div>
      </div>
    </Link>
  );
};

const PastEventListItem = ({ event }: { event: Event }) => {
  if (!event.slug) {
    return (
      <div className="border-b border-gray-200 py-4 px-3 md:px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div className="md:w-3/5">
            <h4 className="text-lg font-bold text-[#191938] font-Inter">
              {event.event_name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 font-Roboto">
              {event.description}
            </p>
          </div>
          <div className="md:w-2/5 md:text-right mt-2 md:mt-0">
            <p className="text-xs font-bold text-red-600 font-Inter">
              {formatDateDisplay(event.event_date)}
            </p>
            <p className="text-xs text-gray-500 font-Roboto">{event.venue}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group border-b border-gray-200 py-4 px-3 md:px-6 hover:bg-gray-100 transition duration-150 cursor-pointer">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div className="md:w-3/5">
            <h4 className="text-lg font-bold text-[#191938] font-Inter group-hover:text-red-600">
              {event.event_name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 font-Roboto">
              {event.description}
            </p>
          </div>
          <div className="md:w-2/5 md:text-right mt-2 md:mt-0">
            <p className="text-xs font-bold text-red-600 font-Inter">
              {formatDateDisplay(event.event_date)}
            </p>
            <p className="text-xs text-gray-500 font-Roboto">{event.venue}</p>
            <p className="text-xs font-semibold text-indigo-700 mt-1 group-hover:text-indigo-900">View Details</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchEvents = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (tab === "upcoming") {
        data = await getUpcomingEvents();
      } else {
        data = await getPastEvents();
      }
      setEvents(data);
    } catch (err) {
      setError(`Failed to load ${tab} events. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(activeTab);
    // Fetch programs on mount
    const fetchPrograms = async () => {
      try {
        const programsData = await getAllPrograms();
        setPrograms(programsData);
      } catch (err) {
        // Failed to load programs, continue without them
      }
    };
    fetchPrograms();
  }, [activeTab, fetchEvents]);

  return (
    <section className="py-16 md:py-20 bg-gray-50 min-h-screen">
      {/* History Program Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16 md:mb-24">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-Inter text-[#191938] mb-3 md:mb-4">
            Historic  <span className="text-[#cf0408]">Showcase</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-['Roboto']">
            Explore our past cultural programs and historic performances
          </p>
        </div>

        {programs.length === 0 ? (
          <p className="text-gray-500 italic text-center font-['Roboto']">
            Program information is currently being updated.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {programs.map((program) => (
              <Link
                key={program.program_id}
                href={`/events/programs/${toSlug(program)}`}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer transition duration-300 hover:shadow-xl group"
              >
                <div className="h-40 sm:h-48 overflow-hidden relative">
                  {program.image_url ? (
                    <img
                      src={program.image_url.startsWith('http') 
                        ? program.image_url 
                        : getApiUrl(program.image_url.startsWith('/') ? program.image_url : `/${program.image_url}`)}
                      alt={program.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#191938]/30 flex items-center justify-center">
                      <img src="/logo.png" alt="Program" className="w-12 h-12 object-contain" />
                    </div>
                  )}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-[#cf0408] text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full tracking-wider font-['Inter']">
                    {new Date(program.program_date).getFullYear()}
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold font-Inter text-[#191938] mb-2 leading-tight group-hover:text-[#cf0408] transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-3 md:mb-4 font-['Roboto']">
                    {program.description}
                  </p>
                  <div className="text-[#cf0408] font-semibold text-xs sm:text-sm flex items-center gap-1 font-['Inter']">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">
          Event <span className="text-red-600 ">Timeline</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-Roboto">
          Explore our upcoming plans and look back at our history.
        </p>
        <div className="mt-8 border-b border-gray-200 inline-block">
          <div className="flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 font-bold transition-colors text-lg ${
                activeTab === "upcoming"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-2 font-bold transition-colors text-lg ${
                activeTab === "past"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {loading && (
          <PageLoader message={`Loading ${activeTab} events...`} />
        )}
        {error && (
          <div className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-400 text-center">
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            title={`No ${activeTab === "upcoming" ? "Upcoming" : "Past"} Events Found`}
            description={
              activeTab === "upcoming"
                ? "Check back soon for new announcements!"
                : "This list will be updated as events conclude."
            }
          />
        )}
        {!loading && !error && events.length > 0 && (
          <>
            {activeTab === "upcoming" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {events.map((event) => (
                  <UpcomingEventCard key={event.event_id} event={event} />
                ))}
              </div>
            )}
            {activeTab === "past" && (
              <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
                {events.map((event) => (
                  <PastEventListItem key={event.event_id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
