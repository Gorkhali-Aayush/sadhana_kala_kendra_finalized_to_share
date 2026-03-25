import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { FaHome } from "react-icons/fa";

const NotFound = () => {
  return (
    <>
      <Seo
        title="404 - Page Not Found | Sadhana Kala Kendra"
        description="The page you're looking for doesn't exist. Return to the home page to continue exploring."
        canonicalPath="/404"
      />
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Large 404 Text */}
          <h1 className="text-9xl sm:text-[10rem] md:text-[12rem] font-extrabold text-[#cf0408] mb-4 drop-shadow-lg">
            404
          </h1>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191938] mb-4 font-['Inter']">
            Oops! Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-8 font-['Roboto'] leading-relaxed">
            Sorry, the page you're looking for doesn't exist. It might have been
            removed, renamed, or you may have typed the URL incorrectly. Let's get
            you back on track!
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#cf0408] hover:bg-[#a00306] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-['Inter']"
            >
              <FaHome className="text-lg" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
