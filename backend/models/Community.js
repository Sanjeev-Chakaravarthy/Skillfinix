const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: [{ // Users who liked the post
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a community name'],
    trim: true,
    unique: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    index: true
  },
  coverImage: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [postSchema]
}, { timestamps: true });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtuals are included when converting to JSON
communitySchema.set('toJSON', { virtuals: true });
communitySchema.set('toObject', { virtuals: true });

// Text Index for searching
communitySchema.index({ name: 'text', description: 'text', category: 'text' });
// Compound Index for popular communities
communitySchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Community', communitySchema);
