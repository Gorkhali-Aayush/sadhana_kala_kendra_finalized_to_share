'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/admin/dashboard');
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 z-20">
      {/* Left side - Logo */}
      <button
        onClick={handleLogoClick}
        className="flex items-center hover:opacity-80 transition-opacity duration-200 flex-shrink-0 pl-[45px] sm:pl-0"
        aria-label="Go to dashboard"
      >
        <Image
          src="/1626688345_logo.png"
          alt="Sadhana Kala Kendra Logo"
          width={180}
          height={80}
          className="object-contain max-w-[170px] sm:max-w-[200px] md:max-w-[240px] h-auto w-auto"
          priority
        />
      </button>

      {/* Right side - Profile Icon */}
      <button
        onClick={handleProfileClick}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0f0f50] hover:bg-red-600 transition duration-300 transform hover:scale-110 flex-shrink-0 active:scale-95"
        aria-label="Admin profile"
        title="View Profile"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </button>
    </nav>
  );
}
