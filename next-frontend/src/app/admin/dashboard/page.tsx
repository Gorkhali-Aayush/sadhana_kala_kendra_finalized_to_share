'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Image,
  Users,
  Calendar,
  Newspaper,
  CheckSquare,
  Grid,
  UserCircle,
  Gift,
  Briefcase,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalCourses?: number;
  totalGalleries?: number;
  totalTeachers?: number;
  totalEvents?: number;
  totalNews?: number;
  totalUsers?: number;
  data?: {
    totalCourses?: number;
    totalGalleries?: number;
    totalTeachers?: number;
    totalEvents?: number;
    totalNews?: number;
    totalUsers?: number;
  };
}

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: number;
  link: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'indigo' | 'amber' | 'slate';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalGalleries: 0,
    totalTeachers: 0,
    totalEvents: 0,
    totalNews: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBase) {
          setStats({});
          return;
        }
        const username = sessionStorage.getItem('adminUsername') || 'Administrator';
        setAdminName(username);

        const response = await fetch(`${apiBase}/api/server/dashboard`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          // Extract stats from the data object
          const statsData = data.data || data;
          setStats(statsData);
        }
      } catch (error) {
        // Failed to fetch dashboard stats
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatValue = (key: keyof DashboardStats) => {
    // Dashboard API returns { success: true, data: {...stats} }
    // Access the stats directly from the data structure
    return (stats[key] as number) || 0;
  };

  const statCards: StatCard[] = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Courses',
      value: getStatValue('totalCourses') as number,
      link: '/admin/courses',
      color: 'blue',
    },
    {
      icon: <Image className="w-6 h-6" />,
      label: 'Gallery',
      value: getStatValue('totalGalleries') as number,
      link: '/admin/gallery',
      color: 'purple',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Teachers',
      value: getStatValue('totalTeachers') as number,
      link: '/admin/teachers',
      color: 'green',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Events',
      value: getStatValue('totalEvents') as number,
      link: '/admin/events',
      color: 'red',
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      label: 'News',
      value: getStatValue('totalNews') as number,
      link: '/admin/news',
      color: 'orange',
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      label: 'Registrations',
      value: getStatValue('totalUsers') as number,
      link: '/admin/registrations',
      color: 'indigo',
    },
  ];

  const colorMap = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    red: 'from-red-50 to-red-100 border-red-200 text-red-700',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
    slate: 'from-slate-50 to-slate-100 border-slate-200 text-slate-700',
  };

  const badgeColorMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500',
  };

  const quickLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: BookOpen, label: 'Manage Courses', href: '/admin/courses' },
    { icon: Image, label: 'Manage Gallery', href: '/admin/gallery' },
    { icon: Users, label: 'Manage Teachers', href: '/admin/teachers' },
    { icon: Grid, label: 'Manage Activities', href: '/admin/activities' },
    { icon: UserCircle, label: 'Manage Artists', href: '/admin/artists' },
    { icon: Calendar, label: 'Manage Events', href: '/admin/events' },
    { icon: Newspaper, label: 'Manage News', href: '/admin/news' },
    { icon: Gift, label: 'Manage Offers', href: '/admin/offers' },
    { icon: Briefcase, label: 'Manage About', href: '/admin/about' },
    { icon: CheckSquare, label: 'View Registrations', href: '/admin/registrations' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-playfair">Welcome back, {adminName}! 👋</h1>
            <p className="text-red-100">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-5xl opacity-20">📊</div>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-red-600" />
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link href={card.link} key={card.label}>
              <div
                className={`bg-linear-to-br ${colorMap[card.color]} border-2 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/50 group-hover:bg-white transition-colors duration-200 ${card.color === 'blue' ? 'text-blue-600' : card.color === 'purple' ? 'text-purple-600' : card.color === 'green' ? 'text-green-600' : card.color === 'red' ? 'text-red-600' : card.color === 'orange' ? 'text-orange-600' : 'text-indigo-600'}`}>
                    {card.icon}
                  </div>
                  <div className={`${badgeColorMap[card.color]} text-white font-bold px-4 py-2 rounded-full text-lg shadow-md`}>
                    {card.value}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{card.label}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                  View all {card.label.toLowerCase()}
                  <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link href={link.href} key={link.href}>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-600 hover:shadow-lg hover:bg-red-50 transition-all duration-300 cursor-pointer flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-200 transition-colors duration-200">
                    <IconComponent className="w-5 h-5 text-gray-700 group-hover:text-red-600 transition-colors duration-200" />
                  </div>
                  <span className="font-medium text-gray-800 group-hover:text-red-600 transition-colors duration-200 text-sm line-clamp-2">
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-linear-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 flex items-start gap-4">
        <div className="text-3xl shrink-0">💡</div>
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-sm text-blue-800 mb-2">
            Use the navigation menu on the left to manage different sections of your website. Each section provides tools
            to create, read, update, and delete content.
          </p>
          <p className="text-xs text-blue-700">
            For support or technical assistance, please contact the development team.
          </p>
        </div>
      </div>
    </div>
  );
}
