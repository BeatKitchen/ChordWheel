/*
 * types.ts — v4.0.0
 * 
 * Type definitions for HarmonyWheel
 * 
 * v4.0.0 CHANGES:
 * - Changed "Bm7♭5" to "ii/vi" (function name, not chord name)
 * - Added "vii°" to Fn type
 * 
 * v3.17.6 CHANGES:
 * - Added "Bm7♭5" to Fn type (diminished 7th chord, bonus wedge)
 * 
 * v3.10.0 CHANGES:
 * - Added "V/ii" to Fn type (secondary dominant: A7 in key of C)
 * 
 * v3.1.3 CHANGES:
 * - Added "V" to Fn type (plain V triad, e.g., G in key of C)
 * - Added "V7" to Fn type (dominant 7th, e.g., G7 in key of C)
 */

export type KeyName = 
  | "C" | "Db" | "D" | "Eb" | "E" | "F" | "Gb" | "G" | "Ab" | "A" | "Bb" | "B";

export type Fn = 
  | "I" 
  | "ii" 
  | "V/V"
  | "iii" 
  | "V/vi"
  | "V/ii"
  | "ii/vi"
  | "iv"
  | "IV"
  | "V"
  | "V7"
  | "vi" 
  | "♭VII"
  | "vii°";

export type SizeSpec = Partial<Record<Fn, number>>;

// EOF - types.ts v4.0.0