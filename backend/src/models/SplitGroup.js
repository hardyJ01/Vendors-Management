const mongoose = require('mongoose');

const splitGroupSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // provides createdAt
  }
);

module.exports = mongoose.model('SplitGroup', splitGroupSchema);