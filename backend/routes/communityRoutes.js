const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  toggleJoinCommunity,
  addPost,
  togglePostLike
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/communities');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local storage for communities
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `community-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const localUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    const filetypes = /jpe?g|png|webp/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (JPEG, PNG, WEBP)'));
  }
});

router.route('/')
  .get(getCommunities)
  .post(protect, localUpload.single('coverImage'), createCommunity);

router.route('/:id')
  .get(getCommunity)
  .put(protect, localUpload.single('coverImage'), updateCommunity)
  .delete(protect, deleteCommunity);

router.route('/:id/join')
  .put(protect, toggleJoinCommunity);

router.route('/:id/posts')
  .post(protect, addPost);

router.route('/:id/posts/:postId/like')
  .put(protect, togglePostLike);

module.exports = router;
