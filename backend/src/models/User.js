const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
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
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      default: null,
    },
    google_id: {
      type: String,
      default: null,
      index: true,
    },
    vendors: {
      type: [String],
      ref: 'User',
      default: [],
    },
    business: {
      type: String,
      trim: true,
      default: '',
    },
    profile_pic: {
      type: String,
      default: '',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
    },
    no_rating: {
      type: Number,
      default: 0,
      min: 0,
    },
    budget_overall: {
      type: Number,
      default: null,
      min: 0,
    },
    budget_per_vendor: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    ...schemaOptions,
    timestamps: true,
  }
);

userSchema.pre('save', async function userPreSave(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema, 'users');
