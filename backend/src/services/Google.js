const { OAuth2Client } = require('google-auth-library');
const ApiError = require('../utils/ApiError');

const verifyGoogleIdToken = async (googleIdToken) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'GOOGLE_CLIENT_ID is not configured');
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: googleIdToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new ApiError(401, 'Invalid Google identity token');
  }

  return payload;
};

module.exports = {
  verifyGoogleIdToken,
};
