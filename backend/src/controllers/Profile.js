const catchAsync = require('../utils/CatchAsync');
const profileService = require('../services/Profile');

const getUser = catchAsync(async (req, res) => {
  const data = await profileService.getUserProfile(req.user.id);
  res.status(200).json(data);
});

const updateUser = catchAsync(async (req, res) => {
  const response = await profileService.updateUserProfile(req.user.id, req.body, req.file);
  res.status(200).json({
    ...response,
    error: null,
  });
});

module.exports = {
  getUser,
  updateUser,
};
