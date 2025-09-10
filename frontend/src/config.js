// The base URL for your API calls.
// Vercel will use the VITE_API_URL from environment variables.
// Locally, it will fall back to your Flask server.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// The base URL for serving static files like logos and backgrounds.
// This ensures images load correctly on both local and deployed versions.
export const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:5000";
