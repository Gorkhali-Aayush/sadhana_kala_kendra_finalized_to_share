'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ['/admin/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public routes
      if (isPublicRoute) {
        setLoading(false);
        return;
      }

      try {
        const token = sessionStorage.getItem('adminUsername');
        if (!token) {
          // No token in storage, redirect to login
          router.push('/admin/login');
          return;
        }
        
        // Verify session is still valid with server
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBase) {
          sessionStorage.removeItem('adminUsername');
          router.push('/admin/login');
          return;
        }
        const response = await fetch(`${apiBase}/api/server/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          // Session expired on server
          sessionStorage.removeItem('adminUsername');
          router.push('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        // Network or fetch error - redirect to login (don't allow continuation)
        sessionStorage.removeItem('adminUsername');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isPublicRoute]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f0f50] to-[#200470]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#cf0408] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-['Inter']">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes, render without sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <AdminNavbar />
        <main className="flex-1 overflow-auto w-full">
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
