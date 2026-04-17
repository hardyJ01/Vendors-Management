const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const refreshTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true },
    token_hash: { type: String, required: true },
    expires_at: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  schemaOptions
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema, 'refresh_tokens');
