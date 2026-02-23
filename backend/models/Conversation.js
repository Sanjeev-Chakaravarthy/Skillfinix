const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Chat settings per user
    settings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        isFavourite: {
          type: Boolean,
          default: false,
        },
        disappearingTimer: {
          type: Number,
          default: 0, // in seconds (0 = off)
        },
      },
    ],
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
