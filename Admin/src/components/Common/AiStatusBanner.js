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

  if (!ai) return null
  const platform = user && isPlatformRole(user.role)
  const vision = ai.vision || {}
  // Camera model on the DGX Spark is down: browsers run it themselves, so only platform admins need to know.
  const visionNote = platform && vision.configured && !vision.available && (
    <div className="mt-1">
      <strong>Camera analysis service unavailable;</strong> students&apos; browsers are analysing the camera instead.{" "}
      {vision.message}
      {vision.hint ? ` Fix: ${vision.hint}` : ""}
    </div>
  )
  // Primary provider down but the fallback is serving: only platform admins need to know.
  if (ai.available && !(ai.degraded && platform)) {
    return visionNote ? (
      <Alert color="info" className="mb-3">
        {visionNote}
      </Alert>
    ) : null
  }

  const label = (name) => ((ai.providers || []).find((p) => p.name === name) || {}).label || name
  const checkAgain = platform && (
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
  )
  const fix = platform && ai.hint ? ` Fix: ${ai.hint}` : ""

  if (ai.degraded) {
    const title = ai.partial
      ? `Some ${label(ai.provider)} models are not available. ${
          ai.fallback ? `Those tasks use ${label(ai.fallback)} as backup.` : "Those tasks use the question bank and provisional scores."
        }`
      : `Primary AI provider (${label(ai.provider)}) unavailable; using ${label(ai.serving)} as backup.`
    return (
      <Alert color="info" className="mb-3">
        <strong>{title}</strong>{" "}
        {ai.message}
        {fix}
        {checkAgain}
        {visionNote}
      </Alert>
    )
  }

  return (
    <Alert color="warning" className="mb-3">
      <strong>AI service unavailable.</strong> {ai.message}{" "}
      Interviews still run: technology questions come from the question bank and syllabus, the coding idea check is
      skipped, and scores are completed automatically once the AI is back.
      {fix}
      {checkAgain}
      {visionNote}
    </Alert>
  )
}

export default AiStatusBanner
