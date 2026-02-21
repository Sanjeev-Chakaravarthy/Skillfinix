const mongoose = require('mongoose');

/**
 * Category model — stored in DB so they can be dynamically managed (not hardcoded).
 * Covers ALL domain types: tech, lifestyle, arts, finance, etc.
 */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  // Icon name hint for the frontend
  icon: { type: String, default: 'Layers' },
  color: { type: String, default: '#6366f1' },
  // Sort order for display
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
