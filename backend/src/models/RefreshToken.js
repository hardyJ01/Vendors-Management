const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token_hash: {
      type: String,
      required: true, // Hashed refresh token value
    },
    expires_at: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false, // true if the token has been invalidated
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired refresh token documents from MongoDB
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const RefreshToken= mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;