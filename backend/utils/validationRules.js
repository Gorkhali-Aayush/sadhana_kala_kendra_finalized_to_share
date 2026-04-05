import { body, param, query, validationResult } from 'express-validator';

/**
 * Comprehensive validation rules for all endpoints
 */

// ============ PASSWORD COMPLEXITY VALIDATION ============
export const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const validatePasswordComplexity = (fieldName = 'password') =>
  body(fieldName)
    .isLength({ min: 12 })
    .withMessage('New password must be at least 12 characters long')
    .matches(passwordComplexityRegex)
    .withMessage(
      'New password must contain uppercase, lowercase, numbers, and special characters (@$!%*?&)'
    );

// ============ COMMON VALIDATIONS ============
export const validateEmail = (fieldName = 'email') =>
  body(fieldName)
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail();

export const validatePhoneNumber = (fieldName = 'phone') =>
  body(fieldName)
    .trim()
    .matches(/^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/)
    .withMessage('Invalid phone number format');

export const validateUsername = (fieldName = 'username') =>
  body(fieldName)
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscore, and hyphen')
    .escape();

export const validateSlug = (fieldName = 'slug') =>
  body(fieldName)
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase with hyphens only')
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters');

export const validateTitle = (fieldName = 'title') =>
  body(fieldName)
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
    .escape();

export const validateDescription = (fieldName = 'description') =>
  body(fieldName)
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters')
    .escape();

export const validatePrice = (fieldName = 'price') =>
  body(fieldName)
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a valid number between 0 and 999999.99');

export const validateDisplayOrder = (fieldName = 'display_order') =>
  body(fieldName)
    .isInt({ min: 0, max: 9999 })
    .withMessage('Display order must be an integer between 0 and 9999')
    .optional({ checkFalsy: true });

export const validateId = (fieldName = 'id') =>
  param(fieldName)
    .isInt({ min: 1 })
    .withMessage('Invalid ID format');

// ============ COURSE VALIDATIONS ============
export const validateCourseCreation = [
  validateTitle('title'),
  validateSlug('slug'),
  validateDescription('description'),
  validatePrice('price'),
  body('level')
    .trim()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Course level must be Beginner, Intermediate, or Advanced')
    .escape(),
  validateDisplayOrder('display_order'),
];

export const validateCourseUpdate = [
  ...validateCourseCreation,
  body('teacher_id')
    .isInt({ min: 1 })
    .withMessage('Please select a valid teacher')
    .optional(),
];

export const validateEventCreation = [
  validateTitle('title'),
  validateSlug('slug'),
  validateDescription('description'),
  validateDisplayOrder('display_order'),
  body('event_date')
    .isISO8601()
    .withMessage('Event date must be a valid date')
    .optional({ checkFalsy: true }),
];

export const validateNewsCreation = [
  validateTitle('title'),
  validateSlug('slug'),
  validateDescription('description'),
  validateDisplayOrder('display_order'),
];

export const validateGalleryCreation = [
  validateTitle('title'),
  validateDescription('description'),
  validateDisplayOrder('display_order'),
];

// ============ TEACHER VALIDATIONS ============
export const validateTeacherCreation = [
  body('full_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Teacher name is required and must be less than 100 characters')
    .escape(),
  body('specialization')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Specialization is required and must be less than 200 characters')
    .optional(),
  body('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase with hyphens only')
    .optional({ checkFalsy: true }),
  validateDisplayOrder('display_order'),
];

// ============ ACTIVITY VALIDATIONS ============
export const validateActivityCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Activity title is required')
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Activity description is required')
    .optional(),
  validateDisplayOrder('display_order'),
];

// ============ OFFER VALIDATIONS ============
export const validateOfferCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Offer title is required')
    .escape(),
  body('discount_percentage')
    .isInt({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100%'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase with hyphens only')
    .optional({ checkFalsy: true }),
  validateDisplayOrder('display_order'),
];

// ============ REGISTRATION VALIDATIONS ============
export const validateStudentRegistration = [
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .escape(),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .escape(),
  validateEmail('email'),
  validatePhoneNumber('phone'),
  body('course_id')
    .isInt({ min: 1 })
    .withMessage('Invalid course ID'),
];

// ============ PUBLIC REGISTRATION VALIDATIONS ============
export const validatePublicRegistration = [
  body('full_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name is required and must be less than 100 characters')
    .escape(),
  validateEmail('email'),
  validatePhoneNumber('phone'),
  body('course_id')
    .isInt({ min: 1 })
    .withMessage('Invalid course ID'),
  body('address')
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters')
    .optional({ checkFalsy: true })
    .escape(),
  body('age')
    .isInt({ min: 5, max: 120 })
    .withMessage('Age must be between 5 and 120')
    .optional({ checkFalsy: true }),
  body('occupation')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must be less than 100 characters')
    .optional({ checkFalsy: true })
    .escape(),
];

// ============ ADMIN VALIDATIONS ============
export const validateAdminLogin = [
  validateUsername('username'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const validateAdminPasswordChange = [
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 8 })
    .withMessage('Current password must be at least 8 characters'),
  validatePasswordComplexity('newPassword'),
];

// ============ MIDDLEWARE FOR HANDLING VALIDATION ERRORS ============
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
