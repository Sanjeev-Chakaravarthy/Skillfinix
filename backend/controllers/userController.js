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

// @desc    Block or unblock a user
// @route   PUT /api/users/block/:id
// @access  Private
const blockUser = async (req, res) => {
  try {
    const userIdToBlock = req.params.id;
    const currentUserId = req.user._id.toString();

    console.log('Blocking request:', { from: currentUserId, to: userIdToBlock });

    if (!userIdToBlock || userIdToBlock === 'undefined') {
      return res.status(400).json({ message: 'Target user ID is missing' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (userIdToBlock === currentUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    // Ensure array exists
    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    const isBlocked = (user.blockedUsers || []).some(id => id && id.toString() === userIdToBlock.toString());

    if (isBlocked) {
      // Unblock
      user.blockedUsers = (user.blockedUsers || []).filter(id => id && id.toString() !== userIdToBlock.toString());
    } else {
      // Block
      user.blockedUsers.push(userIdToBlock);
    }

    await user.save();
    res.status(200).json({ 
      success: true, 
      message: isBlocked ? 'User unblocked' : 'User blocked',
      isBlocked: !isBlocked
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server Error', details: error.message });
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
