// HarmonyWheel.tsx — v2.29.0
// PATCH SUMMARY (drop-in):
// - Global dim fade-out: when active chord releases, other-wedge dim fades back to 1.0 over 750 ms.
// - Sus2/sus4 & augmented: hub labels recognize sus2/sus4 and aug with correct ROOT names (display-only; no functional changes).
// - SUB→HOME jiggle: small +30° / –30° / 0° jiggle after the SUB exit spin completes.
// - Display rename: show “ii/vi” (not “V/vi”) on the wedge label (display-only; logic unchanged).
// - Bonus overlay debounce: Bdim / Bm7♭5 bonus overlay delayed by 50 ms to avoid bounce.
// - Kept all of your v2.28.0 logic and earlier patches intact; all changes are inline and tagged.

// (Your original imports)
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
  // v3.0.0 additions:
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

export default function HarmonyWheel(){
  /* ----- core state ----- */
  const [baseKey,setBaseKey]=useState<KeyName>("C");
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

  // SUB (F keyspace illusion)
  const [subdomActive,_setSubdomActive]=useState(false);
  const subdomActiveRef=useRef(false);
  const setSubdomActive=(v:boolean)=>{ subdomActiveRef.current=v; _setSubdomActive(v); };

  const subdomLatchedRef = useRef(false);
  const subLastSeenFnRef = useRef<Fn>("I");
  const subExitCandidateSinceRef = useRef<number | null>(null);
  const subHasSpunRef = useRef(false);

  // windows/suppression
  const RECENT_PC_WINDOW_MS = 280;
  const recentRelMapRef = useRef<Map<number, number>>(new Map());
  const lastPcsRelSizeRef = useRef<number>(0);
  const homeSuppressUntilRef = useRef(0);
  const justExitedSubRef = useRef(false);

  const [rotationOffset,setRotationOffset]=useState(0);
  const [targetRotation,setTargetRotation]=useState(0);

  /* rotation animation */
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

  // Regular rotation (parallel/relative). SUB doesn’t set a persistent rotation.
  useEffect(()=>{
    if(relMinorActive || visitorActive) setTargetRotation(VISITOR_ROTATE_DEG);
    else if(!subdomActive) setTargetRotation(0);
  },[relMinorActive, visitorActive, subdomActive]);

  /* bonus + trails */
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

  /* midi */
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

  const bindToInput=(id:string, acc:any)=>{
    acc.inputs.forEach((i:any)=>{ i.onmidimessage=null; });
    const dev = acc.inputs.get(id);
    if(!dev){ setSelectedId(""); setMidiConnected(false); setMidiName(""); return; }
    dev.onmidimessage=(e:any)=>{
      setMidiConnected(true); setMidiName(dev.name||"MIDI");
      lastInputWasPreviewRef.current = false;
      const [st,d1,d2]=e.data, type=st&0xf0;
      if(type===0x90 && d2>0){
        if(d1<=48){
          leftHeld.current.add(d1);
          const lowest=Math.min(...leftHeld.current);
          const k=pcNameForKey(pcFromMidi(lowest), "C") as KeyName;
          setBaseKey(k);
        } else { rightHeld.current.add(d1); if(sustainOn.current) rightSus.current.add(d1); }
        detect();
      } else if(type===0x80 || (type===0x90 && d2===0)){
        if(d1<=48) leftHeld.current.delete(d1);
        else { rightHeld.current.delete(d1); rightSus.current.delete(d1); }
        detect();
      } else if(type===0xB0 && d1===64){
        const on=d2>=64;
        if(!on && sustainOn.current){
          for(const n of Array.from(rightSus.current)) if(!rightHeld.current.has(n)) rightSus.current.delete(n);
          sustainOn.current=false; detect();
        } else if(on && !sustainOn.current){
          sustainOn.current=true; for(const n of rightHeld.current) rightSus.current.add(n);
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


// v3 input & sequence state
const [inputText, setInputText] = useState("");
type SeqItem = { kind: "chord" | "modifier" | "comment"; raw: string; chord?: string; comment?: string; };
const [sequence, setSequence] = useState<SeqItem[]>([]);
const [seqIndex, setSeqIndex] = useState(-1);
const activeComment = (seqIndex>=0 && sequence[seqIndex]?.comment) ? sequence[seqIndex]!.comment! : "";

// Simple token parser: commas separate tokens.
//   @SUB F, @REL Am, @PAR Eb, @KEY D (KEY reserved for future)
//   # anything = comment token
const parseAndLoadSequence = ()=>{
  const tokens = inputText.split(",").map(t=>t.trim()).filter(Boolean);
  const items: SeqItem[] = tokens.map(tok=>{
    if (tok.startsWith("#")) return { kind:"comment", raw:tok, comment: tok.slice(1).trim() };
    if (tok.startsWith("@")) {
      const [cmd, ...rest] = tok.slice(1).trim().split(/\s+/);
      const arg = rest.join(" ");
      const upper = (cmd||"").toUpperCase();
      if (upper==="SUB" || upper==="REL" || upper==="PAR" || upper==="KEY"){
        return { kind:"modifier", raw:tok, chord: `${upper}:${arg}` };
      }
      return { kind:"modifier", raw:tok, chord: `${upper}:${arg}` }; // unknown modifier tolerated
    }
    // basic chord token
    return { kind:"chord", raw:tok, chord: tok };
  });
  setSequence(items);
  setSeqIndex(items.length ? 0 : -1);
  // immediately apply first actionable token
  if (items.length) applySeqItem(items[0]);
};

// navigate
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

// Apply a sequence item: comments update only the comment box.
// modifiers toggle modes; chords preview via existing logic.
const applySeqItem = (it: SeqItem)=>{
  if (it.kind==="comment") return; // comment just displays
  if (it.kind==="modifier" && it.chord){
    const m = it.chord.split(":")[0];
    const arg = it.chord.split(":").slice(1).join(":").trim();
    if (m==="SUB"){ if(!subdomActiveRef.current) toggleSubdom(); }
    else if (m==="REL"){ if(!relMinorActiveRef.current) toggleRelMinor(); }
    else if (m==="PAR"){ if(!visitorActiveRef.current) toggleVisitor(); }
    else if (m==="KEY"){ /* reserved for future key-center change */ }
    return;
  }
  if (it.kind==="chord" && it.chord){
    // shove the label into center and let existing pathways take over:
    centerOnly(it.chord);
    // optional: we could map raw chord label to a fn and call previewFn(fn)
    // but for now we keep it display-only so we don’t disturb your routing.
  }
};



  /* layout & bonus geometry */
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

  /* taps */
  const TAP_MS = 1500, TRIPLE_COUNT = 3;
  const TAP_LOG_REF = { current: {} as Record<string, number[]> } as const;
  const TAP_STATE_REF = { current: { REL_Am:false, REL_C:false, VIS_G:false } as Record<string, boolean> } as const;
  const pushTap = (name:string)=>{ const now=performance.now(); const arr=(TAP_LOG_REF.current[name] ||= []); arr.push(now); while(arr.length && now-arr[0]>TAP_MS) arr.shift(); return arr.length; };
  const setTapEdge = (name:string, present:boolean)=>{ const prev=!!TAP_STATE_REF.current[name]; if(present && !prev){ const n=pushTap(name); TAP_STATE_REF.current[name]=true; return n; } if(!present && prev){ TAP_STATE_REF.current[name]=false; } return 0; };

  /* ---------- Trail + Center helpers ---------- */
  const makeTrail=()=>{ if(activeFnRef.current){ setTrailFn(activeFnRef.current as Fn); } };
  const setActiveWithTrail=(fn:Fn,label:string)=>{ 
    if(activeFnRef.current && activeFnRef.current!==fn){ makeTrail(); } 
    setActiveFn(fn); setCenterLabel(SHOW_CENTER_LABEL?label:"" ); 
    setBonusActive(false); setBonusLabel(""); 
    // PATCH (dim fade): stop any running fade when a new active fn arrives
    stopDimFade();
  };
  const centerOnly=(t:string)=>{ 
    makeTrail(); 
    // PATCH (dim fade): start fade if we are clearing a live activeFn
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
    // PATCH (dim fade): fade back to full brightness
    if (activeFnRef.current) startDimFade();
    setBonusActive(false); setBonusLabel(""); setCenterLabel(""); 
    setActiveFn("");
  };

  /* ---------- SUB spin + jiggle ---------- */
  const subSpinTimerRef = useRef<number | null>(null);
  const clearSubSpinTimer = ()=>{ if(subSpinTimerRef.current!=null){ window.clearTimeout(subSpinTimerRef.current); subSpinTimerRef.current=null; } };
  const SUB_SPIN_DEG = Math.abs(IV_ROTATE_DEG || 168);

  // PATCH: quick jiggle after SUB→HOME (±30° then settle)

  const subJiggleExit = ()=>{
    // chain three quick targets
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
      // PATCH: jiggle after landing at HOME
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
  const SUB_EXIT_DEBOUNCE_MS = 300;

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

  // helper: detect any fully dim7 and its “root” pc (mod 12)
  const findDim7Root = (S:Set<number>): number | null => {
    for (let pc=0; pc<12; pc++){
      if (S.has(pc) && S.has((pc+3)%12) && S.has((pc+6)%12) && S.has((pc+9)%12)) return pc;
    }
    return null;
  };

  // PATCH: detect sus2, sus4, aug labels (display-only helper)
  const detectDisplayTriadLabel = (pcsRel:Set<number>, key:KeyName): string | null => {
    // We'll scan every pc as potential root (0..11), then test triad shapes relative to that root.
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    const norm = (x:number)=>((x%12)+12)%12;
    for (let root=0; root<12; root++){
      // sus2: root, 2, 7  (0,2,7)
      const sus2 = [root, norm(root+2), norm(root+7)];
      if (sus2.every(p=>pcsRel.has(p))) return `${names[root]}sus2`;
      // sus4: root, 5, 7  (0,5,7)
      const sus4 = [root, norm(root+5), norm(root+7)];
      if (sus4.every(p=>pcsRel.has(p))) return `${names[root]}sus4`;
      // augmented: root, 4, 8 (0,4,8)
      const aug  = [root, norm(root+4), norm(root+8)];
      if (aug.every(p=>pcsRel.has(p))) return `${names[root]}aug`;
    }
    return null;
  };

  // PATCH: tiny debounce timer ref for Bdim bonus overlay
  const bdimTimerRef = useRef<number | null>(null);
  const clearBdimTimer = ()=>{ if (bdimTimerRef.current!=null){ window.clearTimeout(bdimTimerRef.current); bdimTimerRef.current=null; } };

  function detect(){
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
    const absName=internalAbsoluteName(pcsAbs, baseKeyRef.current);

    updateRecentRel(pcsRel);

    const isSubset = (need:number[])=> subsetOf(T(need), pcsRel);
    const exactSet=(need:number[])=>{
      const needSet=T(need); if(!subsetOf(needSet, pcsRel)) return false;
      for(const p of pcsRel) if(!needSet.has(p)) return false;
      return true;
    };

    const amPresent = isSubset([9,0,4]) || isSubset([9,0,4,2]);
    const cPresent  = isSubset([0,4,7]) || isSubset([0,4,7,11]);

    // ---------- triple-taps (always live) ----------
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
    if(setTapEdge("VIS_G", gPresentTap) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G/G7"); return;
    }

    /* ---------- BONUS OVERLAYS (subset-tolerant) ---------- */
{
  const inParallel = visitorActiveRef.current;

  // helper: do we currently hold a full dim7 (any inversion)?
  const isFullDim7 = (() => {
    const r = findDim7Root(pcsRel);
    return r !== null;
  })();

  // Bdim / Bm7b5 overlay — SUPPRESSED in PARALLEL and when a full dim7 is present
  const hasBDF   = isSubset([11,2,5]);       // B D F
  const hasBDFG  = isSubset([11,2,5,9]);     // B D F A  (Bm7b5)
  if (!inParallel && !isFullDim7 && (hasBDF || hasBDFG)){
    // PATCH: delay 50 ms to avoid bounce
    clearBdimTimer();
    bdimTimerRef.current = window.setTimeout(()=>{
      setActiveFn(""); setCenterLabel(hasBDFG ? "Bm7♭5" : "Bdim");
      setBonusActive(true); setBonusLabel(hasBDFG ? "Bm7♭5" : "Bdim");
    }, BONUS_DEBOUNCE_MS) as unknown as number;
    return;
  } else {
    // if condition no longer applies, clear pending timer and ensure overlay off unless something else sets it
    clearBdimTimer();
  }

  // PATCH: C#dim / C#dim7 / C#m7b5 → A7 bonus overlay (V/ii), suppressed in PARALLEL
  const hasCsharpDimTri  = isSubset([1,4,7]);        // C# E G
  const hasCsharpHalfDim = isSubset([1,4,7,11]);     // C# E G B
  const isCsharpFullDim7 = (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12));
  if (!inParallel && (hasCsharpDimTri || hasCsharpHalfDim || isCsharpFullDim7)){
    setActiveFn(""); setCenterLabel("A7");
    setBonusActive(true); setBonusLabel("A7");
    return;
  }

  // A7 overlay (unchanged)
  const hasA7tri = isSubset([9,1,4]);            // A C# E
  const hasA7    = hasA7tri || isSubset([9,1,4,7]); // + optional G
  if (hasA7){
    setActiveFn(""); setCenterLabel("A7");
    setBonusActive(true); setBonusLabel("A7");
    return;
  }

  setBonusActive(false); setBonusLabel("");
}


/* ---------- SUBDOM (F) ---------- */
/* (unchanged logic from your v2.28.0; exits will call subSpinExit which now jiggles) */
{
  const enterByGm = isSubset([7,10,2]) || isSubset([7,10,2,5]);
  const enterByC7 = isSubset([0,4,7,10]);

  if (!subdomActiveRef.current && (enterByGm || enterByC7)) {
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
    const useWindow = performance.now() < homeSuppressUntilRef.current;
    const S = useWindow ? windowedRelSet() : pcsRel;

    /* ---------- FAST EXITS FROM SUB (no debounce) ---------- */
    const bbTri   = isSubsetIn([10,2,5], S);     // Bb
    const bb7     = isSubsetIn([10,2,5,8], S);   // Bb7

    // SUB exceptions (as in your v2.28.0)
    const bbMaj7Exact = exactSetIn([10,2,5,9], S);    // Bbmaj7 stays on IV
    if (bbMaj7Exact){
      setActiveWithTrail("IV","Bbmaj7"); subLatch("IV");
      return;
    }
    const bbmStay = isSubsetIn([10,1,5], S) || isSubsetIn([10,1,5,8], S); // Bbm / Bbm7 stays on iv
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

    // Eb / Ab / Db families → PARALLEL (unchanged)
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

    // Dm / Am / Em (triad or m7) and D7 / E7 → HOME (unchanged; Em7b5 removed earlier)
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

    /* ---------- normal SUB latching/exit ---------- */
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

    /* ---------- PARALLEL quick rule: D7 exits to HOME on V/V ---------- */
    if (visitorActiveRef.current && (isSubset([2,6,9,0]) || exactSet([2,6,9,0]))){
      setVisitorActive(false);
      setActiveWithTrail("V/V", "D7");
      return;
    }

    // PATCH: in HOME, guard Fm7 exact so it doesn’t trigger PARALLEL by accident
    if (!visitorActiveRef.current && !subdomActiveRef.current){
      if (exactSet([5,8,0,3])){ // Fm7
        setRelMinorActive(false);
        setActiveWithTrail("iv","Fm7");
        return;
      }
    }

    /* Enter Parallel (Eb) */
    if(!visitorActiveRef.current && !subdomActiveRef.current){
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

      // PATCH: F / Fmaj7 exits PARALLEL → HOME (light IV)
      const fMaj   = isSubset([5,9,0]) || isSubset([5,9,0,4]);
      if (fMaj){
        setVisitorActive(false);
        setActiveWithTrail("IV", absName || (isSubset([5,9,0,4]) ? "Fmaj7" : "F"));
        return;
      }
    }

    // Bbm7 guard (disabled in SUB; allowed elsewhere)
    if(!subdomActiveRef.current && exactSet([10,1,5,8])){ centerOnly("Bbm7"); return; }

    // Eb quick exits
    if(visitorActiveRef.current && (isSubset([2,5,9]) || isSubset([2,5,9,0]))){
      setVisitorActive(false); setActiveWithTrail("ii", absName || (isSubset([2,5,9,0])?"Dm7":"Dm")); return;
    }
    if(visitorActiveRef.current && (isSubset([4,7,11]) || isSubset([4,7,11,2]))){
      setVisitorActive(false); setActiveWithTrail("iii", absName || (isSubset([4,7,11,2])?"Em7":"Em")); return;
    }

/* ---------- explicit dim7 mapping in HOME ---------- */
if (!visitorActiveRef.current){
  // Full dim7 detection (any inversion)
  const root = findDim7Root(pcsRel);
  if (root!==null){
    // Special handling for C#°7 → A7 BONUS
    if (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12)){
      setActiveFn(""); setCenterLabel("A7");
      setBonusActive(true); setBonusLabel("A7");
      return;
    }

    // Priority map by membership:
    const hasFsharp = pcsRel.has(6);
    const hasGsharp = pcsRel.has(8);
    const hasB      = pcsRel.has(11);

    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    const label = `${names[root]}dim7`;

    if (hasFsharp){ setActiveWithTrail("V/V",  "F#dim7"); return; }
    if (hasGsharp){ setActiveWithTrail("V/vi", "G#dim7"); return; }
    if (hasB)     { setActiveWithTrail("V7",   "Bdim7");  return; }

    const mapped = mapDimRootToFn_ByBottom(root) || "V7";
    setActiveWithTrail(mapped as Fn, label);
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

      // PATCH: F#m7b5 drives V/V in HOME
      if (exactSet([6,9,0,4])){ // F# A C E
        setActiveWithTrail("V/V","F#m7♭5");
        return;
      }

      const m7 = firstMatch(C_REQ7, pcsRel); if(m7){ setActiveWithTrail(m7.f as Fn, m7.n); return; }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(absName); return; }
      const tri = firstMatch(C_REQT, pcsRel); if(tri){ setActiveWithTrail(tri.f as Fn, tri.n); return; }
    }

    /* diminished → wedge via bottom note (fallback) */
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

    // PATCH: last-resort display — show sus2/sus4/aug root labels when nothing else claimed it
    const triDisp = detectDisplayTriadLabel(pcsRel, baseKeyRef.current);
    centerOnly(triDisp || absName);
  }

  /* controls */
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

  // Relative cue: paint V/V with IV color
  const fnFillColor = (fn: Fn) =>
    (relMinorActive && fn === "V/V") ? FN_COLORS["IV"] : FN_COLORS[fn];

  // PATCH: display-only rename map for wedge label line 1
  const fnDisplay = (fn: Fn): string => (fn === "V/vi" ? "ii/vi" : fn);

  /* ---------- Global dim fade (PATCH) ---------- */
  const [dimFadeTick, setDimFadeTick] = useState(0);
  const [dimFadeOn, setDimFadeOn] = useState(false);
  const dimFadeRafRef = useRef<number | null>(null);
  const startDimFade = ()=>{
    stopDimFade();
    setDimFadeOn(true);
    const start = performance.now();
    const tick = ()=>{
      const dt = performance.now() - start;
      if (dt < DIM_FADE_MS){
        setDimFadeTick(dt);
        dimFadeRafRef.current = requestAnimationFrame(tick);
      } else {
        setDimFadeTick(DIM_FADE_MS);
        stopDimFade();
      }
    };
    dimFadeRafRef.current = requestAnimationFrame(tick);
  };
  const stopDimFade = ()=>{
    if (dimFadeRafRef.current != null) cancelAnimationFrame(dimFadeRafRef.current);
    dimFadeRafRef.current = null;
    setDimFadeOn(false);
    setDimFadeTick(0);
  };

  /* keyboard helpers */
  const KBD_LOW=48, KBD_HIGH=71;
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

  // PREVIEW uses display label key: Eb in PARALLEL, F in SUB, tonic otherwise.
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

  /* label key for display (SUB shows F, PARALLEL shows Eb) */
  const labelKey = (visitorActive ? "Eb" : (subdomActive ? "F" : baseKey)) as KeyName;

  /* wedges */
  const wedgeNodes = useMemo(()=>{
    const renderKey:KeyName = visitorActive ? "Eb" : baseKey; // logic labels (tonic for SUB)
    // PATCH: compute global dim opacity
    // If we have an activeFn: non-active wedges opacity = 0.5 (as before).
    // If no activeFn but dimFade is on: ramp from 0.5 → 1.0 across DIM_FADE_MS.
    const dimK = Math.min(1, Math.max(0, dimFadeTick / DIM_FADE_MS));
    const fadedBase = 0.5 + 0.5 * dimK; // 0.5→1.0
    return layout.map(({fn,path,labelPos})=>{
      const isActive = activeFn===fn;
      const isTrailing = trailOn && (trailFn===fn);
      const k = isTrailing ? Math.min(1, Math.max(0, trailTick / RING_FADE_MS)) : 0;
      const globalActive = activeFn!==""; 
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
              {/* PATCH: display-only rename for V/vi */}
              <tspan x={labelPos.x} dy={0}>{fnDisplay(fn)}</tspan>
              {/* display-only label key so SUB reads in F, PARALLEL in Eb */}
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

  /* render */
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
              {wedgeNodes}

              {/* Hub */}
              <circle cx={260} cy={260} r={220*HUB_RADIUS} fill={HUB_FILL} stroke={HUB_STROKE} strokeWidth={HUB_STROKE_W}/>
              {SHOW_CENTER_LABEL && centerLabel && (
                <text x={260} y={260+8} textAnchor="middle" style={{fontFamily:CENTER_FONT_FAMILY}} fontSize={CENTER_FONT_SIZE} fill={CENTER_FILL}>
                  {centerLabel}
                </text>
              )}

              {/* Bonus overlay + trailing */}
              {bonusArcGeom && bonusActive && (
                <>
                  <path d={annulusTopDegree(260,260, Math.max(220*BONUS_OUTER_R, 220*BONUS_OUTER_OVER), 220*BONUS_INNER_R, bonusArcGeom.a0Top, bonusArcGeom.a1Top)}
                        fill={BONUS_FILL} stroke={BONUS_STROKE} strokeWidth={2}/>
                  <path d={annulusTopDegree(260,260, Math.max(220*BONUS_OUTER_R, 220*BONUS_OUTER_OVER), 220*BONUS_INNER_R, bonusArcGeom.a0Top, bonusArcGeom.a1Top)}
                        fill="none" stroke="#39FF14" strokeWidth={5} opacity={1}/>
                  {/* PATCH: show ii/vi when the overlay label is Bdim/Bm7♭5 */}
                  {(()=> {
                    const raw = BONUS_FUNCTION_BY_LABEL[bonusLabel] ?? "bonus";
                    const displayFn = (bonusLabel==="Bdim" || bonusLabel==="Bm7♭5") ? "ii/vi" : raw;
                    return (
                      <text x={bonusArcGeom.labelPos.x} y={bonusArcGeom.labelPos.y - 6} textAnchor="middle"
                        style={{ fill: BONUS_TEXT_FILL, fontWeight:600, paintOrder:"stroke", stroke:'#000', strokeWidth:0.9 }}>
                        <tspan x={bonusArcGeom.labelPos.x} dy={0} fontSize={BONUS_TEXT_SIZE + 2}>
                          {displayFn}
                        </tspan>
                        <tspan x={bonusArcGeom.labelPos.x} dy={16} fontSize={BONUS_TEXT_SIZE}>{bonusLabel}</tspan>
                      </text>
                    );
                  })()}
                </>
              )}

              {(!bonusActive && bonusTrailOn && lastBonusGeomRef.current) && (() => {
                const k = Math.min(1, Math.max(0, bonusTrailTick / RING_FADE_MS));
                const op = 1 - 0.9 * k;
                const w = 5 - 3 * k;
                const g = lastBonusGeomRef.current!;
                return (
                  <g>
                    <path d={annulusTopDegree(260,260, Math.max(220*BONUS_OUTER_R, 220*BONUS_OUTER_OVER), 220*BONUS_INNER_R, g.a0Top, g.a1Top)} fill={BONUS_FILL} opacity={op} />
                    <path d={annulusTopDegree(260,260, Math.max(220*BONUS_OUTER_R, 220*BONUS_OUTER_OVER), 220*BONUS_INNER_R, g.a0Top, g.a1Top)} fill="none" stroke="#39FF14" strokeWidth={w} opacity={op} />
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>


{/* Chord Input (v3) */}
<div style={{maxWidth:960, margin:'12px auto 0', display:'flex', gap:8, alignItems:'stretch'}}>
  <textarea
    placeholder={'Type chords, modifiers, and comments...\nExamples:\nC, Am7, F, G7\n@SUB F, Bb, C7\n# Verse: lyrics or theory note'}
    rows={3}
    style={{
      flex:1,
      padding:'10px 12px',
      border:'1px solid #374151',
      background:'#0f172a',
      color:'#e5e7eb',
      borderRadius:8,
      fontFamily:'ui-sans-serif, system-ui',
      resize:'vertical'
    }}
    value={inputText}
    onChange={(e)=>setInputText(e.target.value)}
    onKeyDown={handleInputKeyNav}
  />
  <div style={{display:'flex', flexDirection:'column', gap:8}}>
    <button onClick={parseAndLoadSequence} style={activeBtnStyle(true)}>Load</button>
    <div style={{display:'flex', gap:8}}>
      <button onClick={stepPrev} style={activeBtnStyle(true)}>{'◀︎ Prev'}</button>
      <button onClick={stepNext} style={activeBtnStyle(true)}>{'Next ▶︎'}</button>
    </div>
  </div>
</div>

{/* Active Comment (v3) */}
{activeComment && (
  <div style={{maxWidth:960, margin:'8px auto 0', padding:'8px 12px', border:'1px solid #384152', background:'#111827', color:'#e5e7eb', borderRadius:8, whiteSpace:'pre-wrap'}}>
    {activeComment}
  </div>
)}




{/* Bottom Panel: Keyboard (left) + Guitar Tab (right) */}
{(()=>{ const KBD_LOW=48, KBD_HIGH=71;
  const whites:number[]=[], blacks:number[]=[];
  for(let m=KBD_LOW;m<=KBD_HIGH;m++){ ([1,3,6,8,10].includes(pcFromMidi(m))?blacks:whites).push(m); }

  const whiteCount = whites.length;
  const totalW = (WHEEL_W * KBD_WIDTH_FRACTION);
  const WW = totalW / whiteCount;
  const HW = WW * 4.0 * KBD_HEIGHT_FACTOR_DEFAULT; // total keyboard height
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

  // Right-side Guitar Tab panel sizing
  const rightW = WHEEL_W * GUITAR_TAB_WIDTH_FRACTION;
  const rightH = HW; // make it a square of equal height by constraining width to min(height, rightW)
  const tabSize = Math.min(rightW, rightH);
  // Use centerLabel (display) for now — later we’ll feed detected/preview fn-resolved chord name.
  const guitarChordLabel = centerLabel || null;

  return (
    <div style={{maxWidth: WHEEL_W, margin:'12px auto 0', display:'grid', gap:12,
                 gridTemplateColumns:`${KEYBOARD_WIDTH_FRACTION*100}% ${GUITAR_TAB_WIDTH_FRACTION*100}%`,
                 alignItems:'start'}}>
      {/* Keyboard */}
      <div style={{width:'100%', transform:`scale(${UI_SCALE_DEFAULT})`, transformOrigin:'left top'}}>
        <svg viewBox={`0 0 ${totalW} ${HW+18}`} className="select-none"
             style={{display:'block', width:'100%', height:'auto', border:'1px solid #374151', borderRadius:8, background:'#0f172a'}}>
          {/* Whites */}
          {Object.entries(whitePos).map(([mStr,x])=>{
            const m=+mStr; const held=disp.has(m);
            return (
              <g key={`w-${m}`}>
                <rect
                  x={x}
                  y={0}
                  width={WW}
                  height={HW}
                  fill={held?"#AEC9FF":"#f9fafb"}
                  stroke="#1f2937"
                  onMouseDown={()=>{rightHeld.current.add(m); detect();}}
                  onMouseUp={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}}
                  onMouseLeave={()=>{rightHeld.current.delete(m); rightSus.current.delete(m); detect();}}
                />
                {pcFromMidi(m)===0 && (<text x={Number(x)+3} y={HW+13} fontSize={10} fill="#9CA3AF">C{Math.floor(m/12)-1}</text>)}
              </g>
            );
          })}
          {/* Blacks */}
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

      {/* Guitar Tab (square) */}
      <div style={{display:'flex', justifyContent:'center', alignItems:'start', transform:`scale(${UI_SCALE_DEFAULT})`, transformOrigin:'left top'}}>
        <GuitarTab chordLabel={guitarChordLabel} width={tabSize} height={tabSize} />
      </div>
    </div>
  );
})()}

      </div>
    </div>
  );
}
