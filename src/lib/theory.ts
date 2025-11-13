/*
 * theory.ts - v4.2.0
 *
 * CHANGES FROM v4.1.9:
 * - Added bass-dependent detection for suspended chords (sus2, sus4)
 * - Added bass-dependent detection for augmented chords (aug)
 * - Augmented chords use enharmonic naming: C#, F#, G# ALWAYS sharp (never Db, Gb, Ab)
 * - Reason: Aug chords built of major thirds, same rule as diminished thirds
 * - Examples: Csus2 = Gsus4 rotated, Caug = Eaug = G#aug (same pitch classes)
 * - All symmetrical chords display in hub with correct root, but do NOT map to wedges
 *
 * CHANGES FROM v4.1.8:
 * - CRITICAL FIX: Functional dims now ALWAYS use sharp names (C#, F#, G#)
 * - Reason: Named after THIRD of dominant - major thirds are always sharp
 * - Relative PC 1 → SHARP_NAMES[pc] (third of A7 = C#, never Db)
 * - Relative PC 6 → SHARP_NAMES[pc] (third of D7 = F#, never Gb)
 * - Relative PC 8 → SHARP_NAMES[pc] (third of E7 = G#, never Ab)
 * - Result: Key F + C#dim7 → "C#dim7" (not "Dbdim7") ✓
 *
 * CHANGES FROM v4.1.7b:
 * - Diminished naming now FUNCTIONAL (works in all keys)
 * - Uses RELATIVE PC (not absolute) to determine functional dims
 *
 * CHANGES FROM v4.1.7:
 * - Fixed keyboard eraser display for single notes and intervals
 * - internalAbsoluteName() now returns note names for 1-2 note inputs
 * 
 * CHANGES FROM v3.10.1:
 * - Added "V/ii" case to realizeFunction() (A7 in key of C)
 * - Added explicit return type : string to realizeFunction()
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

/* set helpers - accept readonly arrays to satisfy as const tuples */
export const T = (a: ReadonlyArray<number>) => new Set(a.map(x => ((x % 12) + 12) % 12));
export const subsetOf=(need:Set<number>,pool:Set<number>)=>{ for(const n of need) if(!pool.has(n)) return false; return true; };
const includesAll = (s:Set<number>, tpl: ReadonlyArray<number>) => tpl.every(p => s.has(p));

/* absolute chord namer (trimmed) */
type AbsMatch={root:number;qual:"maj7"|""|"m"|"7"|"m7"|"mMaj7"|"m7b5"|"dim"|"dim7"|"sus2"|"sus4"|"aug";matched:number;rank:number};
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

/**
 * v4.1.9: Diminished chord naming - FUNCTIONAL (works in all keys)
 *
 * RULE: Diminished chords are named after the THIRD of the dominant they substitute
 * - The third of a dominant 7th chord is ALWAYS a major third
 * - Major thirds are ALWAYS spelled with sharps (C#, D#, F#, G#, A#)
 *
 * Functional diminished chords (relative PC):
 * - Relative PC 1 → third of A7 (V/ii) → ALWAYS C# (never Db)
 * - Relative PC 6 → third of D7 (V/V) → ALWAYS F# (never Gb)
 * - Relative PC 8 → third of E7 (V/vi) → ALWAYS G# (never Ab)
 * - Relative PC 11 → 7th degree (ii/vi function) → B natural
 *
 * Illegal diminished chords:
 * - Relative PC 3 → ♭3 (use key's preference)
 * - Relative PC 10 → ♭7 (use key's preference)
 *
 * Examples across keys:
 * - Key C: relative PC 1 = absolute PC 1 → C#dim (third of A7)
 * - Key F: relative PC 8 = absolute PC 1 → C#dim (third of A7, V/vi in F)
 * - Key G: relative PC 1 = absolute PC 8 → G#dim (third of E7, V/ii in G)
 */
