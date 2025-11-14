/**
 * spaces.ts — v4.2.1
 *
 * 📁 INSTALL TO: src/lib/engine/spaces.ts
 * 🔄 VERSION: 4.2.1 (Added C major as PAR exit chord)
 *
 * Space transition logic for HOME/SUB/PAR/REL
 *
 * CHANGES v4.2.1:
 * - Added C major as PAR exit chord (relative major of Cm/Eb)
 * - C major [0,4,7] in PAR now exits to HOME
 *
 * CHANGES v4.1.6:
 * - CRITICAL: Illegal chords now STAY in current space (don't exit)
 * - CRITICAL: SUB → PAR transition on Cm/Db/Ab (parallel minor entry)
 * - Fixed: Playing F# major in SUB no longer exits to HOME (stays in SUB)
 * - Behavior: Only explicit transition chords change spaces, not illegal chords
 *
 * CHANGES v4.0.66:
 * - CRITICAL: G major (triad) now allowed in PAR space (doesn't exit)
 * - Bible line 114 says "G7 = allowed" - now also allows G major triad
 * - Fixes: Playing G major in Cm (PAR) no longer exits to HOME
 *
 * CHANGES v4.0.65:
 * - CRITICAL: Triple-tap V or V7 now exits SUB → HOME (C triad in key C)
 * - Per Bible line 102: "C triad = triple-tap to exit" SUB
 * - C in SUB is V (dominant), not I (F is tonic in SUB)
 * - Fixes: Triple-tap C major now correctly exits SUB to HOME
 *
 * CHANGES v4.0.13:
 * - Allow 1-2 note partials to stay in SUB/PAR (prevents exit on note release)
 * - Added triple-tap chord exit from SUB → HOME
 *
 * CRITICAL: Space transitions are triggered by SPECIFIC CHORDS,
 * not by the functions they map to. We must check pitch class patterns
 * BEFORE mapping to functions.
 */

import type { Fn } from '../types';
import type { DetectionResult } from './detection';

export type Space = "HOME" | "SUB" | "PAR" | "REL";

export interface TapEvent {
  function: Fn;
  timestamp: number;
}

export interface SpaceAction {
  action: "stay" | "enter" | "exit";
  newSpace?: Space;
}

/**
 * Evaluate space transitions based on detected chord
 * 
 * @param detected - Chord detection result (has pcsAbsolute, quality, root)
 * @param pcsRelative - Pitch classes relative to baseKey
 * @param currentSpace - Current space state
 * @param tapHistory - Recent tap history for triple-tap detection
 * @param mappedFunction - The function this chord mapped to (for triple-tap only, can be null)
 * @returns Space action (stay, enter, or exit)
 */
export function evaluateSpaceTransition(
  detected: DetectionResult,
  pcsRelative: Set<number>,
  currentSpace: Space,
  tapHistory: TapEvent[],
  mappedFunction: Fn | null
): SpaceAction {
  
  // Empty chord = stay
  if (detected.isEmpty) {
    return { action: "stay" };
  }
  
  // Check triple-tap transitions (vi→REL, I in REL→HOME, V in SUB→HOME, V/vi in PAR→HOME)
  // Only check if we have a mapped function
  const tripleTap = mappedFunction ? checkTripleTap(mappedFunction, tapHistory) : false;
  if (tripleTap) {
    if (currentSpace === "HOME" && mappedFunction === "vi") {
      return { action: "enter", newSpace: "REL" };
    }
    if (currentSpace === "REL" && mappedFunction === "I") {
      return { action: "exit", newSpace: "HOME" };
    }
    // ✅ v4.0.65: SUB exits on triple-tap V or V7 (C triad in key C = V in SUB)
    if (currentSpace === "SUB" && (mappedFunction === "V" || mappedFunction === "V7")) {
      return { action: "exit", newSpace: "HOME" };
    }
    // ✅ v4.1.6: PAR exits on triple-tap V/vi (G or G7 in Cm = V/vi)
    if (currentSpace === "PAR" && mappedFunction === "V/vi") {
      return { action: "exit", newSpace: "HOME" };
    }
  }
  
  // Route to space-specific logic
  switch (currentSpace) {
    case "HOME":
      return evaluateHomeTransitions(pcsRelative, detected);
    
    case "SUB":
      return evaluateSubTransitions(pcsRelative, detected);
    
    case "PAR":
      return evaluateParTransitions(pcsRelative, detected);
    
    case "REL":
      // REL only exits via triple-tap (handled above)
      return { action: "stay" };
    
    default:
      return { action: "stay" };
  }
}

/**
 * HOME space transitions
 * Check for entry into SUB or PAR based on CHORD PATTERNS
 */
