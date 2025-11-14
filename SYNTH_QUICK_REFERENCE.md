# Synthesizer Quick Reference Card

**Version**: v4.4.0 | **Status**: Ready for Testing ✅

---

## How to Use

1. **Load Demo**: Click LOAD → Select "Synth Defaults (v4.4.0)"
2. **Edit**: Add `@parameter value` lines in the editor
3. **Play**: Click Play or use the wheel

---

## Syntax

```
@osc1Wave saw
@osc1Gain 0.3
@vcaA 5
@vcaR 200

|I| IV| V| I|
```

---

## Quick Presets

### Bright Lead
```
@osc1Wave saw
@osc1Gain 0.3
```

### Thick Sound
```
@osc2Gain 0.15
@osc2Tune 7
```

### Plucky
```
@vcaA 1
@vcaR 100
```

### Vibrato
```
@lfoDepth 0.3
@lfoTargetOsc1Pitch on
```

### Auto-Pan
```
@lfoDepth 0.5
@lfoTargetOsc1Pan on
```

### Filter Sweep
```
@vcfFreq 1000
@vcfAmount 0.8
@vcfRes 5
```

---

## All 47 Parameters

### Oscillators (12)
```
@osc1Wave sine|square|sawtooth|triangle
@osc1Gain 0-1
@osc1Tune -1200 to +1200 (cents)
@osc1Pan -1 to +1 (left/right)

@osc2Wave, @osc2Gain, @osc2Tune, @osc2Pan
@osc3Wave, @osc3Gain, @osc3Tune, @osc3Pan
```

### VCA Envelope (4)
```
@vcaA 10    (attack ms)
@vcaD 90    (decay ms)
@vcaS 0.15  (sustain 0-1)
@vcaR 50    (release ms)
```

### VCF Filter (8)
```
@vcfType lowpass|highpass|bandpass|notch
@vcfFreq 20-20000 (Hz)
@vcfRes 0.1-30 (resonance/Q)
@vcfA, @vcfD, @vcfS, @vcfR (envelope)
@vcfAmount 0-1 (depth)
```

### LFO (16)
```
@lfoSpeed 4 (Hz or tempo factor)
@lfoSpeedSync on|off
@lfoDepth 0-1

Targets (all on|off):
@lfoTargetVCA
@lfoTargetVCF
@lfoTargetOsc1Pitch, @lfoTargetOsc2Pitch, @lfoTargetOsc3Pitch
@lfoTargetOsc1Pan, @lfoTargetOsc2Pan, @lfoTargetOsc3Pan
@lfoTargetOsc1Phase, @lfoTargetOsc2Phase, @lfoTargetOsc3Phase
```

### Master (1)
```
@masterGain 0.8 (volume)
```

---

## Defaults (Current Sound)

```
Only osc1 active:
@osc1Wave sine
@osc1Gain 0.25

VCA: 10/90/0.15/50ms
Filter: Wide open (20000 Hz, no effect)
LFO: Off (depth = 0)
```

---

## Tips

- **All parameters optional** - uses defaults if not specified
- **Order doesn't matter** - put anywhere in song text
- **Comments allowed** - Use `(comment)` sections
- **Load demo first** - See all parameters with defaults

---

## Testing Tomorrow

Try these experiments:

1. Load "Synth Defaults" demo
2. Change `@osc1Wave` to `saw` - brighter
3. Enable `@osc2Gain 0.15` - thicker
4. Try `@lfoDepth 0.3` + `@lfoTargetOsc1Pitch on` - vibrato
5. Try `@vcfFreq 1000` + `@vcfAmount 0.8` - filter sweep

---

## Documentation

- **Full Docs**: [V4.4.0_SYNTH_MODULE_SESSION.md](V4.4.0_SYNTH_MODULE_SESSION.md)
- **Module Docs**: [src/audio/README.md](src/audio/README.md)
- **Main Guide**: [CLAUDE.md](CLAUDE.md) section 9 & 12

---

**Ready for testing! Have fun! 🎹**
