import React from "react";

export const Button = ({ children, variant = "default", size = "md", ...props }) => {
  let base = "rounded-md font-medium transition-all focus:outline-none";
  let variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  let sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md}`}
      {...props}
    >
      {children}
    </button>
  );
};