// src/lib/modes.ts
import type { Fn } from "./types";
import { T, subsetOf, NAME_TO_PC, add12 } from "./theory";

/** ---------- Parallel (Eb) entry shapes, used from C space ---------- */
export const VISITOR_SHAPES: Array<{name:string; pcs:Set<number>; fn:Fn}> = [
  { name:"Cm7",    pcs:T([0,3,7,10]), fn:"vi" },
  { name:"Cm",     pcs:T([0,3,7]),    fn:"vi" },
  { name:"Ebmaj7", pcs:T([3,7,10,2]), fn:"I"  },
  { name:"Eb",     pcs:T([3,7,10]),   fn:"I"  },
  { name:"Abmaj7", pcs:T([8,0,3,7]),  fn:"IV" },
  { name:"Ab",     pcs:T([8,0,3]),    fn:"IV" },
  { name:"Dbmaj7", pcs:T([1,5,8,0]),  fn:"♭VII" },
  { name:"Db",     pcs:T([1,5,8]),    fn:"♭VII" },
];

/**
 * Generate VISITOR_SHAPES transposed for a given baseKey
 * VISITOR_SHAPES are hardcoded for C (PAR = Eb), so we transpose them
 * Example: G major → PAR = Bb, so transpose +7 semitones
 */
export function getVisitorShapesFor(baseKey: string): Array<{name:string; pcs:Set<number>; fn:Fn}> {
  const basePc = NAME_TO_PC[baseKey as keyof typeof NAME_TO_PC] || 0;
  const offset = basePc; // Offset from C
  
  return VISITOR_SHAPES.map(shape => ({
    ...shape,
    pcs: new Set([...shape.pcs].map(pc => add12(pc, offset)))
  }));
}

/** Utility to grab the first match from a spec list */
export function firstMatch<
  TItem extends { n:string; s:Set<number>; f:string }
>(list: readonly TItem[], pcsRel:Set<number>): TItem | null {
  for (const it of list) if (subsetOf(it.s, pcsRel)) return it;
  return null;
}

/** ---------- Diatonic requirements in C space (7ths + triads) ---------- */
export const C_REQ7 = [
  { n:"Cmaj7", s:T([0,4,7,11]), f:"I"   },
  { n:"Fmaj7", s:T([5,9,0,4]),  f:"IV"  },
  { n:"Dm7",   s:T([2,5,9,0]),  f:"ii"  },
  { n:"Em7",   s:T([4,7,11,2]), f:"iii" },
  { n:"Am7",   s:T([9,0,4,7]),  f:"vi"  },
  { n:"G7",    s:T([7,11,2,5]), f:"V7"  },
  // v3.6.2 FIX: REMOVED D7 (V/V) and E7 (V/vi) from diatonic 7ths
  // Same issue as triads - secondary dominants matching before diatonic chords
] as const;

export const C_REQT = [
  { n:"C",  s:T([0,4,7]),  f:"I"   },
  { n:"F",  s:T([5,9,0]),  f:"IV"  },
  { n:"Dm", s:T([2,5,9]),  f:"ii"  },
  { n:"Em", s:T([4,7,11]), f:"iii" },
  { n:"Fm", s:T([5,8,0]),  f:"iv"  },
  { n:"Am", s:T([9,0,4]),  f:"vi"  },
  { n:"G",  s:T([7,11,2]), f:"V7"  },
  { n:"Bb", s:T([10,2,5]), f:"♭VII"},
  // v3.6.2 FIX: REMOVED V/V and V/vi from diatonic tables
  // These secondary dominants were matching BEFORE actual diatonic chords
  // Example: In Eb, Ab (IV) was matching as "V/V" instead
  // Secondary dominants are now handled separately in HarmonyWheel
] as const;

