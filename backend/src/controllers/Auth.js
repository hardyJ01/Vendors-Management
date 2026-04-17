const catchAsync = require('../utils/CatchAsync');
const authService = require('../services/Auth');

const generateOtp = catchAsync(async (req, res) => {
  const otpJwtToken = await authService.generateRegistrationOtp(req.body.email);
  res.status(200).json({
    status: 'success',
    otp_jwt_token: otpJwtToken,
    error: null,
  });
});

const register = catchAsync(async (req, res) => {
  const response = await authService.registerUser(req.body);
  res.status(201).json({
    ...response,
    error: null,
  });
});

const login = catchAsync(async (req, res) => {
  const response = await authService.loginUser(req.body);
  res.status(200).json({
    ...response,
    error: null,
  });
});

const googleAuth = catchAsync(async (req, res) => {
  const response = await authService.loginWithGoogle(req.body);
  res.status(200).json({
    ...response,
    error: null,
  });
});

const refresh = catchAsync(async (req, res) => {
  const response = await authService.refreshAccessToken(req.body);
  res.status(200).json({
    ...response,
    error: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const otpJwtToken = await authService.generateForgotPasswordOtp(req.body.email);
  res.status(200).json({
    status: 'success',
    otp_jwt_token: otpJwtToken,
    error: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const response = await authService.resetPassword(req.body);
  res.status(200).json({
    ...response,
    error: null,
  });
});

module.exports = {
  generateOtp,
  register,
  login,
  googleAuth,
  refresh,
  forgotPassword,
  resetPassword,
};
