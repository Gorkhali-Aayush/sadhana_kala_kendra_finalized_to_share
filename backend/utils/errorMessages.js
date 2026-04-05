/**
 * User-friendly error message mappings
 * Converts technical errors into human-readable messages for all CRUD operations
 */

export const ERROR_MESSAGES = {
  // ============ PASSWORD ERRORS ============
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
  PASSWORD_NEW_TOO_SHORT: "New password must be at least 12 characters (minimum requirement)",
  PASSWORD_WEAK: "Password must include uppercase, lowercase, numbers, and special characters (@$!%*?&)",
  PASSWORDS_DO_NOT_MATCH: "Your passwords don't match. Please check again",
  CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect. Please try again",
  CURRENT_PASSWORD_REQUIRED: "Current password is required",
  PASSWORD_UPDATE_FAILED: "We couldn't update your password. Please try again later",
  PASSWORD_SAME_AS_OLD: "Your new password must be different from your current password",
  
  // ============ AUTHENTICATION ERRORS ============
  ADMIN_NOT_FOUND: "Your account could not be found. Please contact support",
  SESSION_EXPIRED: "Your session has expired. Please log in again",
  UNAUTHORIZED: "You don't have permission to perform this action",
  
  // ============ COMMON FIELD ERRORS ============
  TITLE_REQUIRED: "Title is required. Please fill this field",
  DESCRIPTION_REQUIRED: "Description is required. Please fill this field",
  NAME_REQUIRED: "Name is required. Please fill this field",
  SLUG_REQUIRED: "Slug is required. Please fill this field",
  PRICE_REQUIRED: "Price is required. Please fill this field",
  PRICE_INVALID: "Price must be a valid number (e.g., 500, 999.99)",
  PRICE_NEGATIVE: "Price cannot be negative",
  
  // ============ SLUG ERRORS ============
  SLUG_ALREADY_EXISTS: (entity = "item") => `This slug is already in use. Please choose a different one`,
  SLUG_FORMAT_INVALID: "Slug must be lowercase with hyphens only (e.g., my-course-name)",
  SLUG_TOO_LONG: "Slug must not exceed 100 characters",
  
  // ============ COURSE SPECIFIC ERRORS ============
  COURSE_TITLE_REQUIRED: "Course title is required",
  COURSE_LEVEL_REQUIRED: "Please select a course level (Beginner, Intermediate, or Advanced)",
  COURSE_LEVEL_INVALID: "Course level must be Beginner, Intermediate, or Advanced",
  COURSE_PRICE_INVALID: "Course price must be a valid non-negative number",
  COURSE_TEACHER_INVALID: "Please select a valid teacher",
  COURSE_IMAGE_REQUIRED: "Course image is required",
  COURSE_IMAGE_UPLOAD_FAILED: "Failed to upload course image. Please try again",
  COURSE_NOT_FOUND: "Course not found",
  
  // ============ TEACHER SPECIFIC ERRORS ============
  TEACHER_NAME_REQUIRED: "Teacher name is required. Please fill this field",
  TEACHER_SPECIALIZATION_REQUIRED: "Specialization is required. Please fill this field",
  TEACHER_IMAGE_UPLOAD_FAILED: "Failed to upload teacher image. Please try again",
  TEACHER_NOT_FOUND: "Teacher not found",
  
  // ============ GALLERY SPECIFIC ERRORS ============
  GALLERY_TITLE_REQUIRED: "Gallery title is required",
  GALLERY_IMAGE_REQUIRED: "Gallery image is required",
  GALLERY_IMAGE_UPLOAD_FAILED: "Failed to upload gallery image. Please try again",
  GALLERY_NOT_FOUND: "Gallery item not found",
  
  // ============ EVENT SPECIFIC ERRORS ============
  EVENT_TITLE_REQUIRED: "Event title is required",
  EVENT_DATE_REQUIRED: "Event date is required",
  EVENT_DATE_INVALID: "Please enter a valid date",
  EVENT_DATE_PAST: "Event date cannot be in the past",
  EVENT_NOT_FOUND: "Event not found",
  
  // ============ NEWS SPECIFIC ERRORS ============
  NEWS_TITLE_REQUIRED: "News title is required",
  NEWS_CONTENT_REQUIRED: "News content is required",
  NEWS_NOT_FOUND: "News item not found",
  
  // ============ ACTIVITY SPECIFIC ERRORS ============
  ACTIVITY_TITLE_REQUIRED: "Activity title is required",
  ACTIVITY_NOT_FOUND: "Activity not found",
  
  // ============ OFFER SPECIFIC ERRORS ============
  OFFER_TITLE_REQUIRED: "Offer title is required",
  OFFER_DISCOUNT_REQUIRED: "Discount percentage is required",
  OFFER_DISCOUNT_INVALID: "Discount must be between 0 and 100",
  OFFER_NOT_FOUND: "Offer not found",
  
  // ============ FILE UPLOAD ERRORS ============
  FILE_TOO_LARGE: "File size exceeds 50MB limit. Please upload a smaller file",
  FILE_TYPE_INVALID: "Invalid file type. Please upload an image",
  NO_FILE_UPLOADED: "Please select a file to upload",
  FILE_UPLOAD_FAILED: "File upload failed. Please try again",
  
  // ============ DISPLAY ORDER ERRORS ============
  DISPLAY_ORDER_INVALID: "Display order must be a valid number",
  DISPLAY_ORDER_CONFLICT: "This display order is already in use. Please choose a different one",
  
  // ============ OPERATION ERRORS ============
  OPERATION_FAILED: "Operation failed. Please try again",
  CREATE_FAILED: (entity = "item") => `Failed to create ${entity}. Please try again`,
  UPDATE_FAILED: (entity = "item") => `Failed to update ${entity}. Please try again`,
  DELETE_FAILED: (entity = "item") => `Failed to delete ${entity}. Please try again`,
  
  // ============ GENERIC ERRORS ============
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again later",
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested item was not found",
};

