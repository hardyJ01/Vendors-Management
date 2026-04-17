const path = require('path');
const Rating = require('../models/Rating');
const User = require('../models/User');

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  const ratingDocs = await Rating.find({ vendor_id: userId }).lean();
  const raterIds = ratingDocs.map((item) => item.user_id);
  const raters = raterIds.length ? await User.find({ _id: { $in: raterIds } }).lean() : [];
  const raterMap = new Map(raters.map((item) => [item._id, item]));

  return {
    name: user.name,
    email: user.email,
    phone: user.phone_number,
    address: user.address,
    business: user.business,
    profile_pic: user.profile_pic,
    rating: user.rating,
    no_rating: user.no_rating,
    rating_history: ratingDocs.map((entry) => {
      const rater = raterMap.get(entry.user_id);

      return {
        name: rater?.name || 'Unknown user',
        rating: entry.rating,
        business: rater?.business || '',
        profile_pic: rater?.profile_pic || '',
      };
    }),
    qr_code_url: `${process.env.APP_URL || 'http://localhost:5000'}/api/users/${userId}/qr`,
  };
};

const updateUserProfile = async (userId, payload, file) => {
  const updateData = {};

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.phone !== undefined) updateData.phone_number = payload.phone;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.business !== undefined) updateData.business = payload.business;
  if (file) {
    updateData.profile_pic = `/${path
      .join(process.env.UPLOAD_DIR || 'uploads', 'profile-pics', file.filename)
      .replace(/\\/g, '/')}`;
  }

  await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

  return {
    status: 'success',
    message: 'Profile updated successfully',
  };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
