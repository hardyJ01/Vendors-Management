const { body } = require('express-validator');

const generateOtpValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('otp_jwt_token').notEmpty().withMessage('otp_jwt_token is required'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4 to 6 digits'),
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const googleValidation = [
  body('google_id_token').notEmpty().withMessage('google_id_token is required'),
];

const refreshValidation = [
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('otp_jwt_token').notEmpty().withMessage('otp_jwt_token is required'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4 to 6 digits'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('new_password must be at least 6 characters'),
];

module.exports = {
  generateOtpValidation,
  registerValidation,
  loginValidation,
  googleValidation,
  refreshValidation,
  resetPasswordValidation,
};
