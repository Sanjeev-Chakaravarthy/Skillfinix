const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, updateTicketStatus } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.put('/:id/status', protect, updateTicketStatus);

module.exports = router;
