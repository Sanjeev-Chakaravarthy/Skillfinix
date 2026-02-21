const LiveSession = require('../models/LiveSession');

// @desc   Create a live session (any authenticated user)
// @route  POST /api/live-sessions
// @access Private
const createSession = async (req, res) => {
  try {
    const { title, description, category, tags, scheduledAt, durationMinutes, meetingLink, maxParticipants, thumbnail } = req.body;

    const session = await LiveSession.create({
      title,
      description,
      category,
      tags,
      scheduledAt,
      durationMinutes,
      meetingLink,
      maxParticipants,
      thumbnail,
      mentor: req.user.id,
    });
    await session.populate('mentor', 'name avatar');
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Get all sessions (with filters: filter, status)
// @route  GET /api/live-sessions
// @access Private
const getSessions = async (req, res) => {
  try {
    const { filter, status } = req.query;
    const now = new Date();

    let query = {};

    if (status === 'live') {
      query.status = 'live';
    } else if (status === 'upcoming') {
      query.status = 'upcoming';
    } else if (status === 'ended') {
      query.status = 'ended';
    }

    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 86400000);
      query.scheduledAt = { $gte: startOfDay, $lt: endOfDay };
    } else if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
      query.scheduledAt = { $gte: startOfWeek, $lt: endOfWeek };
    } else if (filter === 'mine') {
      query.participants = req.user.id;
    }

    // Auto-sync statuses before returning
    const sessions = await LiveSession.find(query)
      .populate('mentor', 'name avatar')
      .sort({ scheduledAt: 1 });

    // Update statuses in-memory for the response
    const updatedSessions = sessions.map((s) => {
      const computed = s.computeStatus();
      if (computed !== s.status) {
        // Update in background (fire & forget)
        LiveSession.findByIdAndUpdate(s._id, { status: computed }).exec();
        s.status = computed;
      }
      return s;
    });

    res.status(200).json(updatedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Join a live session
// @route  POST /api/live-sessions/:id/join
// @access Private
const joinSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.participants.includes(req.user.id)) {
      return res.status(200).json({ message: 'Already joined', meetingLink: session.meetingLink });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }

    session.participants.push(req.user.id);
    await session.save();

    res.status(200).json({ message: 'Joined successfully', meetingLink: session.meetingLink, session });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Update session status (mentor/admin)
// @route  PUT /api/live-sessions/:id/status
// @access Private (mentor or admin)
const updateSessionStatus = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.mentor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, recordingUrl } = req.body;
    session.status = status || session.status;
    if (recordingUrl) session.recordingUrl = recordingUrl;
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Get single session by ID
// @route  GET /api/live-sessions/:id
// @access Private
const getSessionById = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('mentor', 'name avatar bio');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createSession, getSessions, joinSession, updateSessionStatus, getSessionById };
