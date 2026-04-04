const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'done', 'disputed'],
      default: 'pending',
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null, // Set when the bill is settled
    },
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurrence_frequency: {
      type: String,
      enum: ['weekly', 'monthly', null],
      default: null,
    },
    is_split: {
      type: Boolean,
      default: false,
    },
    split_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SplitGroup',
      default: null,
    },
  },
  {
    timestamps: true, // provides createdAt and updatedAt
  }
);

const Bill= mongoose.model('Bill', billSchema);
export default Bill;