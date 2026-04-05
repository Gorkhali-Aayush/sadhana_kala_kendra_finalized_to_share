/**
 * Industry-standard error handling utilities for admin forms
 * Follows Stripe/GitHub/Google best practices for error responses
 * Converts API responses into field-specific, user-friendly error messages
 */

// ============ ERROR TYPES & INTERFACES ============

export type ErrorCategory = 
  | 'VALIDATION_ERROR'
  | 'CONFLICT_ERROR'
  | 'CONSTRAINT_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMITED_ERROR'
  | 'UNKNOWN_ERROR';

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ParsedError {
  category: ErrorCategory;
  statusCode?: number;
  correlationId?: string;
  fieldErrors: Record<string, string>;
  submitError?: string;
  suggestion?: string;
  retryable: boolean;
}

export interface ApiErrorResponse {
  success?: boolean;
  error?: {
    code: string;
    message: string;
    details?: FieldError[];
    suggestion?: string;
  };
  errors?: FieldError[];
  message?: string;
  correlationId?: string;
}

/**
 * Generates a unique correlation ID for error tracking
 * Format: req-TIMESTAMP-RANDOM
 */
export const generateCorrelationId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req-${timestamp}-${random}`;
};

/**
 * Classifies HTTP status code into error category
 */
export const classifyErrorByStatus = (statusCode: number): ErrorCategory => {
  if (statusCode === 400) return 'VALIDATION_ERROR';
  if (statusCode === 401) return 'UNAUTHORIZED_ERROR';
  if (statusCode === 403) return 'FORBIDDEN_ERROR';
  if (statusCode === 404) return 'NOT_FOUND_ERROR';
  if (statusCode === 409) return 'CONFLICT_ERROR';
  if (statusCode === 422) return 'VALIDATION_ERROR';
  if (statusCode === 429) return 'RATE_LIMITED_ERROR';
  if (statusCode >= 500) return 'INTERNAL_ERROR';
  return 'UNKNOWN_ERROR';
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (category: ErrorCategory, statusCode?: number): boolean => {
  // Don't retry validation or auth errors
  if (['VALIDATION_ERROR', 'CONFLICT_ERROR', 'UNAUTHORIZED_ERROR', 'FORBIDDEN_ERROR', 'NOT_FOUND_ERROR'].includes(category)) {
    return false;
  }
  
  // Retry network, timeout, and server errors
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'INTERNAL_ERROR', 'RATE_LIMITED_ERROR'].includes(category);
};

/**
 * Gets user-friendly error message based on error category
 */
export const getErrorMessage = (category: ErrorCategory, statusCode?: number): string => {
  const messages: Record<ErrorCategory, string> = {
    VALIDATION_ERROR: 'Please check your input and try again.',
    CONFLICT_ERROR: 'This item already exists. Please try a different value.',
    CONSTRAINT_ERROR: 'This action violates a system rule. Please review your input.',
    INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
    NETWORK_ERROR: 'Connection lost. Check your internet and try again.',
    TIMEOUT_ERROR: 'Request took too long. Please try again.',
    UNAUTHORIZED_ERROR: 'Your session has expired. Please log in again.',
    FORBIDDEN_ERROR: "You don't have permission to perform this action.",
    NOT_FOUND_ERROR: 'The item you are looking for does not exist.',
    RATE_LIMITED_ERROR: 'Too many requests. Please wait a moment and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };
  
  return messages[category];
};

/**
 * Parses API error response and returns structured error information
 * Converts various error formats into consistent field-specific errors
 * 
 * @param error - The error object from API call
 * @param defaultCorrelationId - Optional correlation ID from request
 * @returns Parsed error with field errors, submit error, and metadata
 */
export const parseFormErrors = (error: any, defaultCorrelationId?: string): ParsedError => {
  const correlationId = defaultCorrelationId || generateCorrelationId();
  const statusCode = error?.response?.status;
  const category = statusCode ? classifyErrorByStatus(statusCode) : 'UNKNOWN_ERROR';
  const retryable = isRetryableError(category, statusCode);
  
  const fieldErrors: Record<string, string> = {};
  let submitError: string | undefined;
  let suggestion: string | undefined;

  // No response data - likely network error
  if (!error?.response?.data) {
    if (!error?.response) {
      return {
        category: 'NETWORK_ERROR',
        correlationId,
        fieldErrors: {},
        submitError: getErrorMessage('NETWORK_ERROR'),
        retryable: true,
      };
    }
    
    return {
      category,
      statusCode,
      correlationId,
      fieldErrors: {},
      submitError: getErrorMessage(category),
      retryable,
    };
  }

  const data = error.response.data as ApiErrorResponse;

  // Extract field-specific errors (Shopify/GitHub format)
  if (data.errors && Array.isArray(data.errors)) {
    data.errors.forEach((err: FieldError) => {
      fieldErrors[err.field] = err.message;
    });
  }

  // Extract field errors from nested error object (Stripe format)
  if (data.error?.details && Array.isArray(data.error.details)) {
    data.error.details.forEach((err: FieldError) => {
      fieldErrors[err.field] = err.message;
    });
  }

  // Extract general message
  if (data.message && typeof data.message === 'string') {
    submitError = data.message;
  } else if (data.error?.message) {
    submitError = data.error.message;
  }

  // Extract suggestion if available
  if (data.error?.suggestion) {
    suggestion = data.error.suggestion;
  }

  // If we have field errors but no submit error, use category message
  if (Object.keys(fieldErrors).length > 0 && !submitError) {
    submitError = getErrorMessage(category);
  }

  // Fallback if no errors found
  if (Object.keys(fieldErrors).length === 0 && !submitError) {
    submitError = getErrorMessage(category);
  }

  return {
    category,
    statusCode,
    correlationId,
    fieldErrors,
    submitError,
    suggestion,
    retryable,
  };
};


/**
 * Creates a submit error from a general message
 * @param message - The error message
 * @returns Object with submit error
 */
export const createSubmitError = (message: string): Record<string, string> => {
  return {
    submit: message || "Operation failed. Please try again."
  };
};

/**
 * Clears error for a specific field
 * @param errors - Current errors object
 * @param field - Field name to clear
 * @returns Updated errors object
 */
export const clearFieldError = (
  errors: Record<string, string>,
  field: string
): Record<string, string> => {
  const updated = { ...errors };
  delete updated[field];
  return updated;
};

/**
 * Clears all field errors, preserving submit error
 * @param errors - Current errors object
 * @returns Updated errors object with only submit error
 */
export const clearFieldErrors = (
  errors: Record<string, string>
): Record<string, string> => {
  return {
    ...(errors.submit ? { submit: errors.submit } : {})
  };
};

/**
 * Gets display name for a form field
 * @param fieldName - The field name in camelCase or snake_case
 * @returns Human-readable field name
 */
export const getFieldDisplayName = (fieldName: string): string => {
  const displayNames: Record<string, string> = {
    title: "Title",
    course_name: "Course Title",
    description: "Description",
    level: "Level",
    price: "Price",
    teacher_name: "Teacher",
    teacher_id: "Teacher",
    specialization: "Specialization",
    event_name: "Event Name",
    event_date: "Event Date",
    full_name: "Full Name",
    slug: "URL Slug",
    display_order: "Display Order",
    discount_percentage: "Discount Amount",
    seo_title: "SEO Title",
    seo_description: "SEO Description",
    seo_keywords: "SEO Keywords",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
  };

  return displayNames[fieldName] || fieldName.replace(/_/g, " ").charAt(0).toUpperCase() + fieldName.replace(/_/g, " ").slice(1);
};

/**
 * Logs error with correlation ID for monitoring/debugging
 * In production, this would send to monitoring service (Sentry, DataDog, etc.)
 */
export const logErrorWithContext = (error: ParsedError, context?: Record<string, any>): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    correlationId: error.correlationId,
    category: error.category,
    statusCode: error.statusCode,
    fieldErrors: error.fieldErrors,
    submitError: error.submitError,
    suggestion: error.suggestion,
    retryable: error.retryable,
    ...(context && { context }),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Admin Error]', logData);
  }

  // In production, send to monitoring service
  // Example: Sentry.captureException(error)
  // Example: fetch('/api/logs', { method: 'POST', body: JSON.stringify(logData) })
};

/**
 * Converts ParsedError to simple field error map for forms
 * Used for compatibility with existing form error state
 */
export const parsedErrorToFormErrors = (parsed: ParsedError): Record<string, string> => {
  return {
    ...parsed.fieldErrors,
    ...(parsed.submitError ? { submit: parsed.submitError } : {}),
  };
};
