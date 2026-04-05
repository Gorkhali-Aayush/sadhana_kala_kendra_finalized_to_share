'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fileName?: string;
  onClear?: () => void;
  maxFileSizeMB?: number;
  acceptTypes?: string;
}

export default function FileUploadInput({
  label,
  error,
  helperText,
  fileName,
  onClear,
  maxFileSizeMB = 5,
  acceptTypes = 'image/*',
  onChange,
  className = '',
  ...props
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && fileInputRef.current) {
      fileInputRef.current.files = files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {fileName ? (
        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <span className="text-sm font-medium text-green-700">{fileName}</span>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 text-green-600 hover:bg-green-200 rounded-full transition-colors duration-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            ${error ? 'border-red-500 bg-red-50' : ''}
            ${className}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Drag and drop your file here</p>
          <p className="text-xs text-gray-500">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Max size: {maxFileSizeMB}MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptTypes}
        onChange={onChange}
        {...props}
      />

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
