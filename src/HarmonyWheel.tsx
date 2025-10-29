/*
 * HarmonyWheel.tsx — v2.37.13
 * 
 * CHANGES FROM v2.37.12:
 * - Adjusted label position further (moved up and left to avoid wedge overlap)
 * - Position changed from x=50, y=148/162 to x=30, y=120/134
 * 
 * CHANGES FROM v2.37.11:
 * - Moved "Beat Kitchen" and version label inside circle (upper left area)
 * - Repositioned from x=20, y=18/34 to x=50, y=148/162 for better visibility
 * 
 * CHANGES FROM v2.37.10:
 * - FIXED: All dim7 chords now use lowest-note naming from theory.ts
 * - Removed hardcoded "F#dim7", "G#dim7", "Bdim7" (lines 865-867)
 * - ALL dim7 chords now correctly display using absName (Ddim7, Adim7, etc.)
 * - C#dim7 family still uses A7 bonus overlay but displays correct chord name
 * 
 * CHANGES FROM v2.37.9:
 * - Fixed C#dim family showing as "A7" in hub (now shows correct chord names)
 * - C#dim, C#dim7, C#m7♭5 now display their actual names while still lighting A7 wedge
 * - Works with strengthened dim7 detection in theory.ts v2.37.10
 * 
 * CHANGES FROM v2.37.8:
 * - Fixed Bdim7 identification bug (was showing as "G#dim7")
 * - Added Bdim7 → V (G7) wedge mapping (special case exception)
 * - Updated internalAbsoluteName() call to pass MIDI notes array
 * - Hub now correctly displays "Bdim7" when B-D-F-Ab is played
 * 
 * PREVIOUS (v2.37.7):
 * - Keeps your v2.29.x behavior, SUB Gm7 debounce, bonus overlays, etc.
 * - Fixes: center label legibility; guitar tab now updates from active wedge;
 *          input/keyboard/guitar are aligned; buttons stack above tab.
 * - Adds: arrow-key nav for the input; consistent layout grid.
 * - Relies on your existing ./lib/* and ./components/GuitarTab files.
 * 
 * MODIFIED BY: Claude AI for Nathan Rosenberg / Beat Kitchen
 * DATE: October 29, 2025
 */

// Prefer ii (Gm/Gm7) over ♭VII (Bb) when Bb triad co-occurs with G/Gm context
function preferIiOverFlatVII(S: Set<number>): boolean {
  const hasAll = (ns: number[]) => ns.every(n => S.has(n));
  const hasBbTriad = hasAll([10, 2, 5]);   // Bb–D–F
  const hasGm      = hasAll([7, 10, 2]);   // G–Bb–D
  const hasG       = S.has(7);             // G present
  const DIM_OPACITY = 0.32;  // tweak 0..1

  return hasBbTriad && (hasGm || hasG);
}
// HarmonyWheel.tsx — v2.37.7 (drop-in)
// - Keeps your v2.29.x behavior, SUB Gm7 debounce, bonus overlays, etc.
// - Fixes: center label legibility; guitar tab now updates from active wedge;
//          input/keyboard/guitar are aligned; buttons stack above tab.
// - Adds: arrow-key nav for the input; consistent layout grid.
// - Relies on your existing ./lib/* and ./components/GuitarTab files.

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Fn, KeyName } from "./lib/types";
import {
  FN_COLORS, FN_LABEL_COLORS, HUB_RADIUS, HUB_FILL, HUB_STROKE, HUB_STROKE_W,
  CENTER_FONT_FAMILY, CENTER_FONT_SIZE, CENTER_FILL,
  WHEEL_W, WHEEL_H, VISITOR_ROTATE_DEG, ROTATION_ANIM_MS,
  NEGATIVE_ON_VISITOR, EPS_DEG, BONUS_OVERLAY, BONUS_CENTER_ANCHOR_DEG,
  BONUS_OUTER_R, BONUS_OUTER_OVER, BONUS_INNER_R, BONUS_FILL, BONUS_STROKE,
  BONUS_TEXT_FILL, BONUS_TEXT_SIZE, BONUS_FUNCTION_BY_LABEL, SHOW_WEDGE_LABELS,
  SHOW_CENTER_LABEL, LATCH_PREVIEW, PREVIEW_USE_SEVENTHS, MIDI_SUPPORTED,
  RING_FADE_MS, UI_SCALE_DEFAULT, KBD_WIDTH_FRACTION, KBD_HEIGHT_FACTOR_DEFAULT,
  IV_ROTATE_DEG,
  // v3 layout/animation knobs
  DIM_FADE_MS, JIGGLE_DEG, JIGGLE_MS, BONUS_DEBOUNCE_MS,
  KEYBOARD_WIDTH_FRACTION, GUITAR_TAB_WIDTH_FRACTION
} from "./lib/config";

import GuitarTab from "./components/GuitarTab";

import { computeLayout, annulusTopDegree } from "./lib/geometry";
import {
  pcFromMidi, pcNameForKey, FLAT_NAMES, NAME_TO_PC, T, subsetOf,
  internalAbsoluteName, mapDimRootToFn_ByBottom, mapDim7_EbVisitor, add12,
  realizeFunction
} from "./lib/theory";
import {
  VISITOR_SHAPES, C_REQ7, C_REQT, EB_REQ7, EB_REQT, firstMatch
} from "./lib/modes";
import { BonusDebouncer } from "./lib/overlays";
import * as preview from "./lib/preview";
const HW_VERSION = 'HarmonyWheel v2.37.13'; // Adjusted label position + comprehensive guitar tab chords
const PALETTE_ACCENT_GREEN = '#7CFF4F'; // palette green for active outlines

import { DIM_OPACITY } from "./lib/config";



