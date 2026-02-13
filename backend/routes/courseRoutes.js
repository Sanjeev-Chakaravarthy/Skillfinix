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
  getInstructorCourses
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary').upload;

// Public Routes
router.get('/recommended', getRecommendedCourses);
router.get('/categories', getCategories);
router.get('/stats', getStats);

// Private Studio Routes (Must fail before /:id)
// Analytics
router.get('/studio/analytics', protect, getStudioStats);
// My Created Courses
router.get('/instructor/my-courses', protect, getInstructorCourses);

// Main Resource Routes
router.route('/')
  .get(getCourses)
  .post(
    protect, 
    upload.fields([
      { name: 'video', maxCount: 1 }, 
      { name: 'thumbnail', maxCount: 1 }
    ]), 
    createCourse
  );

router.route('/:id')
  .get(getCourseById)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
