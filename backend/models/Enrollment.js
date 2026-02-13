const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  progress: { type: Number, default: 0, min: 0, max: 100 }, // Percentage
  completed: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now },
  watchedDuration: { type: Number, default: 0 }, // seconds watched
}, { timestamps: true });

// One enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, lastWatchedAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