function evaluateHomeTransitions(
  pcsRel: Set<number>,
  detected: DetectionResult
): SpaceAction {
  
  // 🚨 CRITICAL: Don't trigger space changes for bonus chord patterns
  // These are detected as bonus wedges, not space entry chords
  
  // F#dim/F#dim7 (V/V): [6,9,0] or [6,9,0,3] - STAY in HOME
  const isFSharpDim = (pcsRel.has(6) && pcsRel.has(9) && pcsRel.has(0));
  
  // G#dim/G#dim7 (V/vi): [8,11,2] or [8,11,2,5] - STAY in HOME
  const isGSharpDim = (pcsRel.has(8) && pcsRel.has(11) && pcsRel.has(2));
  
  // C#dim/C#dim7 (V/ii): [1,4,7] or [1,4,7,10] - STAY in HOME  
  const isCSharpDim = (pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7));
  
  // Bdim/Bm7♭5 (ii/vi): [11,2,5] or [11,2,5,9] - STAY in HOME
  const isBdim = (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5));
  
  if (isFSharpDim || isGSharpDim || isCSharpDim || isBdim) {
    // These are bonus wedges - don't trigger space changes
    return { action: "stay" };
  }
  
  // ENTRY TO SUB: Gm, Gm7, C7, Edim, Edim7, E°7
  // Gm/Gm7: [7,10,2] or [7,10,2,5]
  const hasGm = (pcsRel.has(7) && pcsRel.has(10) && pcsRel.has(2));
  
  // C7: [0,4,7,10]
  const hasC7 = (pcsRel.has(0) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10));
  
  // Edim/Edim7/E°7: [4,7,10] + optional [1]
  // ✅ v4.5.2: Fixed operator precedence - quality check must be grouped with pitch class check
  const hasEdim = (pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10) && (detected.quality === "dim" || detected.quality === "dim7" || detected.quality === "halfdim7"));
  
  if (hasGm || hasC7 || hasEdim) {
    return { action: "enter", newSpace: "SUB" };
  }
  
  // ENTRY TO PAR: Cm, Eb, Ab, Db (parallel minor chords)
  // These are RELATIVE to the base key (C in key of C)
  
  // Cm: [0,3,7] or [0,3,7,10]
  const hasCm = (pcsRel.has(0) && pcsRel.has(3) && pcsRel.has(7));
  
  // Eb: [3,7,10] or [3,7,10,2]
  const hasEb = (pcsRel.has(3) && pcsRel.has(7) && pcsRel.has(10));
  
  // Ab: [8,0,3] or [8,0,3,6]
  const hasAb = (pcsRel.has(8) && pcsRel.has(0) && pcsRel.has(3));
  
  // Db: [1,5,8] or [1,5,8,11]
  const hasDb = (pcsRel.has(1) && pcsRel.has(5) && pcsRel.has(8));
  
  if (hasCm || hasEb || hasAb || hasDb) {
    return { action: "enter", newSpace: "PAR" };
  }
  
  // Stay in HOME
  return { action: "stay" };
}

/**
 * SUB space transitions
 * STAY chords: F, Fmaj7, Gm, Gm7, Eb, Bb, Bbm, C7, C triad
 * EXIT: Only on complete illegal chords (not partial releases)
 */
function evaluateSubTransitions(
  pcsRel: Set<number>,
  detected: DetectionResult
): SpaceAction {
  
  // Handle incomplete chords (1-2 notes) - STAY during transitions
  if (pcsRel.size < 3) {
    return { action: "stay" };
  }
  
  // STAY CHORDS (relative to baseKey C):
  // F/Fmaj7: [5,9,0] or [5,9,0,4]
  const hasF = (pcsRel.has(5) && pcsRel.has(9) && pcsRel.has(0));
  
  // Gm/Gm7: [7,10,2] or [7,10,2,5]
  const hasGm = (pcsRel.has(7) && pcsRel.has(10) && pcsRel.has(2));
  
  // C7: [0,4,7,10]
  const hasC7 = (pcsRel.has(0) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10));
  
  // C triad: [0,4,7] (allowed to stay, but triple-tap exits)
  const hasC = (pcsRel.has(0) && pcsRel.has(4) && pcsRel.has(7) && !pcsRel.has(10));
  
  // Eb: [3,7,10] or [3,7,10,2]
  const hasEb = (pcsRel.has(3) && pcsRel.has(7) && pcsRel.has(10));
  
  // Bb/Bb7: [10,2,5] or [10,2,5,8]
  const hasBb = (pcsRel.has(10) && pcsRel.has(2) && pcsRel.has(5));
  
  // Bbm/Bbm7: [10,1,5] or [10,1,5,8]
  const hasBbm = (pcsRel.has(10) && pcsRel.has(1) && pcsRel.has(5));
  
  if (hasF || hasGm || hasC7 || hasC || hasEb || hasBb || hasBbm) {
    return { action: "stay" };
  }

  // ✅ v4.1.6: Check for PAR entry chords (Cm, Db, Ab)
  // Cm: [0,3,7]
  const hasCm = (pcsRel.has(0) && pcsRel.has(3) && pcsRel.has(7) && !pcsRel.has(4)); // exclude C7

  // Db: [1,5,8] or [1,5,8,11]
  const hasDb = (pcsRel.has(1) && pcsRel.has(5) && pcsRel.has(8));

  // Ab: [8,0,3] or [8,0,3,6]
  const hasAb = (pcsRel.has(8) && pcsRel.has(0) && pcsRel.has(3));

  if (hasCm || hasDb || hasAb) {
    return { action: "exit", newSpace: "PAR" };
  }

  // ✅ v4.1.6: Illegal chords stay in SUB (don't exit to HOME)
  // Only recognized transitions exit SUB
  return { action: "stay" };
}

