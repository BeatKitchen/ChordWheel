/**
 * index.ts — v4.0.70
 *
 * 📁 INSTALL TO: src/lib/engine/index.ts
 * 🔄 VERSION: 4.0.70 (CRITICAL: Always re-map space transitions)
 *
 * Main engine orchestrator - PURE, no React deps
 * Orchestrates: detection → mapping → spaces → stability
 *
 * CHANGES v4.0.70:
 * - CRITICAL: Always re-map ALL space transitions (enter/exit), not just unmapped ones
 * - Bug: C major in PAR (effectiveKey=Eb) mapped to V/ii [4,9,1] before exit was processed
 * - Solution: Re-map even when initial mapping succeeds if space transition occurs
 * - Result: C major exits PAR → remaps in HOME key as I (not V/ii)
 *
 * CHANGES v4.0.64:
 * - CRITICAL: Fixed tap history update for space transitions
 * - Tap history now updates AFTER re-mapping (not before)
 * - Space transition chords now properly add to tap history
 * - Enables triple-tap detection for re-mapped chords
 *
 * CHANGES v4.0.63:
 * - CRITICAL: Space-EXIT chords now re-map in destination (HOME) key
 * - Gm exiting SUB back to HOME re-maps as "iv" in HOME key → lights iv wedge
 * - Fixes: All space transitions (enter AND exit) now light correct wedges
 * - Both entry and exit chords use destination key for function mapping
 *
 * CHANGES v4.0.62:
 * - CRITICAL: Space-entry chords now re-map in DESTINATION space
 * - Gm in HOME triggers SUB, re-maps as "ii" in SUB → lights ii wedge
 * - Uses getSubKey/getParKey to calculate destination key for re-mapping
 * - Fixes: Gm entering SUB now lights the ii wedge (not null)
 *
 * CHANGES v4.0.61:
 * - CRITICAL: detectAndMap now accepts effectiveKey AND baseKey parameters
 * - effectiveKey: Used for chord naming and function mapping (changes per space)
 * - baseKey: Used for space transition pattern checks (always base key)
 * - Fixes: F major in SUB now maps to "I" (not "IV")
 * - In SUB (key F ephemeral), F = I, Gm = ii, C = V, etc.
 *
 * CHANGES v4.0.5:
 * - Update tap history BEFORE checking spaces (not after)
 * - This makes triple-tap trigger immediately on the 3rd tap
 *
 * CHANGES v4.0.4:
 * - Map chord to function BEFORE checking space transitions
 * - This allows triple-tap detection to work (needs function)
 */

import { detectChord, convertToRelative, type DetectionResult } from './detection';
import { mapChordToFunction } from './mapping';
import {
  evaluateSpaceTransition,
  addTapToHistory,
  type Space,
  type SpaceAction,
  type TapEvent
} from './spaces';
import {
  applyStability,
  updateStabilityState,
  confirmPendingFunction,
  type StabilityState,
  type StabilityDecision
} from './stability';
import type { Fn, KeyName } from '../types';
import { getSubKey, getParKey } from '../theory';

// Re-export types for convenience
export type { Space, SpaceAction, TapEvent, StabilityState, StabilityDecision };

/**
 * Complete engine result
 */
export interface EngineResult {
  // What chord was detected
  chordName: string;              // "Bdim7", "A7", "Fmaj7"
  
  // What function it maps to
  function: Fn | null;            // "V/ii", "I", "V7", null if illegal
  isBonus: boolean;               // true for V/ii and ii/vi
  
  // Space management
  spaceAction: SpaceAction;       // stay/enter/exit
  newTapHistory: TapEvent[];      // Updated tap history
  
  // For UI/adapter
  isEmpty: boolean;               // True if no notes held
  shouldUpdate: boolean;          // True if display should change
  
  // Debug info
  pcsAbsolute: Set<number>;       // Absolute pitch classes
  pcsRelative: Set<number>;       // Relative pitch classes
}

/**
 * Engine state (maintained by adapter, passed in on each call)
 */
export interface EngineState {
  currentSpace: Space;
  tapHistory: TapEvent[];
  stability: StabilityState;
}

/**
 * Create initial engine state
 */
export function createEngineState(): EngineState {
  return {
    currentSpace: "HOME",
    tapHistory: [],
    stability: {
      lastFunction: null,
      lastChangeTime: 0,
      pendingFunction: null,
      pendingStartTime: 0
    }
  };
}

/**
 * Main engine function - processes MIDI notes → lighting decision
 *
 * PURE FUNCTION - No side effects, returns data only
 *
 * @param midiNotes - Array of held MIDI notes (after transpose applied!)
 * @param effectiveKey - Current musical key for chord naming/mapping (changes per space)
 * @param baseKey - Base musical key for space transition checks (always base key)
 * @param showBonusWedges - Whether bonus wedges are visible
 * @param state - Current engine state
 * @returns Complete result with function, space, and display decisions
 */
