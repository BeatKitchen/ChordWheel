import type { Fn, SizeSpec } from "./types";
import {
  WEDGE_ORDER, WEDGE_DEGREES, WEDGE_ANCHOR_DEG, WEDGE_GAP_DEG,
  RING_INNER_R, RING_OUTER_R
} from "./config";

/* utils */
const toRadFromTop=(degTop:number)=>((degTop-90)*Math.PI)/180;
export function polar(cx:number,cy:number,r:number,aTopDeg:number){
  const a=toRadFromTop(aTopDeg);
  return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};
}

/** SVG annulus arc using “degrees from 12 o’clock (top)” */
export function annulusTopDegree(
  cx:number, cy:number,
  rOuter:number, rInner:number,
  a0Top:number, a1Top:number
): string {
  const a0=toRadFromTop(a0Top), a1=toRadFromTop(a1Top);
  const o0={x:cx+rOuter*Math.cos(a0),y:cy+rOuter*Math.sin(a0)};
  const o1={x:cx+rOuter*Math.cos(a1),y:cy+rOuter*Math.sin(a1)};
  const i1={x:cx+rInner*Math.cos(a1),y:cy+rInner*Math.sin(a1)};
  const i0={x:cx+rInner*Math.cos(a0),y:cy+rInner*Math.sin(a0)};
  const sweep=((a1-a0+Math.PI*2)%(Math.PI*2)), large=sweep>Math.PI?1:0;
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}`,
    "Z"
  ].join(", ");
}

/** map wedge degrees */
export function computeDegrees(order: Fn[], wedgeDeg?: SizeSpec): Record<Fn, number> {
  const src = wedgeDeg && Object.keys(wedgeDeg).length ? wedgeDeg : WEDGE_DEGREES;
  const out: Record<Fn, number> = {} as any;
  for (const f of order) out[f] = Math.max(0, src[f] ?? 0);
  return out;
}

/** Build all wedge segments for current rotation offset */
export function computeLayout(cx:number, cy:number, r:number, rotationOffset:number){
  const EPS=1e-6;
  const degByFn = computeDegrees(WEDGE_ORDER, WEDGE_DEGREES);
  const segs: Array<{
    fn:Fn; startTop:number; endTop:number; span:number; midTop:number;
    labelPos:{x:number;y:number}; path:string
  }> = [];

  const baseLabelR=(span:number)=> r*(span<24?RING_OUTER_R-0.10:RING_OUTER_R-0.14);
  const inwardPx: Partial<Record<Fn, number>> = { ii:10, "V/V":8, iii:6 };

  const makeSeg=(startTop:number,span:number,fn:Fn)=>{
    const s=(startTop + WEDGE_GAP_DEG/2 + 360)%360;
    const e=(startTop + Math.max(0,span - WEDGE_GAP_DEG) + 360)%360;
    const spanCW=(e-s+360)%360;
    const mid=(s+spanCW/2)%360;
    const rAdj=baseLabelR(span)-(inwardPx[fn]??0);
    const lp=polar(cx,cy,rAdj, mid+rotationOffset);
    const path=annulusTopDegree(cx,cy, r*RING_OUTER_R, r*RING_INNER_R, s+rotationOffset, e+rotationOffset);
    segs.push({fn, startTop:s, endTop:e, span:spanCW, midTop:mid, labelPos:lp, path});
  };

  const list=WEDGE_ORDER.map(fn=>{
    const span=Math.max(0,degByFn[fn]||0);
    const anchor=(WEDGE_ANCHOR_DEG[fn]??0+360)%360;
    const startNom=((anchor - span/2 + 360)%360);
    return {fn, anchor, span, startNom};
  }).sort((a,b)=>a.anchor-b.anchor);

  if(!list.length) return segs;
  let s0=list[0].startNom;
  makeSeg(s0,list[0].span,list[0].fn);
  for(let i=1;i<list.length;i++){
    const prev=list[i-1];
    const prevEnd = (s0 + prev.span + 360) % 360;
    let s = list[i].startNom;
    const gap = (s - prevEnd + 360) % 360;
    if(gap < EPS) s = prevEnd;
    makeSeg(s, list[i].span, list[i].fn);
    s0 = s;
  }
  return segs;
}
