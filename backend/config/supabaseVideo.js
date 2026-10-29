const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client — uses the SERVICE ROLE key (backend only, never expose!)
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'skill-videos';
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

/**
 * Upload a video file (already saved to disk by multer) to Supabase Storage.
 *
 * @param {string} filePath  – absolute path to the temp file on disk
 * @param {string} fileName  – desired object name inside the bucket
 * @param {string} mimeType  – e.g. 'video/mp4'
 * @returns {{ publicUrl: string, storagePath: string }}
 */
const uploadVideoToSupabase = async (filePath, fileName, mimeType) => {
  // ── Validate file size ──────────────────────────────────────────────────
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    // Clean up temp file
    fs.unlinkSync(filePath);
    throw new Error(`File too large (${(stats.size / 1024 / 1024).toFixed(1)} MB). Maximum is 500 MB.`);
  }

  // ── Read file as buffer for upload ──────────────────────────────────────
  // Supabase JS v2 works best with Buffer for large uploads.
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`📤 Uploading ${fileName} (${(stats.size / 1024 / 1024).toFixed(1)} MB) to Supabase...`);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, {
      contentType: mimeType || 'video/mp4',
      upsert: false,
    });

  // ── Clean up temp file regardless of outcome ────────────────────────────
  try {
    fs.unlinkSync(filePath);
    console.log('🗑️  Temp file cleaned up.');
  } catch (cleanupErr) {
    console.warn('⚠️  Could not delete temp file:', cleanupErr.message);
  }

  if (error) {
    console.error('❌ Supabase upload error:', error.message);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // ── Get public URL ──────────────────────────────────────────────────────
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  console.log('✅ Video uploaded to Supabase:', urlData.publicUrl);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: data.path,
  };
};

module.exports = {
  supabase,
  uploadVideoToSupabase,
};
