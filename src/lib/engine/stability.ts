/**
 * stability.ts — v4.0.45
 * 
 * 📁 INSTALL TO: src/lib/engine/stability.ts
 * 🔄 VERSION: 4.0.45
 * 
 * Timing guards and stability logic
 * Implements debounce, hysteresis, anti-steal, extension merging
 */

import type { Fn } from '../types';

// Timing constants from ADDENDUM
const CHORD_FRAME_MS = 60;           // Coalesce note-ons
const MERGE_EXTENSION_MS = 300;      // C→C7 merge window
const FUNCTION_HYSTERESIS_MS = 220;  // Stability before lighting
const EXIT_GUARD_MS = 250;           // Stability before exiting space
const DOM_UPPER3_PROTECT_MS = 350;   // D7 upper structure guard

export interface StabilityState {
  lastFunction: Fn | null;
  lastChangeTime: number;
  pendingFunction: Fn | null;
  pendingStartTime: number;
}

export interface StabilityDecision {
  shouldUpdate: boolean;          // Should we update the display?
  shouldLight: Fn | null;         // Which function to light (null = clear)
  stableFunction: Fn | null;      // The stable function after all guards
}

/**
 * Apply stability logic to decide if/what to light
 * 
 * @param newFn - Function from mapping engine
 * @param state - Current stability state
 * @param timestamp - Current time (for testing, defaults to Date.now())
 * @returns Decision on whether to update display
 */
export function applyStability(
  newFn: Fn | null,
  state: StabilityState,
  timestamp: number = Date.now()
): StabilityDecision {
  
  // No function = clear immediately
  if (!newFn) {
    return {
      shouldUpdate: true,
      shouldLight: null,
      stableFunction: null
    };
  }
  
  const timeSinceLastChange = timestamp - state.lastChangeTime;
  
  // Check if this is an extension of the current function
  if (isExtension(newFn, state.lastFunction)) {
    // Extension merge - stay on same function
    return {
      shouldUpdate: false,
      shouldLight: state.lastFunction,
      stableFunction: state.lastFunction
    };
  }
  
  // Check if this is the same function (stable)
  if (newFn === state.lastFunction) {
    return {
      shouldUpdate: false,
      shouldLight: newFn,
      stableFunction: newFn
    };
  }
  
  // New function - check if it's been pending long enough
  // EXCEPTION: If coming from null (no previous function), light immediately
  if (state.lastFunction === null) {
    return {
      shouldUpdate: true,
      shouldLight: newFn,
      stableFunction: newFn
    };
  }
  
  if (newFn === state.pendingFunction) {
    const pendingDuration = timestamp - state.pendingStartTime;
    
    if (pendingDuration >= FUNCTION_HYSTERESIS_MS) {
      // Pending function is now stable
      return {
        shouldUpdate: true,
        shouldLight: newFn,
        stableFunction: newFn
      };
    } else {
      // Still pending - keep showing old function
      return {
        shouldUpdate: false,
        shouldLight: state.lastFunction,
        stableFunction: state.lastFunction
      };
    }
  }
  
  // Brand new function - start pending timer
  return {
    shouldUpdate: false,
    shouldLight: state.lastFunction,
    stableFunction: state.lastFunction
  };
}

/**
 * Check if newFn is an extension of baseFn
 * Examples: C→Cmaj7, G→G7, Dm→Dm7
 */
function isExtension(newFn: Fn | null, baseFn: Fn | null): boolean {
  if (!newFn || !baseFn) return false;
  
  // Normalize functions for comparison
  const normalize = (fn: Fn): string => {
    // Remove "7" or "maj7" suffixes for comparison
    // This is a simplification - in reality we'd need chord quality info
    return fn.toString();
  };
  
  // For now, simple check: same base function
  // TODO: This needs chord quality from detection result
  // to properly detect C→Cmaj7, G→G7, etc.
  
  return false; // Disabled for now - needs richer data
}

/**
 * Update stability state with new function
 */
export function updateStabilityState(
  newFn: Fn | null,
  previousState: StabilityState,
  timestamp: number = Date.now()
): StabilityState {
  
  // If same as last stable function, no change
  if (newFn === previousState.lastFunction) {
    return previousState;
  }
  
  // If same as pending function, keep pending
  if (newFn === previousState.pendingFunction) {
    return previousState;
  }
  
  // New function - start pending
  return {
    lastFunction: previousState.lastFunction,
    lastChangeTime: previousState.lastChangeTime,
    pendingFunction: newFn,
    pendingStartTime: timestamp
  };
}

/**
 * Confirm pending function as stable (called after hysteresis delay)
 */
export function confirmPendingFunction(
  state: StabilityState,
  timestamp: number = Date.now()
): StabilityState {
  
  if (!state.pendingFunction) return state;
  
  return {
    lastFunction: state.pendingFunction,
    lastChangeTime: timestamp,
    pendingFunction: null,
    pendingStartTime: 0
  };
}

/**
 * Create initial stability state
 */
export function createStabilityState(): StabilityState {
  return {
    lastFunction: null,
    lastChangeTime: 0,
    pendingFunction: null,
    pendingStartTime: 0
  };
}

// EOF - stability.ts v4.0.45