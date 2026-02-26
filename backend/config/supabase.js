const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Local disk storage for chat file uploads.
// Files are saved to backend/uploads/chat/ and served as static assets.
//
// NOTE: Supabase Storage was intended here but is unreachable on this network.
// Switch the storage strategy below to Supabase once connectivity is restored.
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'chat'));
  },
  filename: (req, file, cb) => {
    // Preserve original filename with a timestamp prefix to avoid collisions
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Multer middleware for chat uploads — max 50 MB per file
const chatFileUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Returns the public URL for a saved file.
// SERVER_URL defaults to http://localhost:5005 in development.
const uploadFileToSupabase = async (file) => {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5005}`;
  const publicUrl = `${serverUrl}/uploads/chat/${file.filename}`;
  return { url: publicUrl, path: file.filename };
};

module.exports = {
  chatFileUpload,
  uploadFileToSupabase,
};
