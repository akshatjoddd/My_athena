import React, { useEffect, useRef, useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    topic: "JavaScript",
    question: "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "let", "static", "define"],
    answer: 1
  },
  {
    id: 2,
    topic: "Web fundamentals",
    question: "Which HTTP status code usually means a resource was successfully created?",
    options: ["200", "201", "301", "404"],
    answer: 1
  },
  {
    id: 3,
    topic: "Databases",
    question: "Which SQL clause filters grouped results after aggregation?",
    options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
    answer: 2
  },
  {
    id: 4,
    topic: "React",
    question: "Which React hook is commonly used to store component state?",
    options: ["useMemo", "useState", "useRoute", "useFetch"],
    answer: 1
  },
  {
    id: 5,
    topic: "Node.js",
    question: "Which module provides file-system operations in Node.js?",
    options: ["http", "pathway", "fs", "events-ui"],
    answer: 2
  }
];

export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraState, setCameraState] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stage, setStage] = useState("setup");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const onFullscreenChange = async () => {
      let full = Boolean(document.fullscreenElement);
      if (window.myAthena?.isFullscreen) {
        try { full = await window.myAthena.isFullscreen(); } catch {}
      }
      if (mounted) setIsFullscreen(full);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    const poll = window.setInterval(onFullscreenChange, 500);
    onFullscreenChange();
    return () => {
      mounted = false;
      window.clearInterval(poll);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (cameraState !== "ready" || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;

    if (video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
    }
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
    
        if (error?.name === "AbortError") return;
        setCameraError("Camera was granted, but preview playback failed: " + (error.message || "unknown playback error"));
      });
    }
  }, [cameraState]);

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  }, []);

  async function enableCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraError("Camera access is unavailable. Run this in the Electron desktop app or a secure browser context.");
      return;
    }
    try {
      setCameraState("loading");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;

      setCameraState("ready");
    } catch (error) {
      setCameraState("error");
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Allow camera access in macOS System Settings and try again.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found. Connect a camera and try again.");
      } else {
        setCameraError(error.message || "Could not start the camera.");
      }
    }
  }

  async function enterFullscreen() {
    try {
      if (window.myAthena?.enterFullscreen) {
        const entered = await window.myAthena.enterFullscreen();
        if (!entered) throw new Error("Electron did not enter fullscreen mode");
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        throw new Error("Fullscreen is not supported in this environment");
      }
      setIsFullscreen(true);
      setStage("ready");
    } catch (error) {
      setCameraError(`Fullscreen could not be enabled: ${error?.message || "Please try again."}`);
    }
  }

  function startTest() {
    setStage("test");
    setCurrentQuestion(0);
  }

  function chooseAnswer(index) {
    setAnswers(previous => ({ ...previous, [QUESTIONS[currentQuestion].id]: index }));
  }

  function finishTest() {
    setSubmitted(true);
    setStage("results");
  }

  function resetApp() {
    setStage("setup");
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  }

  const answeredCount = Object.keys(answers).length;
  const score = QUESTIONS.reduce((total, q) => total + (answers[q.id] === q.answer ? 1 : 0), 0);
  const question = QUESTIONS[currentQuestion];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">myAthena</div>
            <div className="brand-subtitle">ASSESSMENT ENVIRONMENT</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className="status-dot" />
          <span>Local session</span>
          <span className="topbar-divider" />
          <span className="shortcut"><kbd>⌘</kbd><kbd>Q</kbd> Quit</span>
        </div>
      </header>

      {stage === "setup" && (
        <section className="setup-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> READY WHEN YOU ARE</div>
            <h1>Focus on the<br /><span>questions.</span></h1>
            <p className="hero-description">
              Prepare your environment before the assessment begins. Check your camera,
              enter fullscreen, then start your test.
            </p>

            <div className="steps">
              <div className={`step ${cameraState === "ready" ? "complete" : "active"}`}>
                <div className="step-icon">{cameraState === "ready" ? "✓" : "01"}</div>
                <div><strong>Camera check</strong><span>Make sure your camera is working</span></div>
                <span className="step-status">{cameraState === "ready" ? "READY" : "REQUIRED"}</span>
              </div>
              <div className={`step ${isFullscreen ? "complete" : ""}`}>
                <div className="step-icon">{isFullscreen ? "✓" : "02"}</div>
                <div><strong>Enter fullscreen</strong><span>Give the assessment your full attention</span></div>
                <span className="step-status">{isFullscreen ? "READY" : "REQUIRED"}</span>
              </div>
              <div className="step">
                <div className="step-icon">03</div>
                <div><strong>Review instructions</strong><span>Read the questions before you begin</span></div>
                <span className="step-status">NEXT</span>
              </div>
            </div>

            <div className="actions">
              <button className="button button-secondary" onClick={enableCamera} disabled={cameraState === "loading"}>
                <span className="button-symbol">◎</span>
                {cameraState === "loading" ? "Connecting camera…" : cameraState === "ready" ? "Camera connected" : "Enable camera"}
              </button>
              <button className="button button-primary" onClick={enterFullscreen}>
                Enter fullscreen <span className="arrow">↗</span>
              </button>
            </div>
            {cameraError && <div className="error-message" role="alert">{cameraError}</div>}
            <div className="privacy-note"><span>◈</span> Camera stays on this device. No video is recorded or uploaded by this demo.</div>
          </div>

          <aside className="preview-panel">
            <div className="panel-topline"><span>ENVIRONMENT CHECK</span><span className="live-label"><i /> LIVE PREVIEW</span></div>
            <div className={`camera-frame ${cameraState === "ready" ? "camera-on" : ""}`}>
              {cameraState === "ready" ? (
                <video ref={videoRef} autoPlay muted playsInline />
              ) : (
                <div className="camera-placeholder">
                  <div className="camera-orbit"><div className="camera-icon">◉</div></div>
                  <strong>Camera preview</strong>
                  <span>Your preview will appear here</span>
                </div>
              )}
              <div className="camera-overlay-top"><span className="rec-dot" /> {cameraState === "ready" ? "CAMERA ACTIVE" : "CAMERA STANDBY"}</div>
              <div className="camera-overlay-bottom"><span>LOCAL DEVICE</span><span>● PRIVATE</span></div>
            </div>
            <div className="preview-meta">
              <div><span className="meta-label">ASSESSMENT</span><strong>Knowledge check</strong></div>
              <div><span className="meta-label">QUESTIONS</span><strong>{QUESTIONS.length} total</strong></div>
              <div><span className="meta-label">EST. TIME</span><strong>10 minutes</strong></div>
            </div>
            <div className="preview-divider" />
            <div className="instructions-title">Before you begin</div>
            <ul className="instruction-list">
              <li><span>✓</span> Find a quiet, well-lit space</li>
              <li><span>✓</span> Keep your device plugged in</li>
              <li><span>✓</span> Stay in the test window while working</li>
            </ul>
            <div className="panel-footer"><span className="shield">◇</span><span>Your answers stay in this session and are not sent to a server.</span></div>
          </aside>
        </section>
      )}

      {stage === "ready" && (
        <section className="test-layout ready-layout">
          <div className="test-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> FULLSCREEN READY</div>
              <h2>Review your test.</h2>
              <p>Take a moment to review the fixed questions, then start when you're ready.</p>
            </div>
            <div className="ready-count"><strong>{QUESTIONS.length}</strong><span>QUESTIONS</span></div>
          </div>
          <div className="review-list">
            {QUESTIONS.map((q, i) => (
              <div className="review-question" key={q.id}>
                <span className="review-number">{String(i + 1).padStart(2, "0")}</span>
                <div><span className="review-topic">{q.topic}</span><strong>{q.question}</strong></div>
                <span className="review-chevron">↗</span>
              </div>
            ))}
          </div>
          <div className="ready-footer">
            <div className="ready-note"><span>◇</span><span>Once you start, your answers will be kept in this session.</span></div>
            <button className="button button-primary start-test-button" onClick={startTest}>Start test <span className="arrow">→</span></button>
          </div>
        </section>
      )}

      {stage === "test" && (
        <section className="test-layout">
          <div className="test-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> ASSESSMENT IN PROGRESS</div><h2>Knowledge check</h2><p>Choose one answer for each question.</p></div>
            <div className="test-progress-copy"><strong>{String(currentQuestion + 1).padStart(2, "0")}</strong><span> / {String(QUESTIONS.length).padStart(2, "0")}</span></div>
          </div>
          <div className="progress-track"><div style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <div className="question-card">
            <div className="question-meta"><span>QUESTION {String(currentQuestion + 1).padStart(2, "0")}</span><span className="topic-pill">{question.topic}</span></div>
            <h3>{question.question}</h3>
            <div className="options-list">
              {question.options.map((option, index) => (
                <button key={option} className={`option ${answers[question.id] === index ? "selected" : ""}`} onClick={() => chooseAnswer(index)}>
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span><span className="option-check">{answers[question.id] === index ? "✓" : ""}</span>
                </button>
              ))}
            </div>
            <div className="question-footer">
              <span>{answeredCount} of {QUESTIONS.length} answered</span>
              <div className="question-actions">
                <button className="button button-quiet" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(n => n - 1)}>← Previous</button>
                {currentQuestion < QUESTIONS.length - 1 ? (
                  <button className="button button-primary" onClick={() => setCurrentQuestion(n => n + 1)}>Next question <span className="arrow">→</span></button>
                ) : (
                  <button className="button button-primary" onClick={finishTest}>Submit test <span className="arrow">✓</span></button>
                )}
              </div>
            </div>
          </div>
          <div className="question-index">
            {QUESTIONS.map((q, i) => <button key={q.id} aria-label={`Go to question ${i + 1}`} className={`${i === currentQuestion ? "current" : ""} ${answers[q.id] !== undefined ? "answered" : ""}`} onClick={() => setCurrentQuestion(i)}>{i + 1}</button>)}
          </div>
        </section>
      )}

      {stage === "results" && (
        <section className="results-layout">
          <div className="result-icon">✓</div>
          <div className="eyebrow"><span className="eyebrow-line" /> ASSESSMENT COMPLETE</div>
          <h2>Test submitted.</h2>
          <p className="hero-description">Your responses have been evaluated locally for this demo.</p>
          <div className="score-card"><span>YOUR SCORE</span><strong>{score}<small> / {QUESTIONS.length}</small></strong><div className="score-track"><div style={{ width: `${(score / QUESTIONS.length) * 100}%` }} /></div><span>{Math.round(score / QUESTIONS.length * 100)}% correct</span></div>
          <button className="button button-primary" onClick={resetApp}>Return to setup <span className="arrow">↻</span></button>
        </section>
      )}

      <footer className="app-footer"><span>myAthena <span className="footer-muted">/ Secure assessment demo</span></span><span>BUILT FOR FOCUS <span className="footer-star">✳</span></span></footer>
    </main>
  );
}
