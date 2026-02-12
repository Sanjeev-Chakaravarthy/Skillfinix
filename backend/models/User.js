const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "https://github.com/shadcn.png" },
  bio: { type: String, default: "New to Skillfinix!" },
  
  skills: [{ type: String }],    // "Can Teach"
  interests: [{ type: String }], // "Wants to Learn" (NEW)
  
  role: { type: String, default: "student" },
  location: { type: String, default: "Earth" },
  joinedDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);