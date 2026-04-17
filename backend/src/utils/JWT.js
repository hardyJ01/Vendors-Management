const jwt = require('jsonwebtoken');

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

const signOtpToken = (payload) =>
  jwt.sign(payload, process.env.JWT_OTP_SECRET, {
    expiresIn: process.env.JWT_OTP_EXPIRES_IN || '10m',
  });

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyOtpToken = (token) => jwt.verify(token, process.env.JWT_OTP_SECRET);

module.exports = {
  signAccessToken,
  signOtpToken,
  verifyAccessToken,
  verifyOtpToken,
};
