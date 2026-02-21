const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{ // Users who liked this discussion
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

discussionSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
