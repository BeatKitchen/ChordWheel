/*
 * theory.ts — v3.10.2
 * 
 * CHANGES FROM v3.10.1:
 * - Added "V/ii" case to realizeFunction() (A7 in key of C)
 * - Added explicit return type `: string` to realizeFunction()
 * - Fixes TypeScript errors where return was possibly undefined
 * 
 * CHANGES FROM v3.1.3:
 * - Added case "V" to realizeFunction() switch statement
 * - This was causing all TypeScript "undefined" errors!
 * - Now realizeFunction handles both "V" and "V7" properly
 * 
 * CHANGES FROM v2.37.9:
 * - Strengthened dim7 lowest-note detection (now runs FIRST, not as fallback)
 * - Fixes ALL dim7 chords being misnamed (e.g., Ddim7 showed as G#dim7)
 * - Ensures lowest played note is always used as dim7 root
 * 
 * CHANGES FROM v2.37.8:
 * - Added optional midiNotes parameter to internalAbsoluteName()
 * - Improved dim7 root selection to use lowest played note
 * - Added findDim7RootFromLowest() helper function
 * - This fixes Bdim7 being misidentified as G#dim7
 * 
 * MODIFIED BY: Claude AI for Nathan Rosenberg / Beat Kitchen
 * DATE: November 2, 2025
 */

import type { Fn, KeyName } from "./types";

/* names + pcs */
export const FLAT_NAMES: KeyName[] = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
export const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const;
export const NAME_TO_PC = Object.fromEntries(FLAT_NAMES.map((n,i)=>[n,i])) as Record<KeyName,number>;
export const DEG = {1:0,2:2,3:4,4:5,5:7,6:9,7:11} as const;

export const pcFromMidi = (n:number)=> ((n%12)+12)%12;
export const add12=(x:number,y:number)=>((x+y)%12+12)%12;

const SHARP_KEY_CENTERS = new Set<KeyName>(["G","D","A","E","B"]);
export function pcNameForKey(pc:number, key: KeyName){
  return (SHARP_KEY_CENTERS.has(key)? SHARP_NAMES:FLAT_NAMES)[((pc%12)+12)%12];
}

/* set helpers — accept readonly arrays to satisfy `as const` tuples */
export const T = (a: ReadonlyArray<number>) => new Set(a.map(x => ((x % 12) + 12) % 12));
export const subsetOf=(need:Set<number>,pool:Set<number>)=>{ for(const n of need) if(!pool.has(n)) return false; return true; };
const includesAll = (s:Set<number>, tpl: ReadonlyArray<number>) => tpl.every(p => s.has(p));

/* absolute chord namer (trimmed) */
type AbsMatch={root:number;qual:"maj7"|""|"m"|"7"|"m7"|"mMaj7"|"m7b5"|"dim"|"dim7";matched:number;rank:number};
const TPL_7THS_REAL = [
  {q:"maj7", pcs:[0,4,7,11] as const, rank:3 as const},
  {q:"7",    pcs:[0,4,7,10] as const, rank:3 as const},
  {q:"m7",   pcs:[0,3,7,10] as const, rank:3 as const},
  {q:"mMaj7",pcs:[0,3,7,11] as const, rank:3 as const},
  {q:"m7b5", pcs:[0,3,6,10] as const, rank:3 as const},
  {q:"dim7", pcs:[0,3,6,9]  as const, rank:4 as const},
] as const;

const rot=(pc:number,r:number)=>((pc-r)%12+12)%12;
const better=(a:AbsMatch|null,b:AbsMatch)=>!a?b:(b.rank!==a.rank? (b.rank>a.rank?b:a) : (b.matched!==a.matched? (b.matched>a.matched?b:a):a));
// MODIFIED v2.37.10: Added C# (pc=1) to dimRootName for consistency
// This ensures C#m7♭5 shows as "C#m7♭5" not "Dbm7♭5"
const dimRootName=(pc:number)=> pc===10?"Bb":(pc===3?"Eb":(pc===1?"C#":SHARP_NAMES[pc]));

// ========== NEW v2.37.9: Helper function to find dim7 root from lowest note ==========
/**
 * For fully diminished 7th chords, determine the root based on the lowest MIDI note played.
 * This resolves ambiguity since dim7 chords are symmetrical (all four inversions use same PCs).
 * 
 * @param pcs - Set of pitch classes (0-11)
 * @param lowestPC - Pitch class of the lowest MIDI note played
 * @returns The PC that should be considered the root, or null if not a valid dim7 from that root
 */
