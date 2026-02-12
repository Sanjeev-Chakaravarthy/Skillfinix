// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getBarterUsers, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');

// Get barter users
router.get('/barters', protect, getBarterUsers);

// Update profile with Cloudinary avatar upload
router.put('/profile', protect, uploadAvatar.single('avatar'), updateUserProfile);

module.exports = router;