const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const { uploadVideoToSupabase } = require('../config/supabaseVideo');

// @desc    Get all courses with filtering and sorting
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { keyword, category, level, sort, limit } = req.query;
    
    let query = { visibility: 'public' }; // Default to public only
    
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }
    
    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (level && level !== 'All' && level !== 'All Levels') {
      query.level = level;
    }
    
    // Default sort by newest, but allow other sorts
    let sortOptions = { createdAt: -1 };
    if (sort === 'Oldest') sortOptions = { createdAt: 1 };
    if (sort === 'Popularity' || sort === 'Most Popular') sortOptions = { views: -1 };
    if (sort === 'Highest Rated') sortOptions = { rating: -1 };
    
    let activeQuery = Course.find(query).sort(sortOptions);
    
    // Handle limit
    if (limit) {
      activeQuery = activeQuery.limit(parseInt(limit));
    }
    
    const courses = await activeQuery;
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended courses
// @route   GET /api/courses/recommended
// @access  Public
const getRecommendedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ visibility: 'public' }).sort({ views: -1 }).limit(4);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, tags, visibility, price } = req.body;
    
    console.log('📤 Create course request received');
    
    // Video is required
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Please upload a video file.' });
    }

    const videoFile = req.files.video[0];

    // ── Upload video to Supabase Storage ────────────────────────────────────
    const { publicUrl: videoUrl } = await uploadVideoToSupabase(
      videoFile.path,
      videoFile.filename,
      videoFile.mimetype
    );

    // ── Handle thumbnail ────────────────────────────────────────────────────
    let thumbnailUrl = '';
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5005}`;
    
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      // Custom thumbnail uploaded — serve from local disk
      thumbnailUrl = `${serverUrl}/uploads/videos/${req.files.thumbnail[0].filename}`;
    } else {
      // Fallback placeholder thumbnail
      thumbnailUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=6366f1&color=fff&size=640&bold=true`;
    }
    
    const user = await User.findById(req.user.id);
    
    const newCourse = new Course({
      user: req.user.id,
      title,
      description,
      category,
      level,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || 'public',
      price: price || 0,
      videoUrl,
      thumbnail: thumbnailUrl,
      instructor: user.name,
      instructorAvatar: user.avatar,
      // Real duration sent by frontend (extracted from HTML5 video metadata)
      // If not provided, leave undefined so UI won't show fake value
      ...(req.body.duration ? { duration: req.body.duration } : {}),
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('❌ Course creation error:', error.message);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.user && course.user.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized to update this course' });
    }

    // Handle optional explicit partial updates if needed, though findByIdAndUpdate with req.body does that
    // Wait, the new edit details functionality passes: title, description, category, visibility, and potentially a thumbnail.
    // If a new thumbnail file was uploaded, we'd need to handle it. The edit form currently doesn't upload a new file, but maybe it will.
    // Ensure we don't accidentally overwrite with nulls if a field is missing.
    const updates = { ...req.body };
    // Remove fields that should not be updated via this route
    delete updates.user;
    delete updates.views;
    delete updates.rating;
    delete updates.reviewCount;
    delete updates.enrolledCount;
    delete updates.videoUrl;

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.user && course.user.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized to delete this course' });
    }

    // Delete associated data
    await Enrollment.deleteMany({ course: course._id });
    const VideoView = require('../models/VideoView');
    await VideoView.deleteMany({ videoId: course._id });

    // Try to delete from Supabase if we have a supabase client configured
    try {
        const { supabase } = require('../config/supabaseVideo');
        if (supabase && course.videoUrl) {
            // Extract filename from the URL to delete from bucket
            const urlParts = course.videoUrl.split('/videos/');
            if (urlParts.length > 1) {
                const filename = urlParts[1];
                await supabase.storage.from('videos').remove([filename]);
            }
        }
    } catch (err) {
        console.error("Error deleting from Supabase storage during course deletion:", err);
        // Continue with deletion anyway
    }

    await course.deleteOne();
    res.status(200).json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (Global)
