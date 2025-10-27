// src/lib/modes.ts
import type { Fn } from "./types";
import { T, subsetOf } from "./theory";

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
  { n:"D7",    s:T([2,6,9,0]),  f:"V/V" },
  { n:"E7",    s:T([4,8,11,2]), f:"V/vi"},
] as const;

export const C_REQT = [
  { n:"C",  s:T([0,4,7]),  f:"I"   },
  { n:"F",  s:T([5,9,0]),  f:"IV"  },
  { n:"Dm", s:T([2,5,9]),  f:"ii"  },
  { n:"Em", s:T([4,7,11]), f:"iii" },
  { n:"Fm", s:T([5,8,0]),  f:"iv"  },
  { n:"Am", s:T([9,0,4]),  f:"vi"  },
  { n:"G",  s:T([7,11,2]), f:"V7"  },
  { n:"D",  s:T([2,6,9]),  f:"V/V" },
  { n:"E",  s:T([4,8,11]), f:"V/vi"},
  { n:"Bb", s:T([10,2,5]), f:"♭VII"},
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
  { n:"F7",     s:T([5,9,0,3]),  f:"V/V" },
  { n:"G7",     s:T([7,11,2,5]), f:"V/vi"},
] as const;

export const EB_REQT = [
  { n:"Eb", s:T([3,7,10]), f:"I"   },
  { n:"Fm", s:T([5,8,0]),  f:"ii"  },
  { n:"Gm", s:T([7,10,2]), f:"iii" },
  { n:"Ab", s:T([8,0,3]),  f:"IV"  },
  { n:"Bb", s:T([10,2,5]), f:"V7"  },
  { n:"Cm", s:T([0,3,7]),  f:"vi"  },
  { n:"Db", s:T([1,5,8]),  f:"♭VII"},
  { n:"F",  s:T([5,9,0]),  f:"V/V" },
  { n:"G",  s:T([7,11,2]), f:"V/vi"},
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
