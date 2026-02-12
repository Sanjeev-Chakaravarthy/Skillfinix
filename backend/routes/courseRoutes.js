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
  getStats
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary').upload;

// Get Recommended Courses - MUST BE BEFORE /:id to avoid conflict
router.get('/recommended', getRecommendedCourses);
router.get('/categories', getCategories);
router.get('/stats', getStats);

router.route('/')
  .get(getCourses)
  .post(protect, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
