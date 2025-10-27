// lib/dimBonus.ts
import type { Fn } from "./types";

const norm = (pc:number)=>((pc%12)+12)%12;

export function dimBonusMapForC(pcs: Set<number>): Fn | null {
  const has = (pc:number)=> pcs.has(norm(pc));
  const tri  = (...ns:number[]) => ns.every(has);
  const four = (...ns:number[]) => ns.every(has);

  // B family
  if (tri(11,2,5)) return "V/vi";        // Bdim triad → A7 bonus
  if (four(11,2,5,10)) return "V/vi";    // Bm7♭5 → A7 bonus
  if (four(11,2,5,8))  return "V7";      // B°7 → G7 (V7)

  // C# diminished family → A7 bonus (V/vi)
  if (tri(1,4,7) || four(1,4,7,10)) return "V/vi";

  // F# diminished family behaves like D (ii)
  if (tri(6,9,0) || four(6,9,0,3))  return "ii";

  // G# diminished family behaves like E7 (V/vi)
  if (tri(8,11,2) || four(8,11,2,5)) return "V/vi";

  return null;
}
