const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one rating per user per vendor (use upsert on this pair)
ratingSchema.index({ user_id: 1, vendor_id: 1 }, { unique: true });

const Rating= mongoose.model('Rating', ratingSchema);
export default Rating;