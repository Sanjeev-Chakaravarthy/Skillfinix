const mongoose = require('mongoose');

const videoViewSchema = mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Enforce that each user can only view a video once
videoViewSchema.index({ videoId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('VideoView', videoViewSchema);
