const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const paymentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    bill_id: { type: String, ref: 'Bill', required: true },
    user_id: { type: String, ref: 'User', required: true },
    vendor_id: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  schemaOptions
);

module.exports = mongoose.model('Payment', paymentSchema, 'payments');