function findDim7RootFromLowest(pcs: Set<number>, lowestPC: number): number | null {
  // Check if lowestPC forms a valid dim7 chord (root, m3, d5, d7)
  if (pcs.has(lowestPC) && 
      pcs.has((lowestPC+3)%12) && 
      pcs.has((lowestPC+6)%12) && 
      pcs.has((lowestPC+9)%12)) {
    return lowestPC;
  }
  return null;
}
// ========== END NEW v2.37.9 ==========

// ========== MODIFIED v2.37.9: Added optional midiNotes parameter ==========
/**
 * Identify chord name from pitch classes and key context.
 * 
 * @param pcsAbs - Set of pitch classes (0-11) in absolute terms
 * @param baseKey - Current key context (e.g., "C", "F", "Bb")
 * @param midiNotes - Optional array of actual MIDI note numbers (for dim7 root disambiguation)
 * @returns Chord name string (e.g., "Bdim7", "Cm7", "F#m7♭5")
 */
export function internalAbsoluteName(pcsAbs:Set<number>, baseKey:KeyName, midiNotes?: number[]){
  if(pcsAbs.size<3) return "";
  const list=[...pcsAbs];
  let best:AbsMatch|null=null;
  
  // DEBUG: Log what we received
  // console.log('[THEORY DEBUG] INPUT', {
  //   pcsAbs: [...pcsAbs],
  //   baseKey: baseKey,
  //   midiNotes: midiNotes,
  //   midiNotesLength: midiNotes?.length
  // });
  
  // ========== MODIFIED v2.37.10: Check for dim7 FIRST using lowest note ==========
  // For fully diminished 7th chords, determine root from lowest note BEFORE rotation
  // This prevents other enharmonic spellings from being chosen (e.g., G#dim7 instead of Ddim7)
  
  // First, check if we have a dim7 chord at all by looking at the pitch classes
  let isDim7 = false;
  let dim7Root = null;
  
  // Try each PC as a potential dim7 root
  for (let pc = 0; pc < 12; pc++) {
    if (pcsAbs.has(pc) && 
        pcsAbs.has((pc+3)%12) && 
        pcsAbs.has((pc+6)%12) && 
        pcsAbs.has((pc+9)%12)) {
      isDim7 = true;
      
      // If we have MIDI notes, use the lowest one
      if (midiNotes && midiNotes.length > 0) {
        const lowestNote = Math.min(...midiNotes);
        const lowestPC = pcFromMidi(lowestNote);
        
        console.log('[DIM7 DETECTED]', {
          isDim7: true,
          lowestNote,
          lowestPC,
          firstFoundRoot: pc
        });
        
        // Check if the lowest note is part of a valid dim7
        if (pcsAbs.has(lowestPC) && 
            pcsAbs.has((lowestPC+3)%12) && 
            pcsAbs.has((lowestPC+6)%12) && 
            pcsAbs.has((lowestPC+9)%12)) {
          dim7Root = lowestPC;
          break;
        }
      } else {
        // No MIDI notes provided - use first valid dim7 root found
        // Prefer: B(11), C#(1), Eb(3), F#(6), G#(8), Bb(10) in that order
        const preferredOrder = [11, 1, 3, 6, 8, 10, 0, 2, 4, 5, 7, 9];
        for (const preferred of preferredOrder) {
          if (pcsAbs.has(preferred) && 
              pcsAbs.has((preferred+3)%12) && 
              pcsAbs.has((preferred+6)%12) && 
              pcsAbs.has((preferred+9)%12)) {
            dim7Root = preferred;
            break;
          }
        }
        if (dim7Root !== null) break;
      }
    }
  }
  
  // If we found a dim7, return it immediately with the correct root
  if (isDim7 && dim7Root !== null) {
    const rootName = dimRootName(dim7Root);
    const result = `${rootName}dim7`;
    console.log('[RETURNING DIM7]', { dim7Root, rootName, result });
    return result;
  }
  // ========== END MODIFIED v2.37.10 ==========
  
  for(let r=0;r<12;r++){
    const rel=new Set(list.map(p=>rot(p,r)));
    for(const t of TPL_7THS_REAL) if(includesAll(rel,t.pcs)) best=better(best,{root:r,qual:t.q as any,matched:t.pcs.length,rank:t.rank});
    for(const t of [
      {q:"",   pcs:[0,4,7]  as const, rank:2 as const},
      {q:"m",  pcs:[0,3,7]  as const, rank:2 as const},
      {q:"dim",pcs:[0,3,6]  as const, rank:2 as const},
      {q:"aug",pcs:[0,4,8]  as const, rank:2 as const},
    ] as const) if(includesAll(rel,t.pcs)) best=better(best,{root:r,qual:t.q as any,matched:t.pcs.length,rank:t.rank});
  }
  if(!best) return "";
  
  // ========== DEBUG v2.39.6 ==========
  // console.log('[THEORY DEBUG] BEST MATCH', {
  //   bestRoot: best.root,
  //   bestQual: best.qual,
  //   list: list,
  //   baseKey: baseKey
  // });
  // ========== END DEBUG ==========
  
  // ========== FIX v2.39.5: best.root IS the actual root PC ==========
  // Rotation works by subtracting: rot(pc, r) = (pc - r) % 12
  // If we rotate by r=5 to get [0,4,7], then PC 5 becomes PC 0 (the root)
  // So best.root is the absolute pitch class of the root
  // Example: F-A-C = [5,9,0], rotated by 5 → [0,4,7], so root = 5 (F) ✓
  const actualRootPc = best.root;
  
  // console.log('[THEORY DEBUG] FINAL', {
  //   actualRootPc: actualRootPc,
  //   rootName: (best.qual==="dim"||best.qual==="dim7"||best.qual==="m7b5") ? `dimRootName(${actualRootPc})` : `pcNameForKey(${actualRootPc}, ${baseKey})`
  // });
  // ========== END FIX ==========
  
  // ========== REMOVED v2.37.10: Old fallback dim7 logic (now handled above) ==========
  // The dim7 special case has been moved to the top of the function
  // ========== END REMOVED ==========
  
  // MODIFIED v2.37.10: m7b5 now uses dimRootName() for consistency
  // This ensures C#m7♭5 shows as "C#m7♭5" not "Dbm7♭5"
  let rootName=(best.qual==="dim"||best.qual==="dim7"||best.qual==="m7b5")? dimRootName(actualRootPc)
              : pcNameForKey(actualRootPc, baseKey);
  const qual = best.qual==="m7b5" ? "m7♭5" : best.qual;
  return `${rootName}${qual}`;
}
// ========== END MODIFIED v2.37.9 ==========

