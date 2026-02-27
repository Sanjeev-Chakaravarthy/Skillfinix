// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getBarterUsers,
  updateUserProfile,
  blockUser,
  reportUser,
  getUserById,
  followUser,
  getOrCreateConversation
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');

// Get barter users
router.get('/barters', protect, getBarterUsers);

// Update profile with Cloudinary avatar upload
router.put('/profile', protect, uploadAvatar.single('avatar'), updateUserProfile);

// Block user
router.put('/block/:id', protect, blockUser);

// Report user
router.post('/report', protect, reportUser);

// ── Follow System ────────────────────────────────────────────────────────────
// Toggle follow / unfollow
router.post('/:id/follow', protect, followUser);

// Get follow status (is current user following target?)
router.get('/:id/follow-status', protect, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id.toString();
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const User = require('../models/User');
    const currentUser = await User.findById(currentUserId).select('following');
    const targetUser = await User.findById(targetUserId).select('followers');

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = (currentUser.following || []).some(
      (id) => id && id.toString() === targetUserId
    );
    const followerCount = targetUser.followers?.length ?? 0;

    return res.status(200).json({ isFollowing, followerCount });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Messaging ───────────────────────────────────────────────────────────────
// Get or create a conversation with another user
router.post('/:id/conversation', protect, getOrCreateConversation);

// ── Public profile ── must be LAST so it doesn't swallow named routes above
router.get('/:id', getUserById);

module.exports = router;