'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { initializeStorageMonitoring, printStorageDiagnostics } from '@/utils/storageManager';

export function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Initialize storage monitoring on mount
  useEffect(() => {
    initializeStorageMonitoring();
    console.log('[App] Storage monitoring initialized');
    
    // Print diagnostics on mount (for debugging)
    if (typeof window !== 'undefined') {
      printStorageDiagnostics();
    }
  }, []);

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
