const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'favorite', 'watch_later', 'history'],
    required: true
  },
}, { timestamps: true });

// One interaction type per user per course
interactionSchema.index({ user: 1, course: 1, type: 1 }, { unique: true });
interactionSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
