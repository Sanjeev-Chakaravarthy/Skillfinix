const Interaction = require('../models/Interaction');
const Course = require('../models/Course');

// @desc    Toggle an interaction (like, favorite, watch_later)
// @route   POST /api/interactions
// @access  Private
const toggleInteraction = async (req, res) => {
  try {
    const { courseId, type } = req.body;

    if (!['like', 'favorite', 'watch_later'].includes(type)) {
      return res.status(400).json({ message: 'Invalid interaction type' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Interaction.findOne({ user: req.user.id, course: courseId, type });

    if (existing) {
      await existing.deleteOne();
      res.status(200).json({ active: false, message: `Removed from ${type}` });
    } else {
      await Interaction.create({ user: req.user.id, course: courseId, type });
      res.status(201).json({ active: true, message: `Added to ${type}` });
    }
  } catch (error) {
    console.error('Interaction error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Record history (watching a course)
// @route   POST /api/interactions/history
// @access  Private
const recordHistory = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Upsert — if history entry exists, just update the timestamp
    await Interaction.findOneAndUpdate(
      { user: req.user.id, course: courseId, type: 'history' },
      { user: req.user.id, course: courseId, type: 'history', updatedAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'History recorded' });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's interactions by type
// @route   GET /api/interactions/:type
// @access  Private
const getInteractionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!['like', 'favorite', 'watch_later', 'history'].includes(type)) {
      return res.status(400).json({ message: 'Invalid interaction type' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interactions = await Interaction.find({ user: req.user.id, type })
      .populate('course')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interaction.countDocuments({ user: req.user.id, type });

    const courses = interactions
      .filter(i => i.course !== null)
      .map(i => ({
        ...i.course.toObject(),
        interactionId: i._id,
        interactedAt: i.updatedAt
      }));

    res.status(200).json({ courses, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get interactions error:', error);   
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check if a specific interaction exists
// @route   GET /api/interactions/check/:courseId/:type
// @access  Private
const checkInteraction = async (req, res) => {
  try {
    const { courseId, type } = req.params;
    const exists = await Interaction.findOne({ user: req.user.id, course: courseId, type });
    res.status(200).json({ active: !!exists });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear all history
// @route   DELETE /api/interactions/history
// @access  Private
const clearHistory = async (req, res) => {
  try {
    await Interaction.deleteMany({ user: req.user.id, type: 'history' });
    res.status(200).json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { toggleInteraction, recordHistory, getInteractionsByType, checkInteraction, clearHistory };
