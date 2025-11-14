# Audio Engine Simplification Session
**Date**: 2025-11-13
**Versions**: v4.2.5 → v4.3.0 → v4.3.1

## Session Summary
User requested audio engine simplification to:
1. Debug envelope/ADSR issues
2. Prepare clean foundation for custom synthesizer design (next session)

## Changes Made

### v4.3.1 - Volume Reduction
**User feedback**: "Bring the volume down by about half. It's distorted."

**Changes**:
- Peak level: 0.5 → 0.25 (50% reduction)
- Sustain level: 0.3 → 0.15 (50% reduction)
- **File**: `src/HarmonyWheel.tsx` lines 5003-5004

**Result**: Clean sound, no distortion

---

### v4.3.0 - Audio Engine Simplification
**User request**: "temporarily bypass all but the basic sine wave oscillator. Remove any type of velocity mapping that changes ADSR. It should only act on amplitude. let's simplify."

**Changes**:

#### 1. Removed Percussive Oscillator (osc3)
- **Lines commented out**: 5025, 5028, 5037, 5072
- **Placeholder added**: `osc3: osc1` at line 5044 (for compatibility)
- **Before**: 3 oscillators (sine, detuned sine, percussive click)
- **After**: 1 oscillator (sine wave only)

#### 2. Removed Velocity Curves
- **Line**: 4995
- **Before**: Complex logarithmic/exponential velocity mapping
- **After**: Direct linear mapping `gain1.gain.value = velocity`
- **Result**: Velocity only affects amplitude, nothing else

#### 3. Removed Velocity Modulation of ADSR
- **Lines**: 5001-5008
- **Before**: Attack/decay/sustain levels varied based on velocity
- **After**: Fixed envelope values regardless of velocity

#### 4. Fixed ADSR Envelope
Current values (as of v4.3.1):
- **Attack**: 10ms (0 → 0.25)
- **Decay**: 90ms (0.25 → 0.15)
- **Sustain**: 0.15 (holds indefinitely)
- **Release**: 50ms exponential (on note-off)

#### 5. Simplified Signal Chain
```
osc1 (sine) → gain1(velocity) → highpass → mainGain(ADSR) → makeupGain → output
```

**Removed from chain**:
- osc2 (detuned sine)
- osc3 (percussive element)
- Compressor (bypassed in v4.2.5)

---

### v4.2.5 - Bug Fixes (Previous Session)
**User bug reports**:
1. "MIDI notes don't sustain as long as key is held - release too long"
2. "Sometimes sounds louder when releasing key (playing quietly)"
3. "Can we bypass the compressor?"
4. "Wedge drag causing exit chords"
5. "Clicks at end of notes when playing many notes at once"

**Fixes**:
1. **Reduced MIDI release**: 1.5s → 50ms exponential (lines 5074-5080)
2. **Bypassed compressor**: Removed from signal chain (line 5038)
   - Root cause: Volume swells on quiet release
3. **Fixed wedge drag release**: 400ms → 50ms (lines 466-468)
4. **Simplified release envelope**: Single exponential ramp (prevents clicks)

---

## Current Audio Engine State (v4.3.1)

### Location
**File**: `src/HarmonyWheel.tsx`
**Function**: `playNote()` - lines 4978-5082

### Key Code Sections
- **Line 4985-4990**: Oscillator creation (osc1 only, sine wave)
- **Line 4994-4995**: Velocity → amplitude (direct linear)
- **Line 5001-5008**: ADSR envelope (fixed values)
- **Line 5022-5031**: Signal chain (simplified)
- **Line 5065-5066**: Release envelope (50ms exponential)

### Architecture
```typescript
// Oscillator
const osc1 = ctx.createOscillator();
osc1.type = 'sine';
osc1.frequency.value = freq;

// Velocity → Amplitude (linear)
const gain1 = ctx.createGain();
gain1.gain.value = velocity;

// ADSR Envelope
const mainGain = ctx.createGain();
mainGain.gain.setValueAtTime(0, now);
mainGain.gain.linearRampToValueAtTime(0.25, now + 0.010);  // 10ms attack
mainGain.gain.linearRampToValueAtTime(0.15, now + 0.100);  // 90ms decay
// Sustains at 0.15 indefinitely

// Signal Chain
osc1 → gain1(velocity) → highpass → mainGain(ADSR) → makeupGain → output
```