export function detectAndMap(
  midiNotes: number[],
  effectiveKey: KeyName,
  baseKey: KeyName,
  showBonusWedges: boolean,
  state: EngineState
): EngineResult {

  // Step 1: Detect chord from MIDI notes using EFFECTIVE key (for naming)
  const detected = detectChord(midiNotes, effectiveKey);

  // Handle empty input
  if (detected.isEmpty) {
    return {
      chordName: "",
      function: null,
      isBonus: false,
      spaceAction: { action: "stay" },
      newTapHistory: state.tapHistory,
      isEmpty: true,
      shouldUpdate: true,
      pcsAbsolute: new Set(),
      pcsRelative: new Set()
    };
  }

  // Step 2: Convert to relative pitch classes for mapping using EFFECTIVE key
  const pcsRelative = convertToRelative(detected.pcsAbsolute, effectiveKey);

  // Step 2b: ALSO convert using BASE key for space transition checks
  const pcsRelativeToBase = convertToRelative(detected.pcsAbsolute, baseKey);
  console.log('🔍 PCS Absolute:', Array.from(detected.pcsAbsolute), 'Relative to effective:', Array.from(pcsRelative), 'Relative to base:', Array.from(pcsRelativeToBase));

  // Step 3: Map chord to function (if it exists in current space)
  const mapped = mapChordToFunction(
    detected,           // Pass full detection result (has quality!)
    pcsRelative,
    showBonusWedges
  );

  // Step 3b: TENTATIVE tap history update (may be overridden after re-mapping)
  let newTapHistory = mapped?.function
    ? addTapToHistory(mapped.function, state.tapHistory)
    : state.tapHistory;

  // Step 4: Check space transitions (uses BASE-relative PCs for pattern matching)
  const spaceAction = evaluateSpaceTransition(
    detected,           // Full detection result
    pcsRelativeToBase,  // ✅ v4.0.61: Use BASE-relative PCs for space checks!
    state.currentSpace,
    newTapHistory,      // Use NEW history for triple-tap detection
    mapped?.function || null  // Pass function for triple-tap detection
  );

  // If no mapping found but space changed, that's OK (space entry chords)
  if (!mapped && spaceAction.action === "stay") {
    // Truly illegal chord - not mapped and doesn't trigger space change
    return {
      chordName: detected.chordName,
      function: null,
      isBonus: false,
      spaceAction: { action: "stay" },
      newTapHistory: state.tapHistory,
      isEmpty: false,
      shouldUpdate: true,
      pcsAbsolute: detected.pcsAbsolute,
      pcsRelative: pcsRelativeToBase  // Return base-relative for consistency
    };
  }

  // At this point, either:
  // 1. mapped is not null (normal chord in current space)
  // 2. mapped is null but spaceAction is "enter" or "exit" (space transition chord)

  // ✅ v4.0.70: CRITICAL FIX - Re-map ALL space transitions, not just unmapped ones
  // Bug: C major in PAR (effective Eb) maps to V/ii [4,9,1], but should exit to HOME and remap as I
  // Solution: Always re-map when entering/exiting, even if initial mapping succeeded
  let finalMapped = mapped;
  if (spaceAction.action === "enter" || spaceAction.action === "exit") {
    // Calculate destination key
    let destinationKey: KeyName = baseKey;

    if (spaceAction.action === "enter" && spaceAction.newSpace) {
      // Entering a space - use new space's key
      if (spaceAction.newSpace === "SUB") {
        destinationKey = getSubKey(baseKey);
      } else if (spaceAction.newSpace === "PAR") {
        destinationKey = getParKey(baseKey);
      }
      // REL stays at baseKey (relative minor)
    } else if (spaceAction.action === "exit") {
      // Exiting to HOME - use base key
      destinationKey = baseKey;
    }

    // Re-map using destination key
    const pcsInDestination = convertToRelative(detected.pcsAbsolute, destinationKey);
    console.log('🔄 Re-mapping space transition chord in destination key:', {
      chord: detected.chordName,
      action: spaceAction.action,
      destinationSpace: spaceAction.action === "enter" ? spaceAction.newSpace : "HOME",
      destinationKey,
      pcsInDestination: Array.from(pcsInDestination)
    });

    finalMapped = mapChordToFunction(detected, pcsInDestination, showBonusWedges);

    if (finalMapped) {
      console.log('✅ Space transition chord mapped in destination:', finalMapped.function);
      // ✅ v4.0.64: Update tap history with re-mapped function for triple-tap detection
      newTapHistory = addTapToHistory(finalMapped.function, state.tapHistory);
    }
  }

  // Step 5: Apply stability logic (only if we have a mapped function)
  const stabilityDecision = finalMapped?.function
    ? applyStability(finalMapped.function, state.stability)
    : { shouldUpdate: true, stableFunction: null };

  // Return complete result
  return {
    chordName: detected.chordName,
    function: stabilityDecision.stableFunction,
    isBonus: finalMapped?.isBonus || false,  // ✅ v4.0.62: Use finalMapped (may be re-mapped)
    spaceAction,
    newTapHistory,
    isEmpty: false,
    shouldUpdate: stabilityDecision.shouldUpdate,
    pcsAbsolute: detected.pcsAbsolute,
    pcsRelative  // ✅ v4.0.61: Return effective-relative (used for function mapping)
  };
}

/**
 * Helper: Update engine state after processing result
 * (Adapter calls this to maintain state between detections)
 */
export function updateEngineState(
  previousState: EngineState,
  result: EngineResult
): EngineState {
  
  // Update space if action requires it
  let newSpace = previousState.currentSpace;
  if (result.spaceAction.action === "enter" && result.spaceAction.newSpace) {
    newSpace = result.spaceAction.newSpace;
  } else if (result.spaceAction.action === "exit") {
    newSpace = "HOME";
  }
  
  // Update stability state
  let newStability = previousState.stability;
  if (result.shouldUpdate && result.function) {
    newStability = confirmPendingFunction(previousState.stability);
  } else if (result.function) {
    newStability = updateStabilityState(result.function, previousState.stability);
  }
  
  return {
    currentSpace: newSpace,
    tapHistory: result.newTapHistory,
    stability: newStability
  };
}

// EOF - index.ts v4.0.70