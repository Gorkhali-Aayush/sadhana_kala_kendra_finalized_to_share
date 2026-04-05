"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { name: "Home", to: "/" },
  { name: "About", to: "/about" },
  { name: "Courses", to: "/courses" },
  { name: "Events", to: "/events" },
  { name: "News", to: "/news" },
  { name: "Offers", to: "/offers" },
  { name: "Activities", to: "/activities" },
  { name: "Gallery", to: "/gallery" },
  { name: "Register", to: "/register" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-blue-950 shadow-lg shadow-gray-100/50 font-Inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/1626688345_logo.png" 
              alt="Logo" 
              width={288} 
              height={80} 
              className="rounded-full h-auto w-auto max-w-[180px] md:max-w-[288px]"
            />
            
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              item.name === "Register" ? (
                <Link
                  key={item.name}
                  href={item.to}
                  className="bg-[#cf0408] text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-red-600/40 transition-all duration-300 transform hover:scale-105"
                >
                  {item.name}
                </Link>
              ) : (
                <Link
                  key={item.name}
                  href={item.to}
                  className="text-gray-100 hover:text-yellow-400 px-2 py-1 rounded transition-colors font-medium"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-100 focus:outline-none"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-2 mt-2 bg-blue-950 rounded-lg shadow-lg p-4">
            {navItems.map((item) => (
              item.name === "Register" ? (
                <Link
                  key={item.name}
                  href={item.to}
                  className="bg-[#cf0408] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all duration-300 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ) : (
                <Link
                  key={item.name}
                  href={item.to}
                  className="text-gray-100 hover:text-yellow-400 px-2 py-2 rounded transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
