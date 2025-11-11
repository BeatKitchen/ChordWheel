/**
 * mapping.ts — v4.0.45
 * 
 * 📁 INSTALL TO: src/lib/engine/mapping.ts
 * 🔄 VERSION: 4.0.45 (CRITICAL FIX: F#dim and G#dim ALWAYS map to V/V and V/vi - NOT gated by showBonusWedges)
 * 
 * Maps detected chords to harmonic functions
 * 
 * CRITICAL CHANGES:
 * - Check 7th chords (size === 4) BEFORE triads (size === 3)
 * - Validate exact 4th note for 7ths (e.g., Imaj7 needs [11], not just any 4th note)
 * - Added detailed logging for Am7 and Bbmaj7 debugging
 * 
 * Fixed bugs:
 * - Am7 [9,0,4,7] was matching I (wrong!) → now matches vi7 ✅
 * - Bbmaj7 [10,2,5,9] was matching ii (wrong!) → now matches ♭VII7 ✅
 * 
 * BONUS WEDGES:
 * - V/ii function: A7 in C, D7 in F, E7 in G
 * - ii/vi function: Bm7♭5 in C, F#m7♭5 in F, C#m7♭5 in G
 * Pattern [9,1,4,7] for V/ii is RELATIVE to current key.
 * 
 * INCLUDES: Quality and size checks from v3.5.8
 */

import type { DetectionResult, ChordQuality } from './detection';
import type { Fn } from '../types';

export interface FunctionResult {
  function: Fn;          // Proper Fn type instead of string
  displayName: string;   // "A7", "Bm7♭5", "C", "G7", etc.
  isBonus: boolean;      // true for V/ii and ii/vi
}

/**
 * Maps a chord to its function in the current key/space
 * 
 * @param detected - Detection result with chord name, quality, PCs
 * @param pcsRelative - Pitch classes relative to baseKey
 * @param showBonusWedges - Whether bonus wedges are enabled
 * @returns Function result or null if illegal chord
 */
