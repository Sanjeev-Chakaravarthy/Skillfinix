const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  muteConversation,
  favouriteConversation,
  setDisappearingTimer,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createConversation);
router.get('/', getConversations);
router.put('/:id/mute', muteConversation);
router.put('/:id/favourite', favouriteConversation);
router.put('/:id/disappearing', setDisappearingTimer);
router.delete('/:id', deleteChat);

module.exports = router;
