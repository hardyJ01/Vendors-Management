const QRCode = require('qrcode');
const catchAsync = require('../utils/CatchAsync');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getUserQrCode = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId).lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const payload = JSON.stringify({
    user_id: user._id,
    name: user.name,
    email: user.email,
  });

  const svg = await QRCode.toString(payload, { type: 'svg' });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
});

module.exports = {
  getUserQrCode,
};
