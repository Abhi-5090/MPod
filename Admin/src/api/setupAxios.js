import axios from "axios"
import { toast } from "react-toastify"

// Paths for which a 401 is an expected answer and must NOT trigger a redirect.
const NO_REDIRECT_ENDPOINTS = [
  "get-admin-current-user",
  "admin-login",
  "logout",
  "send-otp",
  "check-otp",
  "reset-password",
]
const PUBLIC_PAGES = ["/login", "/logout", "/forgot-password"]

const isPublicPage = () => {
  const path = window.location.pathname.replace(/^\/admin/, "") || "/"
  return PUBLIC_PAGES.some(p => path === p || path.startsWith(p + "/"))
}

const urlMatches = (url, list) => !!url && list.some(e => url.split("?")[0].endsWith(e))

let installed = false

export default function setupAxios() {
  if (installed) return
  installed = true

  // The admin session lives in the httpOnly cookie `adminSessionToken`.
  axios.defaults.withCredentials = true

  axios.interceptors.response.use(
    response => response,
    error => {
      const status = error.response && error.response.status
      const url = error.config && error.config.url
      if (status === 401 && !urlMatches(url, NO_REDIRECT_ENDPOINTS) && !isPublicPage()) {
        // Come back to the current page (path relative to the /admin basename) after logging in.
        const current = (window.location.pathname.replace(/^\/admin(?=\/|$)/, "") || "/") + window.location.search
        window.location.assign(`/admin/login?next=${encodeURIComponent(current)}`)
      } else if (status === 403 && !urlMatches(url, ["admin-login"])) {
        // Pages toast the server's specific message themselves; only fall back to a generic one.
        const data = error.response.data
        const hasMessage = data && typeof data === "object" && typeof data.message === "string" && data.message
        if (!hasMessage) toast.error("You do not have permission", { toastId: "forbidden" })
      }
      return Promise.reject(error)
    }
  )
}
