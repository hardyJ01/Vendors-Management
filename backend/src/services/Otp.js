const bcrypt = require('bcryptjs');
const OtpToken = require('../models/OtpToken');
const { signOtpToken, verifyOtpToken } = require('../utils/JWT');
const { generateOtpValue } = require('../utils/OTP');
const ApiError = require('../utils/ApiError');
const { sendOtpEmail } = require('./Email');

const issueOtp = async ({ email, purpose }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = generateOtpValue();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const otpToken = await OtpToken.create({
    email: normalizedEmail,
    otp_hash: otpHash,
    purpose,
    expires_at: expiresAt,
    used: false,
  });

  const otpJwtToken = signOtpToken({
    otp_token_id: otpToken.id,
    email: normalizedEmail,
    purpose,
  });

  await sendOtpEmail({ email: normalizedEmail, otp, purpose });

  return otpJwtToken;
};

const validateOtp = async ({ email, otp, otpJwtToken, purpose }) => {
  let payload;

  try {
    payload = verifyOtpToken(otpJwtToken);
  } catch (error) {
    throw new ApiError(401, 'OTP token is invalid or expired');
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (payload.email !== normalizedEmail || payload.purpose !== purpose || !payload.otp_token_id) {
    throw new ApiError(400, 'OTP token does not match the request');
  }

  const otpRecord = await OtpToken.findById(payload.otp_token_id);

  if (!otpRecord) {
    throw new ApiError(404, 'OTP record not found');
  }

  if (otpRecord.used) {
    throw new ApiError(400, 'OTP has already been used');
  }

  if (otpRecord.expires_at < new Date()) {
    throw new ApiError(400, 'OTP has expired');
  }

  const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

  if (!isValidOtp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  otpRecord.used = true;
  await otpRecord.save();
};

module.exports = {
  issueOtp,
  validateOtp,
};
