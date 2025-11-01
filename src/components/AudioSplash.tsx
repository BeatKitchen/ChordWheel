// AudioSplash.tsx
// Handles Web Audio API initialization requirement (user gesture needed)
// Shows splash screen on first visit, stores preference in localStorage

import React from "react";

interface AudioSplashProps {
  onDismiss: () => void;
}

export default function AudioSplash({ onDismiss }: AudioSplashProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        fontFamily: "ui-sans-serif, system-ui",
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "2px solid #39FF14",
          borderRadius: 16,
          padding: "48px 64px",
          maxWidth: 500,
          textAlign: "center",
          boxShadow: "0 0 60px rgba(57, 255, 20, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔊</div>
        <h1
          style={{
            color: "#39FF14",
            fontSize: 28,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Enable Audio
        </h1>
        <p
          style={{
            color: "#ccc",
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          ChordWheel needs your permission to play audio. Click the button below
          to enable sound for your MIDI keyboard and chord playback.
        </p>
        <button
          onClick={onDismiss}
          style={{
            background: "#39FF14",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.target as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          Enable Audio
        </button>
        <p style={{ color: "#666", fontSize: 12, marginTop: 24 }}>
          (This is required by your browser's security policy)
        </p>
      </div>
    </div>
  );
}