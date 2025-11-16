const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'employer', 'candidate', 'viewer'])
    .withMessage('Invalid role'),
  validate
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Job creation validation rules
 */
const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location is required'),
  body('salary')
    .optional()
    .isObject()
    .withMessage('Salary must be an object'),
  body('salary.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('experienceLevel')
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  validate
];

/**
 * Update job validation rules
 */
const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location is required'),
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'draft'])
    .withMessage('Invalid status'),
  validate
];

/**
 * Application validation rules
 */
const createApplicationValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('coverLetter')
    .trim()
    .isLength({ min: 100, max: 2000 })
    .withMessage('Cover letter must be between 100 and 2000 characters'),
  body('resume')
    .optional()
    .isURL()
    .withMessage('Resume must be a valid URL'),
  validate
];

/**
 * Update application status validation
 */
const updateApplicationStatusValidation = [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'])
    .withMessage('Invalid status'),
  validate
];

/**
 * ID parameter validation
 */
const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

/**
 * User role update validation
 */
const updateRoleValidation = [
  body('role')
    .isIn(['admin', 'employer', 'candidate', 'viewer'])
    .withMessage('Invalid role'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  createJobValidation,
  updateJobValidation,
  createApplicationValidation,
  updateApplicationStatusValidation,
  idParamValidation,
  updateRoleValidation,
  validate
};
