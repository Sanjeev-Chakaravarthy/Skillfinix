const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, createCategory);

module.exports = router;
