import React from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

const EmptyState = ({ title, description, className = "" }: EmptyStateProps) => {
  return (
    <div
      className={`col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-Roboto ${className}`}
    >
      <h3 className="text-xl font-semibold text-gray-700 font-Inter">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-gray-500 font-Roboto">{description}</p>
      ) : null}
    </div>
  );
};

export default EmptyState;
