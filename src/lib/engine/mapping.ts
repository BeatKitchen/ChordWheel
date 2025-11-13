/**
 * mapping.ts — v4.1.7
 *
 * 📁 INSTALL TO: src/lib/engine/mapping.ts
 * 🔄 VERSION: 4.1.7 (CRITICAL FIX: Diminished chords now check ROOT, not just pitch class sets)
 *
 * Maps detected chords to harmonic functions
 *
 * CHANGES v4.1.7:
 * - CRITICAL: Diminished chords now check the ROOT note (from bass/chord name)
 * - Fixed: Bbdim7 in key G no longer triggers V/V (was matching set {0,3,6,9})
 * - Bible compliance: "Bass determines function" for all diminished chords
 * - Added getRootPCFromChordName() helper to extract root from theory.ts naming
 * - Detection uses RELATIVE PC (function-centric), naming uses absolute for C#/F#/G#
 *
 * DIMINISHED RULES (Bible Section C):
 * - F#° family (relative PC 6) → V/V wedge (F#° in C, C#° in G, G#° in D)
 * - C#° family (relative PC 1) → V/ii BONUS wedge (C#° in C, G#° in G, D#° in D)
 * - G#° family (relative PC 8) → V/vi wedge (G#° in C, D#° in G, A#° in D)
 * - B° family (relative PC 11) → ii/vi BONUS wedge (B° in C, F#° in G, C#° in D)
 * - Bdim7 with B bass → V7 (G7♭9 substitute)
 * - All others → ILLEGAL (no wedge, display name only)
 *
 * NAMING vs DETECTION:
 * - Naming: Absolute PCs 1, 6, 8 ALWAYS sharp (C#, F#, G#) - see theory.ts
 * - Detection: Uses relative PC to determine function in current key
 */

import type { DetectionResult, ChordQuality } from './detection';
import type { Fn, KeyName } from '../types';

export interface FunctionResult {
  function: Fn;          // Proper Fn type instead of string
  displayName: string;   // "A7", "Bm7♭5", "C", "G7", etc.
  isBonus: boolean;      // true for V/ii and ii/vi
}

/**
 * Extract root pitch class from chord name
 * Theory.ts generates names like "Bbdim7", "F#dim", "C#m7♭5"
 * We need to parse the root note name and convert to PC
 *
 * @param chordName - Chord name from theory.ts (e.g., "Bbdim7", "F#dim")
 * @returns Absolute pitch class 0-11, or null if unable to parse
 */
