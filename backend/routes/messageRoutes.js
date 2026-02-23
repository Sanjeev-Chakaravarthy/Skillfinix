const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadFiles,
  clearChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatFileUpload } = require('../config/cloudinary');

router.use(protect);

router.get('/:userId', getMessages);
router.post('/', sendMessage);
router.put('/read/:userId', markAsRead);
router.get('/unread-count', getUnreadCount);
router.post('/upload', chatFileUpload.single('file'), uploadFiles);
router.delete('/conversation/:id', clearChat);

module.exports = router;
