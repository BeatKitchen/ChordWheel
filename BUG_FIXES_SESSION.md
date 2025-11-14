# Bug Fixes Session - Post Engine Cleanup

## Context
After removing old detect() engine code (1,319 lines deleted), testing revealed several bugs.
Some may be pre-existing, some may be related to cleanup.

## Cleanup Changes Made (Reference for Debugging)
1. **Deleted**: Old `detect()` function (lines 3945-5271, 1,326 lines)
   - Backup: `OLD_detect_function_BACKUP.txt`
2. **Removed**: 18 `USE_NEW_ENGINE` conditionals
   - Changed: `if (USE_NEW_ENGINE) { detectV4(); } else { detect(); }` → `detectV4();`
3. **Commented**: `USE_NEW_ENGINE` constant (line 231)
4. **Keyboard handlers updated** (lines ~8017-8167):
   - Now use `detectV4()` instead of `detect()`
   - Added check: only call `detectV4()` on mouseLeave if note was held
5. **Share URL fixes**:
   - postMessage communication for iframe (lines 528-563)
   - Share URL points to beatkitchen.io when in iframe (lines 6486-6493)
6. **parseAndLoadSequence** now accepts optional `textOverride` parameter
   - Fixes JSON appearing in editor when loading shared songs

## Bugs to Fix

### 1. Speaker Icon Non-Functional
**Issue**: Speaker icon button doesn't enable/disable audio
**Location**: Lines 8053-8091 in HarmonyWheel.tsx
**Expected**: Toggle `audioEnabled` state
**Status**: ✅ ALREADY FIXED - Button already toggles audioEnabled correctly

### 2. MIDI Input Bounce (Chord Detection)
**Issue**: When playing tetrad, triad detected first → two chords entered
**Example**: Play C-E-G-B → detects "C" then "Cmaj7"
**Root Cause**: Needs debouncing/hysteresis for chord completion
**Fix Applied**:
- Added `midiDetectionDebounceRef` (line 388)
- Debounce detectV4() call by 100ms on MIDI note-on (lines 764-772)
- Clear pending detection when new note arrives
- Only emit chord after 100ms stability window
**Status**: ✅ FIXED

### 3. Redundant Key Directive in Sequencer Display
**Issue**: Key directive shows in both top line (title area) AND bottom line (chord list)
**Expected**: Only show in top line with title
**Fix Applied**:
- Added `item.chord.startsWith("KEY")` to isConfig filter (line 6512)
- Key directives now filtered out of bottom line chord display
- Similar to how RHYTHM, LOOP, TEMPO modifiers are hidden
**Status**: ✅ FIXED

### 4. "Play In C" Button Behavior
**Issue**: Cannot deactivate "Play In C" button
**Current**: Sets transpose, enables transpose switch (one-way)
**Expected**: Click again to toggle OFF (deactivate transpose)
**Fix Applied**:
- Toggle logic: if already transposed to C, clicking sets transpose to 0 (lines 7207-7215)
- Visual feedback: thicker border (2px), darker background, opacity 1 when active (lines 7219-7229)
- When inactive: thin border (1px), dark background, opacity 0.7
- Updated title to indicate toggleable behavior
**Status**: ✅ FIXED

### 5. Non-Clickable Links in Banner
**Issue**: Links in default banner text are not clickable
**Location**: Banner message rendering (lines 6388-6403)
**Root Cause**: Parent container has `userSelect:'none'` and `touchAction:'pan-y'` which prevented link interaction
**Fix Applied** (v2 - Enhanced):
- Added `userSelect: 'auto'` and `WebkitUserSelect: 'auto'` to banner div
- Added `pointerEvents: 'auto'` to override parent's pointer event blocking
- Added `touchAction: 'auto'` to override parent's pan-y restriction (CRITICAL for touch devices)
- Added `zIndex: 10` and `position: 'relative'` to ensure banner is above overlays
- Added `cursor: 'default'` for proper cursor display
- **CRITICAL**: These properties MUST remain to keep links clickable on all devices
**Status**: ✅ FIXED

### 6. Escape Key Behavior
**Issue**: Escape key doesn't close modals/performance mode
**Expected**:
- In performance mode: Exit performance mode
- When load menu open: Close load menu
- General: Close any open modal/overlay
**Fix Applied**:
- Added performance mode check to Escape handler (lines 2998-3002)
- Sets `performanceMode` to false and updates ref when Escape pressed
- Added song menu close: `setShowSongMenu(false)` (line 3005)
- Escape now closes: playback, dropdowns, step record, performance mode, song menu, and blurs inputs
**Status**: ✅ FIXED

### 7. iFrame Scroll Issue
**Issue**: beatkitchen.io/harmony iframe has slight scroll (annoying)
**Root Cause**: Body/html default overflow allows scroll
**Fix Applied**:
- Added useEffect to detect iframe context (lines 568-588)
- Sets `overflow: hidden` on both `document.body` and `document.documentElement`
- Stores original overflow values and restores on unmount
- Only applies when running in iframe (checks `window.parent !== window`)
- Console log: "📐 Iframe detected - disabled body scroll"
**Status**: ✅ FIXED

## Additional Enhancements (Post-Bug Fixes)

### 8. Transpose Buttons Always Visible in Expert Mode
**Issue**: Transpose buttons appearing/disappearing caused UI shifting
**Expected**: Buttons should stay visible to maintain consistent layout
**Fix Applied**:
- Changed Transpose Bypass button condition from `transpose !== 0` to `skillLevel === "EXPERT"` (line 7220)
- Button now always rendered in expert mode, disabled when transpose=0
- Visual feedback: opacity 0.5, not-allowed cursor, dimmed color when disabled
- Prevents layout shift when transpose value changes
- **CRITICAL**: This prevents annoying UI jumps during transpose operations
**Status**: ✅ FIXED

## Testing Checklist (After Each Fix)
- [ ] MIDI input detection
- [ ] Keyboard mouse clicks
- [ ] Space transitions (HOME/SUB/PAR/REL)
- [ ] Bonus wedges
- [ ] Sequencer playback
- [ ] Wedge clicks
- [ ] All 12 keys
- [ ] Performance mode
- [ ] Share functionality

## Revert Instructions (If Cleanup Broke Something)
```bash
# Full revert to before cleanup
cp src/HarmonyWheel.tsx.before-commenting src/HarmonyWheel.tsx

# Or restore from git
git checkout HEAD~1 src/HarmonyWheel.tsx
```

## Notes for Future AI Agent
- The new engine (detectV4) is in `lib/engine/index.ts`
- Old engine code preserved in `OLD_detect_function_BACKUP.txt`
- All keyboard/MIDI handlers now call `detectV4()` directly
- postMessage communication added for iframe song sharing (parent script needed on beatkitchen.io)
