import type { Fn, KeyName } from "./types";

/* names + pcs */
export const FLAT_NAMES: KeyName[] = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
export const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const;
export const NAME_TO_PC = Object.fromEntries(FLAT_NAMES.map((n,i)=>[n,i])) as Record<KeyName,number>;
export const DEG = {1:0,2:2,3:4,4:5,5:7,6:9,7:11} as const;

export const pcFromMidi = (n:number)=> ((n%12)+12)%12;
export const add12=(x:number,y:number)=>((x+y)%12+12)%12;

const SHARP_KEY_CENTERS = new Set<KeyName>(["G","D","A","E","B","Gb","Db"]);
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
const dimRootName=(pc:number)=> pc===10?"Bb":(pc===3?"Eb":SHARP_NAMES[pc]);

export function internalAbsoluteName(pcsAbs:Set<number>, baseKey:KeyName){
  if(pcsAbs.size<3) return "";
  const list=[...pcsAbs];
  let best:AbsMatch|null=null;
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
  let rootName=(best.qual==="dim"||best.qual==="dim7")? dimRootName(best.root)
              : (best.qual==="m7b5"&&best.root===6? SHARP_NAMES[best.root] : pcNameForKey(best.root, baseKey));
  const qual = best.qual==="m7b5" ? "m7♭5" : best.qual;
  return `${rootName}${qual}`;
}

/* diminished → functional mapping by bottom note (C space baseline) */
export const mapDimRootToFn_ByBottom=(rootPc:number):Fn|""=>
  rootPc===11?"V7":(rootPc===8?"V/vi":(rootPc===6?"V/V":""));

export const mapDim7_EbVisitor=(pcsRel:Set<number>):Fn|""=> subsetOf(T([11,2,5,8]), pcsRel)? "V/vi":"";

/* function label realizer in arbitrary key */
export function realizeFunction(fn:Fn, key: KeyName){
  const t = NAME_TO_PC[key];
  const name=(o:number)=>pcNameForKey(add12(t,o), key);
  switch(fn){
    case "I": return name(DEG[1]);
    case "ii": return name(DEG[2])+"m";
    case "iii": return name(DEG[3])+"m";
    case "IV": return name(DEG[4]);
    case "iv": return name(DEG[4])+"m";
    case "V7": return name(DEG[5])+"7";
    case "vi": return name(DEG[6])+"m";
    case "V/vi": return name(add12(DEG[6],7))+"7";
    case "V/V": return name(add12(DEG[5],7))+"7";
    case "♭VII": return pcNameForKey(add12(t,10), key);
  }
}
