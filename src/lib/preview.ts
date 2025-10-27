import type { Fn, KeyName } from "./types";
import { NAME_TO_PC, add12, pcFromMidi } from "./theory";

export function chordPcsForFn(fn: Fn, key: KeyName, with7th: boolean): number[] {
  const T = NAME_TO_PC[key];
  const DEG = {1:0,2:2,3:4,4:5,5:7,6:9,7:11} as const;

  const tri = (off:number, minor=false)=>[add12(T,off),add12(T,off+(minor?3:4)),add12(T,off+7)];
  const dom7=(off:number)=>[add12(T,off),add12(T,off+4),add12(T,off+7),add12(T,off+10)];
  const maj7=(off:number)=>[add12(T,off),add12(T,off+4),add12(T,off+7),add12(T,off+11)];
  const min7=(off:number)=>[add12(T,off),add12(T,off+3),add12(T,off+7),add12(T,off+10)];

  switch(fn){
    case "I":   return with7th?maj7(DEG[1]):tri(DEG[1]);
    case "ii":  return with7th?min7(DEG[2]):tri(DEG[2],true);
    case "iii": return with7th?min7(DEG[3]):tri(DEG[3],true);
    case "IV":  return with7th?maj7(DEG[4]):tri(DEG[4]);
    case "iv":  return with7th?min7(DEG[4]):tri(DEG[4],true);
    case "V7":  return with7th?dom7(DEG[5]):tri(DEG[5]);
    case "vi":  return with7th?min7(DEG[6]):tri(DEG[6],true);
    case "V/V": { const r=add12(T,DEG[5]+7); return with7th?[r,add12(r,4),add12(r,7),add12(r,10)].map(p=>p%12):[r,add12(r,4),add12(r,7)].map(p=>p%12); }
    case "V/vi":{ const r=add12(T,DEG[6]+7); return with7th?[r,add12(r,4),add12(r,7),add12(r,10)].map(p=>p%12):[r,add12(r,4),add12(r,7)].map(p=>p%12); }
    case "♭VII": return tri(10).map(p=>p%12);
  }
}

/** absolute notes for chord pcs, rooted near C4, preserving inversion order */
export function absChordRootPositionFromPcs(pcs:number[], rootPc:number, anchorMidi=60): number[] {
  if(!pcs.length) return [];
  const norm=(x:number)=>((x%12)+12)%12;
  const idx=pcs.findIndex(p=>norm(p)===norm(rootPc));
  const ordered=idx>=0?pcs.slice(idx).concat(pcs.slice(0,idx)):[...pcs];

  const firstPc=norm(ordered[0]);
  let n0=anchorMidi; while(pcFromMidi(n0)!==firstPc) n0++;
  const out=[n0];
  for(let i=1;i<ordered.length;i++){
    const pc=norm(ordered[i]); let n=out[i-1]; do{ n++; } while(pcFromMidi(n)!==pc); out.push(n);
  }
  return out;
}

/** move whole stack into [low,high] without changing inversion */
export function fitNotesToWindowPreserveInversion(notes:number[], low:number, high:number): number[] {
  if(!notes.length) return [];
  const mid=(notes[0]+notes[notes.length-1])/2;
  const wmid=(low+high)/2;
  const k=Math.round((wmid-mid)/12);
  let shifted=notes.map(n=>n+12*k);
  while(shifted[0]<low) shifted=shifted.map(n=>n+12);
  while(shifted[shifted.length-1]>high) shifted=shifted.map(n=>n-12);
  if(shifted[shifted.length-1]>high){ for(let i=shifted.length-1;i>=0&&shifted[i]>high;i--) shifted[i]-=12; }
  if(shifted[0]<low){ for(let i=0;i<shifted.length&&shifted[i]<low;i++) shifted[i]+=12; }
  return shifted;
}
