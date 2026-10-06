import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";
import { errorMessage } from "../../api/axiosInstance";
import { withRetry } from "./sessionApi";
import useFaceTracking from "./useFaceTracking";

const IDEA_PASS = 50;
const AUTOSAVE_MS = 15000;

// Problem descriptions are authored as HTML by admins; always sanitise before rendering.
const safeHtml = (html) => ({
  __html: DOMPurify.sanitize(String(html || "").replace(/&nbsp;/g, " "), { USE_PROFILES: { html: true } }),
});

const plainText = (html) =>
  String(html || "")
    .replace(/<\/(p|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

// Blocks copy/paste in answer boxes (the interview must be typed by the candidate).
const noClipboard = {
  onCopy: (e) => e.preventDefault(),
  onCut: (e) => e.preventDefault(),
  onPaste: (e) => e.preventDefault(),
  onDrop: (e) => e.preventDefault(),
  onContextMenu: (e) => e.preventDefault(),
};

/**
 * Coding interview: for every problem the student explains an idea (checked by the
 * server), writes code, then optimises it. Everything is saved server-side.
 */
function CodingInterview({ session, client, onFinish }) {
  const questions = session.questions;
  const savedById = useMemo(() => Object.fromEntries((session.answers || []).map((a) => [a.question_id, a])), [session.answers]);
  // Resume at the first problem the student had not moved past.
  const firstOpen = questions.findIndex((q) => !savedById[q.id] || !savedById[q.id].final);

  const [index, setIndex] = useState(firstOpen === -1 ? questions.length - 1 : firstOpen);
  const question = questions[index];
  const saved = savedById[question.id] || {};

  const initialStage = (s) => (s.optimized_answer ? "optimize" : s.matched_accuracy >= IDEA_PASS ? "code" : "idea");
  const [stage, setStage] = useState(initialStage(saved));
  const [idea, setIdea] = useState(saved.idea || "");
  const [code, setCode] = useState(saved.answer || "");
  const [optimized, setOptimized] = useState(saved.optimized_answer || "");
  const [ideaInfo, setIdeaInfo] = useState({ checking: false, message: "", attemptsLeft: null });
  const [timer, setTimer] = useState((Number(question.time) || 15) * 60);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [fatal, setFatal] = useState("");
  const startedAt = useRef(Date.now());
  const finished = useRef(false);
  const advancing = useRef(false);
  const face = useFaceTracking(true);
  const paused = face.status === "denied" || Boolean(fatal);

  const fieldsRef = useRef({});
  fieldsRef.current = { idea, answer: code, optimized_answer: optimized || code };
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const faceRef = useRef(face);
  faceRef.current = face;

  // final=true marks that the student moved past this problem (used for resume and
  // so that a late autosave can never overwrite it).
  const save = useCallback(
    ({ final = false, throwOnError = false } = {}) =>
      withRetry(() =>
        client.saveAnswer(question.id, {
          ...fieldsRef.current,
          time: Math.round((Date.now() - startedAt.current) / 1000),
          final,
        })
      ).catch((err) => {
        if (throwOnError) throw err;
      }),
    [client, question.id]
  );

  const finishAll = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const f = faceRef.current;
    const emotions = f.status === "on" ? f.summary() : undefined;
    f.stop();
    onFinishRef.current(emotions);
  }, []);

  const goNext = useCallback(async () => {
    if (advancing.current || finished.current) return;
    advancing.current = true;
    setBusy(true);
    try {
      await save({ final: true, throwOnError: true });
    } catch (err) {
      advancing.current = false;
      setBusy(false);
      const status = err && err.response && err.response.status;
      if (status === 409) {
        finishAll();
        return;
      }
      if (status && status < 500 && status !== 429) {
        setFatal(errorMessage(err, "This interview session is no longer valid. Please restart the interview from your dashboard."));
        return;
      }
      setNotice(errorMessage(err, "Could not save your answer. Check your connection; retrying..."));
      setTimeout(() => {
        if (!finished.current) goNextRef.current();
      }, 5000);
      return;
    }
    advancing.current = false;
    setBusy(false);
    if (index + 1 >= questions.length) {
      finishAll();
      return;
    }
    const nextQ = questions[index + 1];
    const s = savedById[nextQ.id] || {};
    setIndex(index + 1);
    setStage(initialStage(s));
    setIdea(s.idea || "");
    setCode(s.answer || "");
    setOptimized(s.optimized_answer || "");
    setIdeaInfo({ checking: false, message: "", attemptsLeft: null });
    setTimer((Number(nextQ.time) || 15) * 60);
    startedAt.current = Date.now();
    setNotice("");
  }, [save, index, questions, savedById, finishAll]);
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  // Per-problem timer: when it runs out the current work is saved and we move on.
  useEffect(() => {
    if (paused) return undefined;
    if (timer <= 0) {
      goNextRef.current();
      return undefined;
    }
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, paused]);

  // Overall server deadline.
  useEffect(() => {
    if (!session.deadline_at) return undefined;
    const skew = new Date(session.server_time).getTime() - Date.now();
    const t = setInterval(() => {
      if (finished.current || advancing.current) return;
      if (new Date(session.deadline_at).getTime() - (Date.now() + skew) <= 0) {
        advancing.current = true;
        save({ final: true }).finally(finishAll);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [session.deadline_at, session.server_time, save, finishAll]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => {
      if (!advancing.current && !finished.current) save();
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [save, paused]);

  const checkIdea = async () => {
    if (!idea.trim()) {
      setIdeaInfo((x) => ({ ...x, message: "Describe your approach first." }));
      return;
    }
    setIdeaInfo((x) => ({ ...x, checking: true, message: "" }));
    try {
      const { data } = await client.analyzeIdea(question.id, idea.trim());
      if (data.unavailable) {
        // AI is down: the idea check is skipped so the interview can continue.
        await save();
        setStage("code");
        setIdeaInfo({ checking: false, message: data.message || "Idea check is unavailable right now. Continue with your code.", attemptsLeft: null });
        return;
      }
      if (data.accuracy >= IDEA_PASS) {
        await save();
        setStage("code");
        setIdeaInfo({ checking: false, message: "", attemptsLeft: data.attempts_left });
      } else {
        setIdeaInfo({
          checking: false,
          attemptsLeft: data.attempts_left,
          message:
            data.attempts_left > 0
              ? `Your idea does not solve the problem yet (${data.accuracy}%). Refine it and try again. Checks left: ${data.attempts_left}.`
              : "No idea checks left for this problem. You can still write your code.",
        });
        if (data.attempts_left === 0) setStage("code");
      }
    } catch (err) {
      const status = err && err.response && err.response.status;
      if (status === 429) {
        setStage("code");
        setIdeaInfo({ checking: false, message: "No idea checks left for this problem. You can still write your code.", attemptsLeft: 0 });
      } else {
        setIdeaInfo({ checking: false, message: errorMessage(err, "Could not check your idea. Try again."), attemptsLeft: null });
      }
    }
  };

  const toOptimize = async () => {
    if (!code.trim()) {
      setNotice("Write your code first.");
      return;
    }
    setNotice("");
    if (!optimized) setOptimized(code);
    await save();
    setStage("optimize");
  };

  const mmss = `${String(Math.floor(Math.max(timer, 0) / 60)).padStart(2, "0")}:${String(Math.max(timer, 0) % 60).padStart(2, "0")}`;
  const isLast = index === questions.length - 1;

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

  if (face.status === "denied") {
    return (
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow" role="alert">
          <h2 className="mpod-title">Camera access is required</h2>
          <p className="mpod-muted">Allow camera access in your browser for this site, then reload the page. Your progress is saved and the timer is paused on this screen, but the overall interview time limit still applies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mpod-center">
      <div className="mpod-panel mpod-coding">
        <div className="mpod-row">
          <h2 className="mpod-title">PROBLEM {index + 1} / {questions.length}</h2>
          <h2 className="mpod-accent">{mmss}</h2>
        </div>
        {face.warning && <p className="mpod-warn" role="alert">{face.warning}</p>}
        <div className="mpod-coding-grid">
          <div className="mpod-coding-problem">
            <h3 className="mpod-question-text">{question.problem_name}</h3>
            <div className="mpod-scroll">
              <h4>Description</h4>
              <div className="mpod-html" dangerouslySetInnerHTML={safeHtml(question.description)} />
              {question.input && (<><h4>Input</h4><pre className="mpod-pre">{plainText(question.input)}</pre></>)}
              {question.output && (<><h4>Output</h4><pre className="mpod-pre">{plainText(question.output)}</pre></>)}
              {question.constraints && (<><h4>Constraints</h4><pre className="mpod-pre">{plainText(question.constraints)}</pre></>)}
            </div>
          </div>
          <div className="mpod-coding-work">
            <span className="mpod-accent mpod-strong">
              {stage === "idea" ? "1. Explain your approach" : stage === "code" ? "2. Write your code" : "3. Optimise your code"}
            </span>
            {stage === "idea" && (
              <textarea className="mpod-textarea mpod-tall" value={idea} onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your approach..." aria-label="Your approach" maxLength={10000} {...noClipboard} />
            )}
            {stage === "code" && (
              <textarea className="mpod-textarea mpod-tall mpod-code" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Type your code here..." aria-label="Your code" spellCheck={false} maxLength={30000} {...noClipboard} />
            )}
            {stage === "optimize" && (
              <textarea className="mpod-textarea mpod-tall mpod-code" value={optimized} onChange={(e) => setOptimized(e.target.value)}
                placeholder="Improve your code..." aria-label="Your optimised code" spellCheck={false} maxLength={30000} {...noClipboard} />
            )}
            {ideaInfo.message && <p className="mpod-warn" role="status">{ideaInfo.message}</p>}
            {notice && <p className="mpod-warn" role="alert">{notice}</p>}
            <div className="mpod-actions">
              {stage === "idea" && (
                <button className="mpod-btn mpod-btn-primary" onClick={checkIdea} disabled={ideaInfo.checking}>
                  {ideaInfo.checking ? "Checking..." : "Check idea"}
                </button>
              )}
              {stage === "code" && <button className="mpod-btn mpod-btn-primary" onClick={toOptimize}>Done, optimise</button>}
              <button className="mpod-btn" onClick={goNext} disabled={busy}>
                {busy ? "Saving..." : isLast ? "Submit interview" : "Next problem"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <video ref={face.videoRef} autoPlay playsInline muted width="640" height="480" style={{ display: "none" }} />
    </div>
  );
}

CodingInterview.propTypes = {
  session: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default CodingInterview;
