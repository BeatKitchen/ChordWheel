# HarmonyWheel Project Guide for Claude Code

**CRITICAL**: Read this file at the start of EVERY session. Update it when architecture changes. Pass it forward.

---

## 1. Architecture Overview

### The Bible (v4.0 Refactor)
The application underwent a **CRITICAL v4.0 refactor** that separated the engine from React:

```
┌─────────────────────────────────────────────┐
│         HarmonyWheel.tsx (Adapter)          │
│  - React state management                   │
│  - MIDI input handling                      │
│  - UI rendering                             │
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

**GOLDEN RULE**: Engine = pure functions. Adapter = React state. NEVER mix them.

---

## 2. Harmony Wheel Theory (The Bible)

### Function-Based System
The Harmony Wheel is **function-centric**, not pitch-centric:
- **12 wedges = 12 harmonic functions** (I, ii, V/V, iii, V/vi, iv, IV, V, V/ii*, vi, ♭VII, ii/vi*)
- All chords map to Roman numeral functions FIRST, then render as specific pitches based on current key
- **Transposition = relabel chords, keep functions fixed**
- **Spaces = lenses that re-anchor the tonic** (C in HOME, A in REL, F in SUB, Cm/E♭ in PAR)

### Diminished Chord Naming (CRITICAL)

**Diminished chords are named after the THIRD of the dominant they substitute:**
- The third of a dominant 7th chord is ALWAYS a major third
- Major thirds are ALWAYS spelled with sharps (never flats)
- This is true in ALL keys, regardless of key signature

**The Three Functional Diminished Chords:**
- **Relative PC 1** → third of A7 (V/ii) → ALWAYS C# (never Db)
- **Relative PC 6** → third of D7 (V/V) → ALWAYS F# (never Gb)
- **Relative PC 8** → third of E7 (V/vi) → ALWAYS G# (never Ab)
- **Relative PC 11** → 7th degree (ii/vi) → B natural

**Examples:**
- Key C: relative PC 1 = absolute PC 1 → C#dim (third of A7)
- Key F: relative PC 8 = absolute PC 1 → C#dim (third of A7, which is V/vi in F)
- Key G: relative PC 1 = absolute PC 8 → G#dim (third of E7, which is V/ii in G)

**Implementation**: Uses RELATIVE PC position, always returns SHARP_NAMES for functional dims.

**Location**: `lib/theory.ts` `dimRootName()` function (lines 102-114)

### The 4 Spaces (Key of C Example)

**HOME** (Base major key)
- Tonic: C
- All 12 wedges active
- Entry chords:
  - vi triple-tap → REL
  - C7, Gm, E°/E°7/Eø7 → SUB
  - Cm, E♭, A♭, D♭ → PAR

**REL (Relative Minor)**
- Tonic: vi (A minor in key C)
- Wheel rotates so vi sits at 12 o'clock
- Entry: Triple-tap vi (Am/Am7) in HOME
- Exit: Triple-tap I (C/Cmaj7) in REL

**SUB (Subdominant)**
- Tonic: IV (F major in key C) - **ephemeral key center**
- Entry: C7, Gm/Gm7, E°/E°7/Eø7
- **STAY chords**: F/Fmaj7, Gm/Gm7, E♭, B♭, B♭m, **C7**
- **TRIPLE-TAP EXIT**: **C triad** (NOT C7) - this is the **V chord in SUB**
- **Exit to PAR**: Cm, D♭, A♭ (parallel minor entry chords)
- **Illegal chords**: Stay in SUB, display only (don't exit)
- **Critical**: F is **I** in SUB, Gm is **ii**, C is **V** (not I!)

**PAR (Parallel Minor)**
- Tonic: Cm or relative E♭
- Entry: Cm, E♭, A♭, D♭
- Stay: Cm, D♭, E♭, A♭, Fm/Fm7, G7
- Exit: **C major** → HOME (relative major of Cm/E♭), F/F7 → HOME, Gm → SUB

### Dual-Key Architecture
The engine uses TWO keys simultaneously:

- **`effectiveKey`**: Changes per space (F in SUB when baseKey is C)
  - Used for: Chord naming, function mapping, display
  - Updates when space changes

- **`baseKey`**: Always the HOME key (never changes)
  - Used for: Space transition pattern matching
  - Stable reference point

**Example**: In key C, playing Gm enters SUB:
- `baseKey`: C (always)
- `effectiveKey`: F (SUB's ephemeral key)
- Gm maps as "ii" in key F, lights ii wedge

### Space System
Four spaces: **HOME, SUB, PAR, REL**

Each space has an **ephemeral key center**:
- HOME: Base key (C in key of C)
- SUB: Subdominant key (F in key of C) - use `getSubKey(baseKey)`
- PAR: Parallel minor (Cm in key of C) - use `getParKey(baseKey)`
- REL: Relative minor (Am in key of C) - same as baseKey

**Space Transitions**:
1. **Entry chords**: Borrowed chords that enter a new space (e.g., Gm → SUB)
2. **Exit chords**: Return to HOME (e.g., illegal chords in SUB)
3. **Triple-tap**: Three rapid taps of same function (vi→REL, I in SUB/REL→HOME)

### Space Transition Chord Re-mapping (v4.0.62-63)
**CRITICAL**: Entry/exit chords don't map in current space, must re-map in destination:

```typescript
// Entry: Gm entering SUB from HOME (key C)
// - Relative to C (current): [2,7,10] - no match
// - Re-map relative to F (destination): [9,2,5] = ii ✅

