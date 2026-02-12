const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  instructorAvatar: { type: String },
  thumbnail: { type: String, required: true },
  videoUrl: { type: String, required: true }, // ✅ ADDED: Video URL from Cloudinary
  description: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // ✅ ADDED: View count
  duration: { type: String },
  category: { type: String },
  level: { type: String, default: 'Beginner' },
  tags: [{ type: String }],
  enrolledCount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' }, // ✅ ADDED: Visibility
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);