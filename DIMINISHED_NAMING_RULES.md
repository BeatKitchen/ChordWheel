# Diminished Chord Naming Rules

**Version**: 4.1.9
**Status**: IMPLEMENTED & DOCUMENTED

---

## THE RULE

**Diminished chords are named after the THIRD of the dominant chord they substitute.**

**The third of a dominant 7th chord is ALWAYS a major third, and major thirds are ALWAYS spelled with sharps.**

This applies **in ALL keys, in ALL contexts** (live play, sequencer, transposition, all spaces).

---

## The Three Functional Diminished Chords (ALWAYS Sharp)

These are NOT exceptions - they follow the rule perfectly. The third of a dominant is always a major third, and major thirds are always sharp.

### 1. Third of D7 (V/V)
- **Dominant**: D7 = D-F#-A-C
- **Third**: F# (ALWAYS F#, never Gb)
- **Diminished substitute**: F#dim, F#dim7, F#ø7
- **Function**: Lights V/V wedge
- **Relative position**: PC 6 (6 semitones above tonic)
- **Examples**:
  - Key C: relative PC 6 = absolute PC 6 → **F#dim**
  - Key G: relative PC 6 = absolute PC 1 → **C#dim** (third of A7, which is V/V in G)
  - Key F: relative PC 6 = absolute PC 11 → **Bdim** (third of G7, which is V/V in F)

### 2. Third of A7 (V/ii)
- **Dominant**: A7 = A-C#-E-G
- **Third**: C# (ALWAYS C#, never Db)
- **Diminished substitute**: C#dim, C#dim7, C#ø7
- **Function**: Lights V/ii BONUS wedge
- **Relative position**: PC 1 (1 semitone above tonic)
- **Examples**:
  - Key C: relative PC 1 = absolute PC 1 → **C#dim**
  - Key G: relative PC 1 = absolute PC 8 → **G#dim** (third of E7, which is V/ii in G)
  - Key F: relative PC 1 = absolute PC 6 → **F#dim** (third of D7, which is V/ii in F)

### 3. Third of E7 (V/vi)
- **Dominant**: E7 = E-G#-B-D
- **Third**: G# (ALWAYS G#, never Ab)
- **Diminished substitute**: G#dim, G#dim7
- **Function**: Lights V/vi wedge
- **Relative position**: PC 8 (8 semitones above tonic)
- **Examples**:
  - Key C: relative PC 8 = absolute PC 8 → **G#dim**
  - Key G: relative PC 8 = absolute PC 3 → **D#dim** (third of B7, which is V/vi in G)
  - Key F: relative PC 8 = absolute PC 1 → **C#dim** (third of A7, which is V/vi in F)
- **SPECIAL**: G#ø7 (half-diminished) → display only, no lighting

---

## Other Diminished Chords

**Bdim (PC 11)** - ii/vi BONUS function:
- Uses natural note "B" (7th degree of major scale)
- Follows key preference for other notes
- Special case: Bdim7 with B bass → maps to V7 (G7♭9 substitute)

**All other diminished chords**:
- Follow the key's sharp/flat preference
- Sharp keys (G, D, A, E, B) → use sharp names
- Flat keys (C, F, Bb, Eb, Ab, Db, Gb) → use flat names
- These are typically ILLEGAL chords (no wedge lighting, display name only)

---

## Examples Across All Keys

### Key C (Flat Key)
- PC 1 → **C#dim** (not Dbdim) - V/ii substitute for A7 ✅
- PC 6 → **F#dim** (not Gbdim) - V/V substitute for D7 ✅
- PC 8 → **G#dim** (not Abdim) - V/vi substitute for E7 ✅
- PC 11 → **Bdim** - ii/vi function
- PC 3 → **Ebdim** (illegal - follows key flat preference)
- PC 10 → **Bbdim** (illegal - follows key flat preference)

