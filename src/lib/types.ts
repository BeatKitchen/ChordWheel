/*
 * types.ts — v3.10.0
 * 
 * Type definitions for HarmonyWheel
 * 
 * v3.10.0 CHANGES:
 * - Added "V/ii" to Fn type (secondary dominant: A7 in key of C)
 * - Was missing, causing TypeScript error in shouldTriggerBonus()
 * 
 * v3.1.3 CHANGES:
 * - Added "V" to Fn type (plain V triad, e.g., G in key of C)
 * - Added "V7" to Fn type (dominant 7th, e.g., G7 in key of C)
 * - These were missing from original, causing TypeScript errors
 * 
 * PREVIOUS: Only had V/V, V/vi but not plain V or V7
 */

export type KeyName = 
  | "C" | "Db" | "D" | "Eb" | "E" | "F" | "Gb" | "G" | "Ab" | "A" | "Bb" | "B";

export type Fn = 
  | "I" 
  | "ii" 
  | "V/V"    // Secondary dominant (D7 in key of C)
  | "iii" 
  | "V/vi"   // Secondary dominant (E7 in key of C)
  | "V/ii"   // ← ADDED v3.10.0! Secondary dominant (A7 in key of C)
  | "iv"     // Minor iv
  | "IV"     // Major IV
  | "V"      // ← ADDED v3.1.3! Plain V triad (G in key of C)
  | "V7"     // ← ADDED v3.1.3! Dominant 7th (G7 in key of C)
  | "vi" 
  | "♭VII";  // Borrowed from parallel minor

export type SizeSpec = Partial<Record<Fn, number>>;

// EOF - types.ts v3.10.0