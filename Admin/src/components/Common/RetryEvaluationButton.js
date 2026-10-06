import React, { useState } from "react"
import PropTypes from "prop-types"
import axios from "axios"
import { Button } from "reactstrap"
import { toast } from "react-toastify"
import { apiUrl, getErrorMessage } from "../../config/api"

// Re-queues the AI scoring of a submitted interview (failed or waiting for the AI).
const RetryEvaluationButton = ({ interviewId, interviewType, title, label }) => {
  const [busy, setBusy] = useState(false)
  const retry = async () => {
    setBusy(true)
    try {
      await axios.post(apiUrl("interview-session/retry-evaluation"), { interview_id: interviewId, interview_type: interviewType })
      toast.success("Evaluation queued. Refresh the list in a minute to see the result.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not retry the evaluation."))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button color="warning" size="sm" className="me-2" onClick={retry} disabled={busy} title={title || ""}>
      {busy ? "Queuing..." : label || "Retry evaluation"}
    </Button>
  )
}

RetryEvaluationButton.propTypes = {
  interviewId: PropTypes.string.isRequired,
  interviewType: PropTypes.string.isRequired,
  title: PropTypes.string,
  label: PropTypes.string,
}

export default RetryEvaluationButton
