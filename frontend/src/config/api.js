// Base backend server URL configuration
const DEFAULT_PROD_API = 'https://skillfinix-aygxa7f5c5ggemds.centralindia-01.azurewebsites.net';
const DEFAULT_DEV_API = 'http://localhost:5005';

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API);

// Strip any trailing slashes
const cleanUrl = rawApiUrl.replace(/\/+$/, '');

// If the URL already ends with /api, strip it to get the server base origin
export const BACKEND_URL = cleanUrl.endsWith('/api')
  ? cleanUrl.slice(0, -4)
  : cleanUrl;

// API endpoint URL (always ends with /api)
export const API_URL = `${BACKEND_URL}/api`;

/**
 * Resolves media or upload URLs (e.g. /uploads/avatar.png -> https://backend.com/uploads/avatar.png)
 * Handles full URLs (http/https/data), relative URLs, and fallbacks.
 */
export const resolveMediaUrl = (url, fallback = '') => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export default {
  BACKEND_URL,
  API_URL,
  resolveMediaUrl,
};
