// Central place for backend/base URLs and small API helpers.
// REACT_APP_MPOD_BACKEND_URL must end with a trailing slash, e.g. https://mpod.ai/backend/api/
export const API_BASE = process.env.REACT_APP_MPOD_BACKEND_URL || ""
export const IMAGE_BASE = process.env.REACT_APP_BACKEND_IMAGE_URL || ""
// Admin is served at <origin>/admin, so without an explicit URL the student app is the origin root.
const studentAppFallback = () =>
  typeof window !== "undefined" && window.location ? `${window.location.origin}/` : "/"
export const STUDENT_APP_URL = process.env.REACT_APP_STUDENT_APP_URL || studentAppFallback()

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