---

## CRITICAL: What NOT to Change

1. **Don't restore osc3** without user request - it was causing percussive artifacts
2. **Don't add auto-fade** - user explicitly wants infinite sustain (v4.2.4 decision)
3. **Don't restore velocity curves** - user wants velocity to ONLY affect amplitude
4. **Don't reconnect compressor** - it was causing volume swells on quiet release
5. **Keep release at 50ms** - longer values caused stuck notes and unwanted sustain

---

## MIDI Output Bug (Resolved)

### Problem
User's friend (Scott Hampton) couldn't get MIDI output to work when using Harmony Wheel on beatkitchen.io (iframe).

### Root Cause
iframes block Web MIDI API by default for security. Even though:
- MIDI device appeared in dropdown ✅
- User selected it ✅
- Everything looked correct ✅
- Browser blocked `navigator.requestMIDIAccess()` 🚫

### Solution
Paul (who runs beatkitchen.io) needs to add `allow="midi"` to the iframe tag:
```html
<iframe src="https://chord-wheel-plum.vercel.app/" allow="midi"></iframe>
```

### Documentation Updated
- `INSTRUCTIONS_FOR_PAUL.md` - Added Step 1 with MIDI permission requirement
- `iframe-parent-script.js` - Added comment about `allow="midi"` requirement
- Both files now include troubleshooting section for MIDI issues

---

## Testing Checklist (All Passed)

- ✅ No distortion (volume reduced to 50%)
- ✅ Clean sine wave tone
- ✅ Responsive attack (10ms)
- ✅ Smooth decay (90ms)
- ✅ Infinite sustain (no auto-fade)
- ✅ Clean release (50ms, no clicks)
- ✅ Velocity affects amplitude only (linear)
- ✅ Works on: wedge clicks, keyboard, MIDI input, performance pads
- ✅ Build succeeds with no errors

---

## Next Steps (User's Intent)

User: "Next, we are going to design a simple synthesizer. But we are going to do it in a new conversation, so document everything you've done here and leave a trail of breadcrumbs for Claude in the Claude project guide."

**Expectations for next session**:
- Design and build a custom synthesizer with controls
- Current state (v4.3.1) is a clean starting point:
  - Single sine oscillator
  - Linear velocity → amplitude
  - Fixed ADSR (10ms/90ms/0.15/50ms)
  - No distortion, clean sound
- User wants something simple but with proper controls

**Documentation Added**:
- New section 11 in `CLAUDE_PROJECT_GUIDE.md`: "What I Did to the Synthesizer"
- Comprehensive version history (v4.2.4 → v4.2.5 → v4.3.0 → v4.3.1)
- Critical warnings about what NOT to change
- Current audio engine location and architecture
- MIDI output bug resolution

---

## Files Modified This Session

1. **src/HarmonyWheel.tsx**
   - Version: v4.2.5 → v4.3.0 → v4.3.1
   - Lines 5003-5004: Volume reduction
   - Lines 4985-5082: Audio engine simplification
   - Lines 2, 218, 1364, 8388: Version number updates

2. **CLAUDE_PROJECT_GUIDE.md**
   - Added section 11: "What I Did to the Synthesizer"
   - 104 lines of comprehensive documentation
   - Version history, architecture, critical warnings

3. **INSTRUCTIONS_FOR_PAUL.md**
   - Added Step 1: MIDI permission requirement
   - Added troubleshooting section for MIDI issues
   - Updated example iframe with `allow="midi"`

4. **iframe-parent-script.js**
   - Added comment about `allow="midi"` requirement

5. **AUDIO_ENGINE_SIMPLIFICATION_SESSION.md** (this file)
   - Complete session documentation

---

## Quick Reference for Next Claude

**Audio engine location**: `src/HarmonyWheel.tsx` lines 4978-5082
**Current state**: Minimal viable synth (sine wave, linear velocity, fixed ADSR)
**User's next goal**: Design custom synthesizer with controls
**Don't touch**: osc3, auto-fade, velocity curves, compressor
**Version**: v4.3.1-simplified

Read `CLAUDE_PROJECT_GUIDE.md` section 11 for complete context.
