const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// Multer disk-based upload middlewares
// Videos are temporarily saved to disk, then streamed to Supabase Storage.
// Avatars are saved to disk and served as static files.
// ─────────────────────────────────────────────────────────────────────────────

// Ensure upload directories exist
const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });

// ── Video Upload (temp storage → Supabase) ──────────────────────────────────

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const videoFileFilter = (_req, file, cb) => {
  const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'thumbnail') {
    // Allow image files for the thumbnail field
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, MOV, AVI, MKV, WebM) are allowed.'), false);
  }
};

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: videoFileFilter,
});

// ── Avatar Upload (permanent local storage) ─────────────────────────────────

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const avatarFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP) are allowed.'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: avatarFileFilter,
});

module.exports = {
  videoUpload,
  uploadAvatar,
};
