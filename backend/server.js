const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket/socketHandler');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));

// Increase body size limits for large video uploads
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Increase server timeout for large uploads (10 minutes)
server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 610000;

// Store connected users map
const connectedUsers = new Map();

// Make io & connectedUsers accessible to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/api/live-sessions', require('./routes/liveSessionRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/communities', require('./routes/communityRoutes'));

// ==========================================================================
// GLOBAL SEARCH ENDPOINT — searches across courses, users, and skills
// ==========================================================================
const User = require('./models/User');
const Course = require('./models/Course');
const SkillSwap = require('./models/SkillSwap');
const { protect } = require('./middleware/authMiddleware');

app.get('/api/search', protect, async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ courses: [], users: [], trending: [] });
    }

    const regex = new RegExp(q, 'i');
    let courses = [];
    let users = [];

    if (!type || type === 'all' || type === 'courses') {
      courses = await Course.find({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { tags: regex },
          { instructor: regex }
        ],
        visibility: 'public'
      }).sort({ views: -1 }).limit(10);
    }

    if (!type || type === 'all' || type === 'users') {
      users = await User.find({
        _id: { $ne: req.user.id },
        $or: [
          { name: regex },
          { skills: regex },
          { interests: regex }
        ]
      }).select('-password').limit(10);
    }

    // Trending: top categories matching query
    const trending = await Course.aggregate([
      { $match: { category: regex, visibility: 'public' } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgViews: { $avg: '$views' } } },
      { $sort: { avgViews: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ courses, users, trending });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================================================
// TRENDING ENDPOINT
// Returns courses with popularity score based on views + enrolledCount + swap demand.
// Also returns top demanded skills (from SkillSwap teachSkill frequency).
// ==========================================================================
app.get('/api/trending', async (req, res) => {
  try {
    const { type = 'all', limit = 20 } = req.query;

    // Top courses by views + enrolled
    let courses = [];
    if (type === 'all' || type === 'courses') {
      courses = await Course.find({ visibility: 'public' })
        .sort({ views: -1, enrolledCount: -1 })
        .limit(parseInt(limit));
    }

    // Top skills in demand: most requested teachSkill in SkillSwap
    let trendingSkills = [];
    if (type === 'all' || type === 'skills') {
      trendingSkills = await SkillSwap.aggregate([
        { $group: { _id: '$teachSkill', swapCount: { $sum: 1 }, demandCount: { $sum: 1 } } },
        { $sort: { swapCount: -1 } },
        { $limit: 20 },
        { $project: { skill: '$_id', swapCount: 1, _id: 0 } }
      ]);
    }

    // Category popularity: count skills by category from users
    let categoryStats = [];
    if (type === 'all' || type === 'categories') {
      categoryStats = await Course.aggregate([
        { $match: { visibility: 'public' } },
        { $group: { _id: '$category', courseCount: { $sum: 1 }, totalViews: { $sum: '$views' }, totalEnrolled: { $sum: '$enrolledCount' } } },
        { $sort: { totalViews: -1, courseCount: -1 } },
        { $limit: 15 }
      ]);
    }

    res.status(200).json({ courses, trendingSkills, categoryStats });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================================================
// POPULAR SKILLS PER CATEGORY (for SkillHunt page)
// ==========================================================================
app.get('/api/skills/popular', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    // Popular teach skills from swap requests, optionally by category
    // We merge course data (by category) with swap demand data
    let matchStage = {};
    if (category && category !== 'All') {
      matchStage = { category: { $regex: category, $options: 'i' } };
    }

    const popularByCourse = await Course.aggregate([
      { $match: { visibility: 'public', ...matchStage } },
      {
        $group: {
          _id: '$title',
          category: { $first: '$category' },
          totalViews: { $sum: '$views' },
          totalEnrolled: { $sum: '$enrolledCount' },
          avgRating: { $avg: '$rating' },
          courseId: { $first: '$_id' },
          thumbnail: { $first: '$thumbnail' },
        }
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ['$totalViews', 1] },
              { $multiply: ['$totalEnrolled', 5] }
            ]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json(popularByCourse);
  } catch (error) {
    console.error('Popular skills error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Setup Socket Handler
setupSocket(io, connectedUsers);

// Seed categories after DB connects
const { seedCategories } = require('./controllers/categoryController');
setTimeout(seedCategories, 2000); // slight delay ensures DB is connected

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum allowed size is 500MB.' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected file field.' });
  }
  
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for real-time chat`);
  console.log(`📁 Max upload size: 500MB`);
  console.log(`🔍 Global search: /api/search?q=keyword`);
  console.log(`📊 Trending: /api/trending`);
  console.log(`🔁 Skill Swaps: /api/swaps`);
  console.log(`📂 Categories: /api/categories`);
});