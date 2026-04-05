'use client';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export default function FormSelect({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm appearance-none bg-white transition-all duration-200
            focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}`}
        >
          <option value="" disabled>
            {placeholder || 'Select an option...'}
          </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
        <svg
          className="absolute right-3 top-3 pointer-events-none w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
