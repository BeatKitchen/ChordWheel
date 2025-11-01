// HelpModal.tsx  
// Interactive help overlay for ChordWheel v3.1.0
// Shows keyboard shortcuts, UI explanations, and workflow tips

import React from "react";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "ui-sans-serif, system-ui",
        padding: 16,
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #374151",
          borderRadius: 16,
          padding: "32px 40px",
          maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            borderBottom: "2px solid #39FF14",
            paddingBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#39FF14" }}>
            ChordWheel Help
          </h1>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "2px solid #374151",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Start */}
        <Section title="🎹 Quick Start">
          <p>
            ChordWheel is an interactive music theory tool that visualizes
            harmony as a circular interface. Play chords on your MIDI keyboard
            or click wedges to explore diatonic chords, borrowed chords, and
            advanced progressions.
          </p>
        </Section>

        {/* Keyboard Shortcuts */}
        <Section title="⌨️ MIDI Keyboard Controls">
          <ShortcutRow
            keys="Left hand (≤C3)"
            description="Change key center (play any note to set the tonic)"
          />
          <ShortcutRow
            keys="Right hand (>C3)"
            description="Play chords (recognized in real-time)"
          />
          <ShortcutRow
            keys="Sustain pedal"
            description="Latches notes for easier chord building"
          />
          <ShortcutRow
            keys="Triple-tap Am"
            description="Enter Relative Minor mode (Am tonality)"
          />
          <ShortcutRow
            keys="Triple-tap C"
            description="Return to home key (C major)"
          />
          <ShortcutRow
            keys="Triple-tap G (in Parallel)"
            description="Exit Parallel mode back to home"
          />
        </Section>

        {/* Modes */}
        <Section title="🎵 Mode Buttons">
          <ShortcutRow
            keys="HOME"
            description="Diatonic chords in the current key (I, ii, iii, IV, V7, vi, viiø7)"
          />
          <ShortcutRow
            keys="PARALLEL"
            description="Parallel minor key (Eb for C major) - modal interchange chords"
          />
          <ShortcutRow
            keys="RELATIVE"
            description="Relative minor (Am for C major) - shifted perspective"
          />
          <ShortcutRow
            keys="SUBDOM"
            description="Subdominant area (F for C major) - iv, ♭VII, and secondary dominants"
          />
        </Section>

        {/* UI Components */}
        <Section title="🎨 UI Components">
          <ShortcutRow
            keys="Colored wedges"
            description="Click to preview chords, or play on MIDI to activate"
          />
          <ShortcutRow
            keys="Center hub"
            description="Shows current chord name and enharmonic spelling"
          />
          <ShortcutRow
            keys="Green ring"
            description="Highlights active chord, fades when released"
          />
          <ShortcutRow
            keys="Red bonus arc"
            description="Appears for special chords like Bdim, V/ii, and diminished 7ths"
          />
          <ShortcutRow
            keys="Piano keyboard"
            description="Visual feedback of notes you're playing"
          />
          <ShortcutRow
            keys="Key dropdown"
            description="Change the home key (affects all modes)"
          />
        </Section>

        {/* Workflow Tips */}
        <Section title="💡 Workflow Tips">
          <Tip>
            Start in <strong>HOME</strong> mode and explore the 7 diatonic
            chords before venturing into other modes.
          </Tip>
          <Tip>
            Use <strong>PARALLEL</strong> mode to borrow chords from the
            parallel minor (creates darker, more dramatic sounds).
          </Tip>
          <Tip>
            The <strong>SUBDOM</strong> button spins the wheel to show
            subdominant-area chords. Play Bb or Bb7 to return home.
          </Tip>
          <Tip>
            Triple-tap technique: Quickly play the same chord 3 times within 1.5
            seconds to trigger mode changes.
          </Tip>
          <Tip>
            Enharmonic spellings (like Db vs C#) are chosen automatically based
            on music theory context for clarity.
          </Tip>
          <Tip>
            The bonus red arc shows "outside" chords that don't fit neatly into
            the wedge layout - these are powerful color chords!
          </Tip>
        </Section>

        {/* Advanced Features */}
        <Section title="🚀 Advanced Features">
          <Tip>
            <strong>Secondary dominants:</strong> Play A7 to tonicize ii (Dm),
            creating tension and resolution.
          </Tip>
          <Tip>
            <strong>Diminished 7ths:</strong> Four-note diminished chords create
            maximum tension, shown in the bonus arc.
          </Tip>
          <Tip>
            <strong>Voice leading:</strong> The wheel layout reflects common
            progressions (ii→V→I, vi→ii→V, etc.)
          </Tip>
          <Tip>
            <strong>Seventh chords:</strong> Adding the 7th enriches the harmony
            and is detected automatically (e.g. Dm7, C maj7).
          </Tip>
        </Section>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #374151",
            textAlign: "center",
            color: "#888",
            fontSize: 14,
          }}
        >
          <p style={{ marginBottom: 8 }}>
            <strong style={{ color: "#39FF14" }}>ChordWheel v3.1.0</strong> by
            Beat Kitchen
          </p>
          <p>Press ? or click the help button anytime to return here</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          color: "#39FF14",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#ddd" }}>
        {children}
      </div>
    </div>
  );
}

function ShortcutRow({ keys, description }: { keys: string; description: string }) {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 12,
        alignItems: "flex-start",
      }}
    >
      <code
        style={{
          background: "#0f172a",
          border: "1px solid #374151",
          borderRadius: 6,
          padding: "4px 8px",
          fontSize: 13,
          fontWeight: 600,
          color: "#39FF14",
          minWidth: 180,
          marginRight: 16,
          flexShrink: 0,
        }}
      >
        {keys}
      </code>
      <span style={{ fontSize: 14, color: "#ccc" }}>{description}</span>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: 12,
        paddingLeft: 16,
        borderLeft: "3px solid #39FF14",
        fontSize: 14,
        color: "#ccc",
      }}
    >
      {children}
    </div>
  );
}