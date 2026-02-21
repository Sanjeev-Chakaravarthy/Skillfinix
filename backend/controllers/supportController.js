const SupportTicket = require('../models/SupportTicket');

// @desc   Create a support ticket
// @route  POST /api/support
// @access Private
const createTicket = async (req, res) => {
  try {
    const { subject, description, category } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }
    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      description,
      category: category || 'Other',
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Get tickets for logged-in user
// @route  GET /api/support/my-tickets
// @access Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Update ticket status (admin only)
// @route  PUT /api/support/:id/status
// @access Private (admin)
const updateTicketStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const { status, adminReply } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createTicket, getMyTickets, updateTicketStatus };
