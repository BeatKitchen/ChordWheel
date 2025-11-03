/*
 * HarmonyWheel.tsx — v3.5.0 🎹 FULL TRANSPOSE IMPLEMENTATION
 * 
 * 🎯 v3.5.0 MAJOR FEATURE - TRUE KEY TRANSPOSE:
 * - Transpose now shifts EVERYTHING (like a capo):
 *   • MIDI input transposed (C key → D with +2)
 *   • Hub displays transposed chords (shows D, not C)
 *   • Wedges light for transposed chords
 *   • Base key shifts (C → D with +2)
 *   • Sequencer chords transposed
 *   • Works WITH @KEY (adds/subtracts from specified key)
 * 
 * - Added Bypass Toggle (🔇/🔊):
 *   • Temporarily disable transpose without resetting value
 *   • Perfect for A/B comparison
 *   • Resume exactly where you left off
 * 
 * - Removed double-transpose bugs:
 *   • Notes already transposed at input, don't re-transpose at playback
 *   • Fixed stepNext, togglePlayPause, playback effect
 * 
 * - @KEY directive support:
 *   • No longer disables transpose
 *   • Transpose adds to @KEY value
 *   • Example: @KEY F + transpose +2 = key becomes G
 * 
 * 🎹 v3.5.0 TRANSPOSE IMPLEMENTATION:
 * - Transpose UI fully functional (was already mostly working)
 * - @KEY directive disables transpose (grays out button with ⚠)
 * - Keyboard shortcuts: T toggles dropdown, Shift+↑/↓ adjusts semitones
 * - Transpose affects playback only, not detection (correct behavior)
 * - Active transpose shows RED border, inactive shows BLUE
 * - Works with all sequence features (step record, comments, modifiers)
 * 
 * 🐛 v3.5.0 HOTFIX:
 * - Fixed A triad triggering wrong wedge (was vi, now correctly V/ii bonus)
 * - Bonus wedge label stays "A7" (functional), center shows "A" or "A7" (actual)
 * - Reverted audio context changes (was working fine before)
 * 
 * 🔊 v3.5.0 AUDIO + BONUS WEDGE FIXES:
 * - Fixed A/A7 bonus wedge (V/ii) - now shows "A" for triad, "A7" for seventh
 * - Fixed audio context resume - now properly awaits resume promise
 * - Audio should work on first MIDI input without needing speaker toggle
 * 
 * 🎯 v3.5.0 CRITICAL FIX - G TRIAD vs G7:
 * - Fixed all triads being labeled as 7th chords (G→G7, D→D7, E→E7, etc.)
 * - Root cause: realizeFunction("V7") always returned "G7" even for triads
 * - Solution: Use absName from theory.ts (which correctly detects "G" vs "G7")
 * - Applied fix to both HOME and PAR space detection
 * - Preserves functional triggering (G triad still triggers V7 wedge correctly)
 * - But now displays correct chord name in hub/notation/step record
 * 
 * 🐛 v3.4.3 BUG FIXES:
 * - Restored loop button (🔁)
 * - Restored comment navigation buttons (<< >>)
 * - Fixed Play button (was ▶️, now shows ▷ and ■)
 * - Fixed Prev/Next buttons (were emoji, now < >)
 * - Fixed Play colors (green when stopped, red when playing)
 * - Added flexWrap to transport row
 *
 * 
 * 🔧 v3.4.3 FIXES:
 * - Transpose/Reset only visible in EXPERT mode (or if transpose non-zero)
 * - Fixed double-reset issue: now fully resets spaces in one click
 * - Added subHasSpunRef, recentRelMapRef clearing to resetAll
 * 
 * 🔧 v3.4.3 FIXES:
 * - Transpose always visible if non-zero, turns yellow when active
 * - Transpose dropdown now horizontal (13 columns instead of 5 rows)
 * - Reset button doesn't trigger HOME wedge anymore
 * - Removed marginLeft:auto from Reset (better positioning)
 * 
 * 🎨 v3.4.3 MAJOR LAYOUT REORGANIZATION:
 * - Sequencer moved below keyboard
 * - Transport controls above sequencer (with Step Record)
 * - MMK + Show Bonus + Transpose + Reset combined in one row
 * - Transpose and Reset moved up from bottom
 * - Step Record moved down with transport
 * - Reset button changed to yellow
 * - Song display always visible, shows message when not EXPERT
 * - Enter button text changed to "APPLY"
 */
