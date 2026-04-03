const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // Deep link opened when notification is clicked
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // provides createdAt
  }
);

module.exports = mongoose.model('Notification', notificationSchema);