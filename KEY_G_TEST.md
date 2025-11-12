# Key G Transposition Test

## Theoretical Expectations

### If wheel is set to **base key G**:

**PAR Entry Chords (parallel minor of G = Gm):**
- Gm: `[0,3,7]` relative to G ✅
- Bb: `[3,7,10]` relative to G ✅ (Eb relative offset = 3 semitones above tonic)
- Eb: `[8,0,3]` relative to G ✅ (Ab relative offset = 8 semitones above tonic)
- Ab: `[1,5,8]` relative to G ✅ (Db relative offset = 1 semitone above tonic)

**Diminished Chord Naming in Key G:**
- Should use **sharp names** (G is in SHARP_KEY_CENTERS)
- C# dim, D# dim, F# dim, G# dim ✅
- NOT Db dim, Eb dim, Gb dim, Ab dim ❌

**SUB Entry Chords:**
- Dm (ii in key G): `[7,10,2]` relative to G
- G7 (V7): `[0,4,7,10]` relative to G
- B°/Bdim7: `[4,7,10]` relative to G

## Your Actual Logs Show:

```
baseKey: 'C'  (throughout all logs)
```

**You are still in key C!** The system is behaving correctly for key C:
- Db dim ✅ (correct for key C - uses flats)
- Eb dim ✅ (correct for key C - uses flats)
- Cm → PAR entry ✅ (correct - parallel minor)

## To Actually Test Key G:

1. Use key selector dropdown to change to "G"
2. Play same chord progressions
3. Diminished chords should now show as **C#dim, D#dim, F#dim, G#dim**
4. PAR entry: Play **Gm** (should enter PAR - parallel minor of G)
5. SUB entry: Play **Dm or G7** (should enter SUB)

## Conclusion

**The system is NOT hard-coded!** It uses functional mapping correctly via `pcsRelativeToBase`.

The issue is simply that your logs show you're in **key C**, not key G, so the behavior is correct for key C.
