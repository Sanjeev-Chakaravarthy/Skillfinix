const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  
  // Scheduling
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  
  // Status: upcoming | live | ended
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  
  // Participants who joined
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Meeting link (e.g., Google Meet, Zoom, Jitsi)
  meetingLink: { type: String, default: '' },
  
  // Recording after session ends
  recordingUrl: { type: String, default: '' },
  
  // Max participants
  maxParticipants: { type: Number, default: 100 },
  
  thumbnail: { type: String, default: '' },
}, { timestamps: true });

// Auto-update status based on time
liveSessionSchema.methods.computeStatus = function () {
  const now = new Date();
  const start = new Date(this.scheduledAt);
  const end = new Date(start.getTime() + this.durationMinutes * 60 * 1000);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
};

module.exports = mongoose.model('LiveSession', liveSessionSchema);
