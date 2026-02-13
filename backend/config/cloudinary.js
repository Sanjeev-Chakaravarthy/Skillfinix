const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 600000, // 10 min timeout for large uploads
});

// General upload storage (Courses, etc)
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillup-hub',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
    chunk_size: 6000000, // 6 MB chunk size for large videos
  },
});

// Avatar upload storage
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillup-hub/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  },
});

// Chat file upload storage
const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillup-hub/chat',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'pdf', 'doc', 'docx', 'mp3', 'wav'],
  },
});

// Increase file size limits — allow up to 500MB for video uploads
const upload = multer({ 
  storage: generalStorage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB
});
const uploadAvatar = multer({ storage: avatarStorage });
const chatFileUpload = multer({ storage: chatStorage });

module.exports = {
  cloudinary,
  upload,
  uploadAvatar,
  chatFileUpload
};
