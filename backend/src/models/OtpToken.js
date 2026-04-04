const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp_hash: {
      type: String,
      required: true, // Bcrypt hash of the OTP value
    },
    expires_at: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
    },
    used: {
      type: Boolean,
      default: false, // true once the OTP has been consumed
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired OTP documents from MongoDB
otpTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const OtpToken= mongoose.model('OtpToken', otpTokenSchema);
export default OtpToken;