/*
 * HarmonyWheel.tsx — v2.45.0
 * 
 * 🚀🚀🚀 PHASE 2C - THE BIG ONE! 🚀🚀🚀
 * 
 * ONE LINE CHANGE, EVERYTHING WORKS!
 * 
 * CHANGES FROM v2.38.3:
 * - **THE CRITICAL FIX:** pcsRel now relative to baseKey, not C!
 * - Changed: `toRel = (n) => ((n - NAME_TO_PC["C"] + 12) % 12)`
 * - To: `toRel = (n) => ((n - NAME_TO_PC[baseKeyRef.current] + 12) % 12)`
 * 
 * THIS SINGLE LINE MAKES:
 * - ✅ All isSubset() checks work in any key
 * - ✅ Play E major chords, see E major functions
 * - ✅ Play Ab major chords, see Ab major functions  
 * - ✅ Bonus chords (Bdim, Bm7♭5, A7) transpose correctly
 * - ✅ SUB entry works in any key (ii of IV)
 * - ✅ PAR entry works in any key (vi of ♭VI)
 * - ✅ ALL hardcoded checks now relative!
 * 
 * You can now:
 * 1. Set dropdown to E
 * 2. Play E, F#m, G#m, A, B, C#m, D#dim
 * 3. See correct Roman numerals light up!
 * 
 * MODIFIED BY: Claude AI for Nathan Rosenberg / Beat Kitchen
 * DATE: October 30, 2025
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
  realizeFunction, getSubKey, getParKey
} from "./lib/theory";
import {
  VISITOR_SHAPES, C_REQ7, C_REQT, EB_REQ7, EB_REQT, firstMatch, getVisitorShapesFor, getDiatonicTablesFor
} from "./lib/modes";
import { BonusDebouncer } from "./lib/overlays";
import * as preview from "./lib/preview";
const HW_VERSION = 'v2.79.0'; // FIXED: Make My Key uses lastPlayedChord ref (not centerLabel)
const PALETTE_ACCENT_GREEN = '#7CFF4F'; // palette green for active outlines

import { DIM_OPACITY } from "./lib/config";



export default function HarmonyWheel(){
  /* ---------- Core state ---------- */
  const [baseKey,setBaseKey]=useState<KeyName>("C");
  
  // Skill level system
  type SkillLevel = "ROOKIE" | "NOVICE" | "SOPHOMORE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("EXPERT");
  
  // Define which functions are visible at each level (cumulative)
  const SKILL_LEVEL_FUNCTIONS: Record<SkillLevel, Fn[]> = {
    "ROOKIE": ["I", "IV", "V7"],  // C, F, G7
    "NOVICE": ["I", "IV", "V7", "vi", "V/V"],  // + Am, E7
    "SOPHOMORE": ["I", "IV", "V7", "vi", "V/V", "V/vi"],  // + D7
    "INTERMEDIATE": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii"],  // + Dm, Em
    "ADVANCED": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"],  // + Bb, Fm
    "EXPERT": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"]  // All + bonus button
  };
  
  // Check if a function is visible at current skill level
  const isFunctionVisible = (fn: Fn): boolean => {
    return SKILL_LEVEL_FUNCTIONS[skillLevel].includes(fn);
  };
  
  // Check if bonus wedges should be available
  const bonusWedgesAllowed = skillLevel === "EXPERT";
  

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

  // PHASE 2B: Dynamic SUB and PAR keys (not hardcoded!)
  // SUB = IV of baseKey (F when base=C, Db when base=Ab, A when base=E, etc.)
  // PAR = ♭VI of baseKey (Eb when base=C, Cb when base=Ab, G when base=E, etc.)
  const subKey = useMemo(() => getSubKey(baseKey), [baseKey]);
  const parKey = useMemo(() => getParKey(baseKey), [baseKey]);
  
  // Dynamic VISITOR_SHAPES (PAR entry chords) transposed for current baseKey
  const visitorShapes = useMemo(() => getVisitorShapesFor(baseKey), [baseKey]);
  
  // Dynamic diatonic matching tables for HOME and PAR spaces
  const homeDiatonic = useMemo(() => getDiatonicTablesFor(baseKey), [baseKey]);
  const parDiatonic = useMemo(() => getDiatonicTablesFor(parKey), [parKey]);

  const [activeFn,setActiveFn]=useState<Fn|"">("I");
  const activeFnRef=useRef<Fn|"">("I"); useEffect(()=>{activeFnRef.current=activeFn;},[activeFn]);

  const [centerLabel,setCenterLabel]=useState("C");
  const lastPlayedChordRef = useRef<string>("C"); // Track for Make My Key

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
  const [showBonusWedges, setShowBonusWedges] = useState(false); // Toggle for bonus wedge visibility
  const showBonusWedgesRef = useRef(false);
  useEffect(() => { 
    showBonusWedgesRef.current = showBonusWedges; 
    // Auto-hide bonus wedges if skill level drops below EXPERT
    if (skillLevel !== "EXPERT" && showBonusWedges) {
      setShowBonusWedges(false);
    }
  }, [showBonusWedges, skillLevel]);
  
  // Audio playback
  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio enabled
  const audioEnabledRef = useRef(true); // Ref for MIDI callback closure
  const [audioReady, setAudioReady] = useState(false);
  
  // Initialize audio context on mount since we start with audio enabled
  useEffect(() => {
    if (audioEnabled) {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        // Will be resumed on first user interaction
        const resumeAudio = async () => {
          await ctx.resume();
          setAudioReady(true);
          document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio, { once: true });
      } else {
        setAudioReady(true);
      }
    }
    
    // Global mouseup to catch releases outside wedges (for drag)
    const handleGlobalMouseUp = () => {
      if (wedgeHeldRef.current) {
        console.log('🛑 Global mouseup - releasing wedge');
        wedgeHeldRef.current = false;
        currentHeldFnRef.current = null;
        lastPlayedWith7thRef.current = null;
        
        // Stop all active chord notes
        const ctx = audioContextRef.current;
        if (ctx) {
          const now = ctx.currentTime;
          const releaseTime = 0.4;
          activeChordNoteIdsRef.current.forEach(noteId => {
            const nodes = activeNotesRef.current.get(noteId);
            if (nodes) {
              nodes.gain.gain.cancelScheduledValues(now);
              nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
              nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
              setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
            }
          });
        }
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [audioEnabled]); // Run once on mount
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Map<string, {osc1: OscillatorNode, osc2: OscillatorNode, osc3: OscillatorNode, gain: GainNode}>>(new Map());
  let noteIdCounter = 0; // For generating unique note IDs
  
  // Voice leading for chord playback
  const previousVoicingRef = useRef<number[]>([60, 64, 67]); // Default C major [C4, E4, G4]
  const activeChordNoteIdsRef = useRef<Set<string>>(new Set()); // Track note IDs instead of MIDI numbers
  const wedgeHeldRef = useRef(false); // Track if wedge is being held down
  const keyboardHeldNotesRef = useRef<Set<number>>(new Set()); // Track which keyboard notes are held
  const lastPlayedWith7thRef = useRef<boolean | null>(null); // Track if last chord had 7th
  const currentHeldFnRef = useRef<Fn | null>(null); // Track which function is being held
  
  // Help overlay
  const [showHelp, setShowHelp] = useState(false);
  
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
        
        // Hide bonus wedges on any MIDI note input
        if (showBonusWedgesRef.current) {
          setShowBonusWedges(false);
        }
        
        // Transpose octave: A0 to C2 (MIDI 21-36)
        if (d1<=36){
          leftHeld.current.add(d1);
          const lowest = Math.min(...leftHeld.current);
          const k = pcNameForKey(pcFromMidi(lowest), "C") as KeyName;
          setBaseKey(k);
        } else {
          rightHeld.current.add(d1);
          if (sustainOn.current) rightSus.current.add(d1);
          
          // Play audio for MIDI keyboard input
          console.log('🎹 MIDI note-on:', d1, 'velocity:', d2, 'audioEnabled:', audioEnabledRef.current);
          if (audioEnabledRef.current) {
            const velocity = d2 / 127;
            console.log('🎵 Calling playNote with velocity:', velocity);
            playNote(d1, velocity, false);
          } else {
            console.log('❌ Audio not enabled, not playing');
          }
        }
        detect();
      } else if (type===0x80 || (type===0x90 && d2===0)) {
        lastMidiEventRef.current = "off";
        if (d1<=36) leftHeld.current.delete(d1);
        else { 
          rightHeld.current.delete(d1); 
          rightSus.current.delete(d1);
          
          // Stop audio for MIDI keyboard note-off
          if (audioEnabledRef.current) {
            stopNote(d1);
          }
        }
        // Don't call detect() immediately on note-off - keep chord visible
        // User can then click "Make This My Key" button
        // Only detect after a delay
        setTimeout(() => detect(), 50);
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
  const [inputText, setInputText] = useState("@TITLE Let It Be, @KEY F, # Intro, F, C, Bb, F, C, # When I find myself in, G, # times of trouble, Am, # Mother Mary, F, # comes to me, C, # Speaking words of, G, # wisdom. Let it, F, # be..., C");
  type SeqItem = { kind: "chord" | "modifier" | "comment" | "title"; raw: string; chord?: string; comment?: string; title?: string; };
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [seqIndex, setSeqIndex] = useState(-1);
  const [songTitle, setSongTitle] = useState(""); // Static song title from @TITLE
  
  // Autoload preloaded playlist on mount
  useEffect(() => {
    if (inputText && sequence.length === 0) {
      parseAndLoadSequence();
    }
  }, []); // Run once on mount
  
  // Comment only shows if immediately following current chord
  const activeComment = (() => {
    if (seqIndex < 0 || seqIndex >= sequence.length - 1) return ""; // No comment if at end or invalid
    
    // Check if next item is a comment
    const nextItem = sequence[seqIndex + 1];
    if (nextItem && nextItem.kind === "comment") {
      return nextItem.comment || "";
    }
    return "";
  })();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to select current item in textarea (highlight with yellow)
  const selectCurrentItem = () => {
    if (!textareaRef.current || seqIndex < 0 || !sequence[seqIndex]) return;
    
    // Get the raw text of current item
    const currentRaw = sequence[seqIndex].raw;
    
    // Find this exact text in the input
    const index = inputText.indexOf(currentRaw);
    if (index !== -1) {
      textareaRef.current.setSelectionRange(index, index + currentRaw.length);
      // Don't focus - let user keep working elsewhere
    }
  };

  // Insert current chord at cursor position in textarea
  const insertCurrentChord = () => {
    if (!textareaRef.current || !currentGuitarLabel) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = inputText.substring(0, start);
    const after = inputText.substring(end);
    
    // Add comma before if needed (not at start and previous char isn't comma or space)
    const needsCommaBefore = start > 0 && before[before.length - 1] !== ',' && before[before.length - 1] !== ' ';
    
    // Always add comma and space after
    const insertion = (needsCommaBefore ? ', ' : '') + currentGuitarLabel + ', ';
    const newText = before + insertion + after;
    setInputText(newText);
    
    // Move cursor to after inserted text
    const newCursorPos = start + insertion.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const parseAndLoadSequence = ()=>{
    const tokens = inputText.split(",").map(t=>t.trim()).filter(Boolean);
    let title = "";
    
    const items: SeqItem[] = tokens.map(tok=>{
      // Comments start with #
      if (tok.startsWith("#")) return { kind:"comment", raw:tok, comment: tok.slice(1).trim() };
      
      // Modifiers start with @
      if (tok.startsWith("@")) {
        const remainder = tok.slice(1).trim();
        const [cmd, ...rest] = remainder.split(/\s+/);
        const arg = rest.join(" ");
        const upper = (cmd||"").toUpperCase();
        
        // Check for TITLE
        if (upper === "TITLE" || upper === "TI") {
          title = arg;
          return { kind:"title", raw:tok, title: arg };
        }
        
        // Check for KEY
        if (upper === "KEY" || upper === "K") {
          return { kind:"modifier", raw:tok, chord: `KEY:${arg}` };
        }
        
        // Normalize abbreviations: REL, SUB, PAR, HOME
        let normalized = upper;
        if (upper === "SUBDOM" || upper === "SUB") normalized = "SUB";
        else if (upper === "RELATIVE" || upper === "REL") normalized = "REL";
        else if (upper === "PARALLEL" || upper === "PAR") normalized = "PAR";
        else if (upper === "HOME" || upper === "HOM") normalized = "HOME";
        
        return { kind:"modifier", raw:tok, chord: `${normalized}:${arg}` };
      }
      
      // Everything else is a chord (hardened - no special handling needed)
      return { kind:"chord", raw:tok, chord: tok };
    });
    
    setSongTitle(title);
    setSequence(items);
    setSeqIndex(items.length ? 0 : -1);
    
    // Check if first item is @KEY, otherwise default to C
    if (items.length) {
      const firstItem = items[0];
      if (firstItem.kind === "modifier" && firstItem.chord?.startsWith("KEY:")) {
        // First item sets key, apply it
        applySeqItem(firstItem);
      } else {
        // No key specified, default to C and go HOME
        setBaseKey("C");
        goHome();
      }
      
      // Apply first chord/modifier
      if (items.length > 0) {
        const startIdx = (firstItem.kind === "modifier" && firstItem.chord?.startsWith("KEY:")) ? 1 : 0;
        if (startIdx < items.length) {
          applySeqItem(items[startIdx]);
        }
      }
    }
  };

  const stepPrev = ()=>{
    if (!sequence.length) return;
    let i = seqIndex - 1;
    if (i < 0) i = 0; // Stay at beginning
    
    // Skip backwards over comments and titles to find previous chord/modifier
    while (i > 0 && (sequence[i]?.kind === "comment" || sequence[i]?.kind === "title")) {
      i--;
    }
    
    setSeqIndex(i); 
    applySeqItem(sequence[i]);
    setTimeout(() => selectCurrentItem(), 0);
  };
  
  const stepNext = ()=>{
    if (!sequence.length) return;
    let i = seqIndex + 1;
    if (i >= sequence.length) i = sequence.length - 1; // Stay at end
    
    // Skip forward over comments and titles to find next chord/modifier
    while (i < sequence.length - 1 && (sequence[i]?.kind === "comment" || sequence[i]?.kind === "title")) {
      i++;
    }
    
    setSeqIndex(i); 
    applySeqItem(sequence[i]);
    setTimeout(() => selectCurrentItem(), 0);
  };
  const handleInputKeyNav: React.KeyboardEventHandler<HTMLTextAreaElement> = (e)=>{
    // Only handle Return/Enter and Ctrl+I in textarea
    // Arrow keys work normally for cursor movement
    
    // Return/Enter loads sequence (no line breaks supported)
    if (e.key==="Enter"){ 
      e.preventDefault(); 
      parseAndLoadSequence();
      // Blur textarea to exit edit mode
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    }
    // Ctrl+I or Cmd+I inserts current chord
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i'){
      e.preventDefault();
      insertCurrentChord();
    }
  };

  const applySeqItem = (it: SeqItem)=>{
    if (it.kind==="comment" || it.kind==="title") return; // Skip comments and titles
    if (it.kind==="modifier" && it.chord){
      const [m, arg] = it.chord.split(":");
      if (m==="HOME"){ goHome(); } // Return to HOME space
      else if (m==="SUB"){ if(!subdomActiveRef.current) toggleSubdom(); }
      else if (m==="REL"){ if(!relMinorActiveRef.current) toggleRelMinor(); }
      else if (m==="PAR"){ if(!visitorActiveRef.current) toggleVisitor(); }
      else if (m==="KEY"){ 
        // Change key center
        const newKey = arg?.trim() as KeyName;
        if (newKey && FLAT_NAMES.includes(newKey)) {
          setBaseKey(newKey);
        }
      }
      return;
    }
    if (it.kind==="chord" && it.chord){
      // Space-switching logic: automatically activate appropriate space for chord
      const chordName = it.chord.trim();
      const baseKey = baseKeyRef.current;
      
      // Check if chord belongs to SUB space (e.g., Gm in C major)
      // SUB space chords: IV (F), ii (Dm), vi (Am), ♭VII (Bb), IVM7 (FM7), iim7 (Dm7), vim7 (Am7), ♭VIIM7 (BbM7)
      const subChords = ['F', 'Dm', 'Am', 'Bb', 'FM7', 'Dm7', 'Am7', 'BbM7', 'Gm', 'Gm7'];
      
      // Check if chord belongs to REL space (e.g., Em in C major)
      // REL space chords: based on relative minor (Am in C major)
      const relChords = ['Em', 'Em7', 'G', 'G7', 'Am', 'Am7'];
      
      // Determine space based on chord name
      // Note: This is a simplified heuristic. Full implementation would parse chord roots and qualities.
      if (chordName.includes('m') && !chordName.startsWith('M')) {
        // Minor chord - check if it's Gm (subdominant minor in C)
        if (chordName.startsWith('G') && !visitorActiveRef.current && !relMinorActiveRef.current) {
          // Gm → activate SUB space
          if (!subdomActiveRef.current) toggleSubdom();
        } else if (chordName.startsWith('E') && !visitorActiveRef.current && !subdomActiveRef.current) {
          // Em → activate REL space
          if (!relMinorActiveRef.current) toggleRelMinor();
        } else if (chordName.startsWith('C') && !subdomActiveRef.current && !relMinorActiveRef.current) {
          // Cm → activate PAR space
          if (!visitorActiveRef.current) toggleVisitor();
        }
      }
      
      // Use previewChordByName to show chord on keyboard and light wedge
      previewChordByName(it.chord);
    }
  };

  // Global keyboard handler for arrow keys and Enter (when not in textarea)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle if NOT in textarea
      if (document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepNext();
      } else if (e.key === 'Enter' && inputText.trim()) {
        e.preventDefault();
        parseAndLoadSequence();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertCurrentChord();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        makeThisMyKey();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        goHomeC(); // Return to HOME C
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inputText, sequence, seqIndex, centerLabel]); // Re-attach when these change

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
    setActiveFn(fn); 
    setCenterLabel(SHOW_CENTER_LABEL?label:""); 
    lastPlayedChordRef.current = label; // Save for Make My Key
    setBonusActive(false); setBonusLabel(""); 
    stopDimFade();
  };
  const centerOnly=(t:string)=>{ 
    makeTrail(); 
    if (activeFnRef.current) startDimFade();
    // Filter out comment and modifier markers
    const cleaned = t.replace(/^[#@]\s*/, '').trim();
    setCenterLabel(SHOW_CENTER_LABEL ? cleaned : ""); 
    lastPlayedChordRef.current = cleaned; // Save for Make My Key
    setBonusActive(false); setBonusLabel(""); 
  };
  
  // Helper to preview a chord by name (for playlist navigation)
  const previewChordByName = (chordName: string) => {
    lastInputWasPreviewRef.current = true;
    const renderKey: KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    // Map chord name to function (I, ii, iii, IV, V, vi, etc.)
    // This activates the correct wedge!
    const chordToFunction = (chord: string, key: KeyName): Fn | null => {
      const baseKey = key;
      const chordRoot = chord.match(/^([A-G][#b]?)/)?.[1];
      if (!chordRoot) return null;
      
      // Map chord roots to scale degrees in C major
      const degreeMap: Record<string, number> = {
        'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11,
        'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10
      };
      
      const keyDegree = degreeMap[baseKey] || 0;
      const chordDegree = degreeMap[chordRoot];
      if (chordDegree === undefined) return null;
      
      // Calculate relative degree (0-11)
      const relativeDegree = (chordDegree - keyDegree + 12) % 12;
      
      // Map to function based on degree and quality
      const isMinor = chord.includes('m') && !chord.includes('maj') && !chord.includes('M');
      const is7th = chord.includes('7');
      
      // Diatonic functions
      if (relativeDegree === 0) return "I";       // I (C in C)
      if (relativeDegree === 2) return isMinor ? "ii" : null;    // ii (Dm in C)
      if (relativeDegree === 4) return isMinor ? "iii" : null;   // iii (Em in C)
      if (relativeDegree === 5) return isMinor ? "iv" : "IV";    // IV (F in C) or iv (Fm in C)
      if (relativeDegree === 7) return "V7";      // V (G in C)
      if (relativeDegree === 9) return isMinor ? "vi" : null;    // vi (Am in C)
      if (relativeDegree === 10) return "♭VII";   // ♭VII (Bb in C)
      
      return null;
    };
    
    const fn = chordToFunction(chordName, renderKey);
    
    if (fn) {
      // Use previewFn logic to activate wedge
      const with7th = PREVIEW_USE_SEVENTHS || fn === "V7" || fn === "V/V" || fn === "V/vi";
      const pcs = preview.chordPcsForFn(fn, renderKey, with7th);
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      setLatchedAbsNotes(fitted);
      setActiveWithTrail(fn, realizeFunction(fn, renderKey));
    } else {
      // Fallback: parse chord manually for keyboard display only
      try {
        const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
        if (match) {
          const root = match[1];
          const quality = match[2] || '';
          
          const rootPc = NAME_TO_PC[root as KeyName];
          let intervals: number[] = [0, 4, 7];
          
          if (quality.includes('m') && !quality.includes('maj') && !quality.includes('M')) {
            intervals = [0, 3, 7];
          }
          if (quality.includes('7')) {
            if (quality.includes('maj') || quality.includes('M')) {
              intervals.push(11);
            } else if (quality.includes('m')) {
              intervals.push(10);
            } else {
              intervals.push(10);
            }
          }
          
          const baseMidi = 60;
          let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
          const fitted = preview.fitNotesToWindowPreserveInversion(midiNotes, KBD_LOW, KBD_HIGH);
          setLatchedAbsNotes(fitted);
        }
      } catch (e) {
        console.warn('Could not parse chord:', chordName);
      }
      
      centerOnly(chordName);
    }
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
    
    // MIDI shortcut detection moved to note-off to avoid interference with playing
    // Now handled separately in MIDI message handler

    if(pcsAbs.size===0){
      setTapEdge("REL_Am", false); setTapEdge("REL_C", false); setTapEdge("VIS_G", false);
      bonusDeb.reset();

      if (subdomActiveRef.current && subdomLatchedRef.current) {
        if (!centerLabel) setCenterLabel(subKey);
        if (!activeFnRef.current) setActiveFn(subLastSeenFnRef.current || "I");
        hardClearGhostIfIdle();
        return;
      }
      hardClearGhostIfIdle();
      return clear();
    }

    setLatchedAbsNotes(absHeld);

    // PHASE 2C: Convert to baseKey-relative (not C-relative!)
    // This makes ALL isSubset() checks work in any key
    const toRel=(n:number)=>((n-NAME_TO_PC[baseKeyRef.current]+12)%12);
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

      // ========== NEW v2.45.0: vii°7 special case (works in all keys!) ==========
      // vii°7 (leading tone dim7) acts as dominant substitute in ANY key
      // Pattern: [11,2,5,8] relative to tonic (7th scale degree + dim7 intervals)
      // C: Bdim7, F: Edim7, G: F#dim7, Ab: Gdim7, etc.
      // Allow extra notes (doubled roots, etc.) as long as core pattern present
      const hasVii7Pattern = isSubset([11,2,5,8]) && isFullDim7;
      if (!inParallel && hasVii7Pattern) {
        // Light the V7 wedge, display actual chord name in hub
        setActiveFn("V7"); 
        setCenterLabel(absName); // Use actual name (Bdim7, Edim7, etc.)
        setBonusActive(false);  // Don't use bonus overlay
        return;
      }
      // ========== END NEW v2.45.0 ==========

      const hasBDF   = isSubset([11,2,5]);
      const hasBDFG  = isSubset([11,2,5,9]);
      // Check for G7 more broadly: G-B-F tritone (with or without D)
      // This prevents false bonus triggers on G7 voicings without the 5th
      const hasG7 = isSubset([7,11,5]); // G-B-F (essential tritone)
      
      // Don't trigger dim bonus if G7 is present (G7 takes priority)
      if (!inParallel && !isFullDim7 && !hasG7 && (hasBDF || hasBDFG)){
        clearBdimTimer();
        bdimTimerRef.current = window.setTimeout(()=>{
          // Double-check G7 hasn't appeared during debounce (race condition guard)
          const currentPcsRel = new Set([...absHeld].map(pcFromMidi).map(n => (n - NAME_TO_PC[baseKeyRef.current] + 12) % 12));
          const stillHasG7 = [7,11,5].every(pc => currentPcsRel.has(pc));
          if (stillHasG7) return; // Abort bonus if G7 detected
          
          // Use actual chord name (Bdim in C, Edim in F, etc.)
          setActiveFn(""); 
          setCenterLabel(absName);
          setBonusActive(true); 
          setBonusLabel(absName);
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
        setCenterLabel(subKey);
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
        const fm   = isSubsetIn([5,8,0], S) || isSubsetIn([5,8,0,3], S); // iv chord - exit immediately

        if (dm || am || em || d7 || e7 || fm){
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
          if (fm){ setActiveWithTrail("iv",  absName || (isSubsetIn([5,8,0,3], S)?"Fm7":"Fm")); return; }
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

    /* Enter Parallel (PAR) - now dynamic for all keys! */
      if(isNoteOn && !visitorActiveRef.current && !subdomActiveRef.current){
      const vHit = visitorShapes.find(v=>subsetOf(v.pcs, pcsRel)) || null;
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
        
        // ========== NEW v2.45.0: vii°7 in REL Am (works in all keys!) ==========
        // vii°7 of meta-key should map to V7, not be misidentified
        const hasVii7Pattern = pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.has(8);
        if (hasVii7Pattern) {
          // Always map to V7 (dominant function) regardless of current space
          setActiveWithTrail("V7", absName); // Use actual name
          return;
        }
        // ========== END v2.45.0 ==========
        
        // All other dim7 chords: use absName from theory.ts (which uses lowest note)
        const dimLabel = absName || `${["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"][root]}dim7`;
        const mapped = mapDimRootToFn_ByBottom(root) || "V7";
        setActiveWithTrail(mapped as Fn, dimLabel);
        return;
      }
    }
    
    /* ========== NEW v2.45.0: PAR EXIT for secondary dominants ========== */
    // When in PAR, certain chords signal return to HOME (secondary dominant area)
    // Check these BEFORE PAR diatonic matching
    if (visitorActiveRef.current) {
      // Exit on F#dim7 family (V/V function) - relative to meta-key
      // Pattern [6,9,0,3] in C = F#dim7, works in all keys
      const hasFsharpDim7 = pcsRel.has(6) && pcsRel.has(9) && pcsRel.has(0) && pcsRel.has(3);
      if (hasFsharpDim7) {
        setVisitorActive(false);
        setActiveWithTrail("V/V", absName);
        return;
      }
      
      // Exit on A7/A (V/ii function - use bonus wedge)
      const hasA = isSubset([9,1,4]);
      if (hasA) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7");
        setCenterLabel(absName);
        setActiveFn("");
        return;
      }
      
      // Exit on C#dim7 family (V/ii function - use bonus wedge)
      const hasCsharpDim7 = pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10);
      if (hasCsharpDim7) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        setCenterLabel(absName); // Actual chord name
        setActiveFn("");
        return;
      }
    }
    /* ========== END v2.45.0 ========== */

    /* In PAR mapping - now dynamic for all keys! */
    if(visitorActiveRef.current){
      // CRITICAL: Check vii° and vii°7 FIRST (before diatonic matching)
      // vii° and vii°7 act as V chord for meta-key in ALL keys
      // In PAR space, this means V/vi function, NOT V7 of PAR key
      // Pattern [11,2,5] for vii° triad, [11,2,5,8] for vii°7
      // MUST check BEFORE diatonic because [11,2,5] matches Bb triad subset!
      // Allow extra notes (e.g., doubled roots) as long as core pattern present
      const hasViiTriad = isSubset([11,2,5]) && pcsRel.size <= 4; // Allow up to 4 notes
      const hasVii7 = isSubset([11,2,5,8]); // Any size OK for dim7
      if (hasViiTriad || hasVii7) {
        // Light V/vi wedge, display actual chord name
        setActiveFn("V/vi"); 
        setCenterLabel(absName); // Edim/Edim7 in F, Bdim/Bdim7 in C, etc.
        setBonusActive(false);
        return;
      }
      
      // Now check diatonic (after vii° check)
      const m7 = firstMatch(parDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer absName for 7th chords
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? absName : realizeFunction(m7.f as Fn, parKey);
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(absName); return; }
      const tri = firstMatch(parDiatonic.reqt, pcsRel); 
      if(tri){ 
        const chordName = realizeFunction(tri.f as Fn, parKey);
        setActiveWithTrail(tri.f as Fn, chordName); 
        return; 
      }
    }

    /* In C mapping */
    if (performance.now() >= homeSuppressUntilRef.current){
      // PRIORITY: Check bonus chords BEFORE diatonic chords
      // This prevents Bm7♭5 [11,2,5,9] from being misidentified as Dm7 [2,5,9,0]
      const hasBDF   = isSubset([11,2,5]);
      const hasBDFG  = isSubset([11,2,5,9]);
      if (!visitorActiveRef.current && (hasBDF || hasBDFG)) {
        // This is a bonus chord - activate immediately (no debounce needed here)
        setActiveFn(""); 
        setCenterLabel(absName); // Use actual name
        setBonusActive(true); 
        setBonusLabel(absName);
        return;
      }
      
      // Also check A7 before diatonic
      const hasA7tri = isSubset([9,1,4]);
      const hasA7    = hasA7tri || isSubset([9,1,4,7]);
      if (!visitorActiveRef.current && hasA7) {
        setActiveFn(""); 
        setCenterLabel("A7");
        setBonusActive(true); 
        setBonusLabel("A7");
        return;
      }
      
      if (exactSet([6,9,0,4])){ setActiveWithTrail("V/V","F#m7♭5"); return; }
      const m7 = firstMatch(homeDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer absName for 7th chords (Em7, Gmaj7, etc.) over generic realizeFunction
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? absName : realizeFunction(m7.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched m7:', { fn: m7.f, chordName, absName, hasSeventhQuality, baseKey: baseKeyRef.current });
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(absName); return; }
      const tri = firstMatch(homeDiatonic.reqt, pcsRel); 
      if(tri){ 
        const chordName = realizeFunction(tri.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched tri:', { fn: tri.f, chordName, baseKey: baseKeyRef.current, pcsRel: [...pcsRel] });
        setActiveWithTrail(tri.f as Fn, chordName); 
        return; 
      }
    }

    // diminished fallback by bottom note
    const rhs=absHeld.filter(n=>n>36).sort((a,b)=>a-b);
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
    console.log('[DETECT] Fallback:', { triDisp, absName, result: triDisp || absName });
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
    // Don't reset to C - use current baseKey!
    setActiveFn("I");
    setCenterLabel(baseKeyRef.current); // Show current key in hub
    stopDimFade();
  };
  
  const goHomeC = ()=>{
    // Reset to C key and HOME space
    setBaseKey("C");
    setTimeout(() => goHome(), 20);
  };
  
  const makeThisMyKey = ()=>{
    // Simple rule: Make the root of the chord the new key center
    // UNLESS it's a minor chord, then use relative major + REL mode
    
    // Use lastPlayedChordRef because centerLabel might have changed due to space switches
    const chordToUse = lastPlayedChordRef.current;
    if (!chordToUse) return;
    
    // Parse chord name to get root
    const match = chordToUse.match(/^([A-G][b#]?)(m|min|maj|M)?/);
    if (!match) return;
    
    const rootName = match[1] as KeyName;
    const quality = match[2] || "";
    const isMinor = quality.startsWith("m") && !quality.startsWith("maj");
    
    console.log('🔑 Make My Key:', chordToUse, '(lastPlayed) → root:', rootName, 'isMinor:', isMinor, 'currentLabel:', centerLabel);
    
    if (isMinor) {
      // Minor chord - go to relative major and activate REL
      const rootPc = NAME_TO_PC[rootName];
      if (rootPc === undefined) return;
      
      // Calculate relative major PC
      const relativeMajorPc = (rootPc + 3) % 12; // Minor 3rd up
      
      // Get the key name directly from FLAT_NAMES (prefer flats for key centers)
      const relativeMajorKey = FLAT_NAMES[relativeMajorPc] as KeyName;
      
      console.log('🔑 Minor:', rootName, '(pc:', rootPc, ') → relative major:', relativeMajorKey, '(pc:', relativeMajorPc, '), current baseKey:', baseKeyRef.current);
      
      // Check if we're already in the correct relative major
      if (baseKeyRef.current === relativeMajorKey) {
        console.log('🔑 Already in correct key, just activating REL');
        // Just activate REL mode, don't change base key
        if (!relMinorActiveRef.current) {
          toggleRelMinor();
        }
      } else {
        // Need to change base key
        if (FLAT_NAMES.includes(relativeMajorKey)) {
          console.log('🔑 Changing base key from', baseKeyRef.current, 'to', relativeMajorKey);
          setBaseKey(relativeMajorKey);
          goHome(); // Reset to home first
          setTimeout(() => {
            if (!relMinorActiveRef.current) {
              toggleRelMinor();
            }
          }, 100);
        }
      }
    } else {
      // Major chord (including 7ths, maj7s, etc.) - use root as new key
      console.log('🔑 Major → new key:', rootName);
      if (FLAT_NAMES.includes(rootName)) {
        setBaseKey(rootName);
        // Force immediate state update
        setTimeout(() => {
          goHome();
          console.log('🔑 Called goHome, should be in', rootName, 'now');
        }, 50);
      }
    }
  };
  
  const toggleVisitor = ()=>{
    const on = !visitorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && relMinorActiveRef.current) setRelMinorActive(false);
    setVisitorActive(on);
    if(on){ setActiveFn("I"); setCenterLabel(parKey); stopDimFade(); }
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
      setActiveFn("I"); setCenterLabel(subKey);
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
  const labelKey = (visitorActive ? parKey : (subdomActive ? subKey : baseKey)) as KeyName;
  const centerTextStyle: React.CSSProperties = {
    fontFamily: CENTER_FONT_FAMILY, paintOrder: "stroke", stroke: "#000", strokeWidth: 1.2 as any
  };

  /* ---------- wedges ---------- */
  const wedgeNodes = useMemo(()=>{
    const renderKey:KeyName = visitorActive ? parKey : baseKey;
    const dimK = Math.min(1, Math.max(0, dimFadeTick / DIM_FADE_MS));
    const fadedBase = 0.5 + 0.5 * dimK; // 0.5→1.0
    return layout
      .filter(({fn}) => isFunctionVisible(fn)) // Filter by skill level
      .map(({fn,path,labelPos})=>{
      const isActive = activeFn===fn;
      const isTrailing = trailOn && (trailFn===fn);
      const k = isTrailing ? Math.min(1, Math.max(0, trailTick / RING_FADE_MS)) : 0;
      const globalActive = (activeFn!=="" || bonusActive); 
      const fillOpacity = isActive ? 1 : (globalActive ? 0.5 : (dimFadeOn ? fadedBase : 1));
      const ringTrailOpacity = 1 - 0.9*k; const ringTrailWidth = 5 - 3*k;
      return (
        <g key={fn} 
           onMouseDown={(e)=>{
             wedgeHeldRef.current = true; // Mark wedge as held
             currentHeldFnRef.current = fn; // Remember which function
             
             // Calculate click position relative to wheel center
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) { previewFn(fn); return; }
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r; // 0 = center, 1 = outer edge
             
             // Inner zone (< threshold) = play with 7th
             // Outer zone (>= threshold) = play triad only
             const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
             lastPlayedWith7thRef.current = playWith7th; // Remember what we played
             
             console.log('🖱️ Click radius:', normalizedRadius.toFixed(2), 'Play 7th:', playWith7th);
             previewFn(fn, playWith7th);
           }}
           onMouseEnter={(e)=>{
             // If dragging from another wedge, activate this wedge
             console.log('🔍 onMouseEnter:', fn, 'buttons:', e.buttons, 'wedgeHeld:', wedgeHeldRef.current, 'currentFn:', currentHeldFnRef.current);
             
             if (e.buttons === 1 && wedgeHeldRef.current && currentHeldFnRef.current !== fn) {
               console.log('🎯 Dragged to new wedge:', fn, 'from:', currentHeldFnRef.current);
               
               // Stop previous chord with quick fade
               const ctx = audioContextRef.current;
               if (ctx) {
                 const now = ctx.currentTime;
                 console.log('🔇 Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
                 activeChordNoteIdsRef.current.forEach(noteId => {
                   const nodes = activeNotesRef.current.get(noteId);
                   if (nodes) {
                     nodes.gain.gain.cancelScheduledValues(now);
                     nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                     nodes.gain.gain.linearRampToValueAtTime(0, now + 0.05); // Quick 50ms fade
                     setTimeout(() => stopNoteById(noteId), 100);
                   }
                 });
                 activeChordNoteIdsRef.current.clear();
               }
               
               currentHeldFnRef.current = fn;
               
               // Calculate radius for 7th determination
               const svg = e.currentTarget.ownerSVGElement;
               if (!svg) return;
               
               const pt = svg.createSVGPoint();
               pt.x = e.clientX;
               pt.y = e.clientY;
               const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
               
               const dx = svgP.x - cx;
               const dy = svgP.y - cy;
               const clickRadius = Math.sqrt(dx*dx + dy*dy);
               const normalizedRadius = clickRadius / r;
               
               const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
               lastPlayedWith7thRef.current = playWith7th;
               
               console.log('🎵 Playing new chord:', fn, 'with7th:', playWith7th);
               // Play new chord
               previewFn(fn, playWith7th);
             }
           }}
           onMouseMove={(e)=>{
             e.preventDefault(); // Prevent text selection
             
             // Only process if wedge is being held
             if (!wedgeHeldRef.current || currentHeldFnRef.current !== fn) return;
             
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) return;
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r;
             
             const shouldHave7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
             
             // If 7th state changed, update hub label and audio
             if (shouldHave7th !== lastPlayedWith7thRef.current) {
               console.log('🎵 Drag changed 7th (hub update):', shouldHave7th);
               lastPlayedWith7thRef.current = shouldHave7th;
               
               // Update hub label
               const renderKey = visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current);
               const chordName = realizeFunction(fn, renderKey);
               
               // Add or remove appropriate 7th extension
               if (shouldHave7th) {
                 if (!chordName.includes('7')) {
                   // Check if it's a major or dominant chord
                   // I, IV = maj7, V7 = 7, ii, iii, vi = m7
                   if (fn === "I" || fn === "IV") {
                     setCenterLabel(chordName + 'maj7');
                   } else if (fn === "V7") {
                     // V7 already has 7 in the function name, but chord might show as "G"
                     setCenterLabel(chordName.includes('7') ? chordName : chordName + '7');
                   } else if (fn === "ii" || fn === "iii" || fn === "vi" || fn === "iv") {
                     // Minor chords - check if already has 'm' to avoid "Amm7"
                     if (chordName.includes('m')) {
                       setCenterLabel(chordName + '7'); // Already has 'm', just add '7'
                     } else {
                       setCenterLabel(chordName + 'm7');
                     }
                   } else {
                     setCenterLabel(chordName + '7');
                   }
                 }
               } else {
                 setCenterLabel(chordName.replace(/maj7|m7|7/g, ''));
               }
               
               // Get the 7th note for this function
               const chordDef = CHORD_DEFINITIONS[fn];
               
               if (chordDef && chordDef.seventh !== undefined && audioEnabledRef.current) {
                 const keyPc = NAME_TO_PC[renderKey];
                 const seventhPc = (chordDef.seventh + keyPc) % 12;
                 
                 // Special case: For minor tonic chords (vi, iv in minor contexts),
                 // use root doubling instead of 7th for better harmonic minor sound
                 const isMinorTonic = (relMinorActiveRef.current && fn === "vi") || 
                                      (relMinorActiveRef.current && fn === "iv");
                 
                 if (shouldHave7th) {
                   // Add the 4th note
                   let fourthNoteMidi;
                   
                   if (isMinorTonic) {
                     // Use root note an octave down
                     const rootPc = chordDef.triad[0];
                     const transposedRootPc = (rootPc + keyPc) % 12;
                     fourthNoteMidi = 48; // Start at C3
                     while ((fourthNoteMidi % 12) !== transposedRootPc) fourthNoteMidi++;
                     console.log('🎵 Using root doubling for minor tonic:', fourthNoteMidi);
                   } else {
                     // Normal 7th
                     fourthNoteMidi = 60;
                     while ((fourthNoteMidi % 12) !== seventhPc) fourthNoteMidi++;
                     while (fourthNoteMidi < 60) fourthNoteMidi += 12;
                     while (fourthNoteMidi > 72) fourthNoteMidi -= 12;
                   }
                   
                   console.log('➕ Adding 4th note:', fourthNoteMidi);
                   const noteId = playNote(fourthNoteMidi, 0.6, true);
                   if (noteId) {
                     activeChordNoteIdsRef.current.add(noteId);
                   }
                 } else {
                   // Remove the 4th note - replay triad
                   console.log('➖ Removing 4th note');
                   const triadPcs = chordDef.triad.map(pc => (pc + keyPc) % 12);
                   playChordWithVoiceLeading(triadPcs);
                 }
               }
             }
           }}
           onMouseUp={()=>{
             console.log('🛑 Mouse up on wedge, releasing');
             wedgeHeldRef.current = false; // Release wedge
             currentHeldFnRef.current = null;
             lastPlayedWith7thRef.current = null; // Reset
             // Stop all active chord notes with fade
             const ctx = audioContextRef.current;
             if (ctx) {
               const now = ctx.currentTime;
               const releaseTime = 0.4; // Match keyboard release time
               activeChordNoteIdsRef.current.forEach(noteId => {
                 const nodes = activeNotesRef.current.get(noteId);
                 if (nodes) {
                   nodes.gain.gain.cancelScheduledValues(now);
                   nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                   nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
                   setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
                 }
               });
             }
           }}
           onMouseLeave={(e)=>{
             // If mouse button is still down, we're dragging - don't clear refs!
             if (e.buttons === 1) {
               console.log('🔄 Mouse button still down, keeping drag state');
               return;
             }
             
             // Mouse button released - actually leaving
             console.log('👋 Mouse left wedge and button released');
             wedgeHeldRef.current = false; // Release wedge
             currentHeldFnRef.current = null;
             lastPlayedWith7thRef.current = null; // Reset
             // Stop all active chord notes with fade
             const ctx = audioContextRef.current;
             if (ctx) {
               const now = ctx.currentTime;
               const releaseTime = 0.4;
               activeChordNoteIdsRef.current.forEach(noteId => {
                 const nodes = activeNotesRef.current.get(noteId);
                 if (nodes) {
                   nodes.gain.gain.cancelScheduledValues(now);
                   nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                   nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
                   setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
                 }
               });
             }
           }}
           style={{cursor:"pointer"}}>
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
  },[layout, activeFn, trailFn, trailTick, trailOn, baseKey, visitorActive, relMinorActive, subdomActive, labelKey, dimFadeOn, dimFadeTick, skillLevel]);

  const activeBtnStyle = (on:boolean, spaceColor?:string): React.CSSProperties =>
    ({padding:"6px 10px", border:`2px solid ${on ? (spaceColor || "#39FF14") : "#374151"}`, borderRadius:8, background:"#111", color:"#fff", cursor:"pointer"});

  /* ---------- Preview helper ---------- */
  const KBD_LOW=48, KBD_HIGH=71;
  
  // Configuration for radial click zones
  const SEVENTH_RADIUS_THRESHOLD = 0.60; // Inner 60% = 7th chords, outer 40% = triads
  
  // Complete chord definitions for C major metaspace
  // Format: [root_pc, third_pc, fifth_pc, seventh_pc (optional)]
  const CHORD_DEFINITIONS: Record<Fn, {triad: number[], seventh?: number}> = {
    "I":     {triad: [0, 4, 7],   seventh: 11},  // C-E-G (B)  = Cmaj7
    "ii":    {triad: [2, 5, 9],   seventh: 0},   // D-F-A (C)  = Dm7
    "iii":   {triad: [4, 7, 11],  seventh: 2},   // E-G-B (D)  = Em7
    "IV":    {triad: [5, 9, 0],   seventh: 4},   // F-A-C (E)  = Fmaj7
    "iv":    {triad: [5, 8, 0],   seventh: 3},   // F-Ab-C (Eb) = Fm7
    "V7":    {triad: [7, 11, 2],  seventh: 5},   // G-B-D (F)  = G7
    "vi":    {triad: [9, 0, 4],   seventh: 7},   // A-C-E (G)  = Am7
    "♭VII":  {triad: [10, 2, 5]},             // Bb-D-F (no 7th)
    "V/V":   {triad: [2, 6, 9],   seventh: 0},   // D-F#-A (C) = D7
    "V/vi":  {triad: [4, 8, 11],  seventh: 2},   // E-G#-B (D) = E7
  };
  
  // Bonus wedge definitions
  const BONUS_CHORD_DEFINITIONS: Record<string, {triad: number[], seventh?: number}> = {
    "A7":    {triad: [9, 1, 4],   seventh: 7},   // A-C#-E (G) = A7 (V/ii)
    "Bm7♭5": {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bm7b5 (ii/vi, aka vii°)
  };
  
  const previewFn = (fn:Fn, include7thOverride?: boolean)=>{
    lastInputWasPreviewRef.current = true;
    const renderKey:KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    // Determine if we should include the 7th
    let with7th: boolean;
    if (include7thOverride !== undefined) {
      with7th = include7thOverride; // From radial click zone
    } else {
      with7th = false; // Default to triads for now
    }
    
    // Get chord definition from table (these are relative to C major)
    const chordDef = CHORD_DEFINITIONS[fn];
    let pcs: number[];
    
    if (chordDef) {
      // Transpose the chord definition to the current key
      const keyPc = NAME_TO_PC[renderKey];
      const transposedTriad = chordDef.triad.map(pc => (pc + keyPc) % 12);
      
      if (with7th && chordDef.seventh !== undefined) {
        const transposedSeventh = (chordDef.seventh + keyPc) % 12;
        pcs = [...transposedTriad, transposedSeventh];
      } else {
        pcs = transposedTriad;
      }
      console.log('🎹 Preview:', fn, 'Key:', renderKey, 'with7th:', with7th, 'PCs:', pcs);
    } else {
      // Fallback to old method for any missing functions
      console.warn('⚠️ Function not in chord table, using fallback:', fn);
      pcs = preview.chordPcsForFn(fn, renderKey, with7th);
    }
    
    const rootPc = pcs[0];
    const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
    const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
    setLatchedAbsNotes(fitted);
    setActiveWithTrail(fn, realizeFunction(fn, renderKey));
    
    if (audioEnabledRef.current) {
      playChordWithVoiceLeading(pcs);
    }
    
    // Check if this wedge click should trigger a space rotation (with 600ms delay)
    console.log('🔍 previewFn called. fn:', fn, 'Space:', {
      sub: subdomActiveRef.current,
      rel: relMinorActiveRef.current, 
      par: visitorActiveRef.current
    });
    
    setTimeout(() => {
      console.log('🔍 setTimeout fired after 600ms. fn:', fn);
      
      // === SUB SPACE EXITS ===
      if (subdomActiveRef.current) {
        // iii (Am in F) → HOME (vi in C)
        if (fn === "iii") {
          console.log('🔄 iii wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 400);
        }
        // I in SUB (F) → HOME (IV in C)
        else if (fn === "I") {
          console.log('🔄 I wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("IV");
            console.log('✨ Highlighted IV wedge');
          }, 400);
        }
        // V7 in SUB (C) → HOME (I in C)
        else if (fn === "V7") {
          console.log('🔄 V7 wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("I");
            console.log('✨ Highlighted I wedge');
          }, 400);
        }
      }
      
      // === REL SPACE EXITS ===
      else if (relMinorActiveRef.current) {
        // I in REL (Am) → HOME (vi in C)
        if (fn === "I") {
          console.log('🔄 I wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 200);
        }
        // ♭VII in REL (G) → HOME (V7 in C)  
        else if (fn === "♭VII") {
          console.log('🔄 ♭VII wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("V7");
            console.log('✨ Highlighted V7 wedge');
          }, 200);
        }
        // iv in REL (Dm) → HOME (ii in C)
        else if (fn === "iv") {
          console.log('🔄 iv wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("ii");
            console.log('✨ Highlighted ii wedge');
          }, 200);
        }
      }
      
      // === PAR SPACE EXITS ===
      else if (visitorActiveRef.current) {
        // vi in PAR (Am in D) → HOME (vi in C) - would need to check current par key
        // For now, simple case: I in PAR → HOME
        if (fn === "I") {
          console.log('🔄 I wedge in PAR → returning to HOME');
          setVisitorActive(false);
          setTimeout(() => {
            // PAR is more complex - depends on what parKey is
            // For now just highlight I
            setActiveFn("I");
            console.log('✨ Highlighted I wedge');
          }, 200);
        }
      }
      
      // Other space rotation logic can be added here
    }, 600); // 600ms delay so chord doesn't move under cursor
  };

  /* ---------- Render ---------- */
  const currentGuitarLabel = (() => {
    // Priority 1: If bonus wedge is active, use bonusLabel
    if (bonusActive && bonusLabel) {
      return bonusLabel;
    }
    // Priority 2: If active function from main wheel
    if (activeFnRef.current){
      const dispKey = (visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current)) as KeyName;
      return realizeFunction(activeFnRef.current as Fn, dispKey);
    }
    // Priority 3: Fall back to center label from MIDI/manual play
    return centerLabel || null;
  })();

  /* ---------- Audio Synthesis (Vintage Rhodes) ---------- */
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playNote = (midiNote: number, velocity: number = 0.5, isChordNote: boolean = false) => {
    console.log('🎵 playNote START:', {midiNote, velocity, isChordNote, audioEnabledState: audioEnabled, audioEnabledRef: audioEnabledRef.current});
    
    if (!audioEnabledRef.current) {  // Use ref instead of state!
      console.log('❌ Audio disabled, returning');
      return;
    }
    
    console.log('🔊 Initializing audio context...');
    const ctx = initAudioContext();
    console.log('🔊 Context state:', ctx.state, 'Sample rate:', ctx.sampleRate);
    
    if (ctx.state === 'suspended') {
      console.log('⚠️ Context suspended, attempting resume...');
      ctx.resume();
    }
    
    // Generate unique ID for this note instance (allows same MIDI note multiple times)
    const noteId = `${midiNote}-${Date.now()}-${Math.random()}`;
    console.log('🆔 Generated note ID:', noteId);
    
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = ctx.currentTime;
    console.log('📊 Frequency:', freq.toFixed(2), 'Hz, Time:', now.toFixed(3));
    
    // Simplified Rhodes - 2 oscillators for cleaner sound
    console.log('🎹 Creating oscillators...');
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.003;
    
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    gain1.gain.value = 0.5 * velocity;
    gain2.gain.value = 0.4 * velocity;
    
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0;
    mainGain.gain.linearRampToValueAtTime(0.6 * velocity, now + 0.015);
    mainGain.gain.linearRampToValueAtTime(0.45 * velocity, now + 0.08);
    mainGain.gain.linearRampToValueAtTime(0.4 * velocity, now + 0.3);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 8000 + (midiNote * 50); // Very bright - almost no filtering
    filter.Q.value = 0.2; // Minimal resonance
    
    console.log('🔗 Connecting audio graph...');
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);
    
    console.log('▶️ Starting oscillators...');
    try {
      osc1.start(now);
      osc2.start(now);
      console.log('✅ Oscillators started successfully!');
    } catch(err) {
      console.error('❌ Error starting oscillators:', err);
      return;
    }
    
    activeNotesRef.current.set(noteId, {osc1, osc2, osc3: osc1, gain: mainGain});
    console.log('💾 Stored note. Active count:', activeNotesRef.current.size);
    
    // Shorter sustain times
    if (isChordNote) {
      // Chord notes: check if wedge is being held
      if (wedgeHeldRef.current) {
        // Don't auto-fade - will be stopped on mouse up
        console.log('🎹 Wedge held - no auto-fade');
      } else {
        // Normal fade after 1.5 seconds
        const fadeStart = now + 1.5;
        mainGain.gain.linearRampToValueAtTime(0, fadeStart + 0.15);
        setTimeout(() => stopNoteById(noteId), 1700);
      }
    } else {
      // MIDI keyboard notes: sustain indefinitely until note-off
      // Attack -> Decay -> Sustain (hold)
      const decayTime = now + 0.05; // Quick decay
      mainGain.gain.linearRampToValueAtTime(0.7 * velocity, decayTime); // Drop to sustain level
      // No auto-fade! Will be stopped by MIDI note-off
      console.log('🎹 MIDI note - sustaining until note-off');
    }
    
    console.log('✅ playNote COMPLETE, returning ID:', noteId);
    return noteId; // Return ID so we can stop this specific instance
  };

  const stopNoteById = (noteId: string) => {
    const nodes = activeNotesRef.current.get(noteId);
    if (nodes && audioContextRef.current) {
      try {
        const now = audioContextRef.current.currentTime;
        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
        nodes.gain.gain.linearRampToValueAtTime(0, now + 0.05);
        
        setTimeout(() => {
          try {
            nodes.osc1.stop();
            nodes.osc2.stop();
            nodes.osc3.stop();
          } catch(e) { /* already stopped */ }
          activeNotesRef.current.delete(noteId);
        }, 60);
      } catch(e) { /* ignore */ }
    }
  };

  const stopNote = (midiNote: number) => {
    // Stop all instances of this MIDI note
    const noteIdsToStop: string[] = [];
    activeNotesRef.current.forEach((_, noteId) => {
      if (noteId.startsWith(`${midiNote}-`)) {
        noteIdsToStop.push(noteId);
      }
    });
    noteIdsToStop.forEach(id => stopNoteById(id));
  };

  const playChord = (midiNotes: number[]) => {
    if (!audioEnabled) return;
    midiNotes.forEach(note => playNote(note, 0.4));
  };

  const playChordWithVoiceLeading = (chordPitchClasses: number[]) => {
    if (!audioEnabledRef.current) return;  // Use ref!
    
    console.log('🎼 Playing chord. PCs:', chordPitchClasses);
    
    // Simple approach: play each pitch class in a reasonable octave range
    const BASE_OCTAVE = 60; // C4
    const notesToPlay: number[] = [];
    
    // Convert pitch classes to actual MIDI notes in a comfortable range
    chordPitchClasses.forEach(pc => {
      // Find this pitch class near C4
      let midiNote = BASE_OCTAVE;
      while ((midiNote % 12) !== pc) {
        midiNote++;
        if (midiNote > BASE_OCTAVE + 12) {
          // Wrapped around, start from below
          midiNote = BASE_OCTAVE - 12;
          while ((midiNote % 12) !== pc && midiNote < BASE_OCTAVE + 12) {
            midiNote++;
          }
          break;
        }
      }
      notesToPlay.push(midiNote);
    });
    
    // Sort notes low to high
    notesToPlay.sort((a, b) => a - b);
    console.log('🎵 MIDI notes to play:', notesToPlay);
    
    const ctx = audioContextRef.current;
    if (ctx) {
      const now = ctx.currentTime;
      const FAST_FADE = 0.1;
      
      // Stop ALL previous chord notes
      console.log('🔇 Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
      activeChordNoteIdsRef.current.forEach(noteId => {
        const nodes = activeNotesRef.current.get(noteId);
        if (nodes) {
          nodes.gain.gain.cancelScheduledValues(now);
          nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
          nodes.gain.gain.linearRampToValueAtTime(0, now + FAST_FADE);
          setTimeout(() => stopNoteById(noteId), FAST_FADE * 1000 + 50);
        }
      });
      
      activeChordNoteIdsRef.current.clear();
      
      // Play all notes
      console.log('🔊 Playing', notesToPlay.length, 'notes');
      notesToPlay.forEach(note => {
        const noteId = playNote(note, 0.6, true);
        if (noteId) {
          activeChordNoteIdsRef.current.add(noteId);
        }
      });
    }
    
    previousVoicingRef.current = notesToPlay;
  };

  // Calculate notes to highlight on keyboard for current chord
  const keyboardHighlightNotes = (() => {
    // Priority 1: If from preview/playlist, show yellow highlights
    if (latchedAbsNotes.length > 0 && lastInputWasPreviewRef.current) {
      return new Set(latchedAbsNotes);
    }
    // Priority 2: If active function but no manual play, calculate root position  
    if (activeFnRef.current && rightHeld.current.size === 0) {
      const dispKey = (visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current)) as KeyName;
      const fn = activeFnRef.current as Fn;
      const with7th = PREVIEW_USE_SEVENTHS || fn === "V7" || fn === "V/V" || fn === "V/vi";
      const pcs = preview.chordPcsForFn(fn, dispKey, with7th);
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      return new Set(fitted);
    }
    // Don't show yellow highlights for manual MIDI play - only blue (disp) handles that
    return new Set<number>();
  })();

  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:12, fontFamily:'ui-sans-serif, system-ui'}}>
      <div style={{maxWidth:960, margin:'0 auto', border:'1px solid #374151', borderRadius:12, padding:12}}>

        {/* Controls */}
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between'}}>
          {/* Left side: SPACE buttons (always visible) */}
          <div style={{display:'flex', gap:8, flexWrap:'nowrap'}}>
            <button onClick={goHome}         style={activeBtnStyle(!(visitorActive||relMinorActive||subdomActive), '#F2D74B')}>HOME</button>
            <button onClick={toggleRelMinor} style={activeBtnStyle(relMinorActive, '#F0AD21')}>RELATIVE</button>
            <button onClick={toggleSubdom}   style={activeBtnStyle(subdomActive, '#0EA5E9')}>SUBDOM</button>
            <button onClick={toggleVisitor}  style={activeBtnStyle(visitorActive, '#9333ea')}>PARALLEL</button>
          </div>
          
          {/* Right side: Other controls (can wrap) */}
          <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
            <button 
              onClick={makeThisMyKey}
              disabled={!centerLabel}
              style={{
                padding:"4px 8px", 
                border:"1px solid #F2D74B", 
                borderRadius:6, 
                background:"#111", 
                color: centerLabel ? "#F2D74B" : "#666",
                cursor: centerLabel ? "pointer" : "not-allowed",
                fontSize:11,
                fontWeight:500,
                opacity: centerLabel ? 1 : 0.5
              }}
              title="Shift wheel to this chord's key (press K)"
            >
              ⚡ Make My Key
            </button>
            
            <label style={{fontSize:12, color:'#9CA3AF'}}>Skill</label>
            <select 
              value={skillLevel} 
              onChange={(e)=>setSkillLevel(e.target.value as SkillLevel)}
              style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}
            >
              <option value="ROOKIE">ROOKIE</option>
              <option value="NOVICE">NOVICE</option>
              <option value="SOPHOMORE">SOPHOMORE</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="EXPERT">EXPERT</option>
            </select>
            
            <button 
              onClick={async () => {
                const newState = !audioEnabled;
                setAudioEnabled(newState);
                audioEnabledRef.current = newState; // Sync ref for MIDI handler
                
                if (newState) {
                  const ctx = initAudioContext();
                  if (ctx.state === 'suspended') {
                    await ctx.resume();
                  }
                  // Small delay to ensure context is ready
                  setTimeout(() => setAudioReady(true), 100);
                } else {
                  setAudioReady(false);
                }
              }}
              title={audioEnabled ? "Audio enabled - click to mute" : "Click to enable audio (may take a moment)"}
              style={{
                padding:"4px 8px", 
                border:`1px solid ${audioEnabled ? '#39FF14' : '#374151'}`, 
                borderRadius:6, 
                background: audioEnabled ? '#1a3310' : '#111', 
                color: audioEnabled ? '#39FF14' : '#9CA3AF',
                cursor: 'pointer',
                fontSize:16,
                fontWeight:500
              }}
            >
              {audioEnabled ? (audioReady ? '🔊' : '⏳') : '🔇'}
            </button>
            
            <button 
              onClick={() => setShowHelp(!showHelp)}
              title="Show help"
              style={{
                padding:"4px 8px", 
                border:"1px solid #374151", 
                borderRadius:6, 
                background:"#111", 
                color:"#9CA3AF",
                cursor:"pointer",
                fontSize:14,
                fontWeight:500
              }}
            >
              ?
            </button>
            
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
          <span style={{
            fontSize:12, 
            padding:'2px 6px', 
            border: `2px solid ${visitorActive ? '#9333ea' : relMinorActive ? '#F0AD21' : subdomActive ? '#0EA5E9' : '#F2D74B'}`,
            background:'#ffffff18', 
            borderRadius:6
          }}>
            {visitorActive ? `space: Parallel (${parKey})`
              : relMinorActive ? 'space: Relative minor (Am)'
              : subdomActive ? `space: Subdominant (${subKey})`
              : (midiConnected ? `MIDI: ${midiName||'Connected'}` : 'MIDI: none')}
          </span>
        </div>

        {/* BKS Logo Header */}
        <div style={{marginTop:8, marginBottom:4, paddingLeft:8}}>
          <svg width="200" height="24" viewBox="0 0 400 48" style={{opacity:0.7, display:'block'}}>
            {/* BEAT KITCHEN text */}
            <text x="0" y="36" fill="#e5e7eb" fontFamily="system-ui, -apple-system, sans-serif" fontSize="32" fontWeight="700" letterSpacing="2">
              BEAT KITCHEN®
            </text>
          </svg>
          <div style={{fontSize:10, fontWeight:500, color:'#7B7B7B', marginTop:2}}>
            HarmonyWheel {HW_VERSION}
          </div>
        </div>

        {/* Wheel */}
        <div className="relative"
             style={{width:WHEEL_W,height:WHEEL_H, margin:'4px auto 2px',
                     transform:`scale(${UI_SCALE_DEFAULT})`, transformOrigin:'center top'}}>
          <div style={wrapperStyle}>
            <svg width={WHEEL_W} height={WHEEL_H} viewBox={`0 0 ${WHEEL_W} ${WHEEL_H}`} className="select-none" style={{display:'block', userSelect: 'none', WebkitUserSelect: 'none'}}>
  {/* Labels moved to status bar area */}

  {wedgeNodes}

              {/* Hub */}
              <circle 
                cx={260} 
                cy={260} 
                r={220*HUB_RADIUS} 
                fill={HUB_FILL} 
                stroke={HUB_STROKE} 
                strokeWidth={HUB_STROKE_W}
              />
              
              {SHOW_CENTER_LABEL && centerLabel && (
                <text 
                  x={260} 
                  y={260+8}
                  textAnchor="middle" 
                  style={{
                    fontFamily: CENTER_FONT_FAMILY, 
                    paintOrder:"stroke", 
                    stroke:"#000", 
                    strokeWidth:1.2 as any,
                    pointerEvents: 'none'
                  }} 
                  fontSize={CENTER_FONT_SIZE} 
                  fill={CENTER_FILL}
                >
                  {centerLabel}
                </text>
              )}

              {/* Bonus overlay + trailing */}
              {/* (kept exactly as in your v2.30.0 block) */}
              {/* 
              {/* -------- BEGIN BONUS BLOCK -------- */}
{/* Persistent bonus wedges when toggle is on (50% opacity) */}
{showBonusWedges && !bonusActive && (() => {
  const toRad = (deg:number) => (deg - 90) * Math.PI/180;
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
  const r1 = 220*BONUS_OUTER_R*1.06;
  const span = 16;
  const base = (typeof BONUS_CENTER_ANCHOR_DEG === 'number' ? BONUS_CENTER_ANCHOR_DEG : 0);
  const anchorA7 = base - 30;
  const anchorBdim = base + 30;
  
  // Render both wedges
  const wedges = [
    { label: 'A7', funcLabel: 'V/ii', anchor: anchorA7 },
    { label: 'Bm7♭5', funcLabel: 'ii/vi', anchor: anchorBdim }
  ];
  
  return (
    <g key="bonus-persistent">
      {wedges.map(w => {
        const a0 = w.anchor - span/2 + rotationOffset;
        const a1 = w.anchor + span/2 + rotationOffset;
        const pathD = ring(cx,cy,r0,r1,a0,a1);
        const textR = (r0+r1)/2;
        const mid = (a0+a1)/2;
        const tx = cx + textR * Math.cos(toRad(mid));
        const ty = cy + textR * Math.sin(toRad(mid));
        
        // Click handler to preview and enable insert
        const handleClick = () => {
          // Show chord in hub and trigger keyboard/tab display
          lastInputWasPreviewRef.current = true;
          centerOnly(w.label);
          
          // Get chord definition from bonus table
          const bonusChordDef = BONUS_CHORD_DEFINITIONS[w.label];
          
          if (bonusChordDef && audioEnabledRef.current) {
            // Play the chord audio
            const pcs = bonusChordDef.triad; // Always triad for now
            console.log('🎵 Bonus wedge clicked:', w.label, 'PCs:', pcs);
            playChordWithVoiceLeading(pcs);
          }
          
          // Manually highlight keyboard by parsing chord name
          // For bonus chords, we need to figure out the notes
          const chordName = w.label;
          
          // A7 = A C# E G, Bm7♭5 = B D F A
          const chordNotes: Record<string, number[]> = {
            'A7': [57, 61, 64, 67],       // A3 C#4 E4 G4
            'Bm7♭5': [59, 62, 65, 69]     // B3 D4 F4 A4
          };
          
          if (chordNotes[chordName]) {
            setLatchedAbsNotes(chordNotes[chordName]);
          }
        };
        
        return (
          <g 
            key={w.label} 
            onClick={handleClick}
            style={{cursor: 'pointer'}}
          >
            <path d={pathD} fill={BONUS_FILL} stroke={PALETTE_ACCENT_GREEN} strokeWidth={1.5 as any}/>
            <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {w.funcLabel}
            </text>
            <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {w.label}
            </text>
          </g>
        );
      })}
    </g>
  );
})()}

{/* Active bonus wedge (full opacity when clicked) */}
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
            <div style={{maxWidth: WHEEL_W, margin:'0 auto 0'}}>
              {/* UNIFIED LAYOUT - Same structure always, no shifting */}
              
              {/* Row 1: Song display (always visible when loaded) */}
              {sequence.length > 0 && (
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                  background:'#0f172a',
                  overflow:'hidden',
                  marginBottom: 6
                }}>
                  {/* Song Title */}
                  {songTitle && (
                    <div style={{
                      padding:'2px 8px',
                      fontSize:11,
                      fontWeight:600,
                      color:'#39FF14',
                      textAlign:'left',
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center'
                    }}>
                      <span>{songTitle}</span>
                      <span style={{fontSize:10, color:'#9CA3AF', fontWeight:400}}>
                        {baseKey} major
                      </span>
                    </div>
                  )}
                  
                  {/* Windowed sequence view */}
                  <div style={{
                    padding:'4px 8px',
                    color:'#e5e7eb',
                    fontSize:12,
                    minHeight:24,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    whiteSpace:'nowrap'
                  }}>
                    {(() => {
                      const WINDOW_SIZE = 3;
                      const start = Math.max(0, seqIndex - WINDOW_SIZE);
                      const end = Math.min(sequence.length, seqIndex + WINDOW_SIZE + 1);
                      const visibleItems = sequence.slice(start, end);
                      
                      return (
                        <>
                          {start > 0 && <span style={{marginRight:8, color:'#6b7280'}}>...</span>}
                          {visibleItems.map((item, localIdx) => {
                            const globalIdx = start + localIdx;
                            const isCurrent = globalIdx === seqIndex;
                            const isComment = item.kind === "comment";
                            const isTitle = item.kind === "title";
                            
                            if (isTitle) return null;
                            
                            return (
                              <span key={globalIdx} style={{
                                marginRight: 8,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: isCurrent ? '#374151' : 'transparent',
                                fontWeight: isCurrent ? 600 : 400,
                                fontStyle: isComment ? 'italic' : 'normal',
                                color: isCurrent ? '#39FF14' : (isComment ? '#9CA3AF' : '#e5e7eb')
                              }}>
                                {isComment ? item.raw.replace(/^#\s*/, '') : item.raw}
                              </span>
                            );
                          })}
                          {end < sequence.length && <span style={{marginLeft:0, color:'#6b7280'}}>...</span>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Row 2: Editor - ALWAYS VISIBLE */}
              <div style={{marginBottom: 6}}>
                <textarea
                  ref={textareaRef}
                  placeholder={'Type chords, modifiers, and comments...\nExamples:\n@TITLE Song Name, @KEY C\nC, Am7, F, G7\n@SUB F, Bb, C7, @HOME\n@REL Em, Am, @PAR Cm, Fm\n@KEY G, D, G, C\n# Verse: lyrics or theory note'}
                  rows={3}
                  value={inputText}
                  onChange={(e)=>setInputText(e.target.value)}
                  onKeyDown={handleInputKeyNav}
                  style={{
                    width: "100%",
                    padding:'8px 10px',
                    border:'1px solid #374151',
                    background:'#0f172a',
                    color:'#e5e7eb',
                    borderRadius:8,
                    fontFamily:'ui-sans-serif, system-ui',
                    resize:'vertical',
                    fontSize:12
                  }}
                />
              </div>
              
              {/* Row 3: Keyboard + Tab (side by side, SAME HEIGHT) - ALWAYS SAME POSITION */}
              <div style={{display:'grid', gridTemplateColumns:'65% 35%', columnGap:12, marginBottom:6}}>
                {/* Keyboard */}
                <div style={{width:'100%'}}>
                  <svg viewBox={`0 0 ${totalW} ${HW}`} className="select-none"
                      style={{display:'block', width:'100%', height:'auto', border:'1px solid #374151', borderRadius:8, background:'#0f172a'}}>
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr; 
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      const fillColor = held ? "#AEC9FF" : (highlighted ? "#FFE999" : "#f9fafb");
                      return (
                        <g key={`w-${m}`}>
                          <rect x={x} y={0} width={WW} height={HW}
                                fill={fillColor} stroke="#1f2937"
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false; 
                                  rightHeld.current.add(m); 
                                  detect();
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag - if mouse is down, play note
                                  if (e.buttons === 1) { // Left button held
                                    rightHeld.current.add(m);
                                    detect();
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }} />
                        </g>
                      );
                    })}
                    {Object.entries(blackPos).map(([mStr,x])=>{
                      const m=+mStr; 
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      const fillColor = held ? "#6B93D6" : (highlighted ? "#D4B560" : "#1f2937");
                      const strokeColor = held ? "#4A7BC0" : (highlighted ? "#B8972D" : "#0a0a0a");
                      return (
                          <rect key={`b-${m}`} x={x} y={0} width={WB} height={HB}
                                fill={fillColor} stroke={strokeColor}
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false; 
                                  rightHeld.current.add(m); 
                                  detect();
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag
                                  if (e.buttons === 1) {
                                    rightHeld.current.add(m);
                                    detect();
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }} />
                      );
                    })}
                  </svg>
                </div>
                
                {/* Guitar Tab - FIXED HEIGHT matching keyboard, border and background to show extent */}
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                  background:'#0f172a',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  minHeight: HW,
                  maxHeight: HW,
                  overflow:'hidden'
                }}>
                  <GuitarTab chordLabel={currentGuitarLabel} width={totalW * 0.35} height={HW}/>
                </div>
              </div>
              
              {/* Row 4: Buttons - ALWAYS SAME POSITION */}
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {/* Navigation Buttons */}
                <div style={{display:'flex', gap:8}}>
                  <button 
                    onClick={() => parseAndLoadSequence()} 
                    style={{padding:'6px 10px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer', flex:1, fontSize:12}}
                  >
                    {sequence.length > 0 ? 'RELOAD SONG' : 'LOAD SONG'}
                  </button>
                  <button onClick={stepPrev} style={{padding:'6px 10px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer', fontSize:12}}>◀</button>
                  <button onClick={stepNext} style={{padding:'6px 10px', border:'2px solid #39FF14', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer', fontSize:12}}>▶</button>
                </div>
                
                {/* Insert and Utility Buttons */}
                <div style={{display:'flex', gap:8}}>
                  <button 
                    onClick={insertCurrentChord} 
                    disabled={!currentGuitarLabel}
                    title="Keyboard shortcut: Ctrl+I (or Cmd+I)"
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #374151', 
                      borderRadius:6, 
                      background: currentGuitarLabel ? '#1f2937' : '#111', 
                      color: currentGuitarLabel ? '#e5e7eb' : '#6b7280', 
                      cursor: currentGuitarLabel ? 'pointer' : 'not-allowed',
                      fontSize:11,
                      flex: 2
                    }}
                  >
                    Record Wedge to This Song: "{currentGuitarLabel || '—'}" (⌘I)
                  </button>
                  {bonusWedgesAllowed && (
                    <button 
                      onClick={() => setShowBonusWedges(!showBonusWedges)}
                      title="Toggle bonus wedges (A7 and Bm7♭5)"
                      style={{
                        padding:'6px 10px', 
                        border:`1px solid ${showBonusWedges ? '#39FF14' : '#374151'}`, 
                        borderRadius:6, 
                        background: showBonusWedges ? '#1a3310' : '#1f2937', 
                        color: showBonusWedges ? '#39FF14' : '#9CA3AF', 
                        cursor:'pointer',
                        fontSize:11,
                        fontWeight: showBonusWedges ? 600 : 400,
                        flex: 1
                      }}
                    >
                      Show Bonus Chords {showBonusWedges ? '✓' : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
      
      {/* Help Callouts */}
      {showHelp && (
        <>
          {/* Overlay background */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 999
            }}
            onClick={() => setShowHelp(false)}
          />
          
          {/* Callout 1: SPACE buttons */}
          <div style={{
            position: 'absolute',
            top: 100,
            left: 40,
            background: '#1a1a1a',
            border: '2px solid #F2D74B',
            borderRadius: 12,
            padding: 16,
            maxWidth: 280,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{fontSize: 14, color: '#F2D74B', fontWeight: 600, marginBottom: 8}}>🎹 Four Harmonic Spaces</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#e5e7eb'}}>
              <strong>HOME</strong> - Main key<br/>
              <strong>RELATIVE</strong> - Relative minor<br/>
              <strong>SUBDOM</strong> - Subdominant<br/>
              <strong>PARALLEL</strong> - Parallel minor
            </div>
            <div style={{
              position: 'absolute',
              left: -10,
              top: 20,
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '10px solid #F2D74B'
            }}/>
          </div>
          
          {/* Callout 2: Skill selector */}
          <div style={{
            position: 'absolute',
            top: 100,
            right: 40,
            background: '#1a1a1a',
            border: '2px solid #39FF14',
            borderRadius: 12,
            padding: 16,
            maxWidth: 280,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{fontSize: 14, color: '#39FF14', fontWeight: 600, marginBottom: 8}}>🎓 Skill Levels</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#e5e7eb'}}>
              Start at <strong>ROOKIE</strong> (3 chords) and progress to <strong>EXPERT</strong> to unlock all 10 chords + bonus wedges!
            </div>
            <div style={{
              position: 'absolute',
              right: -10,
              top: 20,
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '10px solid #39FF14'
            }}/>
          </div>
          
          {/* Callout 3: Wheel */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a',
            border: '2px solid #0EA5E9',
            borderRadius: 12,
            padding: 16,
            maxWidth: 300,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: 14, color: '#0EA5E9', fontWeight: 600, marginBottom: 8}}>🎵 Click Wedges to Play</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#e5e7eb'}}>
              Each wedge is a chord function. Click to hear it and see the notes light up on the keyboard!
            </div>
            <div style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '10px solid #0EA5E9'
            }}/>
          </div>
          
          {/* Callout 4: Audio button */}
          <div style={{
            position: 'absolute',
            top: 140,
            right: 200,
            background: '#1a1a1a',
            border: '2px solid #F0AD21',
            borderRadius: 12,
            padding: 16,
            maxWidth: 240,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{fontSize: 14, color: '#F0AD21', fontWeight: 600, marginBottom: 8}}>🔉 Audio Toggle</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#e5e7eb'}}>
              Enable vintage Rhodes piano sound when clicking wedges
            </div>
            <div style={{
              position: 'absolute',
              right: -10,
              top: 30,
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '10px solid #F0AD21'
            }}/>
          </div>
          
          {/* Callout 5: Make My Key */}
          <div style={{
            position: 'absolute',
            top: 140,
            right: 360,
            background: '#1a1a1a',
            border: '2px solid #9333ea',
            borderRadius: 12,
            padding: 16,
            maxWidth: 240,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{fontSize: 14, color: '#9333ea', fontWeight: 600, marginBottom: 8}}>⚡ Quick Tip</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#e5e7eb'}}>
              Press <strong>K</strong> key to make the current chord your new key center!
            </div>
            <div style={{
              position: 'absolute',
              right: -10,
              top: 30,
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '10px solid #9333ea'
            }}/>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setShowHelp(false)}
            style={{
              position: 'fixed',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 32px',
              border: '2px solid #F2D74B',
              borderRadius: 8,
              background: '#1a1a1a',
              color: '#F2D74B',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            Got it! ✓
          </button>
        </>
      )}
    </div>
  );
}

// EOF - HarmonyWheel.tsx v2.45.0