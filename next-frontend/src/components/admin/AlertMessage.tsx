'use client';

import { useEffect } from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
  autoClose?: number;
}

export default function AlertMessage({ message, type, onClose, autoClose = 5000 }: AlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-emerald-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-emerald-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-emerald-800';
  const icon = type === 'error' ? '⚠️' : '✅';

  return (
    <div
      className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${bgColor} ${borderColor} ${textColor}`}
    >
      <div className="flex items-center font-medium">
        <span className="shrink-0 text-lg">{icon}</span>
        <span className="ml-3 text-sm md:text-base">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity text-xl leading-none ml-4 shrink-0"
      >
        ×
      </button>
    </div>
  );
}
