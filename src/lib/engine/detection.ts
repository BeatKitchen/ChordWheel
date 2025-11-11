/**
 * detection.ts — v4.0.1
 * 
 * 📁 INSTALL TO: src/lib/engine/detection.ts
 * 🔄 VERSION: 4.0.1 (added quality extraction)
 * 
 * Detects chord name from MIDI notes using absolute pitch classes.
 * Leverages existing theory.ts for chord naming logic.
 */

import { internalAbsoluteName, pcFromMidi } from '../theory';
import type { KeyName } from '../types';

export type ChordQuality = 
  | "maj" | "min" | "dim" | "aug"
  | "7" | "maj7" | "min7" | "halfdim7" | "dim7"
  | "sus2" | "sus4"
  | "unknown";

export interface DetectionResult {
  chordName: string;           // "Bdim7", "A7", "Fmaj7", etc.
  root: number;                // Absolute PC of root (0-11)
  quality: ChordQuality;       // Chord quality
  pcsAbsolute: Set<number>;    // Absolute pitch classes
  bassNote: number;            // Lowest MIDI note
  isEmpty: boolean;            // True if no notes
}

/**
 * Detect chord from MIDI notes
 * 
 * PURE FUNCTION - No side effects, no state
 * 
 * @param midiNotes - Array of MIDI note numbers (e.g., [60, 64, 67])
 * @param baseKey - Current key (for chord naming context)
 * @returns Detection result with chord name and pitch classes
 */
export function detectChord(
  midiNotes: number[],
  baseKey: KeyName
): DetectionResult {
  
  // Handle empty input
  if (midiNotes.length === 0) {
    return {
      chordName: "",
      root: -1,
      quality: "unknown",
      pcsAbsolute: new Set(),
      bassNote: -1,
      isEmpty: true
    };
  }
  
  // Convert to absolute pitch classes
  const pcsAbsolute = new Set(midiNotes.map(n => pcFromMidi(n)));
  
  // Find bass note (lowest)
  const bassNote = Math.min(...midiNotes);
  
  // Get chord name from theory.ts (existing, tested logic)
  const chordName = internalAbsoluteName(pcsAbsolute, baseKey, midiNotes);
  
  // Extract quality from chord name
  const quality = extractQuality(chordName, pcsAbsolute);
  
  // Determine root (first PC in alphabetical order for now)
  // Note: For dim7, theory.ts already uses lowest note
  const root = chordName ? Math.min(...Array.from(pcsAbsolute)) : -1;
  
  return {
    chordName: chordName || "",
    root,
    quality,
    pcsAbsolute,
    bassNote,
    isEmpty: false
  };
}

/**
 * Convert absolute pitch classes to relative (for diatonic matching)
 * 
 * @param pcsAbsolute - Absolute pitch classes (0-11)
 * @param baseKey - Current key
 * @returns Relative pitch classes (0 = tonic, 2 = supertonic, etc.)
 */
export function convertToRelative(
  pcsAbsolute: Set<number>,
  baseKey: KeyName
): Set<number> {
  const NAME_TO_PC: Record<KeyName, number> = {
    "C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5,
    "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11
  };
  
  const keyPc = NAME_TO_PC[baseKey];
  
  return new Set(
    Array.from(pcsAbsolute).map(pc => {
      return (pc - keyPc + 12) % 12;
    })
  );
}

/**
 * Extract chord quality from chord name
 * 
 * @param chordName - Chord name like "Bdim7", "A7", "Fmaj7"
 * @param pcs - Pitch class set for structural analysis
 * @returns Chord quality
 */
function extractQuality(chordName: string, pcs: Set<number>): ChordQuality {
  if (!chordName) return "unknown";
  
  const lower = chordName.toLowerCase();
  
  // Check for specific qualities in order of specificity
  if (lower.includes("dim7")) return "dim7";
  if (lower.includes("m7♭5") || lower.includes("m7b5") || lower.includes("ø")) return "halfdim7";
  if (lower.includes("maj7")) return "maj7";
  if (lower.includes("mmaj7")) return "min7"; // mMaj7 is edge case
  if (lower.includes("m7")) return "min7";
  if (lower.includes("7")) return "7";
  if (lower.includes("dim")) return "dim";
  if (lower.includes("aug") || lower.includes("+")) return "aug";
  if (lower.includes("sus4")) return "sus4";
  if (lower.includes("sus2")) return "sus2";
  if (lower.includes("m")) return "min";
  
  // Structural analysis fallback
  if (pcs.size === 3) {
    const sorted = Array.from(pcs).sort((a, b) => a - b);
    const intervals = [
      (sorted[1] - sorted[0] + 12) % 12,
      (sorted[2] - sorted[1] + 12) % 12
    ];
    
    if (intervals[0] === 4 && intervals[1] === 3) return "maj";
    if (intervals[0] === 3 && intervals[1] === 4) return "min";
    if (intervals[0] === 3 && intervals[1] === 3) return "dim";
    if (intervals[0] === 4 && intervals[1] === 4) return "aug";
  }
  
  // Default to major if no other quality detected
  return "maj";
}