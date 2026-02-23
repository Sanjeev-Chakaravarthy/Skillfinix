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

// Upload file (images, videos, audio, documents) - strictly one per payload
router.post('/upload', chatFileUpload.single('file'), uploadFiles);

module.exports = router;