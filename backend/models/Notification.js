const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'barter', 'course', 'achievement'],
    default: 'info' 
  },
  read: { type: Boolean, default: false },
  link: { type: String }, // Optional deep link (e.g. /course/123)
  meta: { type: mongoose.Schema.Types.Mixed }, // Flexible metadata
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
