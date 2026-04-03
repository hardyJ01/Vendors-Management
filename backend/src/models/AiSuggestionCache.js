const mongoose = require('mongoose');

const aiSuggestionCacheSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suggestions: {
      type: mongoose.Schema.Types.Mixed, // JSON array of ranked bill suggestions
      required: true,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 45 * 60 * 1000), // 45 minutes (within 30–60 min window)
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired cache entries from MongoDB
aiSuggestionCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// One cache entry per user (latest wins)
aiSuggestionCacheSchema.index({ user_id: 1 });

module.exports = mongoose.model('AiSuggestionCache', aiSuggestionCacheSchema);