export default function HarmonyWheel(){
  /* ---------- Core state ---------- */
  const [baseKey,setBaseKey]=useState<KeyName>("C");
  

// --- Auto-clear bonus overlays so base wedges return to full color on release
useEffect(() => {
  const clear = () => {
    try {
      setBonusActive(false); setBonusLabel && setBonusLabel("");
    } catch {}
  };
  window.addEventListener("keyup", clear);
  window.addEventListener("pointerup", clear);
  window.addEventListener("mouseup", clear);
  window.addEventListener("touchend", clear);
  return () => {
    window.removeEventListener("keyup", clear);
    window.removeEventListener("pointerup", clear);
    window.removeEventListener("mouseup", clear);
    window.removeEventListener("touchend", clear);
  };
}, []);
const baseKeyRef=useRef<KeyName>("C"); useEffect(()=>{baseKeyRef.current=baseKey;},[baseKey]);

  const [activeFn,setActiveFn]=useState<Fn|"">("I");
  const activeFnRef=useRef<Fn|"">("I"); useEffect(()=>{activeFnRef.current=activeFn;},[activeFn]);

  const [centerLabel,setCenterLabel]=useState("C");

  const [visitorActive,_setVisitorActive]=useState(false);
  const visitorActiveRef=useRef(false);
  const setVisitorActive=(v:boolean)=>{ visitorActiveRef.current=v; _setVisitorActive(v); };

  const [relMinorActive,_setRelMinorActive]=useState(false);
  const relMinorActiveRef=useRef(false);
  const setRelMinorActive=(v:boolean)=>{ relMinorActiveRef.current=v; _setRelMinorActive(v); };

  // SUB (F)
  const [subdomActive,_setSubdomActive]=useState(false);
  const subdomActiveRef=useRef(false);
  const setSubdomActive=(v:boolean)=>{ subdomActiveRef.current=v; _setSubdomActive(v); };
  const subdomLatchedRef = useRef(false);
  const subLastSeenFnRef = useRef<Fn>("I");
  const subExitCandidateSinceRef = useRef<number | null>(null);
  const subHasSpunRef = useRef(false);

  // windows/suppression
  const RECENT_PC_WINDOW_MS = 360;
  const recentRelMapRef = useRef<Map<number, number>>(new Map());
  const lastPcsRelSizeRef = useRef<number>(0);
  const homeSuppressUntilRef = useRef(0);
  const subHoldUntilRef = useRef<number>(0);
  const justExitedSubRef = useRef(false);

  const [rotationOffset,setRotationOffset]=useState(0);
  const [targetRotation,setTargetRotation]=useState(0);

  /* ---------- Rotation animation ---------- */
  const animRef=useRef<{from:number;to:number;start:number;dur:number;raf:number|null}|null>(null);
  const ease=(t:number)=> t<0.5?2*t*t:-1+(4-2*t)*t;
  useEffect(()=>{ if(animRef.current?.raf) cancelAnimationFrame(animRef.current.raf);},[]);
  useEffect(()=>{
    if(animRef.current?.raf) cancelAnimationFrame(animRef.current.raf);
    const from = rotationOffset, to = targetRotation;
    if(Math.abs(from - to) < EPS_DEG){ setRotationOffset(to); animRef.current = null; return; }
    const a = { from, to, start: performance.now(), dur: ROTATION_ANIM_MS, raf: 0 as unknown as number };
    animRef.current = a as any;
    const tick=()=>{ const k=Math.min(1,(performance.now()-a.start)/a.dur);
      setRotationOffset(a.from + (a.to - a.from) * ease(k));
      if(k<1){ a.raf=requestAnimationFrame(tick);} else { animRef.current=null; setRotationOffset(to); }
    };
    a.raf=requestAnimationFrame(tick);
    return ()=>{ if(a.raf) cancelAnimationFrame(a.raf); };
  },[targetRotation]);

  // Regular rotation (relative/parallel). SUB doesn’t hold persistent rotation.
  useEffect(()=>{
    if(relMinorActive || visitorActive) setTargetRotation(VISITOR_ROTATE_DEG);
    else if(!subdomActive) setTargetRotation(0);
  },[relMinorActive, visitorActive, subdomActive]);

  /* ---------- Bonus + trails ---------- */
  const [bonusActive,setBonusActive]=useState(false);
  const [bonusLabel,setBonusLabel]=useState("");
  const bonusDeb = useRef(new BonusDebouncer()).current;

  const [trailFn, setTrailFn] = useState<Fn|"">("");
  const [trailTick, setTrailTick] = useState(0);
  const [trailOn] = useState(true);
  useEffect(()=>{ if(!trailFn) return;
    let raf:number; const start=performance.now();
    const loop=()=>{ const dt=performance.now()-start;
      if(dt<RING_FADE_MS){ setTrailTick(dt); raf=requestAnimationFrame(loop); }
      else { setTrailFn(""); setTrailTick(0);}
    };
    raf=requestAnimationFrame(loop);
    return ()=>{ if(raf) cancelAnimationFrame(raf); };
  },[trailFn]);

  const [bonusTrailOn, setBonusTrailOn] = useState(false);
  const [bonusTrailTick, setBonusTrailTick] = useState(0);
  const lastBonusGeomRef = useRef<{a0Top:number;a1Top:number}|null>(null);

  /* ---------- MIDI ---------- */
  const midiAccessRef=useRef<any>(null);
  const [inputs, setInputs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const rightHeld=useRef<Set<number>>(new Set());
  const rightSus=useRef<Set<number>>(new Set());
  const leftHeld=useRef<Set<number>>(new Set());
  const sustainOn=useRef(false);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiName, setMidiName] = useState("");

  const [latchedAbsNotes, setLatchedAbsNotes] = useState<number[]>([]);
  const lastInputWasPreviewRef = useRef(false);

  const lastMidiEventRef = useRef<"on"|"off"|"cc"|"other">("other");


  const bindToInput=(id:string, acc:any)=>{
    acc.inputs.forEach((i:any)=>{ i.onmidimessage=null; });
    const dev = acc.inputs.get(id);
    if(!dev){ setSelectedId(""); setMidiConnected(false); setMidiName(""); return; }
    dev.onmidimessage=(e:any)=>{
      setMidiConnected(true); setMidiName(dev.name||"MIDI");
      lastInputWasPreviewRef.current = false;
      const [st,d1,d2]=e.data, type=st&0xf0;


if (type===0x90 && d2>0) {
  lastMidiEventRef.current = "on";
  if (d1<=48){
    leftHeld.current.add(d1);
    const lowest = Math.min(...leftHeld.current);
    const k = pcNameForKey(pcFromMidi(lowest), "C") as KeyName;
    setBaseKey(k);
  } else {
    rightHeld.current.add(d1);
    if (sustainOn.current) rightSus.current.add(d1);
  }
  detect();
} else if (type===0x80 || (type===0x90 && d2===0)) {
  lastMidiEventRef.current = "off";
  if (d1<=48) leftHeld.current.delete(d1);
  else { rightHeld.current.delete(d1); rightSus.current.delete(d1); }
  detect();
} else if (type===0xB0 && d1===64) {
  lastMidiEventRef.current = "cc";
  const on = d2>=64;
  if (!on && sustainOn.current){
    for (const n of Array.from(rightSus.current))
      if (!rightHeld.current.has(n)) rightSus.current.delete(n);
    sustainOn.current = false;
    detect();
  } else if (on && !sustainOn.current){
    sustainOn.current = true;
    for (const n of rightHeld.current) rightSus.current.add(n);
  }
}



    };
    setSelectedId(id); setMidiConnected(true); setMidiName(dev.name||"MIDI");
  };

  useEffect(()=>{ if(!MIDI_SUPPORTED || midiAccessRef.current) return;
    (async()=>{
      try{
        const acc:any=await (navigator as any).requestMIDIAccess({sysex:false});
        midiAccessRef.current=acc;
        const list=Array.from(acc.inputs.values());
        setInputs(list as any[]);
        if(list.length>0){ bindToInput((list[0] as any).id, acc); } else { setMidiConnected(false); setMidiName(""); }
        acc.onstatechange=()=>{
          const fresh=Array.from(acc.inputs.values());
          setInputs(fresh as any[]);
          if(selectedId && !fresh.find((i:any)=>i.id===selectedId)){
            if(fresh[0]) bindToInput((fresh[0] as any).id, acc);
            else { setSelectedId(""); setMidiConnected(false); setMidiName(""); }
          }
        };
      }catch{/* ignore */}
    })();
  },[selectedId]);

  /* ---------- v3: Sequence / input ---------- */
  const [inputText, setInputText] = useState("");
  type SeqItem = { kind: "chord" | "modifier" | "comment"; raw: string; chord?: string; comment?: string; };
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [seqIndex, setSeqIndex] = useState(-1);
  const activeComment = (seqIndex>=0 && sequence[seqIndex]?.comment) ? sequence[seqIndex]!.comment! : "";

  const parseAndLoadSequence = ()=>{
    const tokens = inputText.split(",").map(t=>t.trim()).filter(Boolean);
    const items: SeqItem[] = tokens.map(tok=>{
      if (tok.startsWith("#")) return { kind:"comment", raw:tok, comment: tok.slice(1).trim() };
      if (tok.startsWith("@")) {
        const [cmd, ...rest] = tok.slice(1).trim().split(/\s+/);
        const arg = rest.join(" ");
        const upper = (cmd||"").toUpperCase();
        return { kind:"modifier", raw:tok, chord: `${upper}:${arg}` };
      }
      return { kind:"chord", raw:tok, chord: tok };
    });
    setSequence(items);
    setSeqIndex(items.length ? 0 : -1);
    if (items.length) applySeqItem(items[0]);
  };

  const stepPrev = ()=>{
    if (!sequence.length) return;
    const i = Math.max(0, (seqIndex<=0 ? 0 : seqIndex-1));
    setSeqIndex(i); applySeqItem(sequence[i]);
  };
  const stepNext = ()=>{
    if (!sequence.length) return;
    const i = Math.min(sequence.length-1, (seqIndex<0 ? 0 : seqIndex+1));
    setSeqIndex(i); applySeqItem(sequence[i]);
  };
  const handleInputKeyNav: React.KeyboardEventHandler<HTMLTextAreaElement> = (e)=>{
    if (e.key==="ArrowLeft"){ e.preventDefault(); stepPrev(); }
    if (e.key==="ArrowRight"){ e.preventDefault(); stepNext(); }
  };

  const applySeqItem = (it: SeqItem)=>{
    if (it.kind==="comment") return;
    if (it.kind==="modifier" && it.chord){
      const m = it.chord.split(":")[0];
      if (m==="SUB"){ if(!subdomActiveRef.current) toggleSubdom(); }
      else if (m==="REL"){ if(!relMinorActiveRef.current) toggleRelMinor(); }
      else if (m==="PAR"){ if(!visitorActiveRef.current) toggleVisitor(); }
      else if (m==="KEY"){ /* reserved */ }
      return;
    }
    if (it.kind==="chord" && it.chord){
      centerOnly(it.chord);
    }
  };

  /* ---------- layout & bonus geometry ---------- */
  const cx=260, cy=260, r=220;
  const layout = useMemo(()=> computeLayout(cx,cy,r,rotationOffset), [rotationOffset]);

  const bonusArcGeom = useMemo(()=>{
    const segI = layout.find(s=>s.fn==="I");
    const segB7 = layout.find(s=>s.fn==="♭VII");
    if(!segI || !segB7) return null;
    const g = rotationOffset, norm=(d:number)=>(d%360+360)%360;
    const startGap = norm(segB7.endTop);
    const endGap = norm(segI.startTop);
    const gapCW = norm(endGap - startGap);
    const centerTop = (BONUS_OVERLAY && BONUS_CENTER_ANCHOR_DEG != null) ? norm(BONUS_CENTER_ANCHOR_DEG) : norm(startGap + gapCW/2);
    const span = 15, half = span/2;
    const a0Top = norm(centerTop - half + g);
    const a1Top = norm(centerTop + half + g);
    const midTop = norm(centerTop + g);
    const outerAbs = Math.max(r*BONUS_OUTER_R, r*BONUS_OUTER_OVER);
    const innerAbs = r*BONUS_INNER_R;
    const rMid=(outerAbs+innerAbs)/2, rad=((midTop-90)*Math.PI)/180;
    const labelPos={x:cx + rMid*Math.cos(rad), y: cy + rMid*Math.sin(rad)};
    return { a0Top, a1Top, labelPos };
  },[layout, rotationOffset]);

  useEffect(()=>{ if(bonusActive && bonusArcGeom){
    lastBonusGeomRef.current = { a0Top: bonusArcGeom.a0Top, a1Top: bonusArcGeom.a1Top };
  }}, [bonusActive, bonusArcGeom]);

  useEffect(()=>{ if(!bonusActive && lastBonusGeomRef.current){
    let raf:number; const start=performance.now();
    setBonusTrailOn(true);
    const loop=()=>{ const dt=performance.now()-start;
      if(dt<RING_FADE_MS){ setBonusTrailTick(dt); raf=requestAnimationFrame(loop); }
      else { setBonusTrailOn(false); setBonusTrailTick(0); }
    };
    raf=requestAnimationFrame(loop);
    return ()=>{ if(raf) cancelAnimationFrame(raf); };
  }}, [bonusActive]);

  /* ---------- taps ---------- */
  const TAP_MS = 1500, TRIPLE_COUNT = 3;
  const TAP_LOG_REF = { current: {} as Record<string, number[]> } as const;
  const TAP_STATE_REF = { current: { REL_Am:false, REL_C:false, VIS_G:false } as Record<string, boolean> } as const;
  const pushTap = (name:string)=>{ const now=performance.now(); const arr=(TAP_LOG_REF.current[name] ||= []); arr.push(now); while(arr.length && now-arr[0]>TAP_MS) arr.shift(); return arr.length; };
  const setTapEdge = (name:string, present:boolean)=>{ const prev=!!TAP_STATE_REF.current[name]; if(present && !prev){ const n=pushTap(name); TAP_STATE_REF.current[name]=true; return n; } if(!present && prev){ TAP_STATE_REF.current[name]=false; } return 0; };

  /* ---------- Trails + center helpers ---------- */
  const makeTrail=()=>{ if(activeFnRef.current){ setTrailFn(activeFnRef.current as Fn); } };
  const stopDimFade = ()=>{
    if (dimFadeRafRef.current != null) cancelAnimationFrame(dimFadeRafRef.current);
    dimFadeRafRef.current = null; setDimFadeOn(false); setDimFadeTick(0);
  };
  const startDimFade = ()=>{
    stopDimFade(); setDimFadeOn(true);
    const start = performance.now();
    const tick = ()=>{
      const dt = performance.now() - start;
      if (dt < DIM_FADE_MS){ setDimFadeTick(dt); dimFadeRafRef.current = requestAnimationFrame(tick); }
      else { setDimFadeTick(DIM_FADE_MS); stopDimFade(); }
    };
    dimFadeRafRef.current = requestAnimationFrame(tick);
  };

  const setActiveWithTrail=(fn:Fn,label:string)=>{ 
    if(activeFnRef.current && activeFnRef.current!==fn){ makeTrail(); } 
    setActiveFn(fn); setCenterLabel(SHOW_CENTER_LABEL?label:"" ); 
    setBonusActive(false); setBonusLabel(""); 
    stopDimFade();
  };
  const centerOnly=(t:string)=>{ 
    makeTrail(); 
    if (activeFnRef.current) startDimFade();
    setActiveFn(""); setCenterLabel(SHOW_CENTER_LABEL?t:""); 
    setBonusActive(false); setBonusLabel(""); 
  };

  const hardClearGhostIfIdle = ()=>{
    if(rightHeld.current.size===0 && rightSus.current.size===0){
      if(!lastInputWasPreviewRef.current) setLatchedAbsNotes([]);
    }
  };
  const clear=()=>{ 
    makeTrail(); hardClearGhostIfIdle(); 
    if (activeFnRef.current) startDimFade();
    setBonusActive(false); setBonusLabel(""); setCenterLabel(""); 
    setActiveFn("");
  };

  /* ---------- SUB spin + jiggle ---------- */
  const subSpinTimerRef = useRef<number | null>(null);
  const clearSubSpinTimer = ()=>{ if(subSpinTimerRef.current!=null){ window.clearTimeout(subSpinTimerRef.current); subSpinTimerRef.current=null; } };
  const SUB_SPIN_DEG = Math.abs(IV_ROTATE_DEG || 168);

  const subJiggleExit = ()=>{
    setTimeout(()=> setTargetRotation(JIGGLE_DEG), 10);
    setTimeout(()=> setTargetRotation(-JIGGLE_DEG), 10 + JIGGLE_MS);
    setTimeout(()=> setTargetRotation(0), 10 + 2*JIGGLE_MS);
  };

  const subSpinEnter = ()=>{
    if (subHasSpunRef.current) return;
    clearSubSpinTimer();
    setTargetRotation(IV_ROTATE_DEG ?? -168);
    subSpinTimerRef.current = window.setTimeout(()=>{
      setRotationOffset(0); setTargetRotation(0);
      subSpinTimerRef.current = null; subHasSpunRef.current = true;
    }, ROTATION_ANIM_MS + 20) as unknown as number;
  };
  const subSpinExit = ()=>{
    clearSubSpinTimer();
    setTargetRotation(SUB_SPIN_DEG);
    subSpinTimerRef.current = window.setTimeout(()=>{
      setRotationOffset(0); setTargetRotation(0);
      subSpinTimerRef.current = null; subHasSpunRef.current = false;
      subJiggleExit();
    }, ROTATION_ANIM_MS + 20) as unknown as number;
  };
  const subLatch = (fn: Fn)=>{
    subdomLatchedRef.current = true;
    subExitCandidateSinceRef.current = null;
    subLastSeenFnRef.current = fn;
    homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
  };

  /* ---------- window helpers (SUB only) ---------- */
  const updateRecentRel = (pcsRel:Set<number>)=>{
    const now = performance.now();
    const delta = Math.abs((pcsRel.size || 0) - (lastPcsRelSizeRef.current || 0));
    if (delta >= 2) recentRelMapRef.current.clear();
    lastPcsRelSizeRef.current = pcsRel.size;

    for(const [pc,ts] of recentRelMapRef.current){
      if(now - ts > RECENT_PC_WINDOW_MS) recentRelMapRef.current.delete(pc);
    }
    pcsRel.forEach(pc => recentRelMapRef.current.set(pc, now));
  };
  const windowedRelSet = ():Set<number>=>{
    const now = performance.now();
    const out = new Set<number>();
    for(const [pc,ts] of recentRelMapRef.current){
      if(now - ts <= RECENT_PC_WINDOW_MS) out.add(pc);
    }
    return out;
  };
  const isSubsetIn = (need:number[], pool:Set<number>) => subsetOf(T(need), pool);
  const exactSetIn = (need:number[], pool:Set<number>) => {
    const needSet = T(need); if(!subsetOf(needSet, pool)) return false;
    for(const p of pool) if(!needSet.has(p)) return false;
    return true;
  };

  /* ---------- detection ---------- */
  const SUB_EXIT_DEBOUNCE_MS = 420;

  // protect C7 / Fmaj7 / Gm7 while in SUB from release-order bounces
  const PROTECT_SUPERSETS: Array<Set<number>> = [
    T([5,9,0,4]),    // Fmaj7
    T([0,4,7,10]),   // C7
    T([7,10,2,5]),   // Gm7
  ];
  const within = (pool:Set<number>, sup:Set<number>)=>{
    for(const p of pool) if(!sup.has(p)) return false;
    return true;
  };
  const protectedSubset = (current:Set<number>)=>{
    if(current.size < 3) return false;
    for(const sup of PROTECT_SUPERSETS) if(within(current, sup)) return true;
    return false;
  };

  const findDim7Root = (S:Set<number>): number | null => {
    for (let pc=0; pc<12; pc++){
      if (S.has(pc) && S.has((pc+3)%12) && S.has((pc+6)%12) && S.has((pc+9)%12)) return pc;
    }
    return null;
  };

  const detectDisplayTriadLabel = (pcsRel:Set<number>, _key:KeyName): string | null => {
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    const norm = (x:number)=>((x%12)+12)%12;
    for (let root=0; root<12; root++){
      const sus2 = [root, norm(root+2), norm(root+7)];
      if (sus2.every(p=>pcsRel.has(p))) return `${names[root]}sus2`;
      const sus4 = [root, norm(root+5), norm(root+7)];
      if (sus4.every(p=>pcsRel.has(p))) return `${names[root]}sus4`;
      const aug  = [root, norm(root+4), norm(root+8)];
      if (aug.every(p=>pcsRel.has(p))) return `${names[root]}aug`;
    }
    return null;
  };

  const bdimTimerRef = useRef<number | null>(null);
  const clearBdimTimer = ()=>{ if (bdimTimerRef.current!=null){ window.clearTimeout(bdimTimerRef.current); bdimTimerRef.current=null; } };

  function detect(){

    const evt = lastMidiEventRef.current;
    const isNoteOn  = (evt === "on");
    const isNoteOff = (evt === "off");

    const phys=[...rightHeld.current], sus=sustainOn.current?[...rightSus.current]:[], merged=new Set<number>([...phys,...sus]);
    const absHeld=[...merged];
    const pcsAbs=new Set(absHeld.map(pcFromMidi));

    if(pcsAbs.size===0){
      setTapEdge("REL_Am", false); setTapEdge("REL_C", false); setTapEdge("VIS_G", false);
      bonusDeb.reset();

      if (subdomActiveRef.current && subdomLatchedRef.current) {
        if (!centerLabel) setCenterLabel("F");
        if (!activeFnRef.current) setActiveFn(subLastSeenFnRef.current || "I");
        hardClearGhostIfIdle();
        return;
      }
      hardClearGhostIfIdle();
      return clear();
    }

    setLatchedAbsNotes(absHeld);

    const toRel=(n:number)=>((n-NAME_TO_PC["C"]+12)%12);
    const pcsRel=new Set([...pcsAbs].map(toRel));
    // MODIFIED v2.37.9: Pass absHeld array to internalAbsoluteName for dim7 root disambiguation
    const absName=internalAbsoluteName(pcsAbs, baseKeyRef.current, absHeld);

    updateRecentRel(pcsRel);

    const isSubset = (need:number[])=> subsetOf(T(need), pcsRel);
    const exactSet=(need:number[])=>{
      const needSet=T(need); if(!subsetOf(needSet, pcsRel)) return false;
      for(const p of pcsRel) if(!needSet.has(p)) return false;
      return true;
    };

    const amPresent = isSubset([9,0,4]) || isSubset([9,0,4,2]);
    const cPresent  = isSubset([0,4,7]) || isSubset([0,4,7,11]);

    // ---------- triple-taps ----------
    if (isNoteOn) {
    if(setTapEdge("REL_Am", amPresent) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setRelMinorActive(true); setVisitorActive(false);
      setActiveWithTrail("vi", absName || "Am"); return;
    }
    if(setTapEdge("REL_C", cPresent) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setRelMinorActive(false); setVisitorActive(false);
      setActiveWithTrail("I", absName || "C"); setCenterLabel("C"); return;
    }
    const gPresentTap = visitorActiveRef.current && (isSubset([7,11,2]) || isSubset([7,11,2,5]));
    // Unconditional V7 detection: if G7 present anywhere, drive V wedge
    if (!visitorActiveRef.current && (isSubset([7,11,2,5]))) {
      if (subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G7"); return;
    }

    if(setTapEdge("VIS_G", gPresentTap) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G/G7"); return;
    }
    }

    /* ---------- BONUS OVERLAYS ---------- */
    {
      const inParallel = visitorActiveRef.current;

      const isFullDim7 = (() => {
        const r = findDim7Root(pcsRel);
        return r !== null;
      })();

      // ========== NEW v2.37.9: Bdim7 special case ==========
      // Bdim7 (B-D-F-Ab) should map to V (G7) wedge, NOT to ii/vi bonus overlay
      // This is a functional exception: Bdim7 acts as dominant substitute
      const hasBdim7 = isSubset([11,2,5,8]) && pcsRel.size === 4 && isFullDim7;
      if (!inParallel && hasBdim7 && absName === "Bdim7") {
        // Light the V7 wedge, display "Bdim7" in hub
        setActiveFn("V7"); 
        setCenterLabel("Bdim7");
        setBonusActive(false);  // Don't use bonus overlay
        return;
      }
      // ========== END NEW v2.37.9 ==========

      const hasBDF   = isSubset([11,2,5]);
      const hasBDFG  = isSubset([11,2,5,9]);
      if (!inParallel && !isFullDim7 && (hasBDF || hasBDFG)){
        clearBdimTimer();
        bdimTimerRef.current = window.setTimeout(()=>{
          setActiveFn(""); setCenterLabel(hasBDFG ? "Bm7♭5" : "Bdim");
          setBonusActive(true); setBonusLabel(hasBDFG ? "Bm7♭5" : "Bdim");
        }, BONUS_DEBOUNCE_MS) as unknown as number;
        return;
      } else {
        clearBdimTimer();
      }

      const hasCsharpDimTri  = isSubset([1,4,7]);
      const hasCsharpHalfDim = isSubset([1,4,7,11]);
      const isCsharpFullDim7 = (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12));
      if (!inParallel && (hasCsharpDimTri || hasCsharpHalfDim || isCsharpFullDim7)){
        // MODIFIED v2.37.10: Use actual chord name instead of hardcoding "A7"
        // The chord identifier now correctly names these (C#dim, C#dim7, C#m7♭5)
        // They still light the A7 bonus wedge (correct functional behavior)
        setActiveFn(""); 
        setCenterLabel(absName || "A7");  // Use absName, fallback to A7 if needed
        setBonusActive(true); 
        setBonusLabel("A7");  // Wedge label stays "A7" (functional label)
        return;
      }

      const hasA7tri = isSubset([9,1,4]);
      const hasA7    = hasA7tri || isSubset([9,1,4,7]);
      if (hasA7){
        setActiveFn(""); setCenterLabel("A7");
        setBonusActive(true); setBonusLabel("A7");
        return;
      }

      setBonusActive(false); setBonusLabel("");
    }

    /* ---------- SUBDOM (F) ---------- */
    {
      const enterByGm = isSubset([7,10,2]) || isSubset([7,10,2,5]);
      const enterByC7 = isSubset([0,4,7,10]);

      if (!subdomActiveRef.current && isNoteOn && (enterByGm || enterByC7)) {

        if (relMinorActiveRef.current) setRelMinorActive(false);
        setVisitorActive(false);

        setSubdomActive(true);
        setCenterLabel("F");
        if (enterByGm) { setActiveWithTrail("ii", absName || (isSubset([7,10,2,5])?"Gm7":"Gm")); subLatch("ii"); }
        else           { setActiveWithTrail("V7", absName || "C7");                               subLatch("V7"); }
        subSpinEnter();
        return;
      }

      if (subdomActiveRef.current) {
        // Ignore mode transitions on note-off while in SUB; keep latch fresh.
        if (isNoteOff) {
           homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
           // Keep current fn/label; prevents Gm/Gm7 bounce on release.
              return;
            }
        const useWindow = performance.now() < homeSuppressUntilRef.current;
        const S = useWindow ? windowedRelSet() : pcsRel;
        // Strong jiggle guard: brief hold + prioritize ii(Gm/Gm7) over bVII(Bb)
        const now = performance.now();
        if (now < subHoldUntilRef.current) {
          // During hold window, refuse to exit SUB
          return;
        }
        // If Bb triad present alongside G (i.e., Gm/Gm7 context), stay on ii
        if (preferIiOverFlatVII(S) || isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S)) {
          subLatch("ii");
          setActiveWithTrail("ii", isSubsetIn([7,10,2,5], S) ? "Gm7" : "Gm");
          subHoldUntilRef.current = now + 220; // short anti-bounce hold
          return;
        }


        const bbTri   = isSubsetIn([10,2,5], S);
        const bb7     = isSubsetIn([10,2,5,8], S);

        const bbMaj7Exact = exactSetIn([10,2,5,9], S);
        if (bbMaj7Exact){
          setActiveWithTrail("IV","Bbmaj7"); subLatch("IV");
          return;
        }
        const bbmStay = isSubsetIn([10,1,5], S) || isSubsetIn([10,1,5,8], S);
        if (bbmStay){
          setActiveWithTrail("iv", isSubsetIn([10,1,5,8], S) ? "Bbm7" : "Bbm");
          subLatch("iv");
          return;
        }

        if (bbTri || bb7){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = 0;
          setActiveWithTrail("♭VII", absName || (bb7 ? "Bb7" : "Bb"));
          return;
        }

        const eb   = isSubsetIn([3,7,10], S) || isSubsetIn([3,7,10,2], S);
        const ab   = isSubsetIn([8,0,3], S) || isSubsetIn([8,0,3,6], S);
        const db   = isSubsetIn([1,5,8], S) || isSubsetIn([1,5,8,11], S);
        if (eb || ab || db){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setRelMinorActive(false);
          setVisitorActive(true);
          const m7 = firstMatch(EB_REQ7, pcsRel);
          if (m7){ setActiveWithTrail(m7.f as Fn, m7.n); return; }
          const tri = firstMatch(EB_REQT, pcsRel);
          if (tri){ setActiveWithTrail(tri.f as Fn, tri.n); return; }
          setActiveWithTrail("I","Eb");
          return;
        }

        const dm   = isSubsetIn([2,5,9], S) || isSubsetIn([2,5,9,0], S);
        const am   = isSubsetIn([9,0,4], S) || isSubsetIn([9,0,4,7], S);
        const em   = isSubsetIn([4,7,11], S) || isSubsetIn([4,7,11,2], S);
        const d7   = isSubsetIn([2,6,9,0], S);
        const e7   = isSubsetIn([4,8,11,2], S);

        if (dm || am || em || d7 || e7){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = 0;

          if (dm){ setActiveWithTrail("ii",  absName || (isSubsetIn([2,5,9,0], S)?"Dm7":"Dm")); return; }
          if (am){ setActiveWithTrail("vi",  absName || (isSubsetIn([9,0,4,7], S)?"Am7":"Am")); return; }
          if (em){ setActiveWithTrail("iii", absName || (isSubsetIn([4,7,11,2], S)?"Em7":"Em")); return; }
          if (d7){ setActiveWithTrail("V/V", "D7"); return; }
          if (e7){ setActiveWithTrail("V/vi","E7"); return; }
        }

        if (subdomLatchedRef.current && S.size < 3) {
          homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
          return;
        }

        const stayOnF       = isSubsetIn([5,9,0], S) || isSubsetIn([5,9,0,4], S);
        const stayOnGm      = isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S);
        const stayOnC7      = isSubsetIn([0,4,7,10], S);
        const isCtriadExact = exactSetIn([0,4,7], S);

        const exitOnCmaj7 = isSubsetIn([0,4,7,11], S);
        const exitOnAm7   = exactSetIn([9,0,4,7], S);
        const exitOnDm    = isSubsetIn([2,5,9], S) || isSubsetIn([2,5,9,0], S);

        if (exitOnCmaj7 || exitOnAm7 || exitOnDm) {
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = performance.now() + 140;
          justExitedSubRef.current = true;
          return;
        }

        if (stayOnF || stayOnGm || stayOnC7 || isCtriadExact) {
          if (stayOnF)          { setActiveWithTrail("I",  absName || (isSubsetIn([5,9,0,4], S)?"Fmaj7":"F"));   subLatch("I"); }
          else if (stayOnGm)    { setActiveWithTrail("ii", absName || (isSubsetIn([7,10,2,5], S)?"Gm7":"Gm"));   subLatch("ii"); }
          else if (stayOnC7)    { setActiveWithTrail("V7", absName || "C7");                                     subLatch("V7"); }
          else                  { setActiveWithTrail("V7", absName || "C");                                      subLatch("V7"); }
          return;
        }

        if (protectedSubset(S)) { homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS; return; }
        const nowT = performance.now();
        if (subExitCandidateSinceRef.current==null) { subExitCandidateSinceRef.current = nowT; return; }
        if (nowT - subExitCandidateSinceRef.current < SUB_EXIT_DEBOUNCE_MS) return;

        subExitCandidateSinceRef.current = null;
        subdomLatchedRef.current = false;
        subSpinExit();
        setSubdomActive(false);
        setVisitorActive(false); setRelMinorActive(false);
        homeSuppressUntilRef.current = performance.now() + 140;
        justExitedSubRef.current = true;
        return;
      }
    }

    /* ---------- PARALLEL quick rule ---------- */
    if (visitorActiveRef.current && (isSubset([2,6,9,0]) || exactSet([2,6,9,0]))){
      setVisitorActive(false);
      setActiveWithTrail("V/V", "D7");
      return;
    }

    // Guard Fm7 exact in HOME
    if (!visitorActiveRef.current && !subdomActiveRef.current){
      if (exactSet([5,8,0,3])){ setRelMinorActive(false); setActiveWithTrail("iv","Fm7"); return; }
    }

    /* Enter Parallel (Eb) */
      if(isNoteOn && !visitorActiveRef.current && !subdomActiveRef.current){
      const vHit = VISITOR_SHAPES.find(v=>subsetOf(v.pcs, pcsRel)) || null;
      if(vHit){
        if(relMinorActiveRef.current) setRelMinorActive(false);
        setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
        setVisitorActive(true);
        setActiveWithTrail(vHit.fn, vHit.name);
        return;
      }
    }

    /* Parallel exits (Eb) */
    if(visitorActiveRef.current && !relMinorActiveRef.current){
      if(cPresent){ setVisitorActive(false); setActiveWithTrail("I", absName || "C"); return; }
      if(amPresent){ setVisitorActive(false); setActiveWithTrail("vi", absName || "Am"); return; }
      const fMaj   = isSubset([5,9,0]) || isSubset([5,9,0,4]);
      if (fMaj){
        setVisitorActive(false);
        setActiveWithTrail("IV", absName || (isSubset([5,9,0,4]) ? "Fmaj7" : "F"));
        return;
      }
    }

    if(!subdomActiveRef.current && exactSet([10,1,5,8])){ centerOnly("Bbm7"); return; }

    if(visitorActiveRef.current && (isSubset([2,5,9]) || isSubset([2,5,9,0]))){
      setVisitorActive(false); setActiveWithTrail("ii", absName || (isSubset([2,5,9,0])?"Dm7":"Dm")); return;
    }
    if(visitorActiveRef.current && (isSubset([4,7,11]) || isSubset([4,7,11,2]))){
      setVisitorActive(false); setActiveWithTrail("iii", absName || (isSubset([4,7,11,2])?"Em7":"Em")); return;
    }

    /* ---------- explicit dim7 mapping in HOME ---------- */
    if (!visitorActiveRef.current){
      const root = findDim7Root(pcsRel);
      if (root!==null){
        // ========== NEW v2.37.11: Use absName from theory.ts for ALL dim7 chords ==========
        // Previously hardcoded F#dim7, G#dim7, Bdim7 - now all use proper lowest-note naming
        
        // Special case: C#dim7 family uses A7 bonus overlay (not wedge)
        if (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12)){
          setActiveFn(""); setCenterLabel(absName || "C#dim7"); // Use absName, not hardcoded "A7"
          setBonusActive(true); setBonusLabel("A7");
          return;
        }
        
        // All other dim7 chords: use absName from theory.ts (which uses lowest note)
        const dimLabel = absName || `${["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"][root]}dim7`;
        const mapped = mapDimRootToFn_ByBottom(root) || "V7";
        setActiveWithTrail(mapped as Fn, dimLabel);
        return;
      }
    }

    /* In Eb mapping */
    if(visitorActiveRef.current){
      const m7 = firstMatch(EB_REQ7, pcsRel); if(m7){ setActiveWithTrail(m7.f as Fn, m7.n); return; }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(absName); return; }
      const tri = firstMatch(EB_REQT, pcsRel); if(tri){ setActiveWithTrail(tri.f as Fn, tri.n); return; }
    }

    /* In C mapping */
    if (performance.now() >= homeSuppressUntilRef.current){
      if (exactSet([6,9,0,4])){ setActiveWithTrail("V/V","F#m7♭5"); return; }
      const m7 = firstMatch(C_REQ7, pcsRel); if(m7){ setActiveWithTrail(m7.f as Fn, m7.n); return; }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(absName); return; }
      const tri = firstMatch(C_REQT, pcsRel); if(tri){ setActiveWithTrail(tri.f as Fn, tri.n); return; }
    }

    // diminished fallback by bottom note
    const rhs=absHeld.filter(n=>n>=48).sort((a,b)=>a-b);
    if(rhs.length>=3){
      const bottom=rhs[0], rootPc=pcFromMidi(bottom);
      const tri=T([rootPc, add12(rootPc,3), add12(rootPc,6)]);
      const sev=T([rootPc, add12(rootPc,3), add12(rootPc,6), add12(rootPc,9)]);
      const pcsRH=new Set(rhs.map(pcFromMidi));
      const has7=subsetOf(sev, pcsRH) , hasTri=subsetOf(tri, pcsRH);
      if(has7 || hasTri){
        const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
        const label=has7?`${names[rootPc]}dim7`:`${names[rootPc]}dim`;
        const mapped = visitorActiveRef.current ? (mapDim7_EbVisitor(pcsRel) || mapDimRootToFn_ByBottom(rootPc)) : mapDimRootToFn_ByBottom(rootPc);
        if(mapped){ setActiveWithTrail(mapped, label); return; }
        centerOnly(label); return;
      }
    }

    const triDisp = detectDisplayTriadLabel(pcsRel, baseKeyRef.current);
    centerOnly(triDisp || absName);
  }
  /* ---------- controls ---------- */
  const goHome = ()=>{
    if(subdomActiveRef.current) subSpinExit();
    setRelMinorActive(false);
    setVisitorActive(false);
    setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
    homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
    setTargetRotation(0);
    setActiveFn("I");
    setCenterLabel("C");
    stopDimFade();
  };
  const toggleVisitor = ()=>{
    const on = !visitorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && relMinorActiveRef.current) setRelMinorActive(false);
    setVisitorActive(on);
    if(on){ setActiveFn("I"); setCenterLabel("Eb"); stopDimFade(); }
  };
  const toggleRelMinor = ()=>{
    const on = !relMinorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && visitorActiveRef.current) setVisitorActive(false);
    setRelMinorActive(on);
    if(on){ setActiveFn("vi"); setCenterLabel("Am"); stopDimFade(); }
  };
  const toggleSubdom = ()=>{
    const on = !subdomActiveRef.current;
    if(on){
      setVisitorActive(false); setRelMinorActive(false);
      setSubdomActive(true);
      subdomLatchedRef.current = true;
      subExitCandidateSinceRef.current = null;
      subLastSeenFnRef.current = "I";
      homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
      setActiveFn("I"); setCenterLabel("F");
      subSpinEnter();
      stopDimFade();
    } else {
      subdomLatchedRef.current = false;
      subExitCandidateSinceRef.current = null;
      subSpinExit();
      setSubdomActive(false);
      homeSuppressUntilRef.current = performance.now() + 140;
      justExitedSubRef.current = true;
      setActiveFn("I"); setCenterLabel("C");
      stopDimFade();
    }
  };

  const wrapperStyle: React.CSSProperties = ((visitorActive || relMinorActive) && NEGATIVE_ON_VISITOR)
    ? { filter:"invert(1) hue-rotate(180deg)" } : {};

  const fnFillColor = (fn: Fn) =>
    (relMinorActive && fn === "V/V") ? FN_COLORS["IV"] : FN_COLORS[fn];

  const fnDisplay = (fn: Fn): string => (fn === "V/vi" ? "ii/vi" : fn);

  const [dimFadeTick, setDimFadeTick] = useState(0);
  const [dimFadeOn, setDimFadeOn] = useState(false);
  const dimFadeRafRef = useRef<number | null>(null);

  /* ---------- label key + center text style ---------- */
  const labelKey = (visitorActive ? "Eb" : (subdomActive ? "F" : baseKey)) as KeyName;
  const centerTextStyle: React.CSSProperties = {
    fontFamily: CENTER_FONT_FAMILY, paintOrder: "stroke", stroke: "#000", strokeWidth: 1.2 as any
  };

  /* ---------- wedges ---------- */
  const wedgeNodes = useMemo(()=>{
    const renderKey:KeyName = visitorActive ? "Eb" : baseKey;
    const dimK = Math.min(1, Math.max(0, dimFadeTick / DIM_FADE_MS));
    const fadedBase = 0.5 + 0.5 * dimK; // 0.5→1.0
    return layout.map(({fn,path,labelPos})=>{
      const isActive = activeFn===fn;
      const isTrailing = trailOn && (trailFn===fn);
      const k = isTrailing ? Math.min(1, Math.max(0, trailTick / RING_FADE_MS)) : 0;
      const globalActive = (activeFn!=="" || bonusActive); 
      const fillOpacity = isActive ? 1 : (globalActive ? 0.5 : (dimFadeOn ? fadedBase : 1));
      const ringTrailOpacity = 1 - 0.9*k; const ringTrailWidth = 5 - 3*k;
      return (
        <g key={fn} onMouseDown={()=>previewFn(fn)} style={{cursor:"pointer"}}>
          <path d={path} fill={fnFillColor(fn)} opacity={fillOpacity} stroke="#ffffff" strokeWidth={2}/>
          {isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={5} opacity={1} />}
          {isTrailing && !isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={ringTrailWidth} opacity={ringTrailOpacity} />}
          {SHOW_WEDGE_LABELS && (
            <text x={labelPos.x} y={labelPos.y-6} textAnchor="middle" fontSize={16}
              style={{ fill: FN_LABEL_COLORS[fn], fontWeight:600, paintOrder:"stroke", stroke:'#000', strokeWidth:0.9 }}>
              <tspan x={labelPos.x} dy={0}>{fnDisplay(fn)}</tspan>
              <tspan x={labelPos.x} dy={17} fontSize={13}>{realizeFunction(fn, labelKey)}</tspan>
            </text>
          )}
        </g>
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[layout, activeFn, trailFn, trailTick, trailOn, baseKey, visitorActive, relMinorActive, subdomActive, labelKey, dimFadeOn, dimFadeTick]);

  const activeBtnStyle = (on:boolean): React.CSSProperties =>
    ({padding:"6px 10px", border:"2px solid "+(on?"#39FF14":"#374151"), borderRadius:8, background:"#111", color:"#fff", cursor:"pointer"});

  /* ---------- Preview helper ---------- */
  const KBD_LOW=48, KBD_HIGH=71;
  const previewFn = (fn:Fn)=>{
    lastInputWasPreviewRef.current = true;
    const renderKey:KeyName = visitorActiveRef.current
      ? "Eb"
      : (subdomActiveRef.current ? "F" : baseKeyRef.current);
    const with7th = PREVIEW_USE_SEVENTHS || fn === "V7" || fn === "V/V" || fn === "V/vi";
    const pcs = preview.chordPcsForFn(fn, renderKey, with7th);
    const rootPc = pcs[0];
    const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
    const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
    setLatchedAbsNotes(fitted);
    setActiveWithTrail(fn, realizeFunction(fn, renderKey));
  };

  /* ---------- Render ---------- */
  const currentGuitarLabel = (() => {
    if (activeFnRef.current){
      const dispKey = (visitorActiveRef.current ? "Eb" : (subdomActiveRef.current ? "F" : baseKeyRef.current)) as KeyName;
      return realizeFunction(activeFnRef.current as Fn, dispKey);
    }
    return centerLabel || null;
  })();

  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:16, fontFamily:'ui-sans-serif, system-ui'}}>
      <div style={{maxWidth:960, margin:'0 auto', border:'1px solid #374151', borderRadius:12, padding:16}}>

        {/* Controls */}
        <div style={{display:'flex', gap:8, flexWrap:'nowrap', alignItems:'center', justifyContent:'space-between', overflowX:'auto'}}>
          <div style={{display:'flex', gap:8, flexWrap:'nowrap', overflowX:'auto'}}>
            <button onClick={goHome}         style={activeBtnStyle(!(visitorActive||relMinorActive||subdomActive))}>HOME</button>
            <button onClick={toggleRelMinor} style={activeBtnStyle(relMinorActive)}>RELATIVE</button>
            <button onClick={toggleSubdom}   style={activeBtnStyle(subdomActive)}>SUBDOM</button>
            <button onClick={toggleVisitor}  style={activeBtnStyle(visitorActive)}>PARALLEL</button>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <label style={{fontSize:12}}>Key</label>
            <select value={baseKey} onChange={(e)=>setBaseKey(e.target.value as KeyName)}
              style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff"}}>
              {FLAT_NAMES.map(k=> <option key={k} value={k}>{k}</option>)}
            </select>

            {MIDI_SUPPORTED && (
              <select value={selectedId} onChange={(e)=>{ const acc=midiAccessRef.current; if(acc) bindToInput(e.target.value, acc); }}
                style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff"}}>
                {inputs.length===0 && <option value="">No MIDI inputs</option>}
                {inputs.map((i:any)=>(<option key={i.id} value={i.id}>{i.name || `Input ${i.id}`}</option>))}
              </select>
            )}
          </div>
        </div>

        {/* Status */}
        <div style={{marginTop:8}}>
          <span style={{fontSize:12, padding:'2px 6px', border:'1px solid #ffffff22', background:'#ffffff18', borderRadius:6}}>
            {visitorActive ? 'mode: Parallel (Eb)'
              : relMinorActive ? 'mode: Relative minor (Am)'
              : subdomActive ? 'mode: Subdominant (F)'
              : (midiConnected ? `MIDI: ${midiName||'Connected'}` : 'MIDI: none')}
          </span>
        </div>

        {/* Wheel */}
        <div className="relative"
             style={{width:WHEEL_W,height:WHEEL_H, margin:'16px auto',
                     transform:`scale(${UI_SCALE_DEFAULT})`, transformOrigin:'center top'}}>
          <div style={wrapperStyle}>
            <svg width={WHEEL_W} height={WHEEL_H} viewBox={`0 0 ${WHEEL_W} ${WHEEL_H}`} className="select-none" style={{display:'block'}}>
  {/* TOP-LEFT LABELS (inside circle, moved up and left) */}
  <text x={30} y={120} textAnchor="start" fontSize={11}
        style={{ fill:'#9CA3AF', fontWeight:600 }}>Beat Kitchen</text>
  <text x={30} y={134} textAnchor="start" fontSize={10}
        style={{ fill:'#7B7B7B', fontWeight:500 }}>{HW_VERSION}</text>

  {wedgeNodes}

              {/* Hub */}
              <circle cx={260} cy={260} r={220*HUB_RADIUS} fill={HUB_FILL} stroke={HUB_STROKE} strokeWidth={HUB_STROKE_W}/>
              {SHOW_CENTER_LABEL && centerLabel && (
                <text x={260} y={260+8} textAnchor="middle" style={{fontFamily: CENTER_FONT_FAMILY, paintOrder:"stroke", stroke:"#000", strokeWidth:1.2 as any}} fontSize={CENTER_FONT_SIZE} fill={CENTER_FILL}>
                  {centerLabel}
                </text>
              )}

              {/* Bonus overlay + trailing */}
              {/* (kept exactly as in your v2.30.0 block) */}
              {/* 
              {/* -------- BEGIN BONUS BLOCK -------- */}
{bonusActive && (() => {
  // Basic arc ring between inner/outer radii
  const toRad = (deg:number) => (deg - 90) * Math.PI/180; // 0° at 12 o'clock
  const arc = (cx:number, cy:number, r:number, a0:number, a1:number) => {
    const x0 = cx + r * Math.cos(toRad(a0));
    const y0 = cy + r * Math.sin(toRad(a0));
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const large = Math.abs(a1-a0) > 180 ? 1 : 0;
    const sweep = a1 > a0 ? 1 : 0;
    return {x0,y0,x1,y1,large,sweep};
  };
  const ring = (cx:number, cy:number, r0:number, r1:number, a0:number, a1:number) => {
    const o = arc(cx,cy,r1,a0,a1);
    const i = arc(cx,cy,r0,a1,a0);
    return `M ${o.x0},${o.y0} A ${r1},${r1} 0 ${o.large} ${o.sweep} ${o.x1},${o.y1}`
         + ` L ${i.x0},${i.y0} A ${r0},${r0} 0 ${i.large} ${i.sweep} ${i.x1},${i.y1} Z`;
  };
  const cx = 260, cy = 260;
  const r0 = 220*BONUS_INNER_R;
  const r1 = 220*BONUS_OUTER_R*1.06; // extend a hair past rim
  const span = 16; // degrees
  const base = (typeof BONUS_CENTER_ANCHOR_DEG === 'number' ? BONUS_CENTER_ANCHOR_DEG : 0);
  // Space the two bonuses so they never overlap; pick anchor by current bonus label.
  const anchorA7   = base - 30;
  const anchorBdim = base + 30;
  const anchor = (bonusLabel === 'A7') ? anchorA7 : anchorBdim;
  const a0 = anchor - span/2 + rotationOffset;
  const a1 = anchor + span/2 + rotationOffset;
  const pathD = ring(cx,cy,r0,r1,a0,a1);
  const textR = (r0+r1)/2;
      const funcLabel = (bonusLabel === 'A7') ? 'V/ii' : 'ii/vi';
  const mid = (a0+a1)/2;
  const tx = cx + textR * Math.cos(toRad(mid));
  const ty = cy + textR * Math.sin(toRad(mid));
  return (
    <g key="bonus">
      <path d={pathD} fill={BONUS_FILL} stroke={PALETTE_ACCENT_GREEN} strokeWidth={1.5 as any}/>
      <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
            style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
        {funcLabel}
      </text>\n          <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
            {bonusLabel}
          </text>
    </g>
  );
})()}
{/* -------- END BONUS BLOCK -------- */}

            </svg>
          </div>
        </div>

        {/* Bottom Grid: input + keyboard (left), buttons + guitar tab (right) */}
        {(()=>{

          // keyboard geometry (scoped)
          const KBD_LOW=48, KBD_HIGH=71;
          const whites:number[]=[], blacks:number[]=[];
          for(let m=KBD_LOW;m<=KBD_HIGH;m++){ ([1,3,6,8,10].includes(pcFromMidi(m))?blacks:whites).push(m); }

          const whiteCount = whites.length;
          const totalW = (WHEEL_W * KBD_WIDTH_FRACTION);
          const WW = totalW / whiteCount;
          const HW = WW * 4.0 * KBD_HEIGHT_FACTOR_DEFAULT;
          const WB = WW * 0.68;
          const HB = HW * 0.62;

          const whitePos:Record<number,number>={}, blackPos:Record<number,number>={};
          let x=0; for(const m of whites){ whitePos[m]=x; x+=WW; }
          for(const m of blacks){
            const L=m-1,R=m+1; const hasL=whitePos[L]!=null, hasR=whitePos[R]!=null;
            if(hasL&&hasR){ const xL=whitePos[L], xR=whitePos[R]; blackPos[m]=xL+(xR-xL)-(WB/2); }
            else if(hasL){ blackPos[m]=whitePos[L]+WW-(WB/2);} else if(hasR){ blackPos[m]=whitePos[R]-(WB/2);}
          }

          const rhDisplaySet = ()=>{ 
            const phys=[...rightHeld.current], sus=sustainOn.current?[...rightSus.current]:[], merged=new Set<number>([...phys,...sus]);
            let src = Array.from(new Set(Array.from(merged))).sort((a,b)=>a-b);
            if(src.length===0 && LATCH_PREVIEW && lastInputWasPreviewRef.current && latchedAbsNotes.length){
              src = [...new Set(latchedAbsNotes)].sort((a,b)=>a-b);
            }
            if(src.length===0) return new Set<number>();
            const fitted = preview.fitNotesToWindowPreserveInversion(src, KBD_LOW, KBD_HIGH);
            return new Set(fitted);
          };
          const disp = rhDisplaySet();

          // guitar tab sizing (square)
          const rightW = WHEEL_W * GUITAR_TAB_WIDTH_FRACTION;
          const tabSize = Math.min(rightW, HW);

          return (
            <div style={{maxWidth: WHEEL_W, margin:'12px auto 0', display:'grid',
                        gridTemplateColumns:`${KEYBOARD_WIDTH_FRACTION*100}% ${GUITAR_TAB_WIDTH_FRACTION*100}%`,
                        columnGap:12, rowGap:10, alignItems:'start'}}>

              {/* Left column: input above keyboard */}
              <div style={{display:'grid', gridTemplateRows:'auto auto', rowGap:10}}>
                <textarea
                  placeholder={'Type chords, modifiers, and comments...\nExamples:\nC, Am7, F, G7\n@SUB F, Bb, C7\n# Verse: lyrics or theory note'}
                  rows={3}
                  value={inputText}
                  onChange={(e)=>setInputText(e.target.value)}
                  onKeyDown={handleInputKeyNav}
                  style={{
                    width: "calc(100% - 25px)", // was "100%" — pulls in the right edge a touch
                    padding:'10px 12px',
                    border:'1px solid #374151',
                    background:'#0f172a',
                    color:'#e5e7eb',
                    borderRadius:8,
                    fontFamily:'ui-sans-serif, system-ui',
                    resize:'vertical'
                  }}
                />

                {/* Keyboard */}
                <div style={{width:'100%'}}>
                  <svg viewBox={`0 0 ${totalW} ${HW+18}`} className="select-none"
                      style={{display:'block', width:'100%', height:'auto', border:'1px solid #374151', borderRadius:8, background:'#0f172a'}}>
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr; const held=disp.has(m);
                      return (
                        <g key={`w-${m}`}>
                          <rect x={x} y={0} width={WW} height={HW}
                                fill={held?"#AEC9FF":"#f9fafb"} stroke="#1f2937"
                                onMouseDown={()=>{rightHeld.current.add(m); detect();}}
                                onMouseUp={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}}
                                onMouseLeave={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}}/>
                          {pcFromMidi(m)===0 && (<text x={Number(x)+3} y={HW+13} fontSize={10} fill="#9CA3AF">C{Math.floor(m/12)-1}</text>)}
                        </g>
                      );
                    })}
                    {Object.entries(blackPos).map(([mStr,x])=>{
                      const m=+mStr; const held=disp.has(m);
                      return (
                        <rect key={`b-${m}`} x={x} y={0} width={WB} height={HB} rx={2} ry={2}
                              fill={held?"#2448B8":"#111827"} stroke={held?"#5A90FF":"#374151"}
                              onMouseDown={()=>{rightHeld.current.add(m); detect();}}
                              onMouseUp={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}}
                              onMouseLeave={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}} />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right column: buttons above guitar tab */}
              <div style={{display:'grid', gridTemplateRows:'auto auto', rowGap:10, justifyItems:'stretch'}}>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={parseAndLoadSequence} style={{padding:'8px 12px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer', flex:1}}>Load</button>
                  <button onClick={stepPrev} style={{padding:'8px 12px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer'}}>◀</button>
                  <button onClick={stepNext} style={{padding:'8px 12px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer'}}>▶</button>
                </div>
                <div style={{display:'flex', justifyContent:'center'}}>
                  <GuitarTab chordLabel={currentGuitarLabel} width={tabSize} height={tabSize} />
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// EOF - HarmonyWheel.tsx v2.37.13