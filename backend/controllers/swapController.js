const SkillSwap = require('../models/SkillSwap');
const User = require('../models/User');

// @desc   Create a swap request
// @route  POST /api/swaps
// @access Private
const createSwap = async (req, res) => {
  try {
    const { recipientId, teachSkill, learnSkill, message, requesterLevel } = req.body;

    if (!recipientId || !teachSkill || !learnSkill) {
      return res.status(400).json({ message: 'Recipient, teach skill, and learn skill are required.' });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'You cannot send a swap request to yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found.' });

    // Check for duplicate pending/accepted request
    const existing = await SkillSwap.findOne({
      requester: req.user.id,
      recipient: recipientId,
      status: { $in: ['Pending', 'Accepted'] },
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have an active swap request with this user.' });
    }

    const swap = await SkillSwap.create({
      requester: req.user.id,
      recipient: recipientId,
      teachSkill,
      learnSkill,
      requesterLevel: requesterLevel || 'Beginner',
      message: message || '',
    });

    await swap.populate([
      { path: 'requester', select: 'name avatar skills interests' },
      { path: 'recipient', select: 'name avatar skills interests' },
    ]);

    res.status(201).json(swap);
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Get my swaps (sent + received)
// @route  GET /api/swaps
// @access Private
const getMySwaps = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = {};

    if (role === 'sent') {
      query.requester = req.user.id;
    } else if (role === 'received') {
      query.recipient = req.user.id;
    } else {
      query = { $or: [{ requester: req.user.id }, { recipient: req.user.id }] };
    }

    if (status) query.status = status;

    const swaps = await SkillSwap.find(query)
      .populate('requester', 'name avatar skills interests')
      .populate('recipient', 'name avatar skills interests')
      .sort({ createdAt: -1 });

    res.status(200).json(swaps);
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Accept a swap request
// @route  PUT /api/swaps/:id/accept
// @access Private (recipient only)
const acceptSwap = async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found.' });

    if (swap.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the recipient can accept this swap.' });
    }

    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: `Swap is already ${swap.status}.` });
    }

    swap.status = 'Accepted';
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name avatar skills interests' },
      { path: 'recipient', select: 'name avatar skills interests' },
    ]);

    res.status(200).json(swap);
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Reject a swap request
// @route  PUT /api/swaps/:id/reject
// @access Private (recipient only)
const rejectSwap = async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found.' });

    if (swap.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the recipient can reject this swap.' });
    }

    if (swap.status !== 'Pending') {
      return res.status(400).json({ message: `Swap is already ${swap.status}.` });
    }

    swap.status = 'Rejected';
    await swap.save();

    res.status(200).json(swap);
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Mark a swap as completed + optional rating
// @route  PUT /api/swaps/:id/complete
// @access Private (either party)
const completeSwap = async (req, res) => {
  try {
    const swap = await SkillSwap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found.' });

    const isRequester = swap.requester.toString() === req.user.id;
    const isRecipient = swap.recipient.toString() === req.user.id;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ message: 'Not part of this swap.' });
    }

    if (swap.status !== 'Accepted') {
      return res.status(400).json({ message: 'Only accepted swaps can be completed.' });
    }

    const { rating, feedback } = req.body;

    if (isRequester) {
      if (rating) swap.requesterRating = rating;
      if (feedback) swap.requesterFeedback = feedback;
    } else {
      if (rating) swap.recipientRating = rating;
      if (feedback) swap.recipientFeedback = feedback;
    }

    swap.status = 'Completed';
    swap.completedAt = new Date();
    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'name avatar skills interests' },
      { path: 'recipient', select: 'name avatar skills interests' },
    ]);

    res.status(200).json(swap);
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Get swap stats (for homepage/barters)
// @route  GET /api/swaps/stats
// @access Public
const getSwapStats = async (req, res) => {
  try {
    const total = await SkillSwap.countDocuments();
    const completed = await SkillSwap.countDocuments({ status: 'Completed' });
    const pending = await SkillSwap.countDocuments({ status: 'Pending' });
    const accepted = await SkillSwap.countDocuments({ status: 'Accepted' });

    // Most popular teach skills
    const popularSkills = await SkillSwap.aggregate([
      { $group: { _id: '$teachSkill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ total, completed, pending, accepted, popularSkills });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createSwap, getMySwaps, acceptSwap, rejectSwap, completeSwap, getSwapStats };
