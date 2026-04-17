const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { issueOtp, validateOtp } = require('./Otp');
const { createAccessToken, createRefreshToken, rotateRefreshToken } = require('./Token');
const { verifyGoogleIdToken } = require('./Google');

const sanitizeProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone_number,
  address: user.address,
  business: user.business,
  profile_pic: user.profile_pic,
});

const generateRegistrationOtp = async (email) => {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingUser) {
    throw new ApiError(409, 'User already exists with this email');
  }

  return issueOtp({ email, purpose: 'register' });
};

const generateForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return issueOtp({ email, purpose: 'reset_password' });
};

const registerUser = async ({ name, email, phone, address, password, otp_jwt_token, otp }) => {
  await validateOtp({
    email,
    otp,
    otpJwtToken: otp_jwt_token,
    purpose: 'register',
  });

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingUser) {
    throw new ApiError(409, 'User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    phone_number: phone,
    address,
    password,
  });

  return {
    status: 'success',
    message: 'User registered successfully',
    auth_jwt_token: createAccessToken(user),
    user: sanitizeProfile(user),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    auth_jwt_token: createAccessToken(user),
    refresh_token: await createRefreshToken(user.id),
    status: 'success',
    message: 'Login successful',
  };
};

const loginWithGoogle = async ({ google_id_token }) => {
  const payload = await verifyGoogleIdToken(google_id_token);
  let user = await User.findOne({ email: payload.email.toLowerCase() });
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      google_id: payload.sub,
      profile_pic: payload.picture || '',
      password: null,
    });
    isNewUser = true;
  } else if (!user.google_id) {
    user.google_id = payload.sub;
    if (!user.profile_pic && payload.picture) {
      user.profile_pic = payload.picture;
    }
    await user.save();
  }

  return {
    auth_jwt_token: createAccessToken(user),
    refresh_token: await createRefreshToken(user.id),
    is_new_user: isNewUser,
    status: 'success',
  };
};

const refreshAccessToken = async ({ refresh_token }) => {
  const { userId, refreshToken } = await rotateRefreshToken(refresh_token);
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    auth_jwt_token: createAccessToken(user),
    refresh_token: refreshToken,
    status: 'success',
  };
};

const resetPassword = async ({ email, otp_jwt_token, otp, new_password }) => {
  await validateOtp({
    email,
    otp,
    otpJwtToken: otp_jwt_token,
    purpose: 'reset_password',
  });

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = new_password;
  await user.save();

  return {
    status: 'success',
    message: 'Password reset successful',
  };
};

module.exports = {
  generateRegistrationOtp,
  generateForgotPasswordOtp,
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  resetPassword,
};
