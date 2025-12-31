import React, { useEffect, useState, useRef } from "react";
import { classroomActivities } from "../assets/assets";

const PlayIcon = ({ className = "" }) => (
    <svg 
        className={`w-16 h-16 text-white opacity-90 transition-opacity duration-300 group-hover:opacity-100 ${className}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M8 5v14l11-7z"/>
    </svg>
);

const VideoCard = ({ videoPath, i }) => {
    const [isPausedAfterLoad, setIsPausedAfterLoad] = useState(false);
    const videoRef = useRef(null);
    const hasAttemptedPause = useRef(false);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && !hasAttemptedPause.current) {
            videoElement.muted = true;
            
            videoElement.play().then(() => {
                videoElement.pause();
                setIsPausedAfterLoad(true);
                hasAttemptedPause.current = true;
            }).catch(error => {
                console.error("Autoplay-and-pause failed:", error);
                // Fallback: If it fails, assume it's paused and show the play icon
                setIsPausedAfterLoad(true);
                hasAttemptedPause.current = true;
            });
        }
    }, [videoPath]); 

    // Removed the custom handleClick function.

    // Handlers to synchronize state with native controls
    const handleVideoPlay = () => {
        setIsPausedAfterLoad(false); // Hide custom icon when playing
    };

    const handleVideoPause = () => {
        setIsPausedAfterLoad(true);  // Show custom icon when paused
    };

    return (
        <div
            key={i}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl hover:shadow-gray-300/60 hover:scale-[1.02] overflow-hidden group"
        >
            <div 
                // CRITICAL FIX: Removed onClick={handleClick} here. 
                // Clicks will now go directly to the <video> element.
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-md flex items-center justify-center cursor-pointer"
            >
                
                {isPausedAfterLoad && (
                    // The custom overlay is visible when the video is paused.
                    // pointer-events-none ensures the click passes through to the video element.
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300 bg-black/30 group-hover:bg-black/40"> 
                        <PlayIcon />
                    </div>
                )}

                <video
                    ref={videoRef}
                    title={`Sadhana Kala Kendra Video ${i + 1}`}
                    src={videoPath}
                    controls
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                ></video>
            </div>
        </div>
    );
}


const Activities = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const YOUTUBE_URL = "https://www.youtube.com/@sadhanakalakendra4620";

    const allLocalVideos = classroomActivities.videos.map(item => 
        typeof item === 'object' ? item.videoPath : item
    );

    return (
        <section className="py-16 md:py-20 bg-gray-50 font-['Roboto'] ">
            <div className="text-center mb-16 max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-5xl text-[#0f0f50] font-extrabold">
                    Creative <span className="text-[#cf0408]">Showcases</span> and Activities
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto font-['Roboto'] leading-relaxed font-medium">
                    Explore moments of creative expression from our classrooms, stages, and outdoor sessions. Every video highlights the joy and discipline of artistic learning at Sadhana Kala Kendra.
                </p>
            </div>

            <div className="max-w-7xl mx-auto mb-32">
                <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center font-['Playfair Display'] relative inline-block mx-auto block w-fit pb-2">
                    Featured Videos
                    <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-16 h-1 bg-[#cf0408] rounded-full"></span>
                </h2>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {allLocalVideos.length > 0 ? (
                        allLocalVideos.map((videoPath, i) => (
                           <VideoCard key={i} videoPath={videoPath} i={i} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 text-lg py-12 border-t border-gray-200 bg-white rounded-lg shadow-inner">No featured videos currently available. Please check back soon!</p>
                    )}
                </div>
            </div>

            <div className="text-center pt-16 border-t border-gray-200 bg-white/60 p-10 rounded-2xl shadow-inner">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-['Inter']">
                    Dive Deeper into Our Artistry 
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 font-['Roboto']">
                    Want to see more performances, behind-the-scenes moments, and student spotlights?
                </p>

                <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-3 px-12 py-5 text-xl font-extrabold text-white bg-[#cf0408] rounded-full shadow-2xl shadow-red-500/50 hover:bg-red-700 transition duration-300"
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12.0003 2.00008C6.48625 2.00008 2.00031 6.48594 2.00031 12.0001C2.00031 17.5142 6.48625 22.0001 12.0003 22.0001C17.5144 22.0001 22.0003 17.5142 22.0003 12.0001C22.0003 6.48594 17.5144 2.00008 12.0003 2.00008ZM16.8913 12.2851L10.3683 16.0351C10.2743 16.0891 10.1703 16.1151 10.0663 16.1151C9.97331 16.1151 9.87931 16.0911 9.78531 16.0461C9.59731 15.9551 9.47931 15.7661 9.47931 15.5561V8.44408C9.47931 8.23408 9.59731 8.04508 9.78531 7.95408C9.97331 7.86308 10.1983 7.88208 10.3683 7.97008L16.8913 11.7201C17.0673 11.8151 17.1523 11.9741 17.1523 12.1241C17.1523 12.2741 17.0673 12.4331 16.8913 12.5281V12.2851Z" />
                    </svg>
                    <span>Watch on YouTube</span>
                </a>
            </div>

        </section>
    );
};

export default Activities;