// Exit: Gm exiting SUB to HOME (key D)
// - Relative to G (current): [7,0,3] - no match
// - Re-map relative to D (destination): [0,5,8] = iv ✅
```

Code location: `lib/engine/index.ts` lines 170-204

---

## 3. Version Update Protocol

**EVERY code change requires version bumps in EXACTLY 3 places:**

### 1. Engine file header (e.g., `lib/engine/index.ts`)
```typescript
/**
 * index.ts — v4.0.XX  ← UPDATE THIS
 * 📁 INSTALL TO: src/lib/engine/index.ts
 * 🔄 VERSION: 4.0.XX ← AND THIS
 */

// EOF - index.ts v4.0.XX  ← AND THIS (bottom of file)
```

### 2. HarmonyWheel.tsx header
```typescript
/*
 * HarmonyWheel.tsx — v4.0.XX 🎯 DESCRIPTIVE TITLE  ← UPDATE
 *
 * 🔧 v4.0.XX CHANGES:  ← ADD CHANGELOG
 * - What changed
 * - Why it matters
 */

const HW_VERSION = 'v4.0.XX';  ← UPDATE (line ~166)

const APP_VERSION = "v4.0.XX-description";  ← UPDATE (line ~1196)

// EOF - HarmonyWheel.tsx v4.0.XX  ← UPDATE (bottom)
```

### 3. Git branch naming
If working on branch, use format: `engine-v4.0.XX-feature-name`

**Version Numbering**:
- Major changes: v4.1.0, v4.2.0
- Minor features: v4.0.1, v4.0.2
- Bug fixes: v4.0.11, v4.0.12

---

## 4. Key Files Reference

### Engine (Pure Logic)
- **`lib/engine/index.ts`**: Main orchestrator, calls detection → mapping → spaces → stability
- **`lib/engine/detection.ts`**: MIDI → chord name + pitch classes
- **`lib/engine/mapping.ts`**: Pitch classes → harmonic function (I, ii, V, etc.)
- **`lib/engine/spaces.ts`**: Space transition logic (HOME/SUB/PAR/REL)
- **`lib/engine/stability.ts`**: Debounce rapid chord changes
- **`lib/engine/wedges.ts`**: Function → wedge ID (0-11)

### Adapter (React)
- **`src/HarmonyWheel.tsx`**: Main component (8900+ lines)
  - Lines 1-500: Imports, types, constants
  - Lines 500-1500: State management, MIDI handling
  - Lines 1500-3000: Engine integration
  - Lines 3000-8900: UI rendering (wheel, wedges, sequencer)

### Theory
- **`lib/theory.ts`**: Music theory utilities (getSubKey, getParKey, note names)
- **`lib/types.ts`**: TypeScript types (Fn, KeyName, etc.)

---

## 5. Common Tasks

### Adding a New Harmonic Function
1. Add pattern to `lib/engine/mapping.ts`
2. Add wedge ID to `lib/engine/wedges.ts`
3. Update `getAllWedgePositions()` if needed
4. Test across all spaces (HOME/SUB/PAR/REL)

### Fixing Space Transitions
1. Check `lib/engine/spaces.ts` for pattern matching
2. Verify dual-key usage: `pcsRelativeToBase` for patterns, `effectiveKey` for mapping
3. Test re-mapping logic in `lib/engine/index.ts` lines 170-204
4. Console logs: `🔍 PCS Absolute`, `🔄 Re-mapping space transition chord`

### Debugging Wedge Lighting
1. Check console for `🔍 PCS Absolute` log (shows pitch classes)
2. Verify function mapping: `mapped?.function`
3. Check space action: `spaceAction.action` (stay/enter/exit)
4. For transitions, look for `🔄 Re-mapping` and `✅ Space transition chord mapped`
5. Verify wedge ID: `getFunctionWedgeId(function)` returns 0-11

### Sequencer Comment Syntax
The sequencer supports three types of comments for annotating chord progressions:

**1. Section Labels (Standalone)**
```
(Verse)
|C| Am| F| G|

