const express = require('express');
const controller = require('../controllers/Auth');
const validateRequest = require('../middlewares/Validate');
const {
  generateOtpValidation,
  registerValidation,
  loginValidation,
  googleValidation,
  refreshValidation,
  resetPasswordValidation,
} = require('../validators/Auth');

const router = express.Router();

router.post('/generate_otp', generateOtpValidation, validateRequest, controller.generateOtp);
router.post('/register', registerValidation, validateRequest, controller.register);
router.post('/login', loginValidation, validateRequest, controller.login);
router.post('/google', googleValidation, validateRequest, controller.googleAuth);
router.post('/refresh', refreshValidation, validateRequest, controller.refresh);
router.post('/forgot_password', generateOtpValidation, validateRequest, controller.forgotPassword);
router.post('/reset_password', resetPasswordValidation, validateRequest, controller.resetPassword);

module.exports = router;
