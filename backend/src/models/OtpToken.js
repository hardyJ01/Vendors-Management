const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const otpTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    email: { type: String, required: true, lowercase: true, trim: true },
    otp_hash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['register', 'reset_password'],
      required: true,
    },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  schemaOptions
);

module.exports = mongoose.model('OtpToken', otpTokenSchema, 'otp_tokens');
