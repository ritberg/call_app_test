import React, { useRef } from "react";

export default function App() {
  const ws = useRef(null);
  const pc = useRef(null);
  const localStream = useRef(null);

  const start = async () => {
    // Connect WebSocket
    ws.current = new WebSocket("ws://localhost:wss://call-app-test.onrender.com");

    // Get microphone
    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

    pc.current = new RTCPeerConnection();

    // Send audio tracks
    localStream.current.getTracks().forEach(track => {
      pc.current.addTrack(track, localStream.current);
    });

    // Receive audio
    pc.current.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play();
    };

    // ICE candidates
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    ws.current.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);

      if (data.offer) {
        await pc.current.setRemoteDescription(data.offer);
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        ws.current.send(JSON.stringify({ answer }));
      }

      if (data.answer) {
        await pc.current.setRemoteDescription(data.answer);
      }

      if (data.candidate) {
        await pc.current.addIceCandidate(data.candidate);
      }
    };

    // Create offer
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ offer }));
    };
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <button onClick={start} style={{ fontSize: "24px", padding: "20px" }}>
        📞 Call
      </button>
    </div>
  );
}