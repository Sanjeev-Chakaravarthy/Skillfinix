const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technical', 'Payment', 'Account', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  adminReply: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
