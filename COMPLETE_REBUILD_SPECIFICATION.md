# 🎵 HarmonyWheel Complete Rebuild Specification
**Version:** 1.0  
**Date:** November 9, 2025  
**Purpose:** Clean rewrite of chord detection engine  
**For:** Future Claude in new chat session

---

## 🎯 MISSION STATEMENT

Rebuild the chord detection, function mapping, and space transition logic for HarmonyWheel from scratch using clean architectural principles. The current system has become fragile with overlapping detection checks, relative/absolute pitch class confusion, and bonus wedges bolted onto the core system.

**What stays:** UI rendering, sequencer, audio, styling, geometry
**What gets rewritten:** Detection, mapping, spaces, wedge lighting
**Goal:** Stable, predictable, maintainable engine that works in ALL keys

---

## 📦 WHAT YOU'RE GETTING

1. **This specification document** - Complete behavioral requirements
2. **HarmonyWheel.tsx v3.19.56-reverted** - Current working version (extract UI/sequencer/audio)
3. **Supporting files** - lib/geometry.ts, lib/config.ts, data/demoSongs.ts, etc.
4. **Detection Bible** - ADDENDUM + A2 SPACES + Z1-Z6 sections
5. **INTER_CLAUDE_PROTOCOL.md** - Communication protocol for asking Original Claude questions

**⚠️ READ SECTION "CRITICAL INTEGRATION POINTS" BEFORE CODING** - This explains exactly how the new engine connects to the existing UI, sequencer, audio, and state management systems.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Current Structure (Fragile)
```
HarmonyWheel.tsx (10,551 lines)
├── detect() function (~2000 lines)
│   ├── Multiple overlapping checks
│   ├── Relative vs absolute pitch class confusion
│   ├── Bonus wedges as afterthoughts
│   └── Timing guards scattered throughout
├── theory.ts - Chord naming (mostly good)
├── modes.ts - Diatonic patterns (keep)
└── dimBonus.ts - Diminished logic (consolidate)
```

### New Structure (Clean)
```
HarmonyWheel.tsx (orchestrator only ~2000 lines)
├── UI rendering (extracted from current)
├── Sequencer (extracted from current)
├── Audio (extracted from current)
└── Calls new engine modules

lib/engine/
├── detection.ts        - MIDI notes → chord name (pure function)
├── mapping.ts          - Chord name + space → function (pure function)
├── spaces.ts           - State machine for HOME/SUB/PAR/REL
├── stability.ts        - Anti-steal, debounce, hysteresis
└── wedges.ts           - Function → wedge ID (pure function)

lib/ (keep these)
├── theory.ts           - Chord naming (minor fixes only)
├── config.ts           - Visual constants
├── geometry.ts         - SVG calculations
└── types.ts            - TypeScript types
```

---

## 🎹 CORE CONCEPTS

