import axios from "axios";

// Relative by default: in dev Vite proxies /backend to the API; in production the
// site is served from the same domain as the API. Override with VITE_* only if needed.
export const API_BASE = import.meta.env.VITE_API_URL || "/backend/api/"; // must end with /
export const IMAGE_BASE = import.meta.env.VITE_BACKEND_URL || "/backend/"; // must end with /

// All requests carry the httpOnly session cookie; nothing sensitive is kept in JS storage.
const axiosInstance = axios.create({ baseURL: API_BASE, withCredentials: true });

// Pages where a 401 is expected and must not bounce to the student login.
const NO_REDIRECT_PATHS = ["/login", "/", "/forgot-password", "/home-2", "/kiosk-setup", "/report", "/coding-report"];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;
    const path = window.location.pathname;
    if (status === 401 && !error.config?.skipAuthRedirect && !NO_REDIRECT_PATHS.includes(path)) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  (err && err.response && err.response.data && err.response.data.message) || fallback;

// The per-attempt token is kept in sessionStorage only so the report screen
// shown on a kiosk right after the interview can load it.
export const attemptTokenKey = (id) => `mpod_attempt_${id}`;
export const rememberAttemptToken = (id, token) => {
  try {
    sessionStorage.setItem(attemptTokenKey(id), token);
  } catch (_) {
    /* storage unavailable */
  }
};
export const attemptTokenFor = (id) => {
  try {
    return sessionStorage.getItem(attemptTokenKey(id)) || "";
  } catch (_) {
    return "";
  }
};
export const forgetAttemptTokens = () => {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("mpod_attempt_"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch (_) {
    /* ignore */
  }
};

export const profilePicUrl = (rollNo) => `${IMAGE_BASE}profile-pics/${encodeURIComponent(rollNo)}.png`;

export default axiosInstance;
