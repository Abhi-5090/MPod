import api, { rememberAttemptToken } from "../../api/axiosInstance";

// Thin client for the server-owned interview session.
export function createSessionClient(session, { rememberToken = false } = {}) {
  const token = session.attempt_token;
  const id = String(session.interview._id);
  const type = session.interview.interview_type;
  const headers = { "X-Attempt-Token": token };
  // Only the kiosk keeps the token, so its report screen can load right after the interview.
  if (rememberToken) rememberAttemptToken(id, token);
  const base = { interview_id: id, interview_type: type };

  return {
    id,
    type,
    saveAnswer: (questionId, fields) =>
      api.post("interview-session/answer", { ...base, question_id: questionId, ...fields }, { headers, skipAuthRedirect: true }),
    analyzeIdea: (questionId, idea) =>
      api.post("interview-session/analyze-idea", { ...base, question_id: questionId, idea }, { headers, skipAuthRedirect: true }),
    submit: (emotions) =>
      api.post("interview-session/submit", { ...base, ...(emotions ? { emotions } : {}) }, { headers, skipAuthRedirect: true }),
    status: () =>
      api.get("interview-session/status", { params: { interview_id: id, interview_type: type }, headers, skipAuthRedirect: true }),
  };
}

// Retries a request a few times on network errors / 5xx so a short Wi-Fi drop does not lose an answer.
export async function withRetry(fn, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err && err.response && err.response.status;
      if (status && status < 500 && status !== 429) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

export const reportPath = (interview) => {
  const base = interview.interview_type === "coding" ? "coding-report" : "report";
  const q = new URLSearchParams({
    roll_no: interview.roll_no,
    interview_type: interview.interview_type,
    id: String(interview._id),
  });
  return `/${base}?${q.toString()}`;
};
