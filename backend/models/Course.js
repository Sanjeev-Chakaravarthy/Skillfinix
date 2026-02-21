const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  instructorAvatar: { type: String },
  thumbnail: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  duration: { type: String }, // Format: "MM:SS" — set from real video metadata
  category: { type: String },
  level: { type: String, default: 'Beginner' },
  tags: [{ type: String }],
  enrolledCount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
}, { timestamps: true });

// ── Indexes for production query performance ──────────────────────────────────
courseSchema.index({ title: 'text', description: 'text', tags: 'text' }); // full-text search
courseSchema.index({ visibility: 1, category: 1, level: 1 });             // filtered browse
courseSchema.index({ views: -1 });                                          // popular sort
courseSchema.index({ enrolledCount: -1 });                                  // trending sort
courseSchema.index({ rating: -1 });                                         // top rated sort
courseSchema.index({ createdAt: -1 });                                      // newest sort
courseSchema.index({ user: 1, createdAt: -1 });                            // creator's courses

module.exports = mongoose.model('Course', courseSchema);