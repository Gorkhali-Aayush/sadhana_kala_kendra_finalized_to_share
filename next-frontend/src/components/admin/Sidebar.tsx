'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Image,
  Users,
  Grid,
  UserCircle,
  Calendar,
  Newspaper,
  Gift,
  Briefcase,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronRight,
  CheckSquare,
} from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/teachers', label: 'Teachers', icon: Users },
    { href: '/admin/gallery', label: 'Gallery', icon: Image },
    { href: '/admin/activities', label: 'Activities', icon: Grid },
    { href: '/admin/artists', label: 'Artists', icon: UserCircle },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/news', label: 'News', icon: Newspaper },
    { href: '/admin/offers', label: 'Offers', icon: Gift },
    { href: '/admin/about', label: 'About', icon: Briefcase },
    { href: '/admin/registrations', label: 'Registrations', icon: CheckSquare },
  ];

  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) {
        return;
      }
      await fetch(`${apiBase}/api/server/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // Logout error, continue
    }
    sessionStorage.removeItem('adminUsername');
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 sm:p-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-lg active:scale-95"
        aria-label="Toggle menu"
        title="Menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay - Improved for all devices */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Sidebar - Responsive Width */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen bg-white shadow-2xl md:shadow-lg transform transition-all duration-300 md:translate-x-0 flex flex-col ${
          collapsed ? 'w-16 sm:w-20' : 'w-60 sm:w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar navigation"
      >
        {/* Logo Section */}
        <div className="p-2 sm:p-3 flex items-center justify-between border-b border-gray-100 hover:border-red-200 transition-colors duration-300">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          >
            <Shield size={20} className="text-red-600 shrink-0 sm:min-w-5.5" />
            {!collapsed && (
              <h1 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight font-Inter truncate">
                Admin
              </h1>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            className="md:hidden text-gray-500 hover:text-red-600 p-1 sm:p-1.5 rounded-full hover:bg-red-50 transition"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items - Responsive */}
        <nav className="flex-1 overflow-y-auto px-1.5 sm:px-2 py-2 sm:py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 group relative min-h-10 sm:min-h-11 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                }`}
                title={item.label}
              >
                <IconComponent size={16} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
                {!collapsed && (
                  <>
                    <span className="truncate text-xs sm:text-sm">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto shrink-0" />}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex mx-1.5 sm:mx-2 mb-2 sm:mb-3 p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-600 hover:text-red-600 justify-center min-h-10"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronRight
            size={18}
            className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>

        {/* Logout Button */}
        <div className="p-2 sm:p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 min-h-10"
            title="Logout"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;