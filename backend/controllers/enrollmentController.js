const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { createNotification } = require('./notificationController');

// @desc    Enroll user in a course (or create if doesn't exist)
// @route   POST /api/enrollments
// @access  Private
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Upsert enrollment
    let enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    
    if (enrollment) {
      // Already enrolled, update lastWatchedAt
      enrollment.lastWatchedAt = Date.now();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: courseId
      });

      // Increment enrolled count on course
      course.enrolledCount = (course.enrolledCount || 0) + 1;
      await course.save();

      // Create notification
      await createNotification(
        req.user.id,
        'Course Enrolled',
        `You enrolled in "${course.title}"`,
        'course',
        `/course/${courseId}`
      );
    }

    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update progress for a course
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { progress, watchedDuration } = req.body;
    const { courseId } = req.params;

    let enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });

    if (!enrollment) {
      // Auto-enroll if watching
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: courseId,
        progress: Math.min(progress || 0, 100),
        watchedDuration: watchedDuration || 0,
        lastWatchedAt: Date.now()
      });
    } else {
      // Only update if new progress is higher
      if (progress !== undefined && progress > enrollment.progress) {
        enrollment.progress = Math.min(progress, 100);
      }
      if (watchedDuration !== undefined) {
        enrollment.watchedDuration = (enrollment.watchedDuration || 0) + watchedDuration;
      }
      enrollment.lastWatchedAt = Date.now();
      enrollment.completed = enrollment.progress >= 100;
      await enrollment.save();

      // Achievement notification on completion
      if (enrollment.completed && enrollment.progress >= 100) {
        const course = await Course.findById(courseId);
        await createNotification(
          req.user.id,
          'Course Completed! 🎉',
          `Congratulations! You completed "${course?.title}"`,
          'achievement',
          `/course/${courseId}`
        );
      }
    }

    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's enrolled courses with progress
// @route   GET /api/enrollments
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course')
      .sort({ lastWatchedAt: -1 });

    // Filter out enrollments where course was deleted
    const valid = enrollments.filter(e => e.course !== null);

    const result = valid.map(e => ({
      ...e.course.toObject(),
      progress: e.progress,
      completed: e.completed,
      lastWatchedAt: e.lastWatchedAt,
      watchedDuration: e.watchedDuration,
      enrollmentId: e._id
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recently watched courses (for sidebar)
// @route   GET /api/enrollments/recent
// @access  Private
const getRecentEnrollments = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const enrollments = await Enrollment.find({ user: req.user.id, progress: { $lt: 100 } })
      .populate('course', 'title thumbnail duration instructor instructorAvatar')
      .sort({ lastWatchedAt: -1 })
      .limit(parseInt(limit));

    const result = enrollments
      .filter(e => e.course !== null)
      .map(e => ({
        _id: e.course._id,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        duration: e.course.duration,
        instructor: e.course.instructor,
        instructorAvatar: e.course.instructorAvatar,
        progress: e.progress
      }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { enrollInCourse, updateProgress, getMyEnrollments, getRecentEnrollments };
