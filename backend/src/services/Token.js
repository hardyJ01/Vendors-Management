const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken } = require('../utils/JWT');
const ApiError = require('../utils/ApiError');

const createAccessToken = (user) =>
  signAccessToken({
    user_id: user.id,
    email: user.email,
  });

const createRefreshToken = async (userId) => {
  const rawToken = crypto.randomBytes(48).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 12);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    revoked: false,
  });

  return jwt.sign({ user_id: userId, token: rawToken }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

const rotateRefreshToken = async (signedRefreshToken) => {
  let payload;

  try {
    payload = jwt.verify(signedRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokens = await RefreshToken.find({
    user_id: payload.user_id,
    revoked: false,
    expires_at: { $gt: new Date() },
  });

  let matchedToken = null;

  for (const tokenDoc of tokens) {
    const isMatch = await bcrypt.compare(payload.token, tokenDoc.token_hash);
    if (isMatch) {
      matchedToken = tokenDoc;
      break;
    }
  }

  if (!matchedToken) {
    throw new ApiError(401, 'Refresh token has been revoked or is invalid');
  }

  matchedToken.revoked = true;
  await matchedToken.save();

  const refreshToken = await createRefreshToken(payload.user_id);

  return {
    userId: payload.user_id,
    refreshToken,
  };
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
};
