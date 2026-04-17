const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const ratingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true },
    vendor_id: { type: String, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  {
    ...schemaOptions,
    timestamps: true,
  }
);

ratingSchema.index({ user_id: 1, vendor_id: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema, 'ratings');
