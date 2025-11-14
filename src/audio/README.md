# Harmony Wheel Synthesizer Module

**Version**: v4.4.0
**Location**: `src/audio/`
**Status**: ✅ Production Ready

---

## Overview

Full-featured Web Audio synthesizer with 47 parameters, extracted from HarmonyWheel.tsx for clean architecture.

---

## Files

- **`Synthesizer.ts`** (337 lines) - Core synthesizer engine
- **`types.ts`** (127 lines) - TypeScript interfaces and defaults
- **`README.md`** (this file) - Documentation

---

## Features

- 🎹 **3 Oscillators** - Wave type, gain, tune, stereo pan
- 📈 **VCA ADSR** - Amplitude envelope (10/90/0.15/50ms default)
- 🔊 **VCF with ADSR** - Filter envelope with depth control
- 🌊 **LFO System** - 13 modulation targets (tremolo, vibrato, auto-pan, FM)
- 🎚️ **Master Gain** - Overall volume control
- ⚡ **Anti-Click** - Exponential release curves, scheduled stops
- 🎵 **Polyphony** - Up to 10 simultaneous notes
- 📝 **Parameter Parsing** - `@paramName value` syntax

---

## Usage

### Import

```typescript
import {
  playNoteWithSynth,
  stopNoteById,
  stopNote,
  stopAllNotes,
  parseSynthParams,
  getActiveNoteCount
} from './audio/Synthesizer';
import { SynthParams, DEFAULT_SYNTH_PARAMS } from './audio/types';
```

### Play a Note

```typescript
const ctx = new AudioContext();
const params = DEFAULT_SYNTH_PARAMS;

const noteId = playNoteWithSynth(
  ctx,           // AudioContext
  60,            // MIDI note (middle C)
  0.5,           // Velocity (0-1)
  params,        // SynthParams
  120,           // Tempo (for LFO sync)
  true           // isDesktop (mobile boost flag)
);
```

### Stop a Note

```typescript
stopNoteById(ctx, noteId);  // Stop specific instance
stopNote(ctx, 60);          // Stop all instances of MIDI note 60
stopAllNotes(ctx);          // Stop everything (panic)
```

### Parse Parameters from Song

```typescript
const songText = `
@osc1Wave saw
@osc1Gain 0.3
@vcaA 5
@vcaR 200

|C| F| G| C|
`;

const params = parseSynthParams(songText);
// params.osc1Wave === 'sawtooth'
// params.osc1Gain === 0.3
// params.vcaA === 5
// params.vcaR === 200
```

---

## Parameters (47 total)

### Oscillators (12)
```typescript
osc1Wave: 'sine' | 'square' | 'sawtooth' | 'triangle'
osc1Gain: 0-1
osc1Tune: -1200 to +1200  // cents
osc1Pan: -1 to +1         // left to right

// Same for osc2 and osc3
```

### VCA Envelope (4)
```typescript
vcaA: number  // Attack (ms)
vcaD: number  // Decay (ms)
vcaS: number  // Sustain (0-1)
vcaR: number  // Release (ms)
```

### VCF Filter (8)
```typescript
vcfType: 'lowpass' | 'highpass' | 'bandpass' | 'notch'
vcfFreq: 20-20000        // Hz
vcfRes: 0.1-30           // Q/Resonance
vcfA: number             // Attack (ms)
vcfD: number             // Decay (ms)
vcfS: number             // Sustain (0-1)
vcfR: number             // Release (ms)
vcfAmount: 0-1           // Envelope depth
```

### LFO (16)
```typescript
lfoSpeed: 0.01-20        // Hz or tempo factor
lfoSpeedSync: boolean    // true = sync to tempo
lfoDepth: 0-1            // Master depth

// 13 targets (all boolean):
lfoTargetVCA             // Tremolo
lfoTargetVCF             // Filter modulation
lfoTargetOsc1Pitch       // Vibrato/FM
lfoTargetOsc2Pitch
lfoTargetOsc3Pitch
lfoTargetOsc1Pan         // Auto-pan
lfoTargetOsc2Pan
lfoTargetOsc3Pan
lfoTargetOsc1Phase       // FM synthesis
lfoTargetOsc2Phase
lfoTargetOsc3Phase
```

### Master (1)
```typescript
masterGain: 0-1  // Overall volume
```

