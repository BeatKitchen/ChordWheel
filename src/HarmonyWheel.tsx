/*
 * HarmonyWheel.tsx — v4.1.9 🎯 FIXED: FUNCTIONAL DIMS ALWAYS USE SHARP NAMES
 *
 *
 * 🔧 v4.1.9 CHANGES (CRITICAL):
 * - FIXED: Functional diminished chords now ALWAYS use sharp names (C#, F#, G#)
 * - Theory.ts v4.1.9: Relative PC 1/6/8 → SHARP_NAMES[pc] (not pcNameForKey)
 * - Reason: Named after THIRD of dominant - major thirds are always sharp
 * - Result: Key F + C#dim7 → "C#dim7" (not "Dbdim7") ✓
 * - Examples: A7 third=C#, D7 third=F#, E7 third=G# (in ALL keys)
 *
 * 🔧 v4.1.8 CHANGES:
 * - Diminished chord naming now FULLY functional (transposes correctly to all keys)
 * - Theory.ts v4.1.8: dimRootName() uses RELATIVE PC to determine functional dims
 * - System is now 100% function-centric
 *
 * 🔧 v4.1.7b CHANGES:
 * - FIXED: Keyboard erasers now display for single notes and intervals (not just chords)
 * - Theory.ts v4.1.7b: internalAbsoluteName() returns note names for 1-2 note inputs
 * - Single note shows note name (e.g., "C") with blue eraser (treated as root)
 * - Dyad shows lowest note name with blue eraser
 * - Result: Playing any notes (1, 2, or 3+) shows erasers on keyboard ✓
 *
 * 🔧 v4.1.7 CHANGES (CRITICAL):
 * - FIXED: Diminished chord false positives (Bbdim7 in key G no longer lights V/V wedge)
 * - Mapping.ts v4.1.7: Root-based dim chord detection using RELATIVE PC (not set-based)
 * - Detection uses RELATIVE PC (function-centric) across all keys ✓
 *
 * 🔧 v4.1.4 CHANGES:
 * - FIXED: Key selector now works for MIDI detection (was using stale state in detectV4)
 * - CRITICAL: detectV4() now uses baseKeyRef.current instead of effectiveBaseKey state
 * - ISSUE: React state updates async, but MIDI input arrives sync → stale closure
 * - SOLUTION: Calculate effectiveKey from baseKeyRef (always fresh) not state
 * - Result: Change key to D, play D major → I wedge lights correctly ✓
 *
 * 🔧 v4.1.3 CHANGES:
 * - FIXED: Step forward/backward buttons now call detectV4() to update wheel display
 * - FIXED: Comment navigation buttons (<<, >>) now call detectV4() to update display
 * - FIXED: Transposed chords now auto-adjust octave to fit keyboard range (48-71)
 * - ISSUE: Before v4 engine, step buttons worked; v4 refactor broke adapter connection
 * - SOLUTION: Apply same MIDI state + detectV4() pattern used in playback timer
 * - Result: Step buttons show correct wedge lighting, transposed chords always visible
 *
 * 🔧 v4.1.2 CHANGES:
 * - FIXED: Key selector now shows transposed key (effectiveBaseKey) with orange tint
 * - FIXED: Key selector disabled/dimmed when transpose active (can't change key)
 * - FIXED: Transpose now works WITH @KEY directive (removed v3.5.0 blocking)
 * - FIXED: Extra erasers (2 octaves) when transposed - deduplicate by pitch class
 * - FIXED: Missing 4-note chord versions - use 7th when CHORD_DEFINITIONS fallback
 * - FIXED: Sequencer infinite loop (removed latchedAbsNotes from useEffect deps)
 * - FIXED: Base key "moving target" bug (sync baseKeyRef to baseKey, not effectiveBaseKey)
 * - FIXED: Voice leading octave bug (save transposed notes AFTER transpose)
 * - FIXED: Double transpose bug (skip transpose in detectV4 for sequencer notes)
 * - Result: Transpose +5 now works correctly (Fmaj7 → Bbmaj7), key selector shows F
 *
 * 🔧 v4.1.1 CHANGES:
 * - FIXED: Keyboard display now syncs with sequencer audio (was 1 token behind)
 * - REMOVED: detectV4() call from applySeqItem() at line 2180 (caused lag)
 * - ADDED: detectV4() call in playback timer right before playChord() at line 2808
 * - Result: Display updates when audio plays, not before - visual and audio synchronized
 *
 * 🔧 v4.1.0 CHANGES (MAJOR):
 * - RESTORED: Dual-key architecture (effectiveKey + baseKey) for correct space mappings
 * - RESTORED: Space transition chord re-mapping (Gm enters SUB → lights ii wedge)
 * - RESTORED: Always re-map ALL space transitions (prevents false bonus wedges)
 * - RESTORED: Triple-tap V/V7 exits SUB (C triad in key C)
 * - FIXED: Performance pad keys (1-12) now work reliably - synchronous ref update
 * - FIXED: @RHYTHM directives parse from full input (not stopping at marker)
 * - Engine: v4.0.70 (index.ts), v4.0.65 (spaces.ts)
 * - Result: All space transitions work, wedges light correctly, performance pads reliable
 *
 * 🔧 v4.0.52 CHANGES:
 * - FIXED: @KEY directive now RE-APPLIES when pressing ⏮️ (Go to Start) or ⏯️ (Play/Pause)
 * - FIXED: Continuous playback (⏯️) now produces sound (was reading stale ref)
 * - FIXED: Play/Pause button uses returned notes from applySeqItem
 * - ADDED: Debug logging for KEY directive re-application
 * - Result: Key resets correctly, sequencer plays sound
 *
 * 🔧 v4.0.51 CHANGES:
 * - FIXED: @KEY directive now applies correctly (was checking only index 0, not after TITLE)
 * - FIXED: Sequencer playback now produces sound (mapping works in correct key)
 * - FIXED: White key erasers moved down to +25 (user requested 50% more than +10)
 * - CLEANED: Reduced verbose logging (bar parsing, parse markers)
 * - Result: Sequencer works, key changes apply, erasers positioned correctly
 * 
 * 🔧 v4.0.50 CHANGES:
 * - FIXED: White key erasers repositioned (was too high at 0.54, now 0.56+10)
 * - FIXED: Note spelling now uses flat names (Eb not D#) based on key context
 * - Changed: Both white and black keys use chordRootForLookup for pcNameForKey()
 * - Result: Erasers visible, notes spelled correctly in key context
 * 
 * 🔧 v4.0.49 CHANGES:
 * - FIXED: Calendar ticker now filters by subcalendar IDs (13985904, 13985917)
 * - FIXED: White key erasers moved DOWN 30px (user feedback) <- THIS CAUSED BUG
 * - FIXED: Circular key labels moved UP 10px
 * - FIXED: Circle stroke width reduced to 1px (was 2px)
 * 🔧 v4.0.48 CHANGES:
 * - FIXED: White key erasers moved HIGHER (y = HW * 0.56 + 10, was 0.62 + 30)
 * - User feedback: erasers and labels were too low
 * 
 * 🔧 v4.0.47 CHANGES:
 * - FIXED: Copied EXACT eraser formulas from reference file (OLD-do_not_use)
 * - White keys: y = HW * 0.62 + 30 (not 0.56)
 * - Black keys: Uses WB dimensions, y = HB * 0.55 + 5
 * 
 * 🔧 v4.0.46 CHANGES:
 * - FIXED: Reverted black key erasers to old working formula (same as white keys)
 * - Black and white keys now use identical positioning (looks better per user feedback)
 * 
 * 🔧 v4.0.45 CHANGES:
 * - FIXED: All version numbers now consistent (v4.0.45 everywhere)
 * - IMPROVED: Bigger guitar tab display (scale 1.5x, larger container)
 * 
 * 🔧 v4.0.39 CHANGES:
 * - **SEQUENCER FIX**: Use latchedAbsNotesRef instead of state (async issue)
 *   • State updates are async, so sequencer was playing old chord
 *   • Now uses ref for immediate access to current notes
 * - **ERASER ADJUST**: y: HW * 0.56 (slightly lower than 0.50)
 * - **TAB SCALE**: 1.3x scale to overflow container, hide border
 * - Previous: Engine F#dim fix, tab height, logs cleanup
 * 
 * 🚀 V4.0.0 MAJOR REFACTOR:
 * - NEW: Pure engine architecture (detection → mapping → spaces → stability)
 * - NEW: 12-wedge system (V/ii and ii/vi are first-class wedges)
 * - NEW: Feature flag (USE_NEW_ENGINE) for safe rollback
 * - FIXED: Bonus wedges now work in ALL 12 keys (was: only in C)
 * - FIXED: A major, Bdim, C#dim now light correct wedges
 * - FIXED: Function-based rendering (no more label string matching)
 * - Engine: src/lib/engine/ (detection, mapping, spaces, stability, index)
 * - Adapter: detectV4() function (line ~5049)
 * - Fallback: Old detect() preserved (set USE_NEW_ENGINE=false to revert)
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Fn, KeyName } from "./lib/types";
import {
  FN_COLORS, FN_LABEL_COLORS, HUB_RADIUS, HUB_FILL, HUB_STROKE, HUB_STROKE_W,
  CENTER_FONT_FAMILY, CENTER_FONT_SIZE, CENTER_FILL,
  WHEEL_W, WHEEL_H, VISITOR_ROTATE_DEG, ROTATION_ANIM_MS,
  BONUS_CENTER_ANCHOR_DEG, BONUS_OUTER_R, BONUS_INNER_R, BONUS_FILL,
  BONUS_TEXT_FILL, BONUS_TEXT_SIZE, RING_FADE_MS, WEDGE_ANCHOR_DEG, BONUS_WEDGE_POSITIONS
} from "./lib/config";

// v4.0.0 Engine imports
import { detectAndMap, createEngineState, updateEngineState, type EngineResult, type EngineState } from "./lib/engine";

import GuitarTab from "./components/GuitarTab";

// v3.1.0: Help overlay with visual callouts
import HelpOverlay from "./components/HelpOverlay";

// v3.1.0: Circular skill selector with radial text
import SkillWheel from "./components/SkillWheel";

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
import { defaultSong, demoSongs, DEFAULT_BANNER } from "./data/demoSongs";
import { 
  generateShareableURL, 
  getSongFromURL, 
  exportSongToFile, 
  importSongFromFile,
  copyToClipboard,
  parseSongMetadata
} from "./lib/songManager";

const HW_VERSION = 'v4.1.9';

// v4.0.24: Fallback constants for old code (not used by new engine)
const EPS_DEG = 0.1;
const MIDI_SUPPORTED = typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
const BONUS_OVERLAY = true;
const DIM_FADE_MS = 300;
const SHOW_CENTER_LABEL = true;
const SHOW_WEDGE_LABELS = true;
const PREVIEW_USE_SEVENTHS = true;
const IV_ROTATE_DEG = -168;  // ✅ v4.1.6: Restored SUB entry 180° rotation animation
const JIGGLE_DEG = 30;       // ✅ v4.1.6: Increased HOME return jiggle to 30° (was 2°)
const JIGGLE_MS = 120;       // ✅ v4.1.6: Slightly increased jiggle timing
const BONUS_DEBOUNCE_MS = 50;
const PALETTE_ACCENT_GREEN = '#7CFF4F'; // palette green for active outlines

import { DIM_OPACITY } from "./lib/config";


export default function HarmonyWheel(){
  // v3.1.0: Skill level icon paths (from public folder)
  const skillIcons = {
    ROOKIE: "/assets/rookie.png",
    NOVICE: "/assets/novice.png",
    SOPHOMORE: "/assets/sophomore.png",
    ADVANCED: "/assets/advanced.png",
    EXPERT: "/assets/expert.png",
  };
  /* ---------- Core state ---------- */
  const [baseKey,setBaseKey]=useState<KeyName>("C");
  
  // Transpose state - must be declared early for effectiveBaseKey calculation
  const [transpose, setTranspose] = useState(0); // Semitones (-12 to +12)
  const [transposeBypass, setTransposeBypass] = useState(false); // Temporarily disable transpose
  
  // Skill level system
  type SkillLevel = "ROOKIE" | "NOVICE" | "SOPHOMORE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("ADVANCED");
  const skillLevelRef = useRef<SkillLevel>("ADVANCED");
  
  // Define which functions are visible at each level (cumulative)
  const SKILL_LEVEL_FUNCTIONS: Record<SkillLevel, Fn[]> = {
    "ROOKIE": ["I", "IV", "V", "V7"],  // ✅ Added V (plain triad)
    "NOVICE": ["I", "IV", "V", "V7", "vi"],  
    "SOPHOMORE": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi"],  
    "INTERMEDIATE": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"],  
    "ADVANCED": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "V/ii", "ii", "iii", "♭VII", "iv", "ii/vi"],  // ✅ Added V/ii and Bm7♭5
    "EXPERT": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "V/ii", "ii", "iii", "♭VII", "iv", "ii/vi"]  // ✅ Added V/ii and Bm7♭5
  };
  
  // Check if a function is visible at current skill level
  const isFunctionVisible = (fn: Fn): boolean => {
    return SKILL_LEVEL_FUNCTIONS[skillLevel].includes(fn);
  };
  
  // 🚀 v4.0.0 Feature Flag
  const USE_NEW_ENGINE = true;
  
  // Bonus wedges available in ADVANCED and EXPERT
  const bonusWedgesAllowed = skillLevel === "ADVANCED" || skillLevel === "EXPERT";
  

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

  // PHASE 2B: Dynamic SUB and PAR keys (not hardcoded!)
  // SUB = IV of baseKey (F when base=C, Db when base=Ab, A when base=E, etc.)
  // PAR = ⏺™­VI of baseKey (Eb when base=C, Cb when base=Ab, G when base=E, etc.)
  const subKey = useMemo(() => getSubKey(baseKey), [baseKey]);
  const parKey = useMemo(() => getParKey(baseKey), [baseKey]);
  
  // Helper: Transpose a key name by N semitones
  const transposeKey = (key: KeyName, semitones: number): KeyName => {
    const pc = NAME_TO_PC[key];
    const newPc = (pc + semitones + 12) % 12;
    const result = FLAT_NAMES[newPc]; // Always use flat names for keys
    return result;
  };
  
  // ✅ v3.6.7 FIX: Calculate transpose and effective key EARLY so patterns can use it
  const effectiveTranspose = transposeBypass ? 0 : transpose;
  const effectiveBaseKey = effectiveTranspose !== 0 ? transposeKey(baseKey, effectiveTranspose) : baseKey;
  
  // Dynamic VISITOR_SHAPES (PAR entry chords) - uses effectiveBaseKey (respects transpose!)
  const visitorShapes = useMemo(() => getVisitorShapesFor(effectiveBaseKey), [effectiveBaseKey]);
  
  // Dynamic diatonic matching tables for HOME and PAR spaces - uses effectiveBaseKey (respects transpose!)
  const homeDiatonic = useMemo(() => getDiatonicTablesFor(effectiveBaseKey), [effectiveBaseKey]);
  
  // ✅ v3.6.0 FIX: Ensure baseKeyRef always syncs with baseKey state
  // Critical for sequencer to use correct key context
  useEffect(() => {
    console.log('ðŸ”‘ [v3.6.0] baseKey synced to ref:', baseKey);
    baseKeyRef.current = baseKey;
  }, [baseKey]);
  const parDiatonic = useMemo(() => getDiatonicTablesFor(parKey), [parKey]);

  const [activeFn,setActiveFn]=useState<Fn|"">("I");
  const activeFnRef=useRef<Fn|"">("I"); useEffect(()=>{activeFnRef.current=activeFn;},[activeFn]);

  // ✅ Intro animation state
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [introStep, setIntroStep] = useState(0);

  const [centerLabel,setCenterLabel]=useState("C");
  const lastPlayedChordRef = useRef<string>("C"); // Track for Make My Key
  const lastDetectedChordRef = useRef<string>("C"); // From theory.ts - pure MIDI detection

  const [visitorActive,_setVisitorActive]=useState(false);
  const visitorActiveRef=useRef(false);
  const setVisitorActive=(v:boolean)=>{ 
    // ✅ Space lock protection at setter level
    if (spaceLocked && v !== visitorActiveRef.current) return;
    visitorActiveRef.current=v; _setVisitorActive(v); 
  };

  const [relMinorActive,_setRelMinorActive]=useState(false);
  const relMinorActiveRef=useRef(false);
  const setRelMinorActive=(v:boolean)=>{ 
    // ✅ Space lock protection at setter level
    if (spaceLocked && v !== relMinorActiveRef.current) return;
    relMinorActiveRef.current=v; _setRelMinorActive(v); 
  };

  // SUB (F)
  const [subdomActive,_setSubdomActive]=useState(false);
  const subdomActiveRef=useRef(false);
  const setSubdomActive=(v:boolean)=>{ 
    // ✅ Space lock protection at setter level
    if (spaceLocked && v !== subdomActiveRef.current) return;
    subdomActiveRef.current=v; _setSubdomActive(v); 
  };
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

  // Regular rotation (relative/parallel). SUB doesn⏺€™t hold persistent rotation.
  useEffect(()=>{
    if(relMinorActive || visitorActive) setTargetRotation(VISITOR_ROTATE_DEG);
    else if(!subdomActive) setTargetRotation(0);
  },[relMinorActive, visitorActive, subdomActive]);

  /* ---------- Bonus + trails ---------- */
  const [bonusActive,setBonusActive]=useState(false);
  const [bonusLabel,setBonusLabel]=useState("");
  const [bonusFunction,setBonusFunction]=useState<Fn | null>(null); // Track which function the bonus maps to
  const bonusDeb = useRef(new BonusDebouncer()).current;
  const [showBonusWedges, setShowBonusWedges] = useState(false); // Toggle for bonus wedge visibility
  const showBonusWedgesRef = useRef(false);
  useEffect(() => { 
    showBonusWedgesRef.current = showBonusWedges; 
  }, [showBonusWedges]);
  
  // ✅ Sync skillLevel to ref for use in detect()
  useEffect(() => {
    skillLevelRef.current = skillLevel;
  }, [skillLevel]);
  
  // ✅ MIDI latch - keep last detected chord visible for 10s after note-off
  const midiLatchTimeoutRef = useRef<number | null>(null);
  const latchedChordRef = useRef<{fn: Fn | "", label: string} | null>(null);
  
  // ✅ Bonus chord recording debounce - wait for final chord before recording
  const bonusRecordDebounceRef = useRef<number | null>(null);
  const latestBonusChordNameRef = useRef<string>(""); // Track latest chord name for debounced recording
  
  /* ---------- Space Lock (v3.11.0) ---------- */
  const [spaceLocked, setSpaceLocked] = useState(false);
  
  // Audio playback
  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio enabled
  const [audioInitialized, setAudioInitialized] = useState(false); // ✅ Track if audio is ready
  const [showAudioPrompt, setShowAudioPrompt] = useState(false); // ✅ iOS audio prompt
  const audioEnabledRef = useRef(true); // Ref for MIDI callback closure
  const [audioReady, setAudioReady] = useState(false); // ✅ Start false, set true when initialized
  
  // Sync audioReady with audioInitialized
  useEffect(() => {
    setAudioReady(audioInitialized && audioEnabled);
  }, [audioInitialized, audioEnabled]);
  
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
        console.log('ðŸ›‘ Global mouseup - releasing wedge');
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
  const lastWedgeClickTimeRef = useRef<number>(0); // ✅ Track click timing
  const wedgeClickFnRef = useRef<Fn | "">(""); // ✅ Track which wedge was clicked
  const keyboardHeldNotesRef = useRef<Set<number>>(new Set()); // Track which keyboard notes are held
  const lastPlayedWith7thRef = useRef<boolean | null>(null); // Track if last chord had 7th
  const currentHeldFnRef = useRef<Fn | null>(null); // Track which function is being held
  
  // ✅ Shift key state for visual indicator
  const [shiftHeld, setShiftHeld] = useState(false);
  
  // Help overlay
  const [showHelp, setShowHelp] = useState(false);
  
  // ✅ Track window size - use 768px breakpoint (more standard)
  const [isDesktop, setIsDesktop] = useState(true); // Default true to avoid flicker
  
  useEffect(() => {
    // Set correct value after mount - 768px is standard mobile/tablet breakpoint
    setIsDesktop(window.innerWidth >= 768);
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ✅ Initialize audio on first user interaction (mobile requirement)
  useEffect(() => {
    const initAudio = () => {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setAudioInitialized(true);
          setShowAudioPrompt(false);
        });
      } else {
        setAudioInitialized(true);
        setShowAudioPrompt(false);
      }
    };
    
    // Listen for first touch/click
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });
    
    // Show prompt after 2 seconds if not initialized on mobile
    const promptTimer = setTimeout(() => {
      if (!audioInitialized && !isDesktop) {
        setShowAudioPrompt(true);
      }
    }, 2000);
    
    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
      clearTimeout(promptTimer);
    };
  }, [audioInitialized, isDesktop]);
  
  // ✅ Load song from URL - optimized to prevent spam
  const [hasLoadedFromURL, setHasLoadedFromURL] = useState(false);
  const [urlSearchParam, setUrlSearchParam] = useState('');
  
  // Track URL changes
  useEffect(() => {
    const currentSearch = window.location.search;
    if (currentSearch !== urlSearchParam) {
      setUrlSearchParam(currentSearch);
      setHasLoadedFromURL(false); // Reset flag when URL changes
    }
  }, [urlSearchParam]);
  
  // Load from URL when params change
  useEffect(() => {
    if (hasLoadedFromURL) return; // Already loaded this URL
    
    const params = new URLSearchParams(urlSearchParam);
    const songParam = params.get('song');
    
    if (!songParam) return; // No song to load
    
    console.log('ðŸ“¨ Received song param:', songParam.substring(0, 50) + '...');
    
    const songData = decodeSongFromURL(songParam);
    
    if (songData && typeof songData === 'object' && typeof songData.text === 'string') {
      let cleanText = songData.text.trim();
      
      // Remove array brackets if present
      if (cleanText.startsWith('[') && cleanText.endsWith(']')) {
        cleanText = cleanText.slice(1, -1).trim();
      }
      
      // Remove any JSON-like wrappers if they leaked through
      if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        console.warn('⏺š ï¸ JSON object detected in text field, attempting to extract...');
        try {
          const nested = JSON.parse(cleanText);
          if (nested.text) cleanText = nested.text;
        } catch(e) {
          // Not parseable, use as-is
        }
      }
      
      console.log('ðŸ“¥ Loading shared song:', songData.title);
      console.log('ðŸ“ Final clean text:', cleanText);
      
      // Set states - text will appear in editor
      setBaseKey(songData.key || 'C');
      // ✅ Don't override skill level - keep user's current setting
      setInputText(cleanText);
      setLoadedSongText(cleanText); // Mark as loaded (no red border)
      setHasLoadedFromURL(true);
      
      // Auto-parse after states settle
      setTimeout(() => {
        console.log('🎵 Auto-parsing shared song');
        parseAndLoadSequence(cleanText); // ✅ Pass cleanText directly to avoid state race condition
      }, 200);
      
      console.log('✅ Shared song loaded - will auto-parse');
    } else {
      console.error('Invalid song data:', songData);
    }
  }, [urlSearchParam, hasLoadedFromURL]);
  
  // ✅ Button pulse animation when key pressed
  const [pulsingButton, setPulsingButton] = useState<string | null>(null);
  const [pulsingWedge, setPulsingWedge] = useState<Fn | "">(""); // ✅ Visual feedback on click
  const [wedgeGlow, setWedgeGlow] = useState<{x: number, y: number, is7th: boolean} | null>(null); // ✅ Click point glow
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showTransposeDropdown, setShowTransposeDropdown] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [shareURL, setShareURL] = useState<string>('');
  const [showShareCopied, setShowShareCopied] = useState(false); // ✅ Share feedback
  const [showShareModal, setShowShareModal] = useState(false); // ✅ Share options modal
  const [keyChangeFlash, setKeyChangeFlash] = useState(false);
  const [stepRecord, setStepRecord] = useState(false); // v3.3.1: Renamed from autoRecord
  const stepRecordRef = useRef(false); // v3.3.1: Renamed from stepRecordRef
  
  // ✅ Performance Mode - keyboard pad controller
  const [performanceMode, setPerformanceMode] = useState(false);
  const performanceModeRef = useRef(false);
  
  // ✅ Track which key is currently playing (for proper keyup handling)
  const activePerformanceKeyRef = useRef<string | null>(null);
  
  // ✅ Stack of held keys for proper multi-key handling
  // Last key in array is the active one
  const heldKeysStackRef = useRef<string[]>([]);
  
  // ✅ Rhythm on/off toggle
  const [rhythmEnabled, setRhythmEnabled] = useState(true);
  const rhythmEnabledRef = useRef(true);
  
  useEffect(() => {
    rhythmEnabledRef.current = rhythmEnabled;
  }, [rhythmEnabled]);
  
  // ✅ Momentary flash for performance keys (500ms, independent of wedge trail)
  const [performanceFlashKey, setPerformanceFlashKey] = useState<string>('');
  const performanceFlashTimeoutRef = useRef<number | null>(null); // Browser timeout returns number
  
  // ✅ Refs for click-outside detection
  const transposeDropdownRef = useRef<HTMLDivElement>(null);
  const keyDropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // ✅ MIDI Output support
  const [outputs, setOutputs] = useState<any[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>("");
  const [midiOutputEnabled, setMidiOutputEnabled] = useState(false);
  const midiOutputRef = useRef<any>(null);
  
  // ✅ Safari detection with state to ensure re-render
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // ✅ MIDI warning state
  const [showMidiWarning, setShowMidiWarning] = useState(false);
  
  useEffect(() => {
    // Set Safari state after mount to trigger re-render with correct styles
    const safariDetected = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafariBrowser(safariDetected);
    console.log('ðŸŽ Safari detection:', safariDetected);
  }, []);
  
  const midiSupported = 'requestMIDIAccess' in navigator;

  const rightHeld=useRef<Set<number>>(new Set());
  const rightSus=useRef<Set<number>>(new Set());
  const leftHeld=useRef<Set<number>>(new Set());
  const sustainOn=useRef(false);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiName, setMidiName] = useState("");

  const [latchedAbsNotes, setLatchedAbsNotes] = useState<number[]>([]);
  const latchedAbsNotesRef = useRef<number[]>([]); // Synchronous mirror for immediate playback
  const lastInputWasPreviewRef = useRef(false);

  const lastMidiEventRef = useRef<"on"|"off"|"cc"|"other">("other");
  const lastPlayedMidiNotesRef = useRef<number[]>([]); // v3.19.55: For voice leading in sequencer


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
        
        // ✅ Removed auto-disable of showBonusWedges toggle
        // The persistent wedges already hide when bonusActive becomes true
        // No need to touch the user's toggle setting
        
        // Transpose octave: A0 to C2 (MIDI 21-36)
        if (d1<=36){
          leftHeld.current.add(d1);
          const lowest = Math.min(...leftHeld.current);
          const k = pcNameForKey(pcFromMidi(lowest), "C") as KeyName;
          setBaseKey(k);
        } else {
          // v3.5.0: Apply transpose to MIDI input
          const transposedNote = d1 + effectiveTranspose;
          console.log('🎹 MIDI INPUT:', {
            originalNote: d1,
            transpose: effectiveTranspose,
            transposedNote,
            noteName: `${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][d1 % 12]} ⏺†’ ${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][transposedNote % 12]}`
          });
          rightHeld.current.add(transposedNote);
          if (sustainOn.current) rightSus.current.add(transposedNote);
          
          // Play audio for MIDI keyboard input (use transposed note)
          if (audioEnabledRef.current) {
            const velocity = d2 / 127;
            playNote(transposedNote, velocity, false);
          }
        }
        if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
      } else if (type===0x80 || (type===0x90 && d2===0)) {
        lastMidiEventRef.current = "off";
        if (d1<=36) leftHeld.current.delete(d1);
        else { 
          // v3.5.0: Apply transpose to note-off as well
          const transposedNote = d1 + effectiveTranspose;
          rightHeld.current.delete(transposedNote); 
          rightSus.current.delete(transposedNote);
          
          // Stop audio for MIDI keyboard note-off (use transposed note)
          if (audioEnabledRef.current) {
            stopNote(transposedNote);
          }
        }
        // Don't call detect() immediately on note-off - keep chord visible
        // User can then click "Make This My Key" button
        // Only detect after a delay
        setTimeout(() => {
          if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
          
          // ✅ Start 10-second latch timer if all notes released
          const allNotesReleased = rightHeld.current.size === 0 && rightSus.current.size === 0;
          if (allNotesReleased && midiLatchTimeoutRef.current === null) {
            // Only start timer if one isn't already running
            const timerId = window.setTimeout(() => {
              console.log('⏺° TIMEOUT FIRING - clearing everything');
              latchedChordRef.current = null;
              activeFnRef.current = ""; // ✅ Clear ref immediately
              setActiveFn("");
              setCenterLabel("");
              setLatchedAbsNotes([]); // ✅ Clear keyboard highlights
              lastInputWasPreviewRef.current = false; // ✅ Clear preview flag
              midiLatchTimeoutRef.current = null;
              console.log('⏺±ï¸ MIDI latch timeout - cleared display and keyboard highlights');
            }, 10000);
            
            midiLatchTimeoutRef.current = timerId;
            console.log('⏺±ï¸ MIDI latch timer started - 10s until clear, timerId:', timerId);
          }
        }, 50);
      } else if (type===0xB0 && d1===64) {
        lastMidiEventRef.current = "cc";
        const on = d2>=64;
        if (!on && sustainOn.current){
          for (const n of Array.from(rightSus.current))
            if (!rightHeld.current.has(n)) rightSus.current.delete(n);
          sustainOn.current = false;
          if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
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
        
        // Setup inputs
        const list=Array.from(acc.inputs.values());
        setInputs(list as any[]);
        if(list.length>0){ bindToInput((list[0] as any).id, acc); } else { setMidiConnected(false); setMidiName(""); }
        
        // ✅ Setup outputs
        const outputList=Array.from(acc.outputs.values());
        setOutputs(outputList as any[]);
        if(outputList.length>0){ 
          const firstOutput = outputList[0] as any;
          setSelectedOutputId(firstOutput.id);
          midiOutputRef.current = firstOutput;
        }
        
        acc.onstatechange=()=>{
          const fresh=Array.from(acc.inputs.values());
          setInputs(fresh as any[]);
          if(selectedId && !fresh.find((i:any)=>i.id===selectedId)){
            if(fresh[0]) bindToInput((fresh[0] as any).id, acc);
            else { setSelectedId(""); setMidiConnected(false); setMidiName(""); }
          }
          
          // Update outputs
          const freshOutputs=Array.from(acc.outputs.values());
          setOutputs(freshOutputs as any[]);
          if(selectedOutputId && !freshOutputs.find((o:any)=>o.id===selectedOutputId)){
            if(freshOutputs[0]) {
              setSelectedOutputId((freshOutputs[0] as any).id);
              midiOutputRef.current = freshOutputs[0];
            } else {
              setSelectedOutputId("");
              midiOutputRef.current = null;
            }
          }
        };
      }catch{/* ignore */}
    })();
  },[selectedId, selectedOutputId]);

  /* ---------- v3: Sequence / input ---------- */
  const [inputText, setInputText] = useState(defaultSong);
  const [loadedSongText, setLoadedSongText] = useState(defaultSong); // Track what's actually loaded
  type SeqItem = { 
    kind: "chord" | "modifier" | "comment" | "title"; 
    raw: string; 
    chord?: string; 
    comment?: string; 
    title?: string;
    duration?: number; // ✅ Duration in bars (1=whole, 0.5=half, 0.25=quarter, etc)
  };
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [seqIndex, setSeqIndex] = useState(-1); // What's loaded in hub (ready to play next)
  const [displayIndex, setDisplayIndex] = useState(-1); // What we're showing/highlighting (what was just played)
  
  // Playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSequencerDisplay, setShowSequencerDisplay] = useState(false); // ✅ Keep display visible for 2 min after stop
  const displayTimerRef = useRef<number | null>(null);
  const [tempo, setTempo] = useState(120); // BPM (beats per minute) - ✅ v3.18.4: Changed default from 60 to 120
  
  // ✅ Rhythm patterns for performance mode
  type RhythmAction = { action: 'play' | 'hold' | 'rest'; duration: number };
  const [rhythmPattern1, setRhythmPattern1] = useState<RhythmAction[]>([]);
  const [rhythmPattern2, setRhythmPattern2] = useState<RhythmAction[]>([]);
  const [rhythmPattern3, setRhythmPattern3] = useState<RhythmAction[]>([]);
  
  // ✅ Active rhythm pattern selection (1, 2, or 3)
  const [activeRhythmPattern, setActiveRhythmPattern] = useState<1 | 2 | 3>(1);
  const activeRhythmPatternRef = useRef<1 | 2 | 3>(1);
  
  // ✅ Rhythm loop control
  const rhythmLoopIntervalRef = useRef<number | null>(null);
  const rhythmLoopTimeoutsRef = useRef<number[]>([]);
  
  // ✅ Rhythm position tracking for seamless chord changes
  const rhythmStartTimeRef = useRef<number | null>(null); // When current rhythm loop started
  const rhythmPatternDurationRef = useRef<number>(0); // Total pattern duration in ms
  
  useEffect(() => {
    activeRhythmPatternRef.current = activeRhythmPattern;
  }, [activeRhythmPattern]);
  
  // Debug: Log transpose changes
  useEffect(() => {
    console.log('🎹 TRANSPOSE STATE:', {
      transpose,
      transposeBypass,
      effectiveTranspose,
      baseKey,
      willBecomeKey: effectiveBaseKey
    });
  }, [transpose, transposeBypass, baseKey, effectiveTranspose, effectiveBaseKey]);
  
  // Debug: Log effective base key
  useEffect(() => {
    console.log('ðŸŽ¯ EFFECTIVE BASE KEY:', effectiveBaseKey, '(original:', baseKey, ')');
  }, [effectiveBaseKey, baseKey]);
  
  // Ref for baseKey - uses effectiveBaseKey for transpose
  const baseKeyRef = useRef<KeyName>("C"); 

  const engineStateRef = useRef<EngineState>(createEngineState());
  // ✅ v4.1.1: Sync baseKeyRef to UNTRANSPOSED baseKey (not effectiveBaseKey!)
  // v4 engine needs baseKey to stay untransposed for space transition checks
  useEffect(() => { baseKeyRef.current = baseKey; }, [baseKey]);
  
  const [loopEnabled, setLoopEnabled] = useState(true); // ✅ Default to ON - use @LOOP OFF to disable
  const playbackTimerRef = useRef<number | null>(null);
  const [songTitle, setSongTitle] = useState(""); // Static song title from @TITLE
  const [bannerMessage, setBannerMessage] = useState(""); // ✅ Configurable banner message from @BANNER
  const [currentComment, setCurrentComment] = useState(""); // ✅ Current comment to display during playback
  
  // v3.19.55: Calendar events for ticker
  const [calendarEvents, setCalendarEvents] = useState<Array<{
    title: string;
    start: Date;
    end: Date;
    isLive: boolean;
  }>>([]);
  const [tickerText, setTickerText] = useState("Loading schedule...");
  const [tickerEvents, setTickerEvents] = useState<Array<{text: string; isLive: boolean; isSoon: boolean; start: Date}>>([]);  // v3.19.55: Added isSoon for orange color, v4.2.0: Added start for chronological sorting
  
  // Autoload preloaded playlist on mount
  useEffect(() => {
    if (inputText && sequence.length === 0) {
      parseAndLoadSequence();
    }
  }, []); // Run once on mount
  
  // v3.19.55: Fetch calendar events from Teamup API
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      console.log('🗓️ Fetching Teamup calendar events...');
      
      // v3.19.55: FALLBACK - Hardcoded events (update these manually if API fails)
      const FALLBACK_EVENTS = [
        { title: 'Music Theory Gym', date: '2025-01-14T18:00:00-08:00' },
        { title: 'Office Hours', date: '2025-01-15T15:00:00-08:00' },
        { title: 'Rhythm Workshop', date: '2025-01-16T19:00:00-08:00' }
      ];
      
      try {
        const TEAMUP_CALENDAR_KEY = 'ks6brk633c2o4cdi4o';  // BeatKitchenSchool read-only link
        const TEAMUP_API_KEY = 'bb96785e7f5939b9861b22175de7715b16410337614c923d161c7ff2b1f510d3';
        
        // Get events for next 30 days
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);
        
        const formatDate = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const startDateStr = formatDate(today);
        const endDateStr = formatDate(endDate);
        
        const url = `https://api.teamup.com/${TEAMUP_CALENDAR_KEY}/events?startDate=${startDateStr}&endDate=${endDateStr}`;
        
        console.log('🗓️ Fetching from Teamup:', url);
        
        const response = await fetch(url, {
          headers: {
            'Teamup-Token': TEAMUP_API_KEY,
            'Accept': 'application/json'
          }
        });
        
        console.log('🗓️ Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🗓️ ⏺Œ Teamup API error:', response.status, errorText);
          throw new Error(`Teamup API returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🗓️ ✅ Teamup response:', data);
        
        // DEBUG: Log subcalendar IDs to find correct filter values
        console.log('🔍 DEBUG: First 10 events with their subcalendar IDs:');
        data.events.slice(0, 10).forEach((event: any, i: number) => {
          console.log(`  [${i}] "${event.title}" - subcalendar_ids:`, event.subcalendar_ids);
        });
        
        if (!data.events || data.events.length === 0) {
          throw new Error('No events found in Teamup calendar');
        }
        
        // Filter and sort events
        const now = new Date();
        const upcomingEvents = data.events
          .map((event: any) => ({
            title: event.title,
            start: new Date(event.start_dt),
            end: new Date(event.end_dt),
            subcalendar_ids: event.subcalendar_ids || []
          }))
          .filter((e: any) => e.end > now)  // v3.19.55: Include events that haven't ended yet (captures live events!)
          .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
        
        console.log('🗓️ Total upcoming events:', upcomingEvents.length);
        
        // Categorize events by specific subcalendar IDs
        const GYMS_CALENDAR_ID = 13985904;  // INSTRUMENT GYM / gyms calendar
        const OFFICE_HOURS_CALENDAR_ID = 13985917;  // OFFICE HOURS calendar
        
        const gyms = upcomingEvents.filter((e: any) => 
          e.subcalendar_ids && e.subcalendar_ids.includes(GYMS_CALENDAR_ID)
        );
        const officeHours = upcomingEvents.filter((e: any) => 
          e.subcalendar_ids && e.subcalendar_ids.includes(OFFICE_HOURS_CALENDAR_ID)
        );
        
        console.log('🗓️ Gyms (from calendar 13985904):', gyms.length);
        console.log('🗓️ Office hours (from calendar 13985917):', officeHours.length);
        
        // v4.2.0: Build ticker: 1st = mandatory first Theory Gym, then next 2 from combined remaining events
        const tickerEvents: Array<{text: string; isLive: boolean; isSoon: boolean; start: Date}> = [];

        // Step 1: ALWAYS pull the first Theory Gym event
        if (gyms.length > 0) {
          const event = gyms[0];
          const isLive = now >= event.start && now <= event.end;
          const isSoon = false;  // v4.1.5: Will be set to true for soonest event only
          const timeStr = formatEventTime(event.start, now);
          const cleanTitle = event.title.replace(/Live\s+/i, '').trim();
          console.log('🗓️ Next gym (mandatory):', cleanTitle, '⏺️', timeStr, isLive ? '🔴 LIVE' : isSoon ? '🟠 SOON' : '');
          tickerEvents.push({ text: `${cleanTitle} ${timeStr}`, isLive, isSoon, start: event.start });
        }

        // Step 2: Combine remaining gyms with ALL office hours
        const remainingGyms = gyms.slice(1);
        const combinedEvents = [...remainingGyms, ...officeHours];

        // Step 3: Sort chronologically
        combinedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        // Step 4: Take next 2 events from combined list
        const nextTwoEvents = combinedEvents.slice(0, 2);

        for (const event of nextTwoEvents) {
          const isLive = now >= event.start && now <= event.end;
          const isSoon = false;  // v4.1.5: Will be set to true for soonest event only
          const timeStr = formatEventTime(event.start, now);
          const cleanTitle = event.title.replace(/Live\s+/i, '').trim();
          console.log('🗓️ Combined event:', cleanTitle, '⏺️', timeStr, isLive ? '🔴 LIVE' : isSoon ? '🟠 SOON' : '');
          tickerEvents.push({ text: `${cleanTitle} ${timeStr}`, isLive, isSoon, start: event.start });
        }

        // ✅ v4.2.0: Find and mark ONLY the soonest upcoming event as orange (updated for new structure)
        if (tickerEvents.length > 0) {
          // Filter to upcoming (not live) events within 12 hours
          const upcomingEventsWithIndex = tickerEvents
            .map((event, index) => ({ event, index }))
            .filter(item => {
              const hoursUntil = (item.event.start.getTime() - now.getTime()) / (1000 * 60 * 60);
              return !item.event.isLive && hoursUntil > 0 && hoursUntil <= 12;
            });

          // Sort by time and mark the soonest
          if (upcomingEventsWithIndex.length > 0) {
            upcomingEventsWithIndex.sort((a, b) => a.event.start.getTime() - b.event.start.getTime());
            tickerEvents[upcomingEventsWithIndex[0].index].isSoon = true;
            console.log('🟠 Marked soonest event as orange:', tickerEvents[upcomingEventsWithIndex[0].index].text);
          }
        }

        if (tickerEvents.length > 0) {
          const finalText = `Next: ${tickerEvents.map(e => e.text).join(' • ')}`; // Keep for fallback
          console.log('🗓️ ✅ Setting ticker text:', finalText);
          console.log('🗓️ 📊 Ticker events array:', tickerEvents.map((e, i) => `[${i}] ${e.isLive ? '🔴 LIVE' : '⏺'} "${e.text}"`));
          console.log('🗓️ 🎬 What will display:', tickerEvents.map((e, i) => 
            `${e.isLive ? '🔴 Now in session:' : (i === 0 ? 'Next' : 'Coming up:')} ${e.text.replace(/@/g, 'with ')}` 
          ).join(' • • • '));
          setTickerEvents(tickerEvents);  // v3.19.55: Store event objects
          setTickerText(finalText);
        } else {
          console.log('🗓️ No categorized events found');
          setTickerEvents([]);
          setTickerText("Check beatkitchen.io/classroom for upcoming events");
        }
        
      } catch (error) {
        console.warn('⏺š ï¸ Teamup fetch failed, using fallback events:', error);
        
        // Use fallback events and format them
        const now = new Date();
        const tickerEvents: Array<{text: string; isLive: boolean; isSoon: boolean; start: Date}> = [];

        for (const event of FALLBACK_EVENTS) {
          const eventDate = new Date(event.date);
          if (eventDate > now) {
            const timeStr = formatEventTime(eventDate, now);
            tickerEvents.push({ text: `${event.title} ${timeStr}`, isLive: false, isSoon: false, start: eventDate });
          }
        }
        
        if (tickerEvents.length > 0) {
          const finalText = `Next: ${tickerEvents.map(e => e.text).join(' • ')}`;
          console.log('🗓️ Using fallback ticker:', finalText);
          setTickerEvents(tickerEvents);  // v3.19.55: Store event objects
          setTickerText(finalText);
        } else {
          setTickerEvents([]);
          setTickerText("Check beatkitchen.io/classroom for upcoming events");
        }
      }
    };
    
    // Helper to format event time
    const formatEventTime = (eventDate: Date, now: Date) => {
      const diff = eventDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 7) {
        return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days > 0) {
        return `in ${days}d`;
      } else if (hours > 0) {
        return `in ${hours}h`;
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        return mins > 0 ? `in ${mins}m` : '';  // v3.19.55: Empty string for live events (we show "Now in session" instead)
      }
    };
    
    fetchCalendarEvents();
    // Refetch every 5 minutes
    const interval = setInterval(fetchCalendarEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
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
  const selectCurrentItem = (indexToSelect?: number) => {
    // Use explicit index if provided, otherwise use current seqIndex
    const idx = indexToSelect !== undefined ? indexToSelect : seqIndex;
    
    if (!textareaRef.current || idx < 0 || !sequence[idx]) return;
    
    // Get the raw text of item at idx
    const currentRaw = sequence[idx].raw;
    
    // Use loadedSongText since that's what the sequence was parsed from
    const textToSearch = loadedSongText || inputText;
    
    // Find the Nth occurrence (where N = idx)
    // Split by comma and find our token
    const tokens = textToSearch.split(',').map(t => t.trim());
    let charPos = 0;
    let foundIndex = -1;
    
    for (let i = 0; i <= idx && i < tokens.length; i++) {
      const token = tokens[i];
      const nextPos = textToSearch.indexOf(token, charPos);
      if (nextPos !== -1) {
        if (i === idx) {
          foundIndex = nextPos;
          break;
        }
        charPos = nextPos + token.length;
      }
    }
    
    if (foundIndex !== -1) {
      textareaRef.current.setSelectionRange(foundIndex, foundIndex + currentRaw.length);
      // Keep focused so selection is visible
      textareaRef.current.focus();
    }
  };

  // Insert current chord at cursor position in textarea
  const insertCurrentChord = () => {
    if (!textareaRef.current || !currentGuitarLabel) return;
    
    let start = textareaRef.current.selectionStart;
    let end = textareaRef.current.selectionEnd;
    
    // ✅ Find "line in the sand" - don't insert after @RHYTHM directives
    const rhythmIndex = inputText.indexOf('@RHYTHM');
    if (rhythmIndex !== -1 && start >= rhythmIndex) {
      // Cursor is in the rhythm section - move it before rhythms
      const beforeRhythms = inputText.substring(0, rhythmIndex).trimEnd();
      start = beforeRhythms.length;
      end = start;
      // Update cursor position
      textareaRef.current.setSelectionRange(start, end);
    }
    
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

  // ✅ Parse rhythm pattern syntax
  // Syntax: |x x / x * * x /|
  // x = play, * = hold/tie, / = rest
  const parseRhythmPattern = (patternText: string): RhythmAction[] => {
    // Remove bar delimiters and normalize whitespace
    const cleaned = patternText.replace(/\|/g, '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return [];

    // Split by space
    const symbols = cleaned.split(' ');
    const durationEach = 1.0 / symbols.length; // Split bar evenly

    return symbols.map(sym => {
      if (sym === 'x') return { action: 'play' as const, duration: durationEach };
      if (sym === '*') return { action: 'hold' as const, duration: durationEach };
      if (sym === '/') return { action: 'rest' as const, duration: durationEach };
      // Default to play if unrecognized
      return { action: 'play' as const, duration: durationEach };
    });
  };

  // ✅ Convert rhythm pattern back to display string
  const rhythmPatternToDisplay = (pattern: RhythmAction[]): string => {
    if (pattern.length === 0) return '|x x x x|'; // Default display
    const symbols = pattern.map(action => {
      if (action.action === 'play') return 'x';
      if (action.action === 'hold') return '*';
      if (action.action === 'rest') return '/';
      return 'x'; // Fallback
    });
    return `|${symbols.join(' ')}|`;
  };

  const parseAndLoadSequence = (textOverride?: string)=>{
    const APP_VERSION = "v4.1.9-functional-dims-always-sharp";
    // ✅ Use textOverride if provided (for URL loading), otherwise use inputText state
    const textToParse = textOverride !== undefined ? textOverride : inputText;
    // console.log('=== PARSE AND LOAD START ===');
    console.log('ðŸ·ï¸  APP VERSION:', APP_VERSION);
    console.log('Input text:', textToParse);
    setLoadedSongText(textToParse); // Save what we're loading
    
    // Handle empty input gracefully
    if (!textToParse.trim()) {
      setSequence([]);
      setSeqIndex(-1);
      setDisplayIndex(-1);
      setSongTitle("");
      // ✅ Keep banner showing when cleared (for non-EXPERT users)
      // Don't clear banner - let it fall back to default message
      // setBannerMessage("") was making display disappear
      // ✅ v3.6.0 FIX: Only reset key for truly empty input
      // Don't reset when loading actual sequences - preserve key selector setting
      setBaseKey("C");
      goHome();
      return;
    }

    // ✅ v4.1.0: Parse @RHYTHM directives from FULL input (not just chord section)
    // Rhythm patterns come AFTER @RHYTHM marker, so we need to search entire text
    const rhythmMatches1 = Array.from(textToParse.matchAll(/@RHYTHM1\s+([^\n]+)|@R1\s+([^\n]+)/gi));
    for (const match of rhythmMatches1) {
      const arg = (match[1] || match[2] || '').trim();
      if (arg) {
        console.log('🎵 RHYTHM1 detected:', arg);
        const pattern = parseRhythmPattern(arg);
        setRhythmPattern1(pattern);
        console.log('🎵 Rhythm Pattern 1:', pattern);
      }
    }

    const rhythmMatches2 = Array.from(textToParse.matchAll(/@RHYTHM2\s+([^\n]+)|@R2\s+([^\n]+)/gi));
    for (const match of rhythmMatches2) {
      const arg = (match[1] || match[2] || '').trim();
      if (arg) {
        console.log('🎵 RHYTHM2 detected:', arg);
        const pattern = parseRhythmPattern(arg);
        setRhythmPattern2(pattern);
        console.log('🎵 Rhythm Pattern 2:', pattern);
      }
    }

    const rhythmMatches3 = Array.from(textToParse.matchAll(/@RHYTHM3\s+([^\n]+)|@R3\s+([^\n]+)/gi));
    for (const match of rhythmMatches3) {
      const arg = (match[1] || match[2] || '').trim();
      if (arg) {
        console.log('🎵 RHYTHM3 detected:', arg);
        const pattern = parseRhythmPattern(arg);
        setRhythmPattern3(pattern);
        console.log('🎵 Rhythm Pattern 3:', pattern);
      }
    }

    // ✅ STOP at @RHYTHM marker - don't parse rhythm patterns as chords
    const rhythmIndex = textToParse.indexOf('@RHYTHM');
    const chordSection = rhythmIndex !== -1 ? textToParse.substring(0, rhythmIndex) : textToParse;
    
    // ✅ Replace newlines with commas (each line = token)
    // This allows @RHYTHM directives on separate lines without manual commas
    const cleanedInput = chordSection.replace(/\n/g, ',').trim();
    
    // ✅ RHYTHM NOTATION - Backward compatible
    // Old style: C, Am, F, G  (comma-separated, 1 bar each)
    // New style: |C Am F G|  (bar-delimited, space-separated)
    // Mixed: C, Am, |F G|, D  (both work together!)
    
    const rawTokens: Array<{text: string; duration: number}> = [];
    
    // First pass: split by commas (backward compatible)
    const segments = cleanedInput.split(',').map(s => s.trim()).filter(Boolean);
    
    for (const segment of segments) {
      // ✅ v3.19.55: Check for @directives FIRST - split multiple directives on same line
      // Allow: "@KEY C @TEMPO 160 @LOOP" or "@KEY C, @TEMPO 160, @LOOP"
      if (segment.trim().startsWith('@')) {
        // Split by @ to get individual directives
        const directives = segment.split('@').filter(s => s.trim());
        for (const directive of directives) {
          const trimmed = '@' + directive.trim();
          rawTokens.push({text: trimmed, duration: 1.0});
        }
        continue;
      }
      
      // Check if this segment contains bar delimiters
      if (segment.includes('|')) {
        // Parse bars: "|C Am F G|" or "|C Am|F G|" or "| C Am F G" (unclosed)
        const bars = segment.split('|').filter(s => s.trim());
        
        // ✅ v3.19.55: Track last chord across bars for cross-bar ties
        let lastChordOrRest: string | null = null;
        
        for (const bar of bars) {
          // Normalize whitespace: multiple spaces ⏺†’ single space
          const normalized = bar.trim().replace(/\s+/g, ' ');
          if (!normalized) continue;
          
          // ✅ Parse (comments) as single tokens
          const tokens: string[] = [];
          let i = 0;
          while (i < normalized.length) {
            if (normalized[i] === '(') {
              // Find matching closing parenthesis
              let depth = 1;
              let j = i + 1;
              while (j < normalized.length && depth > 0) {
                if (normalized[j] === '(') depth++;
                if (normalized[j] === ')') depth--;
                j++;
              }
              const commentPart = normalized.substring(i, j).trim(); // "(comment text)" or "(comment; chords)"

              // ✅ NEW: Check for semicolon INSIDE parentheses: "(comment; C G7 Am)"
              const innerContent = commentPart.slice(1, -1); // Remove parentheses
              const semicolonIdx = innerContent.indexOf(';');

              if (semicolonIdx !== -1) {
                // Grouped comment + chords syntax
                const commentText = innerContent.substring(0, semicolonIdx).trim();
                const chordsText = innerContent.substring(semicolonIdx + 1).trim();

                // Push comment token
                tokens.push(`(${commentText})`);

                // Split chords by spaces and push each as separate token
                const chordTokens = chordsText.split(/\s+/).filter(t => t.length > 0);
                for (const chordTok of chordTokens) {
                  tokens.push(chordTok);
                }

                i = j;
              } else {
                // Original logic: Check if colon FOLLOWS the closing paren: "(label): Chord"
                if (j < normalized.length && normalized[j] === ':') {
                  // Colon is outside! Push "(comment):" as one token
                  tokens.push(commentPart + ':');
                  i = j + 1; // Skip past the colon
                  // Next token (after space) will be the chord
                } else {
                  // No colon, just a standalone comment
                  tokens.push(commentPart);
                  i = j;
                }
              }
            } else if (normalized[i] === ' ') {
              i++;
            } else {
              let token = '';
              while (i < normalized.length && normalized[i] !== ' ' && normalized[i] !== '(') {
                token += normalized[i];
                i++;
              }
              if (token) tokens.push(token);
            }
          }
          
          // ✅ v3.19.55: Group ties with their preceding chord/rest (including cross-bar)
          const groupedItems: Array<{text: string, count: number, isComment: boolean}> = [];
          
          for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];

            if (token.startsWith('(') && (token.endsWith(')') || token.endsWith('):'))) {
              // Comments are always zero duration (whether standalone or with colon)
              groupedItems.push({text: token, count: 0, isComment: true});
            } else if (token === '*') {
              // Tie extends previous item (within bar OR cross-bar)
              if (groupedItems.length > 0 && !groupedItems[groupedItems.length - 1].isComment) {
                // Tie to previous item in same bar
                groupedItems[groupedItems.length - 1].count++;
              } else if (j === 0 && lastChordOrRest) {
                // ✅ v3.19.55: Cross-bar tie! Just add a * with duration
                // The * won't retrigger, it just holds the previous chord
                groupedItems.push({text: '*', count: 1, isComment: false});
              }
            } else {
              // Chord or rest starts at count 1
              groupedItems.push({text: token, count: 1, isComment: false});
            }
          }
          
          // Calculate duration
          const totalCount = groupedItems.filter(g => !g.isComment).reduce((sum, g) => sum + g.count, 0);
          const unitDuration = totalCount > 0 ? 1.0 / totalCount : 1.0;
          
          console.log(`ðŸ“Š Bar: "${normalized}" ⏺†’ ${groupedItems.length} items, totalCount: ${totalCount}, unitDuration: ${unitDuration}`);
          groupedItems.forEach((item, idx) => {
            const dur = item.isComment ? 0 : item.count * unitDuration;
            // console.log(`  ${idx}: "${item.text}" count:${item.count} isComment:${item.isComment} ⏺†’ duration:${dur}`);
          });
          
          // Add to rawTokens and track last chord
          for (const item of groupedItems) {
            const duration = item.isComment ? 0 : item.count * unitDuration;
            rawTokens.push({text: item.text, duration});
            
            // Track last chord/rest for cross-bar ties
            if (!item.isComment && item.text !== '*') {
              lastChordOrRest = item.text;
            }
          }
        }
      } else {
        // No bars: old style, 1 bar per chord
        rawTokens.push({text: segment, duration: 1.0});
      }
    }
    
    // console.log('Parsed tokens with rhythm:', rawTokens);
    let title = "";
    // ✅ v3.6.0 FIX: Start from current baseKey, don't reset to C
    // This preserves manual key selector changes
    let currentKey: KeyName = baseKey; // Track key for functional notation
    
    const items: SeqItem[] = rawTokens.map(tokenObj => {
      const tok = tokenObj.text;
      const dur = tokenObj.duration;
      
      // ✅ Handle rest (/) and tie (*) characters
      if (tok === '/') {
        return { kind:"comment", raw:tok, comment: "(rest)", duration: dur };
      }
      if (tok === '*') {
        return { kind:"comment", raw:tok, comment: "(tie)", duration: dur };
      }
      
      // Comments enclosed in parentheses: (comment text) or (label): Chord
      // Note: Colon is OUTSIDE the closing paren for attached chords
      if (tok.startsWith("(") && (tok.endsWith(")") || tok.endsWith("):"))) {
        const hasColon = tok.endsWith("):");
        const commentText = hasColon ? tok.slice(1, -2).trim() : tok.slice(1, -1).trim();
        console.log('ðŸ“ Parsing comment:', tok, '⏺†’ commentText:', commentText);
        // Comments always have zero duration
        // If hasColon, it will label the next chord
        return { kind:"comment", raw:tok, comment: commentText, duration: dur };
      }

      // Modifiers start with @
      if (tok.startsWith("@")) {
        const remainder = tok.slice(1).trim();
        // ✅ v3.17.85 FIX: Parse cmd from first word, then handle rest with colon support
        // "@KEY Eb: Ebmaj7" should parse as cmd="KEY", arg="Eb: Ebmaj7"
        const firstSpaceIdx = remainder.search(/\s/);
        let cmd, arg;
        
        if (firstSpaceIdx === -1) {
          // No space, check for colon: "@HOME:F"
          if (remainder.includes(":")) {
            [cmd, arg] = remainder.split(":", 2);
            arg = arg?.trim() || "";
          } else {
            // Just command, no arg: "@HOME"
            cmd = remainder;
            arg = "";
          }
        } else {
          // Has space: "@KEY Eb: Ebmaj7" or "@HOME F"
          cmd = remainder.substring(0, firstSpaceIdx);
          arg = remainder.substring(firstSpaceIdx + 1).trim();
        }
        
        const upper = (cmd||"").toUpperCase().trim();
        
        // ✅ @TEMPO directive - Set BPM
        if (upper === "TEMPO" || upper === "BPM" || upper === "T") {
          const bpm = parseInt(arg);
          if (!isNaN(bpm) && bpm > 0 && bpm <= 300) {
            console.log('🎵 TEMPO detected:', bpm, 'BPM');
            setTempo(bpm);
            return { kind:"modifier", raw:tok, chord: `TEMPO:${bpm}` };
          }
        }
        
        // ✅ Check for RHYTHM patterns (now case-insensitive)
        if (upper === "RHYTHM1" || upper === "R1") {
          console.log('🎵 RHYTHM1 detected. cmd:', cmd, 'arg:', arg, 'length:', arg.length);
          const pattern = parseRhythmPattern(arg);
          setRhythmPattern1(pattern);
          console.log('🎵 Rhythm Pattern 1:', arg, '⏺†’', pattern);
          return { kind:"modifier", raw:tok, chord: `RHYTHM1:${arg}` };
        }
        if (upper === "RHYTHM2" || upper === "R2") {
          console.log('🎵 RHYTHM2 detected. cmd:', cmd, 'arg:', arg, 'length:', arg.length);
          const pattern = parseRhythmPattern(arg);
          setRhythmPattern2(pattern);
          console.log('🎵 Rhythm Pattern 2:', arg, '⏺†’', pattern);
          return { kind:"modifier", raw:tok, chord: `RHYTHM2:${arg}` };
        }
        if (upper === "RHYTHM3" || upper === "R3") {
          console.log('🎵 RHYTHM3 detected. cmd:', cmd, 'arg:', arg, 'length:', arg.length);
          const pattern = parseRhythmPattern(arg);
          setRhythmPattern3(pattern);
          console.log('🎵 Rhythm Pattern 3:', arg, '⏺†’', pattern);
          return { kind:"modifier", raw:tok, chord: `RHYTHM3:${arg}` };
        }
        
        // ✅ @LOOP directive - Enable loop mode
        if (upper === "LOOP" || upper === "LP") {
          console.log('ðŸ” LOOP detected - enabling loop mode');
          const argUpper = arg?.toUpperCase();
          if (argUpper === "OFF" || argUpper === "FALSE" || argUpper === "0") {
            console.log('🔁 LOOP OFF detected - disabling loop mode');
            setLoopEnabled(false);
            return { kind:"modifier", raw:tok, chord: "LOOP:OFF" };
          } else {
            console.log('🔁 LOOP detected - enabling loop mode');
            setLoopEnabled(true);
            return { kind:"modifier", raw:tok, chord: "LOOP" };
          }
        }

        // Check for TITLE
        if (upper === "TITLE" || upper === "TI") {
          title = arg;
          return { kind:"title", raw:tok, title: arg };
        }
        
        // Check for KEY - update currentKey for functional notation
        if (upper === "KEY" || upper === "K") {
          const keyArg = arg.trim();
          // NEW v3.2.5: Check if there's a chord after the key
          // "@KEY Eb: Ebmaj7" ⏺†’ arg="Eb: Ebmaj7", split to get key and chord
          // Check for colon first (combined), then comma, then space
          let newKey: KeyName;
          let chordAfterKey = "";
          
          if (keyArg.includes(":")) {
            // Combined with colon: "Eb: Ebmaj7"
            const [k, ...c] = keyArg.split(":");
            newKey = k.trim() as KeyName;
            chordAfterKey = c.join(":").trim();
          } else if (keyArg.includes(",")) {
            // Comma separator: "Eb, Ebmaj7"
            const [k, ...c] = keyArg.split(",");
            newKey = k.trim() as KeyName;
            chordAfterKey = c.join(",").trim();
          } else {
            // Space separator: "Eb Ebmaj7"
            const parts = keyArg.split(/\s+/);
            newKey = parts[0] as KeyName;
            chordAfterKey = parts.slice(1).join(" ").trim();
          }
          
          if (FLAT_NAMES.includes(newKey)) {
            currentKey = newKey;
          }
          
          if (chordAfterKey) {
            return { kind:"modifier", raw:tok, chord: `KEY:${newKey}:${chordAfterKey}` };
          }
          return { kind:"modifier", raw:tok, chord: `KEY:${newKey}` };
        }
        
        // Normalize abbreviations: REL, SUB, PAR, HOME
        let normalized = upper;
        if (upper === "SUBDOM" || upper === "SUB") normalized = "SUB";
        else if (upper === "RELATIVE" || upper === "REL") normalized = "REL";
        else if (upper === "PARALLEL" || upper === "PAR") normalized = "PAR";
        else if (upper === "HOME" || upper === "HOM") normalized = "HOME";
        
        // NEW v3.2.4: Check if arg contains a chord to play after switching
        // Supports: @HOME:F, @SUB F, HOME:Gm7, etc.
        const chordArg = arg.trim();
        if (chordArg && (normalized === "HOME" || normalized === "SUB" || normalized === "REL" || normalized === "PAR")) {
          // Split into separate modifier + chord items
          // This allows: @HOME:F to (1) switch to HOME, then (2) play F
          return { kind:"modifier", raw:tok, chord: `${normalized}:${chordArg}` };
        }
        
        return { kind:"modifier", raw:tok, chord: `${normalized}:${arg}` };
      }
      
      // Check if it's functional notation (Roman numerals)
      // Supported: I-VII with variations (upper/lowercase, accidentals, 7ths, secondary dominants)
      // Examples: I, ii, ♭VII, V7, V/vi, ii/vi, ♭III, VI
      const functionalPattern = /^(⏺™­|#)?([IViv]+)(7|M7|m7|maj7|dom7)?(\/([IViv]+))?$/;
      const match = tok.match(functionalPattern);
      
      // console.log('[PARSER] Checking token:', tok, 'functionalPattern match:', match ? 'YES' : 'NO');
      
      if (match) {
        // It's functional notation - convert to literal chord based on current key
        const accidental = match[1] || '';
        const numeral = match[2];
        const quality = match[3] || '';
        const secondaryTarget = match[5]; // For V/vi style notation
        
        console.log('[PARSER] Roman numeral detected:', { accidental, numeral, quality, secondaryTarget, currentKey });
        
        // Convert Roman numeral to scale degree (0-11)
        const romanToDegreeLower: Record<string, number> = {
          'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
        };
        const romanToDegreeUpper: Record<string, number> = {
          'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11
        };
        
        const isLower = numeral === numeral.toLowerCase();
        const degreeMap = isLower ? romanToDegreeLower : romanToDegreeUpper;
        // ✅ v3.6.5 FIX: Use matching case - lowercase maps use lowercase keys, uppercase maps use uppercase keys
        let degree = degreeMap[numeral]; // Use numeral as-is (already correct case)
        
        console.log('[PARSER] Degree lookup:', { numeral, isLower, degree });
        
        if (degree !== undefined) {
          // If secondary dominant (e.g., V/vi), calculate target first
          if (secondaryTarget) {
            // Get target degree
            const targetIsLower = secondaryTarget === secondaryTarget.toLowerCase();
            const targetMap = targetIsLower ? romanToDegreeLower : romanToDegreeUpper;
            const targetDegree = targetMap[targetIsLower ? secondaryTarget : secondaryTarget.toLowerCase()];
            
            if (targetDegree !== undefined) {
              // V/vi means V of vi - so add degree to target
              degree = (targetDegree + degree) % 12;
            }
          }
          
          // Apply accidental
          if (accidental === '⏺™­' || accidental === 'b') degree = (degree - 1 + 12) % 12;
          if (accidental === '#') degree = (degree + 1) % 12;
          
          // Get root note based on current key and degree
          const keyPc = NAME_TO_PC[currentKey] || 0;
          const rootPc = (keyPc + degree) % 12;
          
          // Convert PC back to note name
          const pcToName: Record<number, string> = {
            0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
            6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'
          };
          const rootName = pcToName[rootPc];
          
          // Build chord name
          let chordName = rootName;
          if (isLower) chordName += 'm'; // Lowercase = minor
          if (quality) chordName += quality;
          
          console.log('[PARSER] ✅ Converted roman numeral:', tok, '⏺†’', chordName, 'in key', currentKey);
          
          // Return as chord with original functional notation as raw
          return { kind:"chord", raw:tok, chord: chordName, duration: dur };
        } else {
          console.log('[PARSER] ⏺Œ Failed to convert roman numeral - degree undefined');
        }
      }
      
      // Everything else is a literal chord
      return { kind:"chord", raw:tok, chord: tok, duration: dur };
    });

    // ✅ Post-process: Attach standalone comments to following chords
    // Syntax: (comment) C G7 Am - attaches "comment" to all three chords
    // Note: This is from semicolon expansion: (comment; C G7 Am) → [(comment), C, G7, Am]
    // The comment item stays with duration=0 and is skipped during playback
    let pendingComment: string | null = null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // If we hit a standalone comment (not a tie/rest), store it
      if (item.kind === "comment" &&
          item.comment !== "(tie)" &&
          item.comment !== "(rest)" &&
          !item.raw?.endsWith(":") &&  // Not a "(label):" comment
          item.duration === 0) {
        pendingComment = item.comment || null;
        // Keep duration at 0 so it gets skipped during playback
      }
      // If we have a pending comment and hit a chord, attach it
      else if (pendingComment && item.kind === "chord") {
        items[i] = { ...item, comment: pendingComment };
      }
      // If we hit a modifier, title, or "(label):" comment, clear pending
      else if (item.kind === "modifier" ||
               item.kind === "title" ||
               (item.kind === "comment" && item.raw?.endsWith(":"))) {
        pendingComment = null;
      }
    }

    const itemsWithAttachedComments = items; // Keep all items

    // ✅ Filter out RHYTHM, LOOP, TEMPO directives from playable sequence
    // These are configuration, not part of the musical progression
    // Keep standalone comments for highlighting but mark them to skip during playback
    const playableItems = itemsWithAttachedComments.filter(item => {
      if (item.kind === "modifier" && item.chord) {
        // Keep KEY, HOME, SUB, REL, PAR modifiers (they're part of progression)
        // Remove RHYTHM1/2/3, LOOP/LOOP:OFF, and TEMPO (they're just config)
        return !item.chord.startsWith("RHYTHM") &&
               !item.chord.startsWith("LOOP") &&
               !item.chord.startsWith("TEMPO");
      }
      return true; // Keep everything else (chords, comments, titles)
    });
    
    console.log('ðŸ“‹ Filtered sequence - removed', items.length - playableItems.length, 'config directives');
    
    setSongTitle(title);
    setSequence(playableItems); // Use filtered items
    setLoadedSongText(inputText); // Track what's actually loaded
    
    // Find first non-title, non-KEY item to set as initial index
    let initialIdx = 0;
    while (initialIdx < playableItems.length && 
           (playableItems[initialIdx].kind === "title" || 
            (playableItems[initialIdx].kind === "modifier" && playableItems[initialIdx].chord?.startsWith("KEY:")))) {
      initialIdx++;
    }
    
    // ✅ v4.0.51b DEBUG: Apply ALL @KEY directives before first playable chord
    console.log('🔍 [KEY DEBUG] Looking for KEY directives before index', initialIdx);
    console.log('🔍 [KEY DEBUG] Current baseKey BEFORE applying:', baseKey);
    for (let i = 0; i < initialIdx; i++) {
      const item = playableItems[i];
      console.log(`  [${i}] kind=${item.kind} chord=${item.chord}`);
      if (item.kind === "modifier" && item.chord?.startsWith("KEY:")) {
        console.log('  ✅ [KEY DEBUG] Found KEY directive, applying:', item.chord);
        const keyPart = item.chord.split(":")[1];
        console.log('  ✅ [KEY DEBUG] Extracted key:', keyPart);
        applySeqItem(item);
        // Force immediate state update check
        setTimeout(() => {
          console.log('  ✅ [KEY DEBUG] baseKey AFTER applying (async):', baseKeyRef.current);
        }, 50);
      }
    }
    const hadKeyDirective = playableItems.slice(0, initialIdx).some(
      item => item.kind === "modifier" && item.chord?.startsWith("KEY:")
    );
    console.log('🔍 [KEY DEBUG] Had KEY directive?', hadKeyDirective);
    if (!hadKeyDirective) {
      console.log('  -> [KEY DEBUG] No KEY found, going HOME');
      goHome();
    }
    console.log('🔍 [KEY DEBUG] Sequence loading complete. Final baseKey:', baseKey);
    
    // Set index to first playable item
    if (initialIdx < playableItems.length) {
      setSeqIndex(initialIdx);
      setDisplayIndex(initialIdx);
      selectCurrentItem(initialIdx);
    } else {
      setSeqIndex(-1);
      setDisplayIndex(-1);
    }
  };

  // ✅ Auto-load default song on mount with its banner message
  useEffect(() => {
    console.log('🎵 Auto-loading default song on mount');
    const firstSong = demoSongs[0];
    if (firstSong && firstSong.content) {
      // Load the first demo song's content AND banner message
      setBannerMessage(firstSong.bannerMessage || "");
      setTimeout(() => parseAndLoadSequence(), 100);
    }
  }, []); // Empty deps = runs once on mount

  const stepPrev = ()=>{
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }

    if (!sequence.length) return;

    // ✅ Start display timer when using transport controls
    startDisplayTimer();
    let i = seqIndex - 1;
    if (i < 0) i = 0; // Stay at beginning

    // Skip backwards over titles only (v3.2.7: Keep comments - they should pause)
    while (i > 0 && sequence[i]?.kind === "title") {
      i--;
    }

    setSeqIndex(i);
    setDisplayIndex(i);

    // ✅ v4.1.2: Apply item and update display (like stepNext and playback timer)
    const notesToShow = applySeqItem(sequence[i]);

    // Update MIDI state and display if we have notes
    if (notesToShow.length > 0) {
      // Save previous state
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;

      // Set MIDI state for display
      rightHeld.current = new Set(notesToShow);
      lastMidiEventRef.current = "on";

      // Update keyboard highlighting
      setLatchedAbsNotes(notesToShow);
      latchedAbsNotesRef.current = notesToShow;
      lastInputWasPreviewRef.current = true;

      // Update display (wheel, keyboard, etc.)
      if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }

      // Restore previous state
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;
    }

    selectCurrentItem(i); // Pass explicit index
    // Don't play - just move backward
  };
  
  const stepNext = ()=>{
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }

    if (!sequence.length) return;

    // ✅ Start display timer when using transport controls
    startDisplayTimer();
    
    console.log('=== STEP NEXT START ===');
    console.log('Before: seqIndex =', seqIndex, 'displayIndex =', displayIndex);
    
    // seqIndex points to what we should play now
    const currentIdx = seqIndex;
    console.log('currentIdx =', currentIdx, 'chord =', sequence[currentIdx]?.raw);
    
    // Make sure it's applied (in case we backed up with <)
    console.log('Calling applySeqItem for:', sequence[currentIdx]?.raw);
    const notesToPlay = applySeqItem(sequence[currentIdx]);
    
    console.log('ðŸ"‹ Captured notes to play:', notesToPlay);

    // ✅ v4.1.2: Update display BEFORE playing (sync visual with audio)
    if (notesToPlay.length > 0) {
      // Save previous MIDI state
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;

      // Set MIDI state to match what we're about to play
      rightHeld.current = new Set(notesToPlay);
      lastMidiEventRef.current = "on";

      // Update keyboard highlighting
      setLatchedAbsNotes(notesToPlay);
      latchedAbsNotesRef.current = notesToPlay;
      lastInputWasPreviewRef.current = true;

      // Update display (wheel, keyboard, etc.)
      if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }

      // Restore previous state
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;

      // Play it with the captured notes
      if (audioEnabledRef.current) {
        console.log('ðŸ"Š Playing:', sequence[currentIdx].raw, 'notes:', notesToPlay.length);
        playChord(notesToPlay, 1.5);
      }
    } else {
      console.warn("NOT PLAYING - notesLen:", notesToPlay.length, "audio:", audioEnabledRef.current);
    }

    // Update displayIndex to show what we just played
    console.log('Setting displayIndex to:', currentIdx);
    setDisplayIndex(currentIdx);
    selectCurrentItem(currentIdx);
    
    // Advance seqIndex to next (but DON'T apply it yet)
    let i = currentIdx + 1;
    if (i >= sequence.length) {
      console.log('At end of sequence');
      // ✅ If loop enabled, go back to start
      if (loopEnabled) {
        console.log('ðŸ” Loop enabled - going back to start');
        i = 0;
        // Skip any initial titles
        while (i < sequence.length && sequence[i]?.kind === "title") {
          i++;
        }
        if (i >= sequence.length) {
          console.log('No playable items in sequence');
          return;
        }
      } else {
        return;
      }
    }
    
    // Skip titles only (v3.2.7: Keep comments - they should pause)
    while (i < sequence.length && sequence[i]?.kind === "title") {
      i++;
    }
    
    if (i >= sequence.length) {
      console.log('No more items after skipping titles');
      return;
    }
    
    console.log('Advancing seqIndex to:', i, 'chord =', sequence[i]?.raw);
    // Just advance index - next > will apply it
    setSeqIndex(i);
    console.log('=== STEP NEXT END ===\n');
  };
  
  // Playback controls
  const togglePlayPause = () => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    if (isPlaying) {
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      // ✅ Start 2-minute display timer
      startDisplayTimer();
    } else {
      // Start playing
      if (sequence.length === 0) return;
      
      // v3.5.0: Play first chord BEFORE starting playback timer
      let startIdx = seqIndex;
      if (startIdx < 0 || startIdx >= sequence.length) {
        startIdx = 0;
      }
      
      // ✅ v4.0.52: Re-apply KEY directives before starting playback
      // This ensures we play in the correct key even if user manually changed it
      console.log('🔍 [Play/Pause] Scanning for KEY directives...');
      for (let i = 0; i < startIdx; i++) {
        const item = sequence[i];
        if (item.kind === "modifier" && item.chord?.startsWith("KEY:")) {
          console.log('  ✅ Re-applying KEY directive:', item.chord);
          applySeqItem(item);
          break;
        }
      }
      
      // Apply the first item to get notes
      const notesToPlay = applySeqItem(sequence[startIdx]);
      
      // ✅ v4.0.52: Use RETURNED notes, not ref (ref might be stale)
      const currentItem = sequence[startIdx];
      if (currentItem?.kind === "chord" && notesToPlay.length > 0) {
        console.log('🔊 [Play/Pause] Playing first chord:', currentItem.chord, 'notes:', notesToPlay);
        // v3.5.0: Notes already transposed, don't transpose again
        const noteDuration = (60 / tempo) * 0.8;
        playChord(notesToPlay, noteDuration);
      } else {
        console.warn('⚠️ [Play/Pause] No notes to play:', { itemKind: currentItem?.kind, notesLength: notesToPlay.length });
      }
      
      // ✅ v3.19.55: Mark as preview mode for eraser display
      lastInputWasPreviewRef.current = true;

      // ✅ Clear display timer when starting playback
      setShowSequencerDisplay(true); // Show while playing
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
        displayTimerRef.current = null;
      }

      // NOW start the playback loop
      setIsPlaying(true);
    }
  };
  
  const stopPlayback = (silent = false) => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }

    setIsPlaying(false);
    setCurrentComment(""); // Clear comment display when stopping
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // ✅ Start 2-minute display timer
    startDisplayTimer();
    // Reset to beginning
    // v3.5.0: Skip audio when silent=true (for reset button)
    if (sequence.length > 0 && !silent) {
      setSeqIndex(0);
      applySeqItem(sequence[0]);
      setTimeout(() => selectCurrentItem(), 0);
    }
  };

  // ✅ Helper function to start/restart the 2-minute display timer
  const startDisplayTimer = () => {
    if (sequence.length === 0 || !songTitle) return; // Only if we have a sequence with title

    setShowSequencerDisplay(true);
    if (displayTimerRef.current) {
      clearTimeout(displayTimerRef.current);
    }
    displayTimerRef.current = setTimeout(() => {
      console.log('⏰ Display timer expired, reverting to ticker');
      setShowSequencerDisplay(false);
    }, 120000); // 2 minutes = 120000 ms
  };

  const goToStart = () => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }

    // ✅ Start display timer when using transport controls
    startDisplayTimer();

    console.log('=== GO TO START ===');
    if (sequence.length > 0) {
      // ✅ v4.0.52: ALWAYS re-apply KEY directives when rewinding
      // This resets the key even if user manually changed it
      console.log('🔍 Scanning for KEY directives to re-apply...');
      let foundKeyDirective = false;
      for (let i = 0; i < sequence.length; i++) {
        const item = sequence[i];
        if (item.kind === "modifier" && item.chord?.startsWith("KEY:")) {
          console.log('  ✅ Re-applying KEY directive:', item.chord);
          applySeqItem(item); // This will call setBaseKey
          foundKeyDirective = true;
          break; // Only apply first KEY directive
        }
        // Stop scanning once we hit a playable chord
        if (item.kind === "chord") break;
      }
      if (!foundKeyDirective) {
        console.log('  ℹ️ No KEY directive found, keeping current key');
      }
      
      // Find first playable item (skip titles and KEY-only modifiers)
      let startIdx = 0;
      while (startIdx < sequence.length) {
        const item = sequence[startIdx];
        
        // Skip titles
        if (item.kind === "title") {
          startIdx++;
          continue;
        }
        
        // ✅ Skip KEY-only, but NOT combined KEY:X:Chord
        if (item.kind === "modifier" && item.chord?.startsWith("KEY:")) {
          const parts = item.chord.split(":");
          // If only 2 parts (KEY:X), skip. If 3+ parts (KEY:X:Chord), play it!
          if (parts.length <= 2) {
            startIdx++;
            continue;
          }
        }
        
        // Found a playable item
        break;
      }
      if (startIdx < sequence.length) {
        console.log('Going to index:', startIdx, 'chord =', sequence[startIdx]?.raw);
        setSeqIndex(startIdx);
        setDisplayIndex(startIdx);
        
        // ✅ Apply item for detection/wedge lighting, but DON'T play audio
        // User can press > to play the first chord
        const notesToPlay = applySeqItem(sequence[startIdx]);
        
        // ⏺Œ Don't play on rewind - just position
        // User presses > to play
        console.log('ðŸ”‡ Rewind complete - positioned at start (no audio)');
        
        selectCurrentItem(startIdx);
      }
    }
    console.log('=== GO TO START END ===\n');
  };
  
  // Skip to next comment
  const skipToNextComment = () => {
    if (!sequence.length) return;

    // ✅ Start display timer when using transport controls
    startDisplayTimer();
    for (let i = seqIndex + 1; i < sequence.length; i++) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        const notesToShow = applySeqItem(sequence[i]);

        // ✅ v4.1.2: Update display like stepPrev/stepNext
        if (notesToShow.length > 0) {
          const savedRightHeld = new Set(rightHeld.current);
          const savedEvent = lastMidiEventRef.current;
          rightHeld.current = new Set(notesToShow);
          lastMidiEventRef.current = "on";
          setLatchedAbsNotes(notesToShow);
          latchedAbsNotesRef.current = notesToShow;
          lastInputWasPreviewRef.current = true;
          if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
          rightHeld.current = savedRightHeld;
          lastMidiEventRef.current = savedEvent;
        }

        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to end
    const lastIdx = sequence.length - 1;
    setSeqIndex(lastIdx);
    const notesToShow = applySeqItem(sequence[lastIdx]);

    // ✅ v4.1.2: Update display
    if (notesToShow.length > 0) {
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;
      rightHeld.current = new Set(notesToShow);
      lastMidiEventRef.current = "on";
      setLatchedAbsNotes(notesToShow);
      latchedAbsNotesRef.current = notesToShow;
      lastInputWasPreviewRef.current = true;
      if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;
    }

    setTimeout(() => selectCurrentItem(), 0);
  };
  
  // Skip to previous comment
  const skipToPrevComment = () => {
    if (!sequence.length) return;

    // ✅ Start display timer when using transport controls
    startDisplayTimer();
    for (let i = seqIndex - 1; i >= 0; i--) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        const notesToShow = applySeqItem(sequence[i]);

        // ✅ v4.1.2: Update display like stepPrev/stepNext
        if (notesToShow.length > 0) {
          const savedRightHeld = new Set(rightHeld.current);
          const savedEvent = lastMidiEventRef.current;
          rightHeld.current = new Set(notesToShow);
          lastMidiEventRef.current = "on";
          setLatchedAbsNotes(notesToShow);
          latchedAbsNotesRef.current = notesToShow;
          lastInputWasPreviewRef.current = true;
          if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
          rightHeld.current = savedRightHeld;
          lastMidiEventRef.current = savedEvent;
        }

        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to beginning
    setSeqIndex(0);
    const notesToShow = applySeqItem(sequence[0]);

    // ✅ v4.1.2: Update display
    if (notesToShow.length > 0) {
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;
      rightHeld.current = new Set(notesToShow);
      lastMidiEventRef.current = "on";
      setLatchedAbsNotes(notesToShow);
      latchedAbsNotesRef.current = notesToShow;
      lastInputWasPreviewRef.current = true;
      if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;
    }

    setTimeout(() => selectCurrentItem(), 0);
  };
  
  // Reset function - resets key, space, transpose, and playback
  const resetAll = () => {
    // v3.4.3: Full reset including all refs
    setBaseKey("C");
    setTranspose(0);
    setTransposeBypass(false);
    // Reset ALL space states and refs
    setSubdomActive(false);
    subdomLatchedRef.current = false;
    subHasSpunRef.current = false;
    setRelMinorActive(false);
    setVisitorActive(false);
    // Clear recent maps
    recentRelMapRef.current.clear();
    lastPcsRelSizeRef.current = 0;
    stopPlayback(true); // v3.5.0: Silent stop
  };
  
  const handleInputKeyNav: React.KeyboardEventHandler<HTMLTextAreaElement> = (e)=>{
    // Only handle Return/Enter and Ctrl+I in textarea
    // Arrow keys work normally for cursor movement
    
    // ✅ Shift+Enter creates newline, plain Enter loads sequence
    if (e.key==="Enter"){ 
      if (e.shiftKey) {
        // Shift+Enter: Allow newline (don't prevent default)
        return;
      }
      
      e.preventDefault();
      
      // v3.3.2: Exit step record when loading sequence
      if (stepRecord) {
        setStepRecord(false);
        stepRecordRef.current = false;
      }
      
      parseAndLoadSequence();
      // ✅ Blur textarea to exit edit mode and allow spacebar play
      // Use setTimeout to ensure blur happens after event processing
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.blur();
          console.log('✅ Textarea blurred after Enter - spacebar will now play');
        }
      }, 0);
    }
    // Ctrl+I or Cmd+I inserts current chord
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i'){
      e.preventDefault();
      insertCurrentChord();
    }
  };

  const applySeqItem = (it: SeqItem): number[] => {
    // Returns MIDI notes to be played by caller
    // NEW v3.2.5: Handle combined comments (# comment: Chord)
    if (it.kind==="comment") {
      // If comment has a chord attached, play it
      if (it.chord) {
        console.log('ðŸ”„ Combined comment:', it.comment, '+ chord:', it.chord);
        return applySeqItem({ kind: "chord", raw: it.chord, chord: it.chord });
      }
      return [];
    }
    
    if (it.kind==="title") return []; // Skip titles
    if (it.kind==="modifier" && it.chord){
      // ✅ Split modifier properly - get ALL parts after first colon
      // "KEY:Eb:Ebmaj7" ⏺†’ m="KEY", arg="Eb:Ebmaj7"
      const [m, ...restParts] = it.chord.split(":");
      const arg = restParts.join(":");
      
      // NEW v3.2.4: Check if arg is a chord name (combined space+chord)
      const isSpaceModifier = m === "HOME" || m === "SUB" || m === "REL" || m === "PAR";
      const hasChordArg = arg && arg.trim() && isSpaceModifier;
      
      if (m==="HOME"){ 
        goHome();
        // If chord specified, play it after switching
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('ðŸ”„ Combined modifier: HOME + chord:', chordName);
          // Recursively call applySeqItem with chord item
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="SUB"){ 
        if(!subdomActiveRef.current) toggleSubdom();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('ðŸ”„ Combined modifier: SUB + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="REL"){ 
        if(!relMinorActiveRef.current) toggleRelMinor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('ðŸ”„ Combined modifier: REL + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="PAR"){ 
        if(!visitorActiveRef.current) toggleVisitor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('ðŸ”„ Combined modifier: PAR + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="KEY"){ 
        // Change key center
        // NEW v3.2.5: Check if format is KEY:C:Am (key + chord)
        const parts = arg?.split(":") || [];
        const newKey = parts[0]?.trim() as KeyName;
        const chordAfterKey = parts.slice(1).join(":").trim();
        console.log("🔑 [KEY] Directive parsed:", { newKey, valid: FLAT_NAMES.includes(newKey), currentBaseKey: baseKey });

        if (newKey && FLAT_NAMES.includes(newKey)) {
          console.log("🔑 [KEY] Calling setBaseKey from:", baseKey, "to:", newKey);
          setBaseKey(newKey);
          console.log("🔑 [KEY] setBaseKey called. State will update async.");
        } else {
          console.warn("⚠️ [KEY] Invalid key name:", newKey, "- must be one of:", FLAT_NAMES);
        }
        
        if (chordAfterKey) {
          console.log('ðŸ”„ Combined KEY change:', newKey, '+ chord:', chordAfterKey);
          // ✅ Return notes to be played by caller
          return applySeqItem({ kind: "chord", raw: chordAfterKey, chord: chordAfterKey });
        }
      }
      return [];
    }
    if (it.kind==="chord" && it.chord){
      // ðŸŽ¯ CRITICAL: Simulate MIDI input to use IDENTICAL detection logic!
      // This makes sequencer behavior match keyboard playing exactly.
      
      const chordName = it.chord.trim();
      console.log('🎹 Simulating MIDI for sequencer:', chordName);
      
      // Parse chord to get pitch classes
      const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
      if (!match) {
        console.warn('⏺š ï¸ Could not parse chord:', chordName);
        return [];
      }
      
      let root = match[1];
      const quality = match[2] || "";
      
      // ✅ v3.17.85 FIX: Convert sharps to flats for NAME_TO_PC lookup
      const sharpToFlat: Record<string, string> = {
        'C#': 'Db',
        'D#': 'Eb', 
        'F#': 'Gb',
        'G#': 'Ab',
        'A#': 'Bb'
      };
      if (sharpToFlat[root]) {
        console.log(`ðŸ”„ Converting ${root} ⏺†’ ${sharpToFlat[root]}`);
        root = sharpToFlat[root];
      }
      
      console.log('ðŸ” Parsed:', { chordName, root, quality });
      
      // Get root pitch class
      const rootPc = NAME_TO_PC[root as KeyName];
      if (rootPc === undefined) {
        console.warn('⏺š ï¸ Unknown root:', root, 'Available keys:', Object.keys(NAME_TO_PC));
        return [];
      }
      
      console.log('✅ Root PC:', rootPc);
      
      // Determine intervals based on quality
      let intervals: number[] = [];
      if (quality === "m" || quality === "min") {
        intervals = [0, 3, 7]; // Minor triad
      } else if (quality === "7") {
        intervals = [0, 4, 7, 10]; // Dominant 7th
      } else if (quality === "m7") {
        intervals = [0, 3, 7, 10]; // Minor 7th
      } else if (quality === "maj7" || quality === "Maj7" || quality === "M7") {
        intervals = [0, 4, 7, 11]; // Major 7th
      } else if (quality === "m7b5" || quality === "m7⏺™­5") {
        intervals = [0, 3, 6, 10]; // Half-diminished
      } else if (quality === "dim" || quality === "Â°") {
        intervals = [0, 3, 6]; // Diminished triad
      } else if (quality === "dim7" || quality === "Â°7") {
        intervals = [0, 3, 6, 9]; // Fully diminished 7th
      } else if (quality === "aug" || quality === "+") {
        intervals = [0, 4, 8]; // Augmented triad
      } else {
        intervals = [0, 4, 7]; // Major triad (default)
      }
      
      // Create MIDI notes - use voice leading to transition smoothly between chords
      // v3.19.55: Smart voice leading - start in lower octave, use previous chord position
      const baseMidi = 48; // Start lower (C3) to ensure all notes fit in keyboard window (48-71)
      let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
      
      // v3.19.55: Voice leading - if there was a previous chord, find closest inversion
      if (lastPlayedMidiNotesRef.current.length > 0) {
        const prevChord = lastPlayedMidiNotesRef.current;
        const prevCenter = prevChord.reduce((a,b) => a+b, 0) / prevChord.length;
        
        // Try different octaves and pick the one closest to previous chord
        let bestOctave = 0;
        let bestDistance = Infinity;
        
        for (let octaveShift = -12; octaveShift <= 24; octaveShift += 12) {
          const testNotes = midiNotes.map(n => n + octaveShift);
          // Check if all notes fit in keyboard range
          if (testNotes.every(n => n >= 48 && n <= 71)) {
            const testCenter = testNotes.reduce((a,b) => a+b, 0) / testNotes.length;
            const distance = Math.abs(testCenter - prevCenter);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestOctave = octaveShift;
            }
          }
        }
        
        midiNotes = midiNotes.map(n => n + bestOctave);
      } else {
        // First chord - just ensure it fits in keyboard range
        // Prefer lower register
        while (midiNotes.some(n => n > 71) && midiNotes.every(n => n - 12 >= 48)) {
          midiNotes = midiNotes.map(n => n - 12);
        }
      }
      
      // v3.5.0: Apply transpose to sequencer chords (like MIDI input)
      midiNotes = midiNotes.map(n => n + effectiveTranspose);

      // ✅ v4.1.2: After transpose, check if notes are out of keyboard range (48-71)
      // If any notes are outside, shift the entire chord down by octaves until all fit
      while (midiNotes.some(n => n > 71) && midiNotes.every(n => n - 12 >= 48)) {
        console.log('📉 Transposed chord out of range - shifting down octave');
        midiNotes = midiNotes.map(n => n - 12);
      }
      // If notes are too low, shift up
      while (midiNotes.some(n => n < 48) && midiNotes.every(n => n + 12 <= 71)) {
        console.log('📈 Transposed chord out of range - shifting up octave');
        midiNotes = midiNotes.map(n => n + 12);
      }

      // ✅ v4.1.1: Remember TRANSPOSED chord for next voice leading
      // CRITICAL: Must save AFTER transpose so voice leading uses correct octave
      lastPlayedMidiNotesRef.current = [...midiNotes];

      console.log('🎹 Simulated MIDI notes:', midiNotes, 'for chord:', chordName, 'transpose:', effectiveTranspose);
      
      // ðŸ”‘ KEY INSIGHT: Temporarily set MIDI state, call detect(), then restore
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;
      
      // ✅ v3.6.0 CRITICAL FIX: Force baseKeyRef sync before detection
      // ✅ v3.8.0 CRITICAL FIX: Sync to effectiveBaseKey (respects transpose!)
      // Bug: Was syncing to baseKey, so transpose didn't affect detection
      // Example: In Eb with transpose to C, Ab⏺†’F transposed but detected in Eb patterns
      // Ensures sequencer chords are detected in correct key context
      // ✅ v4.1.1: DON'T change baseKeyRef - v4 engine needs untransposed baseKey
      // baseKeyRef.current = effectiveBaseKey; // OLD v3.8.0 code - WRONG for v4!
      console.log('🔑 [v4.1.1] Sequencer: baseKey stays', baseKey, 'effectiveBaseKey:', effectiveBaseKey, 'transpose:', effectiveTranspose);
      
      // ✅ v4.1.1: DON'T call detectV4 here - creates display lag
      // Display should update when audio plays, not before
      // Detection will happen in playback timer right before playChord()

      // ✅ Return notes AND MIDI state for caller to trigger detection at play time
      // Caller will set rightHeld and call detectV4 right before playChord
      return midiNotes;
    }
    
    return []; // No notes to play
  };

  // Highlight current chord in editor
  const highlightCurrentChordInEditor = () => {
    if (!textareaRef.current || seqIndex < 0 || seqIndex >= sequence.length) return;
    
    const currentItem = sequence[seqIndex];
    if (!currentItem) return;
    
    // Find the position of this item in the text
    const text = inputText;
    const tokens = text.split(',').map(t => t.trim());
    
    // Find which token index corresponds to seqIndex
    let tokenCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (tokenCount === seqIndex) {
        // Found it! Now find the position in the original text
        let charPos = 0;
        for (let j = 0; j < i; j++) {
          charPos = text.indexOf(tokens[j], charPos);
          charPos += tokens[j].length + 1; // +1 for comma
        }
        charPos = text.indexOf(tokens[i], charPos);
        
        const tokenLength = tokens[i].length;
        textareaRef.current.setSelectionRange(charPos, charPos + tokenLength);
        // ✅ Don't focus editor if in performance mode
        if (!performanceModeRef.current) {
          textareaRef.current.focus();
        }
        break;
      }
      tokenCount++;
    }
  };

  // Check for song in URL on mount
  useEffect(() => {
    const songFromURL = getSongFromURL();
    if (songFromURL) {
      setInputText(songFromURL);
      // Auto-load the song
      setTimeout(() => parseAndLoadSequence(), 100);
    }
  }, []);
  
  // Song management handlers
  const handleExportSong = () => {
    const metadata = parseSongMetadata(inputText);
    const filename = metadata.title 
      ? `${metadata.title.replace(/\s+/g, '-').toLowerCase()}.txt`
      : 'harmony-wheel-song.txt';
    exportSongToFile(inputText, filename);
  };
  
  const handleGenerateShareURL = () => {
    const url = generateShareableURL(inputText);
    setShareURL(url);
    copyToClipboard(url);
  };
  
  const handleImportSong = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSongFromFile(file).then((content: string) => {
        setInputText(content);
        parseAndLoadSequence();
      }).catch((err: Error) => {
        console.error('Failed to import song:', err);
      });
    }
  };
  
  const handleLoadDemoSong = (songContent: string, bannerMsg?: string) => {
    console.log('🎵 Loading demo song with banner:', bannerMsg);
    setInputText(songContent);
    setBannerMessage(bannerMsg || ""); // ✅ Set banner from demoSongs
    setShowSongMenu(false);
    setTimeout(() => parseAndLoadSequence(), 100);
  };

  // ✅ Click-outside detection for dropdowns
  useEffect(() => {
    performanceModeRef.current = performanceMode;
  }, [performanceMode]);

  // ✅ Auto-enable bonus wedges when performance mode turns on
  useEffect(() => {
    if (performanceMode && !showBonusWedges) {
      setShowBonusWedges(true);
    }
  }, [performanceMode]);

  // ✅ Intro animation - faster bonus pulse, overlaps with rotation
  useEffect(() => {
    if (!showIntroAnimation) return;
    
    const animate = async () => {
      // Open directly at REL
      setRelMinorActive(true);
      setActiveFn("vi");
      
      await new Promise(resolve => setTimeout(resolve, 600)); // Shorter hold at REL
      
      // Start rotation to HOME
      setRelMinorActive(false);
      setActiveFn("I");
      
      // Start bonus pulse DURING rotation (don't wait for it to finish)
      await new Promise(resolve => setTimeout(resolve, 800)); // Overlap timing
      
      // Faster bonus pulse cycle
      if (skillLevel === "ADVANCED" || skillLevel === "EXPERT") {
        setShowBonusWedges(true);
        await new Promise(resolve => setTimeout(resolve, 600)); // Faster hold
        
        setShowBonusWedges(false);
        await new Promise(resolve => setTimeout(resolve, 600)); // Faster fade
      }
      
      setShowIntroAnimation(false);
    };
    
    setTimeout(animate, 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close transpose dropdown if click outside
      if (showTransposeDropdown && 
          transposeDropdownRef.current && 
          !transposeDropdownRef.current.contains(event.target as Node)) {
        setShowTransposeDropdown(false);
      }
      
      // Close key dropdown if click outside
      if (showKeyDropdown && 
          keyDropdownRef.current && 
          !keyDropdownRef.current.contains(event.target as Node)) {
        setShowKeyDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTransposeDropdown, showKeyDropdown]);

  // ✅ Enter key to close dropdowns
  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showTransposeDropdown) {
          setShowTransposeDropdown(false);
        }
        if (showKeyDropdown) {
          setShowKeyDropdown(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEnterKey);
    return () => document.removeEventListener('keydown', handleEnterKey);
  }, [showTransposeDropdown, showKeyDropdown]);

  // Global keyboard handler for arrow keys and Enter (when not in textarea)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ✅ Check if typing in editor FIRST - bypass ALL hotkeys
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;
      
      // ✅ Track shift key for visual indicator
      if (e.key === 'Shift') {
        setShiftHeld(true);
      }
      
      // ✅ Handle . and , for sequencer BEFORE checking if in textarea
      // ✅ Changed to Shift+comma/period (< >) to avoid editor conflict
      if (e.shiftKey && (e.key === '<' || e.key === '>')) {
        e.preventDefault();
        if (e.key === '<') { // Shift+,
          setPulsingButton('prev');
          setTimeout(() => setPulsingButton(null), 300);
          stepPrev();
        } else { // Shift+.
          setPulsingButton('next');
          setTimeout(() => setPulsingButton(null), 300);
          stepNext();
        }
        return;
      }
      
      // ✅ B key toggles performance mode
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setPerformanceMode(!performanceModeRef.current);
        return;
      }
      
      // ✅ O key toggles rhythm on/off
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        const newState = !rhythmEnabledRef.current;
        setRhythmEnabled(newState);
        console.log('🎵 Rhythm', newState ? 'ENABLED' : 'DISABLED');
        // If turning off while rhythm is playing, stop it
        if (!newState && rhythmLoopIntervalRef.current !== null) {
          stopRhythmLoop();
        }
        return;
      }
      
      // ✅ In performance mode, prevent default on ALL keys to stop address bar focus
      if (performanceModeRef.current) {
        e.preventDefault(); // Block browser shortcuts like Ctrl+L
      }
      
      // ✅ Performance Mode - Clockwise from I (matches wheel)
      if (performanceModeRef.current) {
        // Map both normal and shifted keys
        const keyMap: Record<string, Fn> = {
          '1': 'I', '!': 'I',
          '2': 'ii', '@': 'ii',
          '3': 'V/V', '#': 'V/V',
          '4': 'iii', '$': 'iii',
          '5': 'V/vi', '%': 'V/vi',
          '6': 'iv', '^': 'iv',
          '7': 'IV', '&': 'IV',
          '8': 'V', '*': 'V',
          '9': 'V/ii', '(': 'V/ii',
          '0': 'vi', ')': 'vi',
          '-': 'ii/vi', '_': 'ii/vi',
          '=': '♭VII', '+': '♭VII'
        };
        
        const fn = keyMap[e.key];
        if (fn) {
          // Detect 7th by checking if shifted key was pressed
          const shiftedKeys = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
          const with7th = shiftedKeys.includes(e.key);
          
          // ✅ Normalize key to base (unshifted) version for stack tracking
          const baseKey = with7th ? 
            {'!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', 
             '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '='}[e.key] || e.key
            : e.key;
          
          // ✅ Block OS key repeat UNLESS shift state changed (7th toggle)
          if (e.repeat && !with7th) {
            // Regular repeat - ignore
            e.preventDefault();
            return;
          }
          // If with7th=true, this is a shift+number press - allow it to re-trigger
          
          e.preventDefault();
          e.stopPropagation();
          console.log('🎹 Performance Mode:', { 
            rawKey: e.key, 
            code: e.code,
            shiftKey: e.shiftKey,
            fn, 
            with7th, 
            isShiftedChar: shiftedKeys.includes(e.key),
            detectedAs7th: with7th
          });
          
          // Flash the key
          if (performanceFlashTimeoutRef.current) {
            clearTimeout(performanceFlashTimeoutRef.current);
          }
          // Find which key number this is
          const keyNumber = Object.keys(keyMap).find(k => keyMap[k] === fn && !shiftedKeys.includes(k));
          if (keyNumber) {
            setPerformanceFlashKey(keyNumber);
            performanceFlashTimeoutRef.current = setTimeout(() => {
              setPerformanceFlashKey('');
            }, 500);
          }
          
          const chordNotes = previewFn(fn, with7th);
          
          // ✅ ALWAYS stop old rhythm before starting new one
          // This prevents stuck notes and extra rhythmic notes when switching
          const isNewKey = !heldKeysStackRef.current.includes(baseKey);
          if (!isNewKey || rhythmLoopIntervalRef.current !== null) {
            // Either re-pressing same key OR switching to new key while rhythm playing
            stopRhythmLoop();
          }
          
          // ✅ Push to key stack (last key takes priority)
          if (isNewKey) {
            heldKeysStackRef.current.push(baseKey);
          }
          activePerformanceKeyRef.current = baseKey;
          console.log('🎹 Key stack:', heldKeysStackRef.current);
          
          // ✅ Step record - insert function name when pad pressed
          if (stepRecordRef.current && currentGuitarLabel) {
            insertCurrentChord();
          }
          
          // ✅ Start rhythm immediately with notes from previewFn
          if (rhythmEnabledRef.current && chordNotes && chordNotes.length > 0) {
            // Calculate current position in rhythm for seamless chord change
            let offsetMs = 0;
            if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
              // A rhythm is already playing - calculate how far into it we are
              const elapsed = performance.now() - rhythmStartTimeRef.current;
              offsetMs = elapsed % rhythmPatternDurationRef.current;
              console.log('ðŸ”„ Seamless chord change at offset:', offsetMs.toFixed(0), 'ms');
            } else {
              console.log('🎵 Starting rhythm loop with pattern', activeRhythmPatternRef.current);
            }
            startRhythmLoop(chordNotes, offsetMs);
          } else if (!rhythmEnabledRef.current) {
            console.log('⏺¸ï¸ Rhythm disabled - not starting loop');
          } else {
            console.warn('⏺š ï¸ No latched notes to play rhythm with');
          }
          
          // DON'T clear piano highlights - keep them while holding
          // They'll clear on keyup
          
          return; // Stop processing - don't run other shortcuts
        }
        
        // ✅ Rhythm pattern switchers - change pattern and restart rhythm
        if (e.key === '[') {
          e.preventDefault();
          setActiveRhythmPattern(1);
          console.log('🎵 Switched to rhythm pattern 1');
          // Restart rhythm with new pattern if currently playing
          if (rhythmLoopIntervalRef.current !== null && latchedAbsNotes.length > 0) {
            let offsetMs = 0;
            if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
              const elapsed = performance.now() - rhythmStartTimeRef.current;
              offsetMs = elapsed % rhythmPatternDurationRef.current;
            }
            // Small delay to let state update
            setTimeout(() => startRhythmLoop(latchedAbsNotes, offsetMs), 10);
          }
          return;
        }
        if (e.key === ']') {
          e.preventDefault();
          setActiveRhythmPattern(2);
          console.log('🎵 Switched to rhythm pattern 2');
          if (rhythmLoopIntervalRef.current !== null && latchedAbsNotes.length > 0) {
            let offsetMs = 0;
            if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
              const elapsed = performance.now() - rhythmStartTimeRef.current;
              offsetMs = elapsed % rhythmPatternDurationRef.current;
            }
            setTimeout(() => startRhythmLoop(latchedAbsNotes, offsetMs), 10);
          }
          return;
        }
        if (e.key === '\\') {
          e.preventDefault();
          setActiveRhythmPattern(3);
          console.log('🎵 Switched to rhythm pattern 3');
          if (rhythmLoopIntervalRef.current !== null && latchedAbsNotes.length > 0) {
            let offsetMs = 0;
            if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
              const elapsed = performance.now() - rhythmStartTimeRef.current;
              offsetMs = elapsed % rhythmPatternDurationRef.current;
            }
            setTimeout(() => startRhythmLoop(latchedAbsNotes, offsetMs), 10);
          }
          return;
        }
      }
      
      // Skill level shortcuts: 1-5 (only when NOT in performance mode)
      if (!performanceModeRef.current) {
        if (e.key === '1') {
          e.preventDefault();
          setSkillLevel('ROOKIE');
          return;
        } else if (e.key === '2') {
          e.preventDefault();
          setSkillLevel('NOVICE');
          return;
        } else if (e.key === '3') {
          e.preventDefault();
          setSkillLevel('SOPHOMORE');
          return;
        } else if (e.key === '4') {
          e.preventDefault();
          setSkillLevel('ADVANCED');
          return;
        } else if (e.key === '5') {
          e.preventDefault();
          setSkillLevel('EXPERT');
          return;
        }
      }
      
      // Navigation shortcuts
      // ✅ Cmd+Shift+< for goToStart (Shift+< is used for stepPrev)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '<') {
        e.preventDefault();
        goToStart();
        return;
      }
      
      // Playback controls
      // ✅ Guard spacebar - don't trigger play/pause if typing in editor
      if (e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return; // Don't hijack spacebar in editor
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // ✅ v3.19.55: Escape closes everything
        stopPlayback();
        setShowKeyDropdown(false);
        setShowTransposeDropdown(false);
        setStepRecord(false);
        stepRecordRef.current = false;
        // Blur ALL inputs (BPM, textarea, etc.)
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        skipToNextComment();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        skipToPrevComment();
      } else if (e.key === 'ArrowRight') {
        // ✅ Plain arrow for step (only when not in editor)
        e.preventDefault();
        stepNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      // Transpose controls
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const hasKeyDirective = loadedSongText.includes('@KEY');
        if (!hasKeyDirective) {
          setShowTransposeDropdown(prev => !prev);
        }
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        setTranspose(prev => Math.min(12, prev + 1));
      } else if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        setTranspose(prev => Math.max(-12, prev - 1));
      // Tempo controls
      } else if (e.key === '[') {
        e.preventDefault();
        setTempo(prev => Math.max(20, prev - 10));
      } else if (e.key === ']') {
        e.preventDefault();
        setTempo(prev => Math.min(240, prev + 10));
      // Reset (extend H key)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        resetAll();
      // Legacy arrow navigation (still work)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepNext();
      } else if (e.key === 'Enter' && inputText.trim() && !performanceModeRef.current) {
        // ✅ Don't allow Enter to load in performance mode (too easy to accidentally trigger)
        e.preventDefault();
        parseAndLoadSequence();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertCurrentChord();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        makeThisMyKey();
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        goHomeC(); // Return to HOME C (reset to C)
      } else if (e.key === 'h' || e.key === 'H') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts
        e.preventDefault();
        goHome(); // HOME space
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey || e.metaKey) return; // ✅ Allow Cmd+R/Ctrl+R for browser refresh
        e.preventDefault();
        toggleRelMinor(); // REL space
      } else if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts (save)
        e.preventDefault();
        toggleSubdom(); // SUB space
      } else if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts (print)
        e.preventDefault();
        toggleVisitor(); // PAR space
      } else if (e.key === 'x' || e.key === 'X') {
        // ✅ Clear MIDI latch
        e.preventDefault();
        if (midiLatchTimeoutRef.current !== null) {
          clearTimeout(midiLatchTimeoutRef.current);
          midiLatchTimeoutRef.current = null;
        }
        latchedChordRef.current = null;
        activeFnRef.current = ""; // ✅ Clear ref immediately
        setActiveFn("");
        setCenterLabel("");
        setLatchedAbsNotes([]); // ✅ Clear keyboard highlights
        lastInputWasPreviewRef.current = false; // ✅ Clear preview flag
        console.log('⏺Œ MIDI latch manually cleared with X key');
      }
    };
    
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftHeld(false);
      }
      
      // ✅ Stack-based key handling - revert to previous key on release
      if (performanceModeRef.current) {
        const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
        if (numberKeys.includes(e.key)) {
          // Remove this key from stack
          const index = heldKeysStackRef.current.indexOf(e.key);
          if (index > -1) {
            heldKeysStackRef.current.splice(index, 1);
          }
          
          console.log('🎹 Key released. Stack:', heldKeysStackRef.current);
          
          if (heldKeysStackRef.current.length > 0) {
            // There's still a key held - revert to it!
            const previousKey = heldKeysStackRef.current[heldKeysStackRef.current.length - 1];
            console.log('ðŸ”„ Reverting to previous key:', previousKey);
            
            // Find the function for this key
            const keyMap: Record<string, Fn> = {
              '1': 'I', '2': 'ii', '3': 'V/V', '4': 'iii', '5': 'V/vi',
              '6': 'iv', '7': 'IV', '8': 'V', '9': 'V/ii', '0': 'vi',
              '-': 'ii/vi', '=': '♭VII'
            };
            
            const fn = keyMap[previousKey];
            if (fn) {
              // Re-trigger the previous key's chord
              const shiftedKeys = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
              const with7th = shiftedKeys.includes(previousKey);
              
              activePerformanceKeyRef.current = previousKey;
              previewFn(fn, with7th);
              
              // Restart rhythm from current position if enabled
              if (rhythmEnabledRef.current && latchedAbsNotes.length > 0) {
                let offsetMs = 0;
                if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
                  const elapsed = performance.now() - rhythmStartTimeRef.current;
                  offsetMs = elapsed % rhythmPatternDurationRef.current;
                }
                startRhythmLoop(latchedAbsNotes, offsetMs);
              }
            }
          } else {
            // No more keys held - stop everything
            stopRhythmLoop();
            setLatchedAbsNotes([]);
            activePerformanceKeyRef.current = null;
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [inputText, sequence, seqIndex, centerLabel]); // Re-attach when these change

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }
    
    // ✅ Play current chord (or handle tie)
    const currentItem = sequence[seqIndex];
    const isTie = currentItem?.kind === "comment" && currentItem.raw === '*';
    
    // ✅ v4.0.52: Call applySeqItem to ensure notes are fresh
    // This updates latchedAbsNotesRef AND returns the notes
    let currentNotes: number[] = [];
    if (currentItem?.kind === "chord" || (currentItem?.kind === "comment" && currentItem.chord)) {
      currentNotes = applySeqItem(currentItem);
    } else {
      // For other items, use latched notes from last chord
      currentNotes = latchedAbsNotesRef.current;
    }
    
    const isPlayableItem = (currentItem?.kind === "chord" ||
                           (currentItem?.kind === "comment" && currentItem.chord)) &&
                           currentItem.chord &&
                           currentNotes.length > 0;

    // ✅ Update current comment display (from attached comment or clear if none)
    const isStandaloneComment = currentItem?.kind === "comment" &&
                                !currentItem.chord &&
                                currentItem.comment !== "(tie)" &&
                                currentItem.comment !== "(rest)";

    if (currentItem?.comment && currentItem.kind === "chord") {
      setCurrentComment(currentItem.comment);
    } else if (currentItem?.kind === "comment" && currentItem.chord) {
      // "(label): Chord" format - display the comment
      setCurrentComment(currentItem.comment || "");
    } else if (!isStandaloneComment) {
      // Don't clear comment for standalone comments (they're instant and shouldn't affect display)
      setCurrentComment("");
    }

    if (isPlayableItem) {
      // ✅ v4.1.1: Debug - what notes are we playing?
      console.log('🎬 [Playback] Playing chord:', currentItem.chord, 'notes:', currentNotes);

      // ✅ v4.1.1: Update display RIGHT BEFORE playing audio (sync visual with audio)
      // Save previous MIDI state
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;

      // Set MIDI state to match what we're about to play
      rightHeld.current = new Set(currentNotes);
      lastMidiEventRef.current = "on";

      // ✅ v4.1.1: Update latchedAbsNotes for keyboard highlighting
      setLatchedAbsNotes(currentNotes);
      latchedAbsNotesRef.current = currentNotes;
      lastInputWasPreviewRef.current = true; // Mark as sequencer input

      // Update display (keyboard, wheel, etc.)
      if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }

      // Restore previous state (for next iteration)
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;

      // ✅ Use duration from item (in bars)
      // Assuming 4/4 time: 1 bar = 4 beats
      const itemDuration = currentItem.duration || 1.0; // Default to 1 bar
      const beatsPerBar = 4;
      const noteDuration = (60 / tempo) * beatsPerBar * itemDuration * 0.8; // 80% of duration
      playChord(currentNotes, noteDuration);
    }
    // Note: Ties (*) don't retrigger - they just extend duration silently
    
    // ✅ Calculate interval using duration from current item
    // Duration is in bars (1=whole, 0.5=half, 0.25=quarter)
    const itemDuration = currentItem?.duration || 1.0; // Default to 1 bar if not specified
    
    // ✅ Comments without attached chords have zero duration (EXCEPT ties and rests - they need duration!)
    const isAnnotationOnly = currentItem?.kind === "comment" &&
                            !currentItem.chord &&
                            currentItem.comment !== "(tie)" &&
                            currentItem.comment !== "(rest)"; // Ties and rests must keep their duration
    const isZeroDuration = itemDuration === 0 || isAnnotationOnly;
    const beatsPerBar = 4; // 4/4 time signature
    const interval = isZeroDuration ? 0 : (60 / tempo) * beatsPerBar * itemDuration * 1000; // milliseconds
    
    // Wait, then advance to next
    playbackTimerRef.current = window.setTimeout(() => {
      // Advance to next item
      let nextIndex = seqIndex + 1;
      
      // ✅ v3.19.55: Don't skip comments - they have duration:0 and advance instantly
      // Only skip titles and @modifiers
      while (nextIndex < sequence.length) {
        const nextItem = sequence[nextIndex];
        const shouldSkip = nextItem?.kind === "title" || 
                          (nextItem?.kind === "modifier" && !nextItem.chord?.startsWith("RHYTHM"));
        
        if (shouldSkip) {
          nextIndex++;
        } else {
          break; // Found a chord, comment, rest, or tie - stop skipping
        }
      }
      
      if (nextIndex < sequence.length) {
        setSeqIndex(nextIndex);
        
        // ✅ v3.19.55: For display, show the chord being held, not the tie/annotation
        const nextItem = sequence[nextIndex];
        const isTie = nextItem?.kind === "comment" && nextItem.raw === '*';
        const isStandaloneComment = nextItem?.kind === "comment" &&
                                    !nextItem.chord &&
                                    nextItem.comment !== "(tie)" &&
                                    nextItem.comment !== "(rest)";

        if (!isTie && !isStandaloneComment) {
          setDisplayIndex(nextIndex); // Only update display for actual chords/rests
        }
        // If tie or standalone comment, displayIndex stays on previous chord
        
        applySeqItem(sequence[nextIndex]);
        setTimeout(() => selectCurrentItem(), 0);
      } else {
        // End of sequence
        if (loopEnabled) {
          // Loop back to start (skip title/key)
          let startIdx = 0;
          while (startIdx < sequence.length && 
                 (sequence[startIdx].kind === "title" || 
                  (sequence[startIdx].kind === "modifier" && sequence[startIdx].chord?.startsWith("KEY:")))) {
            startIdx++;
          }
          setSeqIndex(startIdx);
          setDisplayIndex(startIdx); // ✅ v3.19.55: Highlight on loop
          applySeqItem(sequence[startIdx]);
          setTimeout(() => selectCurrentItem(), 0);
        } else {
          setIsPlaying(false);

          // ✅ Start 2-minute display timer when sequence ends naturally
          startDisplayTimer();
        }
      }
    }, interval);
    
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, seqIndex, tempo, sequence, transpose, loopEnabled]); // ✅ v4.1.1: Removed latchedAbsNotes to prevent infinite loop

  // ✅ Cleanup display timer on unmount
  useEffect(() => {
    return () => {
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
        displayTimerRef.current = null;
      }
    };
  }, []);

  /* ---------- layout & bonus geometry ---------- */
  const cx=260, cy=260, r=220;
  const layout = useMemo(()=> computeLayout(cx,cy,r,rotationOffset), [rotationOffset]);

  const bonusArcGeom = useMemo(()=>{
    // Don't render if no function set
    if (!bonusFunction) {
      return null;
    }
    
    // Use the function's actual anchor position
    let centerTop: number;
    
    if (WEDGE_ANCHOR_DEG[bonusFunction] !== undefined) {
      // Use the function's anchor position (e.g., V/ii at 52°, ii/vi at 24°)
      centerTop = WEDGE_ANCHOR_DEG[bonusFunction];
    } else {
      // Should not reach here if bonusFunction is valid
      console.warn('⚠️ No anchor found for:', bonusFunction);
      return null;
    }
    
    const g = rotationOffset, norm=(d:number)=>(d%360+360)%360;
    const span = 15, half = span/2;
    const a0Top = norm(centerTop - half + g);
    const a1Top = norm(centerTop + half + g);
    const midTop = norm(centerTop + g);
    const outerAbs = Math.max(r*BONUS_OUTER_R, r*BONUS_OUTER_R);
    const innerAbs = r*BONUS_INNER_R;
    const rMid=(outerAbs+innerAbs)/2, rad=((midTop-90)*Math.PI)/180;
    const labelPos={x:cx + rMid*Math.cos(rad), y: cy + rMid*Math.sin(rad)};
    return { a0Top, a1Top, labelPos };
  },[layout, rotationOffset, bonusFunction]);

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
    const fullStack = new Error().stack?.split('\n').slice(1, 8).join('\n');
    console.log('ðŸŽ¯ setActiveWithTrail called:', { fn, label, stepRecord: stepRecordRef.current });
    console.log('ðŸ“ Stack trace:', fullStack);
    
    // ✅ Save for MIDI latch and cancel any pending clear timer
    latchedChordRef.current = { fn, label };
    console.log('ðŸ’¾ Saved latched chord:', { fn, label });
    if (midiLatchTimeoutRef.current !== null) {
      console.log('ðŸš« Cancelling existing timeout (new chord detected):', midiLatchTimeoutRef.current);
      clearTimeout(midiLatchTimeoutRef.current);
      midiLatchTimeoutRef.current = null;
    }
    
    if(activeFnRef.current && activeFnRef.current!==fn){ makeTrail(); } 
    setActiveFn(fn); 
    setCenterLabel(SHOW_CENTER_LABEL?label:""); 
    lastPlayedChordRef.current = label; // Save for Make My Key
    lastDetectedChordRef.current = label; // ✅ v4.0.51b: Update for keyboard eraser root highlighting
    console.log('ðŸ“ lastPlayedChordRef set to:', label);
    
    // ✅ Step record - insert BEFORE @RHYTHM directives, not at end
    if (stepRecordRef.current && label) {
      setInputText(prev => {
        // Find @RHYTHM position (the "line in the sand")
        const rhythmIndex = prev.indexOf('@RHYTHM');
        
        if (rhythmIndex !== -1) {
          // Insert before @RHYTHM section
          const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
          const rhythmSection = prev.substring(rhythmIndex);
          const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
          return beforeRhythm + (needsComma ? ', ' : '') + label + '\n\n' + rhythmSection;
        } else {
          // No rhythm section - append to end
          return prev ? `${prev}, ${label}` : label;
        }
      });
    }
    
    setBonusActive(false); setBonusLabel(""); 
    stopDimFade();
  };
  
  // ✅ Helper to check if bonus chord should trigger based on skill level
  const shouldTriggerBonus = (fn: Fn): boolean => {
    // Bonus functions: V/V, V/vi, V/ii (secondary dominants)
    const isBonusFunction = fn === "V/V" || fn === "V/vi" || fn === "V/ii";
    if (!isBonusFunction) return true; // Not a bonus chord, always allow
    
    // ✅ Use ref instead of state to avoid stale closure
    // In EXPERT: always allow (they can trigger dynamically)
    if (skillLevelRef.current === "EXPERT") return true;
    
    // In ADVANCED: only if showBonusWedges is ON
    if (skillLevelRef.current === "ADVANCED") return showBonusWedgesRef.current;
    
    // Below ADVANCED: never allow bonus chords
    return false;
  };
  
  // v3.10.1: Helper for bonus overlays (A7, Bm7♭5, etc.) that don't use wedges
  const shouldShowBonusOverlay = (): boolean => {
    const result = (() => {
      // ✅ Use ref instead of state to avoid stale closure
      // In EXPERT: always allow
      if (skillLevelRef.current === "EXPERT") return true;
      
      // In ADVANCED: only if showBonusWedges is ON
      if (skillLevelRef.current === "ADVANCED") return showBonusWedgesRef.current;
      
      // Below ADVANCED: never show
      return false;
    })();
    
    console.log('ðŸŽ­ shouldShowBonusOverlay:', {
      skillLevel: skillLevelRef.current,
      showBonusWedges: showBonusWedgesRef.current,
      result
    });
    
    return result;
  };
  
  const centerOnly=(t:string)=>{ 
    console.log('ðŸŽ¯ centerOnly called:', { t, stepRecord: stepRecordRef.current });
    
    // ✅ Save for MIDI latch and cancel any pending clear timer
    const cleaned = t.replace(/^[#@]\s*/, '').trim();
    latchedChordRef.current = { fn: "", label: cleaned };
    if (midiLatchTimeoutRef.current !== null) {
      console.log('ðŸš« Cancelling existing timeout (centerOnly called):', midiLatchTimeoutRef.current);
      clearTimeout(midiLatchTimeoutRef.current);
      midiLatchTimeoutRef.current = null;
    }
    
    makeTrail(); 
    if (activeFnRef.current) startDimFade();
    setCenterLabel(SHOW_CENTER_LABEL ? cleaned : ""); 
    lastPlayedChordRef.current = cleaned; // Save for Make My Key
    console.log('ðŸ“ lastPlayedChordRef set to:', cleaned);
    
    // ✅ Step record - insert BEFORE @RHYTHM directives, not at end
    if (stepRecordRef.current && cleaned && !cleaned.startsWith('#') && !cleaned.startsWith('@')) {
      setInputText(prev => {
        // Find @RHYTHM position (the "line in the sand")
        const rhythmIndex = prev.indexOf('@RHYTHM');
        
        if (rhythmIndex !== -1) {
          // Insert before @RHYTHM section
          const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
          const rhythmSection = prev.substring(rhythmIndex);
          const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
          return beforeRhythm + (needsComma ? ', ' : '') + cleaned + '\n\n' + rhythmSection;
        } else {
          // No rhythm section - append to end
          return prev ? `${prev}, ${cleaned}` : cleaned;
        }
      });
    }
    
    setBonusActive(false); setBonusLabel(""); 
  };
  
  // Helper to preview a chord by name (for playlist navigation)
  const previewChordByName = (chordName: string) => {
    lastInputWasPreviewRef.current = true;
    const renderKey: KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    console.log('ðŸ” previewChordByName called:', { 
      chordName, 
      renderKey, 
      baseKey: baseKeyRef.current,
      subKey,
      parKey,
      visitor: visitorActiveRef.current,
      subdom: subdomActiveRef.current,
      rel: relMinorActiveRef.current
    });
    
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
      const isMaj7 = chord.includes('Maj') || chord.includes('maj') || chord.includes('M7');
      
      // Diatonic functions
      // Don't match I7 (dominant 7 on tonic - non-diatonic blues/jazz)
      if (relativeDegree === 0) {
        if (is7th && !isMaj7) return null; // I7 is non-diatonic, use fallback
        return "I";
      }
      if (relativeDegree === 2) return isMinor ? "ii" : null;    // ii (Dm in C)
      if (relativeDegree === 4) return isMinor ? "iii" : null;   // iii (Em in C)
      if (relativeDegree === 5) return isMinor ? "iv" : "IV";    // IV (F in C) or iv (Fm in C)
      // V - plain V triad OR V7
      if (relativeDegree === 7) {
        if (is7th) return "V7"; // G7, GMaj7 in C
        return "V"; // Plain G triad in C - should light V wedge!
      }
      if (relativeDegree === 9) return isMinor ? "vi" : null;    // vi (Am in C)
      if (relativeDegree === 10) return "♭VII";   // ♭VII (Bb in C)
      
      return null;
    };
    
    const fn = chordToFunction(chordName, renderKey);
    console.log('ðŸ” chordToFunction returned:', fn, 'for chord:', chordName);
    
    if (fn) {
      // Use previewFn logic to activate wedge
      // Only add 7th if explicitly in chord name OR if it's V7/V/V/etc
      const with7th = PREVIEW_USE_SEVENTHS || fn.includes("7") || chordName.includes("7") || chordName.includes("9") || chordName.includes("11") || chordName.includes("13");
      const pcs = preview.chordPcsForFn(fn, renderKey, with7th);
      
      // Guard: preview module might not know about plain "V" yet
      if (!pcs || pcs.length === 0) {
        console.warn('⏺š ï¸ preview.chordPcsForFn returned empty for:', fn, 'falling back to CHORD_DEFINITIONS');
        // Use CHORD_DEFINITIONS instead
        const chordDef = CHORD_DEFINITIONS[fn as Fn];
        if (chordDef) {
          const keyPc = NAME_TO_PC[renderKey];
          const absPcs = chordDef.triad.map(pc => (pc + keyPc) % 12);
          const rootPc = absPcs[0];
          const absRootPos = preview.absChordRootPositionFromPcs(absPcs, rootPc);
          const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
          latchedAbsNotesRef.current = fitted;
          setLatchedAbsNotes(fitted);
          setActiveWithTrail(fn, realizeFunction(fn, renderKey));
        }
        return;
      }
      
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      latchedAbsNotesRef.current = fitted; // Update ref synchronously
      setLatchedAbsNotes(fitted);
      setActiveWithTrail(fn, realizeFunction(fn, renderKey));
    } else {
      // Fallback: parse chord manually for keyboard display only
      console.log('ðŸ”§ Entering fallback parser for:', chordName);
      try {
        const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
        if (match) {
          const root = match[1];
          let quality = match[2] || '';
          console.log('ðŸ”§ Parsed root:', root, 'quality:', quality);
          
          // Normalize quality string for better parsing
          // Handle alternate notations: A- ⏺†’ Am, AM7 ⏺†’ AMaj7, Bm7-5 ⏺†’ Bm7b5
          quality = quality
            .replace(/^-(?!5)/, 'm')      // A- ⏺†’ Am (but not -5)
            .replace(/^M7/, 'Maj7')       // AM7 ⏺†’ AMaj7, FM7 ⏺†’ FMaj7
            .replace(/m-5/, 'm7b5')       // Bm-5 ⏺†’ Bm7b5
            .replace(/-5/, '7b5')         // A-5 ⏺†’ A7b5
            .replace(/Ã¸/, 'm7b5');        // AÃ¸ ⏺†’ Am7b5
          
          const rootPc = NAME_TO_PC[root as KeyName];
          let intervals: number[] = [0, 4, 7]; // Default: major triad
          console.log('ðŸ”§ Root PC:', rootPc, 'intervals:', intervals);
          
          // Check for minor (m or -)
          const isMinor = quality.includes('m') && !quality.includes('maj') && !quality.includes('Maj') && !quality.includes('M');
          if (isMinor) {
            intervals = [0, 3, 7]; // Minor triad
          }
          
          // Check for 7th, 9th, 11th, 13th (all get dominant 7th for now)
          if (quality.match(/\d+/)) {
            const hasExtension = quality.match(/7|9|11|13/);
            if (hasExtension) {
              if (quality.includes('maj') || quality.includes('Maj') || quality.includes('M7')) {
                intervals.push(11); // Major 7th
              } else if (isMinor) {
                intervals.push(10); // Minor 7th
              } else {
                intervals.push(10); // Dominant 7th
              }
            }
          }
          
          // Check for b5 or #5
          if (quality.includes('b5')) {
            intervals[2] = 6; // Flatten the 5th
          } else if (quality.includes('#5') || quality.includes('+')) {
            intervals[2] = 8; // Sharpen the 5th
          }
          
          const baseMidi = 60;
          let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
          const fitted = preview.fitNotesToWindowPreserveInversion(midiNotes, KBD_LOW, KBD_HIGH);
          console.log('ðŸ”§ Setting latchedAbsNotes to:', fitted);
          latchedAbsNotesRef.current = fitted; // Update ref synchronously  
          setLatchedAbsNotes(fitted);
          console.log('ðŸ”§ latchedAbsNotes updated successfully');
        }
      } catch (e) {
        console.warn('Could not parse chord:', chordName, e);
      }
      
      console.log('ðŸ”§ Calling centerOnly for:', chordName);
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
    if (spaceLocked) return; // ✅ Locked
    if (subHasSpunRef.current) return;
    clearSubSpinTimer();
    setTargetRotation(IV_ROTATE_DEG ?? -168);
    subSpinTimerRef.current = window.setTimeout(()=>{
      setRotationOffset(0); setTargetRotation(0);
      subSpinTimerRef.current = null; subHasSpunRef.current = true;
    }, ROTATION_ANIM_MS + 20) as unknown as number;
  };
  const subSpinExit = ()=>{
    if (spaceLocked) return; // ✅ Locked
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

  const detectDisplayTriadLabel = (pcsRel:Set<number>, _key:KeyName, midiNotes?: number[]): string | null => {
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    const norm = (x:number)=>((x%12)+12)%12;
    
    // ✅ For sus chords, use lowest MIDI note to disambiguate
    // Example: Gsus2 (G-A-D) vs Csus4 (C-F-G) - same PCs [0,2,7] or [0,5,7]
    // Check if we have a sus chord pattern
    let susCandidates: Array<{root: number, type: 'sus2'|'sus4'}> = [];
    
    for (let root=0; root<12; root++){
      const sus2 = [root, norm(root+2), norm(root+7)];
      const sus4 = [root, norm(root+5), norm(root+7)];
      if (sus2.every(p=>pcsRel.has(p))) susCandidates.push({root, type: 'sus2'});
      if (sus4.every(p=>pcsRel.has(p))) susCandidates.push({root, type: 'sus4'});
    }
    
    // If we found sus chords and have MIDI notes, use lowest note to pick the right one
    if (susCandidates.length > 0 && midiNotes && midiNotes.length > 0) {
      const lowestNote = Math.min(...midiNotes);
      const lowestPC = norm(lowestNote);
      
      // Find which sus chord has the lowest note as its root
      const match = susCandidates.find(c => c.root === lowestPC);
      if (match) {
        return `${names[match.root]}${match.type}`;
      }
      
      // Fallback: return first sus candidate if lowest note doesn't match any root
      return `${names[susCandidates[0].root]}${susCandidates[0].type}`;
    }
    
    // Original logic for non-sus or when no MIDI notes available
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

  function detectV4() {
    console.log('🎵 detectV4 called');
    const notes = Array.from(rightHeld.current);
    console.log('🎹 notes:', notes);
    if (notes.length === 0) {
      setActiveFn("");
      setCenterLabel("");
      return;
    }
    // ✅ v4.1.1: Don't double-transpose sequencer notes!
    // Sequencer notes are ALREADY transposed in applySeqItem()
    // Only transpose MIDI keyboard input
    const effectiveTranspose = (transposeBypass || lastInputWasPreviewRef.current) ? 0 : transpose;
    const transposedNotes = notes.map(n => n + effectiveTranspose);
    // EXPERT mode: always detect bonus (pass true). ADVANCED: use toggle
    const shouldDetectBonus = skillLevelRef.current === "EXPERT" ? true : showBonusWedgesRef.current;

    // ✅ v4.1.3: Calculate effectiveKey from baseKeyRef (not state!)
    // CRITICAL: Use ref instead of state to avoid stale closure
    // When user changes key selector, state updates async but ref updates sync
    // MIDI input may arrive before re-render, so we must use ref
    const currentBaseKey = baseKeyRef.current; // ✅ Always fresh!
    const effectiveKey_ForDetection = effectiveTranspose !== 0 ? transposeKey(currentBaseKey, effectiveTranspose) : currentBaseKey;

    const currentSpace = engineStateRef.current.currentSpace;
    let effectiveKey: KeyName = effectiveKey_ForDetection; // ✅ Use ref-based key!
    if (currentSpace === "SUB") {
      effectiveKey = getSubKey(effectiveKey_ForDetection);
    } else if (currentSpace === "PAR") {
      effectiveKey = getParKey(effectiveKey_ForDetection);
    }
    // HOME and REL use effectiveKey_ForDetection

    console.log('🔑 KEY DEBUG:', {
      baseKey: baseKey,
      baseKeyRef: baseKeyRef.current,
      effectiveBaseKey: effectiveBaseKey,
      effectiveKey_ForDetection: effectiveKey_ForDetection,
      effectiveKey: effectiveKey,
      transpose: transpose,
      effectiveTranspose: effectiveTranspose
    });
    const result: EngineResult = detectAndMap(transposedNotes, effectiveKey, baseKeyRef.current, shouldDetectBonus, engineStateRef.current);
    console.log('⚙️ Engine result:', result);
    console.log('🔍 Base key:', baseKeyRef.current, 'Show bonus:', showBonusWedgesRef.current);
    if (!result.function && result.chordName) {
      console.log('❌ MAPPING FAILED: Detected', result.chordName, 'but got null function');
    }
    
    // Update engine state
    engineStateRef.current = updateEngineState(engineStateRef.current, result);
    
    // CRITICAL: Handle space transitions FIRST (before checking function)
    // Space-entry chords like Gm, Eb don't have functions but DO trigger spaces
    if (result.spaceAction.action === "enter") {
      if (result.spaceAction.newSpace === "SUB") {
        setSubdomActive(true); setVisitorActive(false); setRelMinorActive(false);
        subSpinEnter(); // ✅ v4.1.6: Trigger SUB entry animation
      } else if (result.spaceAction.newSpace === "PAR") {
        setVisitorActive(true); setSubdomActive(false); setRelMinorActive(false);
      } else if (result.spaceAction.newSpace === "REL") {
        setRelMinorActive(true); setSubdomActive(false); setVisitorActive(false);
      }
    } else if (result.spaceAction.action === "exit") {
      setSubdomActive(false); setVisitorActive(false); setRelMinorActive(false);
      subSpinExit(); // ✅ v4.1.6: Trigger HOME return animation (includes jiggle)
    }
    
    // Now handle function (if present)
    // ✅ v4.0.51b: ALWAYS update lastDetectedChordRef for keyboard blue erasers, even for illegal chords
    if (result.chordName) {
      lastDetectedChordRef.current = result.chordName;
      lastPlayedChordRef.current = result.chordName;
    }
    
    if (!result.function) {
      setActiveFn("");
      setCenterLabel(result.chordName || "");
      setBonusActive(false);
      setBonusLabel("");
      setBonusFunction(null);
      return;
    }
    
    setCenterLabel(result.chordName);
    if (result.shouldUpdate) { setActiveFn(result.function); }

    // Handle bonus wedges (only for complete chords - 3+ notes)
    // ✅ v4.2.1: Bonus wedges ONLY appear in HOME space (defensive check)
    if (result.isBonus && notes.length >= 3 && currentSpace === "HOME") {
      setBonusFunction(result.function); // Set function FIRST for positioning
      setBonusLabel(result.chordName);
      setBonusActive(true); // Set active LAST to ensure geometry is ready
    } else {
      setBonusActive(false);
      setBonusLabel("");
      setBonusFunction(null);
    }
    
    // Step recording
    if (stepRecordRef.current && result.chordName) {
      setInputText(prev => {
        const rhythmIndex = prev.indexOf("@RHYTHM");
        if (rhythmIndex !== -1) {
          const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
          const rhythmSection = prev.substring(rhythmIndex);
          return beforeRhythm + ", " + result.chordName + "\n\n" + rhythmSection;
        }
        return prev ? `${prev}, ${result.chordName}` : result.chordName;
      });
    }
    // MIDI latch
    latchedChordRef.current = { fn: result.function, label: result.chordName };
    if (midiLatchTimeoutRef.current) { clearTimeout(midiLatchTimeoutRef.current); }
    midiLatchTimeoutRef.current = setTimeout(() => {
      latchedChordRef.current = null;
      setActiveFn("");
      setCenterLabel("");
    }, 10000);
  }

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
      console.log('ðŸ” No notes held - checking latch state:', {
        latchedChord: latchedChordRef.current,
        hasLatchedChord: !!latchedChordRef.current,
        subdomActive: subdomActiveRef.current,
        subdomLatched: subdomLatchedRef.current
      });
      
      setTapEdge("REL_Am", false); setTapEdge("REL_C", false); setTapEdge("VIS_G", false);
      bonusDeb.reset();

      // ✅ Check for latched chord before clearing
      if (latchedChordRef.current) {
        console.log('ðŸ”’ MIDI latch active - keeping display:', latchedChordRef.current);
        // Restore the latched chord display
        if (latchedChordRef.current.fn) {
          setActiveFn(latchedChordRef.current.fn);
        }
        setCenterLabel(latchedChordRef.current.label);
        return; // Don't clear!
      }

      if (subdomActiveRef.current && subdomLatchedRef.current) {
        if (!centerLabel) setCenterLabel(subKey);
        if (!activeFnRef.current) setActiveFn(subLastSeenFnRef.current || "I");
        hardClearGhostIfIdle();
        return;
      }
      hardClearGhostIfIdle();
      console.log('⏺Œ No latch - clearing display');
      return clear();
    }

    setLatchedAbsNotes(absHeld);

    // PHASE 2C: Convert to baseKey-relative (not C-relative!)
    // This makes ALL isSubset() checks work in any key
    const toRel=(n:number)=>((n-NAME_TO_PC[baseKeyRef.current]+12)%12);
    const pcsRel=new Set([...pcsAbs].map(toRel));
    // MODIFIED v2.37.9: Pass absHeld array to internalAbsoluteName for dim7 root disambiguation
    const absName = internalAbsoluteName(pcsAbs, baseKeyRef.current, absHeld) || "";
    
  // ✅ E7-ONLY DIAGNOSTIC for double-press bug
    if (absName === "E7") {
      console.log('ðŸ” E7 DETECTED:', {
        chord: absName,
        pcsRel: [...pcsRel],
        visitor: visitorActiveRef.current,
        subdom: subdomActiveRef.current,
        homeSuppressUntil: homeSuppressUntilRef.current,
        now: performance.now(),
        suppressed: performance.now() < homeSuppressUntilRef.current,
        blocked: performance.now() < homeSuppressUntilRef.current ? 'YES - BLOCKED' : 'NO'
      });
    }
    
    // v3.5.0: Fix diminished chord spelling in HOME space
    // G#dim (leading tone to A), C#dim (leading tone to D), Ebdim (ties to bIII parallel)
    let displayName = absName;
    if ((absName.includes('Â°') || absName.includes('dim')) && !relMinorActiveRef.current && !subdomActiveRef.current && !visitorActiveRef.current) {
      // HOME space only - spell based on function
      const before = displayName;
      displayName = displayName
        .replace(/^Ab(dim|Â°)/, 'G#$1')   // G# is leading tone to A (V/vi function)
        .replace(/^Db(dim|Â°)/, 'C#$1')   // C# is leading tone to D (V/ii function)  
        .replace(/^D#(dim|Â°)/, 'Eb$1');  // Eb ties to bIII in parallel (keep flat)
      if (before !== displayName) {
        console.log('ðŸ”¤ Spelling fix:', before, '⏺†’', displayName);
      }
      // Gb⏺†’F# naturally handled by theory.ts
    }
    
    // Store for Make My Key - this is the pure MIDI detection result
    if (absName) {
      lastDetectedChordRef.current = absName;
      console.log('ðŸ’Ž lastDetectedChordRef set to:', absName, '(from theory.ts)');
    }

    updateRecentRel(pcsRel);

    const isSubset = (need:number[])=> subsetOf(T(need), pcsRel);

    /* ---------- PRIORITY DIM7 CHECK (v3.5.6) ---------- */
    // CRITICAL: Check ALL dim7 chords BEFORE any other logic (including PAR)
    // Must run IMMEDIATELY after getting absName from theory.ts
    
    // v3.5.6: ALWAYS check if currently held notes form a dim7, regardless of what was detected
    // This prevents Bdim from showing when all 4 notes of G#dim7 are held
    const currentPcsRel = new Set([...merged].map(n => pcFromMidi(n)).map(n => (n - NAME_TO_PC[baseKeyRef.current] + 12) % 12));
    const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
    const bassPc = bassNote !== null ? (bassNote % 12) : null;
    
    console.log('ðŸ” [DIM7 ALWAYS-CHECK]', {
      currentPcsRel: [...currentPcsRel].sort((a,b) => a-b),
      absHeld,
      bassNote,
      bassPc,
      absName,
      displayName
    });
    
    // G#dim7 [8,11,2,5] with G# bass ⏺†’ V/vi wedge
    // Check if ALL 4 notes are currently held
    if (currentPcsRel.size >= 4 && [8,11,2,5].every(pc => currentPcsRel.has(pc)) && bassPc === 8) {
      if (shouldTriggerBonus("V/vi")) {
        console.log('✅ G#dim7 ALWAYS detected (all 4 notes held) ⏺†’ V/vi');
        setActiveWithTrail("V/vi", displayName);
        return;
      }
    }
    
    // ✅ v3.17.85 FIX: Bm7b5 ABSOLUTE PRIORITY - must check before diatonic
    // Bm7b5 [11,2,5,9] shares notes with Dm7 [2,5,9,0] - must catch it early!
    if (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.has(9) && pcsRel.size === 4) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ Bm7♭5 EARLY CHECK ⏺†’ ii/vi bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("Bm7♭5");
        
        // ✅ Debounced recording for early check
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording Bm7b5 (early check, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        return;
      }
    }
    
  // ✅ FIX: Bdim triad EARLY CHECK - must check before diatonic
    // Bdim [11,2,5] can match as subset of Dm [2,5,9] - catch it early!
    if (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.size === 3) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ Bdim TRIAD EARLY CHECK ⏺†’ ii/vi bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("Bm7♭5"); // Use functional label
        
        // ✅ Debounced recording for early check
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording Bdim (early check, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        // ✅ Bonus wedge will light automatically via bonusActive + bonusLabel
        // No need to call setActiveWithTrail - bonus overlay handles highlighting
        return;
      }
    }
    
  // ✅ REMOVED: Early Fmaj7 check was here but it ran BEFORE SUB section
    // This caused Fmaj7 in SUB space to light IV (Bb) instead of I (F)
    // The proper Fmaj7 check with SUB guard is at line ~5540
    
    // Bdim7 [11,2,5,8] with B bass ⏺†’ V7 wedge (exception!)
    if (currentPcsRel.size >= 4 && [11,2,5,8].every(pc => currentPcsRel.has(pc)) && bassPc === 11) {
      console.log('✅ Bdim7 ALWAYS detected (all 4 notes held) ⏺†’ V7');
      setActiveWithTrail("V7", displayName);
      return;
    }
    
    // ✅ v3.19.55: C#dim triad detection - check ABSOLUTE pitch classes [1,4,7]
    // This works in ALL keys because C#-E-G is always [1,4,7] absolute
    const absolutePcs = new Set([...merged].map(n => n % 12));
    const hasCSharpDimTriad = absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.has(7) && absolutePcs.size === 3;
    
    console.log('ðŸ” C#dim triad check:', {
      absolutePcs: Array.from(absolutePcs).sort((a,b) => a-b),
      has1: absolutePcs.has(1),
      has4: absolutePcs.has(4),
      has7: absolutePcs.has(7),
      size: absolutePcs.size,
      shouldShow: shouldShowBonusOverlay(),
      match: hasCSharpDimTriad
    });
    
    if (hasCSharpDimTriad) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ C#dim TRIAD EARLY CHECK ⏺†’ V/ii bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        
        // ✅ Debounced recording for early check
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording C#dim (early check, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        return;
      }
    }
    
    // ✅ v3.19.55: C#dim7 detection - check ABSOLUTE pitch classes [1,4,7,10]
    const hasCSharpDim7 = absolutePcs.size >= 4 && [1,4,7,10].every(pc => absolutePcs.has(pc));
    if (hasCSharpDim7) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ C#dim7 EARLY CHECK (any inversion) ⏺†’ V/ii bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        
        // ✅ Debounced recording for early check
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording C#dim7 (early check, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }

        return;
      }
    }
    
    // If we get here and it's a dim triad (3 notes), allow it through
    // (not part of a held dim7 chord)
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
    // ✅ v3.19.55: V7 detection - exclude Em7 [4,7,11,2] by checking !pcsRel.has(4)
    if (!visitorActiveRef.current && (isSubset([7,11,2]) || isSubset([7,11,2,5])) && !pcsRel.has(4)) {
      if (subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G7"); return;
    }
    
    // ✅ E7 (V/vi) also exits SUB - triad OR 7th
    // E triad [4,8,11] or E7 [4,8,11,2]
    if (!visitorActiveRef.current && (isSubset([4,8,11]) || isSubset([4,8,11,2]))) {
      if (subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V/vi", absName || "E7"); return;
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

      // ========== NEW v2.45.0: viiÂ°7 special case (works in all keys!) ==========
      // viiÂ°7 (leading tone dim7) acts as dominant substitute in ANY key
      // Pattern: [11,2,5,8] relative to tonic (7th scale degree + dim7 intervals)
      // C: Bdim7, F: Edim7, G: F#dim7, Ab: Gdim7, etc.
      // Allow extra notes (doubled roots, etc.) as long as core pattern present
      const hasVii7Pattern = isSubset([11,2,5,8]) && isFullDim7;
      if (!inParallel && hasVii7Pattern) {
        // Light the V7 wedge, display actual chord name in hub
        setActiveFn("V7"); 
        setCenterLabel(displayName); // Use actual name (Bdim7, Edim7, etc.)
        setBonusActive(false);  // Don't use bonus overlay
        return;
      }
      // ========== END NEW v2.45.0 ==========

      // ✅ OLD Bdim/Bm7b5 detection DISABLED
      // This old code is superseded by better detection at line ~3105 which:
      // - Checks shouldShowBonusOverlay() properly
      // - Uses functional label "Bm7♭5" for consistent colors
      // - Checks exact chord size
      /*
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
          setCenterLabel(displayName);
          setBonusActive(true); 
          setBonusLabel(displayName);
        }, BONUS_DEBOUNCE_MS) as unknown as number;
        return;
      } else {
        clearBdimTimer();
      }
      */

      const hasCsharpDimTri  = isSubset([1,4,7]);
      const hasCsharpHalfDim = isSubset([1,4,7,11]);
      const isCsharpFullDim7 = (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12));
      if (!inParallel && (hasCsharpDimTri || hasCsharpHalfDim || isCsharpFullDim7) && shouldShowBonusOverlay()){
        // MODIFIED v2.37.10: Use actual chord name instead of hardcoding "A7"
        // The chord identifier now correctly names these (C#dim, C#dim7, C#m7⏺™­5)
        // They still light the A7 bonus wedge (correct functional behavior)
        setActiveFn(""); 
        setCenterLabel(absName || "A7");  // Use absName, fallback to A7 if needed
        setBonusActive(true); 
        setBonusLabel("A7");  // Wedge label stays "A7" (functional label)
        
        // ✅ Add debounced recording
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording C#dim family (parallel space, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        return;
      }

      // ✅ OLD A/A7 detection DISABLED  
      // This old code is superseded by better detection at line ~3134 which:
      // - Checks shouldShowBonusOverlay() properly
      // - Uses functional label "A7" for consistent colors
      // - Checks exact chord size
      /*
      const hasA7tri = isSubset([9,1,4]);
      const hasA7    = hasA7tri || isSubset([9,1,4,7]);
      if (hasA7 && shouldShowBonusOverlay()){
        // v3.5.0: Use absName for center label to distinguish A from A7
        // But keep bonus wedge label as "A7" (functional label)
        const centerLabelToUse = absName || "A7";
        setActiveFn(""); setCenterLabel(centerLabelToUse);
        setBonusActive(true); setBonusLabel("A7"); // Wedge always shows "A7"
        return;
      }
      */

      // ✅ REMOVED unconditional bonus clearing
      // Old: setBonusActive(false); setBonusLabel("");
      // This was clearing bonus set by earlier checks, breaking EXPERT mode display
      // Bonus state should persist unless explicitly cleared by another detection
    }

    /* ---------- SUBDOM (F) ---------- */
    {
   // ✅ DEBUG: Track SUB state
      if (absName === "Fmaj7" || absName === "F" || (pcsRel.has(5) && pcsRel.has(9) && pcsRel.has(0))) {
        console.log('ðŸ”§ SUB SECTION START:', {
          absName,
          inSUB: subdomActiveRef.current,
          pcsRel: [...pcsRel],
          pcsRelSize: pcsRel.size
        });
      }
      
      // ✅ Check for PAR (Eb-space) chords BEFORE SUB entry
      // Problem: Ebmaj7 [3,7,10,2] contains Gm [7,10,2] as subset
      // Solution: Exclude Eb/Ebmaj7/Ab/Db from SUB entry
      const isEbChord = isSubset([3,7,10]) || isSubset([3,7,10,2]);
      const isAbChord = isSubset([8,0,3]) || isSubset([8,0,3,7]);
      const isDbChord = isSubset([1,5,8]) || isSubset([1,5,8,0]);
      const isParChord = isEbChord || isAbChord || isDbChord;
      
      const enterByGm = isSubset([7,10,2]) || isSubset([7,10,2,5]);
      const enterByC7 = isSubset([0,4,7,10]);

      // ✅ Don't enter SUB if it's actually a PAR chord
      if (!subdomActiveRef.current && isNoteOn && (enterByGm || enterByC7) && !isParChord) {

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
        if (isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S)) {
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
        
        // ✅ Don't enter PAR if already in PAR (Eb/Ab/Db are diatonic in minor)
        if ((eb || ab || db) && !visitorActiveRef.current){
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

        if (subdomLatchedRef.current && S.size < 3) {
          homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
          return;
        }

        const stayOnF       = isSubsetIn([5,9,0], S) || isSubsetIn([5,9,0,4], S);
        const stayOnGm      = isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S);
        const stayOnC7      = isSubsetIn([0,4,7,10], S);
        const isCtriadExact = exactSetIn([0,4,7], S);
        
    // ✅ DEBUG: Why isn't Fmaj7 matching?
        if (absName === "Fmaj7" || absName === "F") {
          console.log('ðŸ” SUB F/Fmaj7 CHECK:', {
            absName,
            S: [...S],
            pcsRel: [...pcsRel],
            hasTriad: isSubsetIn([5,9,0], S),
            hasFmaj7: isSubsetIn([5,9,0,4], S),
            stayOnF,
            useWindow,
            suppressed: performance.now() < homeSuppressUntilRef.current
          });
        }

        const exitOnCmaj7 = isSubsetIn([0,4,7,11], S);
        const exitOnAm7   = exactSetIn([9,0,4,7], S);
        const exitOnDm    = isSubsetIn([2,5,9], S) || isSubsetIn([2,5,9,0], S);

        if (exitOnCmaj7 || exitOnAm7 || exitOnDm) {
          console.log('ðŸšª EXITING SUB:', {
            chord: absName,
            exitTrigger: exitOnCmaj7 ? 'Cmaj7' : exitOnAm7 ? 'Am7' : 'Dm',
            settingSuppress: performance.now() + 140,
            settingJustExited: true
          });
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
      if (shouldTriggerBonus("V/V")) {
        setVisitorActive(false);
        setActiveWithTrail("V/V", "D7");
        return;
      }
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
          // ✅ Add permission check
          if (shouldShowBonusOverlay()) {
            setActiveFn(""); setCenterLabel(absName || "C#dim7"); // Use absName, not hardcoded "A7"
            setBonusActive(true); setBonusLabel("A7");
            return;
          }
        }
        
        // ========== NEW v2.45.0: viiÂ°7 in REL Am (works in all keys!) ==========
        // viiÂ°7 of meta-key should map to V7, not be misidentified
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
      if (hasFsharpDim7 && shouldTriggerBonus("V/V")) {
        setVisitorActive(false);
        setActiveWithTrail("V/V", absName);
        return;
      }
      
      // Exit on A7/A (V/ii function - use bonus wedge)
      const hasA = isSubset([9,1,4]);
      if (hasA && shouldShowBonusOverlay()) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7");
        setCenterLabel(displayName);
        setActiveFn("");
        
        // ✅ Add debounced recording
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording A/A7 (PAR exit, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        return;
      }
      
      // Exit on C#dim7 family (V/ii function - use bonus wedge)
      const hasCsharpDim7 = pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10);
      if (hasCsharpDim7 && shouldShowBonusOverlay()) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        setCenterLabel(displayName); // Actual chord name
        setActiveFn("");
        
        // ✅ Add debounced recording
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording C#dim7 (PAR exit, after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        
        return;
      }
    }
    /* ========== END v2.45.0 ========== */

    /* In PAR mapping - now dynamic for all keys! */
    if(visitorActiveRef.current){
      // CRITICAL: Check viiÂ° and viiÂ°7 FIRST (before diatonic matching)
      // viiÂ° and viiÂ°7 act as V chord for meta-key in ALL keys
      // In PAR space, this means V/vi function, NOT V7 of PAR key
      // Pattern [11,2,5] for viiÂ° triad, [11,2,5,8] for viiÂ°7
      // MUST check BEFORE diatonic because [11,2,5] matches Bb triad subset!
      // Allow extra notes (e.g., doubled roots) as long as core pattern present
      const hasViiTriad = isSubset([11,2,5]) && pcsRel.size <= 4; // Allow up to 4 notes
      const hasVii7 = isSubset([11,2,5,8]); // Any size OK for dim7
      if (hasViiTriad || hasVii7) {
        // Light V/vi wedge, display actual chord name
        setActiveFn("V/vi"); 
        setCenterLabel(displayName); // Edim/Edim7 in F, Bdim/Bdim7 in C, etc.
        setBonusActive(false);
        return;
      }
      
      // v3.18.60 FIX: Check meta-key V and V7 BEFORE diatonic matching
      // When in PAR (e.g., C⏺†’Eb/Cm), meta-key V (G in C) should light V/vi wedge
      // This represents V of the parallel minor (V of Cm = G)
      // Pattern [7,11,2] = V triad, [7,11,2,5] = V7 (relative to meta-key)
      // MUST check BEFORE diatonic to prevent matching PAR space V (Bb in Eb)
      // Works universally: pcsRel is relative to baseKey, so [7,11,2] = V in any key
      const hasMetaV = isSubset([7,11,2]);
      const hasMetaV7 = isSubset([7,11,2,5]);
      if (hasMetaV || hasMetaV7) {
        // Light V/vi wedge, display actual chord name (G or G7 in C, D or D7 in G, etc.)
        setActiveWithTrail("V/vi", displayName);
        return;
      }
      
      // Now check diatonic (after viiÂ° and meta-V checks)
      const m7 = firstMatch(parDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7⏺™­5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, parKey);
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7⏺™­5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
      const tri = firstMatch(parDiatonic.reqt, pcsRel); 
      if(tri){ 
        // v3.5.0: Use absName from theory.ts instead of realizeFunction
        const chordName = absName || realizeFunction(tri.f as Fn, parKey);
        console.log('[DETECT] Matched PAR tri:', { 
          fn: tri.f, 
          chordName, 
          absName,
          usingAbsName: !!absName,
          parKey,
          baseKey: baseKeyRef.current,
          pcsRel: [...pcsRel],
          triPattern: tri.s ? [...tri.s] : 'none'
        });
        setActiveWithTrail(tri.f as Fn, chordName); 
        return; 
      }
    }

    /* In C mapping */
    console.log('ðŸ  HOME CHECK:', {
      now: performance.now(),
      suppressUntil: homeSuppressUntilRef.current,
      willRun: performance.now() >= homeSuppressUntilRef.current,
      pcsRelSize: pcsRel.size
    });
    
    // ✅ Smart suppression - only block ambiguous chords
    // Check if current chord is unambiguous (has clear function)
    // Calculate these before the suppression check
    const baseKeyPC = NAME_TO_PC[baseKeyRef.current];
    
    // Secondary dominants (V/V, V/vi) - always unambiguous
    const vOfV_root = (baseKeyPC + 2) % 12;
    const vOfV_triad = [(vOfV_root + 0) % 12, (vOfV_root + 4) % 12, (vOfV_root + 7) % 12];
    const isVofV = isSubsetIn(vOfV_triad, pcsAbs);
    
    const vOfVi_root = (baseKeyPC + 4) % 12;
    const vOfVi_triad = [(vOfVi_root + 0) % 12, (vOfVi_root + 4) % 12, (vOfVi_root + 7) % 12];
    const isVofVi = isSubsetIn(vOfVi_triad, pcsAbs);
    
    // Clear diatonic chords (ii, iii, vi, IV)
    const isII = isSubsetIn([2, 5, 9], pcsRel);
    const isIII = isSubsetIn([4, 7, 11], pcsRel);
    const isVI = isSubsetIn([9, 0, 4], pcsRel);
    const isIV = isSubsetIn([5, 9, 0], pcsRel);
    
    // Ambiguous chords (I triad could be confused with V in SUB)
    const isTonic = isSubsetIn([0, 4, 7], pcsRel) && !isSubsetIn([0, 4, 7, 11], pcsRel) && !isSubsetIn([0, 4, 7, 10], pcsRel);
    
  // ✅ FIX: V/vi (E7) should bypass suppression after SUB exit
    // Bug: After SUB exit, E7 requires 2 presses because homeSuppressUntilRef blocks detection
    // Solution: Check absName directly - if theory.ts detected E7, it's unambiguous
    const isE7 = absName === "E7" || absName === "E";
    const isUnambiguous = isVofV || isVofVi || isII || isIII || isVI || isIV || isE7;
    
    // If chord is unambiguous OR suppression period has passed, allow detection
    const allowHomeCheck = isUnambiguous || (performance.now() >= homeSuppressUntilRef.current);
    
    console.log('ðŸ”’ ALLOW HOME CHECK:', {
      allowHomeCheck,
      isUnambiguous,
      isVofV,
      isVofVi,
      isII,
      isIII,
      isVI,
      isIV,
      suppressed: performance.now() < homeSuppressUntilRef.current,
      chord: absName
    });
    
    if (allowHomeCheck){
      // v3.5.1: Get bass note for diminished chord function detection
      const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
      const bassPc = bassNote !== null ? (bassNote % 12) : null;
      
      // ✅ Check secondary dominants BEFORE main pattern matching
      // (baseKeyPC already calculated above for suppression check)
      
      // V/V = V of V = dominant of scale degree 5 = scale degree 2
      // In C: D or D7 (2,6,9) or (2,6,9,0). In F: G or G7 (7,11,2) or (7,11,2,5).
      // (vOfV_root already calculated above)
      const vOfV_seventh = (vOfV_root + 10) % 12;
      const vOfV_hasTriad = isSubsetIn(vOfV_triad, pcsAbs);
      const vOfV_has7th = isSubsetIn([vOfV_seventh], pcsAbs);
      const vOfV = vOfV_hasTriad; // Trigger on triad alone OR with 7th
      
      // V/vi = V of vi = dominant of scale degree 6 (relative minor) = scale degree 4  
      // In C: E or E7 (4,8,11) or (4,8,11,2). In F: A or A7 (9,1,4) or (9,1,4,7).
      // (vOfVi_root and vOfVi_triad already calculated above)
      const vOfVi_seventh = (vOfVi_root + 10) % 12;
      const vOfVi_hasTriad = isSubsetIn(vOfVi_triad, pcsAbs);
      const vOfVi_has7th = isSubsetIn([vOfVi_seventh], pcsAbs);
      const vOfVi = vOfVi_hasTriad; // Trigger on triad alone OR with 7th
      
      console.log('ðŸ” V/vi CALC:', {
        vOfVi_root,
        vOfVi_triad,
        vOfVi_hasTriad,
        vOfVi_has7th,
        vOfVi,
        pcsAbs: [...pcsAbs],
        absName
      });
      
      // V/vi also includes diminished substitution (e.g., G#dim for E7 in C)
      const vOfVi_dimSub_root = (vOfVi_root + 4) % 12; // Minor third above V/vi root
      const vOfVi_dimTriad = [(vOfVi_dimSub_root + 0) % 12, (vOfVi_dimSub_root + 3) % 12, (vOfVi_dimSub_root + 6) % 12];
      const vOfVi_dimSub = isSubsetIn(vOfVi_dimTriad, pcsAbs) && (pcsAbs.size === 3 || (pcsAbs.size === 4 && bassPc === vOfVi_dimSub_root));

      // ✅ V/V and V/vi ALWAYS trigger (have dedicated wedges)
      // shouldTriggerBonus only gates bonus overlays (ii/vi, V/ii) without wedges
      if (vOfV){ 
        const vOfV_rootName = pcNameForKey(vOfV_root, baseKeyRef.current);
        const chordLabel = vOfV_has7th ? `${vOfV_rootName}7` : vOfV_rootName;
        setActiveWithTrail("V/V", chordLabel); 
        return; 
      }
      if (vOfVi || vOfVi_dimSub){ 
        console.log('🎵 V/vi DETECTED:', {
          chord: absName,
          vOfVi_match: vOfVi,
          dimSub_match: vOfVi_dimSub,
          isUnambiguous: true,
          suppressUntil: homeSuppressUntilRef.current,
          now: performance.now(),
          wasSuppressed: performance.now() < homeSuppressUntilRef.current
        });
        let chordName: string;
        if (vOfVi_dimSub) {
          chordName = displayName;
        } else {
          const rootName = pcNameForKey(vOfVi_root, baseKeyRef.current);
          chordName = vOfVi_has7th ? `${rootName}7` : rootName;
        }
        setActiveWithTrail("V/vi", chordName); 
        return; 
      }
      
      // ✅ Check common diatonic triads (ii, iii, vi) - pattern matcher may not have them
      // These are RELATIVE to baseKey (scale degrees), not absolute pitch classes
      
   // ✅ FIX: Check Cmaj7 BEFORE iii triad
      // Bug: Cmaj7 [0,4,7,11] contains iii triad [4,7,11] as subset
      // Must check exact Cmaj7 first to prevent false iii match
      if (exactSetIn([0, 4, 7, 11], pcsRel)) {
        console.log('✅ EARLY Cmaj7 CHECK: [0,4,7,11] ⏺†’ I wedge');
        setActiveWithTrail("I", displayName || "Cmaj7");
        return;
      }
      
      const ii_triad = isSubsetIn([2, 5, 9], pcsRel);
      const ii_7th = isSubsetIn([2, 5, 9, 0], pcsRel);
      const iii_triad = isSubsetIn([4, 7, 11], pcsRel);
      const iii_7th = isSubsetIn([4, 7, 11, 2], pcsRel);
      const vi_triad = isSubsetIn([9, 0, 4], pcsRel);
      const vi_7th = isSubsetIn([9, 0, 4, 7], pcsRel);
      
   // ✅ FIX: Exclude Bm7b5 from ii when bonus disabled
      // Bm7b5 [11,2,5,9] contains ii notes [2,5,9] as subset
      // If bonus disabled, Bm7b5 early check returns false and falls through to here
      // Solution: Check for B (11) - if present with exact size 4, it's Bm7b5, not Dm
      const isBm7b5Pattern = pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.has(9) && pcsRel.size === 4;
      const shouldExcludeFromIi = isBm7b5Pattern && !shouldShowBonusOverlay();
      
      if ((ii_triad || ii_7th) && !shouldExcludeFromIi) {
        const chordName = absName || realizeFunction("ii" as Fn, baseKeyRef.current);
        // ✅ Don't append 7 if already present (Fm7 ⏺†’ Fm77 bug)
        const label = ii_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("ii", label);
        return;
      }
      if (iii_triad || iii_7th) {
        const chordName = absName || realizeFunction("iii" as Fn, baseKeyRef.current);
        const label = iii_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("iii", label);
        return;
      }
      
   // ✅ FIX: Check A7 bonus BEFORE vi check
      // Bug: A7 [9,1,4,7] matches vi_triad check [9,0,4] via isSubsetIn (9 and 4 present)
      // This causes vi to return before A7 bonus check can run
      // Solution: Check A7 bonus family first (must be EXACT size match)
      // ✅ v3.19.55: Use ABSOLUTE pitch classes to work in all keys
      // A = [9,1,4] absolute, C#dim = [1,4,7] absolute, C#m7⏺™­5 = [1,4,7,11] absolute
      const hasA = absolutePcs.has(9) && absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.size === 3;
      const hasA7 = absolutePcs.has(9) && absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.has(7) && absolutePcs.size === 4;
      const hasCSharpDimTriad = absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.has(7) && absolutePcs.size === 3;
      const hasCSharpHalfDim = absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.has(7) && absolutePcs.has(11) && absolutePcs.size === 4;
      
      if (!visitorActiveRef.current && (hasA || hasA7 || hasCSharpDimTriad || hasCSharpHalfDim) && shouldShowBonusOverlay()) {
        const recordName = absName || displayName;
        console.log('✅ A7 BONUS TRIGGERED (before vi check)!', {
          hasA,
          hasA7,
          displayName,
          absName,
          recordName,
          pcsRel: Array.from(pcsRel),
          stepRecord: stepRecordRef.current
        });
        setActiveFn(""); 
        setCenterLabel(displayName); // Show actual chord name
        setBonusActive(true); 
        setBonusLabel("A7"); // Use functional label for wedge
        
        // ✅ Debounced recording
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          if (bonusRecordDebounceRef.current !== null) {
            clearTimeout(bonusRecordDebounceRef.current);
          }
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording A/A7 bonus chord (after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        return;
      }
      
      // ✅ EARLY Fmaj7 check BEFORE vi check
      // Fmaj7 [5,9,0,4] contains vi_triad [9,0,4] as subset
      // Must check exact match first to prevent misidentification as Am
      if (exactSetIn([5, 9, 0, 4], pcsRel)) {
        console.log('✅ EARLY Fmaj7 CHECK: [5,9,0,4] ⏺†’ IV wedge');
        setActiveWithTrail("IV", displayName || "Fmaj7");
        return;
      }
      
      // NOW check vi (after A7 bonus ruled out AND Fmaj7 ruled out)
      if (vi_triad || vi_7th) {
        const chordName = absName || realizeFunction("vi" as Fn, baseKeyRef.current);
        const label = vi_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("vi", label);
        return;
      }
      
      // ✅ v3.6.1 FIX: REMOVED hardcoded E/E7 and G/G7 checks
      // Old code checked for patterns [4,8,11] (E) and [7,11,2] (G) in C
      // But these patterns mean DIFFERENT chords in other keys!
      // In Eb: [7,11,2] = Bb (not G), [4,8,11] = G (not E)
      // Solution: Let homeDiatonic patterns handle ALL diatonic chords
      // This makes the system work correctly in ANY key
      
      // PRIORITY: Check bonus chords (triads and half-dim only - dim7 checked above)
      // ii/vi bonus: Bdim triad (any inversion) or Bm7♭5 (any inversion)
      // ✅ v3.19.55: Use ABSOLUTE pitch classes [11,2,5] to work in all keys
      const hasBdimTriad = absolutePcs.has(11) && absolutePcs.has(2) && absolutePcs.has(5) && absolutePcs.size === 3;
      const hasBm7b5 = absolutePcs.has(11) && absolutePcs.has(2) && absolutePcs.has(5) && absolutePcs.has(9) && absolutePcs.size === 4;
      
      console.log('ðŸ” Bm7♭5 bonus check:', {
        absolutePcs: Array.from(absolutePcs).sort((a,b) => a-b),
        hasBdimTriad,
        hasBm7b5,
        visitorActive: visitorActiveRef.current,
        shouldShow: shouldShowBonusOverlay(),
        skillLevel
      });
      
      // ✅ Re-add shouldShowBonusOverlay check (was removed in v3.13.9 by mistake)
      if (!visitorActiveRef.current && (hasBdimTriad || hasBm7b5) && shouldShowBonusOverlay()) {
        const recordName = absName || displayName;
        console.log('✅ Bm7♭5 BONUS TRIGGERED!');
        setActiveFn(""); 
        setCenterLabel(displayName);
        setBonusActive(true); 
        setBonusLabel("Bm7♭5"); // ✅ Use functional label for wedge
        // ✅ Debounced recording using ref
        if (stepRecordRef.current && absName) {
          latestBonusChordNameRef.current = absName;
          console.log('ðŸ• Setting Bdim/Bm7b5 debounce timer for:', absName);
          
          if (bonusRecordDebounceRef.current !== null) {
            console.log('ðŸš« Clearing old Bdim timer');
            clearTimeout(bonusRecordDebounceRef.current);
          }
          
          bonusRecordDebounceRef.current = window.setTimeout(() => {
            const chordToRecord = latestBonusChordNameRef.current;
            console.log('ðŸ“ Recording Bdim/Bm7b5 bonus chord (after debounce):', chordToRecord);
            setInputText(prev => {
              const rhythmIndex = prev.indexOf('@RHYTHM');
              if (rhythmIndex !== -1) {
                const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
                const rhythmSection = prev.substring(rhythmIndex);
                const needsComma = beforeRhythm.length > 0 && !beforeRhythm.endsWith(',');
                return beforeRhythm + (needsComma ? ', ' : '') + chordToRecord + '\n\n' + rhythmSection;
              } else {
                return prev ? `${prev}, ${chordToRecord}` : chordToRecord;
              }
            });
            bonusRecordDebounceRef.current = null;
            latestBonusChordNameRef.current = "";
          }, 50);
        }
        return;
      }
      
      // ✅ A7 bonus check MOVED to before vi check (line ~5620)
      // Was here but vi check was matching A7 [9,1,4,7] as vi [9,0,4] subset
      
      if (exactSet([6,9,0,4]) && shouldTriggerBonus("V/V")){ setActiveWithTrail("V/V","F#m7⏺™­5"); return; }
      
      // ✅ v3.17.85 FIX #3: DEFENSIVE - Don't let bonus chords match diatonic
      // If bonus chord present but permission denied, show in hub without lighting wedge
      const isBonusChordPattern = 
        (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && (pcsRel.size === 3 || (pcsRel.has(9) && pcsRel.size === 4))) || // Bdim/Bm7b5
        (pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10) && pcsRel.size === 4) || // C#dim7
        (pcsRel.has(9) && pcsRel.has(1) && pcsRel.has(4) && (pcsRel.size === 3 || (pcsRel.has(7) && pcsRel.size === 4))); // A/A7
        
      if (isBonusChordPattern && !shouldShowBonusOverlay()) {
        console.log('ðŸ›¡ï¸ DEFENSIVE: Bonus chord detected but permission denied - showing in hub only');
        centerOnly(displayName);
        return;
      }
      
   // ✅ FIX: Fmaj7 early detection to prevent Am7 subset match
      // Bug: Fmaj7 [5,9,0,4] contains Am [9,0,4] as subset
      // If Am7 is checked first in diatonic tables, it incorrectly matches vi
      // Solution: Check Fmaj7 explicitly before diatonic matching
      // ✅ FIX #2: Only in HOME - in SUB, Fmaj7 is I not IV
      if (!subdomActiveRef.current && exactSet([5,9,0,4])) {
        console.log('✅ EARLY Fmaj7 CHECK: [5,9,0,4] ⏺†’ IV wedge (HOME only)');
        setActiveWithTrail("IV", displayName || "Fmaj7");
        return;
      }
      
      const m7 = firstMatch(homeDiatonic.req7, pcsRel); 
      if(m7){ 
    // ✅ DEBUG: Why is Cmaj7 matching iii?
        if (absName === "Cmaj7") {
          console.log('ðŸ” Cmaj7 DEBUG:', {
            absName,
            pcsRel: [...pcsRel],
            pcsAbs: [...pcsAbs],
            absHeld: absHeld,
            matchedPattern: m7.s ? [...m7.s] : 'none',
            matchedFn: m7.f,
            matchedName: m7.n,
            bassNote: absHeld.length > 0 ? Math.min(...absHeld) : 'none',
            allPatterns: homeDiatonic.req7.map(p => ({ n: p.n, s: [...p.s], f: p.f }))
          });
        }
        
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7⏺™­5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched m7:', { fn: m7.f, chordName, absName, displayName, hasSeventhQuality, baseKey: baseKeyRef.current });
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7⏺™­5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
      const tri = firstMatch(homeDiatonic.reqt, pcsRel); 
      if(tri){ 
        // ✅ v3.6.2 FIX: Filter out incorrect secondary dominant matches
        // Bug: In Eb, pattern [5,9,0] (Ab = IV) matches as "V/V" instead of "IV"
        // Root cause: homeDiatonic includes V/V and V/vi patterns that overlap with diatonic chords
        // Solution: If it matches V/V or V/vi, verify it's actually a secondary dominant
        
        let functionToUse = tri.f;
        
        // Check if this is a false V/V or V/vi match
        if (tri.f === "V/V" || tri.f === "V/vi") {
          // These should only match if they're ACTUALLY secondary dominants
          // In the base key, check if this chord is diatonic
          const rootPc = pcsAbs.values().next().value;
          if (rootPc === undefined) {
            // Safety check - if we can't get the root, use the match as-is
            functionToUse = tri.f;
          } else {
            const relativeToBase = (rootPc - NAME_TO_PC[baseKeyRef.current] + 12) % 12;
            
            // Check if this is actually a diatonic chord in the base key
            // IV in any key has relative degree 5 (5 semitones from tonic)
            // V in any key has relative degree 7 (7 semitones from tonic)
            if (relativeToBase === 5) {
              // This is IV, not V/V!
              functionToUse = "IV";
              console.log('ðŸ”§ Corrected V/V ⏺†’ IV (diatonic subdominant)');
            } else if (relativeToBase === 7) {
              // This is V, not V/vi!
              functionToUse = "V7";
              console.log('ðŸ”§ Corrected V/vi ⏺†’ V7 (diatonic dominant)');
            }
          }
        }
        
        // v3.5.0: Use absName from theory.ts instead of realizeFunction
        // This prevents G triad from being labeled "G7" just because it triggers V7 function
        const chordName = absName || realizeFunction(functionToUse as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched tri:', { 
          fn: tri.f,
          correctedFn: functionToUse,
          chordName, 
          absName,
          usingAbsName: !!absName,
          baseKey: baseKeyRef.current, 
          pcsRel: [...pcsRel],
          triPattern: tri.s ? [...tri.s] : 'none'
        });
        console.log('ðŸŽ¯ WEDGE ACTIVATION:', functionToUse, '⏺†’', chordName, 'in key', baseKeyRef.current);
        setActiveWithTrail(functionToUse as Fn, chordName); 
        return; 
      }
      
      // ✅ v3.6.3 DEBUG: Log why no match was found
      console.log('⏺Œ NO TRI MATCH FOUND:', {
        pcsRel: [...pcsRel],
        absName,
        baseKey: baseKeyRef.current,
        availablePatterns: homeDiatonic.reqt.map(p => ({
          f: p.f,
          pattern: [...p.s]
        }))
      });
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
        // ✅ v3.6.7 FIX: Use dimRootName for proper sharp spelling (G#dim not Abdim)
        // Import dimRootName logic: Bb(10), Eb(3), C#(1), else use sharps
        const dimName = (pc: number) => 
          pc===10 ? "Bb" : (pc===3 ? "Eb" : (pc===1 ? "C#" : 
          ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][pc]));
        const label=has7?`${dimName(rootPc)}dim7`:`${dimName(rootPc)}dim`;
        const mapped = visitorActiveRef.current ? (mapDim7_EbVisitor(pcsRel) || mapDimRootToFn_ByBottom(rootPc)) : mapDimRootToFn_ByBottom(rootPc);
        if(mapped){ setActiveWithTrail(mapped, label); return; }
        centerOnly(label); return;
      }
    }

    const triDisp = detectDisplayTriadLabel(pcsRel, baseKeyRef.current, absHeld);
    console.log('[DETECT] Fallback:', { triDisp, absName, displayName, result: triDisp || displayName });
    // ✅ Clear wedge for unmapped chords
    setActiveFn("");
    centerOnly(triDisp || displayName);
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
    // ✅ Single note shortcut - if only one note held, go to that major key
    // This allows quick transposition without playing a full chord
    const heldNotes = Array.from(rightHeld.current);
    
    if (heldNotes.length === 1) {
      // Single note - use it as the root of a major key
      const midiNote = heldNotes[0];
      const pc = pcFromMidi(midiNote);
      const rootName = FLAT_NAMES[pc] as KeyName;
      
      console.log('ðŸ”‘ Make My Key (single note):', rootName, '- Quick major key transposition');
      
      if (FLAT_NAMES.includes(rootName)) {
        setBaseKey(rootName);
        setTimeout(() => {
          goHome();
          console.log('ðŸ”‘ Transposed to', rootName, 'major');
        }, 50);
      }
      return;
    }
    
    // Multi-note: Original chord-based logic
    // Simple rule: Make the root of the chord the new key center
    // UNLESS it's a minor chord, then use relative major + REL mode
    
    // CRITICAL: Use lastDetectedChordRef (from theory.ts) instead of lastPlayedChordRef
    // lastPlayedChordRef can be polluted by preview/latch/space-switching
    // lastDetectedChordRef contains the pure MIDI detection result
    const chordToUse = lastDetectedChordRef.current;
    if (!chordToUse) return;
    
    // Parse chord name to get root
    const match = chordToUse.match(/^([A-G][b#]?)(m|min|maj|M)?/);
    if (!match) return;
    
    const rootName = match[1] as KeyName;
    const quality = match[2] || "";
    const isMinor = quality.startsWith("m") && !quality.startsWith("maj");
    
    console.log('ðŸ”‘ Make My Key:', chordToUse, '(from theory.ts) ⏺†’ root:', rootName, 'isMinor:', isMinor, 'currentLabel:', centerLabel);
    
    if (isMinor) {
      // Minor chord - go to relative major and activate REL
      const rootPc = NAME_TO_PC[rootName];
      if (rootPc === undefined) return;
      
      // Calculate relative major PC
      const relativeMajorPc = (rootPc + 3) % 12; // Minor 3rd up
      
      // Get the key name directly from FLAT_NAMES (prefer flats for key centers)
      const relativeMajorKey = FLAT_NAMES[relativeMajorPc] as KeyName;
      
      console.log('ðŸ”‘ Minor:', rootName, '(pc:', rootPc, ') ⏺†’ relative major:', relativeMajorKey, '(pc:', relativeMajorPc, '), current baseKey:', baseKeyRef.current);
      
      // Check if we're already in the correct relative major
      if (baseKeyRef.current === relativeMajorKey) {
        console.log('ðŸ”‘ Already in correct key, just activating REL');
        // Just activate REL mode, don't change base key
        if (!relMinorActiveRef.current) {
          toggleRelMinor();
        }
      } else {
        // Need to change base key
        if (FLAT_NAMES.includes(relativeMajorKey)) {
          console.log('ðŸ”‘ Changing base key from', baseKeyRef.current, 'to', relativeMajorKey);
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
      console.log('ðŸ”‘ Major ⏺†’ new key:', rootName);
      if (FLAT_NAMES.includes(rootName)) {
        setBaseKey(rootName);
        // Force immediate state update
        setTimeout(() => {
          goHome();
          console.log('ðŸ”‘ Called goHome, should be in', rootName, 'now');
        }, 50);
      }
    }
  };
  
  const toggleVisitor = ()=>{
    if (spaceLocked) return; // ✅ Locked
    const on = !visitorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && relMinorActiveRef.current) setRelMinorActive(false);
    setVisitorActive(on);
    if(on){ setActiveFn("I"); setCenterLabel(parKey); stopDimFade(); }
  };
  const toggleRelMinor = ()=>{
    if (spaceLocked) return; // ✅ Locked
    const on = !relMinorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && visitorActiveRef.current) setVisitorActive(false);
    setRelMinorActive(on);
    if(on){ 
      setActiveFn("vi"); 
      // ✅ Use realizeFunction to get correct relative minor for current key
      const relMinorChord = realizeFunction("vi", baseKeyRef.current);
      setCenterLabel(relMinorChord); 
      stopDimFade(); 
    }
  };
  const toggleSubdom = ()=>{
    if (spaceLocked) return; // ✅ Locked
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

  const wrapperStyle: React.CSSProperties = ((visitorActive || relMinorActive) && false)
    ? { filter:"invert(1) hue-rotate(180deg)" } : {};

  const fnFillColor = (fn: Fn) =>
    (relMinorActive && fn === "V/V") ? FN_COLORS["IV"] : FN_COLORS[fn];

  const fnDisplay = (fn: Fn): string => fn; // v3.5.0: Display function as-is (V/vi shows as V/vi)

  const [dimFadeTick, setDimFadeTick] = useState(0);
  const [dimFadeOn, setDimFadeOn] = useState(false);
  const dimFadeRafRef = useRef<number | null>(null);

  /* ---------- label key + center text style ---------- */
  // v3.5.0: Use effectiveBaseKey for transpose support
  const labelKey = (visitorActive ? parKey : (subdomActive ? subKey : effectiveBaseKey)) as KeyName;
  
  // Debug: Log wedge label key
  useEffect(() => {
    console.log('ðŸ·ï¸ WEDGE LABEL KEY:', {
      labelKey,
      effectiveBaseKey,
      baseKey,
      visitor: visitorActive,
      subdom: subdomActive
    });
  }, [labelKey, effectiveBaseKey, baseKey, visitorActive, subdomActive]);
  
  const centerTextStyle: React.CSSProperties = {
    fontFamily: CENTER_FONT_FAMILY, paintOrder: "stroke", stroke: "#000", strokeWidth: 1.2 as any
  };

  /* ---------- glow layer (organic misty effect) ---------- */
  const glowLayer = useMemo(() => {
    if (!wedgeGlow) return null;
    
    const color = wedgeGlow.is7th ? "#FF1493" : "#00CED1";
    const number = wedgeGlow.is7th ? "4" : "3";
    
    // Position number at 30 degrees (roughly 1 o'clock position)
    const angle = 30 * (Math.PI / 180);
    const labelRadius = 14;
    const labelX = wedgeGlow.x + Math.cos(angle) * labelRadius;
    const labelY = wedgeGlow.y - Math.sin(angle) * labelRadius;
    
    return (
      <g key="click-glow">
        {/* Define radial gradient from colored center fading to transparent */}
        <defs>
          <radialGradient id="clickGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="60%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Circle with gradient - fades to transparent */}
        <circle 
          cx={wedgeGlow.x} 
          cy={wedgeGlow.y} 
          r={22}
          fill="url(#clickGlow)"
        />
        
        {/* Number at 30Â° (1 o'clock) - clear of cursor */}
        <text
          x={labelX}
          y={labelY + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="white"
          style={{
            pointerEvents: 'none',
            paintOrder: 'stroke',
            stroke: '#000',
            strokeWidth: 2
          } as any}
        >
          {number}
        </text>
      </g>
    );
  }, [wedgeGlow]);

  /* ---------- wedges ---------- */
  const wedgeNodes = useMemo(()=>{
    // v3.5.0: Use effectiveBaseKey for transpose support
    const renderKey:KeyName = visitorActive ? parKey : effectiveBaseKey;
    // console.log('ðŸŽ¨ RENDERING WEDGES with key:', renderKey);
    const dimK = Math.min(1, Math.max(0, dimFadeTick / DIM_FADE_MS));
    const fadedBase = 0.5 + 0.5 * dimK; // 0.5⏺†’1.0
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
           style={{
             touchAction: 'none', 
             cursor: 'pointer', 
             pointerEvents: 'auto'  // ⏺š ï¸ CRITICAL: Must be 'auto' when parent SVG has pointerEvents:'none'
           }}
           onPointerDown={(e)=>{
             // ✅ Touch support - pointer events work for mouse + touch
             e.preventDefault(); // Prevent default touch behaviors
             
             // ✅ Click-to-clear with timer - only clear if clicking same wedge after delay
             const now = Date.now();
             const timeSinceLastClick = now - lastWedgeClickTimeRef.current;
             const sameWedge = wedgeClickFnRef.current === fn;
             
             if (isActive && sameWedge && timeSinceLastClick > 10000) {
               // Long delay (10s+) between clicks on same active wedge = clear it
               console.log('ðŸ”“ Unlatching active wedge (10s+ since last click):', fn);
               setActiveFn("");
               setCenterLabel("");
               setLatchedAbsNotes([]);
               lastInputWasPreviewRef.current = false;
               lastWedgeClickTimeRef.current = 0;
               wedgeClickFnRef.current = "";
               return;
             }
             
             // Track this click for next time
             lastWedgeClickTimeRef.current = now;
             wedgeClickFnRef.current = fn;
             
             // ✅ Visual pulse feedback
             setPulsingWedge(fn);
             setTimeout(() => setPulsingWedge(""), 300);
             
             // Quick clicks or different wedge = play normally
             wedgeHeldRef.current = true; // Mark wedge as held
             currentHeldFnRef.current = fn; // Remember which function
             
             // Calculate click position relative to wheel center
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) { previewFn(fn); return; }
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const ctm = svg.getScreenCTM();
             
             // Safari/zoom debugging
             console.log('ðŸ” CTM:', {
               ctm: ctm ? 'exists' : 'null',
               a: ctm?.a,
               d: ctm?.d,
               clientX: e.clientX,
               clientY: e.clientY
             });
             
             if (!ctm) {
               console.warn('⏺š ï¸ getScreenCTM() returned null, using fallback');
               previewFn(fn, true); // Default to 7th if transform fails
               return;
             }
             
             const svgP = pt.matrixTransform(ctm.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r; // 0 = center, 1 = outer edge
             
             // Inner zone (< threshold) = play with 7th
             // Outer zone (>= threshold) = play triad only
             const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
             lastPlayedWith7thRef.current = playWith7th; // Remember what we played
             
             console.log('ðŸ–±ï¸ Click coords:', {
               svgX: svgP.x.toFixed(1),
               svgY: svgP.y.toFixed(1),
               dx: dx.toFixed(1),
               dy: dy.toFixed(1),
               clickRadius: clickRadius.toFixed(1),
               wheelRadius: r,
               normalizedRadius: normalizedRadius.toFixed(2),
               threshold: SEVENTH_RADIUS_THRESHOLD,
               playWith7th
             });
             
             // ✅ Show subtle glow at click point
             setWedgeGlow({ x: svgP.x, y: svgP.y, is7th: playWith7th });
             setTimeout(() => {
               setWedgeGlow(null);
             }, 400);
             
             previewFn(fn, playWith7th);
           }}
           onPointerEnter={(e)=>{
             // ✅ Pointer events for touch + mouse
             // If dragging from another wedge, activate this wedge
             console.log('ðŸ” onPointerEnter:', fn, 'buttons:', e.buttons, 'wedgeHeld:', wedgeHeldRef.current, 'currentFn:', currentHeldFnRef.current);
             
             if (e.buttons === 1 && wedgeHeldRef.current && currentHeldFnRef.current !== fn) {
               console.log('ðŸŽ¯ Dragged to new wedge:', fn, 'from:', currentHeldFnRef.current);
               
               // Stop previous chord with quick fade
               const ctx = audioContextRef.current;
               if (ctx) {
                 const now = ctx.currentTime;
                 console.log('ðŸ”‡ Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
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
               const ctm = svg.getScreenCTM();
               if (!ctm) {
                 console.warn('⏺š ï¸ CTM null in onMouseEnter');
                 previewFn(fn, true);
                 return;
               }
               const svgP = pt.matrixTransform(ctm.inverse());
               
               const dx = svgP.x - cx;
               const dy = svgP.y - cy;
               const clickRadius = Math.sqrt(dx*dx + dy*dy);
               const normalizedRadius = clickRadius / r;
               
               const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
               lastPlayedWith7thRef.current = playWith7th;
               
               // ✅ Show glow when dragging between wedges too
               setWedgeGlow({ x: svgP.x, y: svgP.y, is7th: playWith7th });
               setTimeout(() => {
                 setWedgeGlow(null);
               }, 400);
               
               console.log('🎵 Playing new chord:', fn, 'with7th:', playWith7th);
               // Play new chord
               previewFn(fn, playWith7th);
             }
           }}
           onPointerMove={(e)=>{
             e.preventDefault(); // Prevent text selection

             // Only process if wedge is being held AND pointer button is down
             if (!wedgeHeldRef.current || currentHeldFnRef.current !== fn || e.buttons !== 1) return;
             
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) return;
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const ctm = svg.getScreenCTM();
             if (!ctm) {
               console.warn('⏺š ï¸ CTM null in onMouseMove');
               return;
             }
             const svgP = pt.matrixTransform(ctm.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r;

             const shouldHave7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;

             console.log('🖱️ onPointerMove:', {fn, normalizedRadius, shouldHave7th, lastPlayedWith7th: lastPlayedWith7thRef.current});

             // If 7th state changed, update hub label and audio
             if (shouldHave7th !== lastPlayedWith7thRef.current) {
               console.log('🎵 Drag changed 7th (hub update):', shouldHave7th);
               lastPlayedWith7thRef.current = shouldHave7th;
               
               // Update hub label
               const renderKey = visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current);
               const chordName = realizeFunction(fn, renderKey);
               
               if (!chordName) return; // Safety check
               
               // Add or remove appropriate 7th extension
               let updatedLabel = chordName;
               if (shouldHave7th) {
                 if (!chordName.includes('7')) {
                   // Check if it's a major or dominant chord
                   // I, IV = maj7, V7 = 7, ii, iii, vi = m7
                   if (fn === "I" || fn === "IV") {
                     updatedLabel = chordName + 'maj7';
                     setCenterLabel(updatedLabel);
                   } else if (fn === "V7") {
                     // V7 already has 7 in the function name, but chord might show as "G"
                     updatedLabel = chordName.includes('7') ? chordName : chordName + '7';
                     setCenterLabel(updatedLabel);
                   } else if (fn === "ii" || fn === "iii" || fn === "vi" || fn === "iv") {
                     // Minor chords - check if already has 'm' to avoid "Amm7"
                     if (chordName.includes('m')) {
                       updatedLabel = chordName + '7'; // Already has 'm', just add '7'
                       setCenterLabel(updatedLabel);
                     } else {
                       updatedLabel = chordName + 'm7';
                       setCenterLabel(updatedLabel);
                     }
                   } else {
                     updatedLabel = chordName + '7';
                     setCenterLabel(updatedLabel);
                   }
                 }
               } else {
                 updatedLabel = chordName.replace(/maj7|m7|7/g, '');
                 setCenterLabel(updatedLabel);
               }
               
               // Update lastPlayedChordRef for MMK consistency
               lastPlayedChordRef.current = updatedLabel;
               
               // ✅ Update keyboard display to match triad/7th
               const chordDef = CHORD_DEFINITIONS[fn];
               let fitted: number[] | undefined;

               if (chordDef) {
                 const keyPc = NAME_TO_PC[renderKey];
                 const transposedTriad = chordDef.triad.map(pc => (pc + keyPc) % 12);

                 let pcs: number[];
                 if (shouldHave7th && chordDef.seventh !== undefined) {
                   const transposedSeventh = (chordDef.seventh + keyPc) % 12;
                   pcs = [...transposedTriad, transposedSeventh];
                 } else {
                   pcs = transposedTriad;
                 }

                 const rootPc = pcs[0];
                 const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
                 fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
                 setLatchedAbsNotes(fitted);
               }

               // ✅ Update rightHeld and re-run detection when 7th state changes
               // This ensures the engine sees the updated chord (triad ↔ 7th)
               const chordDef2 = CHORD_DEFINITIONS[fn];

               if (chordDef2 && chordDef2.seventh !== undefined && fitted) {
                 const keyPc = NAME_TO_PC[renderKey];
                 const seventhPc = (chordDef2.seventh + keyPc) % 12;

                 // Update rightHeld to match current chord state (from fitted notes calculated above)
                 console.log('🎵 Drag 7th change: updating rightHeld with', fitted);
                 rightHeld.current = new Set(fitted);

                 // Re-run detection with updated notes
                 detectV4();

                 // Handle audio playback
                 if (audioEnabledRef.current) {
                   // Special case: For minor tonic chords (vi, iv in minor contexts),
                   // use root doubling instead of 7th for better harmonic minor sound
                   const isMinorTonic = (relMinorActiveRef.current && fn === "vi") ||
                                        (relMinorActiveRef.current && fn === "iv");

                   if (shouldHave7th) {
                     // Add the 4th note
                     let fourthNoteMidi;

                     if (isMinorTonic) {
                       // Use root note an octave down
                       const rootPc = chordDef2.triad[0];
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

                     console.log('⏺ž• Adding 4th note:', fourthNoteMidi);
                     const noteId = playNote(fourthNoteMidi, 0.6, true);
                     if (noteId) {
                       activeChordNoteIdsRef.current.add(noteId);
                     }
                   } else {
                     // Remove the 4th note without re-triggering the triad
                     console.log('🎵 Removing 4th note (stopping 7th only)');

                     // Find the 7th note in active chord notes and stop it
                     const ctx = audioContextRef.current;
                     if (ctx) {
                       const now = ctx.currentTime;

                       // Find and stop the 7th note
                       activeChordNoteIdsRef.current.forEach(noteId => {
                         const nodes = activeNotesRef.current.get(noteId);
                         if (nodes) {
                           // Check if this note is the 7th
                           const noteMidi = parseInt(noteId.split('-')[0]);
                           if ((noteMidi % 12) === seventhPc) {
                             console.log('🎵 Stopping 7th note:', noteMidi, 'PC:', seventhPc);
                             nodes.gain.gain.cancelScheduledValues(now);
                             nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                             nodes.gain.gain.linearRampToValueAtTime(0, now + 0.05); // Quick 50ms fade
                             setTimeout(() => {
                               stopNoteById(noteId);
                               activeChordNoteIdsRef.current.delete(noteId);
                             }, 100);
                           }
                         }
                       });
                     }
                   }
                 }
               }
             }
           }}
           onPointerUp={()=>{
             // ✅ Touch support
             console.log('ðŸ›‘ Pointer up on wedge, releasing');
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
           onPointerLeave={(e)=>{
             // ✅ Touch support
             // If pointer button is still down, we're dragging - don't clear refs!
             if (e.buttons === 1) {
               console.log('ðŸ”„ Pointer button still down, keeping drag state');
               return;
             }
             
             // Pointer button released - actually leaving
             console.log('ðŸ‘‹ Pointer left wedge and button released');
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
           }}>
          <path d={path} fill={fnFillColor(fn)} opacity={fillOpacity} stroke="#ffffff" strokeWidth={2}/>
          {isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={5} opacity={1} />}
          {isTrailing && !isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={ringTrailWidth} opacity={ringTrailOpacity} />}
          {pulsingWedge === fn && <path d={path} fill="none" stroke="#FFFFFF" strokeWidth={8} opacity={0.8} style={{animation: 'pulse 0.3s ease-out'}} />}
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
  },[layout, activeFn, trailFn, trailTick, trailOn, effectiveBaseKey, visitorActive, relMinorActive, subdomActive, labelKey, dimFadeOn, dimFadeTick, skillLevel, pulsingWedge]);

  const activeBtnStyle = (on:boolean, spaceColor?:string): React.CSSProperties =>
    ({padding:"6px 10px", border:`2px solid ${on ? (spaceColor || "#39FF14") : "#374151"}`, borderRadius:8, background:"#111", color:"#fff", cursor:"pointer"});

  /* ---------- Preview helper ---------- */
  const KBD_LOW=48, KBD_HIGH=71;
  
  // Configuration for radial click zones
  const SEVENTH_RADIUS_THRESHOLD = 0.75; // Inner 75% = 7th chords, outer 25% = triads (v3.5.0: increased for easier clicking)
  
  // Complete chord definitions for C major metaspace
  // Format: [root_pc, third_pc, fifth_pc, seventh_pc (optional)]
  const CHORD_DEFINITIONS: Record<Fn, {triad: number[], seventh?: number}> = {
    "I":     {triad: [0, 4, 7],   seventh: 11},  // C-E-G (B)  = Cmaj7
    "ii":    {triad: [2, 5, 9],   seventh: 0},   // D-F-A (C)  = Dm7
    "iii":   {triad: [4, 7, 11],  seventh: 2},   // E-G-B (D)  = Em7
    "IV":    {triad: [5, 9, 0],   seventh: 4},   // F-A-C (E)  = Fmaj7
    "iv":    {triad: [5, 8, 0],   seventh: 3},   // F-Ab-C (Eb) = Fm7
    "V":     {triad: [7, 11, 2]},                // G-B-D (no 7th) = G major triad
    "V7":    {triad: [7, 11, 2],  seventh: 5},   // G-B-D (F)  = G7
    "vi":    {triad: [9, 0, 4],   seventh: 7},   // A-C-E (G)  = Am7
    "♭VII":  {triad: [10, 2, 5]},                // Bb-D-F (no 7th)
    "V/V":   {triad: [2, 6, 9],   seventh: 0},   // D-F#-A (C) = D7
    "V/vi":  {triad: [4, 8, 11],  seventh: 2},   // E-G#-B (D) = E7
    "V/ii":  {triad: [9, 1, 4],   seventh: 7},   // A-C#-E (G) = A7
    "ii/vi": {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bm7b5
    "vii°":  {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bdim
  };
  
  // Bonus wedge definitions
  const BONUS_CHORD_DEFINITIONS: Record<string, {triad: number[], seventh?: number}> = {
    "A7":    {triad: [9, 1, 4],   seventh: 7},   // A-C#-E (G) = A7 (V/ii)
    "Bm7♭5": {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bm7b5 (ii/vi, aka viiÂ°)
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
      console.warn('⏺š ï¸ Function not in chord table, using fallback:', fn);
      pcs = preview.chordPcsForFn(fn, renderKey, with7th);
    }
    
    const rootPc = pcs[0];
    const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
    const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
    setLatchedAbsNotes(fitted);
    latchedAbsNotesRef.current = fitted; // ✅ v4.1.0: Update ref synchronously for performance pad keys

    // ✅ Feed wedge notes to engine for detection
    console.log('🎵 previewFn: updating rightHeld and calling detectV4 with notes:', fitted);
    rightHeld.current = new Set(fitted);
    detectV4(); // Re-run detection with wedge notes

    // ✅ Update label based on ACTUAL notes played
    let chordLabel = realizeFunction(fn, renderKey);

    // Only add 7th suffix if we're actually playing with 7th
    if (with7th && chordDef && chordDef.seventh !== undefined) {
      // Add 7th suffix based on chord quality
      if (fn === "I" || fn === "IV") {
        chordLabel += "maj7";
      } else if (fn === "V7") {
        // V7 always shows as V7 (name already has it)
      } else if (fn === "V/V" || fn === "V/vi" || fn === "V/ii") {
        // Secondary dominants: show "D7" when with7th, "D" when triad
        if (!chordLabel.endsWith("7")) {
          chordLabel += "7";
        }
      } else if (fn === "ii" || fn === "iii" || fn === "vi" || fn === "iv") {
        chordLabel += "7";
      } else if (fn === "♭VII") {
        chordLabel += "7";
      }
    } else if (fn === "V7") {
      // Special case: V7 played as triad should show as "G" not "G7"
      chordLabel = chordLabel.replace("7", "");
    }

    setActiveWithTrail(fn, chordLabel);

    if (audioEnabledRef.current) {
      playChordWithVoiceLeading(pcs);
    }
    
    // Check if this wedge click should trigger a space rotation (with 600ms delay)
    console.log('ðŸ” previewFn called. fn:', fn, 'Space:', {
      sub: subdomActiveRef.current,
      rel: relMinorActiveRef.current, 
      par: visitorActiveRef.current
    });
    
    setTimeout(() => {
      console.log('ðŸ” setTimeout fired after 600ms. fn:', fn);
      
      // === SUB SPACE EXITS ===
      if (subdomActiveRef.current) {
        // iii (Am in F) ⏺†’ HOME (vi in C)
        if (fn === "iii") {
          console.log('ðŸ”„ iii wedge in SUB ⏺†’ returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 400);
        }
        // I in SUB (F) ⏺†’ HOME (IV in C)
        else if (fn === "I") {
          console.log('ðŸ”„ I wedge in SUB ⏺†’ returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("IV");
            console.log('✨ Highlighted IV wedge');
          }, 400);
        }
        // V7 in SUB (C) ⏺†’ HOME (I in C)
        else if (fn === "V7") {
          console.log('ðŸ”„ V7 wedge in SUB ⏺†’ returning to HOME');
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
        // I in REL (Am) ⏺†’ HOME (vi in C)
        if (fn === "I") {
          console.log('ðŸ”„ I wedge in REL ⏺†’ returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 200);
        }
        // ♭VII in REL (G) ⏺†’ HOME (V7 in C)  
        else if (fn === "♭VII") {
          console.log('ðŸ”„ ♭VII wedge in REL ⏺†’ returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("V7");
            console.log('✨ Highlighted V7 wedge');
          }, 200);
        }
        // iv in REL (Dm) ⏺†’ HOME (ii in C)
        else if (fn === "iv") {
          console.log('ðŸ”„ iv wedge in REL ⏺†’ returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("ii");
            console.log('✨ Highlighted ii wedge');
          }, 200);
        }
      }
      
      // ✅ Removed incorrect PAR exit logic
      // PAR space I wedge (Eb in C minor) should NOT exit to HOME
      // Users stay in PAR unless they play a diatonic HOME chord
      
      // Other space rotation logic can be added here
    }, 600); // 600ms delay so chord doesn't move under cursor
    
    // ✅ Return the notes so caller can start rhythm immediately
    return fitted;
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
      return realizeFunction(activeFnRef.current as Fn, dispKey) || null;
    }
    // Priority 3: Fall back to center label from MIDI/manual play
    return centerLabel || null;
  })();

  /* ---------- Audio Synthesis (Vintage Rhodes) ---------- */
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      // v3.19.55: Add latencyHint for better buffer management on MacBook
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive', // Prioritize low latency
        sampleRate: 44100 // Standard sample rate
      });
    }
    // ✅ Resume audio context on mobile (required by iOS/Android)
    if (audioContextRef.current.state === 'suspended') {
      console.log('ðŸ”Š Audio context suspended, resuming...');
      audioContextRef.current.resume().then(() => {
        console.log('✅ Audio context resumed successfully');
      }).catch(err => {
        console.error('⏺Œ Failed to resume audio context:', err);
      });
    }
    return audioContextRef.current;
  };

  const playNote = (midiNote: number, velocity: number = 0.5, isChordNote: boolean = false) => {
    console.log('🎵 playNote START:', {midiNote, velocity, isChordNote, audioEnabledState: audioEnabled, audioEnabledRef: audioEnabledRef.current});
    
    if (!audioEnabledRef.current) {  // Use ref instead of state!
      console.log('⏺Œ Audio disabled, returning');
      return;
    }
    
    console.log('ðŸ”Š Initializing audio context...');
    const ctx = initAudioContext();
    console.log('ðŸ”Š Context state:', ctx.state, 'Sample rate:', ctx.sampleRate);
    
    if (ctx.state === 'suspended') {
      console.log('⏺š ï¸ Context suspended, attempting resume...');
      ctx.resume();
    }
    
    // Generate unique ID for this note instance (allows same MIDI note multiple times)
    const noteId = `${midiNote}-${Date.now()}-${Math.random()}`;
    console.log('ðŸ†” Generated note ID:', noteId);
    
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = ctx.currentTime;
    console.log('ðŸ“Š Frequency:', freq.toFixed(2), 'Hz, Time:', now.toFixed(3));
    
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
    // v3.19.55: Faster attack (5ms) for more percussive sound, adjusted envelope
    const mobileBoost = !isDesktop ? 2.0 : 1.5;
    const chordSafety = 0.5; // Divide by 2 since chords can have 3-4 notes
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.6 * velocity * chordSafety, now + 0.005); // Faster attack: 5ms
    mainGain.gain.linearRampToValueAtTime(0.45 * velocity * chordSafety, now + 0.08);
    mainGain.gain.linearRampToValueAtTime(0.4 * velocity * chordSafety, now + 0.3);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 12000 + (midiNote * 80); // Bright top end
    filter.Q.value = 0.3; // Slight resonance for presence
    
    // Highpass filter to roll off low end
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200; // Roll off below 200Hz
    highpass.Q.value = 0.7; // Gentle rolloff
    
    // Compressor - v3.19.55: Softer settings to prevent crackling on MacBook
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20; // Higher threshold
    compressor.knee.value = 40; // Softer knee
    compressor.ratio.value = 8; // Less aggressive ratio
    compressor.attack.value = 0.003; // Faster attack to catch peaks
    compressor.release.value = 0.25; // Longer release
    
    // Makeup gain
    const makeupGain = ctx.createGain();
    makeupGain.gain.value = mobileBoost * 1.0;
    
    console.log('ðŸ”— Connecting audio graph...');
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(highpass);
    highpass.connect(mainGain);
    mainGain.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(ctx.destination);
    
    console.log('▶ï¸ Starting oscillators...');
    try {
      osc1.start(now);
      osc2.start(now);
      console.log('✅ Oscillators started successfully!');
    } catch(err) {
      console.error('⏺Œ Error starting oscillators:', err);
      return;
    }
    
    activeNotesRef.current.set(noteId, {osc1, osc2, osc3: osc1, gain: mainGain});
    console.log('ðŸ’¾ Stored note. Active count:', activeNotesRef.current.size);
    
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
        nodes.gain.gain.linearRampToValueAtTime(0, now + 0.5); // Lengthened from 0.05 to 0.5
        
        setTimeout(() => {
          try {
            nodes.osc1.stop();
            nodes.osc2.stop();
            nodes.osc3.stop();
          } catch(e) { /* already stopped */ }
          activeNotesRef.current.delete(noteId);
        }, 550); // Updated timeout to match release
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
  
  const stopAllActiveNotes = () => {
    // Stop all currently playing notes
    const activeNotes = Array.from(activeNotesRef.current.keys());
    activeNotes.forEach(noteId => stopNoteById(noteId));
  };

  const playChord = (midiNotes: number[], duration: number = 1.0) => {
    if (!audioEnabled) return;
    
    // Stop all currently playing notes first for quick cutoff
    stopAllActiveNotes();
    
    // Play new notes
    const noteIds: string[] = [];
    midiNotes.forEach(note => {
      const id = playNote(note, 0.4, true); // Mark as chord note
      if (id) noteIds.push(id);
    });
    
    // Auto-release after duration
    setTimeout(() => {
      noteIds.forEach(id => stopNoteById(id));
    }, duration * 1000);
  };

  // ✅ MIDI Output - Send notes to external device
  const activeMidiNotesRef = useRef<Set<number>>(new Set());
  
  const sendMidiNoteOn = (note: number, velocity: number = 100) => {
    if (!midiOutputEnabled || !midiOutputRef.current) return;
    try {
      // MIDI note on: [0x90 = note on channel 1, note, velocity]
      midiOutputRef.current.send([0x90, note, velocity]);
      activeMidiNotesRef.current.add(note);
      console.log('ðŸ“¤ MIDI OUT: Note ON', note, 'vel', velocity);
    } catch (e) {
      console.error('Failed to send MIDI:', e);
    }
  };
  
  const sendMidiNoteOff = (note: number) => {
    if (!midiOutputEnabled || !midiOutputRef.current) return;
    try {
      // MIDI note off: [0x80 = note off channel 1, note, velocity 0]
      midiOutputRef.current.send([0x80, note, 0]);
      activeMidiNotesRef.current.delete(note);
      console.log('ðŸ“¤ MIDI OUT: Note OFF', note);
    } catch (e) {
      console.error('Failed to send MIDI:', e);
    }
  };
  
  const stopAllMidiNotes = () => {
    activeMidiNotesRef.current.forEach(note => sendMidiNoteOff(note));
    activeMidiNotesRef.current.clear();
  };

  // ✅ Start rhythm loop - plays pattern continuously while held
  // Supports starting from an offset for seamless chord changes
  const startRhythmLoop = (chordNotes: number[], startOffsetMs: number = 0) => {
    console.log('ðŸ” startRhythmLoop called with', chordNotes.length, 'notes, offset:', startOffsetMs, 'ms');
    stopRhythmLoop(); // Clear any existing loop
    
    const getActivePattern = () => {
      const patternNum = activeRhythmPatternRef.current;
      if (patternNum === 1) return rhythmPattern1;
      if (patternNum === 2) return rhythmPattern2;
      return rhythmPattern3;
    };
    
    const pattern = getActivePattern();
    console.log('🎵 Pattern:', pattern.length, 'steps');
    if (pattern.length === 0 || chordNotes.length === 0) return;
    
    // Calculate total pattern duration
    const beatsPerBar = 4;
    const beatDuration = 60 / tempo;
    let totalDuration = 0;
    pattern.forEach((step) => {
      totalDuration += step.duration * beatsPerBar * beatDuration;
    });
    const patternDurationMs = totalDuration * 1000;
    rhythmPatternDurationRef.current = patternDurationMs;
    
    // Normalize offset to be within pattern duration
    const normalizedOffset = startOffsetMs % patternDurationMs;
    
    // Record start time for position tracking
    rhythmStartTimeRef.current = performance.now() - normalizedOffset;
    
    const playOnce = (offsetMs: number = 0) => {
      let currentTime = 0;
      
      pattern.forEach((step) => {
        const stepDurationSeconds = step.duration * beatsPerBar * beatDuration;
        const stepStartMs = currentTime * 1000;
        const stepEndMs = stepStartMs + (stepDurationSeconds * 1000);
        
        // Only schedule if this step overlaps with our playback window
        if (stepEndMs > offsetMs) {
          const delayMs = Math.max(0, stepStartMs - offsetMs);
          
          const timeoutId = window.setTimeout(() => {
            if (step.action === 'play') {
              playChord(chordNotes, stepDurationSeconds * 0.8);
            }
          }, delayMs);
          
          rhythmLoopTimeoutsRef.current.push(timeoutId);
        }
        
        currentTime += stepDurationSeconds;
      });
    };
    
    // Play first iteration with offset
    playOnce(normalizedOffset);
    
    // Schedule remaining time until next loop starts
    const timeUntilNextLoop = patternDurationMs - normalizedOffset;
    
    const startLoopId = window.setTimeout(() => {
      // Update start time for the loop
      rhythmStartTimeRef.current = performance.now();
      
      // Start regular looping from beginning
      rhythmLoopIntervalRef.current = window.setInterval(() => {
        playOnce(0);
      }, patternDurationMs);
      
      // Play the first full loop immediately
      playOnce(0);
    }, timeUntilNextLoop);
    
    rhythmLoopTimeoutsRef.current.push(startLoopId);
  };
  
  const stopRhythmLoop = () => {
    // Clear interval
    if (rhythmLoopIntervalRef.current !== null) {
      clearInterval(rhythmLoopIntervalRef.current);
      rhythmLoopIntervalRef.current = null;
    }
    // Clear all pending timeouts
    rhythmLoopTimeoutsRef.current.forEach(id => clearTimeout(id));
    rhythmLoopTimeoutsRef.current = [];
    
    // ✅ Stop all currently playing notes to prevent overlap
    stopAllActiveNotes();
    
    // ✅ DON'T clear position tracking - keep it for seamless restart!
    // rhythmStartTimeRef.current stays set so next press can calculate offset
  };

  // ✅ Play rhythm pattern with current latched chord (single shot)
  const playRhythmPattern = (pattern: RhythmAction[], chordNotes: number[]) => {
    if (pattern.length === 0 || chordNotes.length === 0) return;
    
    console.log('🎵 Playing rhythm pattern:', pattern, 'with chord:', chordNotes);
    
    let currentTime = 0;
    const beatsPerBar = 4;
    const beatDuration = 60 / tempo; // seconds per beat
    
    pattern.forEach((step, index) => {
      const stepDurationSeconds = step.duration * beatsPerBar * beatDuration;
      
      setTimeout(() => {
        if (step.action === 'play') {
          // Play the chord
          playChord(chordNotes, stepDurationSeconds * 0.8);
        } else if (step.action === 'rest') {
          // Silence - do nothing
        } else if (step.action === 'hold') {
          // Hold - chord should still be ringing from previous play
          // Could add sustain logic here if needed
        }
      }, currentTime * 1000); // Convert to milliseconds
      
      currentTime += stepDurationSeconds;
    });
  };

  // ✅ Song sharing via URL
  const encodeSongToURL = () => {
    const songData = {
      text: inputText,
      key: baseKey,
      title: songTitle || "Shared Song"
    };
    const json = JSON.stringify(songData);
    const base64 = btoa(unescape(encodeURIComponent(json)));

    // ✅ Check if running in iframe - if so, use beatkitchen.io
    let targetOrigin = window.location.origin;
    let targetPath = window.location.pathname.replace(/\/$/, '');

    // Detect if we're in an iframe
    const isInIframe = window.parent && window.parent !== window;

    if (isInIframe) {
      // We're in an iframe - use beatkitchen.io URL
      targetOrigin = 'https://beatkitchen.io';
      targetPath = '/harmony';
      console.log('📤 Detected iframe - using beatkitchen.io URL');
    } else {
      console.log('📤 Not in iframe - using current URL:', targetOrigin + targetPath);
    }

    const url = `${targetOrigin}${targetPath}?song=${base64}`;
    console.log('📤 Generated share URL:', url.substring(0, 100) + '...');
    return url;
  };

  const decodeSongFromURL = (base64: string) => {
    try {
      // Clean the base64 string - remove any leading/trailing whitespace or characters
      const cleanBase64 = base64.trim().replace(/[^A-Za-z0-9+/=]/g, '');
      
      const json = decodeURIComponent(escape(atob(cleanBase64)));
      console.log('ðŸ” Decoded JSON:', json);
      
      const songData = JSON.parse(json);
      console.log('ðŸ” Parsed songData:', songData);
      
      // Validate it's an object with text property
      if (typeof songData !== 'object' || !songData.text) {
        console.error('Invalid song data format');
        return null;
      }
      
      return songData;
    } catch (e) {
      console.error('Failed to decode song:', e);
      return null;
    }
  };

  const handleShareSong = () => {
    const url = encodeSongToURL();
    console.log('ðŸ“¤ Attempting to copy URL:', url);
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          console.log('✅ Copied via navigator.clipboard');
          setShareURL(url);
          setShowShareCopied(true);
          setTimeout(() => setShowShareCopied(false), 3000);
        })
        .catch((err) => {
          console.error('⏺Œ Clipboard API failed:', err);
          // Fallback: try execCommand
          fallbackCopyToClipboard(url);
        });
    } else {
      // Fallback for older browsers
      console.log('⏺š ï¸ navigator.clipboard not available, using fallback');
      fallbackCopyToClipboard(url);
    }
  };
  
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      console.log(successful ? '✅ Copied via execCommand' : '⏺Œ execCommand failed');
      if (successful) {
        setShareURL(text);
        setShowShareCopied(true);
        setTimeout(() => setShowShareCopied(false), 3000);
      }
    } catch (err) {
      console.error('⏺Œ Fallback copy failed:', err);
      alert('Could not copy to clipboard. Please copy this URL manually:\n\n' + text);
    }
    
    document.body.removeChild(textArea);
  };

  const playChordWithVoiceLeading = (chordPitchClasses: number[]) => {
    if (!audioEnabledRef.current && !midiOutputEnabled) return;  // Skip if both disabled
    
    console.log('ðŸŽ¼ Playing chord. PCs:', chordPitchClasses);
    
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
    
    // ✅ Send to MIDI output if enabled
    if (midiOutputEnabled) {
      stopAllMidiNotes(); // Stop previous chord
      notesToPlay.forEach(note => sendMidiNoteOn(note, 100));
    }
    
    // Internal audio playback
    if (audioEnabledRef.current) {
      const ctx = audioContextRef.current;
      if (ctx) {
        const now = ctx.currentTime;
        const FAST_FADE = 0.1;
        
        // Stop ALL previous chord notes
        console.log('ðŸ”‡ Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
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
        console.log('ðŸ”Š Playing', notesToPlay.length, 'notes');
        notesToPlay.forEach(note => {
          const noteId = playNote(note, 0.6, true);
          if (noteId) {
            activeChordNoteIdsRef.current.add(noteId);
          }
        });
      }
    }
    
    previousVoicingRef.current = notesToPlay;
  };

  // Calculate notes to highlight on keyboard for current chord
  const keyboardHighlightNotes = (() => {
    // Priority 1: If from preview/playlist, show yellow highlights
    if (latchedAbsNotes.length > 0 && lastInputWasPreviewRef.current) {
      // ✅ v4.1.2: Filter to visible keyboard range AND deduplicate by pitch class
      // Prevents showing 2 octaves when transposed notes wrap around
      const filtered = latchedAbsNotes.filter(note => note >= KBD_LOW && note <= KBD_HIGH);

      // Remove pitch class duplicates - keep only the lowest octave of each pitch class
      const uniqueByPitchClass = new Map<number, number>();
      for (const note of filtered) {
        const pc = note % 12;
        if (!uniqueByPitchClass.has(pc) || note < uniqueByPitchClass.get(pc)!) {
          uniqueByPitchClass.set(pc, note);
        }
      }
      const deduplicated = Array.from(uniqueByPitchClass.values());

      console.log('🎹 HIGHLIGHT: latchedAbsNotes:', latchedAbsNotes, 'filtered:', filtered, 'deduplicated:', deduplicated);
      return new Set(deduplicated);
    }
    // Priority 2: If active function but no manual play, AND in preview mode, calculate root position
    // ✅ Only show canonical voicing for wedge clicks, not MIDI input
    if (activeFnRef.current && rightHeld.current.size === 0 && lastInputWasPreviewRef.current) {
      const dispKey = (visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current)) as KeyName;
      const fn = activeFnRef.current as Fn;
      const with7th = PREVIEW_USE_SEVENTHS || fn === "V7" || fn === "V/V" || fn === "V/vi";
      const pcs = preview.chordPcsForFn(fn, dispKey, with7th);
      
      // ✅ Safety check - if preview module doesn't know this chord, use CHORD_DEFINITIONS
      if (!pcs || pcs.length === 0) {
        const chordDef = CHORD_DEFINITIONS[fn];
        if (chordDef) {
          const keyPc = NAME_TO_PC[dispKey];
          // ✅ v4.1.2: Use 7th chord if available and with7th is true
          let transposedPcs = chordDef.triad.map(pc => (pc + keyPc) % 12);
          if (with7th && chordDef.seventh !== undefined) {
            transposedPcs = [...transposedPcs, (chordDef.seventh + keyPc) % 12];
          }
          const rootPc = transposedPcs[0];
          const absRootPos = preview.absChordRootPositionFromPcs(transposedPcs, rootPc);
          const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
          return new Set(fitted);
        }
        return new Set<number>(); // Fallback if chord unknown
      }
      
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      return new Set(fitted);
    }
    // Don't show yellow highlights for manual MIDI play - only blue (disp) handles that
    return new Set<number>();
  })();

  return (
    <div style={{
      background:'#111', 
      color:'#fff', 
      height: isDesktop ? '100vh' : (isSafariBrowser ? '100vh' : 'auto'),
      minHeight: '100vh',
      maxHeight: isDesktop ? '100vh' : (isSafariBrowser ? '100vh' : 'none'),
      overflow: isSafariBrowser ? 'auto' : (isDesktop ? 'hidden' : 'visible'),
      WebkitOverflowScrolling: 'touch',
      padding: isDesktop ? 0 : 0,
      paddingBottom: isSafariBrowser ? 40 : 0,
      boxSizing: 'border-box',
      fontFamily:'ui-sans-serif, system-ui', 
      userSelect:'none',
      WebkitUserSelect:'none',
      WebkitTouchCallout:'none',
      MozUserSelect:'none',
      msUserSelect:'none',
      touchAction: 'pan-y'
    }}>
      {/* ✅ TEMPORARILY COMMENTED OUT - Testing if modal blocks iOS shared URLs
      {showAudioPrompt && (
        <div
          onClick={() => {
            const ctx = initAudioContext();
            ctx.resume().then(() => {
              // Play silent note to fully unlock
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              gain.gain.value = 0.001;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.01);
              
              setAudioInitialized(true);
              setAudioEnabled(true);
              audioEnabledRef.current = true;
              setShowAudioPrompt(false);
            });
          }}
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            background: '#1a1a1a',
            border: '2px solid #39FF14',
            borderRadius: 12,
            padding: 20,
            zIndex: 99999,
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Tap to Enable Sound</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>iOS requires user interaction to play audio</div>
        </div>
      )}
      */}
      
      {/* ✅ Share Modal */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '2px solid #60A5FA',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
              Share This Song
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>
              {songTitle || 'Your sequence'} will be shared via URL
            </div>
            
            <button
              onClick={() => {
                handleShareSong();
                setShowShareModal(false);
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#60A5FA',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12
              }}
            >
              📋 Copy Link to Clipboard
            </button>
            
            <button
              onClick={() => setShowShareModal(false)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'transparent',
                border: '2px solid #374151',
                borderRadius: 8,
                color: '#9CA3AF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {showShareCopied && (
              <div style={{
                marginTop: 16,
                padding: '8px 12px',
                background: '#1a3310',
                border: '1px solid #39FF14',
                borderRadius: 6,
                color: '#39FF14',
                fontSize: 14
              }}>
                ✅ Link copied! Send it to anyone.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{
        width: isDesktop ? '100%' : '100vw',
        maxWidth: isDesktop ? 900 : 'none',
        margin:'0 auto', 
        border: isDesktop ? '1px solid #374151' : 'none',
        borderRadius: isDesktop ? 12 : 0,
        padding: isDesktop ? 8 : 4,
        paddingTop: isDesktop ? 8 : (isSafariBrowser ? 8 : 12),
        minHeight:'fit-content',
        overflow: 'visible',
        position:'relative',
        fontSize: isDesktop ? '16px' : 'min(2.2vw, 16px)',
        boxSizing: 'border-box',
        userSelect:'none',
        WebkitUserSelect:'none',
        WebkitTouchCallout:'none'
      }}>

        {/* ✅ Legend - Safari needs more top space */}
        {(isDesktop || window.innerWidth > 800) && (
          <div style={{
            position:'absolute',
            top: isSafariBrowser ? 16 : 8,
            left: 8,
            background:'#1a1a1a',
            border:'2px solid #4B5563',
            borderRadius:8,
            padding:'10px',
            width:110,
            fontSize:10,
            pointerEvents:'none',
            zIndex: 5
          }}>
          <div style={{fontWeight:600, marginBottom:6, color:'#9CA3AF', fontSize:9, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            Function
          </div>
          
          {(() => {
            const fn = activeFn;
            const isTonic = fn === 'I' || fn === 'iii' || fn === 'vi';
            const isPredom = fn === 'ii' || fn === 'IV' || fn === 'iv';
            const isDom = fn === 'V7' || fn === 'V/V' || fn === 'V/vi' || fn === 'V/ii' || fn === '♭VII';
            
            return (
              <>
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isTonic ? '#33280a' : 'transparent',
                  border: isTonic ? '1px solid #F2D74B' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#F2D74B',
                    border:'1px solid #F9E89B',
                    flexShrink:0
                  }}/>
                  <span style={{color: isTonic ? '#F2D74B' : '#9CA3AF', fontSize:10}}>
                    Tonic
                  </span>
                </div>
                
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isPredom ? '#082f49' : 'transparent',
                  border: isPredom ? '1px solid #0EA5E9' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#0EA5E9',
                    border:'1px solid #38BDF8',
                    flexShrink:0
                  }}/>
                  <span style={{color: isPredom ? '#0EA5E9' : '#9CA3AF', fontSize:10}}>
                    {skillLevel === 'ROOKIE' || skillLevel === 'NOVICE' || skillLevel === 'SOPHOMORE' 
                      ? 'Subdominant' 
                      : 'Predominant'}
                  </span>
                </div>
                
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isDom ? '#4a1d07' : 'transparent',
                  border: isDom ? '1px solid #E63946' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#E63946',
                    border:'1px solid #F87171',
                    flexShrink:0
                  }}/>
                  <span style={{color: isDom ? '#E63946' : '#9CA3AF', fontSize:10}}>
                    Dominant
                  </span>
                </div>
                
                <div style={{
                  marginTop:8,
                  paddingTop:6,
                  borderTop:'1px solid #374151',
                  fontSize:8,
                  color:'#6b7280',
                  fontStyle:'italic',
                  lineHeight:1.4
                }}>
                  <div>Z: Reset wheel</div>
                  <div>H: HOME</div>
                  <div>R: REL</div>
                  <div>S: SUB</div>
                  <div>P: PAR</div>
                </div>
              </>
            );
          })()}
          
          {/* ✅ Version and copyright - left aligned */}
          <div style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid #374151',
            fontSize: 8,
            color: '#6b7280',
            textAlign: 'left',
            lineHeight: 1.3
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              Harmony Wheel
            </div>
            <div>{HW_VERSION}</div>
            {/* ✅ Neutral browser detection for debugging */}
            <div style={{ color: '#6b7280', fontSize: 7 }}>
              {isSafariBrowser ? 'Safari' : 'Chrome/Other'}
            </div>
            <div style={{ marginTop: 4, fontSize: 7 }}>
              © Beat Kitchen LLC, 2025
            </div>
          </div>
          </div>
        )}

        {/* ✅ TESTING - Logo temporarily hidden (may be on website header) */}
        {/* BKS Logo Header with Emblem + Help Button - v3.18.22: Centered layout */}
        {false && (
        <div style={{marginBottom:0, position:'relative', zIndex:10002, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div style={{position:'relative', marginLeft: isDesktop ? 8 : 8}}>
            <svg width="300" height="44" viewBox="0 0 400 70" preserveAspectRatio="xMinYMin meet" style={{opacity:0.85, display:'block'}}>
            <g transform="matrix(0.733705,0,0,0.733705,2.67091,-1.60525)">
              <g transform="matrix(-1,0,0,1,99.7819,4.76996e-06)">
                <circle cx="49.891" cy="49.891" r="44.3" style={{fill:'none', stroke:'#e5e7eb', strokeWidth:'3.7px'}}/>
              </g>
              <g transform="matrix(1,0,0,1,4.76996e-06,-0.221515)">
                <path d="M22.769,50.112L22.769,60.376C22.769,61.058 22.928,61.731 23.233,62.341C24.788,65.452 29.171,65.607 30.942,62.613L31.164,62.238C31.586,61.524 31.81,60.71 31.81,59.88L31.81,31.824C31.81,31.07 32,30.329 32.363,29.669C34.159,26.403 38.926,26.636 40.394,30.062L40.48,30.263C40.725,30.833 40.85,31.447 40.85,32.067L40.85,75.405C40.85,75.719 40.884,76.036 40.949,76.343C41.977,81.205 48.978,81.156 49.825,76.26C49.868,76.006 49.891,75.749 49.891,75.491L49.891,24.704C49.891,24.466 49.91,24.228 49.948,23.993C50.779,18.798 58.321,19.001 58.872,24.233L58.932,24.798L58.932,68.208C58.932,68.796 59.046,69.378 59.268,69.923L59.325,70.064C60.898,73.924 66.424,73.743 67.742,69.79C67.895,69.331 67.972,68.852 67.972,68.369L67.972,40.098C67.972,39.256 68.205,38.432 68.643,37.714L68.75,37.539C70.576,34.551 74.976,34.738 76.542,37.87C76.852,38.49 77.013,39.172 77.013,39.864L77.013,50.112" style={{fill:'none', stroke:'#e5e7eb', strokeWidth:'3.7px'}}/>
              </g>
              <g transform="matrix(1,0,0,1,4.76996e-06,-1.523e-05)">
                {/* BEAT */}
                <g transform="matrix(60.3825,0,0,60.3825,102.739,71.3567)">
                  <path d="M0.083,-0L0.083,-0.711L0.315,-0.711C0.389,-0.711 0.447,-0.695 0.489,-0.663C0.531,-0.631 0.552,-0.583 0.552,-0.519C0.552,-0.488 0.543,-0.461 0.524,-0.436C0.505,-0.412 0.48,-0.394 0.449,-0.381C0.495,-0.374 0.532,-0.354 0.559,-0.32C0.587,-0.286 0.6,-0.247 0.6,-0.201C0.6,-0.136 0.579,-0.086 0.537,-0.052C0.494,-0.017 0.437,-0 0.365,-0L0.083,-0ZM0.179,-0.333L0.179,-0.075L0.365,-0.075C0.409,-0.075 0.443,-0.086 0.467,-0.108C0.491,-0.129 0.503,-0.16 0.503,-0.2C0.503,-0.239 0.491,-0.271 0.466,-0.295C0.442,-0.319 0.408,-0.332 0.366,-0.333L0.179,-0.333ZM0.179,-0.409L0.335,-0.409C0.371,-0.409 0.4,-0.419 0.422,-0.438C0.445,-0.458 0.456,-0.485 0.456,-0.521C0.456,-0.559 0.444,-0.588 0.42,-0.607C0.395,-0.626 0.361,-0.635 0.315,-0.635L0.179,-0.635L0.179,-0.409Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,141.127,71.3567)">
                  <path d="M0.471,-0.33L0.179,-0.33L0.179,-0.075L0.521,-0.075L0.521,-0L0.083,-0L0.083,-0.711L0.516,-0.711L0.516,-0.635L0.179,-0.635L0.179,-0.405L0.471,-0.405L0.471,-0.33Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,174.444,71.3567)">
                  <path d="M0.45,-0.183L0.183,-0.183L0.119,-0L0.021,-0L0.277,-0.711L0.36,-0.711L0.611,-0L0.513,-0L0.45,-0.183ZM0.21,-0.264L0.423,-0.264L0.319,-0.569L0.316,-0.569L0.21,-0.264Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,208.822,71.3567)">
                  <path d="M0.58,-0.635L0.346,-0.635L0.346,-0L0.25,-0L0.25,-0.635L0.018,-0.635L0.018,-0.711L0.58,-0.711L0.58,-0.635Z" style={{fill:'#e5e7eb'}}/>
                </g>
                {/* KITCHEN */}
                <g transform="matrix(60.3825,0,0,60.3825,259.947,71.3567)">
                  <path d="M0.242,-0.321L0.179,-0.321L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.179,-0.396L0.232,-0.396L0.496,-0.711L0.604,-0.711L0.605,-0.708L0.317,-0.372L0.625,-0.002L0.625,-0L0.508,-0L0.242,-0.321Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,298.335,71.3567)">
                  <rect x="0.093" y="-0.711" width="0.097" height="0.711" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,314.551,71.3567)">
                  <path d="M0.58,-0.635L0.346,-0.635L0.346,-0L0.25,-0L0.25,-0.635L0.018,-0.635L0.018,-0.711L0.58,-0.711L0.58,-0.635Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,349.843,71.3567)">
                  <path d="M0.59,-0.228L0.591,-0.225C0.593,-0.158 0.569,-0.102 0.521,-0.057C0.473,-0.012 0.409,0.01 0.33,0.01C0.25,0.01 0.184,-0.018 0.134,-0.075C0.083,-0.132 0.058,-0.204 0.058,-0.292L0.058,-0.418C0.058,-0.506 0.083,-0.578 0.134,-0.635C0.184,-0.693 0.25,-0.721 0.33,-0.721C0.41,-0.721 0.474,-0.7 0.522,-0.657C0.569,-0.614 0.593,-0.557 0.591,-0.487L0.59,-0.484L0.498,-0.484C0.498,-0.534 0.483,-0.573 0.454,-0.602C0.425,-0.631 0.383,-0.646 0.33,-0.646C0.276,-0.646 0.234,-0.624 0.202,-0.581C0.17,-0.537 0.154,-0.484 0.154,-0.419L0.154,-0.292C0.154,-0.227 0.17,-0.173 0.202,-0.13C0.234,-0.087 0.276,-0.065 0.33,-0.065C0.383,-0.065 0.425,-0.079 0.454,-0.108C0.483,-0.137 0.498,-0.177 0.498,-0.228L0.59,-0.228Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,388.084,71.3567)">
                  <path d="M0.621,-0L0.524,-0L0.524,-0.314L0.179,-0.314L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.179,-0.39L0.524,-0.39L0.524,-0.711L0.621,-0.711L0.621,-0Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,430.57,71.3567)">
                  <path d="M0.471,-0.33L0.179,-0.33L0.179,-0.075L0.521,-0.075L0.521,-0L0.083,-0L0.083,-0.711L0.516,-0.711L0.516,-0.635L0.179,-0.635L0.179,-0.405L0.471,-0.405L0.471,-0.33Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,463.887,71.3567)">
                  <path d="M0.621,-0L0.524,-0L0.182,-0.543L0.179,-0.542L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.521,-0.168L0.524,-0.169L0.524,-0.711L0.621,-0.711L0.621,-0Z" style={{fill:'#e5e7eb'}}/>
                </g>
                {/* Â® Symbol */}
                <g transform="matrix(35.2026,0,0,35.2026,506.403,51.2485)">
                  <path d="M0.043,-0.356C0.043,-0.458 0.077,-0.545 0.144,-0.615C0.211,-0.686 0.293,-0.721 0.39,-0.721C0.486,-0.721 0.567,-0.686 0.635,-0.615C0.702,-0.545 0.736,-0.458 0.736,-0.356C0.736,-0.253 0.702,-0.166 0.635,-0.096C0.567,-0.025 0.485,0.01 0.39,0.01C0.293,0.01 0.211,-0.025 0.144,-0.096C0.077,-0.166 0.043,-0.253 0.043,-0.356ZM0.102,-0.356C0.102,-0.269 0.13,-0.197 0.186,-0.137C0.242,-0.078 0.31,-0.049 0.39,-0.049C0.469,-0.049 0.537,-0.078 0.593,-0.138C0.649,-0.197 0.677,-0.27 0.677,-0.356C0.677,-0.442 0.649,-0.514 0.593,-0.573C0.537,-0.632 0.469,-0.661 0.39,-0.661C0.31,-0.661 0.242,-0.632 0.186,-0.573C0.13,-0.514 0.102,-0.442 0.102,-0.356ZM0.319,-0.319L0.319,-0.154L0.246,-0.154L0.246,-0.569L0.383,-0.569C0.432,-0.569 0.471,-0.559 0.499,-0.537C0.527,-0.516 0.542,-0.485 0.542,-0.444C0.542,-0.424 0.536,-0.406 0.525,-0.391C0.515,-0.375 0.499,-0.363 0.479,-0.353C0.5,-0.344 0.516,-0.331 0.525,-0.314C0.535,-0.297 0.54,-0.276 0.54,-0.251L0.54,-0.224C0.54,-0.211 0.54,-0.199 0.541,-0.188C0.542,-0.178 0.545,-0.169 0.548,-0.162L0.548,-0.154L0.473,-0.154C0.47,-0.161 0.468,-0.171 0.468,-0.184C0.467,-0.198 0.467,-0.211 0.467,-0.225L0.467,-0.251C0.467,-0.274 0.461,-0.292 0.45,-0.303C0.44,-0.314 0.422,-0.319 0.396,-0.319L0.319,-0.319ZM0.319,-0.383L0.393,-0.383C0.414,-0.383 0.432,-0.388 0.447,-0.399C0.462,-0.409 0.469,-0.423 0.469,-0.441C0.469,-0.465 0.463,-0.482 0.45,-0.491C0.437,-0.501 0.415,-0.506 0.383,-0.506L0.319,-0.506L0.319,-0.383Z" style={{fill:'#e5e7eb'}}/>
                </g>
              </g>
            </g>
          </svg>
          <div style={{fontSize:11, fontWeight:500, color:'#9CA3AF', marginTop:0}}>
            HarmonyWheel {HW_VERSION}
          </div>
          </div>
        </div>
        )}
        {/* END TESTING - Logo hidden */}
        
        {/* ✅ v3.19.55: Skill selector moved to bottom row - removed from upper right */}

        {/* Wheel - v3.18.34: Keep wheel position normal, move controls instead */}
        <div style={{
          position:'relative', 
          width:'100%', 
          maxWidth:WHEEL_W, 
          margin:'0 auto', 
          marginTop: -30,
          zIndex:10
        }}>

        {/* Wheel - centered as before */}
        <div className="relative"
             style={{
               width:'100%',
               maxWidth:WHEEL_W,
               aspectRatio: '1/1',
               margin:'0 auto', 
               marginTop: -30,
               transform: isDesktop ? `scale(1.15)` : 'scale(1.1)',
               transformOrigin:'center top',
               position:'relative',
               zIndex:10
             }}>
          <div style={{...wrapperStyle, position:'relative', zIndex:10}}>
            <svg width="100%" height="100%" viewBox={`0 0 ${WHEEL_W} ${WHEEL_H}`} className="select-none" style={{
              display:'block', 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              position:'relative', 
              zIndex:10, 
              maxWidth:'100%', 
              maxHeight:'100%', 
              touchAction:'pan-y', 
              pointerEvents:'none'  // ⏺š ï¸ CRITICAL: Allows clicks to pass through to buttons underneath (wheel overlaps with marginTop:-30)
            }}>
  {/* ✅ Black backing circle - pointer-events none for scrolling */}
  <circle cx={260} cy={260} r={224} fill="#111" style={{pointerEvents: 'none'}} />
  
  {/* Labels moved to status bar area */}

  {wedgeNodes}
  {/* ✅ Glow layer drawn last to appear on top */}
  {glowLayer}

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
{/* Persistent bonus wedges (opacity controlled for smooth fade) - EXPERT only */}
{!bonusActive && skillLevel === "EXPERT" && (() => {
  // v3.19.55: Cosmetic helper - translate C-based labels to current key
  const translateBonusLabel = (label: string): string => {
    if (label === 'A7') {
      const targetPc = (NAME_TO_PC['C'] + 9) % 12;
      const offset = (NAME_TO_PC[baseKey] - NAME_TO_PC['C'] + 12) % 12;
      const newPc = (targetPc + offset) % 12;
      return pcNameForKey(newPc, baseKey) + '7';
    }
    if (label === 'Bm7♭5') {
      const targetPc = (NAME_TO_PC['C'] + 11) % 12;
      const offset = (NAME_TO_PC[baseKey] - NAME_TO_PC['C'] + 12) % 12;
      const newPc = (targetPc + offset) % 12;
      return pcNameForKey(newPc, baseKey) + 'm7⏺™­5';
    }
    return label;
  };
  
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
    <g 
      key="bonus-persistent"
      style={{
        opacity: showBonusWedges ? 0.5 : 0,
        transition: 'opacity 0.6s ease-in-out'  // Faster (was 1.2s)
      } as any}
    >
      {wedges.map(w => {
        const a0 = w.anchor - span/2 + rotationOffset;
        const a1 = w.anchor + span/2 + rotationOffset;
        const pathD = ring(cx,cy,r0,r1,a0,a1);
        const textR = (r0+r1)/2;
        const mid = (a0+a1)/2;
        const tx = cx + textR * Math.cos(toRad(mid));
        const ty = cy + textR * Math.sin(toRad(mid));
        
        // Click handler to preview and enable insert
        const handleClick = (e: React.MouseEvent) => {
          // Show chord in hub and trigger keyboard/tab display
          lastInputWasPreviewRef.current = true;
          
          // ✅ Add radius detection for inner/outer ring behavior
          // Calculate click position relative to wheel center
          const svg = (e.currentTarget as SVGElement).ownerSVGElement;
          let playWith7th = true; // Default to 7th if we can't detect radius
          
          if (svg) {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const ctm = svg.getScreenCTM();
            
            if (ctm) {
              const svgP = pt.matrixTransform(ctm.inverse());
              const dx = svgP.x - cx;
              const dy = svgP.y - cy;
              const clickRadius = Math.sqrt(dx*dx + dy*dy);
              const normalizedRadius = clickRadius / r; // 0 = center, 1 = outer edge
              
              // Inner zone (< threshold) = play with 7th
              // Outer zone (>= threshold) = play triad only
              playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
              
              console.log('ðŸ–±ï¸ Bonus click:', {
                label: w.label,
                clickRadius: clickRadius.toFixed(1),
                normalizedRadius: normalizedRadius.toFixed(2),
                threshold: SEVENTH_RADIUS_THRESHOLD,
                playWith7th
              });
            }
          }
          
          // Get chord definition from bonus table
          const bonusChordDef = BONUS_CHORD_DEFINITIONS[w.label];
          
          if (bonusChordDef && audioEnabledRef.current) {
            // Play with or without 7th based on click zone
            const pcs = (playWith7th && bonusChordDef.seventh !== undefined)
              ? [...bonusChordDef.triad, bonusChordDef.seventh]
              : bonusChordDef.triad;
            console.log('🎵 Bonus wedge clicked:', w.label, 'with7th:', playWith7th, 'PCs:', pcs);
            playChordWithVoiceLeading(pcs);
          }
          
          // Update keyboard highlight based on what we're playing
          const chordName = w.label;
          
          // Define both triad and seventh versions
          const chordNotes: Record<string, {triad: number[], seventh: number[]}> = {
            'A7': {
              triad: [57, 61, 64],           // A3 C#4 E4
              seventh: [57, 61, 64, 67]      // A3 C#4 E4 G4
            },
            'Bm7♭5': {
              triad: [59, 62, 65],           // B3 D4 F4
              seventh: [59, 62, 65, 69]      // B3 D4 F4 A4
            }
          };
          
          if (chordNotes[chordName]) {
            setLatchedAbsNotes(playWith7th ? chordNotes[chordName].seventh : chordNotes[chordName].triad);
          }
          
          // ✅ Update display and trigger step record
          const displayChordName = playWith7th ? chordName : chordName.replace(/7|⏺™­5/, '').trim();
          centerOnly(displayChordName);
        };
        
        return (
          <g 
            key={w.label} 
            onMouseDown={handleClick}
            style={{
              cursor: 'pointer', 
              pointerEvents: 'auto'  // ⏺š ï¸ CRITICAL: Must be 'auto' when parent SVG has pointerEvents:'none'
            }}
          >
            <path d={pathD} 
                  fill={w.label === 'Bm7♭5' ? '#0EA5E9' : BONUS_FILL} 
                  stroke={PALETTE_ACCENT_GREEN} 
                  strokeWidth={1.5 as any}/>
            <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {w.funcLabel}
            </text>
            <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {translateBonusLabel(w.label)}
            </text>
          </g>
        );
      })}
    </g>
  );
})()}

{/* Active bonus wedge (full opacity when clicked) */}
{bonusActive && (() => {
  // v3.19.55: Cosmetic helper - translate C-based labels to current key
  const translateBonusLabel = (label: string): string => {
    if (label === 'A7') {
      // A7 in C = pitch class 9, transpose to current key
      const targetPc = (NAME_TO_PC['C'] + 9) % 12; // A in C
      const offset = (NAME_TO_PC[baseKey] - NAME_TO_PC['C'] + 12) % 12;
      const newPc = (targetPc + offset) % 12;
      return pcNameForKey(newPc, baseKey) + '7';
    }
    if (label === 'Bm7♭5') {
      // B in C = pitch class 11, transpose to current key  
      const targetPc = (NAME_TO_PC['C'] + 11) % 12; // B in C
      const offset = (NAME_TO_PC[baseKey] - NAME_TO_PC['C'] + 12) % 12;
      const newPc = (targetPc + offset) % 12;
      return pcNameForKey(newPc, baseKey) + 'm7⏺™­5';
    }
    return label; // passthrough for any other labels
  };
  
  // Basic arc ring between inner/outer radii
  const toRad = (deg:number) => (deg - 90) * Math.PI/180; // 0Â° at 12 o'clock
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
  
  // Use static position from BONUS_WEDGE_POSITIONS (not dynamic!)
  const anchor = bonusFunction && BONUS_WEDGE_POSITIONS[bonusFunction]
    ? BONUS_WEDGE_POSITIONS[bonusFunction]
    : 305; // fallback
  
  const a0 = anchor - span/2 + rotationOffset;
  const a1 = anchor + span/2 + rotationOffset;
  const pathD = ring(cx,cy,r0,r1,a0,a1);
  const textR = (r0+r1)/2;
  const funcLabel = bonusFunction || '??';
  const mid = (a0+a1)/2;
  const tx = cx + textR * Math.cos(toRad(mid));
  const ty = cy + textR * Math.sin(toRad(mid));
  return (
    <g key="bonus">
      <path d={pathD} fill={bonusFunction ? FN_COLORS[bonusFunction] : BONUS_FILL} stroke={PALETTE_ACCENT_GREEN} strokeWidth={1.5 as any}/>
      <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
            style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
        {funcLabel}
      </text>
      <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
            style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
        {translateBonusLabel(bonusLabel)}
      </text>
    </g>
  );
})()}
{/* -------- END BONUS BLOCK -------- */}

{/* ✅ Intro animation overlay - shows bonus wedges regardless of skill level */}
{showIntroAnimation && (() => {
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
  
  const wedges = [
    { label: 'A7', funcLabel: 'V/ii', anchor: base - 30 },
    { label: 'Bm7♭5', funcLabel: 'ii/vi', anchor: base + 30 }
  ];
  
  return (
    <g 
      key="intro-bonus-overlay"
      style={{
        opacity: showBonusWedges ? 0.5 : 0,
        transition: 'opacity 0.6s ease-in-out',  // Faster
        pointerEvents: 'none'  // Don't interfere with clicks
      } as any}
    >
      {wedges.map(w => {
        const a0 = w.anchor - span/2 + rotationOffset;
        const a1 = w.anchor + span/2 + rotationOffset;
        const pathD = ring(cx,cy,r0,r1,a0,a1);
        const textR = (r0+r1)/2;
        const mid = (a0+a1)/2;
        const tx = cx + textR * Math.cos(toRad(mid));
        const ty = cy + textR * Math.sin(toRad(mid));
        
        return (
          <g key={w.label}>
            <path d={pathD} 
                  fill={w.label === 'Bm7♭5' ? '#0EA5E9' : BONUS_FILL} 
                  stroke={PALETTE_ACCENT_GREEN} 
                  strokeWidth={1.5 as any}/>
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

            </svg>
            
            {/* ✅ Lock Button - positioned above sequencer display */}
            <button
              onClick={() => setSpaceLocked(!spaceLocked)}
              style={{
                position: 'absolute',
                right: 40,
                bottom: isDesktop ? 120 : 60,  // ⏺† v3.17.85: LOWER on mobile (was backwards!)
                width: 32,
                height: 32,
                padding: 0,
                border: `2px solid ${spaceLocked ? '#F59E0B' : '#374151'}`,
                borderRadius: '50%',
                background: spaceLocked ? '#78350F' : '#0a0a0a',
                color: spaceLocked ? '#FCD34D' : '#9CA3AF',
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 10,
              }}
              title={spaceLocked ? "🔒 Spaces locked - click to unlock" : "🔓 Click to lock spaces"}
            >
              {spaceLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
        
        </div> {/* End of position:relative container for legend+wheel */}

        {/* Bottom Grid: input + keyboard (left), buttons + guitar tab (right) */}
        {(()=>{

          // keyboard geometry (scoped)
          const KBD_LOW=48, KBD_HIGH=71;
          const whites:number[]=[], blacks:number[]=[];
          for(let m=KBD_LOW;m<=KBD_HIGH;m++){ ([1,3,6,8,10].includes(pcFromMidi(m))?blacks:whites).push(m); }

          const whiteCount = whites.length;
          const totalW = (WHEEL_W * 0.5);
          const WW = totalW / whiteCount;
          const HW = WW * 4.0 * 1.0 * 1.2; // 1.2x for taller tablature (was 0.25, fixed to 1.0)
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
            // ✅ v3.19.55: Don't use latchedAbsNotes for disp during playback - it's already in keyboardHighlightNotes
            // Only use latchedAbsNotes for LATCH_PREVIEW (step recording), not for sequence playback
            if(src.length===0 && true && lastInputWasPreviewRef.current && latchedAbsNotes.length && !isPlaying){
              src = [...new Set(latchedAbsNotes)].sort((a,b)=>a-b);
            }
            if(src.length===0) return new Set<number>();
            
            // ✅ Use full 2-octave range intelligently
            if (lastInputWasPreviewRef.current) {
              // Wedge clicks - use smart voice leading
              const fitted = preview.fitNotesToWindowPreserveInversion(src, KBD_LOW, KBD_HIGH);
              return new Set(fitted);
            } else {
              // MIDI input - preserve chord structure in 2-octave window
              // Strategy: Find the octave that fits the chord best
              if (src.length === 0) return new Set<number>();
              
              const bass = src[0]; // Lowest note
              const span = src[src.length - 1] - bass; // Chord span
              
              // Try to keep the chord structure intact
              // Find an octave where bass is in range and top note doesn't exceed HIGH
              let bestOctave = 0;
              let testBass = bass;
              
              // Shift up until bass is at least KBD_LOW
              while (testBass < KBD_LOW) {
                testBass += 12;
                bestOctave += 12;
              }
              
              // Check if chord fits without exceeding KBD_HIGH
              // If not, shift down one octave (but keep bass >= KBD_LOW)
              while (testBass + span > KBD_HIGH && testBass - 12 >= KBD_LOW) {
                testBass -= 12;
                bestOctave -= 12;
              }
              
              const transposed = src.map(note => note + bestOctave);
              return new Set(transposed);
            }
          };
          const disp = rhDisplaySet();
          // console.log('🎹 KB DISP SET:', Array.from(disp).sort((a,b) => a-b), 'size:', disp.size);
          // console.log('🎹 KB HIGHLIGHT SET:', Array.from(keyboardHighlightNotes).sort((a,b) => a-b), 'size:', keyboardHighlightNotes.size);
          // console.log('🎹 KB LATCHED NOTES:', latchedAbsNotes);

          // guitar tab sizing (square)
          const rightW = WHEEL_W * 0.3;
          const tabSize = Math.min(rightW, HW);

          return (
            <div style={{
              maxWidth: WHEEL_W, 
              margin:'0 auto 0', 
              marginTop: isSafariBrowser ? 55 : 25,
              paddingLeft: isDesktop ? 0 : 8,
              paddingRight: isDesktop ? 0 : 8
            }}>
              {/* UNIFIED LAYOUT - Same structure always, no shifting */}
              
              
              {/* v3.19.55: Two-line display - ALWAYS visible, FIXED HEIGHT */}
              <div style={{
                border:'1px solid #374151',
                borderRadius:8,
                background:'#0f172a',
                overflow:'hidden',
                marginBottom: 8,  /* v3.19.55: Add space to prevent overlap with buttons below */
                height: 56  /* FIXED HEIGHT - never changes */
              }}>
                
                {/* LINE 1 (Top Line - 28px fixed height) */}
                <div style={{
                  height: 28,
                  padding:'2px 8px',
                  fontSize:11,
                  fontWeight:600,
                  display:'flex',
                  alignItems:'center',
                  borderBottom:'1px solid #374151'
                }}>
                  {showSequencerDisplay && sequence.length > 0 && songTitle ? (
                    /* Playing with sequence OR within 2-min display window - show title + key */
                    <>
                      <div style={{flex:1, display:'flex', flexDirection:'column', gap:4}}>
                        <span style={{color:'#39FF14'}}>{songTitle}</span>
                        {currentComment && (
                          <span style={{fontSize:12, color:'#FFA500', fontStyle:'italic'}}>
                            {currentComment}
                          </span>
                        )}
                      </div>
                      <span style={{fontSize:10, color:'#9CA3AF', fontWeight:400}}>
                        {baseKey} major
                      </span>
                    </>
                  ) : (
                    /* Not playing or no sequence - show banner */
                    <div style={{
                      color:'#6b7280',
                      fontStyle:'italic',
                      fontWeight:400,
                      overflow:'hidden',
                      textOverflow:'ellipsis',
                      whiteSpace:'nowrap',
                      width:'100%'
                    }}>
                      {(() => {
                        const message = (bannerMessage && bannerMessage.trim())
                          ? bannerMessage 
                          : DEFAULT_BANNER;
                        
                        // Parse [[text|url]] links in banner
                        const linkRegex = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
                        const parts: React.ReactNode[] = [];
                        let lastIndex = 0;
                        let match;
                        
                        while ((match = linkRegex.exec(message)) !== null) {
                          if (match.index > lastIndex) {
                            parts.push(
                              <span key={`text-${lastIndex}`}>
                                {message.substring(lastIndex, match.index)}
                              </span>
                            );
                          }
                          
                          const linkText = match[1];
                          const linkUrl = match[2];

                          // ✅ v4.1.6: Handle special "expert" link to set skill level
                          const isExpertLink = linkUrl.toLowerCase() === 'expert';

                          parts.push(
                            <a
                              key={`link-${match.index}`}
                              href={isExpertLink ? '#' : linkUrl}
                              target={isExpertLink ? '_self' : '_blank'}
                              rel={isExpertLink ? undefined : 'noopener noreferrer'}
                              onClick={(e) => {
                                if (isExpertLink) {
                                  e.preventDefault();
                                  setSkillLevel('EXPERT');
                                  console.log('🎯 Expert mode activated from banner link');
                                }
                              }}
                              style={{
                                color: '#39FF14',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                background: 'rgba(57, 255, 20, 0.1)',
                                padding: '1px 4px',
                                borderRadius: '3px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                              }}
                            >
                              {linkText}
                            </a>
                          );
                          
                          lastIndex = linkRegex.lastIndex;
                        }
                        
                        if (lastIndex < message.length) {
                          parts.push(
                            <span key={`text-${lastIndex}`}>
                              {message.substring(lastIndex)}
                            </span>
                          );
                        }
                        
                        return parts.length > 0 ? parts : message;
                      })()}
                    </div>
                  )}
                </div>
                
                {/* LINE 2 (Bottom Line - 28px fixed height) */}
                <div style={{
                  height: 28,
                  padding:'4px 0px',
                  fontSize:12,
                  display:'flex',
                  alignItems:'center',
                  overflow:'hidden',
                  position:'relative'
                }}>
                  {showSequencerDisplay && sequence.length > 0 ? (
                    /* Playing OR within 2-min display window - show scrolling chord sequence (not clickable) */
                    <div style={{
                      color:'#e5e7eb',
                      whiteSpace:'nowrap',
                      overflow:'hidden',
                      width:'100%',
                      paddingLeft:'8px',
                      paddingRight:'8px'
                    }}>
                      {(() => {
                        const WINDOW_SIZE = 3;
                        // Center window on displayIndex (what's currently playing/highlighted) instead of seqIndex (next to play)
                        const centerIdx = displayIndex >= 0 ? displayIndex : seqIndex;
                        const start = Math.max(0, centerIdx - WINDOW_SIZE);
                        const end = Math.min(sequence.length, centerIdx + WINDOW_SIZE + 1);
                        const visibleItems = sequence.slice(start, end);
                        
                        return (
                          <>
                            {start > 0 && <span style={{marginRight:8, color:'#6b7280'}}>...</span>}
                            {visibleItems.map((item, localIdx) => {
                              const globalIdx = start + localIdx;
                              const isCurrent = globalIdx === displayIndex;
                              const isComment = item.kind === "comment";
                              const isTitle = item.kind === "title";

                              // ✅ OLD: "(label): Chord" format - comment before next chord
                              const isCommentForNextChord = isComment &&
                                                           item.raw?.endsWith(':') &&
                                                           globalIdx + 1 === displayIndex;

                              // ✅ NEW: Check if current playing chord has an attached comment
                              // This highlights comments in "(comment; C G7)" format
                              const isAttachedCommentForCurrent = isComment &&
                                                                  displayIndex >= 0 &&
                                                                  sequence[displayIndex]?.kind === "chord" &&
                                                                  sequence[displayIndex]?.comment === item.comment;

                              const isTieAfterCurrent = item.raw === '*' &&
                                                       globalIdx > 0 &&
                                                       sequence[displayIndex]?.kind === "chord" &&
                                                       globalIdx > displayIndex;

                              const isPartOfTiedGroup = (() => {
                                if (item.raw !== '*') return false;
                                for (let k = globalIdx - 1; k >= 0; k--) {
                                  if (sequence[k]?.raw === '*') continue;
                                  if (sequence[k]?.kind === "chord") {
                                    return k === displayIndex;
                                  }
                                  break;
                                }
                                return false;
                              })();

                              const shouldHighlight = isCurrent || isCommentForNextChord || isAttachedCommentForCurrent || isPartOfTiedGroup;
                              
                              const isConfig = item.kind === "modifier" && item.chord && 
                                (item.chord.startsWith("RHYTHM") || 
                                 item.chord === "LOOP" || 
                                 item.chord.startsWith("TEMPO"));
                              
                              if (isTitle || isConfig) return null;
                              
                              return (
                                <span key={globalIdx} style={{
                                  marginRight: 8,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: shouldHighlight ? '#374151' : 'transparent',
                                  fontWeight: shouldHighlight ? 600 : 400,
                                  fontStyle: isComment ? 'italic' : 'normal',
                                  color: shouldHighlight ? '#39FF14' : (isComment ? '#6b7280' : '#9CA3AF')
                                }}>
                                  {isComment ? (
                                    item.chord ? 
                                      `${item.comment}: ${item.chord}` : 
                                      item.raw.replace(/^#\s*/, '')
                                  ) : item.raw}
                                </span>
                              );
                            })}
                            {end < sequence.length && <span style={{marginLeft:0, color:'#6b7280'}}>...</span>}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Not playing - show event ticker (clickable, scrolling) */
                    <a
                      href="https://beatkitchen.io/classroom/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration:'none',
                        overflow:'hidden',
                        width:'100%',
                        cursor:'pointer',
                        display:'block',
                        height:'100%',
                        userSelect:'auto',
                        WebkitUserSelect:'auto',
                        pointerEvents:'auto',
                        position:'relative'
                      }}
                      title="Click to view BeatKitchen schedule"
                    >
                      {tickerEvents.length > 0 ? (
                        <div style={{
                          overflow: 'hidden',
                          width: '100%',
                          position: 'relative',
                          whiteSpace: 'nowrap'
                        }}>
                          <style>{`
                            @keyframes marquee {
                              0% { 
                                transform: translateX(0%);
                              }
                              100% { 
                                transform: translateX(-50%);
                              }
                            }
                            .ticker-wrap {
                              display: inline-flex;
                              animation: marquee 40s linear infinite;
                            }
                            .ticker-item {
                              display: inline-flex;
                            }
                          `}</style>
                          <div className="ticker-wrap">
                            {[0, 1].map(copyIdx => (
                              <div key={copyIdx} className="ticker-item">
                                {tickerEvents.map((eventObj, idx) => (
                                  <a
                                    key={`${copyIdx}-${idx}`}
                                    href="https://beatkitchen.io/classroom/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-block',
                                      paddingRight: '150px',
                                      fontStyle:'italic',
                                      color: eventObj.isLive ? '#EF4444' : eventObj.isSoon ? '#FF8C00' : '#39FF14',
                                      fontWeight: eventObj.isLive ? 600 : eventObj.isSoon ? 500 : 400,
                                      textDecoration: 'none',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                    }}
                                  >
                                    {eventObj.isLive ? '🔴 Now in session: ' : (idx === 0 ? 'Next ' : 'Coming up: ')}
                                    {eventObj.text.replace(/@/g, 'with ')}
                                  </a>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          fontStyle:'italic',
                          color:'#9CA3AF',
                          paddingLeft:'8px'
                        }}>
                          {tickerText}
                        </span>
                      )}
                    </a>
                  )}
                </div>
              </div>

              
              <div style={{
                display:'grid', 
                gridTemplateColumns: '65% 35%',
                columnGap:12, 
                marginBottom:0,
                position: 'relative',
                zIndex: 50,  // ✅ Above wheel (10) but below button grid (100000)
                pointerEvents: 'auto'  // ⏺š ï¸ CRITICAL: Force clickability even when wheel SVG overlaps (marginTop:-30)
              }}>
                {/* Left: Key Button + Space Buttons + Keyboard */}
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {/* Key + Space buttons */}
                  <div style={{display:'flex', gap:8, flexWrap:'nowrap', position:'relative', justifyContent:'space-between', alignItems:'center'}}>
                    {/* Key Button - left aligned */}
                    <div style={{position:'relative'}}>
                      <button
                        onClick={() => {
                          // ✅ v4.1.2: Disable key selector when transposed
                          if (transpose === 0) {
                            setShowKeyDropdown(!showKeyDropdown);
                          }
                        }}
                        style={{
                          ...activeBtnStyle(true, '#39FF14'),
                          minWidth:60,
                          transition: 'box-shadow 0.3s ease-out, opacity 0.3s ease-out',
                          boxShadow: keyChangeFlash ? '0 0 20px #39FF14' : 'none',
                          // ✅ v4.1.2: Show transposed key with different styling
                          background: transpose !== 0 ? '#4a3810' : '#1a3310',  // Orange tint when transposed
                          opacity: transpose !== 0 ? 0.7 : 1,  // Dimmed when transposed
                          cursor: transpose !== 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: 14
                        }}
                        title={transpose !== 0 ? `Transposed ${transpose > 0 ? '+' : ''}${transpose} semitones` : 'Click to change key'}
                      >
                        {/* ✅ v4.1.2: Show effectiveBaseKey when transposed */}
                        {transpose !== 0 ? effectiveBaseKey : baseKey}
                      </button>
                      
                      {/* Dropdown */}
                      {/* ✅ v4.1.2: Hide dropdown when transposed */}
                      {showKeyDropdown && transpose === 0 && (
                        <div ref={keyDropdownRef} style={{
                          position:'absolute',
                          top:'100%',
                          left:0,
                          marginTop:4,
                          background:'#1f2937',
                          border:'1px solid #39FF14',
                          borderRadius:6,
                          padding:4,
                          zIndex:100001,  // ✅ Above button grid (100000)
                          display:'grid',
                          gridTemplateColumns:'repeat(4, 1fr)',
                          gap:4,
                          minWidth:200
                        }}>
                          {FLAT_NAMES.map(k => (
                            <button
                              key={k}
                              onClick={() => {
                                setBaseKey(k);
                                setShowKeyDropdown(false);
                                setKeyChangeFlash(true);
                                setTimeout(() => setKeyChangeFlash(false), 300);
                              }}
                              style={{
                                padding:'6px 10px',
                                border:k === baseKey ? '2px solid #39FF14' : '1px solid #374151',
                                borderRadius:4,
                                background:k === baseKey ? '#1a3310' : '#111',
                                color:k === baseKey ? '#39FF14' : '#e5e7eb',
                                cursor:'pointer',
                                fontSize:12,
                                fontWeight:k === baseKey ? 600 : 400
                              }}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Space buttons - right aligned */}
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={goHome}         style={activeBtnStyle(!(visitorActive||relMinorActive||subdomActive), '#F2D74B')}>HOME</button>
                      <button onClick={toggleRelMinor} style={activeBtnStyle(relMinorActive, '#F0AD21')}>REL</button>
                      <button onClick={toggleSubdom}   style={activeBtnStyle(subdomActive, '#0EA5E9')}>SUB</button>
                      <button onClick={toggleVisitor}  style={activeBtnStyle(visitorActive, '#9333ea')}>PAR</button>
                    </div>
                  </div>
                  
                  {/* Keyboard - aligned to bottom */}
                  <div style={{width:'100%'}}>
                    <svg viewBox={`0 0 ${totalW} ${HW}`} className="select-none"
                        style={{display:'block', width:'100%', height:'auto', border:'1px solid #374151', borderRadius:8, background:'#0f172a'}}>
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr; 
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      // ✅ Eraser branding - no color change, just dots
                      const fillColor = "#f9fafb"; // Always white
                      
                      // Get note name - use flats for black keys
                      const noteNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
                      const noteName = noteNames[m % 12];
                      
                      return (
                        <g key={`w-${m}`}>
                          <rect x={x} y={0} width={WW} height={HW}
                                fill={fillColor} stroke="#1f2937"
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false;
                                  rightHeld.current.add(m);
                                  if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag - if mouse is down, play note
                                  if (e.buttons === 1) { // Left button held
                                    rightHeld.current.add(m);
                                    if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m);
                                  rightSus.current.delete(m);
                                  if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  const wasHeld = rightHeld.current.has(m);
                                  rightHeld.current.delete(m);
                                  rightSus.current.delete(m);
                                  // Only call detect() if this note was actually being played
                                  if (wasHeld) {
                                    if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  }
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
                      // ✅ Eraser branding - no color change on black keys
                      const fillColor = "#1f2937"; // Always dark
                      const strokeColor = "#0a0a0a";
                      
                      // Get note name - use flats
                      const noteNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
                      const noteName = noteNames[m % 12];
                      
                      return (
                        <g key={`b-${m}`}>
                          <rect x={x} y={0} width={WB} height={HB}
                                fill={fillColor} stroke={strokeColor}
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false;
                                  rightHeld.current.add(m);
                                  if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag
                                  if (e.buttons === 1) {
                                    rightHeld.current.add(m);
                                    if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m);
                                  rightSus.current.delete(m);
                                  if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  const wasHeld = rightHeld.current.has(m);
                                  rightHeld.current.delete(m);
                                  rightSus.current.delete(m);
                                  // Only call detect() if this note was actually being played
                                  if (wasHeld) {
                                    if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }
                                  }
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }} />
                        </g>
                      );
                    })}
                    
                    {/* Note labels - rendered last so they're on top */}
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr;
                      const held=disp.has(m); // MIDI notes (transposed to window)
                      const highlighted = keyboardHighlightNotes.has(m); // Preview/playback notes
                      // ✅ v3.19.55: Don't double-check latchedAbsNotes (already in highlighted or disp)
                      if (!held && !highlighted) return null;
                      
                      // ✅ Chord-aware spelling - use chord root for context
                      let noteName: string;
                      let isRoot = false;
                      
                      // ✅ Use lastDetectedChordRef (immediate) instead of centerLabel (state)
                      const chordToUse = lastDetectedChordRef.current || centerLabel;
                      
                      if (chordToUse) {
                        // Extract root from chord label (e.g. "Gmaj7" ⏺†’ "G", "C#m" ⏺†’ "C#")
                        const rootMatch = chordToUse.match(/^([A-G][b#]?)/);
                        if (rootMatch) {
                          let chordRoot = rootMatch[1];
                          // ✅ v3.19.55: Convert sharps to flats for NAME_TO_PC lookup
                          const sharpToFlat: Record<string, string> = {
                            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
                          };
                          const chordRootForLookup = sharpToFlat[chordRoot] || chordRoot;
                          
                          noteName = pcNameForKey(m % 12, chordRootForLookup as KeyName);
                          // Check if this note is the root
                          const rootPc = NAME_TO_PC[chordRootForLookup as KeyName];
                          isRoot = (m % 12) === rootPc;
                        } else {
                          // Fallback to key center
                          const currentKey = visitorActiveRef.current ? parKey 
                            : subdomActiveRef.current ? subKey 
                            : baseKeyRef.current;
                          noteName = pcNameForKey(m % 12, currentKey);
                        }
                      } else {
                        // No chord - use key center
                        const currentKey = visitorActiveRef.current ? parKey 
                          : subdomActiveRef.current ? subKey 
                          : baseKeyRef.current;
                        noteName = pcNameForKey(m % 12, currentKey);
                      }
                      
                      // ✅ Eraser branding - root is blue, others are red
                      const eraserColor = isRoot ? '#5DADE2' : '#E74C3C';
                      const randomRotation = (m * 7) % 11 - 5; // Pseudo-random -5 to +5 degrees
                      
                      return (
                        <g key={`wl-${m}`}>
                          {/* Top circle with note name label (unchanged) */}
                          <circle
                            cx={x + WW/2}
                            cy={10}
                            r={WW * 0.4}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={1}
                          />
                          <text 
                            x={x + WW/2} 
                            y={10 + WW * 0.15}
                            textAnchor="middle" 
                            fontSize={WW * 0.5}
                            fontWeight={700}
                            fill="#000000"
                            style={{pointerEvents: 'none', userSelect: 'none'}}
                          >
                            {noteName}
                          </text>
                          
                          {/* ✅ Eraser branding - WHITE KEYS: Restored working position from v4.0.48 */}
                          <rect
                            x={x + WW * 0.31}
                            y={HW * 0.56 + 25}
                            width={WW * 0.38}
                            height={WW * 0.5}
                            rx={WW * 0.08}
                            ry={WW * 0.08}
                            fill={eraserColor}
                            opacity={0.95}
                            transform={`rotate(${randomRotation}, ${x + WW/2}, ${HW * 0.68})`}
                          />
                        </g>
                      );
                    })}
                    {Object.entries(blackPos).map(([mStr,x])=>{
                      const m=+mStr;
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      // ✅ v3.19.55: Don't double-check latchedAbsNotes
                      if (!held && !highlighted) return null;
                      
                      // ✅ Chord-aware spelling - use chord root for context
                      let noteName: string;
                      let isRoot = false;
                      
                      // ✅ Use lastDetectedChordRef (immediate) instead of centerLabel (state)
                      const chordToUse = lastDetectedChordRef.current || centerLabel;
                      
                      if (chordToUse) {
                        // Extract root from chord label (e.g. "Gmaj7" ⏺†’ "G", "C#m" ⏺†’ "C#")
                        const rootMatch = chordToUse.match(/^([A-G][b#]?)/);
                        if (rootMatch) {
                          let chordRoot = rootMatch[1];
                          // ✅ v3.19.55: Convert sharps to flats for NAME_TO_PC lookup
                          const sharpToFlat: Record<string, string> = {
                            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
                          };
                          const chordRootForLookup = sharpToFlat[chordRoot] || chordRoot;
                          
                          noteName = pcNameForKey(m % 12, chordRootForLookup as KeyName);
                          // Check if this note is the root
                          const rootPc = NAME_TO_PC[chordRootForLookup as KeyName];
                          isRoot = (m % 12) === rootPc;
                        } else {
                          // Fallback to key center
                          const currentKey = visitorActiveRef.current ? parKey 
                            : subdomActiveRef.current ? subKey 
                            : baseKeyRef.current;
                          noteName = pcNameForKey(m % 12, currentKey);
                        }
                      } else {
                        // No chord - use key center
                        const currentKey = visitorActiveRef.current ? parKey 
                          : subdomActiveRef.current ? subKey 
                          : baseKeyRef.current;
                        noteName = pcNameForKey(m % 12, currentKey);
                      }
                      
                      // ✅ Eraser branding - root is blue, others are red
                      const eraserColor = isRoot ? '#5DADE2' : '#E74C3C';
                      const randomRotation = (m * 7) % 11 - 5; // Pseudo-random -5 to +5 degrees
                      
                      return (
                        <g key={`bl-${m}`}>
                          {/* Top circle with note name label (unchanged) */}
                          <circle
                            cx={x + WB/2}
                            cy={10}
                            r={WW * 0.4}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={1}
                          />
                          <text 
                            x={x + WB/2} 
                            y={10 + WW * 0.15}
                            textAnchor="middle" 
                            fontSize={WW * 0.5}
                            fontWeight={700}
                            fill="#000000"
                            style={{pointerEvents: 'none', userSelect: 'none'}}
                          >
                            {noteName}
                          </text>
                          
                          {/* ✅ Eraser branding - BLACK KEYS: Exact formula from reference file */}
                          <rect
                            x={x + WB * 0.29}
                            y={HB * 0.55 + 5}
                            width={WB * 0.42}
                            height={WB * 0.64}
                            rx={WB * 0.1}
                            ry={WB * 0.1}
                            fill={eraserColor}
                            opacity={0.95}
                            transform={`rotate(${randomRotation}, ${x + WB/2}, ${HB * 0.7 + 5})`}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                </div>
                
                {/* Guitar Tab - v4.0.48: Bigger display (1.5x scale, larger container) */}
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                    background:'#0f172a',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    minHeight: HW * 1.2 + 44,
                    maxHeight: HW * 1.2 + 44,
                    overflow:'hidden',
                    position:'relative'
                  }}>
                    <div style={{transform: 'scale(1.5)', transformOrigin: 'center'}}>
                      <GuitarTab chordLabel={currentGuitarLabel} width={totalW * 0.40} height={HW + 40}/>
                    </div>
                  </div>
              </div>
              
              
              {/* Row: Reset + MMK + Show Bonus + Transpose - v3.5.0: Reordered */}
              <div style={{marginTop: 6, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                {/* Reset - v3.5.0: Moved left, renamed "Key ⏺†»" */}
                {skillLevel === "EXPERT" && (
                  <button 
                    onClick={resetAll}
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #F2D74B', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#F2D74B', 
                      cursor:'pointer', 
                      fontSize:11
                    }}
                    title="Reset All (Ctrl+H)"
                  >
                    Reset
                  </button>
                )}
                
                {skillLevel === "EXPERT" && (
                  <button 
                    onClick={makeThisMyKey}
                    disabled={!centerLabel && rightHeld.current.size === 0}
                    style={{
                      padding:'6px 10px', 
                      border:"1px solid #F2D74B", 
                      borderRadius:6, 
                      background: (centerLabel || rightHeld.current.size > 0) ? '#332810' : '#111', 
                      color: (centerLabel || rightHeld.current.size > 0) ? "#F2D74B" : "#666",
                      cursor: (centerLabel || rightHeld.current.size > 0) ? "pointer" : "not-allowed",
                      fontSize:11,
                      fontWeight:500,
                      opacity: (centerLabel || rightHeld.current.size > 0) ? 1 : 0.5
                    }}
                    title="Make current chord your new key center (K)"
                  >
                    ⚡ Make My Key
                  </button>
                )}
                
                {/* Transpose - v4.1.2: Now works WITH @KEY directive */}
                {(skillLevel === "EXPERT" || transpose !== 0) && (() => {
                  const hasKeyDirective = loadedSongText.includes('@KEY');

                  return (
                  <div style={{position:'relative'}}>
                    <button
                      onClick={() => setShowTransposeDropdown(!showTransposeDropdown)}
                      style={{
                        padding:'6px 10px',
                        border: (transpose === 0 || transposeBypass) ? '1px solid #6B7280' : '2px solid #EF4444',
                        borderRadius:8,
                        background: (transpose === 0 || transposeBypass) ? '#111' : '#2a1010',
                        color: (transpose === 0 || transposeBypass) ? '#6B7280' : '#EF4444',
                        cursor: 'pointer',
                        fontSize:11
                      }}
                      title={transposeBypass ? "Transpose bypassed (click to edit)" : "Transpose (T)"}
                    >
                      TR {transpose > 0 ? `+${transpose}` : transpose}
                    </button>

                    {showTransposeDropdown && (
                      <div ref={transposeDropdownRef} style={{
                        position:'absolute',
                        bottom:'100%',
                        left:0,
                        marginBottom:4,
                        background:'#1f2937',
                        border: transpose !== 0 ? '1px solid #F2D74B' : '1px solid #60A5FA',
                        borderRadius:6,
                        padding:8,
                        zIndex:100001,  // ✅ Above button grid (100000)
                        display:'grid',
                        gridTemplateColumns:'repeat(13, 1fr)', // 2 rows: positive top, negative bottom
                        gridTemplateRows:'repeat(2, 1fr)',
                        gap:4
                      }}>
                        {/* Row 1: 0 to +12 */}
                        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(semitones => (
                          <button
                            key={semitones}
                            onClick={() => {
                              setTranspose(semitones);
                              setTransposeBypass(false); // Clear bypass when changing value
                              setShowTransposeDropdown(false);
                            }}
                            style={{
                              padding:'6px 8px',
                              border: transpose === semitones ? `1px solid ${transpose !== 0 ? '#F2D74B' : '#60A5FA'}` : '1px solid #374151',
                              borderRadius:4,
                              background: transpose === semitones ? (transpose !== 0 ? '#332810' : '#1e3a5f') : '#111',
                              color: transpose === semitones ? (transpose !== 0 ? '#F2D74B' : '#60A5FA') : '#9CA3AF',
                              cursor:'pointer',
                              fontSize:10,
                              fontWeight: transpose === semitones ? 600 : 400,
                              minWidth:32
                            }}
                          >
                            {semitones > 0 ? `+${semitones}` : semitones}
                          </button>
                        ))}
                        {/* Row 2: -1 to -12 */}
                        {[-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12].map(semitones => (
                          <button
                            key={semitones}
                            onClick={() => {
                              setTranspose(semitones);
                              setTransposeBypass(false); // Clear bypass when changing value
                              setShowTransposeDropdown(false);
                            }}
                            style={{
                              padding:'6px 8px',
                              border: transpose === semitones ? `1px solid ${transpose !== 0 ? '#F2D74B' : '#60A5FA'}` : '1px solid #374151',
                              borderRadius:4,
                              background: transpose === semitones ? (transpose !== 0 ? '#332810' : '#1e3a5f') : '#111',
                              color: transpose === semitones ? (transpose !== 0 ? '#F2D74B' : '#60A5FA') : '#9CA3AF',
                              cursor:'pointer',
                              fontSize:10,
                              fontWeight: transpose === semitones ? 600 : 400,
                              minWidth:32
                            }}
                          >
                            {semitones}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })()}
                
                {/* Transpose Bypass - v3.5.0: Toggle to temporarily disable */}
                {transpose !== 0 && (
                  <button 
                    onClick={() => setTransposeBypass(!transposeBypass)}
                    style={{
                      padding:'6px 10px', 
                      border: transposeBypass ? '1px solid #6B7280' : '2px solid #10B981', 
                      borderRadius:8, 
                      background: transposeBypass ? '#111' : '#1a3a2a', 
                      color: transposeBypass ? '#6B7280' : '#10B981', 
                      cursor:'pointer', 
                      fontSize:11,
                      fontWeight: transposeBypass ? 400 : 600
                    }}
                    title={transposeBypass ? "Resume transpose" : "Bypass transpose (temporary disable)"}
                  >
                    {transposeBypass ? 'TR OFF' : 'TR ON'}
                  </button>
                )}
                
                {/* Play in C - Transpose to C (capo analogy) */}
                {baseKey !== 'C' && skillLevel === "EXPERT" && (
                  <button 
                    onClick={() => {
                      // Calculate transpose needed to reach C from current key
                      const currentPc = NAME_TO_PC[baseKey] || 0;
                      const transposeAmount = currentPc === 0 ? 0 : (12 - currentPc) % 12;
                      setTranspose(transposeAmount);
                      setTransposeBypass(false); // Engage transpose
                    }}
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #60A5FA', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#60A5FA', 
                      cursor:'pointer', 
                      fontSize:11
                    }}
                    title={`Transpose to C (like a capo on fret ${NAME_TO_PC[baseKey] || 0})`}
                  >
                    🎹 Play in C
                  </button>
                )}
              </div>
              
              
              {/* Row: Transport Controls + Step Record - v3.19.55: Play button first, fixed size */}
              {skillLevel === "EXPERT" &&  (
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:6, marginBottom:8, flexWrap:'wrap'}}>
                  
                  {/* 1. Play/Stop - GREEN for ▷, RED for ⏺–  - FIRST BUTTON */}
                  <button 
                    onClick={togglePlayPause}
                    style={{
                      padding:'6px 10px',
                      border: isPlaying ? '2px solid #F97316' : '2px solid #10B981',  /* v3.19.55: Orange for stop */
                      borderRadius:8, 
                      background: isPlaying ? '#2a1e1a' : '#1a3a2a', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16,
                      fontWeight:700,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      minWidth:44  /* v3.19.55: Fixed width to prevent shift */
                    }}
                    title={isPlaying ? "Stop (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? (
                      <div style={{
                        width: 10,
                        height: 10,
                        background: '#fff',
                        borderRadius: 2
                      }} />
                    ) : '▷'}
                  </button>
                  
                  {/* 2. Go to start */}
                  <button 
                    onClick={goToStart} 
                    style={{
                      padding:'6px 10px', 
                      border:'2px solid #9CA3AF', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14
                    }} 
                    title="Go to start (Cmd+Shift+<)"
                  >
                    ⏮
                  </button>
                  
                  {/* 3. Prev chord - BLUE */}
                  <button 
                    onClick={stepPrev} 
                    style={{
                      padding:'6px 10px', 
                      border: pulsingButton === 'prev' ? '2px solid #60A5FA' : '2px solid #3B82F6',
                      borderRadius:8, 
                      background: pulsingButton === 'prev' ? '#1e3a8a' : '#111',
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700,
                      transition: 'all 0.15s ease-out',
                      boxShadow: pulsingButton === 'prev' ? '0 0 12px rgba(96, 165, 250, 0.6)' : 'none'
                    }} 
                    title="Previous chord (<)"
                  >
                    &lt;
                  </button>
                  
                  {/* 4. Next chord - BLUE */}
                  <button 
                    onClick={stepNext} 
                    style={{
                      padding:'6px 10px', 
                      border: pulsingButton === 'next' ? '2px solid #60A5FA' : '2px solid #3B82F6',
                      borderRadius:8, 
                      background: pulsingButton === 'next' ? '#1e3a8a' : '#111',
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700,
                      transition: 'all 0.15s ease-out',
                      boxShadow: pulsingButton === 'next' ? '0 0 12px rgba(96, 165, 250, 0.6)' : 'none'
                    }} 
                    title="Next chord (>)"
                  >
                    &gt;
                  </button>
                  
                  {/* 5. Prev comment - GREY */}
                  <button 
                    onClick={skipToPrevComment} 
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #6B7280', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#9CA3AF', 
                      cursor:'pointer', 
                      fontSize:12
                    }} 
                    title="Previous comment (Ctrl+⏺†)"
                  >
                    {"<<"}
                  </button>
                  
                  {/* 6. Next comment - GREY */}
                  <button 
                    onClick={skipToNextComment} 
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #6B7280', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#9CA3AF', 
                      cursor:'pointer', 
                      fontSize:12
                    }} 
                    title="Next comment (Ctrl+⏺†’)"
                  >
                    {">>"}
                  </button>
                  
                  {/* Tempo input */}
                  <input 
                    type="number"
                    min="1"
                    max="240"
                    value={tempo}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 60;
                      setTempo(Math.max(1, Math.min(240, val)));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur(); // Exit input on Enter
                      }
                    }}
                    style={{
                      width: 50,
                      padding: '6px',
                      border: '1px solid #374151',
                      borderRadius: 6,
                      background: '#0a0a0a',
                      color: '#E5E7EB',
                      fontSize: 12,
                      textAlign: 'center'
                    }}
                    title="Tempo (BPM)"
                  />
                  <span style={{fontSize: 11, color: '#9CA3AF'}}>BPM</span>
                  
                  {/* Loop button */}
                  <button 
                    onClick={() => setLoopEnabled(!loopEnabled)}
                    style={{
                      padding:'6px 10px',
                      border: loopEnabled ? '2px solid #10B981' : '2px solid #374151', 
                      borderRadius:8, 
                      background: loopEnabled ? '#1a3a2a' : '#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center'
                    }} 
                    title={loopEnabled ? "Loop enabled" : "Loop disabled"}
                  >
                    🔁
                  </button>
                  
                  {/* Step Record - v3.4.0: Moved here from MMK row */}
                  <button 
                    onClick={() => {
                      const newState = !stepRecord;
                      setStepRecord(newState);
                      stepRecordRef.current = newState;
                      // ✅ Toggle bonus wedges with step record
                      setShowBonusWedges(newState);
                    }}
                    style={{
                      padding:'6px 10px', 
                      border:`1px solid ${stepRecord ? '#ff4444' : '#374151'}`, 
                      borderRadius:6, 
                      background: stepRecord ? '#331010' : '#1f2937', 
                      color: stepRecord ? '#ff4444' : '#9CA3AF', 
                      cursor:'pointer',
                      fontSize:11,
                      fontWeight: stepRecord ? 600 : 400,
                      marginLeft:'auto'
                    }}
                    title="Toggle step record: automatically add played chords to sequencer"
                  >
                    {stepRecord ? '⏺ Recording' : '⏺ Step Record'}
                  </button>
                </div>
              )}
              
              
              {/* Row 2: Sequencer + Buttons - EXPERT ONLY */}
              {skillLevel === "EXPERT" && (
                <div style={{
                  marginBottom: 0, 
                  display:'flex', 
                  flexDirection: 'column',
                  gap:8, 
                  maxWidth:'100%',
                  position: 'relative'
                }}>
                  <textarea
                    ref={textareaRef}
                    placeholder={'Type chords, modifiers, and comments...\nExamples:\n@TITLE Sequence Name, @KEY C\nC, Am7, F, G7\n@SUB F, Bb, C7, @HOME\n@REL Em, Am, @PAR Cm, Fm\n@KEY G, D, G, C\n(Verse: lyrics or theory note)'}
                    rows={3}
                    value={inputText}
                    onChange={(e)=>setInputText(e.target.value)}
                    onKeyDown={handleInputKeyNav}
                    style={{
                      width: '100%',
                      padding:'8px 10px',
                      border:'1px solid #374151',
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderRadius:8,
                      fontFamily:'ui-sans-serif, system-ui',
                      resize:'vertical',
                      minHeight: 72, // ✅ Minimum 3 rows
                      maxHeight: 240, // ✅ Reduced max to keep buttons visible
                      fontSize: isDesktop ? 12 : 16,
                      lineHeight: '1.5',
                      userSelect: 'text',
                      overflow: 'auto' // ✅ Scroll if content exceeds maxHeight
                    }}
                  />
                  
                  {/* ✅ Single row button layout - Ready, Clear, Load, Share */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 120px)',
                    gridTemplateRows: '40px',
                    gap: 8,
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 100000
                  }}>
                    {/* Top Left: Enter Button */}
                    <button
                      onClick={() => parseAndLoadSequence()}
                      style={{
                        padding:'8px 12px',
                        border: inputText !== loadedSongText ? '2px solid #EF4444' : '2px solid #39FF14',
                        borderRadius:8,
                        background: inputText !== loadedSongText ? '#2a1a1a' : '#1a3310',
                        color: inputText !== loadedSongText ? '#EF4444' : '#39FF14',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title={inputText !== loadedSongText ? "Load changes (Enter)" : "Sequence loaded"}
                    >
                      <span style={{fontSize:18, lineHeight:1}}>⏎</span>
                      <span>{inputText !== loadedSongText ? 'ENTER' : 'READY'}</span>
                    </button>
                    
                    {/* Top Right: Load Button */}
                    <div style={{position:'relative'}}>
                      <button 
                        onClick={() => setShowSongMenu(!showSongMenu)}
                        style={{
                          width: '100%',
                          padding:'8px 12px',
                          border:'2px solid #60A5FA',
                          borderRadius:8,
                          background:'#111',
                          color:'#60A5FA',
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap: 8,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                        title="Load saved songs"
                      >
                        <span style={{fontSize:18}}>📁</span>
                        <span>LOAD</span>
                      </button>
                    
                      {/* Load Menu Dropdown - Calculate position dynamically */}
                      {showSongMenu && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: 4,
                        background: '#1a1a1a',
                        border: '2px solid #60A5FA',
                        borderRadius: 8,
                        padding: 8,
                        zIndex: 99999,
                        minWidth: 250,
                        maxHeight: 400,
                        overflowY: 'auto'
                      }}>
                        <div style={{fontSize:12, fontWeight:600, color:'#60A5FA', marginBottom:8, paddingBottom:8, borderBottom:'1px solid #374151'}}>
                          SONG MENU
                        </div>
                        
                        {/* Demo Songs */}
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:10, color:'#9CA3AF', marginBottom:4, textTransform:'uppercase'}}>Demo Songs</div>
                          {demoSongs.map((song, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLoadDemoSong(song.content, song.bannerMessage)}
                              style={{
                                width:'100%',
                                padding: '6px 8px',
                                border: 'none',
                                background: 'transparent',
                                color: '#e5e7eb',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: 4,
                                fontSize: 11,
                                marginBottom:2
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {song.title}
                            </button>
                          ))}
                        </div>
                        
                        {/* Import/Export */}
                        <div style={{borderTop:'1px solid #374151', paddingTop:8}}>
                          <div style={{fontSize:10, color:'#9CA3AF', marginBottom:4, textTransform:'uppercase'}}>Import / Export</div>
                          
                          {/* Import */}
                          <label style={{
                            width:'100%',
                            padding: '6px 8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#e5e7eb',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 4,
                            fontSize: 11,
                            display:'block',
                            marginBottom:2
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            ðŸ“‚ Import from file...
                            <input 
                              type="file" 
                              accept=".txt,.md" 
                              onChange={handleImportSong}
                              style={{display:'none'}}
                            />
                          </label>
                          
                          {/* Export */}
                          <button
                            onClick={handleExportSong}
                            style={{
                              width:'100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#e5e7eb',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: 4,
                              fontSize: 11,
                              marginBottom:2
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            ðŸ’¾ Export to file...
                          </button>
                          
                          {/* Share URL */}
                          <button
                            onClick={handleGenerateShareURL}
                            style={{
                              width:'100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#e5e7eb',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: 4,
                              fontSize: 11
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            ðŸ”— Copy share link
                          </button>
                          
                          {shareURL && (
                            <div style={{
                              marginTop:8,
                              padding:6,
                              background:'#0f172a',
                              borderRadius:4,
                              fontSize:9,
                              color:'#10B981',
                              wordBreak:'break-all'
                            }}>
                              ✅ Link copied to clipboard!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                    
                    {/* Bottom Left: Clear Button */}
                    <button
                      onClick={() => {
                        setInputText('');
                        setLoadedSongText('');
                        setSequence([]);
                        setSeqIndex(0);
                        setDisplayIndex(0);
                      }}
                      style={{
                        padding:'8px 12px',
                        border:'2px solid #9CA3AF',
                        borderRadius:8,
                        background:'#1a1a1a',
                        color:'#9CA3AF',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title="Clear editor"
                    >
                      <span style={{fontSize:18}}>✕</span>
                      <span>CLEAR</span>
                    </button>
                    
                    {/* Bottom Right: Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      style={{
                        padding:'8px 12px',
                        border: `2px solid ${showShareCopied ? '#39FF14' : '#60A5FA'}`,
                        borderRadius:8,
                        background: showShareCopied ? '#1a3310' : '#111',
                        color: showShareCopied ? '#39FF14' : '#60A5FA',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title="Share this song"
                    >
                      <span style={{fontSize:18}}>{showShareCopied ? '✅' : '✉️'}</span>
                      <span>{showShareCopied ? 'SENT' : 'SHARE'}</span>
                    </button>
                  </div>
                </div>
              )}
              <div style={{marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151'}}>
                
                {/* Row 1: Performance Mode */}
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                  
                  {/* ✅ v3.19.55: Play/Stop button in non-EXPERT modes (when sequence loaded) */}
                  {skillLevel !== "EXPERT" && sequence.length > 0 && (
                    <button 
                      onClick={togglePlayPause}
                      style={{
                        padding:'8px 12px',
                        border: isPlaying ? '2px solid #F97316' : '2px solid #10B981',  /* v3.19.55: Orange for stop */
                        borderRadius:6, 
                        background: isPlaying ? '#2a1e1a' : '#1a3a2a', 
                        color:'#fff', 
                        cursor:'pointer', 
                        fontSize:14,
                        fontWeight:700,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        lineHeight: 1,
                        minWidth:48  /* v3.19.55: Fixed width to prevent shift */
                      }}
                      title={isPlaying ? "Stop (Space)" : "Play (Space)"}
                    >
                      {isPlaying ? (
                        <div style={{
                          width: 9,
                          height: 9,
                          background: '#fff',
                          borderRadius: 2
                        }} />
                      ) : '▷'}
                    </button>
                  )}
                  
                  {/* ✅ Performance Pad toggle button - always visible */}
                  <button
                    onClick={() => setPerformanceMode(!performanceMode)}
                    title={performanceMode ? "Close Performance Pad" : "Open Performance Pad - Use keyboard 1-0,-,= to trigger chords"}
                    style={{
                      padding:"8px 12px", 
                      border: performanceMode ? '2px solid #F2D74B' : '1px solid #4B5563',
                      borderRadius:6, 
                      background: performanceMode ? '#332810' : '#1F2937',
                      color: performanceMode ? '#F2D74B' : '#D1D5DB',
                      cursor: 'pointer',
                      fontSize:11,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: performanceMode ? 600 : 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!performanceMode) {
                        e.currentTarget.style.background = '#374151';
                        e.currentTarget.style.borderColor = '#6B7280';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!performanceMode) {
                        e.currentTarget.style.background = '#1F2937';
                        e.currentTarget.style.borderColor = '#4B5563';
                      }
                    }}
                  >
                    <span style={{fontSize:14}}>🎹</span>
                    <span>Performance Pad</span>
                    <span style={{fontSize:10, opacity:0.6}}>{performanceMode ? '▼' : '▶'}</span>
                  </button>
                  
                  {/* ✅ v3.19.55: Custom skill dropdown with icon */}
                  <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <select
                      value={skillLevel}
                      onChange={(e) => {
                        const newLevel = e.target.value as SkillLevel;
                        setSkillLevel(newLevel);
                        skillLevelRef.current = newLevel;
                      }}
                      style={{
                        padding:'8px 12px 8px 40px', // Extra left padding for icon
                        border:'1px solid #4B5563',
                        borderRadius:6,
                        background:'#1F2937',
                        color:'#D1D5DB',
                        cursor:'pointer',
                        fontSize:11,
                        fontWeight:500,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%239CA3AF\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        paddingRight: '28px'
                      }}
                      title="Select skill level"
                    >
                      <option value="ROOKIE">Rookie</option>
                      <option value="NOVICE">Novice</option>
                      <option value="SOPHOMORE">Sophomore</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    {/* Icon overlay */}
                    <img 
                      src={`/assets/${skillLevel.toLowerCase()}.png`}
                      alt={skillLevel}
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 24,
                        height: 24,
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Performance Pad expanded content */}
                  {performanceMode && (
                    /* OPEN STATE - Yellow border, TWO ROWS: number pads + rhythm controls */
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 6,
                      padding: '6px 8px',
                      border: '2px solid #F2D74B',
                      borderRadius: 6,
                      background: '#332810',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      {/* ROW 1: Number pads */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      
                      {[
                        { key: '1', fn: 'I', color: FN_COLORS['I'] },
                        { key: '2', fn: 'ii', color: FN_COLORS['ii'] },
                        { key: '3', fn: 'V/V', color: FN_COLORS['V/V'] },
                        { key: '4', fn: 'iii', color: FN_COLORS['iii'] },
                        { key: '5', fn: 'V/vi', color: FN_COLORS['V/vi'] },
                        { key: '6', fn: 'iv', color: FN_COLORS['iv'] },
                        { key: '7', fn: 'IV', color: FN_COLORS['IV'] },
                        { key: '8', fn: 'V', color: FN_COLORS['V'] },
                        { key: '9', fn: 'V/ii', color: FN_COLORS['iv'] },
                        { key: '0', fn: 'vi', color: FN_COLORS['vi'] },
                        { key: '-', fn: 'Bm7♭5', color: '#0EA5E9' },
                        { key: '=', fn: '♭VII', color: FN_COLORS['♭VII'] }
                      ].map(({ key, fn, color }) => {
                        // Use flash state for momentary highlight (500ms)
                        const isFlashing = performanceFlashKey === key;
                        return (
                          <div 
                            key={key} 
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const with7th = e.shiftKey;
                              // Clear any existing timeout
                              if (performanceFlashTimeoutRef.current) {
                                clearTimeout(performanceFlashTimeoutRef.current);
                              }
                              // Flash this key
                              setPerformanceFlashKey(key);
                              
                              // Play the chord
                              previewFn(fn as Fn, with7th);
                              
                              // ✅ Explicitly start rhythm for iOS/mobile
                              if (rhythmEnabledRef.current && latchedAbsNotesRef.current.length > 0) {
                                setTimeout(() => {
                                  if (latchedAbsNotesRef.current.length > 0) {
                                    startRhythmLoop(latchedAbsNotesRef.current, 0);
                                  }
                                }, 50);
                              }
                            }}
                            onPointerUp={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // Stop flashing
                              setPerformanceFlashKey('');
                              // Clear piano highlights
                              setLatchedAbsNotes([]);
                            }}
                            onPointerLeave={(e) => {
                              // Also clear if pointer leaves button while held
                              setPerformanceFlashKey('');
                              setLatchedAbsNotes([]);
                            }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px 3px',
                              borderRadius: 3,
                              background: isFlashing ? color : '#1a1a1a',
                              border: `1px solid ${isFlashing ? color : '#2a2a2a'}`,
                              width: 28,
                              height: 34,
                              flex: '0 0 auto',
                              transition: 'all 0.1s',
                              opacity: isFlashing ? 1 : 0.7,
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            title={`${fn} - Click for triad, Shift+Click for 7th`}
                          >
                            <div style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: isFlashing ? '#000' : color,
                              fontFamily: 'monospace',
                              lineHeight: 1
                            }}>{key}</div>
                            <div style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: isFlashing ? '#000' : '#888',
                              marginTop: 2,
                              lineHeight: 1,
                              whiteSpace: 'nowrap'
                            }}>
                              {fn}
                            </div>
                            {/* ✅ Show 7th type below function when shift held */}
                            {shiftHeld && (
                              <div style={{
                                fontSize: 7,
                                fontWeight: 500,
                                color: isFlashing ? '#000' : color,
                                marginTop: 1,
                                lineHeight: 1,
                                opacity: 0.8
                              }}>
                                {(() => {
                                  const chordType = {
                                    'I': 'M7', 'IV': 'M7',  // Major 7th
                                    'ii': 'm7', 'iii': 'm7', 'vi': 'm7', 'iv': 'm7',  // Minor 7th
                                    'V': '7', 'V7': '7', 'V/V': '7', 'V/vi': '7', 'V/ii': '7',  // Dominant 7th
                                    '♭VII': '7',
                                    'Bm7♭5': 'Ã¸7'  // Half-diminished
                                  }[fn] || '7';
                                  return chordType;
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                      
                      {/* ROW 2: Rhythm controls */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
                        {/* Rhythm ON/OFF toggle - first on left */}
                        <button
                          onClick={() => {
                            const newState = !rhythmEnabled;
                            setRhythmEnabled(newState);
                            if (!newState && rhythmLoopIntervalRef.current !== null) {
                              stopRhythmLoop();
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            border: `2px solid ${rhythmEnabled ? '#39FF14' : '#666'}`,
                            borderRadius: 4,
                            background: rhythmEnabled ? '#1a3310' : '#1a1a1a',
                            color: rhythmEnabled ? '#39FF14' : '#888',
                            cursor: 'pointer',
                            fontSize: 10,
                            fontWeight: 700,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 45,
                            transition: 'all 0.2s'
                          }}
                          title="Toggle rhythm on/off (O key)"
                        >
                          <div style={{ fontSize: 14, marginBottom: 2 }}>
                            {rhythmEnabled ? '▶' : '⏺¸'}
                          </div>
                          <div style={{ fontSize: 8 }}>
                            {rhythmEnabled ? 'ON' : 'OFF'}
                          </div>
                        </button>
                        
                        {/* Pattern buttons with previews */}
                        {[
                          { num: 1, pattern: rhythmPattern1 },
                          { num: 2, pattern: rhythmPattern2 },
                          { num: 3, pattern: rhythmPattern3 }
                        ].map(({ num, pattern }) => {
                          const display = rhythmPatternToDisplay(pattern);
                          const isActive = activeRhythmPattern === num;
                          const hasPattern = pattern.length > 0;
                          return (
                            <button
                              key={num}
                              onClick={() => {
                                setActiveRhythmPattern(num as 1 | 2 | 3);
                                // Restart rhythm with new pattern if currently playing
                                if (rhythmLoopIntervalRef.current !== null && latchedAbsNotes.length > 0) {
                                  let offsetMs = 0;
                                  if (rhythmStartTimeRef.current !== null && rhythmPatternDurationRef.current > 0) {
                                    const elapsed = performance.now() - rhythmStartTimeRef.current;
                                    offsetMs = elapsed % rhythmPatternDurationRef.current;
                                  }
                                  setTimeout(() => startRhythmLoop(latchedAbsNotes, offsetMs), 10);
                                }
                              }}
                              style={{
                                padding: '4px 8px',
                                border: `2px solid ${isActive ? '#F2D74B' : (hasPattern ? '#4B5563' : '#333')}`,
                                borderRadius: 4,
                                background: isActive ? '#332810' : '#1a1a1a',
                                color: isActive ? '#F2D74B' : (hasPattern ? '#D1D5DB' : '#555'),
                                cursor: hasPattern ? 'pointer' : 'default',
                                fontSize: 9,
                                fontWeight: 600,
                                flex: 1,
                                fontFamily: 'monospace',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                opacity: hasPattern ? 1 : 0.4,
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={hasPattern ? `Pattern ${num}: ${display}` : `Pattern ${num}: Not loaded`}
                              disabled={!hasPattern}
                            >
                              <div style={{ fontSize: 8, opacity: 0.7 }}>PAT {num}</div>
                              <div style={{ fontSize: 10 }}>{display}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Row 2: Audio + MIDI + Help */}
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                  {/* Audio button */}
                  <button 
                    onClick={async () => {
                      const newState = !audioEnabled;
                      setAudioEnabled(newState);
                      audioEnabledRef.current = newState;
                      
                      if (newState) {
                        const ctx = initAudioContext();
                        if (ctx.state === 'suspended') {
                          await ctx.resume();
                        }
                        // ✅ Play silent note to fully unlock iOS audio in iframe
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.001; // Nearly silent
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.01);
                        
                        setTimeout(() => {
                          setAudioReady(true);
                          setAudioInitialized(true);
                        }, 100);
                      } else {
                        setAudioReady(false);
                      }
                    }}
                    title={audioEnabled ? "Audio enabled - click to mute" : "Click to enable audio"}
                    style={{
                      padding:"4px 8px", 
                      border:`1px solid ${audioEnabled ? '#39FF14' : '#374151'}`, 
                      borderRadius:6, 
                      background: audioEnabled ? '#1a3310' : '#111', 
                      color: audioEnabled ? '#39FF14' : '#9CA3AF',
                      cursor: 'pointer',
                      fontSize:14
                    }}
                  >
                    {audioEnabled ? (audioReady ? '🔊' : '⏳') : '🔇'}
                  </button>

                  {MIDI_SUPPORTED && (
                    <>
                      {/* MIDI Input */}
                      <span style={{fontSize:11, color:'#9CA3AF', marginLeft:4}}>IN:</span>
                      <select value={selectedId} onChange={(e)=>{ 
                        if (!midiSupported && e.target.value) {
                          setShowMidiWarning(true);
                          setTimeout(() => setShowMidiWarning(false), 5000);
                          return;
                        }
                        const acc=midiAccessRef.current; 
                        if(acc) bindToInput(e.target.value, acc); 
                      }}
                        style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}>
                        {inputs.length===0 && <option value="">None</option>}
                        {inputs.map((i:any)=>(<option key={i.id} value={i.id}>{i.name || `Input ${i.id}`}</option>))}
                      </select>
                      
                      {/* MIDI Output */}
                      <span style={{fontSize:11, color:'#9CA3AF', marginLeft:8}}>OUT:</span>
                      <select 
                        value={midiOutputEnabled ? selectedOutputId : ""} 
                        onChange={(e)=>{ 
                          if (!midiSupported && e.target.value) {
                            setShowMidiWarning(true);
                            setTimeout(() => setShowMidiWarning(false), 5000);
                            return;
                          }
                          const acc=midiAccessRef.current;
                          if(acc) {
                            if (e.target.value === "") {
                              setMidiOutputEnabled(false);
                              midiOutputRef.current = null;
                            } else {
                              const output = acc.outputs.get(e.target.value);
                              if(output) {
                                setSelectedOutputId(e.target.value);
                                midiOutputRef.current = output;
                                setMidiOutputEnabled(true);
                              }
                            }
                          }
                        }}
                        style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}>
                        <option value="">None</option>
                        {outputs.map((o:any)=>(<option key={o.id} value={o.id}>{o.name || `Output ${o.id}`}</option>))}
                      </select>
                    </>
                  )}
                  
                  {/* ✅ MIDI unsupported browser warning */}
                  {showMidiWarning && !midiSupported && (
                    <div style={{
                      position: 'absolute',
                      top: 50,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#DC2626',
                      border: '2px solid #EF4444',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#FFF',
                      fontSize: 12,
                      fontWeight: 600,
                      zIndex: 99999,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      maxWidth: 300,
                      textAlign: 'center'
                    }}>
                      {isSafari 
                        ? 'ðŸš« Safari doesn\'t support MIDI. Use Chrome or Edge for MIDI features.'
                        : 'ðŸš« MIDI not supported in this browser. Use Chrome, Edge, or Firefox.'}
                    </div>
                  )}
                  
                  {/* Spacer */}
                  <div style={{flex:1}} />
                  
                  {/* ✅ Allow Bonus Chords - always visible, auto-lit in perf mode */}
                  {bonusWedgesAllowed && (
                    <button 
                      onClick={() => !performanceMode && setShowBonusWedges(!showBonusWedges)}
                      title={performanceMode
                        ? "Bonus enabled (auto-on in Performance Mode)"
                        : (skillLevel === "EXPERT" 
                          ? "Reveal bonus wedges persistently for teaching" 
                          : "Allow bonus wedges to trigger dynamically")}
                      style={{
                        padding:'4px 8px', 
                        border:`1px solid ${(showBonusWedges || performanceMode) ? '#39FF14' : '#374151'}`, 
                        borderRadius:6, 
                        background: (showBonusWedges || performanceMode) ? '#1a3310' : '#111', 
                        color: (showBonusWedges || performanceMode) ? '#39FF14' : '#9CA3AF', 
                        cursor: performanceMode ? 'default' : 'pointer',
                        fontSize:11,
                        fontWeight: (showBonusWedges || performanceMode) ? 600 : 400,
                        opacity: performanceMode ? 0.7 : 1
                      }}
                    >
                      {skillLevel === "EXPERT" 
                        ? ((showBonusWedges || performanceMode) ? '✅ Reveal Bonus' : 'Reveal Bonus')
                        : ((showBonusWedges || performanceMode) ? '✅ Allow Bonus' : 'Allow Bonus')
                      }
                    </button>
                  )}
                  
                  {/* Help button */}
                  <button onClick={()=>setShowHelp(true)}
                    style={{padding:"4px 8px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#9CA3AF", cursor:"pointer", fontSize:14}}>
                    ?
                  </button>
                </div>
                
                {/* Old controls removed - replaced above */}
                <div style={{display:'none'}}>

                  
                  {/* Right: Status + Help */}
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span style={{
                      fontSize:11,
                      padding:'2px 6px',
                      border: `2px solid ${visitorActive ? '#9333ea' : relMinorActive ? '#F0AD21' : subdomActive ? '#0EA5E9' : (visitorActive || relMinorActive || subdomActive) ? '#F2D74B' : '#6b7280'}`,
                      background:'#ffffff18',
                      borderRadius:6
                    }}>
                      {visitorActive ? `space: Parallel (${parKey})`
                        : relMinorActive ? 'space: Relative minor (Am)'
                        : subdomActive ? `space: Subdominant (${subKey})`
                        : (midiConnected ? `MIDI: ${midiName||'Connected'}` : 'MIDI: none')}
                    </span>
                    
                    {/* Help Button */}
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        border: `2px solid ${showHelp ? '#39FF14' : '#374151'}`,
                        borderRadius: '50%',
                        background: showHelp ? '#1a3310' : '#0a0a0a',
                        color: showHelp ? '#39FF14' : '#9CA3AF',
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title="Help & Keyboard Shortcuts"
                    >
                      ?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
      
      {/* Help Callouts */}
      
      {/* Help Overlay */}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}


// EOF - HarmonyWheel.tsx v4.1.9