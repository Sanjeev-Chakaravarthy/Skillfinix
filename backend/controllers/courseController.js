const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses with filtering and sorting
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { keyword, category, level, sort, limit } = req.query;
    
    let query = {};
    
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (level && level !== 'All') {
      query.level = level;
    }
    
    // Default sort by newest, but allow other sorts
    let sortOptions = { createdAt: -1 };
    if (sort === 'Oldest') sortOptions = { createdAt: 1 };
    if (sort === 'Popularity') sortOptions = { views: -1 };
    
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

// @desc    Get recommended courses (simulated for now)
// @route   GET /api/courses/recommended
// @access  Public
const getRecommendedCourses = async (req, res) => {
  try {
    // For now, just return top viewed or random courses
    // In future, use user interests if logged in
    const courses = await Course.find({}).sort({ views: -1 }).limit(4);
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
    
    // Validate files
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: 'Please upload both video and thumbnail.' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];
    
    const user = await User.findById(req.user.id);
    
    const newCourse = new Course({
      title,
      description,
      category,
      level,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || 'public',
      price: price || 0,
      videoUrl: videoFile.path, 
      thumbnail: thumbnailFile.path, 
      instructor: user.name, 
      instructorAvatar: user.avatar,
      duration: '00:00', 
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
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

// @desc    Get dashboard stats
// @route   GET /api/courses/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const coursesCount = await Course.countDocuments();
    const learnersCount = await User.countDocuments();
    // For barters, maybe count users with skills/interests or messages
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

module.exports = {
  getCourses,
  getRecommendedCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getStats
};
