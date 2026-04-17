const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const aiSuggestionCacheSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true, unique: true },
    suggestions: { type: Array, default: [] },
    generated_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
  },
  schemaOptions
);

module.exports = mongoose.model('AiSuggestionCache', aiSuggestionCacheSchema, 'ai_suggestion_cache');
