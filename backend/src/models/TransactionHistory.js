const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const transactionHistorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'payment', 'received'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
  },
  schemaOptions
);

module.exports = mongoose.model('TransactionHistory', transactionHistorySchema, 'transaction_histories');
