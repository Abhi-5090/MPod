import { STUDENT_APP_URL } from "../../config/api"

// YYYY-MM-DD for yesterday in IST (UTC+5:30), matching the backend's default date.
export const getYesterdayDateString = () => {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000)
  const yyyy = ist.getUTCFullYear()
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(ist.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// Builds a student-app report link, e.g. studentReportUrl("report", { roll_no, interview_type, id }).
export const studentReportUrl = (page, params) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value == null ? "" : value)}`)
    .join("&")
  return `${STUDENT_APP_URL}${page}?${query}`
}

// Toast text for interview delete responses: { message, refunded: boolean }.
export const deleteResultMessage = data => {
  const message = (data && data.message) || "Interview deleted"
  if (data && data.refunded === true) return `${message} — Credit refunded`
  if (data && data.refunded === false) return `${message} — No refund (interview already started)`
  return message
}

// Attempted / (Attempted + Expired) as a percentage string.
export const attemptedPercentage = (attempted, expired) => {
  const total = attempted + expired
  return total ? ((attempted / total) * 100).toFixed(2) : 0
}

// Badge colour for the statuses returned by the interview list endpoints.
export const statusColor = (status) =>
  ({
    Attempted: "success",
    Upcoming: "info",
    "In progress": "primary",
    Evaluating: "secondary",
    "Waiting for AI": "warning",
    "Evaluation failed": "danger",
    Expired: "dark",
  })[status] || "light";

export const canRetryEvaluation = (status) => status === "Evaluation failed" || status === "Waiting for AI";

// YYYY-MM-DD for today in IST (UTC+5:30). Lists open on today so freshly scheduled
// interviews are visible straight away.
export const getTodayDateString = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
