const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  enrollInCourse,
  updateProgress,
  getMyEnrollments,
  getRecentEnrollments
} = require('../controllers/enrollmentController');

router.get('/', protect, getMyEnrollments);
router.get('/recent', protect, getRecentEnrollments);
router.post('/', protect, enrollInCourse);
router.put('/:courseId/progress', protect, updateProgress);

module.exports = router;
