const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadFiles,
  muteConversation,
  favouriteConversation,
  setDisappearingTimer,
  clearChat,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatFileUpload } = require('../config/supabase');

// All routes require authentication
router.use(protect);

// Get all conversations
router.get('/conversations', getConversations);

// Get messages with a specific user
router.get('/messages/:userId', getMessages);

// Send a message
router.post('/messages', sendMessage);

// Mark messages as read
router.put('/messages/read/:userId', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Upload file (images, videos, audio, documents) — one file per request
// Files go to Supabase Storage (skillchat-files bucket)
router.post('/upload', chatFileUpload.single('file'), uploadFiles);

// New WhatsApp-style features
router.put('/conversations/:id/mute', muteConversation);
router.put('/conversations/:id/favourite', favouriteConversation);
router.put('/conversations/:id/disappearing', setDisappearingTimer);
router.delete('/messages/conversation/:id', clearChat);
router.delete('/conversations/:id', deleteChat);

module.exports = router;