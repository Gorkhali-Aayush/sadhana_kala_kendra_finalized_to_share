import React from "react";
import { getAllGalleryItems, type Gallery } from "../../services/galleryService";
import GalleryClient from "../../components/GalleryClient";
import EmptyState from "../../components/EmptyState";

const FACEBOOK_URL = "https://www.facebook.com/sadhanakalakendranepal";

export const metadata = {
  title: "Photo Gallery | Sadhana Kala Kendra Performances and Activities",
  description: "View the Sadhana Kala Kendra gallery featuring student performances, classroom moments, events, and cultural highlights across music and dance programs.",
  keywords: "Sadhana Kala Kendra gallery, music school photos, dance performance gallery, cultural event images, arts academy Nepal",
};

export default async function GalleryPage() {
  let galleryItems: Gallery[] = [];
  let error: string | null = null;

  try {
    galleryItems = await getAllGalleryItems();
  } catch (err: any) {
    error = `Failed to load gallery: ${err?.message || 'Unknown error'}. Please make sure the backend API is properly configured in environment variables.`;
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
            Our <span className="text-red-600">Gallery</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-['Roboto']">
            Explore our memorable moments through photos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 rounded-xl p-6 text-center mb-8 max-w-2xl mx-auto">
            <p className="font-semibold mb-2">Gallery Loading Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-red-600 mt-3">Make sure the backend server is running: npm run dev (in backend folder)</p>
          </div>
        )}

        {!error && (!galleryItems || galleryItems.length === 0) ? (
          <EmptyState
            title="No Gallery Items"
            description="Gallery items will be added soon."
          />
        ) : (
          <>
            {/* Photo Gallery */}
            <div className="mb-16">
              <GalleryClient items={galleryItems} />
            </div>

            {/* Call to Action & Facebook Link */}
            <div className="text-center mt-24">
              <h2 className="text-3xl md:text-4xl font-bold text-[#191938] mb-4 font-['Inter']">
                Be Part of the Experience
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-['Roboto']">
                Want to see more performances, behind-the-scenes moments, and student spotlights?
              </p>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-3 px-12 py-5 text-lg font-extrabold text-white bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 hover:bg-blue-700 transition duration-300"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM15.4243 12.7153H13.125V19.5H10.125V12.7153H8.5V10.2153H10.125V8.5C10.125 7.4249 10.4278 6.6749 11.9703 6.6749H13.361V9.0153H12.1875C11.5178 9.0153 11.25 9.3878 11.25 10.0343V10.2153H13.4118L13.125 12.7153H15.4243Z" />
                </svg>
                <span>Visit Facebook Page</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
