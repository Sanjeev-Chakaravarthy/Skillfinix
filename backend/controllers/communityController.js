const Community = require('../models/Community');
const User = require('../models/User'); // Required for Schema 'User' to populate correctly if first boot

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
const getCommunities = async (req, res) => {
  try {
    const { category, search, limit = 20 } = req.query;
    
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name avatar role')
      .populate('members', 'name avatar') // Might want to limit this if members list grows huge
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'name avatar role')
      .populate('members', 'name avatar role headline')
      .populate('posts.user', 'name avatar role')
      .populate('posts.likes', 'name avatar');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Create new community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, coverImage } = req.body;

    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Community name already exists' });
    }

    const community = await Community.create({
      name,
      description,
      category,
      coverImage: coverImage || undefined,
      createdBy: req.user.id,
      members: [req.user.id] // Creator is the first member
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Join or leave community
// @route   PUT /api/communities/:id/join
// @access  Private
const toggleJoinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.includes(req.user.id);

    if (isMember) {
      // Leave
      community.members = community.members.filter(id => id.toString() !== req.user.id);
    } else {
      // Join
      community.members.push(req.user.id);
    }

    await community.save();
    res.status(200).json({ 
      isMember: !isMember, 
      memberCount: community.members.length,
      message: !isMember ? 'Joined community' : 'Left community'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Add post to community
// @route   POST /api/communities/:id/posts
// @access  Private
const addPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Must be a member to post' });
    }

    const newPost = {
      user: req.user.id,
      text,
      likes: []
    };

    community.posts.unshift(newPost); // Add to beginning
    await community.save();

    // Re-fetch to populate user details for the new post
    const populatedCommunity = await Community.findById(req.params.id)
      .populate('posts.user', 'name avatar role');

    // The newly unshifted post is at index 0
    res.status(201).json(populatedCommunity.posts[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/communities/:id/posts/:postId/like
// @access  Private
const togglePostLike = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const post = community.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await community.save();
    res.status(200).json({ 
      isLiked: !isLiked, 
      likesCount: post.likes.length,
      likes: post.likes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  getCommunities,
  getCommunity,
  createCommunity,
  toggleJoinCommunity,
  addPost,
  togglePostLike
};
