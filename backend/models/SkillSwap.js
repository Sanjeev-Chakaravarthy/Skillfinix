const mongoose = require('mongoose');

/**
 * SkillSwap: Tracks a skill-exchange request between two users.
 * User A (requester) can teach X skill and wants to learn Y skill from User B (recipient).
 */
const skillSwapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Skill requester offers to teach
  teachSkill: { type: String, required: true, trim: true },
  // Skill requester wants to learn from recipient
  learnSkill: { type: String, required: true, trim: true },
  // Skill level the requester identifies with
  requesterLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  // Optional message
  message: { type: String, default: '', trim: true },
  // Feedback / rating after completion
  completedAt: { type: Date },
  requesterRating: { type: Number, min: 1, max: 5 },
  recipientRating: { type: Number, min: 1, max: 5 },
  requesterFeedback: { type: String, default: '' },
  recipientFeedback: { type: String, default: '' },
}, { timestamps: true });

// A user can only have one pending/accepted swap request with the same recipient for the same skill pair
skillSwapSchema.index({ requester: 1, recipient: 1, teachSkill: 1, learnSkill: 1 });

module.exports = mongoose.model('SkillSwap', skillSwapSchema);
