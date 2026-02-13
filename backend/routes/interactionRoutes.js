const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  toggleInteraction,
  recordHistory,
  getInteractionsByType,
  checkInteraction,
  clearHistory
} = require('../controllers/interactionController');

router.post('/', protect, toggleInteraction);
router.post('/history', protect, recordHistory);
router.delete('/history', protect, clearHistory);
router.get('/check/:courseId/:type', protect, checkInteraction);
router.get('/:type', protect, getInteractionsByType);

module.exports = router;
