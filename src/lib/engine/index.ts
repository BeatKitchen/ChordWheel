/**
 * index.ts — v4.0.5
 * 
 * 📁 INSTALL TO: src/lib/engine/index.ts
 * 🔄 VERSION: 4.0.5 (FIXED: Triple-tap triggers on 3rd tap, not 4th)
 * 
 * Main engine orchestrator - PURE, no React deps
 * Orchestrates: detection → mapping → spaces → stability
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
 * @param baseKey - Current musical key (C, F, G, etc.)
 * @param showBonusWedges - Whether bonus wedges are visible
 * @param state - Current engine state
 * @returns Complete result with function, space, and display decisions
 */
export function detectAndMap(
  midiNotes: number[],
  baseKey: KeyName,
  showBonusWedges: boolean,
  state: EngineState
): EngineResult {
  
  // Step 1: Detect chord from MIDI notes
  const detected = detectChord(midiNotes, baseKey);
  
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
  
  // Step 2: Convert to relative pitch classes for mapping
  const pcsRelative = convertToRelative(detected.pcsAbsolute, baseKey);
  console.log('🔍 PCS Absolute:', Array.from(detected.pcsAbsolute), 'PCS Relative:', Array.from(pcsRelative));
  
  // Step 3: Map chord to function (if it exists in current space)
  const mapped = mapChordToFunction(
    detected,           // Pass full detection result (has quality!)
    pcsRelative,
    showBonusWedges
  );
  
  // Step 3b: Update tap history BEFORE space check (for immediate triple-tap detection)
  const newTapHistory = mapped?.function
    ? addTapToHistory(mapped.function, state.tapHistory)
    : state.tapHistory;
  
  // Step 4: Check space transitions (uses updated tap history)
  const spaceAction = evaluateSpaceTransition(
    detected,           // Full detection result
    pcsRelative,        // Relative pitch classes
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
      pcsRelative
    };
  }
  
  // At this point, either:
  // 1. mapped is not null (normal chord in current space)
  // 2. mapped is null but spaceAction is "enter" (space entry chord)
  
  // Step 5: Apply stability logic (only if we have a mapped function)
  const stabilityDecision = mapped?.function
    ? applyStability(mapped.function, state.stability)
    : { shouldUpdate: true, stableFunction: null };
  
  // Return complete result
  return {
    chordName: detected.chordName,
    function: stabilityDecision.stableFunction,
    isBonus: mapped?.isBonus || false,
    spaceAction,
    newTapHistory,
    isEmpty: false,
    shouldUpdate: stabilityDecision.shouldUpdate,
    pcsAbsolute: detected.pcsAbsolute,
    pcsRelative
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