/** ---------- Diatonic in Eb space (7ths + triads) ---------- */
export const EB_REQ7 = [
  { n:"Ebmaj7", s:T([3,7,10,2]), f:"I"   },
  { n:"Fm7",    s:T([5,8,0,3]),  f:"ii"  },
  { n:"Gm7",    s:T([7,10,2,5]), f:"iii" },
  { n:"Abmaj7", s:T([8,0,3,7]),  f:"IV"  },
  { n:"Bb7",    s:T([10,2,5,8]), f:"V7"  },
  { n:"Cm7",    s:T([0,3,7,10]), f:"vi"  },
  { n:"Dbmaj7", s:T([1,5,8,0]),  f:"♭VII"},
  // v3.6.2 FIX: REMOVED F7 (V/V) and G7 (V/vi) from Eb diatonic 7ths
] as const;

export const EB_REQT = [
  { n:"Eb", s:T([3,7,10]), f:"I"   },
  { n:"Fm", s:T([5,8,0]),  f:"ii"  },
  { n:"Gm", s:T([7,10,2]), f:"iii" },
  { n:"Ab", s:T([8,0,3]),  f:"IV"  },
  { n:"Bb", s:T([10,2,5]), f:"V7"  },
  { n:"Cm", s:T([0,3,7]),  f:"vi"  },
  { n:"Db", s:T([1,5,8]),  f:"♭VII"},
  // v3.6.2 FIX: REMOVED F (V/V) and G (V/vi) from Eb diatonic tables
] as const;

/* =========================
   SUB (F) MODE PREDICATES
   ========================= */

/** Gm or Gm7 in C-relative pitch-classes */
export function isGmOrGm7(isSubset: (need:number[]) => boolean): boolean {
  return isSubset([7,10,2]) || isSubset([7,10,2,5]);
}

/** C7 in C-relative pitch-classes */
export function isC7(isSubset: (need:number[]) => boolean): boolean {
  return isSubset([0,4,7,10]);
}

/** F or Fmaj7 in C-relative pitch-classes */
export function isFmajOrF(isSubset: (need:number[]) => boolean): boolean {
  return isSubset([5,9,0]) || isSubset([5,9,0,4]);
}

/** C major triad (allowed to *stay* in SUB, but must NOT *enter*) */
export function isCTriad(isSubset: (need:number[]) => boolean): boolean {
  return isSubset([0,4,7]);
}

/**
 * SUB entry condition:
 *  - Only Gm/Gm7 OR C7 should *enter* the F keyspace.
 *  - C triad and F/Fmaj7 must NOT drive entry into SUB.
 */
export function shouldEnterSubdom(
  _exactSet: (need:number[]) => boolean,
  isSubset:  (need:number[]) => boolean
): boolean {
  return isGmOrGm7(isSubset) || isC7(isSubset);
}

/**
 * SUB stay condition:
 *  - Once in SUB, allow staying on: F/Fmaj7, Gm/Gm7, C7, and C triad (so playing C doesn’t bounce you out).
 *  - Anything else should exit back to the tonic space (unless it’s unmapped for C).
 */
export function shouldStaySubdom(
  isSubset:  (need:number[]) => boolean
): boolean {
  return isFmajOrF(isSubset) || isGmOrGm7(isSubset) || isC7(isSubset) || isCTriad(isSubset);
}

/**
 * Generate dynamic diatonic matching tables for any key
 * Returns { req7, reqt } - patterns are ALREADY relative, no transposition needed!
 * 
 * v3.6.4 CRITICAL FIX: Patterns in C_REQ7/C_REQT are relative intervals (e.g., [5,9,0] = IV)
 * These patterns work in ANY key because they're relative to the tonic.
 * Previous bug: Was transposing patterns to absolute PCs, breaking matching.
 * Fix: Return patterns unchanged - they're universal relative intervals!
 */
export function getDiatonicTablesFor(key: string): {
  req7: Array<{n: string, s: Set<number>, f: string}>,
  reqt: Array<{n: string, s: Set<number>, f: string}>
} {
  // Patterns are ALREADY relative intervals that work in any key
  // No transposition needed!
  
  const req7 = C_REQ7.map(item => ({
    n: item.n,
    s: item.s, // Use pattern as-is (it's a relative interval)
    f: item.f
  }));
  
  const reqt = C_REQT.map(item => ({
    n: item.n,
    s: item.s, // Use pattern as-is (it's a relative interval)
    f: item.f
  }));
  
  return { req7, reqt };
}

// EOF - modes.ts v3.6.4