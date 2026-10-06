// Central place for backend/base URLs and small API helpers.
// VITE_API_URL (optional) must end with a trailing slash, e.g. https://mpod.ai/backend/api/
// Relative by default: in dev Vite proxies /backend to the API; in production the
// admin is served from the same domain as the API.
export const API_BASE = import.meta.env.VITE_API_URL || "/backend/api/"
export const IMAGE_BASE = import.meta.env.VITE_BACKEND_URL || "/backend/"
// Admin is served at <origin>/admin, so without an explicit URL the student app is the origin root.
const studentAppFallback = () =>
  typeof window !== "undefined" && window.location ? `${window.location.origin}/` : "/"
export const STUDENT_APP_URL = import.meta.env.VITE_STUDENT_APP_URL || studentAppFallback()

export const apiUrl = path => `${API_BASE}${path}`

// Extracts a human readable message from an axios error.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback
  const data = error.response && error.response.data
  if (data) {
    if (typeof data === "string" && data.length < 300) return data
    if (data.message) return data.message
    if (data.error && typeof data.error === "string") return data.error
  }
  if (!error.response && error.message) return "Network error: " + error.message
  return fallback
}
