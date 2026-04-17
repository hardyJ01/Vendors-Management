const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const schemaOptions = require('../utils/SchemaOptions');

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, ref: 'User', required: true },
    vendor_id: { type: String, ref: 'User', default: null },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  schemaOptions
);

module.exports = mongoose.model('Notification', notificationSchema, 'notifications');
