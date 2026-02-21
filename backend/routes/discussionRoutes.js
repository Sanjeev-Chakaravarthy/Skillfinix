const express = require('express');
const router = express.Router();
const { getDiscussions, addDiscussion, replyDiscussion, toggleDiscussionLike } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId', getDiscussions);
router.post('/:courseId', protect, addDiscussion);
router.post('/:id/reply', protect, replyDiscussion);
router.put('/:id/like', protect, toggleDiscussionLike);

module.exports = router;