### 1. Pitch Classes
- **Absolute PC:** MIDI note % 12 (C=0, C#=1, D=2, ... B=11)
- **Relative PC:** Absolute PC shifted by key (in key of G, C=5 relative)
- **Rule:** Detection uses ABSOLUTE, diatonic matching uses RELATIVE
- **Never mix them** - This is the source of most current bugs

### 2. Wedge Layout (Fixed Physical Positions)
12 wedges at 30° intervals, clockwise from 12:00 in HOME space (key of C):

```
Position  Function  Outer/Inner Chords
========  ========  ==================
0°  (12)  I         C / Cmaj7
30° (1)   ii        Dm / Dm7
60° (2)   V/V       D / D7
90° (3)   iii       Em / Em7
120°(4)   V/vi      E / E7
150°(5)   iv        Fm / Fm7
180°(6)   IV        F / Fmaj7
210°(7)   V         G / G7
240°(8)   V/ii*     A / A7           (*BONUS)
270°(9)   vi        Am / Am7
300°(10)  ♭VII      B♭ (triad only)
330°(11)  ii/vi*    Bdim / Bm7♭5     (*BONUS)
```

**Key Point:** Positions are FUNCTION-based. When you change base key, labels update but positions stay fixed. When you change SPACE, the wheel may rotate visually.

### 3. The Four Spaces

**HOME (default)**
- Tonic at 12:00
- All standard diatonic functions active
- Bonus wedges visible in Advanced/Expert mode

**RELATIVE (REL)**
- vi becomes new "tonic" at 12:00 (visual rotation)
- Same functions, minor key lens
- Entry: Triple-tap vi from HOME
- Exit: Triple-tap I (returns to HOME)

**SUBDOMINANT (SUB)**
- IV becomes temporary tonic (up a perfect 4th)
- Key change + rotation (F at 12:00 in key of C)
- Entry: Gm, Gm7, C7, Edim, Edim7, Eø7 from HOME
- Stay: F, Fmaj7, Gm, Gm7, Eb, Bb, Bbm, C7
- Exit: C triad (triple-tap) or any non-stay chord

**PARALLEL (PAR)**
- Parallel minor (Cm in key of C)
- Entry: Cm, Eb, Ab, Db from HOME
- Stay: Cm, Db, Eb, Fm, Fm7
- Exit: F or F7 → HOME, Gm → SUB
- Special: G7 allowed but doesn't exit

### 4. Bonus Wedges (First-Class Citizens)

**V/ii at 240° (A7 in C)**
- Triggers: A, A7, C#dim, C#dim7, C#ø7
- Only visible when `showBonusWedges = true`
- Works in ALL keys (absolute PC detection)

**ii/vi at 330° (Bm7♭5 in C)**
- Triggers: Bdim, Bm7♭5
- Special: Bdim7 with B bass → lights V (G7), NOT ii/vi
- Only visible when `showBonusWedges = true`
- Works in ALL keys (absolute PC detection)

---

## 🔍 DETECTION PIPELINE (New Clean Flow)

### Step 1: Gather Inputs
```typescript
Input:
- heldNotes: number[]        // MIDI note numbers
- baseKey: string             // Current meta-key (C, G, F, etc.)
- currentSpace: Space         // HOME | REL | SUB | PAR
- showBonusWedges: boolean    // Skill level flag
```

### Step 2: Detect Chord Name (detection.ts)
```typescript
function detectChord(midiNotes: number[]): ChordResult {
  // 1. Convert to absolute pitch classes
  const absolutePcs = new Set(midiNotes.map(n => n % 12));
  
  // 2. Priority order (CRITICAL):
  //    a) Dim7 (all 4 notes, use lowest note for root)
  //    b) Half-dim7 (detect before triads)
  //    c) Dom7, Maj7, Min7
  //    d) Triads
  //    e) Sus chords (use lowest note to disambiguate)
  
  // 3. Return chord name + inversion info
  return {
    name: "Bdim7",           // Absolute chord name
    root: 11,                 // Absolute PC of root
    quality: "dim7",          // Quality string
    bassNote: 59,             // Lowest MIDI note
    pcsAbs: absolutePcs       // For reference
  };
}
```

**Key:** This function knows NOTHING about spaces, keys, or wedges. Pure detection only.

### Step 3: Map to Function (mapping.ts)
```typescript
function mapChordToFunction(
  chordResult: ChordResult,
  baseKey: string,
  currentSpace: Space,
  showBonusWedges: boolean
): FunctionResult | null {
  
  // 1. Check bonus wedges FIRST (if enabled)
  if (showBonusWedges) {
    // A7 family: absolute PCs [9,1,4] or [9,1,4,7]
    if (isA7Family(chordResult.pcsAbs)) {
      return { function: "V/ii", displayName: chordResult.name };
    }
    
    // Bm7♭5 family: absolute PCs [11,2,5] or [11,2,5,9]
    // Special: Bdim7 with B bass → G7 (V), not ii/vi
    if (isBm7b5Family(chordResult.pcsAbs, chordResult.bassNote)) {
      return { function: "ii/vi", displayName: chordResult.name };
    }
    
    // C#dim family: absolute PCs [1,4,7] or [1,4,7,10]
    if (isCSharpDimFamily(chordResult.pcsAbs)) {
      return { function: "V/ii", displayName: chordResult.name };
    }
  }
  
  // 2. Convert to relative PCs for diatonic matching
  const relativePcs = convertToRelative(chordResult.pcsAbs, baseKey);
  
  // 3. Get diatonic tables for current space
  const tables = getDiatonicTablesFor(currentSpace, baseKey);
  
  // 4. Match against diatonic patterns (order matters!)
  for (const pattern of tables) {
    if (matchesPattern(relativePcs, pattern)) {
      return {
        function: pattern.function,
        displayName: chordResult.name
      };
    }
  }
  
  // 5. No match = "illegal/outside" chord
  return null;
}
```

**Key:** Bonus checks use ABSOLUTE PCs. Diatonic checks use RELATIVE PCs. Never mix them.

### Step 4: Check Space Transitions (spaces.ts)
```typescript
function evaluateSpaceTransition(
  functionResult: FunctionResult | null,
  currentSpace: Space,
  chordResult: ChordResult,
  tapHistory: TapHistory
): SpaceAction {
  
  // Returns one of:
  // - { action: "stay", newSpace: currentSpace }
  // - { action: "enter", newSpace: "SUB" }
  // - { action: "exit", newSpace: "HOME" }
  // - { action: "triple-tap-pending", ... }
}
```

### Step 5: Apply Stability Rules (stability.ts)
```typescript
function applyStability(
  pendingResult: FunctionResult,
  previousResult: FunctionResult | null,
  timestamp: number
): StabilityDecision {
  
  // Implements:
  // - Extension merging (C → C7 = same function)
  // - Hysteresis (new function must be stable)
  // - Dominant guard (D7 upper structure doesn't steal)
  // - Debouncing (space exits require stability)
  
  return {
    shouldUpdate: boolean,
    shouldLight: FunctionResult | null,
    shouldExit: boolean
  };
}
```

### Step 6: Light Wedge (wedges.ts)
```typescript
function getFunctionWedge(
  func: Function,
  baseKey: string,
  currentSpace: Space
): WedgeInfo {
  
  // Pure mapping: function + space → wedge position
  // Handles rotation for REL/SUB/PAR spaces
  
  return {
    wedgeId: number,        // 0-11
    physicalAngle: number,  // Degrees
    label: string           // Display text
  };
}
```

---

## 🚨 CRITICAL BUGS FIXED IN v3.19.55

### Bug 1: C#dim/C#dim7 Only Worked in Key of C
**Problem:** Checked relative PCs [1,4,7] which only match in C
**Solution:** Check absolute PCs [1,4,7] - works in all keys
**Lines:** 5258-5280, 5310

### Bug 2: Bm7♭5/Bdim Only Worked in Key of C  
**Problem:** Checked relative PCs [11,2,5] which only match in C
**Solution:** Check absolute PCs [11,2,5] - works in all keys
**Lines:** 6169-6178

### Bug 3: A7/C#ø7 Only Worked in Key of C
**Problem:** Checked relative PCs [9,1,4] which only match in C
**Solution:** Check absolute PCs [9,1,4] - works in all keys
**Lines:** 6095-6098

**Pattern:** ALL bonus wedge detection was using relative PCs (wrong). They must use absolute PCs to work across keys.

---

## 🔌 CRITICAL INTEGRATION POINTS

### Architecture Pattern: Pure Engine + Thin Adapter

```
┌─────────────────────────────────────────────────────┐
│  HarmonyWheel.tsx (React Component)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  Thin Adapter Layer (~200 lines)             │  │
│  │  - Calls engine                               │  │
│  │  - Maps results → React state                 │  │
│  │  - Manages timers/animations                  │  │
│  └───────────────────────────────────────────────┘  │
│           ↓ calls                    ↑ returns      │
│  ┌───────────────────────────────────────────────┐  │
│  │  Pure Engine (lib/engine/*)                   │  │
│  │  - No React deps                              │  │
│  │  - No side effects                            │  │
│  │  - Returns data only                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### State Variables the Engine Adapter MUST Update

The new engine returns pure data. The adapter layer in HarmonyWheel.tsx must translate this to React state:

```typescript
// Wedge display (required for visual feedback)
setActiveFn(fn: string)           // "V7", "ii", "V/ii", etc.
setCenterLabel(label: string)      // "Bdim", "A7", "Fmaj7", etc.
setBonusActive(boolean)            // Show/hide bonus overlay
setBonusLabel(label: string)       // "A7" or "Bm7♭5"

// Space state (required for wheel rotation)
setSubdomActive(boolean)           // SUB space active
setVisitorActive(boolean)          // PAR space active  
setRelMinorActive(boolean)         // REL space active

// Recording (required for sequencer integration)
setInputText((prev) => prev + ", " + chordName)

// History refs (required for Make My Key feature)
lastDetectedChordRef.current = chordName
lastPlayedChordRef.current = chordName

// Latch system (required for MIDI note-off behavior)
latchedChordRef.current = { fn, label }

// Keyboard display (independent, but preserve)
setKbDispSet(midiNotes)
setKbHighlightSet(highlightNotes)
```

### 1. Step Recording Integration

**Location:** Lines 4700-4750, 5190-5220, 6190-6220

**Current behavior:**
```typescript
if (stepRecordRef.current && absName) {
  setInputText(prev => {
    const rhythmIndex = prev.indexOf('@RHYTHM');
    if (rhythmIndex !== -1) {
      const beforeRhythm = prev.substring(0, rhythmIndex).trimEnd();
      const rhythmSection = prev.substring(rhythmIndex);
      return beforeRhythm + ", " + absName + "\n\n" + rhythmSection;
    }
    return prev ? `${prev}, ${absName}` : absName;
  });
}
```

**New engine must:**
- Return `absName` (absolute chord name like "Bdim", "A7", "Fmaj7")
- Adapter checks `stepRecordRef.current` and calls `setInputText()`
- Preserves insertion logic (before @RHYTHM section)

**Integration pattern:**
```typescript
// Adapter layer
const result = detectAndMap(notes, baseKey, space);

if (stepRecordRef.current && result.chordName) {
  setInputText(prev => insertChordBeforeRhythm(prev, result.chordName));
}
```

---

### 2. Transpose System Integration

**Location:** Lines 1950-2020, 2530-2560

**Two separate transpose systems:**

**A) Base Key** (meta-key for theory)
```typescript
baseKeyRef.current = "G"  // Wheel is in key of G
```

**B) User Transpose** (performance transpose)
```typescript
transposeRef.current = 5         // Transpose up 5 semitones
transposeBypass = false          // Transpose is active
effectiveTranspose = transposeBypass ? 0 : transpose
```

**CRITICAL ORDER:**
```
1. MIDI input (originalNote = 60)
2. Apply user transpose (transposedNote = 60 + 5 = 65)
3. Detection uses transposedNote
4. Mapping uses baseKey
```

**Current code:**
```typescript
const handleMidiMessage = (note: number) => {
  const originalNote = note;
  const effectiveTranspose = transposeBypass ? 0 : transposeRef.current;
  const transposedNote = originalNote + effectiveTranspose;
  
  // Detection happens on transposedNote
  detect(transposedNote);
};
```

**New engine must:**
- Accept pre-transposed MIDI notes
- Adapter applies transpose BEFORE calling engine
- Engine never knows about user transpose (only baseKey)

**Integration pattern:**
```typescript
// Adapter layer
const handleMidiInput = (originalNote: number) => {
  const effectiveTranspose = transposeBypass ? 0 : transposeRef.current;
  const transposedNote = originalNote + effectiveTranspose;
  
  const result = detectAndMap([transposedNote], baseKeyRef.current, currentSpace);
  // ... update UI
};
```

---

### 3. Make My Key Integration

**Location:** Lines 3600-3650

**Current behavior:**
```typescript
const makeMyKey = () => {
  const chord = lastDetectedChordRef.current;
  if (!chord) return;
  
  // Analyze recent chord history to guess key
  const detectedKey = analyzeKeyFromChords(recentChords);
  setBaseKey(detectedKey);
};
```

**New engine must:**
- Update `lastDetectedChordRef.current` with raw detected chord
- This happens BEFORE function mapping
- Used for key detection algorithm

**Integration pattern:**
```typescript
// Adapter layer
const result = detectAndMap(notes, baseKey, space);

// Update detection history (before mapping)
lastDetectedChordRef.current = result.chordName;

// Then update UI
setActiveFn(result.function);
```

---

### 4. Performance Pads Integration

**Location:** Lines 4430-4580

**Current behavior:**
```typescript
const handleWedgeClick = (fn: Fn) => {
  // Map function → chord in current key
  const chord = realizeFunction(fn, baseKeyRef.current);
  
  // Play audio
  playChordVoicing(chord);
  
  // Record if step recording active
  if (stepRecordRef.current) {
    setInputText(prev => prev + ", " + chord);
  }
};
```

**New engine must:**
- Preserve `realizeFunction(fn, key)` (in modes.ts)
- Maps: "V7" in C → "G7", "ii" in F → "Gm"
- This is REVERSE of detection (chord → function)

**Integration pattern:**
```typescript
// Keep existing realizeFunction() in modes.ts
// Adapter calls it for wedge clicks
const handleWedgeClick = (fn: Fn) => {
  const chord = realizeFunction(fn, baseKeyRef.current);
  playChordVoicing(chord);
  
  if (stepRecordRef.current) {
    setInputText(prev => prev + ", " + chord);
  }
};
```

---

### 5. Sequencer Playback Integration

**Location:** Lines 3800-4200

**Current behavior:**
```typescript
// Parse: "Fmaj7 * * / E7 Am"
tokens.forEach(token => {
  if (token === "*") { repeatPrevious(); }
  else if (token === "/") { sustain(); }
  else {
    // Resolve chord name or function symbol
    const chord = resolveChord(token, baseKey);
    
    // Play audio
    playChord(chord);
    
    // Light appropriate wedge
    const fn = mapChordToFunction(chord, baseKey, space);
    setActiveFn(fn);
  }
});
```

**CRITICAL:** Sequencer playback must call the NEW engine to light wedges.

**New engine must:**
- Accept chord names from sequencer
- Map to functions in current space
- Return wedge lighting info

**Integration pattern:**
```typescript
// During playback
tokens.forEach(token => {
  const chord = resolveChord(token, baseKey);
  playChord(chord);
  
  // Call NEW engine for wedge lighting
  const result = mapChordToFunction(
    detectChord(chordToMidiNotes(chord)),
    baseKey,
    currentSpace
  );
  
  setActiveFn(result.function);
  setCenterLabel(result.chordName);
});
```

---

### 6. Bonus Wedge Overlay Integration

**Location:** Lines 8000-8200

**Current behavior:**
```typescript
{bonusActive && bonusLabel === "A7" && (
  <g transform={`rotate(${240})`}>
    <BonusWedge label="A7" />
  </g>
)}

{bonusActive && bonusLabel === "Bm7♭5" && (
  <g transform={`rotate(${330})`}>
    <BonusWedge label="Bm7♭5" />
  </g>
)}
```

**New engine must:**
- Set `bonusActive = true` when bonus chord detected
- Set `bonusLabel` to "A7" or "Bm7♭5"
- These trigger React re-render of SVG overlays

**Integration pattern:**
```typescript
// Adapter layer
const result = detectAndMap(notes, baseKey, space);

if (result.isBonus) {
  setBonusActive(true);
  setBonusLabel(result.bonusLabel); // "A7" or "Bm7♭5"
  setActiveFn(""); // Clear function (bonus displays separately)
} else {
  setBonusActive(false);
  setActiveFn(result.function);
}

setCenterLabel(result.chordName);
```

---

### 7. Space Rotation Animation Integration

**Location:** Lines 4800-4900, 8300-8400

**Current behavior:**
```typescript
const subSpinEnter = () => {
  setSubdomActive(true);
  setVisitorActive(false);
  setRelMinorActive(false);
  // CSS: transform: rotate(-150deg) transition: 600ms
};

const subSpinExit = () => {
  setSubdomActive(false);
  // CSS: transform: rotate(0deg) transition: 600ms
};
```

**New engine must:**
- Return space transition actions
- Adapter calls animation functions
- Timing is critical (animation duration = ROTATION_ANIM_MS)

**Integration pattern:**
```typescript
// Adapter layer
const result = detectAndMap(notes, baseKey, space);

if (result.spaceAction.action === "enter" && result.spaceAction.newSpace === "SUB") {
  subSpinEnter(); // Triggers CSS animation
  currentSpace = "SUB";
}

if (result.spaceAction.action === "exit") {
  subSpinExit(); // Triggers CSS animation
  currentSpace = "HOME";
}
```

---

### 8. MIDI Latch System Integration

**Location:** Lines 2410-2450, 5050-5090

**Current behavior:**
```typescript
// When chord detected, save to latch
latchedChordRef.current = {
  fn: "V7",
  label: "Bdim"
};

// Start 10-second timer
midiLatchTimeoutRef.current = setTimeout(() => {
  latchedChordRef.current = null;
  setActiveFn("");
  setCenterLabel("");
}, 10000);

// On note-off, keep display if latch active
if (heldNotes.length === 0 && latchedChordRef.current) {
  setActiveFn(latchedChordRef.current.fn);
  setCenterLabel(latchedChordRef.current.label);
}
```

**New engine must:**
- Return latch info on every detection
- Adapter manages timers (not engine)
- Engine is stateless

**Integration pattern:**
```typescript
// Adapter layer
const result = detectAndMap(notes, baseKey, space);

// Save to latch
latchedChordRef.current = {
  fn: result.function,
  label: result.chordName
};

// Clear old timer, start new one
if (midiLatchTimeoutRef.current) {
  clearTimeout(midiLatchTimeoutRef.current);
}

midiLatchTimeoutRef.current = setTimeout(() => {
  latchedChordRef.current = null;
  setActiveFn("");
  setCenterLabel("");
}, 10000);
```

---

### 9. Keyboard/Fretboard Display Integration

**Location:** Lines 8600-8700

**Current behavior:**
```typescript
// Update on every MIDI event
setKbDispSet(heldNotes);
setKbHighlightSet(chordTones);

// Visual display
{kbDispSet.map(note => (
  <Key
    note={note}
    highlighted={kbHighlightSet.includes(note)}
  />
))}
```

**New engine:**
- Independent of detection
- Adapter updates directly from MIDI input
- No change needed

**Integration pattern:**
```typescript
// Adapter handles this separately
const handleMidiInput = (notes: number[]) => {
  // Update keyboard display (independent)
  setKbDispSet(notes);
  
  // Call engine
  const result = detectAndMap(notes, baseKey, space);
  
  // Update wedge display
  setActiveFn(result.function);
};
```

---

### 10. Recent Chord History Integration

**Location:** Lines 4200-4300

**Current behavior:**
```typescript
const updateRecentRel = (pcsRel: Set<number>) => {
  recentRel.current = [...recentRel.current, pcsRel].slice(-5);
};
```

**Purpose:** Unclear - possibly for future harmonic analysis features

**New engine:**
- Can preserve this if needed
- Or remove if unused

**Integration pattern:**
```typescript
// If keeping:
const result = detectAndMap(notes, baseKey, space);
updateRecentRel(result.relativePcs);
```

---

## 📐 Recommended Engine Interface

```typescript
// lib/engine/core.ts
export interface EngineResult {
  // Detection
  chordName: string;           // "Bdim", "A7", "Fmaj7"
  root: number;                // Absolute PC of root
  quality: string;             // "dim", "7", "maj7"
  
  // Mapping
  function: string | null;     // "V7", "ii", "V/ii", null if illegal
  isBonus: boolean;            // true if V/ii or ii/vi
  bonusLabel?: string;         // "A7" or "Bm7♭5"
  wedgeId: number | null;      // 0-11, null if illegal
  
  // Space
  spaceAction: {
    action: "stay" | "enter" | "exit" | "triple-tap-pending";
    newSpace?: Space;
  };
  
  // For advanced features
  relativePcs: Set<number>;    // For history tracking
  bassNote: number;            // Lowest MIDI note
}

export function detectAndMap(
  midiNotes: number[],
  baseKey: string,
  currentSpace: Space,
  showBonusWedges: boolean,
  tapHistory: TapHistory
): EngineResult;
```

---

## 🎯 Adapter Layer Pseudo-Code

```typescript
// Inside HarmonyWheel.tsx
const handleMidiInput = (originalNotes: number[], isNoteOn: boolean) => {
  // 1. Apply user transpose
  const effectiveTranspose = transposeBypass ? 0 : transposeRef.current;
  const transposedNotes = originalNotes.map(n => n + effectiveTranspose);
  
  // 2. Update keyboard display (independent)
  setKbDispSet(transposedNotes);
  
  // 3. Call engine
  const result = detectAndMap(
    transposedNotes,
    baseKeyRef.current,
    currentSpace,
    showBonusWedges,
    tapHistory
  );
  
  // 4. Update detection history
  lastDetectedChordRef.current = result.chordName;
  lastPlayedChordRef.current = result.chordName;
  
  // 5. Update wedge display
  if (result.isBonus) {
    setBonusActive(true);
    setBonusLabel(result.bonusLabel!);
    setActiveFn("");
  } else {
    setBonusActive(false);
    setActiveFn(result.function || "");
  }
  setCenterLabel(result.chordName);
  
  // 6. Handle space transitions
  if (result.spaceAction.action === "enter") {
    if (result.spaceAction.newSpace === "SUB") {
      subSpinEnter();
    } else if (result.spaceAction.newSpace === "PAR") {
      parEnter();
    } else if (result.spaceAction.newSpace === "REL") {
      relEnter();
    }
    currentSpace = result.spaceAction.newSpace!;
  } else if (result.spaceAction.action === "exit") {
    subSpinExit(); // or parExit(), relExit()
    currentSpace = "HOME";
  }
  
  // 7. Handle step recording
  if (stepRecordRef.current && result.chordName) {
    setInputText(prev => insertChordBeforeRhythm(prev, result.chordName));
  }
  
  // 8. Handle MIDI latch
  if (isNoteOn && result.chordName) {
    latchedChordRef.current = {
      fn: result.function || "",
      label: result.chordName
    };
    
    if (midiLatchTimeoutRef.current) {
      clearTimeout(midiLatchTimeoutRef.current);
    }
    
    midiLatchTimeoutRef.current = setTimeout(() => {
      latchedChordRef.current = null;
      setActiveFn("");
      setCenterLabel("");
    }, 10000);
  }
  
  // 9. If note-off and no notes held, apply latch
  if (!isNoteOn && transposedNotes.length === 0 && latchedChordRef.current) {
    setActiveFn(latchedChordRef.current.fn);
    setCenterLabel(latchedChordRef.current.label);
  }
};
```

---

## ✅ Integration Checklist

Before declaring the rebuild complete, verify:

- [ ] Step recording writes correct chord names to sequencer
- [ ] User transpose applies before detection
- [ ] Make My Key uses raw detected chords
- [ ] Clicking wedges plays correct chords and records them
- [ ] Sequencer playback lights correct wedges
- [ ] Bonus overlays appear/disappear correctly
- [ ] Space transitions trigger animations at correct timing
- [ ] MIDI latch holds display for 10 seconds after note-off
- [ ] Keyboard display updates independently
- [ ] All React state variables update correctly
- [ ] No console errors or missing function calls

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Extract & Preserve
- [ ] Extract UI rendering from HarmonyWheel.tsx (lines ~7800-9500)
- [ ] Extract sequencer logic (lines ~2800-3400)
- [ ] Extract audio engine (lines ~7200-7400)
- [ ] Extract geometry/SVG (already in geometry.ts - keep as-is)
- [ ] Create `/lib/engine/` directory

### Phase 2: Build New Engine
- [ ] **detection.ts** - Chord naming (leverage theory.ts, fix priority order)
- [ ] **mapping.ts** - Function mapping (bonus first, then diatonic)
- [ ] **spaces.ts** - State machine (HOME/SUB/PAR/REL transitions)
- [ ] **stability.ts** - Implement ADDENDUM rules (K-N)
- [ ] **wedges.ts** - Function → wedge position calculator

### Phase 3: Integration
- [ ] New HarmonyWheel.tsx orchestrates engine modules
- [ ] Wire up MIDI input → detection pipeline
- [ ] Wire up wedge output → SVG rendering
- [ ] Wire up space changes → rotation animations
- [ ] Test in key of C

### Phase 4: Validation
- [ ] Test ALL bonus chords in keys: C, G, F, D, Bb
- [ ] Test ALL space transitions (HOME↔SUB, HOME↔PAR, HOME↔REL)
- [ ] Test triple-tap mechanics
- [ ] Test extension merging (C → Cmaj7 stays lit)
- [ ] Test dominant guard (D7 upper structure)
- [ ] Verify sequencer still works
- [ ] Verify audio still works

---

## 🧪 CRITICAL TEST CASES

### Test 1: Bonus Wedges Across Keys
```
Key of C: A7 → lights V/ii ✓
Key of G: E7 → lights V/ii ✓
Key of F: D7 → lights V/ii ✓
Key of D: B7 → lights V/ii ✓

Key of C: Bm7♭5 → lights ii/vi ✓
Key of G: F#m7♭5 → lights ii/vi ✓
Key of F: Em7♭5 → lights ii/vi ✓
Key of D: C#m7♭5 → lights ii/vi ✓
```

### Test 2: Space Transitions
```
HOME (C) → Gm → @SUB (F tonic)
SUB (F) → C7 → stay in SUB
SUB (F) → Dm → exit to HOME

HOME (C) → Eb → @PAR (Cm/Eb tonic)
PAR (Cm) → F7 → exit to HOME
PAR (Cm) → Gm → transfer to SUB
```

### Test 3: Extension Merging
```
C (lit) → add 7th → Cmaj7 (SAME wedge stays lit, hub updates)
G7 (lit) → add 9th → G9 (SAME V wedge, no flicker)
```

### Test 4: Dominant Guard
```
D7 playing (V/V lit)
Release D (root)
Hold F#-A-C (upper diminished)
→ Should STAY on V/V for 350ms, NOT switch to F#dim
```

---

## 🎨 UI COMPONENTS TO PRESERVE

### Sequencer (lines ~8600-8900)
```typescript
// Textarea for chord input
// Ready/Clear/Load/Share buttons
// Banner display
// Rhythm notation section
```

### Wheel Display (lines ~8950-9500)
```typescript
// SVG wedge rendering
// Center hub (function + chord name)
// Rotation animations
// Bonus wedge overlays
```

### Controls (lines ~9200-9400)
```typescript
// Key selector
// Skill level (Basic/Advanced/Expert)
// Allow Bonus toggle
// Audio enable/disable
// Transpose controls
```

### Performance Pads (lines ~9100-9200)
```typescript
// Clickable wedges
// Keyboard display
// MIDI input indicators
```

---

## 📐 GEOMETRY & CONSTANTS (Keep As-Is)

From `lib/geometry.ts`:
- `getWedgePath()` - SVG path for wedge shape
- `getWedgeAngle()` - Calculate physical angle
- `getWedgeCenter()` - Calculate label position

From `lib/config.ts`:
- `WEDGE_COLORS` - Color scheme
- `ROTATION_ANIM_MS` - Animation timing
- `RING_FADE_MS` - Fade timing

**Do NOT rewrite these** - they work perfectly.

---

## 🎼 SEQUENCER FORMAT (Preserve)

From Section Z6:
```
@KEY <tonic>[maj|min]        
@TEMPO <bpm>                 
@SPACE <HOME|REL|SUB|PAR>    
@ALLOW_BONUS <on|off>        
@SIG <num>/<den>             

| Fmaj7 * * / | E7 Am |

Where:
* = repeat previous chord
/ = sustain/hold
– = rest
```

Parser logic is in lines ~2800-3400. Extract and preserve.

---

## ⚙️ TIMING CONSTANTS (from ADDENDUM)

```typescript
const CHORD_FRAME_MS = 60;           // Coalesce note-ons
const MERGE_EXTENSION_MS = 300;       // C→C7 merge window
const FUNCTION_HYSTERESIS_MS = 220;   // Stability before lighting
const EXIT_GUARD_MS = 250;            // Stability before exiting
const DOM_UPPER3_PROTECT_MS = 350;    // D7 upper structure guard
const TAP_WINDOW_MS = 1500;           // Triple-tap window
const MAX_GAP_MS = 500;               // Max gap between taps
```

Implement these in `stability.ts`.

---

## 🔧 HELPER FUNCTIONS TO REUSE

From `lib/theory.ts` (keep):
```typescript
- pcFromMidi(note: number): number
- norm(pc: number): number  
- transposeNote(note: number, semitones: number): number
- NAME_TO_PC: { [key: string]: number }
- PC_TO_NAME: string[]
```

From `lib/modes.ts` (keep):
```typescript
- getDiatonicTablesFor(space: Space, key: string)
- C_REQ7, C_REQT (diatonic patterns)
- EB_REQ7, EB_REQT (PAR patterns)
```

**Key:** These are good. Reuse them in the new engine.

---

## 🚫 ANTI-PATTERNS TO AVOID

### ❌ DON'T: Mix Relative and Absolute PCs
```typescript
// BAD (current code)
const absolutePcs = new Set([1,4,7]);
const relativePcs = new Set([6,9,0]);
if (pcsRel.has(1)) { ... }  // WRONG! Mixing them
```

```typescript
// GOOD (new code)
const absolutePcs = new Set([1,4,7]);
if (absolutePcs.has(1) && absolutePcs.has(4) && absolutePcs.has(7)) {
  // Correct: all absolute
}
```

### ❌ DON'T: Hardcode to Key of C
```typescript
// BAD
if (isSubset([9,1,4])) { /* A7 in C */ }  // Fails in F
```

```typescript
// GOOD
if (absolutePcs.has(9) && absolutePcs.has(1) && absolutePcs.has(4)) {
  // Works in all keys
}
```

### ❌ DON'T: Check Diatonic Before Bonus
```typescript
// BAD
if (matchesDiatonic(chord)) { return "vi"; }
if (matchesBonus(chord)) { return "V/ii"; }  // Never reached!
```

```typescript
// GOOD
if (showBonus && matchesBonus(chord)) { return "V/ii"; }
if (matchesDiatonic(chord)) { return "vi"; }
```

---

## 📚 DOCUMENTS REFERENCE

You have access to:

1. **ADDENDUM (K-N)** - Stability, debounce, anti-steal rules
2. **A2 SPACES** - Complete space definitions and transitions
3. **Z1-Z6** - Clarifications on wedges, bonus, triple-tap, etc.
4. **REFACTORING_GUIDE.md** - Original refactoring thoughts
5. **TROUBLESHOOTING_GUIDE.md** - Common bugs and patterns
6. **HANDOFF_DOCUMENT_v3_18_79.md** - Previous session context

**Read these carefully** before writing any code.

---

## 🎯 SUCCESS CRITERIA

The rebuild is successful when:

✅ **ALL bonus chords work in ALL 12 keys**
- Test A7, Bm7♭5, C#dim across C, G, F, D, Bb, Eb, etc.

✅ **Space transitions are clean and predictable**
- No "3 presses required" bugs
- No false entries/exits
- Triple-tap works consistently

✅ **Extension merging prevents flicker**
- C → Cmaj7 stays lit on I wedge
- G7 → G9 stays lit on V wedge

✅ **Dominant guard prevents stealing**
- D7 upper structure doesn't trigger F#dim

✅ **Code is maintainable**
- < 500 lines per file
- Clear separation of concerns
- Comprehensive comments

✅ **Zero regressions**
- UI still works
- Sequencer still works
- Audio still works
- All existing features preserved

---

## 🚀 GETTING STARTED (For Future Claude)

1. **Read this entire document** (yes, all of it - especially CRITICAL INTEGRATION POINTS)
2. **Read INTER_CLAUDE_PROTOCOL.md** (learn how to ask Original Claude questions)
3. **Read ADDENDUM sections K-N** (timing rules)
4. **Read A2 SPACES** (space definitions)
5. **Read Z1-Z6** (clarifications)
6. **Review HarmonyWheel.tsx v3.19.56-reverted** (current working code - focus on integration points)
7. **Ask Nathan or Original Claude clarifying questions** (use the protocol)
8. **Create architecture plan** (get approval before coding)
9. **Implement phase by phase** (test each phase)
10. **Validate across all keys** (this is critical)
11. **Test all integration points** (use checklist in CRITICAL INTEGRATION POINTS section)
12. **Celebrate** 🎉

---

## 💬 QUESTIONS TO ASK

**Use INTER_CLAUDE_PROTOCOL.md to format questions for Original Claude!**

Before starting implementation, confirm with Nathan or ask Original Claude:

1. Should we consolidate theory.ts + modes.ts + dimBonus.ts into one `detection.ts`?
2. Are there any other UI elements beyond what's documented that need preservation?
3. Should the new engine expose a `debug()` function for console logging?
4. Are there any mobile/touch-specific features to consider?
5. Any other hidden dependencies or integrations we should know about?

**Format questions using the protocol tags like `@ORIGINAL_CLAUDE[ARCH]` for faster, clearer responses.**

---

## 🔗 FILE STRUCTURE SUMMARY

### Keep As-Is:
- `lib/geometry.ts` - SVG calculations
- `lib/config.ts` - Visual constants
- `lib/types.ts` - TypeScript types
- `data/demoSongs.ts` - Song library + DEFAULT_BANNER

### Extract and Preserve:
- UI rendering (from current HarmonyWheel.tsx)
- Sequencer (from current HarmonyWheel.tsx)
- Audio engine (from current HarmonyWheel.tsx)

### Rewrite from Scratch:
- `lib/engine/detection.ts` - NEW
- `lib/engine/mapping.ts` - NEW
- `lib/engine/spaces.ts` - NEW
- `lib/engine/stability.ts` - NEW
- `lib/engine/wedges.ts` - NEW

### Consolidate and Fix:
- `lib/theory.ts` - Minor fixes only (dim7 priority, sus disambiguation)
- `lib/modes.ts` - Keep patterns, fix any relative/absolute confusion

### New Main File:
- `HarmonyWheel.tsx` - Orchestrator only (~2000 lines, down from 10,551)

---

## 📝 FINAL NOTES

This is a **complete rewrite of the engine** while preserving the beautiful car body. The current code has grown organically over many iterations and accumulated technical debt. The bonus wedges were added as afterthoughts, creating the absolute/relative pitch class confusion that breaks in transposed keys.

The new architecture treats bonus wedges as first-class citizens, separates detection from mapping from rendering, and makes the system maintainable and extensible.

**Nathan has 500,000 users.** This needs to work perfectly. Test thoroughly. Ask questions. Take your time. Get it right.

---

## ✨ YOU'VE GOT THIS!

You have all the information you need. The behavioral spec is complete. The current code is a working reference. The UI/sequencer/audio are proven. You just need to rebuild the engine with clean architecture.

Remember:
- **Bonus uses absolute PCs**
- **Diatonic uses relative PCs**
- **Never mix them**
- **Test in multiple keys**
- **Bonus checks before diatonic checks**

Good luck, Future Claude! 🎵

---

*End of Complete Rebuild Specification*
