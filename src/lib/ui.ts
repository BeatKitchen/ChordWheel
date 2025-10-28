// lib/ui.ts — UI-only styles (no logic)

// Outer panel that wraps everything
export const panelStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  border: "1px solid #374151",
  borderRadius: 12,
  padding: 16,
};

// Little status chip (“MIDI…”, “mode: …”)
export const chipStyle = () => ({
  style: {
    fontSize: 12,
    padding: "2px 6px",
    border: "1px solid #ffffff22",
    background: "#ffffff18",
    borderRadius: 6,
  } as React.CSSProperties,
});

// Inputs/selects share this
export const selectStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #374151",
  borderRadius: 6,
  background: "#111",
  color: "#fff",
};

export const textInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #374151",
  background: "#0f172a",
  color: "#e5e7eb",
  borderRadius: 8,
  fontFamily: "ui-sans-serif, system-ui",
  resize: "vertical",
};

// Top mode buttons (HOME / RELATIVE / SUBDOM / PARALLEL)
export const btnStyle = (on: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  border: "2px solid " + (on ? "#39FF14" : "#374151"),
  borderRadius: 8,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

// Compact arrow buttons (◀ ▶)
export const iconBtnStyle = (active = true, size = 36): React.CSSProperties => ({
  width: size,
  height: size,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid " + (active ? "#39FF14" : "#374151"),
  borderRadius: 8,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  lineHeight: 1,
  fontSize: 18,
  padding: 0,
  userSelect: "none",
});
