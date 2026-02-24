// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      skills: user.skills,
      interests: user.interests,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      skills: user.skills,
      interests: user.interests,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

// @desc    Google Authentication with Cloudinary support
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists, log in
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // Keep existing avatar (might be Cloudinary URL)
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      // Create new user with Google picture URL
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
        avatar: picture, // Store Google OAuth picture URL directly
        role: "student",
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        location: user.location,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(user);
};

module.exports = { registerUser, loginUser, googleAuth, getMe };