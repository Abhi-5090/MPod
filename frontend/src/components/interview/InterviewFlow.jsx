import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ThreeDots } from "react-loader-spinner";
import { errorMessage, profilePicUrl } from "../../api/axiosInstance";
import VoiceInterview from "./VoiceInterview";
import CodingInterview from "./CodingInterview";
import { createSessionClient, reportPath } from "./sessionApi";
import "./interview.css";

const INTRO_SECONDS = 15;

const typeLabel = (t) => (t === "ai generated" ? "Technology" : t === "company" ? "Company" : "Coding");

/**
 * Instructions -> start (server issues questions) -> interview -> evaluation -> report.
 *  details:      interview summary for the instructions screen
 *  startSession: () => Promise<axios response with the session>
 *  onExit:       called when the student leaves without starting (optional)
 *  kiosk:        true on the mPod kiosk (keeps the attempt token so the report can open there)
 *
 * The attempt is claimed on the server as soon as this screen opens, so the
 * instructions countdown can never push the start past the allowed window.
 */
function InterviewFlow({ details, startSession, onExit, kiosk }) {
  const [stage, setStage] = useState("intro"); // intro | starting | running | submitting | evaluating | error
  const [timer, setTimer] = useState(details.in_progress || details.resumable ? 3 : INTRO_SECONDS);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [imgSrc, setImgSrc] = useState(profilePicUrl(details.roll_no));
  const clientRef = useRef(null);
  const startingRef = useRef(false);
  const emotionsRef = useRef(undefined);
  const startSessionRef = useRef(startSession);
  startSessionRef.current = startSession;
  const [ready, setReady] = useState(false);

  // Claim the attempt and fetch the questions right away (retries "being prepared").
  const begin = useCallback(async (attempt = 0) => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      const res = await startSessionRef.current();
      clientRef.current = createSessionClient(res.data, { rememberToken: Boolean(kiosk) });
      setSession(res.data);
      setReady(true);
    } catch (err) {
      startingRef.current = false;
      const data = err && err.response && err.response.data;
      if (data && data.code === "PREPARING" && attempt < 20) {
        setTimeout(() => begin(attempt + 1), 3000);
        return;
      }
      setError(errorMessage(err, "Could not start the interview."));
      setStage("start-error");
    }
  }, [kiosk]);

  useEffect(() => {
    begin();
  }, [begin]);

  // Instructions countdown; the interview opens when it ends and the questions are ready.
  useEffect(() => {
    if (stage !== "intro") return undefined;
    if (timer <= 0) {
      setStage(ready ? "running" : "starting");
      return undefined;
    }
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, stage, ready]);

  useEffect(() => {
    if (stage === "starting" && ready) setStage("running");
  }, [stage, ready]);

  const retryStart = () => {
    setError("");
    setTimer(0);
    setStage("starting");
    begin();
  };

  // Called by the interview component once every answer is saved.
  const finish = useCallback(async (emotions) => {
    if (emotions !== undefined) emotionsRef.current = emotions;
    setStage("submitting");
    try {
      await clientRef.current.submit(emotionsRef.current);
      setStage("evaluating");
    } catch (err) {
      setError(errorMessage(err, "Could not submit the interview. Your answers are saved; please try again."));
      setStage("submit-error");
    }
  }, []);

  // Poll until the background evaluation is done, then open the report.
  useEffect(() => {
    if (stage !== "evaluating") return undefined;
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      tries++;
      try {
        const { data } = await clientRef.current.status();
        if (cancelled) return;
        if (data.report_ready) {
          window.location.href = reportPath(session.interview);
          return;
        }
        if (data.waiting_for_ai) {
          setStage("delayed");
          return;
        }
        if (data.evaluation_status === "failed") {
          setError("Your answers were saved, but the evaluation failed. Your college can retry it from the admin portal.");
          setStage("error");
          return;
        }
      } catch (_) {
        /* keep polling */
      }
      if (!cancelled && tries < 120) setTimeout(poll, 3000);
      else if (!cancelled) {
        setError("Evaluation is taking longer than usual. Your answers are saved; the report will appear in your dashboard.");
        setStage("error");
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [stage, session]);

  const imgFallback = () => setImgSrc(details.gender === "female" ? "/girl.png" : "/boy.png");

  if (stage === "running" && session) {
    const props = { session, client: clientRef.current, onFinish: finish };
    return session.interview.interview_type === "coding" ? <CodingInterview {...props} /> : <VoiceInterview {...props} />;
  }

  if (stage === "starting" || stage === "submitting" || stage === "evaluating") {
    const text =
      stage === "starting"
        ? "Preparing your questions..."
        : stage === "submitting"
          ? "Submitting your answers..."
          : "Evaluating your answers. This usually takes less than a minute...";
    return (
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow" style={{ textAlign: "center" }}>
          <ThreeDots visible height={60} width={60} color="#5EE3EC" ariaLabel="loading" wrapperStyle={{ justifyContent: "center" }} />
          <p className="mpod-muted" role="status">{text}</p>
        </div>
      </div>
    );
  }

  if (stage === "delayed") {
    return (
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow" role="status">
          <h2 className="mpod-title">Interview submitted</h2>
          <p className="mpod-muted">
            All your answers are saved. Scoring is taking longer than usual right now; your report will be ready
            automatically{kiosk ? " and you can view it by signing in on the mPod website." : " and will appear under My Interviews on your dashboard."}
          </p>
          <div className="mpod-actions">
            {kiosk ? (
              <button className="mpod-btn mpod-btn-primary" onClick={onExit || (() => window.location.reload())}>Done - next student</button>
            ) : (
              <button className="mpod-btn mpod-btn-primary" onClick={() => (window.location.href = "/dashboard")}>Go to dashboard</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === "error" || stage === "submit-error" || stage === "start-error") {
    return (
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow" role="alert">
          <h2 className="mpod-title">Something went wrong</h2>
          <p className="mpod-muted">{error}</p>
          <div className="mpod-actions">
            {stage === "submit-error" && (
              <button className="mpod-btn mpod-btn-primary" onClick={() => finish()}>Try submitting again</button>
            )}
            {stage === "start-error" && (
              <button className="mpod-btn mpod-btn-primary" onClick={retryStart}>Try again</button>
            )}
            {onExit && <button className="mpod-btn" onClick={onExit}>Back</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mpod-center">
      <div className="mpod-panel">
        <div className="mpod-panel-header">
          <h2>INSTRUCTIONS</h2>
        </div>
        <p className="mpod-countdown" aria-live="polite">
          {details.in_progress || details.resumable ? "RESUMING YOUR INTERVIEW IN " : "YOUR INTERVIEW STARTS IN "}
          <span>{`00:${String(Math.max(timer, 0)).padStart(2, "0")}`}</span>
        </p>
        <div className="mpod-intro">
          <div className="mpod-intro-text">
            <div className="mpod-card">
              <p className="mpod-strong">{details.roll_no}</p>
              <p className="mpod-strong">{details.first_name}</p>
              <p className="mpod-muted">{typeLabel(details.interview_type)} interview</p>
              {details.interview_type === "ai generated" && (
                <>
                  <p className="mpod-muted">{details.technology_name}</p>
                  {(details.module_details || []).map((m) => (
                    <p className="mpod-muted" key={m._id}>
                      {m.module_name}
                      {m.topic_names && m.topic_names.length ? ` - ${m.topic_names.join(", ")}` : ""}
                    </p>
                  ))}
                </>
              )}
              {details.interview_type === "coding" && <p className="mpod-muted">Level: {details.level}</p>}
              {details.interview_type === "company" && (
                <>
                  {(details.company_details || []).map((c) => (
                    <p className="mpod-muted" key={c._id}>{c.company_name}</p>
                  ))}
                  <p className="mpod-muted">{[...(details.type || []), ...(details.round || [])].join(", ")}</p>
                </>
              )}
            </div>
            <ul className="mpod-rules">
              {details.interview_type === "coding" ? (
                <>
                  <li>For each problem, first describe your approach, then write your code, then optimise it.</li>
                  <li>Keep your camera on and stay in front of it; your attention is monitored.</li>
                </>
              ) : (
                <>
                  <li>Each question is read aloud. After a short countdown, answer by speaking clearly.</li>
                  <li>You have 60 seconds per question. If your microphone does not work, type your answer instead.</li>
                </>
              )}
              <li>Your answers are saved as you go. If the page closes, start again from the same place to continue before the time runs out.</li>
              <li>Do not use your mobile phone during the interview.</li>
              <li>Good luck!</li>
            </ul>
            <div className="mpod-actions">
              <button className="mpod-btn mpod-btn-primary" onClick={() => setTimer(0)} disabled={!ready}>
                {ready ? "Start now" : "Preparing..."}
              </button>
              {onExit && <button className="mpod-btn" onClick={onExit}>Back</button>}
            </div>
          </div>
          <div className="mpod-intro-photo">
            <img src={imgSrc} alt={`${details.first_name || details.roll_no}`} onError={imgFallback} />
          </div>
        </div>
      </div>
    </div>
  );
}

InterviewFlow.propTypes = {
  details: PropTypes.object.isRequired,
  startSession: PropTypes.func.isRequired,
  onExit: PropTypes.func,
  kiosk: PropTypes.bool,
};

export default InterviewFlow;
