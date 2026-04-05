/**
 * Retry logic with exponential backoff for API calls
 * Follows industry best practices for handling transient errors
 */

export interface RetryOptions {
  maxRetries?: number; // Default: 3
  baseDelay?: number; // Default: 100ms
  maxDelay?: number; // Default: 10000ms (10 seconds)
  backoffMultiplier?: number; // Default: 2
  shouldRetry?: (error: any) => boolean; // Custom retry condition
}

/**
 * Retries a function with exponential backoff
 * 
 * @example
 * ```ts
 * const result = await retryWithBackoff(() => apiCall(), {
 *   maxRetries: 3,
 *   baseDelay: 100,
 *   shouldRetry: (error) => error.statusCode >= 500
 * });
 * ```
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this shouldn't be retried
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't retry if this is the last attempt
      if (attempt > maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      // Add random jitter (±10%) to prevent thundering herd
      const jitter = delay * 0.1 * (Math.random() * 2 - 1);
      const finalDelay = Math.max(0, delay + jitter);

      console.log(`[Retry] Attempt ${attempt}/${maxRetries + 1}, retrying in ${Math.round(finalDelay)}ms...`);

      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError;
};

/**
 * Default retry condition
 * Retries on network errors and server errors (500+)
 * Does NOT retry on validation (400, 422), auth (401, 403), conflict (409), or not found (404)
 */
export const defaultShouldRetry = (error: any): boolean => {
  // Network error - no response
  if (!error?.response) {
    return true;
  }

  const status = error.response?.status;

  // Don't retry client errors (except 429 rate limit)
  if (status >= 400 && status < 500) {
    // Allow retry on rate limit (429)
    return status === 429;
  }

  // Retry on server errors (500+)
  if (status >= 500) {
    return true;
  }

  return false;
};

/**
 * Retries a request with exponential backoff and abort signal support
 * Useful for forms that might be cancelled
 */
export const retryWithAbort = async <T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: RetryOptions & { signal?: AbortSignal } = {}
): Promise<T> => {
  const { signal, ...retryOptions } = options;

  return retryWithBackoff(
    () => {
      // Check if aborted before retrying
      if (signal?.aborted) {
        const error = new DOMException('Aborted', 'AbortError');
        throw error;
      }

      return fn(signal as AbortSignal);
    },
    retryOptions
  );
};