function getRootPCFromChordName(chordName: string): number | null {
  if (!chordName) return null;

  // Match root at start: one letter + optional accidental
  const match = chordName.match(/^([A-G])([#♯b♭]*)/);
  if (!match) return null;

  const letter = match[1];
  const accidental = match[2] || '';

  // Base pitch classes (natural notes)
  const basePCs: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  let pc = basePCs[letter];
  if (pc === undefined) return null;

  // Apply accidentals
  for (const char of accidental) {
    if (char === '#' || char === '♯') pc += 1;
    if (char === 'b' || char === '♭') pc -= 1;
  }

  return ((pc % 12) + 12) % 12;
}

/**
 * Maps a chord to its function in the current key/space
 *
 * @param detected - Detection result with chord name, quality, PCs
 * @param pcsRelative - Pitch classes relative to baseKey
 * @param showBonusWedges - Whether bonus wedges are enabled
 * @param effectiveKey - Current key for calculating relative root PC
 * @returns Function result or null if illegal chord
 */
export function mapChordToFunction(
  detected: DetectionResult,
  pcsRelative: Set<number>,
  showBonusWedges: boolean,
  effectiveKey?: KeyName
): FunctionResult | null {

  // Get key tonic PC for calculating relative root
  const NAME_TO_PC: Record<KeyName, number> = {
    "C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5,
    "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11
  };
  const keyTonicPC = effectiveKey ? NAME_TO_PC[effectiveKey] : 0;

  // ✅ v4.1.7: Extract root from chord name (set by theory.ts based on bass note)
  const rootAbsolute = getRootPCFromChordName(detected.chordName);
  const rootRelative = rootAbsolute !== null
    ? (rootAbsolute - keyTonicPC + 12) % 12
    : null;

  // CRITICAL: Check bonus wedges FIRST
  // (They contain subsets of diatonic chords, so must have priority)

  // ✅ v4.1.7: F#dim family - check ROOT at PC 6 RELATIVE (Bible line 53-55)
  // F#° in C, C#° in G, G#° in D, etc. - third of V/V in each key
  const isFSharpDimFamily =
    rootRelative === 6 &&
    (detected.quality === "dim" || detected.quality === "dim7" || detected.quality === "halfdim7") &&
    (pcsRelative.size === 3 || pcsRelative.size === 4);

  if (isFSharpDimFamily) {
    return {
      function: "V/V",
      displayName: detected.chordName,
      isBonus: false
    };
  }

  // ✅ v4.1.7: G#dim family - check ROOT at PC 8 RELATIVE (Bible line 62-64)
  // G#° in C, D#° in G, A#° in D, etc. - third of V/vi in each key
  // SPECIAL: G#ø7 (halfdim7) → display only, no lighting
  const isGSharpDimFamily =
    rootRelative === 8 &&
    (detected.quality === "dim" || detected.quality === "dim7");

  if (isGSharpDimFamily) {
    return {
      function: "V/vi",
      displayName: detected.chordName,
      isBonus: false
    };
  }

  // G#ø7 → display only (Bible line 64)
  const isGSharpHalfdim7 =
    rootRelative === 8 &&
    detected.quality === "halfdim7";

  if (isGSharpHalfdim7) {
    return null; // Display only, no wedge lighting
  }

  if (showBonusWedges) {
    // V/ii - Secondary dominant of ii (A7 in C, D7 in F, E7 in G)
    // Pattern: [9, 1, 4] triad or [9, 1, 4, 7] seventh
    // NOTE: A major triad CAN function as V/ii (common substitution)
    const hasV_ii_triad = pcsRelative.has(9) && pcsRelative.has(1) && pcsRelative.has(4);
    const hasV_ii_7th = hasV_ii_triad && pcsRelative.has(7);

    if (hasV_ii_7th || (hasV_ii_triad && pcsRelative.size === 3)) {
      return {
        function: "V/ii",
        displayName: detected.chordName,
        isBonus: true
      };
    }

    // ✅ v4.1.7: C#dim family - check ROOT at PC 1 RELATIVE (Bible line 57-60)
    // C#° in C, G#° in G, D#° in D, etc. - third of V/ii in each key → V/ii BONUS
    const isCSharpDimFamily =
      rootRelative === 1 &&
      (detected.quality === "dim" || detected.quality === "dim7" || detected.quality === "halfdim7") &&
      (pcsRelative.size === 3 || pcsRelative.size === 4);

    if (isCSharpDimFamily) {
      return {
        function: "V/ii",
        displayName: detected.chordName,
        isBonus: true
      };
    }

    // ✅ v4.1.7: B° family - check ROOT at PC 11 relative (Bible line 66-71)
    // B° in C, F#° in G, C#° in D, etc. → ii/vi BONUS
    // SPECIAL CASE: Bdim7 with B bass → V7 (G7♭9), not ii/vi
    const isBdimTriad =
      rootRelative === 11 &&
      detected.quality === "dim" &&
      pcsRelative.size === 3;

    const isBm7b5 =
      rootRelative === 11 &&
      detected.quality === "halfdim7" &&
      pcsRelative.size === 4;

    // ✅ v4.1.7: SPECIAL CASE - Bdim7 with B bass → V7 (Bible line 70)
    // Bdim7 = G7♭9 substitute when B is in bass
    const isBdim7WithBBass =
      rootRelative === 11 &&
      detected.quality === "dim7" &&
      pcsRelative.size === 4;

    if (isBdim7WithBBass) {
      return {
        function: "V7",
        displayName: detected.chordName,
        isBonus: false
      };
    }

    // B° and Bm7♭5 → ii/vi BONUS
    if (isBdimTriad || isBm7b5) {
      return {
        function: "ii/vi",
        displayName: detected.chordName,
        isBonus: true
      };
    }
  }
  
  // Now check diatonic patterns (10 regular wedges)
  // CRITICAL: Check 7th chords (size === 4) BEFORE triads (size === 3)
  // CRITICAL: Validate exact 4th note to prevent false matches
  
  const size = pcsRelative.size;
  
  // === SEVENTH CHORDS (4 notes) - Check these FIRST ===
  
  // vi7 - Am7 (9,0,4,7) - CHECK BEFORE Imaj7 to prevent [0,4,7] subset match
  if (size === 4 && pcsRelative.has(9) && pcsRelative.has(0) && pcsRelative.has(4) && pcsRelative.has(7)) {
    console.log('✅ vi7 MATCHED (Am7):', Array.from(pcsRelative));
    return {
      function: "vi",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // Imaj7 - Cmaj7 (0,4,7,11) - MUST have [11] not [7]!
  if (size === 4 && pcsRelative.has(0) && pcsRelative.has(4) && pcsRelative.has(7) && pcsRelative.has(11)) {
    console.log('✅ Imaj7 MATCHED (Cmaj7):', Array.from(pcsRelative));
    return {
      function: "I",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // ii7 - Dm7 (2,5,9,0)
  if (size === 4 && pcsRelative.has(2) && pcsRelative.has(5) && pcsRelative.has(9) && pcsRelative.has(0)) {
    console.log('✅ ii7 MATCHED (Dm7):', Array.from(pcsRelative));
    return {
      function: "ii",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // ♭VII7 - Bb7 (10,2,5,8) - CHECK BEFORE ii7 to prevent [2,5] false match
  if (size === 4 && pcsRelative.has(10) && pcsRelative.has(2) && pcsRelative.has(5) && pcsRelative.has(8)) {
    console.log('✅ ♭VII7 MATCHED (Bb7):', Array.from(pcsRelative));
    return {
      function: "♭VII",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V/V7 - D7 (2,6,9,0)
  if (size === 4 && pcsRelative.has(2) && pcsRelative.has(6) && pcsRelative.has(9) && pcsRelative.has(0)) {
    return {
      function: "V/V",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // iii7 - Em7 (4,7,11,2)
  if (size === 4 && pcsRelative.has(4) && pcsRelative.has(7) && pcsRelative.has(11) && pcsRelative.has(2)) {
    return {
      function: "iii",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V/vi7 - E7 (4,8,11,2)
  if (size === 4 && pcsRelative.has(4) && pcsRelative.has(8) && pcsRelative.has(11) && pcsRelative.has(2)) {
    return {
      function: "V/vi",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // IVmaj7 - Fmaj7 (5,9,0,4)
  if (size === 4 && pcsRelative.has(5) && pcsRelative.has(9) && pcsRelative.has(0) && pcsRelative.has(4)) {
    return {
      function: "IV",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // iv7 - Fm7 (5,8,0,3)
  if (size === 4 && pcsRelative.has(5) && pcsRelative.has(8) && pcsRelative.has(0) && pcsRelative.has(3)) {
    return {
      function: "iv",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V7 - G7 (7,11,2,5)
  if (size === 4 && pcsRelative.has(7) && pcsRelative.has(11) && pcsRelative.has(2) && pcsRelative.has(5)) {
    return {
      function: "V7",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // === TRIADS (3 notes) - Check these AFTER 7ths ===
  
  // I - C major (0,4,7)
  if (size === 3 && pcsRelative.has(0) && pcsRelative.has(4) && pcsRelative.has(7)) {
    return {
      function: "I",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // ii - Dm (2,5,9)
  if (size === 3 && pcsRelative.has(2) && pcsRelative.has(5) && pcsRelative.has(9)) {
    return {
      function: "ii",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V/V - D (2,6,9)
  if (size === 3 && pcsRelative.has(2) && pcsRelative.has(6) && pcsRelative.has(9)) {
    return {
      function: "V/V",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // iii - Em (4,7,11)
  if (size === 3 && pcsRelative.has(4) && pcsRelative.has(7) && pcsRelative.has(11)) {
    return {
      function: "iii",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V/vi - E (4,8,11)
  if (size === 3 && pcsRelative.has(4) && pcsRelative.has(8) && pcsRelative.has(11)) {
    return {
      function: "V/vi",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // iv - Fm (5,8,0)
  if (size === 3 && pcsRelative.has(5) && pcsRelative.has(8) && pcsRelative.has(0)) {
    return {
      function: "iv",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // IV - F (5,9,0)
  if (size === 3 && pcsRelative.has(5) && pcsRelative.has(9) && pcsRelative.has(0)) {
    return {
      function: "IV",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // V7 - G (7,11,2) - maps to V7 function even as triad
  if (size === 3 && pcsRelative.has(7) && pcsRelative.has(11) && pcsRelative.has(2)) {
    return {
      function: "V7",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // vi - Am (9,0,4)
  if (size === 3 && pcsRelative.has(9) && pcsRelative.has(0) && pcsRelative.has(4)) {
    return {
      function: "vi",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // ♭VII - Bb (10,2,5) - triad only
  if (size === 3 && pcsRelative.has(10) && pcsRelative.has(2) && pcsRelative.has(5)) {
    return {
      function: "♭VII",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // No match - illegal/outside chord
  return null;
}

/**
 * Helper: Get tonic PC from absolute pitch class set
 * (Used for Bdim7 bass note special case)
 */
function getTonicPC(pcsAbsolute: Set<number>): number {
  // This is a simplification - in reality we'd need baseKey passed in
  // For now, assume C (PC = 0) as we're always relative to baseKey anyway
  return 0;
}

// EOF - mapping.ts v4.1.7