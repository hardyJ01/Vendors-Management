const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/JWT');
const User = require('../models/User');

const readToken = (req) => {
  const bearer = req.headers.authorization;

  if (bearer && bearer.startsWith('Bearer ')) {
    return bearer.split(' ')[1];
  }

  return req.headers.auth_jwt_token || null;
};

const authenticate = async (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.user_id);

    if (!user) {
      return next(new ApiError(401, 'Invalid authentication token'));
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

module.exports = authenticate;