(Chorus)
|F| G| C| Am|
```
- No chords attached
- Used for marking song structure

**2. Old Syntax - Colon Outside Parentheses**
```
|(comment): Chord|
```
- Example: `|(this chord might show up as EmMaj7): Em7|`
- Comment applies to chord AFTER the colon
- Works for single chords only

**3. NEW Syntax - Semicolon Inside Parentheses (RECOMMENDED)**
```
ChordBefore (comment; Chord1 Chord2 Chord3)
```
- Example: `|C (this is a stand in for A7; C#dim)|`
- Chords BEFORE the parentheses have NO comment
- Chords AFTER the semicolon ALL get the comment
- Can apply one comment to multiple chords

**Important Limitation**: Comments CANNOT span bar lines. The `|` delimiter breaks comment groups.

❌ Won't work: `|(comment; | C | G | Am | )|`
✅ Will work: `|(comment; C G Am)|`

**See full documentation**: `src/data/demoSongs.ts` lines 10-85

---

## 6. Known Issues & Solutions

### Issue: Space-entry chord gets `function: null`
**Solution**: Re-map in destination key (v4.0.62)
```typescript
if (!mapped && spaceAction.action === "enter") {
  destinationKey = getSubKey(baseKey); // or getParKey
  pcsInDestination = convertToRelative(detected.pcsAbsolute, destinationKey);
  finalMapped = mapChordToFunction(detected, pcsInDestination, showBonusWedges);
}
```

### Issue: Space-exit chord gets `function: null`
**Solution**: Re-map in HOME key (v4.0.63)
```typescript
if (!mapped && spaceAction.action === "exit") {
  destinationKey = baseKey; // Always HOME for exit
  pcsInDestination = convertToRelative(detected.pcsAbsolute, destinationKey);
  finalMapped = mapChordToFunction(detected, pcsInDestination, showBonusWedges);
}
```

### Issue: Triple-tap not triggering
**Solution**: Update tap history AFTER re-mapping (v4.0.64)
```typescript
// WRONG (v4.0.63): Update tap history before re-mapping
const newTapHistory = mapped?.function ? addTapToHistory(...) : ...;
// Re-mapping happens later, finalMapped gets function but history wasn't updated

// CORRECT (v4.0.64): Update tap history after re-mapping
let newTapHistory = mapped?.function ? addTapToHistory(...) : ...;
if (finalMapped) {
  newTapHistory = addTapToHistory(finalMapped.function, state.tapHistory);
}
```
**Check**:
1. Tap history update in `lib/engine/index.ts` line ~162 (tentative) and ~229 (final)
2. Triple-tap detection in `lib/engine/spaces.ts` line ~278
3. Timing: TAP_WINDOW_MS (1500ms), MAX_GAP_MS (500ms)

### Issue: Bonus wedge appears on space exit chord (v4.0.70)
**Problem**: C major [0,4,7] in PAR (effectiveKey=Eb) maps to V/ii [4,9,1] before exit processed
**Solution**: Remove `!mapped` condition - re-map ALL space transitions (v4.0.70)
```typescript
// WRONG (v4.0.63): Only re-map if initial mapping failed
if (!mapped && (spaceAction.action === "enter" || spaceAction.action === "exit")) {

// CORRECT (v4.0.70): Always re-map space transitions, even if initial mapping succeeded
if (spaceAction.action === "enter" || spaceAction.action === "exit") {
```
**Why**: Set-based pitch class matching can match wrong patterns in wrong keys. Space transitions MUST re-map in destination key to ensure correct function.

### Issue: Performance pad keys play inconsistently (v4.0.70)
**Problem**: Number keys 1-12 sometimes play one note, sometimes full chord
**Solution**: Update ref synchronously in previewFn(), use ref in handlers
```typescript
// In previewFn() (HarmonyWheel.tsx:5602):
setLatchedAbsNotes(fitted);
latchedAbsNotesRef.current = fitted; // ✅ Update ref synchronously

// In keyup handler (HarmonyWheel.tsx:2803):
if (rhythmEnabledRef.current && latchedAbsNotesRef.current.length > 0) {
  // Use ref, not state - avoids async race condition
}
```

### Issue: Sequencer crashes with rapid Abm7 loop (v4.0.70)
**Problem**: Zero-duration items (rests, annotations) cause synchronous infinite loop
**Solution**: Use minimum 1ms delay instead of 0ms (HarmonyWheel.tsx:2880)
```typescript
// WRONG: setTimeout(..., 0) fires synchronously, creates infinite loop
const interval = isZeroDuration ? 0 : (60 / tempo) * beatsPerBar * itemDuration * 1000;

// CORRECT: Minimum 1ms breaks synchronous loop
const interval = isZeroDuration ? 1 : (60 / tempo) * beatsPerBar * itemDuration * 1000;
```

---

## 7. Testing Checklist

Before marking ANY task complete:
- [ ] Test in at least 3 keys (C, D, F#)
- [ ] Test all space transitions (HOME→SUB, HOME→PAR, HOME→REL, exits)
- [ ] Check console logs for errors
- [ ] Verify wedge lighting for entry/exit chords
- [ ] Test bonus wedges (V/ii, ii/vi) if applicable
- [ ] Check triple-tap behavior in SUB/REL

---

## 8. Communication Rules

### With User
- Never over-promise ("this should work across all keys" → test first!)
- Always show line numbers: `[file.ts:42](file.ts#L42)`
- Use console logs liberally for debugging
- Ask before major refactors

### With Future Claude
- Update this file when architecture changes
- Add new "Known Issues & Solutions" as discovered
- Keep version history in changelogs
- Preserve critical insights (like dual-key architecture)

---

## 9. Current State (v4.2.1)

### Working Features
- ✅ All 12 major keys with MIDI transpose
- ✅ Space transitions (HOME/SUB/PAR/REL)
- ✅ Space-entry chord wedge lighting (v4.0.62)
- ✅ Space-exit chord wedge lighting (v4.0.63, v4.0.70)
- ✅ ALL space transitions re-map in destination key (v4.0.70) - **prevents false bonus wedges**
- ✅ Triple-tap V/V7 chord exit from SUB (v4.0.65) - **C triad in key C**
- ✅ Tap history updates after re-mapping (v4.0.64)
- ✅ Number keys 1-12 play wedge functions reliably in performance mode (v4.0.70)
- ✅ Performance pad ref/state synchronization (v4.0.70)
- ✅ Sequencer handles zero-duration items without crashing (v4.0.70)
- ✅ Dual-key architecture (effective + base)
- ✅ Bonus wedges (V/ii, ii/vi) - **ONLY in HOME space** (v4.2.1)
- ✅ Suspended chords (sus2, sus4) - bass-dependent detection (v4.2.0)
- ✅ Augmented chords - bass-dependent, enharmonic naming (v4.2.0)
- ✅ C major exits PAR to HOME - relative major of Cm/Eb (v4.2.1)
- ✅ Stability debouncing

### Keyboard Shortcuts (Performance Mode)
- **1-12**: Play wedge functions (I, ii, V/V, iii, V/vi, iv, IV, V, V/ii, vi, ♭VII, ii/vi)
- **Shift+1-12**: Play 7th chords
- **Space**: Play/pause sequencer
- **b**: Toggle performance mode
- **Escape**: Stop sequencer

### Keyboard Shortcuts (Non-Performance Mode)
- **1-5**: Switch skill levels (ROOKIE → EXPERT)

### Critical UI Constraints
- **Banner Links Must Be Clickable**: Banner div MUST have `touchAction: 'auto'`, `pointerEvents: 'auto'`, `userSelect: 'auto'`, `zIndex: 10`, `position: 'relative'` to override parent's `touchAction: 'pan-y'` and allow link clicks (lines 6388-6403)
- **Transpose Buttons Always Visible in Expert Mode**: Transpose selector (TR) and Transpose Bypass (TR ON/OFF) buttons MUST always be visible in EXPERT mode to prevent UI shifting. Bypass button is disabled (opacity 0.5) when transpose=0 but still rendered (line 7220)
- **iframe Scroll Prevention**: When in iframe, body and html MUST have `overflow: hidden` to prevent unwanted scroll (lines 568-588)

### Pending Issues
- ⚠️ Need comprehensive testing across all 12 keys (especially with triple-tap)

---

## 10. Quick Reference: Engine Flow

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

**END OF GUIDE**

**TO FUTURE CLAUDE**: Read this entire file first. Update sections 6, 9, 10 as you learn more. Keep this under 500 lines. When in doubt, follow the Bible (section 1).
