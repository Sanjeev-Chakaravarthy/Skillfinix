const express = require('express');
const router = express.Router();
const { createSession, getSessions, joinSession, updateSessionStatus, getSessionById } = require('../controllers/liveSessionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSessions);
router.post('/', protect, createSession);
router.get('/:id', protect, getSessionById);
router.post('/:id/join', protect, joinSession);
router.put('/:id/status', protect, updateSessionStatus);

module.exports = router;
