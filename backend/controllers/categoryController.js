const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // Tech
  { name: 'Frontend',         icon: 'Code2',      color: '#3b82f6', order: 1 },
  { name: 'Backend',          icon: 'Server',     color: '#22c55e', order: 2 },
  { name: 'AI / ML',          icon: 'Brain',      color: '#a855f7', order: 3 },
  { name: 'Design',           icon: 'Palette',    color: '#ec4899', order: 4 },
  { name: 'DevOps',           icon: 'Cpu',        color: '#f97316', order: 5 },
  { name: 'Data Science',     icon: 'BarChart2',  color: '#06b6d4', order: 6 },
  { name: 'Mobile Dev',       icon: 'Smartphone', color: '#eab308', order: 7 },
  { name: 'Cybersecurity',    icon: 'Shield',     color: '#ef4444', order: 8 },
  // Life Skills
  { name: 'Music',            icon: 'Music',      color: '#f43f5e', order: 9 },
  { name: 'Fitness',          icon: 'Dumbbell',   color: '#10b981', order: 10 },
  { name: 'Language Learning',icon: 'Globe',      color: '#6366f1', order: 11 },
  { name: 'Business',         icon: 'Briefcase',  color: '#0ea5e9', order: 12 },
  { name: 'Public Speaking',  icon: 'Mic2',       color: '#f59e0b', order: 13 },
  { name: 'Photography',      icon: 'Camera',     color: '#84cc16', order: 14 },
  { name: 'Trading / Finance',icon: 'TrendingUp', color: '#06d6a0', order: 15 },
  { name: 'Content Creation', icon: 'Video',      color: '#f97316', order: 16 },
  { name: 'Cooking',          icon: 'ChefHat',    color: '#fb923c', order: 17 },
  { name: 'Exam Preparation', icon: 'BookOpen',   color: '#8b5cf6', order: 18 },
  { name: 'Soft Skills',      icon: 'Users',      color: '#14b8a6', order: 19 },
  { name: 'Other',            icon: 'Layers',     color: '#94a3b8', order: 20 },
];

// @desc  Seed default categories if none exist
// @access Internal (called on server start)
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('✅ Default categories seeded');
    }
  } catch (err) {
    console.error('Category seed error:', err.message);
  }
};

// @desc   Get all active categories
// @route  GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ active: true }).sort({ order: 1, name: 1 });
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Create a category (admin)
// @route  POST /api/categories
// @access Private (admin)
const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { name, icon, color, order } = req.body;
    const cat = await Category.create({ name, icon, color, order });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Category already exists' });
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { seedCategories, getCategories, createCategory };
