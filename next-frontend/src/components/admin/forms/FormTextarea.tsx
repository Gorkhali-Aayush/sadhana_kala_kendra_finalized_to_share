'use client';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charLimit?: number;
}

export default function FormTextarea({
  label,
  error,
  helperText,
  charLimit,
  onChange,
  value = '',
  className = '',
  ...props
}: FormTextareaProps) {
  const charCount = value ? String(value).length : 0;
  const isOverLimit = charLimit && charCount > charLimit;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          {...props}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200
            focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${isOverLimit ? 'border-orange-500' : ''}
            ${className}`}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
        </div>
        {charLimit && (
          <p className={`text-xs font-medium ${isOverLimit ? 'text-orange-600' : 'text-gray-500'}`}>
            {charCount}/{charLimit}
          </p>
        )}
      </div>
    </div>
  );
}
