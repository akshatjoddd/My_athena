
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // References
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // States
  const [cameraState, setCameraState] = useState("idle");
  const [cameraError, setCameraError] = useState("");

  // Turn on the camera
  async function enableCamera() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraError("Camera access is not available.");
      return;
    }

    try {
      setCameraState("loading");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;
      setCameraState("ready");
    } catch (error) {
      setCameraState("error");

      if (error.name === "NotAllowedError") {
        setCameraError("Please allow camera access in your settings.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else {
        setCameraError("Could not start the camera.");
      }
    }
  }

  // Show the live camera feed
  useEffect(() => {
    if (cameraState !== "ready") return;
    if (!videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.log("Video playback error:", error);
      setCameraError("Camera started, but preview could not play.");
    });
  }, [cameraState]);

  // Stop the camera when the component is removed
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>

          <div>
            <div className="brand-name">myAthena</div>
            <div className="brand-subtitle">
              ASSESSMENT ENVIRONMENT
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <span className="status-dot"></span>
          <span>Local session</span>
        </div>
      </header>

      <section className="setup-layout">
        <div className="hero-copy">
          <div className="eyebrow">
            READY WHEN YOU ARE
          </div>

          <h1>
            Focus on the <span>questions.</span>
          </h1>

          <p className="hero-description">
            Prepare your environment before the assessment
            begins. First, make sure your camera is working.
          </p>

          <div className="steps">
            <div
              className={`step ${
                cameraState === "ready" ? "complete" : "active"
              }`}
            >
              <div className="step-icon">
                {cameraState === "ready" ? "✓" : "01"}
              </div>

              <div>
                <strong>Camera check</strong>
                <span>Make sure your camera is working</span>
              </div>

              <span className="step-status">
                {cameraState === "ready" ? "READY" : "REQUIRED"}
              </span>
            </div>
          </div>

          <div className="actions">
            <button
              className="button button-primary"
              onClick={enableCamera}
              disabled={cameraState === "loading"}
            >
              {cameraState === "loading"
                ? "Connecting camera..."
                : cameraState === "ready"
                ? "Camera connected"
                : "Enable camera"}
            </button>
          </div>

          {cameraError && (
            <div className="error-message" role="alert">
              {cameraError}
            </div>
          )}

          <div className="privacy-note">
            Camera preview stays on this device in this demo.
          </div>
        </div>

        <aside className="preview-panel">
          <div className="panel-topline">
            <span>ENVIRONMENT CHECK</span>
            <span>
              {cameraState === "ready"
                ? "LIVE PREVIEW"
                : "CAMERA STANDBY"}
            </span>
          </div>

          <div
            className={`camera-frame ${
              cameraState === "ready" ? "camera-on" : ""
            }`}
          >
            {cameraState === "ready" ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="camera-placeholder">
                <div className="camera-icon">◉</div>

                <strong>Camera preview</strong>

                <span>
                  {cameraState === "loading"
                    ? "Connecting to your camera..."
                    : "Your preview will appear here"}
                </span>
              </div>
            )}
          </div>

          <div className="preview-meta">
            <div>
              <span className="meta-label">ASSESSMENT</span>
              <strong>Knowledge check</strong>
            </div>

            <div>
              <span className="meta-label">STATUS</span>
              <strong>
                {cameraState === "ready" ? "Camera ready" : "Not ready"}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <footer className="app-footer">
        <span>myAthena / Secure assessment demo</span>
        <span>BUILT FOR FOCUS</span>
      </footer>
    </main>
  );
}
