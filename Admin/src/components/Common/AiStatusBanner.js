import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Alert, Button } from "reactstrap"
import { apiUrl } from "../../config/api"
import { useAuth } from "../../context/AuthContext"
import { isPlatformRole } from "../../config/roles"

const REFRESH_MS = 5 * 60 * 1000

// Warns staff when the AI provider (question generation and scoring) is unavailable.
const AiStatusBanner = () => {
  const { user } = useAuth()
  const [ai, setAi] = useState(null)
  const [checking, setChecking] = useState(false)

  const load = useCallback(async (refresh = false) => {
    try {
      const res = await axios.get(apiUrl(`system-status${refresh ? "?refresh=1" : ""}`))
      setAi(res.data && res.data.ai)
    } catch (e) {
      // status is informational only
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined
    load()
    const t = setInterval(() => load(), REFRESH_MS)
    return () => clearInterval(t)
  }, [user, load])

  if (!ai || ai.available) return null
  const platform = user && isPlatformRole(user.role)

  return (
    <Alert color="warning" className="mb-3">
      <strong>AI service unavailable.</strong> {ai.message}{" "}
      Interviews still run: technology questions come from the question bank and syllabus, the coding idea check is
      skipped, and scores are completed automatically once the AI is back.
      {platform && " Fix: give the OpenAI API key the model.request permission (or set a working key) in backend/.env and restart the backend."}
      {platform && (
        <Button
          color="link"
          size="sm"
          className="p-0 ms-2 align-baseline"
          disabled={checking}
          onClick={async () => {
            setChecking(true)
            await load(true)
            setChecking(false)
          }}
        >
          {checking ? "Checking..." : "Check again"}
        </Button>
      )}
    </Alert>
  )
}

export default AiStatusBanner
