// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getBarterUsers, updateUserProfile, blockUser, reportUser } = require('../controllers/userController');
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

module.exports = router;