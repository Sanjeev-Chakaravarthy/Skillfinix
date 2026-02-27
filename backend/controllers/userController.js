const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');

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

    // Read current block state — lean query, no Mongoose overhead
    const currentUser = await User.findById(currentUserId).select('blockedUsers').lean();
    if (!currentUser) {
      return res.status(404).json({ message: 'Your account was not found' });
    }

    // Guard: verify target user actually exists
    const targetExists = await User.exists({ _id: userIdToBlock });
    if (!targetExists) {
      return res.status(404).json({ message: 'User to block/unblock was not found' });
    }

    const isCurrentlyBlocked = (currentUser.blockedUsers || []).some(
      (id) => id && id.toString() === userIdToBlock
    );

    // ✅ Atomic update — does NOT trigger full Mongoose schema validation.
    // This prevents failures caused by invalid enum values in OTHER fields
    // (e.g. role: 'developver' typo) from breaking the block operation.
    if (isCurrentlyBlocked) {
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { blockedUsers: new mongoose.Types.ObjectId(userIdToBlock) } },
        { runValidators: false }
      );
    } else {
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { blockedUsers: new mongoose.Types.ObjectId(userIdToBlock) } },
        { runValidators: false }
      );
    }

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

// @desc    Get a single user's public profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(id)
      .select('-password -blockedUsers')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server Error' });
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

// @desc    Follow / Unfollow a user (toggle)
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized — please log in' });
    }

    const currentUserId = req.user._id.toString();

    // Validate target ID
    if (!targetUserId || ['undefined', 'null', ''].includes(targetUserId)) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user ID format' });
    }

    // Prevent self-follow
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Ensure both users exist
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).select('following'),
      User.findById(targetUserId).select('followers name')
    ]);

    if (!currentUser) return res.status(404).json({ message: 'Your account was not found' });
    if (!targetUser) return res.status(404).json({ message: 'User to follow was not found' });

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const currentObjectId = new mongoose.Types.ObjectId(currentUserId);

    const isFollowing = (currentUser.following || []).some(
      (id) => id && id.toString() === targetUserId
    );

    if (isFollowing) {
      // UNFOLLOW
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { following: targetObjectId } }, { runValidators: false }),
        User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentObjectId } }, { runValidators: false })
      ]);
    } else {
      // FOLLOW (addToSet prevents duplicates)
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetObjectId } }, { runValidators: false }),
        User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentObjectId } }, { runValidators: false })
      ]);
    }

    // Return updated follower count
    const updatedTarget = await User.findById(targetUserId).select('followers');
    const followerCount = updatedTarget?.followers?.length ?? 0;

    const action = isFollowing ? 'unfollowed' : 'followed';
    console.log(`✅ [Follow] ${currentUserId} ${action} ${targetUserId}`);

    return res.status(200).json({
      success: true,
      message: `User ${action} successfully`,
      isFollowing: !isFollowing,
      followerCount
    });
  } catch (error) {
    console.error('💥 [Follow Error]:', error.name, '-', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }
    return res.status(500).json({ message: 'Server error — failed to update follow status' });
  }
};

// @desc    Get or create a 1-to-1 conversation between current user and target
// @route   POST /api/users/:id/conversation
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id.toString();

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid target user ID' });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const targetExists = await User.exists({ _id: targetUserId });
    if (!targetExists) return res.status(404).json({ message: 'User not found' });

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(currentUserId),
          new mongoose.Types.ObjectId(targetUserId)
        ]
      }
    }).populate('participants', 'name avatar email');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [
          new mongoose.Types.ObjectId(currentUserId),
          new mongoose.Types.ObjectId(targetUserId)
        ],
        settings: []
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar email');
    }

    // Find the OTHER user's data to return to frontend
    const otherUser = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId
    );

    return res.status(200).json({
      success: true,
      conversation,
      otherUser
    });
  } catch (error) {
    console.error('💥 [Conversation Error]:', error.message);
    return res.status(500).json({ message: 'Server error — failed to get or create conversation' });
  }
};

module.exports = {
  getBarterUsers,
  updateUserProfile,
  blockUser,
  reportUser,
  getUserById,
  followUser,
  getOrCreateConversation
};
