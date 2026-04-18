import User from '../models/User.js';
import Rating from '../models/Rating.js';
import { ansyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// GET /api/get_vendors — user's saved vendors list
export const getVendors = ansyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId)
    .populate('vendors', 'name business profile_pic phone_number rating no_rating')
    .lean();

  if (!user) {
    return res.status(404).json({ status: 404, message: 'User not found', error: 'Not Found' });
  }

  const vendors = (user.vendors || []).map(v => ({
    vendor_id: v._id,
    name: v.name,
    business: v.business || '',
    profile_pic: v.profile_pic || '',
    phone_number: v.phone_number || '',
    rating: v.rating || 0,
    no_rating: v.no_rating || 0,
  }));

  res.status(200).json(new ApiResponse(200, 'Vendors fetched successfully', vendors));
});

// GET /api/get_all_vendors — search all users (excludes self)
export const getAllVendors = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name_query, business_query } = req.query;

  const filter = { _id: { $ne: userId } };
  if (name_query) {
    filter.name = { $regex: name_query, $options: 'i' };
  }
  if (business_query) {
    filter.business = { $regex: business_query, $options: 'i' };
  }

  const vendors = await User.find(filter)
    .select('name business rating no_rating profile_pic')
    .lean();

  const formatted = vendors.map(v => ({
    vendor_id: v._id,
    name: v.name,
    business: v.business || '',
    rating: v.rating || 0,
    no_rating: v.no_rating || 0,
    profile_pic: v.profile_pic || '',
  }));

  res.status(200).json(new ApiResponse(200, 'All vendors fetched successfully', formatted));
});

// POST /api/add_vendor
export const addVendor = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { vendor_id } = req.body;

  if (!vendor_id) {
    return res.status(400).json({ status: 400, message: 'vendor_id is required', error: 'Bad Request' });
  }

  // Check vendor exists
  const vendor = await User.findById(vendor_id);
  if (!vendor) {
    return res.status(404).json({ status: 404, message: 'Vendor not found', error: 'Not Found' });
  }

  // Add to user's vendors array (avoid duplicates)
  await User.findByIdAndUpdate(userId, { $addToSet: { vendors: vendor_id } });

  res.status(201).json(new ApiResponse(201, 'Vendor added successfully'));
});

// GET /api/get_vendor/:vendor_id
export const getVendor = ansyncHandler(async (req, res) => {
  const vendorId = req.params.vendor_id;

  const vendor = await User.findById(vendorId)
    .select('name business rating no_rating phone_number address email profile_pic')
    .lean();

  if (!vendor) {
    return res.status(404).json({ status: 404, message: 'Vendor not found', error: 'Not Found' });
  }

  res.status(200).json(
    new ApiResponse(200, 'Vendor fetched successfully', {
      name: vendor.name,
      business: vendor.business || '',
      rating: vendor.rating || 0,
      no_rating: vendor.no_rating || 0,
      phone_number: vendor.phone_number || '',
      address: vendor.address || '',
      email: vendor.email,
      profile_pic: vendor.profile_pic || '',
    })
  );
});

// GET /api/has_rated/:vendor_id
export const hasRated = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  const vendorId = req.params.vendor_id;

  const existing = await Rating.findOne({ user_id: userId, vendor_id: vendorId });

  res.status(200).json(
    new ApiResponse(200, 'Rating check', { has_rated: !!existing, rating: existing?.rating || null })
  );
});

// POST /api/rate
export const rateVendor = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { vendor_id, rating } = req.body;

  if (!vendor_id || rating == null) {
    return res.status(400).json({ status: 400, message: 'vendor_id and rating are required', error: 'Bad Request' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ status: 400, message: 'Rating must be between 1 and 5', error: 'Bad Request' });
  }

  // Upsert the rating
  await Rating.findOneAndUpdate(
    { user_id: userId, vendor_id },
    { rating },
    { upsert: true, new: true }
  );

  // Recalculate vendor's average rating
  const allRatings = await Rating.find({ vendor_id });
  const totalRatings = allRatings.length;
  const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

  await User.findByIdAndUpdate(vendor_id, {
    rating: Math.round(avgRating * 10) / 10,
    no_rating: totalRatings,
  });

  res.status(201).json(new ApiResponse(201, 'Rating submitted successfully'));
});
