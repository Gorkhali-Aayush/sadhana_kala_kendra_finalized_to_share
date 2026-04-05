import React from "react";

type PageLoaderProps = {
  message?: string;
};

const PageLoader = ({ message = "Loading content..." }: PageLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
        <p className="text-xl text-[#191938] font-Inter">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
