const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String
    },
    fileType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'file'],
      default: 'text'
    },
    read: {
      type: Boolean,
      default: false
    },
    // ✅ NEW: Track delivery status in DB
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    // ✅ NEW: For disappearing messages
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, delivered: 1 }); // For undelivered queries
messageSchema.index({ receiver: 1, read: 1 }); // For unread queries

module.exports = mongoose.model('Message', messageSchema);