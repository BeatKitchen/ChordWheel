/*
 * theory.ts - v3.10.3
 * 
 * CHANGES FROM v3.10.2:
 * - Made dimRootName() key-aware to respect flat/sharp key centers
 * - Now uses FLAT_NAMES in flat keys (C, F, Bb, Eb, Ab, Db, Gb)
 * - Uses SHARP_NAMES in sharp keys (G, D, A, E, B)
 * - Fixes: Gbdim now shows in Eb (not F#dim), consistent across all keys
 * - Affects: dim, dim7, and m7♭5 chord spellings
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
// v3.10.3: Made dimRootName key-aware to respect flat/sharp key centers
// In flat keys (C, F, Bb, Eb, Ab, Db, Gb), use flat names (Db, Eb, Gb, Ab, Bb)
// In sharp keys (G, D, A, E, B), use sharp names (C#, F#, G#, A#)
const dimRootName=(pc:number, baseKey: KeyName)=> (SHARP_KEY_CENTERS.has(baseKey) ? SHARP_NAMES : FLAT_NAMES)[pc];

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

// EOF - theory.ts v3.10.3