const express = require('express');
const router = express.Router();
const { reportUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', reportUser);

module.exports = router;
