
import { useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  async function requestCamera() {
    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  }

  return (
    <div>
      <h1>myAthena</h1>
      <p>Allow camera access before starting the test.</p>

      <button onClick={requestCamera}>
        Grant Camera Access
      </button>

      {error && <p>{error}</p>}

      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="480"
        />
      </div>
    </div>
  );
}

export default App;
