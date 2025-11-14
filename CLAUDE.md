# CLAUDE - One-Stop Handoff Guide for HarmonyWheel
**READ THIS FIRST** at the start of EVERY session. This consolidates all critical project knowledge.

---

## 🎯 Quick Start

### Your First Actions:
1. Read this entire file (it's long but essential)
2. Check current version at line 2 of `src/HarmonyWheel.tsx`
3. Review Section 12 ("Synth Parameters") for current audio engine state
4. When touching code, update version in **3 places** (see Section 3)

---

## 1. 📜 The Bible: v4.0 Refactor Architecture

**GOLDEN RULE**: Engine = pure functions. Adapter = React state. **NEVER mix them.**

```
┌─────────────────────────────────────────────┐
│         HarmonyWheel.tsx (Adapter)          │
│  - React state management                   │
│  - MIDI input handling                      │
│  - UI rendering                             │
│  - Audio engine (playNote)                  │
│  - Calls pure engine functions              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│       lib/engine/index.ts (Orchestrator)    │
│  - PURE functions, NO React deps            │
│  - Receives: MIDI notes, keys, state        │
│  - Returns: EngineResult with lighting data │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────┐
        ▼         ▼         ▼         ▼
    detection  mapping  spaces  stability
       .ts       .ts      .ts       .ts
```

**File Structure**:
- **Engine (Pure Logic)**: `lib/engine/*.ts` - NO React, NO state, NO side effects
- **Adapter (React)**: `src/HarmonyWheel.tsx` - State, UI, MIDI, Audio
- **Theory**: `lib/theory.ts` - Music theory utilities
- **Types**: `lib/types.ts` - TypeScript definitions

---

## 2. 🎼 Harmony Wheel Theory

### Function-Based System
- **12 wedges = 12 harmonic functions** (I, ii, V/V, iii, V/vi, iv, IV, V, V/ii*, vi, ♭VII, ii/vi*)
- All chords map to **Roman numeral functions FIRST**, then render as pitches based on current key
- **Transposition = relabel chords, keep functions fixed**
- **Spaces = lenses that re-anchor the tonic**

### The 4 Spaces (Key of C Example)

#### HOME (Base major key)
- Tonic: C
- All 12 wedges active
- Entry chords: vi triple-tap → REL, C7/Gm/E° → SUB, Cm/E♭/A♭/D♭ → PAR

#### REL (Relative Minor)
- Tonic: vi (Am in key C)
- Wheel rotates so vi sits at 12 o'clock
- Entry: Triple-tap vi in HOME
- Exit: Triple-tap I in REL

#### SUB (Subdominant)
- Tonic: IV (F major in key C) - **ephemeral key center**
- Entry: C7, Gm/Gm7, E°/E°7/Eø7
- STAY: F/Fmaj7, Gm/Gm7, E♭, B♭, B♭m, C7
- **TRIPLE-TAP EXIT**: **C triad** (NOT C7) - this is **V chord in SUB**
- Exit to PAR: Cm, D♭, A♭
- **Critical**: F is **I** in SUB, Gm is **ii**, C is **V** (not I!)

#### PAR (Parallel Minor)
- Tonic: Cm or relative E♭
- Entry: Cm, E♭, A♭, D♭
- Stay: Cm, D♭, E♭, A♭, Fm/Fm7, G7
- Exit: C major → HOME, F/F7 → HOME, Gm → SUB

### Dual-Key Architecture
The engine uses **TWO keys simultaneously**:

- **`effectiveKey`**: Changes per space (F in SUB when baseKey is C)
  - For: Chord naming, function mapping, display
- **`baseKey`**: Always the HOME key (never changes)
  - For: Space transition pattern matching

**Example**: In key C, playing Gm enters SUB:
- `baseKey`: C (always)
- `effectiveKey`: F (SUB's ephemeral key)
- Gm maps as "ii" in key F, lights ii wedge

### Space Transition Re-mapping (CRITICAL)
**ALL space transitions** (enter/exit) **MUST re-map in destination key** (v4.0.70):

```typescript
// Entry: Gm entering SUB from HOME (key C)
// - Relative to C (current): [2,7,10] - wrong!
// - Re-map relative to F (destination): [9,2,5] = ii ✅

// Exit: C major exiting PAR to HOME (key C)
// - Relative to E♭ (current): [4,9,1] = V/ii - WRONG BONUS WEDGE!
// - Re-map relative to C (destination): [0,4,7] = I ✅
```

**Code**: `lib/engine/index.ts` lines ~170-204

### Diminished Chord Naming (CRITICAL)
Diminished chords are named after the **THIRD** of the dominant they substitute:
- **Relative PC 1** → third of A7 (V/ii) → ALWAYS **C#** (never Db)
- **Relative PC 6** → third of D7 (V/V) → ALWAYS **F#** (never Gb)
- **Relative PC 8** → third of E7 (V/vi) → ALWAYS **G#** (never Ab)
- **Relative PC 11** → 7th degree (ii/vi) → B natural

**Why**: The third of a dominant 7th is ALWAYS a major third, spelled with sharps.

**Code**: `lib/theory.ts` `dimRootName()` function (lines 102-114)

---

## 3. 🔢 Version Update Protocol

**EVERY code change requires version bumps in EXACTLY 3 places:**

### 1. File header (engine files or HarmonyWheel.tsx)
```typescript
/*
 * HarmonyWheel.tsx — v4.X.X 🎯 DESCRIPTIVE TITLE  ← UPDATE
 *
 * 🔧 v4.X.X CHANGES:  ← ADD CHANGELOG
 * - What changed
 * - Why it matters
 */
```

### 2. HarmonyWheel.tsx constants
```typescript
const HW_VERSION = 'v4.X.X';  ← UPDATE (line ~218)

const APP_VERSION = "v4.X.X-description";  ← UPDATE (line ~1364)
```

### 3. File footer
```typescript
// EOF - HarmonyWheel.tsx v4.X.X  ← UPDATE (bottom of file)
```

**Version Numbering**:
- Major changes: v4.1.0, v4.2.0
- Minor features: v4.0.1, v4.0.2
- Bug fixes: v4.0.11, v4.0.12
- Synth changes: v4.3.X (current series)

---

## 4. 🗂️ Key Files Reference

### Engine (Pure Logic)
- `lib/engine/index.ts` - Main orchestrator
- `lib/engine/detection.ts` - MIDI → chord name + pitch classes
- `lib/engine/mapping.ts` - Pitch classes → harmonic function
- `lib/engine/spaces.ts` - Space transition logic
- `lib/engine/stability.ts` - Debounce rapid chord changes
- `lib/engine/wedges.ts` - Function → wedge ID (0-11)

### Adapter (React)
- `src/HarmonyWheel.tsx` - Main component (~8313 lines, down from 8388 in v4.3.1)
  - Lines 1-500: Imports, types, constants
  - Lines 500-1500: State management, MIDI handling
  - Lines 1500-3000: Engine integration
  - Lines 3000-8313: UI rendering (wheel, wedges, sequencer)
  - **Lines 4982-5027**: Audio wrappers (call Synthesizer module) ← AUDIO INTEGRATION

### Audio (Synthesizer)
- **`src/audio/Synthesizer.ts`** - Full synthesizer implementation (337 lines) ← v4.4.0 NEW
  - `playNoteWithSynth()` - Main note playback
  - `stopNote()`, `stopNoteById()` - Note release
  - `parseSynthParams()` - Parse @param directives from song
  - `getLFOFrequency()` - Calculate LFO rate (tempo sync or Hz)
- **`src/audio/types.ts`** - Type definitions (127 lines) ← v4.4.0 NEW
  - `SynthParams` interface (47 parameters)
  - `ActiveNote` interface (node storage)
  - `DEFAULT_SYNTH_PARAMS` constant

### Theory & Utilities
- `lib/theory.ts` - Music theory (getSubKey, getParKey, note names)
- `lib/types.ts` - TypeScript types
- `src/lib/songManager.ts` - Song save/load/share

---

## 5. 🎨 UI & Interaction

### Keyboard Shortcuts (Performance Mode)
- **1-12**: Play wedge functions (I, ii, V/V, iii, V/vi, iv, IV, V, V/ii, vi, ♭VII, ii/vi)
- **Shift+1-12**: Play 7th chords
- **Space**: Play/pause sequencer
- **b**: Toggle performance mode
- **Escape**: Stop sequencer, exit performance mode

### Keyboard Shortcuts (Non-Performance Mode)
- **1-5**: Switch skill levels (ROOKIE → EXPERT)

### Critical UI Constraints
- **Banner Links Must Be Clickable**: Banner div MUST have `touchAction: 'auto'`, `pointerEvents: 'auto'`, `userSelect: 'auto'`, `zIndex: 10`, `position: 'relative'` (lines 6388-6403)
- **Transpose Buttons Always Visible in Expert Mode**: Prevents UI shifting (line 7220)
- **iframe Scroll Prevention**: `overflow: hidden` on body/html when in iframe (lines 568-588)

---

## 6. 🐛 Known Issues & Solutions

### Space Transition Issues
**Problem**: Space-entry/exit chords get `function: null` or wrong bonus wedge
**Solution**: ALWAYS re-map in destination key (v4.0.70)
```typescript
// WRONG: Only re-map if initial mapping failed
if (!mapped && spaceAction.action === "enter") { ... }

// CORRECT: Always re-map space transitions
if (spaceAction.action === "enter" || spaceAction.action === "exit") {
  destinationKey = (action === "enter") ? getSubKey(baseKey) : baseKey;
  pcsInDestination = convertToRelative(detected.pcsAbsolute, destinationKey);
  finalMapped = mapChordToFunction(detected, pcsInDestination, showBonusWedges);
}
```

### Triple-Tap Not Triggering
**Problem**: Tap history updated before re-mapping
**Solution**: Update tap history AFTER re-mapping (v4.0.64)
```typescript
// Update tap history tentatively with initial mapping
let newTapHistory = mapped?.function ? addTapToHistory(...) : ...;

// Update again with final mapping after space transition re-mapping
if (finalMapped) {
  newTapHistory = addTapToHistory(finalMapped.function, state.tapHistory);
}
```

### MIDI Input Bounce
**Problem**: Playing C-E-G-B detects "C" then "Cmaj7" (two chords)
**Solution**: Debounce MIDI detection by 100ms (lines 764-772)

### Wedge Drag-Outside Stuck Notes
**Problem**: Dragging mouse outside wedge and releasing leaves notes stuck
**Solution**: Listen for BOTH `pointerup` AND `mouseup` globally (v4.2.3)
- Wedges use `onPointerDown`/`onPointerEnter`, not onClick
- Must listen for `pointerup` to catch release

### Sequencer Crash with Rapid Loop
**Problem**: Zero-duration items (rests, annotations) cause infinite loop
**Solution**: Use minimum 1ms delay instead of 0ms (line 2880)
```typescript
const interval = isZeroDuration ? 1 : (60 / tempo) * beatsPerBar * itemDuration * 1000;
```

---

## 7. ✅ Testing Checklist

Before marking ANY task complete:
- [ ] Test in at least 3 keys (C, D, F#)
- [ ] Test all space transitions (HOME→SUB, HOME→PAR, HOME→REL, exits)
- [ ] Check console logs for errors
- [ ] Verify wedge lighting for entry/exit chords
- [ ] Test bonus wedges (V/ii, ii/vi) if applicable
- [ ] Check triple-tap behavior in SUB/REL
- [ ] Test MIDI input, keyboard clicks, sequencer playback

---

## 8. 🎛️ Current State (v4.4.0)

### Working Features
- ✅ All 12 major keys with MIDI transpose
- ✅ Space transitions (HOME/SUB/PAR/REL)
- ✅ ALL space transitions re-map in destination key (v4.0.70)
- ✅ Triple-tap V/V7 chord exit from SUB (v4.0.65)
- ✅ Tap history updates after re-mapping (v4.0.64)
- ✅ Number keys 1-12 play wedge functions reliably (v4.0.70)
- ✅ Sequencer handles zero-duration items (v4.0.70)
- ✅ Dual-key architecture (effective + base)
- ✅ Bonus wedges (V/ii, ii/vi) - ONLY in HOME space (v4.2.1)
- ✅ Suspended chords (sus2, sus4) - bass-dependent (v4.2.0)
- ✅ Augmented chords - bass-dependent, enharmonic naming (v4.2.0)
- ✅ Stability debouncing
- ✅ Song sharing via URL (iframe postMessage)
- ✅ MIDI input/output support
- ✅ Full synthesizer module (v4.4.0) - 47 parameters, 3 oscs, VCF, LFO

---

## 9. 🔊 Audio Engine (Current State)

### Location
**Files**:
- `src/audio/Synthesizer.ts` - Core synth engine (337 lines)
- `src/audio/types.ts` - Type definitions (127 lines)
- `src/HarmonyWheel.tsx` - Wrapper functions (lines 4982-5027)
**Version**: v4.4.0 (full synthesizer with 47 parameters)

### Current Architecture (v4.4.0)
```typescript
// ✅ NEW: Extracted to src/audio/Synthesizer.ts

// Up to 3 oscillators (only if gain > 0)
osc1, osc2, osc3: {
  wave: sine|square|sawtooth|triangle
  gain: 0-1
  tune: cents (-1200 to +1200)
  pan: -1 (left) to +1 (right)
}

// VCA Envelope
vcaA: 10ms    (attack)
vcaD: 90ms    (decay)
vcaS: 0.15    (sustain level)
vcaR: 50ms    (release - exponential)

// VCF (Filter with envelope)
vcfType: lowpass|highpass|bandpass
vcfFreq: 20-20000 Hz
vcfRes: Q value (0.1-30)
vcfA/D/S/R: separate ADSR for filter
vcfAmount: 0-1 (envelope depth)

// LFO (13 modulation targets)
lfoSpeed: Hz or tempo-synced
lfoDepth: 0-1 (master depth)
Targets: VCA, VCF, Osc1/2/3 Pitch, Osc1/2/3 Pan, Osc1/2/3 Phase

// Signal Chain
oscs → panners → filter → vca → masterGain → output
         ↑         ↑       ↑
        LFO ←──────┴───────┴── (if enabled)
```

### Key Sections in Synthesizer.ts
- **Lines 24-124**: `parseSynthParams()` - Parse @param directives from song text
- **Lines 126-135**: `getLFOFrequency()` - Calculate LFO rate (tempo sync/Hz)
- **Lines 137-313**: `playNoteWithSynth()` - Main synthesizer engine
  - Lines 158-187: Create up to 3 oscillators with pan
  - Lines 195-208: VCF (filter) with envelope
  - Lines 211-218: VCA envelope
  - Lines 228-295: LFO with 13 modulation targets
  - Lines 298-299: Start oscillators
- **Lines 315-345**: `stopNoteById()` - Note release with exponential curves
- **Lines 347-353**: `stopNote()` - Stop all instances of a MIDI note
- **Lines 355-359**: `stopAllNotes()` - Panic button

### Current ADSR Values
- **Attack**: 10ms (0 → 0.25)
- **Decay**: 90ms (0.25 → 0.15)
- **Sustain**: 0.15 (holds infinitely)
- **Release**: 50ms exponential (on note-off)

### Version History

#### v4.3.1 (2025-11-13) - Volume Reduction
- Peak level: 0.5 → 0.25 (50% reduction)
- Sustain level: 0.3 → 0.15 (50% reduction)
- **Reason**: User reported distortion

#### v4.3.0 (2025-11-13) - Simplification
1. **Removed percussive oscillator (osc3)** - was causing artifacts
2. **Removed velocity curves** - velocity now only affects amplitude (linear)
3. **Removed velocity modulation of ADSR** - fixed envelope regardless of velocity
4. **Simplified signal chain** - single sine wave only

#### v4.2.5 - Bug Fixes
1. **Bypassed compressor** (line 5038) - was causing volume swells on quiet release
2. **Reduced MIDI release**: 1.5s → 50ms exponential - notes now release properly
3. **Fixed wedge drag release**: 400ms → 50ms - prevents exit chords on quick drags

#### v4.2.4
- **Removed auto-fade logic** - notes sustain infinitely (user requirement)

---

## 10. 🎹 CRITICAL: What NOT to Change (Audio Engine)

1. **Don't restore osc3** without user request - it was causing percussive artifacts
2. **Don't add auto-fade** - user explicitly wants infinite sustain
3. **Don't restore velocity curves** - velocity should ONLY affect amplitude
4. **Don't reconnect compressor** - it was causing volume swells on quiet release
5. **Keep release at 50ms** - longer values caused stuck notes

---

## 11. 🎛️ Sequencer Comment Syntax

**1. Section Labels (Standalone)**
```
(Verse)
|C| Am| F| G|
```

**2. Old Syntax - Colon Outside Parentheses**
```
|(comment): Chord|
```
Example: `|(this might show as EmMaj7): Em7|`

**3. NEW Syntax - Semicolon Inside Parentheses (RECOMMENDED)**
```
ChordBefore (comment; Chord1 Chord2 Chord3)
```
Example: `|C (stand-in for A7; C#dim)|`
- Chords BEFORE parentheses: NO comment
- Chords AFTER semicolon: ALL get the comment

**Limitation**: Comments CANNOT span bar lines (`|` delimiter breaks groups)

---

## 12. 🎹 Synth Parameters (v4.4.0 - COMPLETE)

### Implementation Status
✅ **DONE** - Full synthesizer with 47 parameters implemented in `src/audio/Synthesizer.ts`

### All Parameters (47 total)

**Oscillators (12 params)**:
- `@osc1Wave`, `@osc2Wave`, `@osc3Wave` - sine|square|sawtooth|triangle
- `@osc1Gain`, `@osc2Gain`, `@osc3Gain` - 0-1
- `@osc1Tune`, `@osc2Tune`, `@osc3Tune` - cents (-1200 to +1200)
- `@osc1Pan`, `@osc2Pan`, `@osc3Pan` - -1 (left) to +1 (right)

**VCA Envelope (4 params)**:
- `@vcaA` - Attack (ms)
- `@vcaD` - Decay (ms)
- `@vcaS` - Sustain (0-1)
- `@vcaR` - Release (ms)

**VCF Filter (8 params)**:
- `@vcfType` - lowpass|highpass|bandpass|notch
- `@vcfFreq` - Frequency (20-20000 Hz)
- `@vcfRes` - Resonance/Q (0.1-30)
- `@vcfA`, `@vcfD`, `@vcfS`, `@vcfR` - Filter ADSR (ms / 0-1)
- `@vcfAmount` - Envelope depth (0-1)

**LFO (16 params)**:
- `@lfoSpeed` - Hz or tempo factor (0.01-20)
- `@lfoSpeedSync` - on|off (tempo sync)
- `@lfoDepth` - Master depth (0-1)
- `@lfoTargetVCA` - on|off
- `@lfoTargetVCF` - on|off
- `@lfoTargetOsc1Pitch`, `@lfoTargetOsc2Pitch`, `@lfoTargetOsc3Pitch` - on|off
- `@lfoTargetOsc1Pan`, `@lfoTargetOsc2Pan`, `@lfoTargetOsc3Pan` - on|off
- `@lfoTargetOsc1Phase`, `@lfoTargetOsc2Phase`, `@lfoTargetOsc3Phase` - on|off (FM)

**Master (1 param)**:
- `@masterGain` - Overall volume (0-1)

### Usage in Songs
Add parameters to song text, typically before chord progression:
```
@osc1Wave saw
@osc1Gain 0.3
@osc2Wave square
@osc2Gain 0.15
@osc2Tune 7
@vcaA 5
@vcaD 200
@vcaS 0.4
@vcaR 100
@vcfType lowpass
@vcfFreq 2000
@vcfRes 5
@vcfAmount 0.8

|I| IV| V| I|
```

### Preset Examples
See [AUDIO_ENGINE_SIMPLIFICATION_SESSION.md](AUDIO_ENGINE_SIMPLIFICATION_SESSION.md) for preset examples:
- Warm Pad
- Plucky Bass
- Vibrato Lead
- Auto-Pan Pad

### Architecture Decision - RESOLVED
✅ **Extracted to separate module** (`src/audio/`)
- Clean separation of concerns
- Testable, reusable
- HarmonyWheel.tsx reduced by 106 lines
- Ready for future enhancements

---

## 13. 🔗 MIDI Output (iframe Issue - RESOLVED)

### Problem
MIDI output doesn't work in iframe on beatkitchen.io

### Root Cause
iframes block Web MIDI API by default for security

### Solution
Paul (beatkitchen.io owner) needs to add `allow="midi"` to iframe:
```html
<iframe src="https://chord-wheel-plum.vercel.app/" allow="midi"></iframe>
```

### Documentation
- `INSTRUCTIONS_FOR_PAUL.md` - Updated with MIDI permission requirement
- `iframe-parent-script.js` - Notes about `allow="midi"`

---

## 14. 📝 Engine Flow (Quick Reference)

```
MIDI notes → detectChord()
  → convertToRelative(effectiveKey) for mapping
  → convertToRelative(baseKey) for space checks
  → mapChordToFunction()
  → addTapToHistory() [BEFORE space check]
  → evaluateSpaceTransition(pcsRelativeToBase)
  → IF space transition: re-map in destination key
  → applyStability()
  → return EngineResult
```

---

## 15. 🚀 Your Next Steps (Synth Design Session)

1. **Read this entire file** ✅
2. **Check current version** in HarmonyWheel.tsx line 2 (should be v4.3.1)
3. **Review Section 12** (Synth Parameters) for user's requirements
4. **When you touch code**:
   - Update version in 3 places (Section 3)
   - Add changelog to header
   - Test thoroughly (Section 7)
5. **Expose synth parameters**:
   - Parse `@osc1GAIN`, `@osc1WAVE`, `@vcaA`, `@vcaD`, `@vcaS`, `@vcaR`
   - Add UI controls in sequencer editor
   - Update `playNote()` to use parameter values
   - Store in song state

---

## 16. 📚 Additional Documentation

- **CLAUDE_PROJECT_GUIDE.md** - Detailed theory & architecture (this file supersedes it)
- **BUG_FIXES_SESSION.md** - Post-engine-cleanup bug fixes
- **AUDIO_ENGINE_SIMPLIFICATION_SESSION.md** - v4.3.0-v4.3.1 changes
- **INSTRUCTIONS_FOR_PAUL.md** - iframe setup for beatkitchen.io
- **src/data/demoSongs.ts** - Comment syntax examples

---

## 17. 🤖 Communication Rules

### With User
- Never over-promise - test first!
- Always show line numbers with markdown links
- Use console logs liberally for debugging
- Ask before major refactors

### With Future Claude
- Update this file when architecture changes
- Keep version history in changelogs
- Preserve critical insights (dual-key, space transitions, etc.)
- **This is the ONE file to read** - keep it comprehensive but concise

---

**END OF GUIDE**

**TO FUTURE CLAUDE**: This is your one-stop handoff document. Read it first, update it as you learn, pass it forward. When in doubt, follow the Bible (Section 1).
