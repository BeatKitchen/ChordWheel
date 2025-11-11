/**
 * wedges.ts - Map functions to physical wedge positions
 * VERSION: v4.0.0-engine.1
 * 
 * Pure mapping: harmonic function + space → wedge ID (0-11)
 * 
 * Wedge layout in HOME space (key of C):
 * Position  Angle  Function  Chords
 * ========  =====  ========  ==================
 * 0         0°     I         C / Cmaj7
 * 1         30°    ii        Dm / Dm7
 * 2         60°    V/V       D / D7
 * 3         90°    iii       Em / Em7
 * 4         120°   V/vi      E / E7
 * 5         150°   iv        Fm / Fm7
 * 6         180°   IV        F / Fmaj7
 * 7         210°   V         G / G7
 * 8         240°   V/ii      A / A7 (BONUS)
 * 9         270°   vi        Am / Am7
 * 10        300°   ♭VII      B♭ (triad only)
 * 11        330°   ii/vi     Bdim / Bm7♭5 (BONUS)
 * 
 * The engine returns wedge IDs (0-11 based on function).
 * The adapter/CSS handles visual rotation for different spaces.
 */

export interface WedgeInfo {
  wedgeId: number;        // 0-11
  angle: number;          // Physical angle in degrees (0° = 12 o'clock)
  label: string;          // Function label for display
}

/**
 * Map harmonic function to wedge ID
 * This is the same in all spaces - the rotation is handled by CSS
 */
export function getFunctionWedgeId(func: string): number | null {
  const functionToWedge: { [key: string]: number } = {
    // Standard diatonic functions
    "I": 0,
    "ii": 1,
    "V/V": 2,
    "iii": 3,
    "V/vi": 4,
    "iv": 5,
    "IV": 6,
    "V": 7,
    "vi": 9,
    "♭VII": 10,
    "vii°": 11,
    
    // Bonus functions
    "V/ii": 8,
    "ii/vi": 11,
    
    // Alternate notations
    "V7": 7,      // V7 maps to same wedge as V
    "bVII": 10,   // Alternate notation for ♭VII
    "viio": 11    // Alternate notation for vii°
  };

  return functionToWedge[func] ?? null;
}

/**
 * Get complete wedge info for a function
 */
export function getFunctionWedge(func: string): WedgeInfo | null {
  const wedgeId = getFunctionWedgeId(func);
  
  if (wedgeId === null) {
    return null;
  }

  return {
    wedgeId,
    angle: wedgeId * 30,  // 30° increments, clockwise from 0°
    label: func
  };
}

/**
 * Get wedge angle in degrees
 * 0° = 12 o'clock position, clockwise
 */
export function getWedgeAngle(wedgeId: number): number {
  return wedgeId * 30;
}

/**
 * Check if function is a bonus wedge
 */
export function isBonusFunction(func: string): boolean {
  return func === "V/ii" || func === "ii/vi";
}

/**
 * Get all wedge positions for rendering
 * Returns array of 12 wedge infos
 */
export function getAllWedgePositions(): WedgeInfo[] {
  const functions = [
    "I", "ii", "V/V", "iii", "V/vi", "iv", 
    "IV", "V", "V/ii", "vi", "♭VII", "ii/vi"
  ];

  return functions.map((func, index) => ({
    wedgeId: index,
    angle: index * 30,
    label: func
  }));
}

/**
 * Get space rotation offset in degrees
 * Used by adapter to calculate CSS transform
 * 
 * HOME: 0° (no rotation)
 * REL: -90° (vi moves to 12 o'clock)
 * SUB: -150° (IV moves to 12 o'clock) 
 * PAR: 0° (no rotation, but labels change)
 */
export function getSpaceRotation(space: string): number {
  const rotations: { [key: string]: number } = {
    "HOME": 0,
    "REL": -90,
    "SUB": -150,
    "PAR": 0
  };

  return rotations[space] ?? 0;
}

/**
 * Calculate final wedge angle after space rotation
 * This is for reference - actual rotation is done in CSS
 */
export function getFinalWedgeAngle(
  wedgeId: number, 
  space: string
): number {
  const baseAngle = getWedgeAngle(wedgeId);
  const spaceRotation = getSpaceRotation(space);
  return (baseAngle + spaceRotation + 360) % 360;
}

/**
 * Get wedge ID from angle (inverse operation)
 * Useful for click detection
 */
export function getWedgeIdFromAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  return Math.floor(normalized / 30) % 12;
}

/**
 * Check if a wedge ID is valid (0-11)
 */
export function isValidWedgeId(wedgeId: number): boolean {
  return Number.isInteger(wedgeId) && wedgeId >= 0 && wedgeId <= 11;
}

/**
 * END wedges.ts
 * VERSION: v4.0.0-engine.1
 */