const dimRootName = (pc: number, baseKey: KeyName) => {
  const NAME_TO_PC: Record<KeyName, number> = {
    "C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5,
    "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11
  };

  const keyTonicPC = NAME_TO_PC[baseKey];
  const relativePc = (pc - keyTonicPC + 12) % 12;

  // Functional diminished chords - name after the third of their target dominant
  // These are ALWAYS the major third of a dominant 7th chord, so ALWAYS sharp
  if (relativePc === 1) return SHARP_NAMES[pc];  // Third of A7 (V/ii)
  if (relativePc === 6) return SHARP_NAMES[pc];  // Third of D7 (V/V)
  if (relativePc === 8) return SHARP_NAMES[pc];  // Third of E7 (V/vi)
  if (relativePc === 11) return "B";             // 7th degree (ii/vi function)

  // Illegal diminished chords (♭3, ♭7) - use key's flat/natural preference
  if (relativePc === 3 || relativePc === 10) {
    return pcNameForKey(pc, baseKey);
  }

  // All other diminished chords - use key's sharp/flat preference
  return (SHARP_KEY_CENTERS.has(baseKey) ? SHARP_NAMES : FLAT_NAMES)[pc];
};

/**
 * v4.2.0: Augmented chord naming - uses sharp names for major thirds
 *
 * RULE: Augmented chords are built entirely of major thirds
 * - Major thirds at relative PC 1, 6, 8 are ALWAYS sharp (C#, F#, G#)
 * - This matches the diminished chord naming system
 * - Examples: Caug, G#aug (never Abaug in key of C)
 */
const augRootName = (pc: number, baseKey: KeyName) => {
  const NAME_TO_PC: Record<KeyName, number> = {
    "C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5,
    "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11
  };

  const keyTonicPC = NAME_TO_PC[baseKey];
  const relativePc = (pc - keyTonicPC + 12) % 12;

  // Major thirds are ALWAYS sharp (same as diminished third rule)
  if (relativePc === 1) return SHARP_NAMES[pc];  // C# in key of C
  if (relativePc === 6) return SHARP_NAMES[pc];  // F# in key of C
  if (relativePc === 8) return SHARP_NAMES[pc];  // G# in key of C

  // All other augmented roots - use key's sharp/flat preference
  return (SHARP_KEY_CENTERS.has(baseKey) ? SHARP_NAMES : FLAT_NAMES)[pc];
};

function findDim7RootFromLowest(pcs: Set<number>, lowestPC: number): number | null {
  if (pcs.has(lowestPC) && 
      pcs.has((lowestPC+3)%12) && 
      pcs.has((lowestPC+6)%12) && 
      pcs.has((lowestPC+9)%12)) {
    return lowestPC;
  }
  return null;
}