/**
 * PAR space transitions
 * STAY chords: Cm, Db, Eb, Ab, Fm, Fm7, G7
 * EXIT: F/F7 → HOME, Gm → SUB
 */
function evaluateParTransitions(
  pcsRel: Set<number>,
  detected: DetectionResult
): SpaceAction {
  
  // Handle incomplete chords (1-2 notes) - STAY during transitions
  if (pcsRel.size < 3) {
    return { action: "stay" };
  }
  
  // EXIT TO HOME: C major (relative major of Cm/Eb)
  // C: [0,4,7] or Cmaj7: [0,4,7,11]
  const hasC = (pcsRel.has(0) && pcsRel.has(4) && pcsRel.has(7));
  if (hasC) {
    return { action: "exit", newSpace: "HOME" };
  }

  // EXIT TO HOME: F/F7
  // F: [5,9,0] or F7: [5,9,0,3]
  const hasF = (pcsRel.has(5) && pcsRel.has(9) && pcsRel.has(0));
  if (hasF) {
    return { action: "exit", newSpace: "HOME" };
  }

  // EXIT TO SUB: Gm
  // Gm: [7,10,2] or [7,10,2,5]
  const hasGm = (pcsRel.has(7) && pcsRel.has(10) && pcsRel.has(2));
  if (hasGm) {
    return { action: "exit", newSpace: "SUB" };
  }
  
  // STAY CHORDS:
  // Cm: [0,3,7] or [0,3,7,10]
  const hasCm = (pcsRel.has(0) && pcsRel.has(3) && pcsRel.has(7));

  // Db: [1,5,8] or [1,5,8,11]
  const hasDb = (pcsRel.has(1) && pcsRel.has(5) && pcsRel.has(8));

  // Eb: [3,7,10] or [3,7,10,2]
  const hasEb = (pcsRel.has(3) && pcsRel.has(7) && pcsRel.has(10));

  // Ab: [8,0,3] or [8,0,3,6] - ✅ v4.1.6: Added to PAR stay chords
  const hasAb = (pcsRel.has(8) && pcsRel.has(0) && pcsRel.has(3));

  // Fm/Fm7: [5,8,0] or [5,8,0,3]
  const hasFm = (pcsRel.has(5) && pcsRel.has(8) && pcsRel.has(0));

  // G or G7: [7,11,2] or [7,11,2,5] (special: allowed but doesn't exit)
  // Bible line 114: "G7 = allowed (no exit)" - also allow G triad
  const hasG = (pcsRel.has(7) && pcsRel.has(11) && pcsRel.has(2));

  if (hasCm || hasDb || hasEb || hasAb || hasFm || hasG) {
    return { action: "stay" };
  }

  // ✅ v4.1.6: Illegal chords stay in PAR (don't exit to HOME)
  // Only F/F7 and Gm exit (handled above)
  return { action: "stay" };
}


/**
 * Add a tap event to history
 * Used by engine to track function taps for triple-tap detection
 */
export function addTapToHistory(fn: Fn, history: TapEvent[]): TapEvent[] {
  const MAX_HISTORY = 10;
  const now = Date.now();
  
  const newHistory = [...history, { function: fn, timestamp: now }];
  
  // Keep only last MAX_HISTORY events
  if (newHistory.length > MAX_HISTORY) {
    return newHistory.slice(-MAX_HISTORY);
  }
  
  return newHistory;
}

/**
 * Check if function was triple-tapped
 * Returns true if function appeared 3 times within TAP_WINDOW_MS
 */
function checkTripleTap(fn: Fn, tapHistory: TapEvent[]): boolean {
  const TAP_WINDOW_MS = 1500;
  const MAX_GAP_MS = 500;

  const now = Date.now();
  const recentTaps = tapHistory.filter(t =>
    t.function === fn && now - t.timestamp < TAP_WINDOW_MS
  );

  if (recentTaps.length < 3) return false;

  // ✅ v4.1.6: Check gaps between FIRST 3 taps only (not all taps in window)
  // This allows rapid triple-tap even if user continues holding/replaying
  const firstThree = recentTaps.slice(0, 3);
  for (let i = 1; i < firstThree.length; i++) {
    const gap = firstThree[i].timestamp - firstThree[i-1].timestamp;
    if (gap > MAX_GAP_MS) return false;
  }

  return true;
}

// EOF - spaces.ts v4.1.6