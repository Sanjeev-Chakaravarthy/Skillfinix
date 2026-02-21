const express = require('express');
const router = express.Router();
const { createSwap, getMySwaps, acceptSwap, rejectSwap, completeSwap, getSwapStats } = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', getSwapStats);
router.get('/', protect, getMySwaps);
router.post('/', protect, createSwap);
router.put('/:id/accept', protect, acceptSwap);
router.put('/:id/reject', protect, rejectSwap);
router.put('/:id/complete', protect, completeSwap);

module.exports = router;
