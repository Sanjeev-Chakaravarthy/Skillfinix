const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Get users for bartering (excluding current user)
// @route   GET /api/users/barters
// @access  Private
const getBarterUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { _id: { $ne: req.user.id } }; // Exclude current user
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { interests: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching barter users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, location, skills, interests } = req.body;
    
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    
    if (skills) {
      // Handle both string (comma separated) and array
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    
    if (interests) {
      user.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());
    }

    // Handle Avatar Upload (Cloudinary)
    if (req.file) {
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      location: updatedUser.location,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      role: updatedUser.role,
      token: generateToken(updatedUser._id), // Optional: refresh token if needed, usually not for profile update
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper to generate token (if we want to refresh it, though typically not needed for profile update unless claims change)
const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Block or unblock a user (WhatsApp-style toggle)
// @route   PUT /api/users/block/:id
// @access  Private
const blockUser = async (req, res) => {
  try {
    const { id: userIdToBlock } = req.params;

    // Guard: auth middleware must have attached req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized — please log in again' });
    }

    const currentUserId = req.user._id.toString();

    // Guard: valid target ID present
    if (!userIdToBlock || ['undefined', 'null', ''].includes(userIdToBlock)) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Guard: validate target ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userIdToBlock)) {
      return res.status(400).json({ message: 'Invalid target user ID format' });
    }

    // Guard: can't block yourself
    if (userIdToBlock === currentUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    // Fetch fresh current user document (re-fetching ensures we have a mutable Mongoose document)
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Your account was not found' });
    }

    // Guard: verify target user actually exists
    const targetExists = await User.exists({ _id: userIdToBlock });
    if (!targetExists) {
      return res.status(404).json({ message: 'User to block/unblock was not found' });
    }

    // Initialise blockedUsers array if missing (handles legacy accounts)
    if (!Array.isArray(currentUser.blockedUsers)) {
      currentUser.blockedUsers = [];
    }

    const isCurrentlyBlocked = currentUser.blockedUsers.some(
      (id) => id && id.toString() === userIdToBlock
    );

    if (isCurrentlyBlocked) {
      // UNBLOCK — pull the entry out
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        (id) => id && id.toString() !== userIdToBlock
      );
    } else {
      // BLOCK — only add if not already present (double-block guard)
      currentUser.blockedUsers.push(userIdToBlock);
    }

    // Auto-heal legacy users with uppercase roles (e.g., 'Student') before saving
    if (currentUser.role && currentUser.role !== currentUser.role.toLowerCase()) {
      currentUser.role = currentUser.role.toLowerCase();
    }

    await currentUser.save();

    const action = isCurrentlyBlocked ? 'unblocked' : 'blocked';
    console.log(`✅ [Block] ${currentUserId} ${action} ${userIdToBlock}`);

    return res.status(200).json({
      success: true,
      message: `User ${action} successfully`,
      isBlocked: !isCurrentlyBlocked,
    });
  } catch (error) {
    console.error('💥 [Block Error]:', error.name, '-', error.message);
    // CastError means an invalid ObjectId slipped through — return 400 not 500
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }
    return res.status(500).json({
      message: 'Server error — failed to update block status',
      details: error.message,
    });
  }
};

// @desc    Report a user
// @route   POST /api/users/report
// @access  Private
const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, messageIds } = req.body;
    const reporterId = req.user.id;

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      messages: messageIds || []
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getBarterUsers,
  updateUserProfile,
  blockUser,
  reportUser
};