export function internalAbsoluteName(pcsAbs:Set<number>, baseKey:KeyName, midiNotes?: number[]){
  // ✅ v4.1.7b: Return note names for single notes and intervals (for keyboard eraser display)
  if(pcsAbs.size === 1) {
    const pc = Array.from(pcsAbs)[0];
    return pcNameForKey(pc, baseKey);
  }
  if(pcsAbs.size === 2) {
    // Return lowest note name for dyads
    const sorted = Array.from(pcsAbs).sort((a,b) => a - b);
    return pcNameForKey(sorted[0], baseKey);
  }
  if(pcsAbs.size<3) return "";
  const list=[...pcsAbs];
  let best:AbsMatch|null=null;
  
  let isDim7 = false;
  let dim7Root = null;
  
  for (let pc = 0; pc < 12; pc++) {
    if (pcsAbs.has(pc) && 
        pcsAbs.has((pc+3)%12) && 
        pcsAbs.has((pc+6)%12) && 
        pcsAbs.has((pc+9)%12)) {
      isDim7 = true;
      
      if (midiNotes && midiNotes.length > 0) {
        const lowestNote = Math.min(...midiNotes);
        const lowestPC = pcFromMidi(lowestNote);
        
        if (pcsAbs.has(lowestPC) && 
            pcsAbs.has((lowestPC+3)%12) && 
            pcsAbs.has((lowestPC+6)%12) && 
            pcsAbs.has((lowestPC+9)%12)) {
          dim7Root = lowestPC;
          break;
        }
      } else {
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
  
  if (isDim7 && dim7Root !== null) {
    const rootName = dimRootName(dim7Root, baseKey);
    return `${rootName}dim7`;
  }

  // ✅ Suspended chord detection (bass-dependent like dim7)
  // sus2 and sus4 share same pitch classes when rotated, so we need bass note
  // sus2: [0,2,7] - root + maj2 + P5
  // sus4: [0,5,7] - root + P4 + P5
  // Example: Csus2 [0,2,7] = Gsus4 [7,0,2] rotated
  if (pcsAbs.size === 3 && midiNotes && midiNotes.length > 0) {
    const lowestNote = Math.min(...midiNotes);
    const lowestPC = pcFromMidi(lowestNote);

    // Check if bass note forms augmented pattern first (symmetrical chord)
    // aug: [0,4,8] - root + M3 + aug5
    // Example: Caug [0,4,8] = Eaug [4,8,0] = G#aug [8,0,4] (all same PCs!)
    if (pcsAbs.has(lowestPC) &&
        pcsAbs.has((lowestPC + 4) % 12) &&
        pcsAbs.has((lowestPC + 8) % 12)) {
      const rootName = augRootName(lowestPC, baseKey);
      return `${rootName}aug`;
    }

    // Check if bass note forms sus2 pattern
    if (pcsAbs.has(lowestPC) &&
        pcsAbs.has((lowestPC + 2) % 12) &&
        pcsAbs.has((lowestPC + 7) % 12)) {
      const rootName = pcNameForKey(lowestPC, baseKey);
      return `${rootName}sus2`;
    }

    // Check if bass note forms sus4 pattern
    if (pcsAbs.has(lowestPC) &&
        pcsAbs.has((lowestPC + 5) % 12) &&
        pcsAbs.has((lowestPC + 7) % 12)) {
      const rootName = pcNameForKey(lowestPC, baseKey);
      return `${rootName}sus4`;
    }
  }

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
  
  const actualRootPc = best.root;
  // v3.10.3: Use key-aware dimRootName for consistent spelling (Gbdim in Eb, not F#dim)
  let rootName=(best.qual==="dim"||best.qual==="dim7"||best.qual==="m7b5")? dimRootName(actualRootPc, baseKey)
              : pcNameForKey(actualRootPc, baseKey);
  const qual = best.qual==="m7b5" ? "m7♭5" : best.qual;
  return `${rootName}${qual}`;
}

export const mapDimRootToFn_ByBottom=(rootPc:number):Fn|""=>
  rootPc===11?"V7":(rootPc===8?"V/vi":(rootPc===6?"V/V":""));

export const mapDim7_EbVisitor=(pcsRel:Set<number>):Fn|""=> subsetOf(T([11,2,5,8]), pcsRel)? "V/vi":"";

export function realizeFunction(fn:Fn, key: KeyName): string {
  const t = NAME_TO_PC[key];
  const name=(o:number)=>pcNameForKey(add12(t,o), key);
  switch(fn){
    case "I": return name(DEG[1]);
    case "ii": return name(DEG[2])+"m";
    case "iii": return name(DEG[3])+"m";
    case "IV": return name(DEG[4]);
    case "iv": return name(DEG[4])+"m";
    case "V": return name(DEG[5]);
    case "V7": return name(DEG[5])+"7";
    case "vi": return name(DEG[6])+"m";
    case "V/vi": return name(add12(DEG[6],7))+"7";
    case "V/V": return name(add12(DEG[5],7))+"7";
    case "V/ii": return name(add12(DEG[2],7))+"7";
    case "♭VII": return pcNameForKey(add12(t,10), key);
    default: return "";
  }
}

export function getSubKey(metaKey: KeyName): KeyName {
  const metaPc = NAME_TO_PC[metaKey];
  const subPc = add12(metaPc, 5);
  return FLAT_NAMES[subPc];
}

export function getParKey(metaKey: KeyName): KeyName {
  const metaPc = NAME_TO_PC[metaKey];
  const parPc = add12(metaPc, 3);
  return FLAT_NAMES[parPc];
}

// EOF - theory.ts v4.2.0