// @route   GET /api/courses/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const coursesCount = await Course.countDocuments({ visibility: 'public' });
    const learnersCount = await User.countDocuments();
    const bartersCount = await User.countDocuments({ 
      $or: [
        { skills: { $exists: true, $not: { $size: 0 } } },
        { interests: { $exists: true, $not: { $size: 0 } } }
      ]
    });

    res.status(200).json({
      courses: coursesCount,
      learners: learnersCount,
      barters: bartersCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Studio Analytics (Private for Creator)
// @route   GET /api/courses/studio/analytics
// @access  Private
const getStudioStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');

    // 1. Get user's courses
    const courses = await Course.find({ user: userId });

    if (courses.length === 0) {
      return res.status(200).json({
        totalViews: 0,
        totalCourses: 0,
        totalStudents: 0,
        totalWatchTime: 0,
        impressions: 0,
        ctr: 0,
        viewsChange: '0%',
        studentsChange: '0%',
        watchTimeChange: '0%',
        chartData: [],
        courses: []
      });
    }

    const courseIds = courses.map(c => c._id);

    // ── Aggregate totals ────────────────────────────────────────────────────
    const totalViews = courses.reduce((acc, c) => acc + (c.views || 0), 0);
    const totalCourses = courses.length;
    const impressions = courses.reduce((acc, c) => acc + (c.enrolledCount || 0) + (c.views || 0), 0);

    // ── Enrollments for watch time + students ───────────────────────────────
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const uniqueStudents = new Set(enrollments.map(e => e.user.toString())).size;
    const totalWatchTime = enrollments.reduce((acc, e) => acc + (e.watchedDuration || 0), 0);

    // ── Calculate CTR ───────────────────────────────────────────────────────
    const ctr = impressions > 0 ? ((uniqueStudents / impressions) * 100) : 0;

    // ── Chart data based on selected period ──────────────────────────────────
    const now = new Date();
    const period = req.query.period || '7d';

    // Determine time range and grouping
    let periodMs, groupFormat, slots, slotLabel;
    switch (period) {
      case '1h':
        periodMs = 60 * 60 * 1000;
        groupFormat = '%Y-%m-%dT%H:%M';
        // 6 slots of 10 minutes
        slots = 6;
        break;
      case '24h':
        periodMs = 24 * 60 * 60 * 1000;
        groupFormat = '%Y-%m-%dT%H';
        slots = 24;
        break;
      case '48h':
        periodMs = 48 * 60 * 60 * 1000;
        groupFormat = '%Y-%m-%dT%H';
        slots = 48;
        break;
      case '7d':
      default:
        periodMs = 7 * 24 * 60 * 60 * 1000;
        groupFormat = '%Y-%m-%d';
        slots = 7;
        break;
    }

    const periodStart = new Date(now.getTime() - periodMs);
    const prevPeriodStart = new Date(now.getTime() - periodMs * 2);

    // Find the earliest course creation date
    const earliestCourse = await Course.findOne({ user: userId }).sort({ createdAt: 1 });
    const earliestDate = earliestCourse ? new Date(earliestCourse.createdAt) : now;
    // Do not show data before the user actually started their channel
    const actualPeriodStart = periodStart > earliestDate ? periodStart : earliestDate;

    // Aggregate enrollments for chart
    const dailyActivity = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds.map(id => new mongoose.Types.ObjectId(id)) },
          createdAt: { $gte: actualPeriodStart } // changed to actualPeriodStart
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          views: { $sum: 1 },
          watchTime: { $sum: { $ifNull: ['$watchedDuration', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build chart data (fill in missing slots with 0)
    const chartData = [];

    if (period === '1h') {
      // 10-minute intervals for last hour
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 10 * 60 * 1000);
        if (d >= new Date(actualPeriodStart.getTime() - 10 * 60 * 1000)) {
           const slotKey = d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
           
           // group by checking if it falls in the window
           const slotStart = new Date(d.getTime());
           const slotEnd = new Date(d.getTime() + 10 * 60 * 1000);

           let val = 0;
           dailyActivity.forEach(a => {
             const actTime = new Date(a._id + ":00Z").getTime();
             if (actTime >= slotStart.getTime() && actTime < slotEnd.getTime()) {
                val += a.views;
             }
           });

           const mins = d.getMinutes().toString().padStart(2, '0');
           chartData.push({
             name: `${d.getHours()}:${mins}`,
             date: slotKey,
             value: val
           });
        }
      }
    } else if (period === '24h' || period === '48h') {
      // Hourly intervals
      const hours = period === '24h' ? 24 : 48;
      // Show every 2nd or 4th hour for readability
      const step = period === '48h' ? 4 : 2;
      for (let i = hours - step; i >= 0; i -= step) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        if (d >= new Date(actualPeriodStart.getTime() - step * 60 * 60 * 1000)) {
           const hourKey = d.toISOString().slice(0, 13); // YYYY-MM-DDTHH
           // Sum up this slot and neighbors
           let val = 0;
           for (let j = 0; j < step; j++) {
             const checkD = new Date(d.getTime() + j * 60 * 60 * 1000);
             const checkKey = checkD.toISOString().slice(0, 13);
             const found = dailyActivity.find(a => a._id === checkKey);
             if (found) val += found.views;
           }
           chartData.push({
             name: `${d.getHours()}:00`,
             date: hourKey,
             value: val
           });
        }
      }
    } else {
      // Daily intervals (7d)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        if (d >= new Date(actualPeriodStart.getTime() - 24 * 60 * 60 * 1000)) {
           const dateStr = d.toISOString().split('T')[0];
           const found = dailyActivity.find(a => a._id === dateStr);
           
           // Actual real day name + date (e.g. Mar 1) instead of hardcoded Sun/Mon
           const dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
           
           chartData.push({
             name: dayName,
             date: dateStr,
             value: found ? found.views : 0
           });
        }
      }
    }

    // ── Period-over-period change ─────────────────────────────────────────────
    const thisWeekEnrollments = enrollments.filter(e => new Date(e.createdAt) >= periodStart).length;
    const lastWeekEnrollments = enrollments.filter(e => {
      const d = new Date(e.createdAt);
      return d >= prevPeriodStart && d < periodStart;
    }).length;

    const calcChange = (current, previous) => {
      if (previous === 0 && current === 0) return '0%';
      if (previous === 0) return '+100%';
      const pct = (((current - previous) / previous) * 100).toFixed(0);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const studentsChange = calcChange(thisWeekEnrollments, lastWeekEnrollments);

    // For views change, approximate from enrollment activity ratio
    const thisWeekWatchTime = enrollments
      .filter(e => new Date(e.lastWatchedAt) >= periodStart)
      .reduce((acc, e) => acc + (e.watchedDuration || 0), 0);
    const lastWeekWatchTime = enrollments
      .filter(e => {
        const d = new Date(e.lastWatchedAt);
        return d >= prevPeriodStart && d < periodStart;
      })
      .reduce((acc, e) => acc + (e.watchedDuration || 0), 0);

    const watchTimeChange = calcChange(thisWeekWatchTime, lastWeekWatchTime);

    res.status(200).json({
      totalViews,
      totalCourses,
      totalStudents: uniqueStudents,
      totalWatchTime, // in seconds
      impressions,
      ctr: ctr.toFixed(1),
      viewsChange: studentsChange, // best proxy from enrollment data
      studentsChange,
      watchTimeChange,
      chartData,
      courses // raw courses for recent uploads list
    });
  } catch (error) {
    console.error('Studio stats error:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Instructor Courses
// @route   GET /api/courses/my-courses (Instructor view)
// @access  Private
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle course visibility (public ↔ private)
// @route   PATCH /api/courses/:id/visibility
// @access  Private — owner only
const toggleCourseVisibility = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Ownership check — only the creator can publish/unpublish
    if (course.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised to update this course' });
    }

    // Flip visibility
    course.visibility = course.visibility === 'public' ? 'private' : 'public';
    await course.save();

    res.status(200).json({
      message: `Course is now ${course.visibility}`,
      visibility: course.visibility,
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Analytics for a specific course
// @route   GET /api/courses/analytics/:videoId
// @access  Private — owner only
const getCourseAnalytics = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { videoId } = req.params;

    const course = await Course.findById(videoId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.user.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorised to view analytics for this course' });
    }

    const VideoView = require('../models/VideoView');

    // 1. Fetch total views from VideoView collection.
    const totalViews = await VideoView.countDocuments({ videoId });

    // 2. Use MongoDB aggregation to group views by day.
    const chartDataRaw = await VideoView.aggregate([
      { $match: { videoId: new mongoose.Types.ObjectId(videoId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format chart data cleanly for Recharts
    const chartData = chartDataRaw.map(item => ({
       name: item._id, // e.g. "2026-03-01"
       views: item.views
    }));

    // 3. Return real data.
    res.status(200).json({ 
      totalViews,
      chartData
    });
    
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like on Course
// @route   POST /api/courses/:id/like
// @access  Private
const toggleLikeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const userId = req.user.id;
    const isLiked = course.likes.includes(userId);
    const isDisliked = course.dislikes.includes(userId);

    // If already liked, remove like
    if (isLiked) {
      course.likes = course.likes.filter(id => id.toString() !== userId);
    } else {
      // Add like, remove dislike if exists
      course.likes.push(userId);
      if (isDisliked) {
        course.dislikes = course.dislikes.filter(id => id.toString() !== userId);
      }
    }

    await course.save();
    res.status(200).json({ 
      likes: course.likes.length, 
      dislikes: course.dislikes.length,
      isLiked: !isLiked,
      isDisliked: false
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};

// @desc    Toggle Dislike on Course
// @route   POST /api/courses/:id/dislike
// @access  Private
const toggleDislikeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const userId = req.user.id;
    const isLiked = course.likes.includes(userId);
    const isDisliked = course.dislikes.includes(userId);

    // If already disliked, remove dislike
    if (isDisliked) {
      course.dislikes = course.dislikes.filter(id => id.toString() !== userId);
    } else {
      // Add dislike, remove like if exists
      course.dislikes.push(userId);
      if (isLiked) {
        course.likes = course.likes.filter(id => id.toString() !== userId);
      }
    }

    await course.save();
    res.status(200).json({ 
      likes: course.likes.length, 
      dislikes: course.dislikes.length,
      isLiked: false,
      isDisliked: !isDisliked
    });
  } catch (error) {
    console.error('Toggle dislike error:', error);
    res.status(500).json({ message: 'Server error while toggling dislike' });
  }
};

// @desc    Generate Download URL for Course Video (Supabase)
// @route   GET /api/courses/:id/download
// @access  Private
const getCourseDownloadUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    // Safety check - depending on business logic you might want to restrict this
    if (course.visibility !== 'public' && course.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Cannot download private videos' });
    }

    const videoUrlStr = course.videoUrl;
    
    // Assume videoUrls look like: https://[project].supabase.co/storage/v1/object/public/skill-videos/filename.mp4 
    if (!videoUrlStr || !videoUrlStr.includes('supabase.co')) {
        return res.status(400).json({ message: 'Download only available for Supabase hosted videos' });
    }

    // Since they are public buckets we can just trigger a download by appending ?download=true
    // Or we could generate a signed URL if it was a private bucket.
    const downloadUrl = `${videoUrlStr}?download=true`;

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error generating download link' });
  }
};

// @desc    Record a new unique Video View
// @route   POST /api/courses/:id/view
// @access  Public (Optional Auth)
const recordCourseView = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(200).json({ message: 'Anonymous views not counted strictly', counted: false });
    }

    const course = await Course.findById(videoId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const VideoView = require('../models/VideoView');

    // 1. Check if VideoView exists for this videoId and userId.
    const existingView = await VideoView.findOne({ videoId, userId });
    
    // 2. If exists -> DO NOT increment.
    if (existingView) {
      return res.status(200).json({ message: 'View already counted for this user', counted: false });
    }

    // 3. If not exists -> create VideoView document.
    await VideoView.create({ videoId, userId });
    
    // 4. Then increment Video.totalViews by 1.
    course.views = (course.views || 0) + 1;
    await course.save();

    return res.status(200).json({ message: 'User view counted', counted: true, totalViews: course.views });

  } catch (error) {
    if (error.code === 11000) {
       // Catch race condition duplicate key error safely
       return res.status(200).json({ message: 'View already in database', counted: false });
    }
    console.error('Record view error:', error);
    res.status(500).json({ message: 'Server error recording view' });
  }
};


module.exports = {
  getCourses,
  getRecommendedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getStats,
  getStudioStats,
  getInstructorCourses,
  toggleCourseVisibility,
  getCourseAnalytics,
  toggleLikeCourse,
  toggleDislikeCourse,
  getCourseDownloadUrl,
  recordCourseView,
};
