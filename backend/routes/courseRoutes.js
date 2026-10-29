const express = require('express');
const router = express.Router();
const {
  getCourses,
  getRecommendedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getStats,
  getStudioStats,
  getInstructorCourses,
  toggleCourseVisibility,
  getCourseAnalytics,
  toggleLikeCourse,
  toggleDislikeCourse,
  getCourseDownloadUrl,
  recordCourseView,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { videoUpload } = require('../config/upload');

// Public Routes
router.get('/recommended', getRecommendedCourses);
router.get('/categories', getCategories);
router.get('/stats', getStats);

// Private Studio Routes (Must fail before /:id)
// Analytics
router.get('/studio/analytics', protect, getStudioStats);
// Specific video analytics
router.get('/analytics/:videoId', protect, getCourseAnalytics);
// My Created Courses
router.get('/instructor/my-courses', protect, getInstructorCourses);

// Main Resource Routes
router.route('/')
  .get(getCourses)
  .post(
    protect, 
    videoUpload.fields([
      { name: 'video', maxCount: 1 }, 
      { name: 'thumbnail', maxCount: 1 }
    ]), 
    createCourse
  );

router.route('/:id')
  .get(getCourseById)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

// Must be after /:id to prevent conflicts - owner-only status toggle
router.patch('/:id/visibility', protect, toggleCourseVisibility);

// Interactions
router.post('/:id/like', protect, toggleLikeCourse);
router.post('/:id/dislike', protect, toggleDislikeCourse);
router.get('/:id/download', protect, getCourseDownloadUrl);

// Public/Optional Interaction
// Notice we DON'T use `protect` here since anonymous users can trigger views
const jwt = require('jsonwebtoken');
const optionalUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore token decode errors for optional endpoints
    }
  }
  next();
};

router.post('/:id/view', optionalUser, recordCourseView);

module.exports = router;
