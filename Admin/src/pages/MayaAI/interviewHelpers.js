import { STUDENT_APP_URL } from "../../config/api"

// YYYY-MM-DD for yesterday (local time). Lists load yesterday's records by default.
export const getYesterdayDateString = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
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
