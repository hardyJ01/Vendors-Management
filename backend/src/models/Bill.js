const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const billSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true },
    vendor_id: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'done', 'disputed'],
      default: 'pending',
    },
    payment_id: { type: String, ref: 'Payment', default: null },
    is_recurring: { type: Boolean, default: false },
    recurrence_frequency: {
      type: String,
      enum: ['weekly', 'monthly', null],
      default: null,
    },
    is_split: { type: Boolean, default: false },
    split_group_id: { type: String, ref: 'SplitGroup', default: null },
    created_at: { type: Date, default: Date.now },
  },
  schemaOptions
);

module.exports = mongoose.model('Bill', billSchema, 'bills');
