/**
 * Custom hook for real-time form validation with debouncing
 * Provides debounced validation and error state management
 */

import { useCallback, useRef, useState } from 'react';

interface ValidationRule {
  validate: (value: any) => true | string; // Returns true if valid, error message if invalid
  debounceMs?: number;
}

interface ValidationRules {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  /**
   * Validates a single field with debouncing
   */
  const validateField = useCallback((fieldName: string, value: any) => {
    // Clear existing timeout for this field
    if (debounceTimeouts.current[fieldName]) {
      clearTimeout(debounceTimeouts.current[fieldName]);
    }

    const fieldRules = rules[fieldName];
    if (!fieldRules) return;

    const rulesToCheck = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    const debounceMs = rulesToCheck[0]?.debounceMs || 300;

    // Set timeout for debounced validation
    debounceTimeouts.current[fieldName] = setTimeout(() => {
      let error = '';

      // Check each validation rule
      for (const rule of rulesToCheck) {
        const result = rule.validate(value);
        if (result !== true) {
          error = result;
          break; // Stop at first error
        }
      }

      // Update error state
      setErrors((prev) => {
        if (error) {
          return { ...prev, [fieldName]: error };
        } else {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        }
      });
    }, debounceMs);
  }, [rules]);

  /**
   * Clears error for a field
   */
  const clearError = useCallback((fieldName: string) => {
    if (debounceTimeouts.current[fieldName]) {
      clearTimeout(debounceTimeouts.current[fieldName]);
    }
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  /**
   * Validates all fields synchronously
   * Used before form submission
   */
  const validateAllFields = useCallback((formData: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const rulesToCheck = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
      const value = formData[fieldName];

      for (const rule of rulesToCheck) {
        const result = rule.validate(value);
        if (result !== true) {
          newErrors[fieldName] = result;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  /**
   * Clears all errors
   */
  const clearAllErrors = useCallback(() => {
    Object.values(debounceTimeouts.current).forEach(timeout => clearTimeout(timeout));
    debounceTimeouts.current = {};
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    clearError,
    validateAllFields,
    clearAllErrors,
    setErrors, // For API error handling
  };
};
