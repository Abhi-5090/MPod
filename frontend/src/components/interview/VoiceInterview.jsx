import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Lottie from "lottie-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import timerAnimation from "../../assets/timer.json";
import aiAnimation from "../../assets/ai.json";
import { withRetry } from "./sessionApi";

const ANSWER_SECONDS = 60;
const BUFFER_SECONDS = 5;
const AUTOSAVE_MS = 15000;

// Picks an Indian-English (else any English) voice; returns null if unavailable.
const pickVoice = () => {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices() || [];
  return voices.find((v) => v.lang === "en-IN") || voices.find((v) => v.lang && v.lang.startsWith("en")) || null;
};

const statusOf = (err) => err && err.response && err.response.status;

/**
 * Technology / company interview: each question is read aloud, the student answers
 * by voice (or by typing), and every answer is saved to the server immediately.
 * Timers and callbacks read the latest values through refs so parent re-renders
 * never reset them.
 */
function VoiceInterview({ session, client, onFinish }) {
  const questions = session.questions;
  // Resume at the first question the student had not moved past.
  const finalIds = new Set((session.answers || []).filter((a) => a.final).map((a) => a.question_id));
  const firstOpen = questions.findIndex((q) => !finalIds.has(q.id));

  const [index, setIndex] = useState(firstOpen === -1 ? questions.length : firstOpen);
  const [phase, setPhase] = useState("speaking"); // speaking | buffer | answering | saving
  const [seconds, setSeconds] = useState(BUFFER_SECONDS);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [fatal, setFatal] = useState("");
  const [deadlineLeft, setDeadlineLeft] = useState(null);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition();
  const canUseVoice = browserSupportsSpeechRecognition && isMicrophoneAvailable !== false;
  const useTyping = typing || !canUseVoice;
  const question = questions[index];

  // Latest values for timers/callbacks.
  const textRef = useRef("");
  textRef.current = useTyping ? typed : transcript;
  const indexRef = useRef(index);
  indexRef.current = index;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const resetRef = useRef(resetTranscript);
  resetRef.current = resetTranscript;

  const answerStartRef = useRef(0);
  const finishedRef = useRef(false);
  const advancingRef = useRef(false);
  const finishAfterSaveRef = useRef(false);
  const autosaveRef = useRef(null);
  const retryTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const stopListening = () => {
    try {
      SpeechRecognition.stopListening();
    } catch (_) {
      /* ignore */
    }
  };

  const finishAll = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onFinishRef.current();
  }, []);

  // Saves the current answer as final, then moves to the next question (or finishes).
  const advance = useCallback(async () => {
    const i = indexRef.current;
    const q = questions[i];
    if (advancingRef.current || !q || finishedRef.current) return;
    advancingRef.current = true;
    stopListening();
    setPhase("saving");
    const answer = textRef.current || "";
    const time = Math.min(ANSWER_SECONDS, Math.round((Date.now() - answerStartRef.current) / 1000));
    try {
      if (autosaveRef.current) await autosaveRef.current.catch(() => {});
      await withRetry(() => client.saveAnswer(q.id, { answer, time, final: true }));
      setSaveError("");
    } catch (err) {
      advancingRef.current = false;
      const status = statusOf(err);
      if (status === 409) {
        finishAll(); // time over or already submitted
        return;
      }
      if (status && status < 500 && status !== 429) {
        // e.g. 401: the interview was resumed elsewhere, so this tab's session is no longer valid
        setFatal(
          (err.response.data && err.response.data.message) ||
            "This interview session is no longer valid. Please restart the interview from your dashboard."
        );
        stopListening();
        return;
      }
      if (!mountedRef.current) return;
      setSaveError("Could not save your answer. Check your connection; retrying...");
      retryTimerRef.current = setTimeout(() => advance(), 3000);
      return;
    }
    if (!mountedRef.current) return;
    resetRef.current();
    setTyped("");
    advancingRef.current = false;
    if (finishAfterSaveRef.current || i + 1 >= questions.length) {
      finishAll();
    } else {
      setIndex(i + 1);
      setPhase("speaking");
    }
  }, [client, questions, finishAll]);

  // Everything already answered (resume after the last question).
  useEffect(() => {
    if (index >= questions.length) finishAll();
  }, [index, questions.length, finishAll]);

  // Overall time limit from the server.
  useEffect(() => {
    if (!session.deadline_at) return undefined;
    const skew = new Date(session.server_time).getTime() - Date.now();
    const tick = () => setDeadlineLeft(Math.floor((new Date(session.deadline_at).getTime() - (Date.now() + skew)) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session.deadline_at, session.server_time]);

  // Server time is up: save what we have, then submit.
  useEffect(() => {
    if (deadlineLeft === null || deadlineLeft > 0 || finishedRef.current) return;
    if (advancingRef.current) {
      finishAfterSaveRef.current = true; // submit after the in-flight save completes
    } else if (phase === "answering") {
      finishAfterSaveRef.current = true;
      advance();
    } else {
      finishAll();
    }
  }, [deadlineLeft, phase, advance, finishAll]);

  // Phase: read the question aloud.
  useEffect(() => {
    if (phase !== "speaking" || !question) return undefined;
    const synth = window.speechSynthesis;
    let done = false;
    let utter = null;
    const next = () => {
      if (done) return;
      done = true;
      setSeconds(BUFFER_SECONDS);
      setPhase("buffer");
    };
    if (!synth) {
      next();
      return undefined;
    }
    synth.cancel();
    utter = new SpeechSynthesisUtterance(question.question);
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : "en-IN";
    utter.onend = next;
    utter.onerror = next;
    synth.speak(utter);
    // Some browsers never fire onend; fall back after a reasonable reading time.
    const words = question.question.split(/\s+/).length;
    const fallback = setTimeout(() => {
      synth.cancel(); // stop speaking so the microphone does not pick up the question
      next();
    }, Math.max(4000, words * 450 + 2000));
    return () => {
      done = true;
      clearTimeout(fallback);
      if (utter) {
        utter.onend = null;
        utter.onerror = null;
      }
      synth.cancel();
    };
  }, [phase, question]);

  // Phase: short countdown before answering.
  useEffect(() => {
    if (phase !== "buffer") return undefined;
    if (seconds <= 0) {
      resetRef.current();
      answerStartRef.current = Date.now();
      setSeconds(ANSWER_SECONDS);
      setPhase("answering");
      if (canUseVoice && !typing) SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      return undefined;
    }
    const t = setTimeout(() => setSeconds((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds, canUseVoice, typing]);

  // Phase: answering countdown.
  useEffect(() => {
    if (phase !== "answering") return undefined;
    if (seconds <= 0) {
      advance();
      return undefined;
    }
    const t = setTimeout(() => setSeconds((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds, advance]);

  // Autosave the in-progress answer (not final) so a crash loses at most a few seconds.
  useEffect(() => {
    if (phase !== "answering" || !question) return undefined;
    const t = setInterval(() => {
      const answer = textRef.current;
      if (!answer || advancingRef.current) return;
      const time = Math.round((Date.now() - answerStartRef.current) / 1000);
      autosaveRef.current = client.saveAnswer(question.id, { answer, time }).catch(() => {});
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [phase, question, client]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimerRef.current);
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const switchToTyping = () => {
    stopListening();
    setTyped(transcript);
    setTyping(true);
  };

  if (fatal) {
    return (
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow" role="alert">
          <h2 className="mpod-title">Interview paused</h2>
          <p className="mpod-muted">{fatal}</p>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const isLast = index === questions.length - 1;
  const mmss = (s) => `${String(Math.floor(Math.max(s, 0) / 60)).padStart(2, "0")}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;

  return (
    <div className="mpod-center">
      <div className="mpod-panel mpod-question">
        <div className="mpod-question-main">
          <div className="mpod-row">
            <h2 className="mpod-title">QUESTION {index + 1} / {questions.length}</h2>
            <h2 className="mpod-accent" aria-live="off">
              {phase === "answering" ? mmss(seconds) : mmss(ANSWER_SECONDS)}
            </h2>
          </div>
          {deadlineLeft !== null && deadlineLeft < 120 && (
            <p className="mpod-warn" role="status">Interview time left: {mmss(deadlineLeft)}</p>
          )}
          <h3 className="mpod-question-text">{question.question}</h3>

          {phase === "answering" ? (
            <>
              <span className="mpod-accent mpod-strong">Answer{useTyping ? " (type below)" : " (speak now)"}:</span>
              {useTyping ? (
                <textarea
                  className="mpod-textarea"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type your answer here..."
                  maxLength={10000}
                  aria-label="Your answer"
                  autoFocus
                />
              ) : (
                <div className="mpod-answer-box" aria-live="polite">
                  <p>{transcript || "Your answer will appear here as you speak..."}</p>
                </div>
              )}
              {!canUseVoice && (
                <p className="mpod-muted">Voice input is not available in this browser or the microphone is blocked, so please type your answer.</p>
              )}
              <div className="mpod-actions">
                {canUseVoice && !typing && (
                  <button className="mpod-btn" onClick={switchToTyping}>Type instead</button>
                )}
                <button className="mpod-btn mpod-btn-primary" onClick={() => advance()}>
                  {isLast ? "Submit interview" : "Next question"}
                </button>
              </div>
            </>
          ) : (
            <div className="mpod-answer-box mpod-answer-wait">
              {phase === "buffer" ? (
                <div style={{ textAlign: "center" }}>
                  <Lottie animationData={timerAnimation} loop style={{ width: 100, height: 100, margin: "0 auto" }} />
                  <p>Start answering in <span className="mpod-accent">{seconds}</span> seconds...</p>
                </div>
              ) : phase === "saving" ? (
                <p role="status">Saving your answer...</p>
              ) : (
                <Lottie animationData={aiAnimation} loop style={{ width: 150, height: 150 }} />
              )}
            </div>
          )}
          {saveError && <p className="mpod-warn" role="alert">{saveError}</p>}
        </div>
        <div className="mpod-question-side">
          <img src="/ai-robo.gif" alt="" width="200" />
        </div>
      </div>
    </div>
  );
}

VoiceInterview.propTypes = {
  session: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default VoiceInterview;
