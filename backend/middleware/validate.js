import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results and return formatted error response
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// 1. Auth Validations
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1, max: 128 }).withMessage('Password cannot exceed 128 characters'),
  handleValidationErrors,
];

export const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty().withMessage('Refresh token is required')
    .isHexadecimal().withMessage('Invalid refresh token format'),
  handleValidationErrors,
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits'),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors,
];

export const validateResetPassword = [
  param('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isHexadecimal().withMessage('Invalid reset token format'),
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
  handleValidationErrors,
];

// 2. Contact Validation
export const validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 2, max: 200 }).withMessage('Subject must be between 2 and 200 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5, max: 5000 }).withMessage('Message must be between 5 and 5000 characters'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits'),
  handleValidationErrors,
];

// 3. Coupon Validation
export const validateCouponCode = [
  body('code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 2, max: 30 }).withMessage('Coupon code must be between 2 and 30 characters')
    .matches(/^[A-Za-z0-9_-]+$/).withMessage('Coupon code must contain only alphanumeric characters, dashes, or underscores'),
  body('orderAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Order amount must be a positive number'),
  handleValidationErrors,
];

// 4. Payment Validations
export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1, max: 50 }).withMessage('Order must contain between 1 and 50 items')
    .custom((items, { req }) => {
      req.body.items = items.map((item, idx) => {
        const itemId = String(item.itemId || item.id || item._id || '').trim();
        const itemType = String(item.itemType || item.type || 'TestSeries').trim();
        if (!itemId || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
          throw new Error(`Valid Item ID is required for item #${idx + 1}`);
        }
        if (!['TestSeries', 'StudyMaterial', 'SingleModelPaper', 'NonPharmaResource'].includes(itemType)) {
          throw new Error(`Invalid Item Type "${itemType}" for item #${idx + 1}`);
        }
        return {
          ...item,
          itemId,
          itemType,
        };
      });
      return true;
    }),
  body('couponCode')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 }).withMessage('Coupon code cannot exceed 30 characters'),
  handleValidationErrors,
];

export const validateVerifyPayment = [
  body('razorpay_order_id')
    .trim()
    .notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .trim()
    .notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .trim()
    .notEmpty().withMessage('Razorpay signature is required'),
  handleValidationErrors,
];

export const validateFreeCheckout = [
  body('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required'),
  handleValidationErrors,
];

// 5. Test Attempt Validation
export const validateSubmitAttempt = [
  body('paperId')
    .notEmpty().withMessage('Paper ID is required')
    .isMongoId().withMessage('Invalid paper ID format'),
  body('answers')
    .isArray().withMessage('Answers must be an array'),
  body('timeSpentSeconds')
    .optional()
    .isInt({ min: 0, max: 86400 }).withMessage('Time spent must be a valid integer between 0 and 86400 seconds'),
  handleValidationErrors,
];