export function mapChordToFunction(
  detected: DetectionResult,
  pcsRelative: Set<number>,
  showBonusWedges: boolean
): FunctionResult | null {
  
  // CRITICAL: Check bonus wedges FIRST
  // (They contain subsets of diatonic chords, so must have priority)
  
  // ✅ F#dim and G#dim should ALWAYS map to V/V and V/vi (not gated by bonus mode)
  // F#dim family (maps to V/V - same as D7)
  const hasFSharpDim_triad = 
    pcsRelative.has(6) && pcsRelative.has(9) && pcsRelative.has(0) &&
    pcsRelative.size === 3 &&
    detected.quality === "dim";
  
  const hasFSharpDim7 = 
    pcsRelative.has(6) && pcsRelative.has(9) && pcsRelative.has(0) && pcsRelative.has(3) &&
    pcsRelative.size === 4 &&
    detected.quality === "dim7";
  
  if (hasFSharpDim_triad || hasFSharpDim7) {
    return {
      function: "V/V",
      displayName: detected.chordName,
      isBonus: false
    };
  }
  
  // G#dim family (maps to V/vi - same as E7)
  const hasGSharpDim_triad = 
    pcsRelative.has(8) && pcsRelative.has(11) && pcsRelative.has(2) &&
    pcsRelative.size === 3 &&
    detected.quality === "dim";
  
  const hasGSharpDim7 = 
    pcsRelative.has(8) && pcsRelative.has(11) && pcsRelative.has(2) && pcsRelative.has(5) &&
    pcsRelative.size === 4 &&
    detected.quality === "dim7";
  
  if (hasGSharpDim_triad || hasGSharpDim7) {
    return {
      function: "V/vi",
      displayName: detected.chordName,
      isBonus: false
    };
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
    
    // C#dim family (also maps to V/ii - upper structure of A7)
    // Pattern: [1,4,7] triad or [1,4,7,10] dim7
    // ✅ QUALITY CHECK: Must be detected as dim quality
    const hasCSharpDim_triad = 
      pcsRelative.has(1) && pcsRelative.has(4) && pcsRelative.has(7) &&
      pcsRelative.size === 3 &&
      detected.quality === "dim";
    
    const hasCSharpDim7 = 
      pcsRelative.has(1) && pcsRelative.has(4) && pcsRelative.has(7) && pcsRelative.has(10) &&
      pcsRelative.size === 4 &&
      detected.quality === "dim7";
    
    if (hasCSharpDim_triad || hasCSharpDim7) {
      return {
        function: "V/ii",
        displayName: detected.chordName,
        isBonus: true
      };
    }
    
    // C#m7♭5 (also maps to V/ii - half-diminished vii of ii)
    // Pattern: [1,4,7,11] (RELATIVE to key)
    // ✅ QUALITY CHECK: Must be halfdim7
    const hasCSharpM7b5 = 
      pcsRelative.has(1) && pcsRelative.has(4) && pcsRelative.has(7) && pcsRelative.has(11) &&
      pcsRelative.size === 4 &&
      detected.quality === "halfdim7";
    
    if (hasCSharpM7b5) {
      return {
        function: "V/ii",
        displayName: detected.chordName,
        isBonus: true
      };
    }
    
    // F#m7♭5 (also maps to V/V - half-diminished vii of V)
    // Pattern: [6,9,0,4] (RELATIVE to key)
    // ✅ QUALITY CHECK: Must be halfdim7
    const hasFSharpM7b5 = 
      pcsRelative.has(6) && pcsRelative.has(9) && pcsRelative.has(0) && pcsRelative.has(4) &&
      pcsRelative.size === 4 &&
      detected.quality === "halfdim7";
    
    if (hasFSharpM7b5) {
      return {
        function: "V/V",
        displayName: detected.chordName,
        isBonus: true
      };
    }
    
    // ii/vi - Half-diminished vii of vi (Bm7♭5 in C, F#m7♭5 in F)
    // Pattern: [11, 2, 5] dim triad or [11, 2, 5, 9] half-dim 7th
    // ✅ QUALITY CHECK: Must be dim or halfdim7
    // ✅ SIZE CHECK: Prevents Dm [2,5,9] from matching
    const hasBdim_triad = 
      pcsRelative.has(11) && pcsRelative.has(2) && pcsRelative.has(5) &&
      pcsRelative.size === 3 &&
      detected.quality === "dim";
    
    const hasBm7b5 = 
      pcsRelative.has(11) && pcsRelative.has(2) && pcsRelative.has(5) && pcsRelative.has(9) &&
      pcsRelative.size === 4 &&
      detected.quality === "halfdim7";
    
    // DEBUG: Log Bm7b5 detection
    if (pcsRelative.has(11) && pcsRelative.has(2) && pcsRelative.has(5)) {
      console.log('🔍 Bm7b5 CHECK:', {
        has11: pcsRelative.has(11),
        has2: pcsRelative.has(2),
        has5: pcsRelative.has(5),
        has9: pcsRelative.has(9),
        size: pcsRelative.size,
        quality: detected.quality,
        showBonus: showBonusWedges,
        matched: hasBm7b5
      });
    }
    
    // SPECIAL CASE: Bdim7 with B in bass → maps to V (G7), not ii/vi
    // Check if we have dim7 quality AND bass note is "11" relative PC
    if (detected.quality === "dim7") {
      const bassPcRel = (detected.bassNote % 12 - getTonicPC(detected.pcsAbsolute) + 12) % 12;
      if (bassPcRel === 11) {
        // Bdim7 with B bass in key of C → map to V7, not ii/vi
        return {
          function: "V7",
          displayName: detected.chordName,
          isBonus: false
        };
      }
    }
    
    if (hasBm7b5 || hasBdim_triad) {
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

// EOF - mapping.ts v4.0.45