/* diminished → functional mapping by bottom note (C space baseline) */
export const mapDimRootToFn_ByBottom=(rootPc:number):Fn|""=>
  rootPc===11?"V7":(rootPc===8?"V/vi":(rootPc===6?"V/V":""));

export const mapDim7_EbVisitor=(pcsRel:Set<number>):Fn|""=> subsetOf(T([11,2,5,8]), pcsRel)? "V/vi":"";

/* function label realizer in arbitrary key */
export function realizeFunction(fn:Fn, key: KeyName): string {
  const t = NAME_TO_PC[key];
  const name=(o:number)=>pcNameForKey(add12(t,o), key);
  switch(fn){
    case "I": return name(DEG[1]);
    case "ii": return name(DEG[2])+"m";
    case "iii": return name(DEG[3])+"m";
    case "IV": return name(DEG[4]);
    case "iv": return name(DEG[4])+"m";
    case "V": return name(DEG[5]);         // ← ADDED v3.1.3! Plain V triad (G in C)
    case "V7": return name(DEG[5])+"7";
    case "vi": return name(DEG[6])+"m";
    case "V/vi": return name(add12(DEG[6],7))+"7";
    case "V/V": return name(add12(DEG[5],7))+"7";
    case "V/ii": return name(add12(DEG[2],7))+"7";  // ← ADDED v3.10.2! A7 in key of C
    case "♭VII": return pcNameForKey(add12(t,10), key);
    default: return "";  // ✅ v3.18.86: Handle unknown functions
  }
}

/**
 * Calculate SUB (subdominant) key for a given meta-key
 * SUB = IV of meta-key
 * Example: C → F, Ab → Db, E → A
 */
export function getSubKey(metaKey: KeyName): KeyName {
  const metaPc = NAME_TO_PC[metaKey];
  const subPc = add12(metaPc, 5); // IV = +5 semitones
  return FLAT_NAMES[subPc]; // Always use flat names (KeyName type)
}

/**
 * Calculate PAR (parallel minor) key for a given meta-key
 * PAR = ♭VI of meta-key (major mode perspective)
 * Or: relative major of parallel minor
 * Example: C → Eb (relative major of Cm), Ab → Cb, E → G
 */
export function getParKey(metaKey: KeyName): KeyName {
  const metaPc = NAME_TO_PC[metaKey];
  const parPc = add12(metaPc, 3); // ♭VI = +3 semitones (Eb from C)
  return FLAT_NAMES[parPc]; // Always use flat names (KeyName type)
}

// EOF - theory.ts v3.10.2