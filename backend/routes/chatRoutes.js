const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadFiles
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatFileUpload } = require('../config/cloudinary');

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

// Upload files (images, videos, audio, documents) - up to 10 files
router.post('/upload', chatFileUpload.array('files', 10), uploadFiles);

module.exports = router;