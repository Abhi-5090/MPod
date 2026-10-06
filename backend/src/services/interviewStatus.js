// Human-readable status for interview lists (admin), combining schedule and evaluation state.
function listStatus(row, now = Date.now()) {
  const ev = row.evaluation_status;
  if (row.status === 0 || ev === "completed") return "Attempted";
  if (ev === "failed") return "Evaluation failed";
  if (ev === "pending" || ev === "processing") return row.evaluation_waiting_for_ai ? "Waiting for AI" : "Evaluating";
  if (row.attempt && row.attempt.started_at) return "In progress";
  if (new Date(row.start_date_time).getTime() < now - 5 * 60000) return "Expired";
  return "Upcoming";
}

// Applies listStatus and removes internal fields from list rows.
const decorate = (rows) =>
  rows.map((r) => {
    const out = { ...r, interview_status: listStatus(r) };
    out.evaluation_error = r.evaluation_status === "failed" || r.evaluation_waiting_for_ai ? r.evaluation_error || null : null;
    delete out.attempt;
    return out;
  });

module.exports = { listStatus, decorate };
