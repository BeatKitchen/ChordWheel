import type { Fn, SizeSpec } from "./types";

/** ===== Visual + Layout ===== */
export const ACTIVE_STROKE = "#39FF14";
export const INACTIVE_WEDGE_OPACITY = 0.35;

export const DIM_OPACITY = 0.28; // 0..1 (lower = darker). Tweak to taste.


export const WHEEL_W = 520;
export const WHEEL_H = 560;

/** The nominal radius used by geometry (WHEEL_* is the SVG frame). */
export const RADIUS = 220;

/** Hub */
export const HUB_RADIUS = 0.30;
export const HUB_FILL = "#ffffff";
export const HUB_STROKE = "#e5e7eb";
export const HUB_STROKE_W = 2;
export const CENTER_FONT_FAMILY =
  "system-ui, ui-sans-serif, -apple-system, Segoe UI";
export const CENTER_FONT_SIZE = 18;
export const CENTER_FILL = "#111111";

/** Wedges ordering, sizes and anchors (top-degree coords) */
export const WEDGE_ORDER: Fn[] = [
  "I",
  "ii",
  "V/V",
  "iii",
  "V/vi",
  "iv",
  "IV",
  "V7",
  "vi",
  "♭VII",
];

export const WEDGE_DEGREES: SizeSpec = {
  I: 30,
  ii: 13,
  "V/V": 33,
  iii: 13,
  "V/vi": 30,
  iv: 13,
  IV: 35,
  V7: 40,
  vi: 35,
  "♭VII": 15,
};

export const WEDGE_ANCHOR_DEG: Partial<Record<Fn, number>> = {
  I: 358,
  ii: 24,
  "V/V": 52,
  iii: 79,
  "V/vi": 106,
  iv: 134,
  IV: 168,
  V7: 210,
  vi: 289,
  "♭VII": 325,
};

export const WEDGE_GAP_DEG = 0;

/** Ring thickness (as fraction of RADIUS) used by geometry.ts */
export const RING_INNER_R = 0.38;
export const RING_OUTER_R = 1.0;

/** Colors */
export const FN_COLORS: Record<Fn, string> = {
  I: "#F2D74B",
  ii: "#36C0CA",
  "V/V": "#CE6F6F",
  iii: "#36B5CA",
  "V/vi": "#D88484",
  iv: "#2AA3B8",
  IV: "#14B8A6",
  V7: "#7A1B1D",
  vi: "#F0AD21",
  "♭VII": "#2F9BB0",
};

export const FN_LABEL_COLORS: Record<Fn, string> = {
  I: "#111",
  ii: "#fff",
  "V/V": "#fff",
  iii: "#fff",
  "V/vi": "#fff",
  iv: "#fff",
  IV: "#fff",
  V7: "#fff",
  vi: "#111",
  "♭VII": "#fff",
};

/** Rotation + animation */
export const VISITOR_ROTATE_DEG = 70;     // Parallel / Relative spin
export const IV_ROTATE_DEG = -168;        // (historical SUB spin value if/when used)
export const ROTATION_ANIM_MS = 260;
export const EPS_DEG = 0.4;
export const NEGATIVE_ON_VISITOR = false;

/** Ring trail fade (ms) */
export const RING_FADE_MS = 750;

/** Bonus overlay config */
export const BONUS_OVERLAY = true;
export const BONUS_WIDTH_DEG = 15;
export const BONUS_INNER_R = 0.20;
export const BONUS_OUTER_R = 0.99;
export const BONUS_OUTER_OVER = 1.07;
export const BONUS_CENTER_ANCHOR_DEG: number | null = 305;
export const BONUS_TEXT_SIZE = 12;
export const BONUS_TEXT_FILL = "#ffffff";
export const BONUS_FILL = "#9F171B";
export const BONUS_STROKE = "#ffffff";
export const BONUS_STAY_MS = 900;
export const BONUS_FADE_MS = 300;

/** Bonus function labels shown above wedge label */
export const BONUS_FUNCTION_BY_LABEL: Record<string, string> = {
  "Bm7♭5": "viiø7",
  Bdim: "vii°",
  // A7 bonus family mapping (used elsewhere for triggers)
  A: "V/ii",
  A7: "V/ii",
  "C#dim": "V/ii",
  "C#m7♭5": "V/ii",
  "C#dim7": "V/ii",
};

/** Feature flags / UI behavior */
export const SHOW_WEDGE_LABELS = true;
export const SHOW_CENTER_LABEL = true;
export const ENABLE_WEB_MIDI = true;
export const MIDI_SUPPORTED =
  typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;

/** Preview behavior */
export const PREVIEW_USE_SEVENTHS = false; // forces sevenths on previews if true
export const LATCH_PREVIEW = true;         // keep showing last preview if no keys held

/** Global UI scale + keyboard sizing (no UI sliders; change here only) */
export const UI_SCALE_DEFAULT = 1.0;       // wheel + keyboard global CSS scale
export const KBD_WIDTH_FRACTION = 0.86;    // keyboard width as fraction of WHEEL_W

// =========================
// HARMONYWHEEL V3 ADDITIONS
// =========================

// Visual transitions
export const DIM_FADE_MS = 750;      // fade duration (ms) for de-dimming other wedges
export const JIGGLE_DEG = 30;        // ±degrees for SUB→HOME jiggle
export const JIGGLE_MS = 120;        // duration of each jiggle phase (ms)
export const BONUS_DEBOUNCE_MS = 50; // debounce for Bdim/Bm7b5 overlay (ms)

// Layout / UI sizing (bottom panel split)
export const KEYBOARD_WIDTH_FRACTION = 0.75;   // left: keyboard width share (0..1)
export const GUITAR_TAB_WIDTH_FRACTION = 0.25; // right: guitar tab width share (0..1)

// >>> PATCH START — lib/config.ts guitar theme + (optional) shorter keyboard
export const GUITAR_THEME = {
  bg:     "#0b1220",
  border: "#334155",
  fg:     "#e5e7eb",
  stroke: "#94a3b8",
  string: "#64748b",
  fret:   "#64748b",
};

// (optional) make the keyboard a touch shorter to free vertical space
// Replace your existing export for KBD_HEIGHT_FACTOR_DEFAULT with this line:
export const KBD_HEIGHT_FACTOR_DEFAULT = 1;
// >>> PATCH END — lib/config.ts guitar theme + (optional) shorter keyboard
