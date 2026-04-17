const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const splitGroupSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    created_by: { type: String, ref: 'User', required: true },
    total_amount: { type: Number, required: true, min: 0 },
    vendor_id: { type: String, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
  },
  schemaOptions
);

module.exports = mongoose.model('SplitGroup', splitGroupSchema, 'split_groups');
