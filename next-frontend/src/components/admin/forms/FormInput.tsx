'use client';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function FormInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200
          focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}`}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
