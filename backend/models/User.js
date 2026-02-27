const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://github.com/shadcn.png' },
  bio: { type: String, default: 'New to Skillfinix!' },

  // Core barter fields
  skills: [{ type: String }],           // Skills this user CAN TEACH (formerly skills)
  interests: [{ type: String }],        // Skills this user WANTS TO LEARN

  // Enhanced skill barter profile
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },

  // Only two roles: user and admin (no mentor)
  role: { type: String, enum: ['user', 'student', 'admin'], default: 'user', lowercase: true },

  location: { type: String, default: 'Earth' },
  
  // Array of blocked users
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Follow system
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ── Indexes for production query performance ──────────────────────────────────
// Text index on skills and interests for fast barter matching
userSchema.index({ skills: 'text', interests: 'text' });
userSchema.index({ role: 1 });
userSchema.index({ skillLevel: 1 });

module.exports = mongoose.model('User', userSchema);