// HelpOverlay.tsx
// Complete help system with callouts for all major UI elements
// Based on user sketch - all callouts shown at once with dark styling

import React from "react";

interface HelpOverlayProps {
  onClose: () => void;
}

// Callout component with pointer and color coding
const Callout = ({ 
  title, 
  text, 
  top, 
  left, 
  right, 
  bottom,
  pointerDirection = 'none',
  width = 260,
  color = '#39FF14', // Default green, can override
  style
}: { 
  title: string; 
  text: string; 
  top?: string; 
  left?: string; 
  right?: string;
  bottom?: string;
  pointerDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  width?: number;
  color?: string;
  style?: React.CSSProperties;
}) => {
  // Pointer direction = where the arrow POINTS (toward the target)
  const pointerStyles: Record<string, React.CSSProperties> = {
    left: {
      // Points LEFT - so box is on the RIGHT, pointer on left side of box
      position: 'absolute',
      left: -12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: `12px solid ${color}`,
    },
    right: {
      // Points RIGHT - so box is on the LEFT, pointer on right side of box
      position: 'absolute',
      right: -12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: `12px solid ${color}`,
    },
    top: {
      // Points UP - so box is BELOW, pointer on top of box
      position: 'absolute',
      top: -12,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: `12px solid ${color}`,
    },
    bottom: {
      // Points DOWN - so box is ABOVE, pointer on bottom of box
      position: 'absolute',
      bottom: -12,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: `12px solid ${color}`,
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        right,
        bottom,
        width,
        padding: "12px 14px",
        background: "#0a0a0a",
        border: `2px solid ${color}`,
        borderRadius: 8,
        color: "#fff",
        zIndex: 9999,
        boxShadow: "0 6px 20px rgba(0,0,0,0.7)",
        ...style
      }}
    >
      {pointerDirection !== 'none' && <div style={pointerStyles[pointerDirection]} />}
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.4, color: "#d0d0d0" }}>
        {text}
      </div>
    </div>
  );
};

export default function HelpOverlay({ onClose }: HelpOverlayProps) {
  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 9998,
        }}
      />

      {/* Close instruction */}
      <div
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: "#0a0a0a",
          border: "2px solid #39FF14",
          borderRadius: 6,
          color: "#39FF14",
          fontSize: 13,
          fontWeight: 600,
          zIndex: 10000,
        }}
      >
        Press ESC or click anywhere to close
      </div>

      {/* 1. Chord Wheel - Upper left, points RIGHT at wheel - GOOD */}
      <Callout
        title="Chord Wheel"
        text="Click wedges to play chords. Colors show harmonic function. Larger wedges are more important in the key."
        top="200px"
        left="20px"
        pointerDirection="right"
        color="#5EEAD4"
        width={240}
      />

      {/* 2. Skill Levels - CHANGED: Now points UP at icons */}
      <Callout
        title="Skill Levels"
        text="Control complexity: ROOKIE (3 chords) → EXPERT (all features). Click icons to change."
        top="100px"
        right="140px"
        pointerDirection="top"
        width={240}
        color="#39FF14"
      />

      {/* 3. Key & Spaces - MOVED DOWN, points DOWN, shifted right */}
      <Callout
        title="Key & Spaces"
        text="C button = change key. HOME/REL/SUB/PAR = explore related keys. Keyboard shortcuts: letters for keys, H/R/S/P for spaces."
        top="680px"
        left="180px"
        pointerDirection="bottom"
        width={260}
        color="#F2D74B"
      />

      {/* 4. Piano & Guitar - RIGHT side with pointer on LEFT pointing DOWN */}
      <Callout
        title="Piano & Guitar"
        text="Yellow keys show current chord. Guitar tab shows fingering. Click keys or use MIDI to play."
        top="740px"
        right="20px"
        pointerDirection="bottom"
        width={240}
        color="#5EEAD4"
      />

      {/* 5. Song Display - NEW callout for text display area */}
      <Callout
        title="Song Display"
        text="Your chord progression appears here in EXPERT mode. Click chords to jump to that position. Type in the field below to edit."
        top="600px"
        left="20px"
        pointerDirection="right"
        width={260}
        color="#F0AD21"
      />

      {/* 6. Expert Features - Keep same, pointing UP - GOOD */}
      <Callout
        title="Expert Mode Features"
        text="⚡ Make My Key: reharmonize to new tonic • Song sequence & text input for progressions • Auto-Record captures chords automatically"
        bottom="160px"
        left="20px"
        pointerDirection="top"
        width={280}
        color="#F2D74B"
      />

      {/* 7. Audio & MIDI - MOVED to RIGHT side to free up left space */}
      <Callout
        title="Audio & MIDI"
        text="🔊 Enable sound. Select MIDI device to play with keyboard or controller."
        bottom="20px"
        right="20px"
        pointerDirection="left"
        width={240}
        color="#39FF14"
      />

      {/* Documentation link */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: "#0a0a0a",
          border: "2px solid #39FF14",
          borderRadius: 6,
          color: "#d0d0d0",
          fontSize: 12,
          zIndex: 10000,
        }}
      >
        Full docs:{" "}
        <a 
          href="https://github.com/beat-kitchen/harmony-wheel" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: "#39FF14", textDecoration: "underline", fontWeight: 600 }}
        >
          README.md
        </a>
      </div>
    </>
  );
}