### Key G (Sharp Key)
- PC 1 (Db/C#) → **C#dim** - V/V substitute for A7 in key G ✅
- PC 6 (Gb/F#) → **F#dim** - V/ii substitute for E7 in key G ✅
- PC 8 (Ab/G#) → **G#dim** - V/vi substitute for B7 in key G ✅
- PC 11 (B) → **Bdim** - ii/vi function
- PC 10 (Bb/A#) → **A#dim** (illegal - follows key sharp preference)

### Key Db (Flat Key)
- PC 1 → **C#dim** (not Dbdim) - always sharp ✅
- PC 6 → **F#dim** (not Gbdim) - always sharp ✅
- PC 8 → **G#dim** (not Abdim) - always sharp ✅
- PC 11 → **Bdim** (or Cbdim?) - ii/vi function
- All others → use flat names (Eb, Bb, Ab, etc.)

---

## Implementation Details

### Code Location
**File**: `src/lib/theory.ts`
**Function**: `dimRootName(pc: number, baseKey: KeyName)`
**Lines**: 102-114

```typescript
const dimRootName = (pc: number, baseKey: KeyName) => {
  const keyTonicPC = NAME_TO_PC[baseKey];
  const relativePc = (pc - keyTonicPC + 12) % 12;

  // Functional diminished chords - name after the third of their target dominant
  // These are ALWAYS the major third of a dominant 7th chord, so ALWAYS sharp
  if (relativePc === 1) return SHARP_NAMES[pc];  // Third of A7 (V/ii)
  if (relativePc === 6) return SHARP_NAMES[pc];  // Third of D7 (V/V)
  if (relativePc === 8) return SHARP_NAMES[pc];  // Third of E7 (V/vi)
  if (relativePc === 11) return "B";             // 7th degree (ii/vi function)

  // Illegal diminished chords (♭3, ♭7) - use key's flat/natural preference
  if (relativePc === 3 || relativePc === 10) {
    return pcNameForKey(pc, baseKey);
  }

  // All other diminished chords - use key's sharp/flat preference
  return (SHARP_KEY_CENTERS.has(baseKey) ? SHARP_NAMES : FLAT_NAMES)[pc];
};
```

### How Root is Determined
1. **If MIDI notes available** (live play): Use LOWEST MIDI note (bass note)
2. **If no MIDI notes** (sequencer/theory): Use `preferredOrder` = `[11, 1, 3, 6, 8, 10, ...]`
3. Root determines name via `dimRootName()`
4. Root determines function via relative PC check in `mapping.ts`

### Affected Systems
- ✅ Live MIDI input
- ✅ Sequencer playback
- ✅ Key transposition
- ✅ All spaces (HOME, SUB, PAR, REL)
- ✅ Hub display
- ✅ Keyboard display
- ✅ Guitar fretboard display

---

## Bible Reference

**Section C: DIMINISHED FUNCTION RULES (lines 48-82)**

Original text (line 74):
> "Enharmonic preference: flats over sharps except for C#, F#, G#."

Updated text (lines 74-79):
> "Enharmonic naming: C#, F#, G# are ALWAYS sharp (never Db, Gb, Ab).
> Reason: These name the THIRD of the dominant they substitute:
> – F# = third of D7 (V/V)
> – C# = third of A7 (V/ii)
> – G# = third of E7 (V/vi)"

---

## Testing Checklist

To verify correct implementation:

- [ ] In key C, play PC 1 notes → displays "C#dim" (not Dbdim)
- [ ] In key C, play PC 6 notes → displays "F#dim" (not Gbdim)
- [ ] In key C, play PC 8 notes → displays "G#dim" (not Abdim)
- [ ] In key G, verify C#, F#, G# naming for functional dims
- [ ] In key Db (flattest key), verify C#, F#, G# still sharp
- [ ] In key B (sharpest key), verify C#, F#, G# still correct
- [ ] Sequencer: @KEY Db, play C#dim7 → shows "C#dim7"
- [ ] Transpose +7: Verify naming updates correctly
- [ ] SUB space: Verify dim chord names unchanged
- [ ] PAR space: Verify dim chord names unchanged

---

## Why This Matters

**Pedagogical**: Students learn diminished chords as dominant substitutes. The naming reinforces this relationship:
- "F#dim sounds like D7 because it contains the same upper structure (F#-A-C), and that's why we call it F#"

**Functional**: The sharp names (C#, F#, G#) indicate these are leading tones in their respective dominant contexts:
- F# leads to G (the 5th)
- C# leads to D (the 2nd)
- G# leads to A (the 6th)

**Consistency**: Using these names across ALL keys prevents confusion when transposing or using the sequencer.

---

**END OF DOCUMENT**
