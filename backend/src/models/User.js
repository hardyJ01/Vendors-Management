const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      default: null, // null for Google OAuth-only users
    },
    google_id: {
      type: String,
      default: null,
      sparse: true, // allows multiple nulls in unique index
      unique: true,
    },
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    business: {
      type: String,
      trim: true,
    },
    profile_pic: {
      type: String, // URL
    },
    balance: {
      type: Number,
      default: 0,
      // IMPORTANT: Never update directly. Use atomic DB transactions only.
    },
    rating: {
      type: Number,
      default: 0,
    },
    no_rating: {
      type: Number,
      default: 0,
    },
    budget_overall: {
      type: Number,
      default: null, // Optional monthly spending budget limit
    },
    budget_per_vendor: {
      type: Map,
      of: Number,
      default: {}, // Map of vendor ObjectId (as string) → monthly spending limit
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);