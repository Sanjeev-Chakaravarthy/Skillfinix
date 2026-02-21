const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { cloudinary } = require('../config/cloudinary');

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
      // Increment view count
      course.views = (course.views || 0) + 1;
      await course.save();
      
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
    let thumbnailUrl = '';
    
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnailUrl = req.files.thumbnail[0].path;
    } else {
      // Auto-generate thumbnail from video URL (Cloudinary specific)
      try {
        const videoUrl = videoFile.path;
        thumbnailUrl = videoUrl
          .replace('/video/upload/', '/video/upload/w_640,h_360,c_fill,so_1/')
          .replace(/\.(mp4|mov|avi|mkv|webm)$/, '.jpg');
      } catch (thumbError) {
        thumbnailUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=6366f1&color=fff&size=640&bold=true`;
      }
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
      videoUrl: videoFile.path,
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

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    
    // 1. Get user's courses
    const courses = await Course.find({ user: userId });
    
    if (courses.length === 0) {
      return res.status(200).json({
        totalViews: 0,
        totalCourses: 0,
        totalStudents: 0,
        totalWatchTime: 0,
        courses: []
      });
    }

    const courseIds = courses.map(c => c._id);
    
    const totalViews = courses.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalCourses = courses.length;
    
    // 2. Get enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    
    // Unique students
    const uniqueStudents = new Set(enrollments.map(e => e.user.toString())).size;
    
    // Watch time (assuming seconds)
    const totalWatchTime = enrollments.reduce((acc, curr) => acc + (curr.watchedDuration || 0), 0);
    // Convert to hours roughly
    // const hours = Math.floor(totalWatchTime / 3600); 

    res.status(200).json({
      totalViews,
      totalCourses,
      totalStudents: uniqueStudents,
      totalWatchTime, // in seconds
      courses: courses // Return raw courses too for lists
    });
  } catch (error) {
    console.error("Studio stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Instructor Courses
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
  getInstructorCourses
};
