const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunity,
  createCommunity,
  toggleJoinCommunity,
  addPost,
  togglePostLike
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCommunities)
  .post(protect, createCommunity);

router.route('/:id')
  .get(getCommunity);

router.route('/:id/join')
  .put(protect, toggleJoinCommunity);

router.route('/:id/posts')
  .post(protect, addPost);

router.route('/:id/posts/:postId/like')
  .put(protect, togglePostLike);

module.exports = router;
