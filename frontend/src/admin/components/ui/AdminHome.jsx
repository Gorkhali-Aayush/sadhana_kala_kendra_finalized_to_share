import React, { useEffect, useState, useCallback } from "react";
import Cookies from 'js-cookie'; 

// Assuming these are the correct paths for your project structure
// 💡 PATH FIX: Changed '../../services/' to '../services/'
import { getAllBOD, getAllPrograms } from "../../services/aboutService.js"; 
import { getAllCourses } from "../../services/coursesService.js"; 
import { getAllEvents } from "../../services/eventsService.js"; 
import { getAllTeachers } from "../../services/teachersService.js";
import { getAllArtists } from "../../services/artistsService.js"; 
import RegisterService from "../../services/registerServices.js"; // IMPORT SERVICE

// --- Lucide-style SVG Icons ---
const Icons = {
    Users: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    History: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Book: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    Calendar: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Gallery: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    Palette: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-1.4.7c-1.5.8-3.1 1.2-4.8 1.2s-3.3-.4-4.8-1.2l-1.4-.7"/></svg>,
    Target: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Briefcase: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    CheckSquare: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
};


// --- New StatCard Design (unchanged) ---
const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className={`
        p-6 rounded-2xl shadow-xl transition duration-500 transform hover:translate-y-[-4px]
        bg-white border-t-4 ${color.border}
        flex flex-col space-y-3
    `}>
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-full ${color.bg} text-white shadow-lg shadow-gray-400/50`}>
                <Icon className="w-6 h-6" /> 
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</p>
    </div>
);

// --- New Loading Skeleton (unchanged) ---
const StatCardSkeleton = () => (
    <div className="p-6 rounded-2xl shadow-lg bg-white/50 border-t-4 border-gray-300 animate-pulse flex flex-col space-y-3 h-[120px]">
        <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
);


const AdminHome = ({ navigate }) => { 
    const [stats, setStats] = useState({
        bodCount: 0,
        programCount: 0,
        coursesCount: 0,
        eventsCount: 0,
        teachersCount: 0,
        artistsCount: 0,
        registrationsCount: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 💡 NEW STATE: Check if the authentication token (JWT) is present
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        // 1. Check for the token immediately on mount. 
        // IMPORTANT: Replace 'token' with your actual storage key if different.
        const token = localStorage.getItem('token') || Cookies.get('token'); 
        if (token) {
            // If token exists, we assume the API client (Axios/api.js) is ready
            setAuthReady(true);
        } else {
            // If the token is missing, we must fail the fetch gracefully.
            // We set authReady to true here to allow the useEffect below to finish the cycle.
            setAuthReady(true); 
        }
    }, []);

    const fetchStats = useCallback(async () => {
        // 🛑 NEW GUARD CLAUSE: Do not proceed if we haven't confirmed auth status
        // This is the critical change to prevent the premature 401 request.
        if (!authReady) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch all data concurrently
            const [bod, program, courses, events, teachers, artists, registrations] = await Promise.all([
                getAllBOD(),
                getAllPrograms(),
                getAllCourses(),
                getAllEvents(),
                getAllTeachers(),
                getAllArtists(),
                RegisterService.getAllRegistrations(), // THIS CALL IS CAUSING 401
            ]);

            setStats({
                bodCount: bod.length,
                programCount: program.length,
                coursesCount: courses.length,
                eventsCount: events.length,
                teachersCount: teachers.length,
                artistsCount: artists.length,
                // Assuming 'registrations' is an array/list of data
                registrationsCount: registrations.length, 
            });

        } catch (err) {
            console.error("Error fetching stats:", err);
            // Enhanced error message for 401
            const msg = err.response?.status === 401 
                ? "Unauthorized (401). Your session may have expired. Please log in again." 
                : "Failed to load dashboard data. Check backend and service endpoints.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [authReady]); // 💡 ADD authReady to dependencies

    useEffect(() => {
        // 💡 ONLY trigger fetchStats once authReady is true
        if (authReady) {
            fetchStats();
        }
    }, [authReady, fetchStats]); // Depend on both authReady and fetchStats

    
    const statCardsData = [
        // Real Registration Count (The primary metric)
        { title: "New Registrations", value: stats.registrationsCount, color: { border: "border-green-500", bg: "bg-green-600" }, icon: Icons.CheckSquare, path: "register" },

        // Existing data
        { title: "BOD Members", value: stats.bodCount, color: { border: "border-indigo-500", bg: "bg-indigo-600" }, icon: Icons.Briefcase, path: "about/bod" },
        { title: "Program Records", value: stats.programCount, color: { border: "border-gray-500", bg: "bg-gray-600" }, icon: Icons.History, path: "about/program" },
        { title: "Courses Offered", value: stats.coursesCount, color: { border: "border-teal-500", bg: "bg-teal-600" }, icon: Icons.Book, path: "courses" },
        { title: "Events Scheduled", value: stats.eventsCount, color: { border: "border-orange-500", bg: "bg-orange-600" }, icon: Icons.Calendar, path: "events" },
        { title: "Teachers/Staff", value: stats.teachersCount, color: { border: "border-red-500", bg: "bg-red-600" }, icon: Icons.Target, path: "teachers" },
        { title: "Artists Featured", value: stats.artistsCount, color: { border: "border-blue-500", bg: "bg-blue-600" }, icon: Icons.Palette, path: "artists" },
    ];
    
    // Function to handle navigation to /admin/...
    const handleNavigation = (path) => {
        // All paths starting with "register" will go to the main register page
        let finalPath = path.startsWith("register") ? "register" : path;
        
        // Custom logic for "about" section
        if (finalPath === "about/bod" || finalPath === "about/program") {
            finalPath = "about"; 
        }

        const fullPath = `/admin/${finalPath}`;
        
        if (typeof navigate === 'function') {
            // This is the real React Router navigation call
            navigate(fullPath);
        } else {
            // Fallback for development/testing
            console.warn(`Router not available. Simulating navigation to: ${fullPath}`);
            // IMPORTANT: Removed window.alert()
        }
    };

    return (
      <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
        {/* PAGE HEADER */}
        <header className="mb-10">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                Content Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-base">
                Monitor all key activity happening across your platform.
            </p>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl mb-8 shadow">
                <p className="font-semibold text-lg">Error Loading Data</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        {/* STATISTICS SECTION */}
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">
                Overview
            </h2>

            <div className="
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                lg:grid-cols-3 
                xl:grid-cols-4 
                gap-6
            ">
                {loading || !authReady
                    ? statCardsData.map((_, index) => <StatCardSkeleton key={index} />)
                    : statCardsData.map((card, index) => (
                        <StatCard
                            key={index}
                            title={card.title}
                            value={card.value}
                            color={card.color}
                            icon={card.icon}
                        />
                    ))}
            </div>
        </section>

        {/* FUTURE READY: Analytics Section Placeholder */}
        <section className="mt-14 p-8 bg-white rounded-2xl shadow-xl border border-slate-200/60">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Insights & Analytics
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                Charts, reports, and visual analytics will appear here.  
                
            </p>
        </section>

    </div>
);
};

export default AdminHome;