/**
 * Maps validation errors to user-friendly messages
 * @param {Array} validationErrors - Array of validation errors from express-validator
 * @returns {Object} - Object with field names as keys and user-friendly messages as values
 */
export const mapValidationErrors = (validationErrors) => {
  const mappedErrors = {};
  
  if (!validationErrors || validationErrors.length === 0) {
    return mappedErrors;
  }

  validationErrors.forEach(error => {
    const { param, msg } = error;
    
    // Map technical error messages to user-friendly ones
    let userMessage = msg;
    
    if (msg.includes("Old password") && msg.includes("8 characters")) {
      userMessage = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    } else if (msg.includes("Password must be at least 12")) {
      userMessage = ERROR_MESSAGES.PASSWORD_NEW_TOO_SHORT;
    } else if (msg.includes("uppercase, lowercase, number")) {
      userMessage = ERROR_MESSAGES.PASSWORD_WEAK;
    } else if (msg.includes("Passwords do not match")) {
      userMessage = ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH;
    }
    
    mappedErrors[param] = userMessage;
  });
  
  return mappedErrors;
};

/**
 * Gets user-friendly error message for API response errors
 * @param {string} technicalError - The technical error message
 * @param {number} statusCode - HTTP status code
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (technicalError, statusCode = 500) => {
  // Check for known patterns
  if (technicalError.includes("Incorrect") || technicalError.includes("does not match")) {
    return ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT;
  }
  
  if (technicalError.includes("not found")) {
    return ERROR_MESSAGES.ADMIN_NOT_FOUND;
  }
  
  if (technicalError.includes("Password") && technicalError.includes("update")) {
    return ERROR_MESSAGES.PASSWORD_UPDATE_FAILED;
  }
  
  if (statusCode === 401) {
    return ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT;
  }
  
  if (statusCode === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  
  if (statusCode === 500) {
    return ERROR_MESSAGES.OPERATION_FAILED;
  }
  
  return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
};

/**
 * Creates field-specific error response for CRUD operations
 * Used when validation or business logic fails on a specific field
 * @param {string} field - The field name
 * @param {string} message - The error message
 * @returns {Object} - Response object with field-specific errors
 */
export const createFieldError = (field, message) => {
  return {
    errors: [
      {
        field,
        message
      }
    ]
  };
};

/**
 * Creates multiple field-specific errors
 * @param {Array} fieldErrors - Array of {field, message} objects
 * @returns {Object} - Response object with field-specific errors
 */
export const createFieldErrors = (fieldErrors) => {
  return {
    errors: fieldErrors || []
  };
};

/**
 * Handles slug duplication errors
 * @param {string} entity - The entity type (course, teacher, etc.)
 * @returns {Object} - Error response with user-friendly message
 */
export const slugAlreadyExists = (entity = "item") => {
  return {
    errors: [
      {
        field: "slug",
        message: ERROR_MESSAGES.SLUG_ALREADY_EXISTS(entity)
      }
    ]
  };
};