---

## Signal Chain

```
osc1 → gain → panner ┐
osc2 → gain → panner ├→ filter → vca → masterGain → output
osc3 → gain → panner ┘     ↑       ↑
                          LFO ←─────┴── (if enabled)
```

---

## Defaults (v4.3.1 Sound)

```typescript
// Only osc1 active
osc1Wave: 'sine'
osc1Gain: 0.25
osc2Gain: 0  // OFF
osc3Gain: 0  // OFF

// VCA envelope
vcaA: 10     // 10ms attack
vcaD: 90     // 90ms decay
vcaS: 0.15   // 15% sustain
vcaR: 50     // 50ms release

// VCF (wide open, no effect)
vcfFreq: 20000
vcfAmount: 0

// LFO (off)
lfoDepth: 0
```

---

## Examples

### Bright Sawtooth Lead
```typescript
const params = {
  ...DEFAULT_SYNTH_PARAMS,
  osc1Wave: 'sawtooth',
  osc1Gain: 0.3
};
```

### Detuned Pad
```typescript
const params = {
  ...DEFAULT_SYNTH_PARAMS,
  osc1Gain: 0.2,
  osc2Wave: 'sine',
  osc2Gain: 0.15,
  osc2Tune: 7,     // 7 cents sharp
  vcaA: 100,       // Slow attack
  vcaR: 200        // Long release
};
```

### Vibrato Lead
```typescript
const params = {
  ...DEFAULT_SYNTH_PARAMS,
  lfoSpeed: 5,
  lfoDepth: 0.3,
  lfoTargetOsc1Pitch: true
};
```

### Filter Sweep Bass
```typescript
const params = {
  ...DEFAULT_SYNTH_PARAMS,
  vcfType: 'lowpass',
  vcfFreq: 500,
  vcfRes: 8,
  vcfAmount: 0.8,
  vcfA: 10,
  vcfD: 200
};
```

---

## Architecture Notes

### Why Extract to Module?
1. **Separation of Concerns** - Audio logic independent of React
2. **Testability** - Can unit test synthesizer functions
3. **Reusability** - Can use in other projects
4. **Maintainability** - Easier to add features (effects, wavetables)
5. **Performance** - No React re-renders on audio changes

### Note Management
- Notes stored internally in `activeNotes` Map
- Each note has unique ID: `${midiNote}-${timestamp}-${random}`
- Allows multiple instances of same MIDI note
- Polyphony limit: 10 notes (warns but doesn't steal)

### Anti-Click Measures
1. **Exponential release curves** - Smooth fade-out
2. **Scheduled oscillator stops** - No abrupt cutoffs
3. **Filter bounds checking** - Prevents extreme values
4. **VCF release envelope** - Filter fades with amplitude

---

## Future Enhancements

Potential additions for future versions:

- [ ] **Effects**: Reverb, delay, chorus
- [ ] **Wavetables**: Custom waveforms
- [ ] **LFO Shapes**: Triangle, square, random, envelope
- [ ] **Velocity Curves**: Exponential/logarithmic response
- [ ] **Voice Stealing**: Smart polyphony management
- [ ] **Unison**: Multiple detuned voices per oscillator
- [ ] **Glide/Portamento**: Pitch sliding between notes
- [ ] **Key Tracking**: Filter follows note pitch
- [ ] **Compressor**: Dynamics control
- [ ] **Stereo Width**: Mid/side processing

---

## Performance

- **Bundle Impact**: +1.04 KB (+330 bytes gzipped)
- **CPU Usage**: Minimal (3 oscs + filter + LFO per note)
- **Memory**: ~500 bytes per active note
- **Max Polyphony**: 10 notes (configurable)

---

## Credits

**Author**: Nathan Rosenberg
**Project**: Harmony Wheel (Beat Kitchen)
**Version**: v4.4.0
**Date**: 2025-11-13

---

## See Also

- [V4.4.0_SYNTH_MODULE_SESSION.md](../../V4.4.0_SYNTH_MODULE_SESSION.md) - Implementation notes
- [CLAUDE.md](../../CLAUDE.md) - Project documentation
- [AUDIO_ENGINE_SIMPLIFICATION_SESSION.md](../../AUDIO_ENGINE_SIMPLIFICATION_SESSION.md) - Previous audio work