/*
 * HarmonyWheel.tsx — v3.4.3
 * 
 * 🔴 v3.4.3 ENTER BUTTON TEXT:
 * - Red Enter button now shows "LOAD" text below icon
 * - Only appears when there are unsaved changes
 * - Makes it obvious when changes need loading
 * 
 * 🔄 v3.3.4 BUTTON SWAP:
 * - Enter button (⏎) now immediately right of textarea
 * - Library button (📁) moved after Enter
 * - Better visual flow: edit → load → library
 * 
 * 🎨 v3.3.3 VISUAL TWEAK:
 * - Non-current sequence items now display in grey (#9CA3AF) for better focus
 * - Current item stays bright green (#39FF14)
 * - Comments even dimmer (#6b7280)
 * 
 * 🛑 v3.3.2 STEP RECORD EXIT:
 * - Step record mode now exits automatically when:
 *   • Transport buttons pressed (<<, <, >, play/pause, stop)
 *   • Enter key pressed to load sequence
 * - Prevents loop recording situation
 * - setStepRecord(false) + stepRecordRef.current = false in all transport handlers
 * 
 * 📝 v3.3.1 TERMINOLOGY UPDATES:
 * - "Auto Record" → "Step Record" (everywhere)
 * - "Song/Playlist/Editor" → "Sequencer" (in UI text)
 * - Variable names updated: autoRecord → stepRecord, autoRecordRef → stepRecordRef
 * - Placeholder text: "Song Name" → "Sequence Name"
 * - Menu tooltips and comments updated
 * 
 * 🎨 v3.3.0 SKILL SELECTOR UI:
 * - Simplified horizontal skill selector (removed complex radial wheel)
 * - Square borders instead of circles
 * - Selected skill shown in bright color
 * - Larger icons (40px, up from 36px)
 * - Expert mode shows "EXPERT\n(all functions)"
 * - Better readability and consistency
 * 
 * 💬 v3.2.7 COMMENTS PAUSE:
 * - Comments now pause when you press > (don't auto-skip)
 * - Allows visual section breaks in sequences
 * - "# B Section" will pause, then next > plays the chord
 * - Combined still works: "# Section: Chord" plays immediately
 * 
 * 🔧 v3.2.6 PARSER FIX:
 * - Improved comment+chord regex to handle m7b5, b5, #5, etc.
 * - Reminder: Use colon not comma: "# B Section: Bm7b5" ✅
 * - Not comma: "# B Section, Bm7b5" ❌ (splits into separate tokens)
 * 
 * 🎯 v3.2.5 QUALITY OF LIFE:
 * - Forgiving parser: @HOME: F (space after colon) now works
 * - Combined comments: # Verse: Am plays Am after displaying "Verse"
 * - Combined KEY: @KEY: B F#m changes key to B and plays F#m
 * - Don't auto-play first chord on load or "Go to Start"
 * - Better textarea click targets (explicit line-height)
 * - 📌 TODO: Add Help button to overlay with full documentation
 * 
 * 🎯 v3.2.4 COMBINED MODIFIERS:
 * - Can now combine space switches with chords in one token!
 * - Examples: @HOME:F, @SUB:Gm7, HOME:C, SUB F (space or colon)
 * - No more rhythm-breaking double clicks!
 * - Usage: F, F, C, C, G, G, C, C7, @HOME:F, F, C, C, G, G7, C, C
 * 
 * ⏮️ v3.2.3 REVERT:
 * - Reverted v3.2.2 change (C triad no longer auto-exits SUB)
 * - Original MIDI logic is correct and carefully tuned
 * - Use manual @HOME modifier in sequencer for edge cases
 * - Example: F, F, C, C, G, G, C, C7, @HOME, F, F, C, C, G, G7, C, C
 * 
 * 🏠 v3.2.2 SUB EXIT FIX (REVERTED):
 * - Plain C triad now exits SUB space when latched (returns HOME)
 * - Allows C7 → F → C progression to work correctly in sequencer
 * - C7 enters SUB, F stays in SUB, plain C returns to HOME
 * 
 * 🔊 v3.2.1 AUDIO FIX:
 * - Restored audio playback in sequencer (was removed in v3.2.0)
 * - Now detect() handles detection AND we play the audio
 * 
 * 🎯 v3.2.0 MAJOR REFACTOR:
 * - Sequencer now uses IDENTICAL detection logic as MIDI input!
 * - applySeqItem() simulates MIDI state and calls detect()
 * - Single source of truth for all chord detection
 * - G chord now lights V wedge in sequencer ✅
 * - C7 activates SUB space in sequencer ✅
 * - All MIDI rules (SUB/PAR/REL activation, bonus chords) now work in sequencer!
 * 
 * 🔧 v3.1.4 CRASH FIX:
 * - FIXED: Crash when playing plain V chord (preview module doesn't know about V yet)
 * - Added fallback to CHORD_DEFINITIONS when preview.chordPcsForFn returns undefined
 * - G chord now plays AND lights V wedge without crashing!
 * 
 * 🔥 v3.1.3 CRITICAL FIX:
 * - FIXED: G triad now lights V wedge (was only lighting for G7)
 * - Restored single source of truth - sequencer now matches MIDI behavior
 * - G (V triad) now correctly returns "V" function instead of null
 * 
 * ✅ v3.1.2 BUG FIX:
 * - FIXED: G chord now plays correct notes (G-B-D instead of C-E-G)
 * - Added latchedAbsNotesRef to bypass React state timing issue
 * - stepNext now uses ref for synchronous note access
 * 
 * 🔧 v3.1.1 DEBUG/FIX:
 * - Added comprehensive console logging for stepNext flow
 * - Added displayIndex separate from seqIndex for proper sync
 * - Fixed G chord fallback parser (added logging)
 * - Investigating why first G plays C-E-G instead of G-B-D
 * 
 * 🎉 v3.1.0 NEW FEATURES:
 * - ✅ Help overlay system with keyboard shortcuts and UI tips
 * - ✅ Audio initialization splash (Web Audio API compliance)
 * - ✅ Version display in status bar
 * 
 * PREVIOUS CHANGES (v2.45.0):
 * - **THE CRITICAL FIX:** pcsRel now relative to baseKey, not C!
 * - Changed: `toRel = (n) => ((n - NAME_TO_PC["C"] + 12) % 12)`
 * - To: `toRel = (n) => ((n - NAME_TO_PC[baseKeyRef.current] + 12) % 12)`
 * 
 * THIS MAKES:
 * - ✅ All isSubset() checks work in any key
 * - ✅ Play E major chords, see E major functions
 * - ✅ Play Ab major chords, see Ab major functions  
 * - ✅ Bonus chords (Bdim, Bm7♭5, A7) transpose correctly
 * - ✅ SUB entry works in any key (ii of IV)
 * - ✅ PAR entry works in any key (vi of ♭VI)
 * - ✅ ALL hardcoded checks now relative!
 * 
 * MODIFIED BY: Claude AI for Nathan Rosenberg / Beat Kitchen
 * DATE: November 1, 2025
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
import { defaultSong, demoSongs } from "./data/demoSongs";
import { 
  generateShareableURL, 
  getSongFromURL, 
  exportSongToFile, 
  importSongFromFile,
  copyToClipboard,
  parseSongMetadata
} from "./lib/songManager";

const HW_VERSION = 'v3.5.0';
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
  
  // Skill level system
  type SkillLevel = "ROOKIE" | "NOVICE" | "SOPHOMORE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("ADVANCED");
  
  // Define which functions are visible at each level (cumulative)
  const SKILL_LEVEL_FUNCTIONS: Record<SkillLevel, Fn[]> = {
    "ROOKIE": ["I", "IV", "V7"],  // 3 chords
    "NOVICE": ["I", "IV", "V7", "vi"],  // 4 chords - add relative minor
    "SOPHOMORE": ["I", "IV", "V7", "vi", "V/V", "V/vi"],  // 6 chords - add secondary dominants
    "INTERMEDIATE": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"],  // 10 chords - full
    "ADVANCED": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"],  // Same as INTERMEDIATE
    "EXPERT": ["I", "IV", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"]  // Same + bonus wedges enabled
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
  const lastDetectedChordRef = useRef<string>("C"); // From theory.ts - pure MIDI detection

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
  const [audioReady, setAudioReady] = useState(true); // Start ready since audio enabled by default
  
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
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showTransposeDropdown, setShowTransposeDropdown] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [shareURL, setShareURL] = useState<string>('');
  const [keyChangeFlash, setKeyChangeFlash] = useState(false);
  const [stepRecord, setStepRecord] = useState(false); // v3.3.1: Renamed from autoRecord
  const stepRecordRef = useRef(false); // v3.3.1: Renamed from stepRecordRef
  
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
  const latchedAbsNotesRef = useRef<number[]>([]); // Synchronous mirror for immediate playback
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
          // v3.5.0: Apply transpose to MIDI input
          const transposedNote = d1 + effectiveTranspose;
          console.log('🎹 MIDI INPUT:', {
            originalNote: d1,
            transpose: effectiveTranspose,
            transposedNote,
            noteName: `${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][d1 % 12]} → ${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][transposedNote % 12]}`
          });
          rightHeld.current.add(transposedNote);
          if (sustainOn.current) rightSus.current.add(transposedNote);
          
          // Play audio for MIDI keyboard input (use transposed note)
          if (audioEnabledRef.current) {
            const velocity = d2 / 127;
            playNote(transposedNote, velocity, false);
          }
        }
        detect();
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
  const [inputText, setInputText] = useState(defaultSong);
  const [loadedSongText, setLoadedSongText] = useState(defaultSong); // Track what's actually loaded
  type SeqItem = { kind: "chord" | "modifier" | "comment" | "title"; raw: string; chord?: string; comment?: string; title?: string; };
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [seqIndex, setSeqIndex] = useState(-1); // What's loaded in hub (ready to play next)
  const [displayIndex, setDisplayIndex] = useState(-1); // What we're showing/highlighting (what was just played)
  
  // Playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(60); // BPM (beats per minute)
  const [transpose, setTranspose] = useState(0); // Semitones (-12 to +12)
  const [transposeBypass, setTransposeBypass] = useState(false); // Temporarily disable transpose
  
  // Computed transpose value (0 if bypassed)
  const effectiveTranspose = transposeBypass ? 0 : transpose;
  
  // Debug: Log transpose changes
  useEffect(() => {
    console.log('🎹 TRANSPOSE STATE:', {
      transpose,
      transposeBypass,
      effectiveTranspose,
      baseKey,
      willBecomeKey: effectiveTranspose !== 0 ? transposeKey(baseKey, effectiveTranspose) : baseKey
    });
  }, [transpose, transposeBypass, baseKey, effectiveTranspose]);
  
  // Helper: Transpose a key name by N semitones
  const transposeKey = (key: KeyName, semitones: number): KeyName => {
    const pc = NAME_TO_PC[key];
    const newPc = (pc + semitones + 12) % 12;
    const result = FLAT_NAMES[newPc]; // Always use flat names for keys
    console.log(`🔄 transposeKey(${key}, ${semitones}) = ${result} (pc ${pc} → ${newPc})`);
    return result;
  };
  
  // Computed transposed base key
  const effectiveBaseKey = effectiveTranspose !== 0 ? transposeKey(baseKey, effectiveTranspose) : baseKey;
  
  // Debug: Log effective base key
  useEffect(() => {
    console.log('🎯 EFFECTIVE BASE KEY:', effectiveBaseKey, '(original:', baseKey, ')');
  }, [effectiveBaseKey, baseKey]);
  
  // Ref for baseKey - uses effectiveBaseKey for transpose
  const baseKeyRef = useRef<KeyName>("C"); 
  useEffect(() => { baseKeyRef.current = effectiveBaseKey; }, [effectiveBaseKey]);
  
  const [loopEnabled, setLoopEnabled] = useState(false);
  const playbackTimerRef = useRef<number | null>(null);
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
    const APP_VERSION = "v0.9.2-debug-G-chord-fix";
    console.log('=== PARSE AND LOAD START ===');
    console.log('🏷️  APP VERSION:', APP_VERSION);
    console.log('Input text:', inputText);
    setLoadedSongText(inputText); // Save what we're loading
    
    // Handle empty input gracefully
    if (!inputText.trim()) {
      setSequence([]);
      setSeqIndex(-1);
      setDisplayIndex(-1);
      setSongTitle("");
      setBaseKey("C");
      goHome();
      return;
    }
    
    const tokens = inputText.split(",").map(t=>t.trim()).filter(Boolean);
    console.log('Parsed tokens:', tokens);
    let title = "";
    let currentKey: KeyName = baseKey; // Track key for functional notation
    
    const items: SeqItem[] = tokens.map(tok=>{
      // Comments start with #
      if (tok.startsWith("#")) {
        const commentText = tok.slice(1).trim();
        // NEW v3.2.5: Check if comment includes a chord after colon
        // Example: "# Verse: Am" or "# Bridge: F#m"
        if (commentText.includes(":")) {
          const colonIdx = commentText.indexOf(":");
          const beforeColon = commentText.substring(0, colonIdx).trim();
          const afterColon = commentText.substring(colonIdx + 1).trim();
          // If text after colon looks like a chord, it's a combined comment+chord
          // Updated v3.2.6: Better regex to handle m7b5, dim7, maj7, etc.
          const chordPattern = /^([A-G][#b]?)(m|maj|min|dim|aug|sus)?(7|9|11|13)?(b5|#5|♭5|#9|b9)?$/;
          if (afterColon && chordPattern.test(afterColon)) {
            return { kind:"comment", raw:tok, comment: beforeColon, chord: afterColon };
          }
        }
        return { kind:"comment", raw:tok, comment: commentText };
      }
      
      // Modifiers start with @
      if (tok.startsWith("@")) {
        const remainder = tok.slice(1).trim();
        // Handle both "@HOME F" and "@HOME:F" and "@HOME: F"
        // First check if there's a colon - split on that
        let cmd, arg, rest;
        if (remainder.includes(":")) {
          [cmd, ...rest] = remainder.split(":");
          arg = rest.join(":").trim(); // rejoin in case chord name has colon somehow
        } else {
          // No colon, split on whitespace
          [cmd, ...rest] = remainder.split(/\s+/);
          arg = rest.join(" ");
        }
        const upper = (cmd||"").toUpperCase().trim();
        
        // Check for TITLE
        if (upper === "TITLE" || upper === "TI") {
          title = arg;
          return { kind:"title", raw:tok, title: arg };
        }
        
        // Check for KEY - update currentKey for functional notation
        if (upper === "KEY" || upper === "K") {
          const keyArg = arg.trim();
          // NEW v3.2.5: Check if there's a chord after the key
          // Example: "@KEY: B F#m" or "@KEY B, F#m"
          const parts = keyArg.split(/[,\s]+/);
          const newKey = parts[0] as KeyName;
          const chordAfterKey = parts.slice(1).join(" ").trim();
          
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
      const functionalPattern = /^(♭|#)?([IViv]+)(7|M7|m7|maj7|dom7)?(\/([IViv]+))?$/;
      const match = tok.match(functionalPattern);
      
      if (match) {
        // It's functional notation - convert to literal chord based on current key
        const accidental = match[1] || '';
        const numeral = match[2];
        const quality = match[3] || '';
        const secondaryTarget = match[5]; // For V/vi style notation
        
        // Convert Roman numeral to scale degree (0-11)
        const romanToDegreeLower: Record<string, number> = {
          'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
        };
        const romanToDegreeUpper: Record<string, number> = {
          'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11
        };
        
        const isLower = numeral === numeral.toLowerCase();
        const degreeMap = isLower ? romanToDegreeLower : romanToDegreeUpper;
        let degree = degreeMap[isLower ? numeral : numeral.toLowerCase()];
        
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
          if (accidental === '♭' || accidental === 'b') degree = (degree - 1 + 12) % 12;
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
          
          // Return as chord with original functional notation as raw
          return { kind:"chord", raw:tok, chord: chordName };
        }
      }
      
      // Everything else is a literal chord
      return { kind:"chord", raw:tok, chord: tok };
    });
    
    setSongTitle(title);
    setSequence(items);
    setLoadedSongText(inputText); // Track what's actually loaded
    
    // Find first non-title, non-KEY item to set as initial index
    let initialIdx = 0;
    while (initialIdx < items.length && 
           (items[initialIdx].kind === "title" || 
            (items[initialIdx].kind === "modifier" && items[initialIdx].chord?.startsWith("KEY:")))) {
      initialIdx++;
    }
    
    // Check if first item is @KEY, apply it first
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
      
      // Set index to first playable item (but don't play it yet - v3.2.5)
      if (initialIdx < items.length) {
        console.log('Setting initial index to:', initialIdx, 'chord =', items[initialIdx]?.raw);
        setSeqIndex(initialIdx);
        setDisplayIndex(initialIdx);
        // REMOVED v3.2.5: Don't auto-play first chord on load
        // applySeqItem(items[initialIdx]);
        selectCurrentItem(initialIdx); // Pass explicit index
        console.log('=== PARSE AND LOAD END ===\n');
      } else {
        setSeqIndex(-1);
        setDisplayIndex(-1);
      }
    } else {
      setSeqIndex(-1);
      setDisplayIndex(-1);
    }
  };

  const stepPrev = ()=>{
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    if (!sequence.length) return;
    let i = seqIndex - 1;
    if (i < 0) i = 0; // Stay at beginning
    
    // Skip backwards over titles only (v3.2.7: Keep comments - they should pause)
    while (i > 0 && sequence[i]?.kind === "title") {
      i--;
    }
    
    setSeqIndex(i);
    setDisplayIndex(i);
    applySeqItem(sequence[i]);
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
    
    console.log('=== STEP NEXT START ===');
    console.log('Before: seqIndex =', seqIndex, 'displayIndex =', displayIndex);
    
    // seqIndex points to what we should play now
    const currentIdx = seqIndex;
    console.log('currentIdx =', currentIdx, 'chord =', sequence[currentIdx]?.raw);
    
    // Make sure it's applied (in case we backed up with <)
    console.log('Calling applySeqItem for:', sequence[currentIdx]?.raw);
    applySeqItem(sequence[currentIdx]);
    
    // CRITICAL: Get the notes AFTER applying (they're now in latchedAbsNotesRef)
    // Use the ref, not state, because state won't update until next render
    const notesToPlay = [...latchedAbsNotesRef.current];
    console.log('📋 Captured notes to play:', notesToPlay);
    
    // Play it with the captured notes
    const currentItem = sequence[currentIdx];
    if (currentItem?.kind === "chord" && notesToPlay.length > 0) {
      console.log('Playing chord:', currentItem.chord, 'notes:', notesToPlay.length);
      // v3.5.0: Notes already transposed via effectiveBaseKey, don't transpose again
      playChord(notesToPlay, 1.5);
    }
    
    // Update displayIndex to show what we just played
    console.log('Setting displayIndex to:', currentIdx);
    setDisplayIndex(currentIdx);
    selectCurrentItem(currentIdx);
    
    // Advance seqIndex to next (but DON'T apply it yet)
    let i = currentIdx + 1;
    if (i >= sequence.length) {
      console.log('At end of sequence');
      return;
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
    } else {
      // Start playing
      if (sequence.length === 0) return;
      
      // v3.5.0: Play first chord BEFORE starting playback timer
      let startIdx = seqIndex;
      if (startIdx < 0 || startIdx >= sequence.length) {
        startIdx = 0;
      }
      
      // Apply the first item to get notes
      applySeqItem(sequence[startIdx]);
      
      // Immediately play it using the ref (like stepNext does)
      const notesToPlay = [...latchedAbsNotesRef.current];
      const currentItem = sequence[startIdx];
      if (currentItem?.kind === "chord" && notesToPlay.length > 0) {
        // v3.5.0: Notes already transposed, don't transpose again
        const noteDuration = (60 / tempo) * 0.8;
        playChord(notesToPlay, noteDuration);
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
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    // Reset to beginning
    // v3.5.0: Skip audio when silent=true (for reset button)
    if (sequence.length > 0 && !silent) {
      setSeqIndex(0);
      applySeqItem(sequence[0]);
      setTimeout(() => selectCurrentItem(), 0);
    }
  };
  
  const goToStart = () => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    console.log('=== GO TO START ===');
    if (sequence.length > 0) {
      // Find first non-title, non-KEY item
      let startIdx = 0;
      while (startIdx < sequence.length && 
             (sequence[startIdx].kind === "title" || 
              (sequence[startIdx].kind === "modifier" && sequence[startIdx].chord?.startsWith("KEY:")))) {
        startIdx++;
      }
      if (startIdx < sequence.length) {
        console.log('Going to index:', startIdx, 'chord =', sequence[startIdx]?.raw);
        setSeqIndex(startIdx);
        setDisplayIndex(startIdx);
        // REMOVED v3.2.5: Don't auto-play when jumping to start
        // applySeqItem(sequence[startIdx]); 
        selectCurrentItem(startIdx); // Pass explicit index
      }
    }
    console.log('=== GO TO START END ===\n');
  };
  
  // Skip to next comment
  const skipToNextComment = () => {
    if (!sequence.length) return;
    for (let i = seqIndex + 1; i < sequence.length; i++) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        applySeqItem(sequence[i]);
        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to end
    const lastIdx = sequence.length - 1;
    setSeqIndex(lastIdx);
    applySeqItem(sequence[lastIdx]);
    setTimeout(() => selectCurrentItem(), 0);
  };
  
  // Skip to previous comment
  const skipToPrevComment = () => {
    if (!sequence.length) return;
    for (let i = seqIndex - 1; i >= 0; i--) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        applySeqItem(sequence[i]);
        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to beginning
    setSeqIndex(0);
    applySeqItem(sequence[0]);
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
    
    // Return/Enter loads sequence (no line breaks supported)
    if (e.key==="Enter"){ 
      e.preventDefault();
      
      // v3.3.2: Exit step record when loading sequence
      if (stepRecord) {
        setStepRecord(false);
        stepRecordRef.current = false;
      }
      
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
    // NEW v3.2.5: Handle combined comments (# comment: Chord)
    if (it.kind==="comment") {
      // If comment has a chord attached, play it
      if (it.chord) {
        console.log('🔄 Combined comment:', it.comment, '+ chord:', it.chord);
        applySeqItem({ kind: "chord", raw: it.chord, chord: it.chord });
      }
      return;
    }
    
    if (it.kind==="title") return; // Skip titles
    if (it.kind==="modifier" && it.chord){
      const [m, arg] = it.chord.split(":");
      
      // NEW v3.2.4: Check if arg is a chord name (combined space+chord)
      const isSpaceModifier = m === "HOME" || m === "SUB" || m === "REL" || m === "PAR";
      const hasChordArg = arg && arg.trim() && isSpaceModifier;
      
      if (m==="HOME"){ 
        goHome();
        // If chord specified, play it after switching
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: HOME + chord:', chordName);
          // Recursively call applySeqItem with chord item
          applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="SUB"){ 
        if(!subdomActiveRef.current) toggleSubdom();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: SUB + chord:', chordName);
          applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="REL"){ 
        if(!relMinorActiveRef.current) toggleRelMinor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: REL + chord:', chordName);
          applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="PAR"){ 
        if(!visitorActiveRef.current) toggleVisitor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: PAR + chord:', chordName);
          applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="KEY"){ 
        // Change key center
        // NEW v3.2.5: Check if format is KEY:C:Am (key + chord)
        const parts = arg?.split(":") || [];
        const newKey = parts[0]?.trim() as KeyName;
        const chordAfterKey = parts.slice(1).join(":").trim();
        
        if (newKey && FLAT_NAMES.includes(newKey)) {
          setBaseKey(newKey);
        }
        
        if (chordAfterKey) {
          console.log('🔄 Combined KEY change:', newKey, '+ chord:', chordAfterKey);
          applySeqItem({ kind: "chord", raw: chordAfterKey, chord: chordAfterKey });
        }
      }
      return;
    }
    if (it.kind==="chord" && it.chord){
      // 🎯 CRITICAL: Simulate MIDI input to use IDENTICAL detection logic!
      // This makes sequencer behavior match keyboard playing exactly.
      
      const chordName = it.chord.trim();
      console.log('🎹 Simulating MIDI for sequencer:', chordName);
      
      // Parse chord to get pitch classes
      const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
      if (!match) {
        console.warn('⚠️ Could not parse chord:', chordName);
        return;
      }
      
      const root = match[1];
      const quality = match[2] || "";
      
      // Get root pitch class
      const rootPc = NAME_TO_PC[root as KeyName];
      if (rootPc === undefined) {
        console.warn('⚠️ Unknown root:', root);
        return;
      }
      
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
      } else if (quality === "m7b5" || quality === "m7♭5") {
        intervals = [0, 3, 6, 10]; // Half-diminished
      } else if (quality === "dim" || quality === "°") {
        intervals = [0, 3, 6]; // Diminished triad
      } else if (quality === "dim7" || quality === "°7") {
        intervals = [0, 3, 6, 9]; // Fully diminished 7th
      } else if (quality === "aug" || quality === "+") {
        intervals = [0, 4, 8]; // Augmented triad
      } else {
        intervals = [0, 4, 7]; // Major triad (default)
      }
      
      // Create MIDI notes (using C4=60 as base, keep in comfortable range)
      const baseMidi = 60;
      let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
      
      // Transpose down an octave if root is too high (keeps G-B in range)
      if (rootPc > 4) {
        midiNotes = midiNotes.map(n => n - 12);
      }
      
      // v3.5.0: Apply transpose to sequencer chords (like MIDI input)
      midiNotes = midiNotes.map(n => n + effectiveTranspose);
      
      console.log('🎹 Simulated MIDI notes:', midiNotes, 'for chord:', chordName, 'transpose:', effectiveTranspose);
      
      // 🔑 KEY INSIGHT: Temporarily set MIDI state, call detect(), then restore
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;
      
      // Simulate MIDI note-on
      rightHeld.current = new Set(midiNotes);
      lastMidiEventRef.current = "on";
      
      // Call the SAME detect() function that MIDI uses!
      detect();
      
      // Restore previous state (so we don't interfere with actual MIDI)
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;
      
      console.log('✅ Sequencer detection complete');
      
      // 🎵 NOW PLAY THE AUDIO!
      // detect() handles wedge lighting and space activation
      // But we still need to actually PLAY the notes
      // v3.5.0: midiNotes already transposed above, don't transpose again
      if (audioEnabledRef.current) {
        console.log('🔊 Playing sequencer chord:', midiNotes);
        playChord(midiNotes, 1.5);
      }
    }
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
        textareaRef.current.focus();
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
      importSongFromFile(file).then(content => {
        setInputText(content);
        parseAndLoadSequence();
      }).catch(err => {
        console.error('Failed to import song:', err);
      });
    }
  };
  
  const handleLoadDemoSong = (songContent: string) => {
    setInputText(songContent);
    setShowSongMenu(false);
    setTimeout(() => parseAndLoadSequence(), 100);
  };

  // Global keyboard handler for arrow keys and Enter (when not in textarea)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle if NOT in textarea
      if (document.activeElement?.tagName === 'TEXTAREA') return;
      
      // Navigation shortcuts
      if (e.shiftKey && e.key === '<') { // Shift+, (which is <)
        e.preventDefault();
        goToStart();
      } else if (e.key === ',') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === '.') {
        e.preventDefault();
        stepNext();
      // Playback controls
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopPlayback();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        skipToNextComment();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        skipToPrevComment();
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
      // Skill level shortcuts: 1-5
      } else if (e.key === '1') {
        e.preventDefault();
        setSkillLevel('ROOKIE');
      } else if (e.key === '2') {
        e.preventDefault();
        setSkillLevel('NOVICE');
      } else if (e.key === '3') {
        e.preventDefault();
        setSkillLevel('SOPHOMORE');
      } else if (e.key === '4') {
        e.preventDefault();
        setSkillLevel('ADVANCED');
      } else if (e.key === '5') {
        e.preventDefault();
        setSkillLevel('EXPERT');
      // Legacy arrow navigation (still work)
      } else if (e.key === 'ArrowLeft') {
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
        goHomeC(); // Return to HOME C (without reset)
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
    
    // Play current chord immediately (if it's a chord)
    const currentItem = sequence[seqIndex];
    if (currentItem?.kind === "chord" && currentItem.chord && latchedAbsNotes.length > 0) {
      // v3.5.0: Notes already transposed, don't transpose again
      const noteDuration = (60 / tempo) * 0.8; // 80% of beat duration
      playChord(latchedAbsNotes, noteDuration);
    }
    
    // Calculate interval based on tempo (60 BPM = 1 second per beat)
    const interval = (60 / tempo) * 1000; // milliseconds per beat
    
    // Wait, then advance to next
    playbackTimerRef.current = window.setTimeout(() => {
      // Advance to next item
      let nextIndex = seqIndex + 1;
      
      // Skip over comments and titles
      while (nextIndex < sequence.length && 
             (sequence[nextIndex]?.kind === "comment" || sequence[nextIndex]?.kind === "title")) {
        nextIndex++;
      }
      
      if (nextIndex < sequence.length) {
        setSeqIndex(nextIndex);
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
          applySeqItem(sequence[startIdx]);
          setTimeout(() => selectCurrentItem(), 0);
        } else {
          setIsPlaying(false);
        }
      }
    }, interval);
    
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, seqIndex, tempo, sequence, transpose, latchedAbsNotes, loopEnabled]);

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
    const fullStack = new Error().stack?.split('\n').slice(1, 8).join('\n');
    console.log('🎯 setActiveWithTrail called:', { fn, label, stepRecord: stepRecordRef.current });
    console.log('📍 Stack trace:', fullStack);
    if(activeFnRef.current && activeFnRef.current!==fn){ makeTrail(); } 
    setActiveFn(fn); 
    setCenterLabel(SHOW_CENTER_LABEL?label:""); 
    lastPlayedChordRef.current = label; // Save for Make My Key
    console.log('📝 lastPlayedChordRef set to:', label);
    
    // Auto-record: append chord to inputText
    if (stepRecordRef.current && label) {
      setInputText(prev => prev ? `${prev}, ${label}` : label);
    }
    
    setBonusActive(false); setBonusLabel(""); 
    stopDimFade();
  };
  const centerOnly=(t:string)=>{ 
    console.log('🎯 centerOnly called:', { t, stepRecord: stepRecordRef.current });
    makeTrail(); 
    if (activeFnRef.current) startDimFade();
    // Filter out comment and modifier markers
    const cleaned = t.replace(/^[#@]\s*/, '').trim();
    setCenterLabel(SHOW_CENTER_LABEL ? cleaned : ""); 
    lastPlayedChordRef.current = cleaned; // Save for Make My Key
    console.log('📝 lastPlayedChordRef set to:', cleaned);
    
    // Auto-record: append chord to inputText
    if (stepRecordRef.current && cleaned && !cleaned.startsWith('#') && !cleaned.startsWith('@')) {
      setInputText(prev => prev ? `${prev}, ${cleaned}` : cleaned);
    }
    
    setBonusActive(false); setBonusLabel(""); 
  };
  
  // Helper to preview a chord by name (for playlist navigation)
  const previewChordByName = (chordName: string) => {
    lastInputWasPreviewRef.current = true;
    const renderKey: KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    console.log('🔍 previewChordByName called:', { 
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
    console.log('🔍 chordToFunction returned:', fn, 'for chord:', chordName);
    
    if (fn) {
      // Use previewFn logic to activate wedge
      // Only add 7th if explicitly in chord name OR if it's V7/V/V/etc
      const with7th = PREVIEW_USE_SEVENTHS || fn.includes("7") || chordName.includes("7") || chordName.includes("9") || chordName.includes("11") || chordName.includes("13");
      const pcs = preview.chordPcsForFn(fn, renderKey, with7th);
      
      // Guard: preview module might not know about plain "V" yet
      if (!pcs || pcs.length === 0) {
        console.warn('⚠️ preview.chordPcsForFn returned empty for:', fn, 'falling back to CHORD_DEFINITIONS');
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
      console.log('🔧 Entering fallback parser for:', chordName);
      try {
        const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
        if (match) {
          const root = match[1];
          let quality = match[2] || '';
          console.log('🔧 Parsed root:', root, 'quality:', quality);
          
          // Normalize quality string for better parsing
          // Handle alternate notations: A- → Am, AM7 → AMaj7, Bm7-5 → Bm7b5
          quality = quality
            .replace(/^-(?!5)/, 'm')      // A- → Am (but not -5)
            .replace(/^M7/, 'Maj7')       // AM7 → AMaj7, FM7 → FMaj7
            .replace(/m-5/, 'm7b5')       // Bm-5 → Bm7b5
            .replace(/-5/, '7b5')         // A-5 → A7b5
            .replace(/ø/, 'm7b5');        // Aø → Am7b5
          
          const rootPc = NAME_TO_PC[root as KeyName];
          let intervals: number[] = [0, 4, 7]; // Default: major triad
          console.log('🔧 Root PC:', rootPc, 'intervals:', intervals);
          
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
          console.log('🔧 Setting latchedAbsNotes to:', fitted);
          latchedAbsNotesRef.current = fitted; // Update ref synchronously  
          setLatchedAbsNotes(fitted);
          console.log('🔧 latchedAbsNotes updated successfully');
        }
      } catch (e) {
        console.warn('Could not parse chord:', chordName, e);
      }
      
      console.log('🔧 Calling centerOnly for:', chordName);
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
    
    // DEBUG: Log space state when chords are detected
    if (pcsAbs.size >= 3) {
      console.log('🔍 [DETECT] Space state:', {
        absHeldNotes: absHeld,
        pcsAbs: [...pcsAbs],
        baseKey: baseKeyRef.current,
        effectiveBaseKey: baseKeyRef.current,
        transpose: effectiveTranspose,
        visitor: visitorActiveRef.current,
        subdom: subdomActiveRef.current,
        rel: relMinorActiveRef.current,
        parKey,
        subKey
      });
    }
    
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
    const absName = internalAbsoluteName(pcsAbs, baseKeyRef.current, absHeld) || "";
    
    // v3.5.0: Fix diminished chord spelling in HOME space
    // G#dim (leading tone to A), C#dim (leading tone to D), Ebdim (ties to bIII parallel)
    let displayName = absName;
    if ((absName.includes('°') || absName.includes('dim')) && !relMinorActiveRef.current && !subdomActiveRef.current && !visitorActiveRef.current) {
      // HOME space only - spell based on function
      displayName = displayName
        .replace(/^Ab(dim|°)/, 'G#$1')   // G# is leading tone to A (V/vi function)
        .replace(/^Db(dim|°)/, 'C#$1')   // C# is leading tone to D (V/ii function)  
        .replace(/^D#(dim|°)/, 'Eb$1');  // Eb ties to bIII in parallel (keep flat)
      // Gb→F# naturally handled by theory.ts
    }
    
    // Store for Make My Key - this is the pure MIDI detection result
    if (absName) {
      lastDetectedChordRef.current = absName;
      console.log('💎 lastDetectedChordRef set to:', absName, '(from theory.ts)');
    }

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
        setCenterLabel(displayName); // Use actual name (Bdim7, Edim7, etc.)
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
          setCenterLabel(displayName);
          setBonusActive(true); 
          setBonusLabel(displayName);
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
        // v3.5.0: Use absName for center label to distinguish A from A7
        // But keep bonus wedge label as "A7" (functional label)
        const centerLabelToUse = absName || "A7";
        setActiveFn(""); setCenterLabel(centerLabelToUse);
        setBonusActive(true); setBonusLabel("A7"); // Wedge always shows "A7"
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
        
        // v3.5.0: Add G#dim and G#dim7 to V/vi family (functions like E7)
        const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
        const bassPc = bassNote !== null ? (bassNote % 12) : null;
        const gSharpDim = isSubsetIn([8,11,2], S) && (S.size === 3 || (S.size === 4 && bassPc === 8)); // G#dim triad or G#dim7 in root position
        
        const fm   = isSubsetIn([5,8,0], S) || isSubsetIn([5,8,0,3], S); // iv chord - exit immediately

        if (dm || am || em || d7 || e7 || gSharpDim || fm){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = 0;

          if (dm){ setActiveWithTrail("ii",  absName || (isSubsetIn([2,5,9,0], S)?"Dm7":"Dm")); return; }
          if (am){ setActiveWithTrail("vi",  absName || (isSubsetIn([9,0,4,7], S)?"Am7":"Am")); return; }
          if (em){ setActiveWithTrail("iii", absName || (isSubsetIn([4,7,11,2], S)?"Em7":"Em")); return; }
          if (d7){ setActiveWithTrail("V/V", "D7"); return; }
          if (e7 || gSharpDim){ 
            // v3.5.0: E7 family includes G#dim and G#dim7 (both function as V/vi)
            const chordName = gSharpDim ? displayName : "E7";
            setActiveWithTrail("V/vi", chordName); 
            return; 
          }
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
        setCenterLabel(displayName);
        setActiveFn("");
        return;
      }
      
      // Exit on C#dim7 family (V/ii function - use bonus wedge)
      const hasCsharpDim7 = pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10);
      if (hasCsharpDim7) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        setCenterLabel(displayName); // Actual chord name
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
        setCenterLabel(displayName); // Edim/Edim7 in F, Bdim/Bdim7 in C, etc.
        setBonusActive(false);
        return;
      }
      
      // Now check diatonic (after vii° check)
      const m7 = firstMatch(parDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, parKey);
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
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
    if (performance.now() >= homeSuppressUntilRef.current){
      // v3.5.0: Get bass note for root position checking
      const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
      const bassPc = bassNote !== null ? (bassNote % 12) : null;
      
      // PRIORITY: Check bonus chords BEFORE diatonic chords
      // Bdim/Bm7♭5 (ii/vi wedge): B-D-F or B-D-F-Ab
      const hasBDF   = isSubset([11,2,5]) && pcsRel.size === 3; // Bdim triad, any inversion
      const hasBDFG  = isSubset([11,2,5,8]) && pcsRel.size === 4 && bassPc === 11; // Bdim7 ROOT POSITION only
      if (!visitorActiveRef.current && (hasBDF || hasBDFG)) {
        setActiveFn(""); 
        setCenterLabel(displayName);
        setBonusActive(true); 
        setBonusLabel(displayName);
        return;
      }
      
      // A7 family (V/ii wedge): A/A7, C#dim/C#dim7, C#m7♭5
      // All function as V/ii (resolve to Dm)
      const hasA7tri = isSubset([9,1,4]) && pcsRel.size === 3;
      const hasA7    = isSubset([9,1,4,7]) && pcsRel.size === 4;
      const hasCSharpDim = isSubset([1,4,8]) && pcsRel.size === 3; // C#dim triad, any inversion
      const hasCSharpDim7 = isSubset([1,4,7,10]) && pcsRel.size === 4 && bassPc === 1; // C#dim7 root position (C#-E-G-Bb)
      const hasCSharpHalfDim = isSubset([1,4,7,11]) && pcsRel.size === 4; // C#m7♭5 any inversion (C#-E-G-B)
      
      if (!visitorActiveRef.current && (hasA7tri || hasA7 || hasCSharpDim || hasCSharpDim7 || hasCSharpHalfDim)) {
        setActiveFn(""); 
        setCenterLabel(displayName); // Show actual chord name
        setBonusActive(true); 
        setBonusLabel(displayName);
        return;
      }
      
      if (exactSet([6,9,0,4])){ setActiveWithTrail("V/V","F#m7♭5"); return; }
      const m7 = firstMatch(homeDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched m7:', { fn: m7.f, chordName, absName, displayName, hasSeventhQuality, baseKey: baseKeyRef.current });
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
      const tri = firstMatch(homeDiatonic.reqt, pcsRel); 
      if(tri){ 
        // v3.5.0: Use absName from theory.ts instead of realizeFunction
        // This prevents G triad from being labeled "G7" just because it triggers V7 function
        const chordName = absName || realizeFunction(tri.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched tri:', { 
          fn: tri.f, 
          chordName, 
          absName,
          usingAbsName: !!absName,
          baseKey: baseKeyRef.current, 
          pcsRel: [...pcsRel],
          triPattern: tri.s ? [...tri.s] : 'none'
        });
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
    
    console.log('🔑 Make My Key:', chordToUse, '(from theory.ts) → root:', rootName, 'isMinor:', isMinor, 'currentLabel:', centerLabel);
    
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

  const fnDisplay = (fn: Fn): string => fn; // v3.5.0: Display function as-is (V/vi shows as V/vi)

  const [dimFadeTick, setDimFadeTick] = useState(0);
  const [dimFadeOn, setDimFadeOn] = useState(false);
  const dimFadeRafRef = useRef<number | null>(null);

  /* ---------- label key + center text style ---------- */
  // v3.5.0: Use effectiveBaseKey for transpose support
  const labelKey = (visitorActive ? parKey : (subdomActive ? subKey : effectiveBaseKey)) as KeyName;
  
  // Debug: Log wedge label key
  useEffect(() => {
    console.log('🏷️ WEDGE LABEL KEY:', {
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

  /* ---------- wedges ---------- */
  const wedgeNodes = useMemo(()=>{
    // v3.5.0: Use effectiveBaseKey for transpose support
    const renderKey:KeyName = visitorActive ? parKey : effectiveBaseKey;
    console.log('🎨 RENDERING WEDGES with key:', renderKey);
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
             const ctm = svg.getScreenCTM();
             
             // Safari/zoom debugging
             console.log('🔍 CTM:', {
               ctm: ctm ? 'exists' : 'null',
               a: ctm?.a,
               d: ctm?.d,
               clientX: e.clientX,
               clientY: e.clientY
             });
             
             if (!ctm) {
               console.warn('⚠️ getScreenCTM() returned null, using fallback');
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
             
             console.log('🖱️ Click coords:', {
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
               const ctm = svg.getScreenCTM();
               if (!ctm) {
                 console.warn('⚠️ CTM null in onMouseEnter');
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
             const ctm = svg.getScreenCTM();
             if (!ctm) {
               console.warn('⚠️ CTM null in onMouseMove');
               return;
             }
             const svgP = pt.matrixTransform(ctm.inverse());
             
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
  },[layout, activeFn, trailFn, trailTick, trailOn, effectiveBaseKey, visitorActive, relMinorActive, subdomActive, labelKey, dimFadeOn, dimFadeTick, skillLevel]);

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

  const playChord = (midiNotes: number[], duration: number = 1.0) => {
    if (!audioEnabled) return;
    
    // Stop all currently playing notes first for quick cutoff
    const activeNotes = Array.from(activeNotesRef.current.keys());
    activeNotes.forEach(noteId => stopNoteById(noteId));
    
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
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:8, fontFamily:'ui-sans-serif, system-ui'}}>
      <div style={{maxWidth:800, margin:'0 auto', border:'1px solid #374151', borderRadius:12, padding:8}}>

        {/* BKS Logo Header with Emblem + Help Button */}
        <div style={{marginBottom:0, paddingLeft:8, position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
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
                {/* ® Symbol */}
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
          
          {/* Skill Wheel only - top right */}
          <div style={{display:'flex', alignItems:'flex-start'}}>
            {/* Circular Skill Selector */}
            <SkillWheel current={skillLevel} onChange={setSkillLevel} />
          </div>
        </div>

        {/* Wheel - overlaps with logo space */}
        <div className="relative"
             style={{width:WHEEL_W,height:WHEEL_H, margin:'0 auto', marginTop:-30,
                     transform:`scale(1.15)`, transformOrigin:'center top'}}>
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
          const HW = WW * 4.0 * KBD_HEIGHT_FACTOR_DEFAULT * 1.2; // 1.2x for taller tablature
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
            <div style={{maxWidth: WHEEL_W, margin:'0 auto 0', marginTop: 25}}>
              {/* UNIFIED LAYOUT - Same structure always, no shifting */}
              
              
              {/* Row 1: Sequence display - v3.4.3: Always visible, shows message when not EXPERT */}
              {skillLevel === "EXPERT" ? (
                sequence.length > 0 && (
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
                              const isCurrent = globalIdx === displayIndex;
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
                                  color: isCurrent ? '#39FF14' : (isComment ? '#6b7280' : '#9CA3AF')
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
                )
              ) : (
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                  background:'#0f172a',
                  padding:'12px',
                  marginBottom: 6,
                  textAlign:'center',
                  color:'#6b7280',
                  fontSize:11,
                  fontStyle:'italic'
                }}>
                  To use sequencer, activate Expert mode (5)
                </div>
              )}
              
              <div style={{display:'grid', gridTemplateColumns:'65% 35%', columnGap:12, marginBottom:6}}>
                {/* Left: Key Button + Space Buttons + Keyboard */}
                <div style={{display:'flex', flexDirection:'column', gap:8, height:'100%'}}>
                  {/* Key + Space buttons */}
                  <div style={{display:'flex', gap:8, flexWrap:'nowrap', position:'relative', justifyContent:'space-between', alignItems:'center'}}>
                    {/* Key Button - left aligned */}
                    <div style={{position:'relative'}}>
                      <button 
                        onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                        style={{
                          ...activeBtnStyle(true, '#39FF14'),
                          minWidth:60,
                          transition: 'box-shadow 0.3s ease-out',
                          boxShadow: keyChangeFlash ? '0 0 20px #39FF14' : 'none',
                          background: '#1a3310',  // Solid green background
                          fontWeight: 700,
                          fontSize: 14
                        }}
                      >
                        {baseKey}
                      </button>
                      
                      {/* Dropdown */}
                      {showKeyDropdown && (
                        <div style={{
                          position:'absolute',
                          top:'100%',
                          left:0,
                          marginTop:4,
                          background:'#1f2937',
                          border:'1px solid #39FF14',
                          borderRadius:6,
                          padding:4,
                          zIndex:1000,
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
                  <div style={{width:'100%', marginTop:'auto'}}>
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
              
              
              {/* Row: Reset + MMK + Show Bonus + Transpose - v3.5.0: Reordered */}
              <div style={{marginTop: 6, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                {/* Reset - v3.5.0: Moved left, renamed "Key ↻" */}
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
                    Key ↻
                  </button>
                )}
                
                {skillLevel === "EXPERT" && (
                  <button 
                    onClick={makeThisMyKey}
                    disabled={!centerLabel}
                    style={{
                      padding:'6px 10px', 
                      border:"1px solid #F2D74B", 
                      borderRadius:6, 
                      background: centerLabel ? '#332810' : '#111', 
                      color: centerLabel ? "#F2D74B" : "#666",
                      cursor: centerLabel ? "pointer" : "not-allowed",
                      fontSize:11,
                      fontWeight:500,
                      opacity: centerLabel ? 1 : 0.5
                    }}
                    title="Make current chord your new key center (K)"
                  >
                    ⚡ Make My Key
                  </button>
                )}
                
                {/* Show Bonus - ADVANCED/EXPERT */}
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
                      fontWeight: showBonusWedges ? 600 : 400
                    }}
                  >
                    {showBonusWedges ? '✓ Show Bonus Chords' : 'Show Bonus Chords'}
                  </button>
                )}
                
                {/* Transpose - v3.5.0: Disabled when @KEY present */}
                {(skillLevel === "EXPERT" || transpose !== 0) && (() => {
                  const hasKeyDirective = loadedSongText.includes('@KEY');
                  const transposeActive = transpose !== 0;
                  const disabled = hasKeyDirective && transposeActive;
                  
                  return (
                  <div style={{position:'relative'}}>
                    <button 
                      onClick={() => !hasKeyDirective && setShowTransposeDropdown(!showTransposeDropdown)}
                      style={{
                        padding:'6px 10px', 
                        border: (transpose === 0 || transposeBypass) ? '1px solid #6B7280' : '2px solid #EF4444',
                        borderRadius:8, 
                        background: (transpose === 0 || transposeBypass) ? '#111' : '#2a1010',
                        color: (transpose === 0 || transposeBypass) ? '#6B7280' : '#EF4444',
                        cursor: hasKeyDirective ? 'not-allowed' : 'pointer',
                        fontSize:11,
                        opacity: hasKeyDirective ? 0.5 : 1
                      }}
                      title={hasKeyDirective ? "Transpose disabled (song uses @KEY)" : (transposeBypass ? "Transpose bypassed (click to edit)" : "Transpose (T)")}
                    >
                      TR {transpose > 0 ? `+${transpose}` : transpose}
                      {hasKeyDirective && ' ⚠'}
                    </button>
                    
                    {showTransposeDropdown && !hasKeyDirective && (
                      <div style={{
                        position:'absolute',
                        bottom:'100%',
                        left:0,
                        marginBottom:4,
                        background:'#1f2937',
                        border: transpose !== 0 ? '1px solid #F2D74B' : '1px solid #60A5FA',
                        borderRadius:6,
                        padding:8,
                        zIndex:1000,
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
                
                {/* Play in C - Quick reset to C major */}
                {(transpose !== 0 || baseKey !== 'C') && skillLevel === "EXPERT" && (
                  <button 
                    onClick={() => {
                      setTranspose(0);
                      setTransposeBypass(false);
                      setBaseKey('C');
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
                    title="Reset to C major (no transpose)"
                  >
                    🎹 Play in C
                  </button>
                )}
              </div>
              
              
              {/* Row: Transport Controls + Step Record - v3.4.3: Fixed missing buttons */}
              {skillLevel === "EXPERT" && sequence.length > 0 && (
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:6, marginBottom:6, flexWrap:'wrap'}}>
                  {/* 1. Go to start */}
                  <button 
                    onClick={goToStart} 
                    style={{
                      padding:'6px 10px', 
                      border:'2px solid #9CA3AF', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16
                    }} 
                    title="Go to start (Shift+<)"
                  >
                    ⏮️
                  </button>
                  
                  {/* 2. Prev chord - BLUE */}
                  <button 
                    onClick={stepPrev} 
                    style={{
                      padding:'6px 10px', 
                      border:'2px solid #3B82F6', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700
                    }} 
                    title="Previous chord (<)"
                  >
                    &lt;
                  </button>
                  
                  {/* 3. Next chord - BLUE */}
                  <button 
                    onClick={stepNext} 
                    style={{
                      padding:'6px 10px', 
                      border:'2px solid #3B82F6', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700
                    }} 
                    title="Next chord (>)"
                  >
                    &gt;
                  </button>
                  
                  {/* 4. Play/Stop - GREEN for ▷, RED for ■ */}
                  <button 
                    onClick={togglePlayPause}
                    style={{
                      padding:'6px 10px',
                      border: isPlaying ? '2px solid #EF4444' : '2px solid #10B981', 
                      borderRadius:8, 
                      background: isPlaying ? '#2a1a1a' : '#1a3a2a', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16,
                      fontWeight:700
                    }}
                    title={isPlaying ? "Stop (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? '■' : '▷'}
                  </button>
                  
                  {/* 5. Loop button */}
                  <button 
                    onClick={() => setLoopEnabled(!loopEnabled)}
                    style={{
                      padding:'6px 10px', 
                      border: loopEnabled ? '2px solid #10B981' : '2px solid #374151', 
                      borderRadius:8, 
                      background: loopEnabled ? '#1a3a2a' : '#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16
                    }} 
                    title={loopEnabled ? "Loop enabled" : "Loop disabled"}
                  >
                    🔁
                  </button>
                  
                  {/* 6. Prev comment - GREY */}
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
                    title="Previous comment (Ctrl+←)"
                  >
                    {"<<"}
                  </button>
                  
                  {/* 7. Next comment - GREY */}
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
                    title="Next comment (Ctrl+→)"
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
                  
                  {/* Step Record - v3.4.0: Moved here from MMK row */}
                  <button 
                    onClick={() => {
                      const newState = !stepRecord;
                      setStepRecord(newState);
                      stepRecordRef.current = newState;
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
                <div style={{marginBottom: 6, display:'flex', gap:8, alignItems:'stretch'}}>
                  <textarea
                    ref={textareaRef}
                    placeholder={'Type chords, modifiers, and comments...\nExamples:\n@TITLE Sequence Name, @KEY C\nC, Am7, F, G7\n@SUB F, Bb, C7, @HOME\n@REL Em, Am, @PAR Cm, Fm\n@KEY G, D, G, C\n# Verse: lyrics or theory note'}
                    rows={3}
                    value={inputText}
                    onChange={(e)=>setInputText(e.target.value)}
                    onKeyDown={handleInputKeyNav}
                    style={{
                      flex: 1,
                      padding:'8px 10px',
                      border:'1px solid #374151',
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderRadius:8,
                      fontFamily:'ui-sans-serif, system-ui',
                      resize:'vertical',
                      fontSize:12,
                      lineHeight: '1.5' // v3.2.5: Explicit line-height for better click targets
                    }}
                  />
                  
                  {/* Enter Button - RED when editor differs from loaded - v3.3.4: Moved to be immediately right of textarea */}
                  <button 
                    onClick={parseAndLoadSequence}
                    style={{
                      width:60,
                      padding:'6px',
                      border: inputText !== loadedSongText ? '2px solid #EF4444' : '2px solid #39FF14',
                      borderRadius:8,
                      background: inputText !== loadedSongText ? '#2a1a1a' : '#111',
                      color:'#fff',
                      cursor:'pointer',
                      display:'flex',
                      flexDirection:'column', // v3.4.3: Column layout for icon + text
                      alignItems:'center',
                      justifyContent:'center',
                      gap: 2
                    }}
                    title={inputText !== loadedSongText ? "Load changes (Enter)" : "Load sequence (Enter)"}
                  >
                    <span style={{fontSize:20, fontWeight:700, lineHeight:1}}>⏎</span>
                    {inputText !== loadedSongText && (
                      <span style={{fontSize:8, fontWeight:600, color:'#EF4444', textTransform:'uppercase', lineHeight:1}}>
                        Apply
                      </span>
                    )}
                  </button>
                  
                  {/* Sequencer Menu Button - v3.3.4: Moved after Enter button */}
                  <div style={{position:'relative'}}>
                    <button 
                      onClick={() => setShowSongMenu(!showSongMenu)}
                      style={{
                        width:60,
                        height:'100%',
                        padding:'6px',
                        border:'2px solid #60A5FA',
                        borderRadius:8,
                        background:'#111',
                        color:'#fff',
                        cursor:'pointer',
                        fontSize:24,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center'
                      }}
                      title="Sequencer menu"
                    >
                      📁
                    </button>
                    
                    {/* Sequencer Menu Dropdown - v3.3.1: Renamed from Song Menu */}
                    {showSongMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 4,
                        background: '#1a1a1a',
                        border: '2px solid #60A5FA',
                        borderRadius: 8,
                        padding: 8,
                        zIndex: 10000,
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
                              onClick={() => handleLoadDemoSong(song.content)}
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
                            📂 Import from file...
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
                            💾 Export to file...
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
                            🔗 Copy share link
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
                              ✓ Link copied to clipboard!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div style={{marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151'}}>
                {/* Single line: Controls + Status */}
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', justifyContent:'space-between'}}>
                  {/* Left: Controls */}
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
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
                        setTimeout(() => setAudioReady(true), 100);
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
                    <select value={selectedId} onChange={(e)=>{ const acc=midiAccessRef.current; if(acc) bindToInput(e.target.value, acc); }}
                      style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}>
                      {inputs.length===0 && <option value="">No MIDI inputs</option>}
                      {inputs.map((i:any)=>(<option key={i.id} value={i.id}>{i.name || `Input ${i.id}`}</option>))}
                    </select>
                  )}
                  </div>
                  
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

// EOF - HarmonyWheel.tsx v3.4.3