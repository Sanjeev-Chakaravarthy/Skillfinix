const Discussion = require('../models/Discussion');
const { createNotification } = require('./notificationController');
const Course = require('../models/Course');

// @desc    Get discussions for a course
// @route   GET /api/discussions/:courseId
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a discussion to a course
// @route   POST /api/discussions/:courseId
// @access  Private
const addDiscussion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const discussion = await Discussion.create({
      course: req.params.courseId,
      user: req.user.id,
      text
    });

    await discussion.populate('user', 'name avatar role');

    // Notify course owner if it's not them commenting
    if (course.user && course.user.toString() !== req.user.id) {
      await createNotification(
        course.user,
        'New Discussion',
        `${discussion.user.name} commented on your skill "${course.title}"`,
        'course',
        `/course/${course._id}`
      );
    }

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reply to a discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const replyDiscussion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.replies.push({
      user: req.user.id,
      text
    });

    await discussion.save();
    
    // Repopulate right away before sending back
    const populatedDiscussion = await Discussion.findById(req.params.id)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role');

    res.status(200).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle like on a discussion
// @route   PUT /api/discussions/:id/like
// @access  Private
const toggleDiscussionLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const userIdStr = req.user.id.toString();
    const hasLikedIndex = discussion.likes.findIndex(id => id.toString() === userIdStr);

    if (hasLikedIndex !== -1) {
      // Unlike
      discussion.likes.splice(hasLikedIndex, 1);
    } else {
      // Like
      discussion.likes.push(req.user.id);
    }

    await discussion.save();
    
    // Repopulate
    const populatedDiscussion = await Discussion.findById(req.params.id)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role');

    res.status(200).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDiscussions, addDiscussion, replyDiscussion, toggleDiscussionLike };
