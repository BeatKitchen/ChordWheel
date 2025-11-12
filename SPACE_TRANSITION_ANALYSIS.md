# Space Transition Conflict Analysis (Key of C)

## Complete Transition Matrix

### FROM HOME
**Entry chords:**
- → SUB: `Gm, Gm7, C7, E°, E°7, Eø7`
- → PAR: `Cm, Eb, Ab, Db`
- → REL: Triple-tap `Am/Am7` (vi)

### FROM SUB (ephemeral key: F)
**Stay chords:** `F, Fmaj7, Gm, Gm7, Eb, Bb, Bbm, C7, C`
**Exit chords:**
- → PAR: `Cm, Db, Ab` (NEW in v4.1.6)
- → HOME: Triple-tap `C` (V chord in SUB)
- → HOME: All other illegal chords (WRONG - fixed in v4.1.6 to STAY)

### FROM PAR (ephemeral key: Cm/Eb)
**Stay chords:** `Cm, Db, Eb, Fm, Fm7, G7`
**Exit chords:**
- → HOME: `F, F7`
- → SUB: `Gm`
- → HOME: Triple-tap I? (NOT IMPLEMENTED)

### FROM REL (ephemeral key: Am)
**Exit chords:**
- → HOME: Triple-tap `C/Cmaj7` (I)

---

## Conflict Analysis

### 1. **Eb Chord Conflict** ⚠️ CRITICAL
**In HOME:**
- Eb → enters PAR ✅

**In SUB:**
- Eb → stays in SUB ✅

**Conflict?** NO - different contexts
- HOME has no Eb in diatonic scale → clearly a PAR entry
- SUB has Eb as ♭VII relative to F → valid stay chord
- **Resolution:** Check current space first (existing behavior works)

---

### 2. **Gm Chord Conflict** ⚠️ CRITICAL
**In HOME:**
- Gm → enters SUB ✅

**In PAR:**
- Gm → exits to SUB ✅

**Conflict?** POTENTIAL AMBIGUITY
- If in PAR and play Gm, should it:
  - A) Exit PAR → enter SUB (current implementation)
  - B) Exit PAR → go to HOME first, then HOME sees Gm and enters SUB?

**Current behavior:** Direct PAR → SUB transition (line 254-256 in spaces.ts)
**Question:** Is this musically correct? Or should we always return to HOME first?

---

### 3. **Cm Chord Conflict** ⚠️ POTENTIAL ISSUE
**In HOME:**
- Cm → enters PAR ✅

**In SUB:**
- Cm → exits to PAR ✅ (NEW in v4.1.6)

**In PAR:**
- Cm → stays in PAR ✅

**Conflict?** NO - well-defined priority
1. If in HOME: Cm enters PAR
2. If in SUB: Cm exits to PAR
3. If in PAR: Cm stays in PAR
- **Resolution:** Current space determines behavior (works correctly)

---

### 4. **Db Chord**
**In HOME:**
- Db → enters PAR ✅

**In SUB:**
- Db → exits to PAR ✅ (NEW in v4.1.6)

**In PAR:**
- Db → stays in PAR ✅

**Conflict?** NO - same as Cm (well-defined priority)

---

### 5. **Ab Chord**
**In HOME:**
- Ab → enters PAR ✅

**In SUB:**
- Ab → exits to PAR ✅ (NEW in v4.1.6)

**In PAR:**
- Ab → stays in PAR (NOT LISTED in stay chords!) ⚠️

**Conflict?** MISSING STAY CHORD IN PAR
- Bible line 109: "Entry: Cm, E♭, A♭, D♭"
- Bible line 111: "While in PAR: Cm, D♭, E♭, Fm/Fm7 = stay"
- **Ab is missing from stay list!**
- Currently: Ab in PAR → stays (v4.1.6 makes all illegal chords stay)
- **Question:** Should Ab explicitly be a PAR stay chord?

---

### 6. **F/F7 Chord** ✅
**In HOME:**
- F/Fmaj7 → stays (IV chord)

**In SUB:**
- F/Fmaj7 → stays (I chord in SUB)

**In PAR:**
- F/F7 → exits to HOME

**Conflict?** NO - clear distinction

---

### 7. **C7 vs C Triad** ✅
**In HOME:**
- C7 → enters SUB
- C → stays (I chord)

**In SUB:**
- C7 → stays
- C → stays, triple-tap exits to HOME

**Conflict?** NO - well-defined

---

## Critical Questions for User

### Question 1: Gm in PAR → SUB
Currently, playing Gm while in PAR directly transitions to SUB.

**Options:**
A) **Current:** PAR → SUB directly (one-step)
B) **Alternative:** PAR → HOME, then HOME sees Gm and → SUB (two-step)

**Which is musically correct?**

Bible says:
- Line 113: "Gm = jump to SUB"
- The word "jump" suggests direct transition ✅

**Recommendation:** Keep current behavior (direct PAR → SUB)

---

### Question 2: Ab in PAR
Bible lists Ab as PAR entry chord (line 109) but NOT as PAR stay chord (line 111).

**Current behavior:** Ab in PAR → stays (due to v4.1.6 "illegal chords stay")

**Options:**
A) Add Ab to PAR stay chords explicitly
B) Keep current (implicit stay via fallback)
C) Ab should exit PAR?

**Recommendation needed from user.**

---

### Question 3: Triple-tap from PAR?
REL and SUB both have triple-tap exits. PAR only has explicit chord exits (F, Gm).

Should PAR have a triple-tap exit to HOME?
- Triple-tap I (C major) while in PAR → HOME?

**Bible doesn't mention this.** Should it exist?

---

### Question 4: Multi-hop transitions
Should we allow:
- SUB → PAR → SUB (via Gm)?
- PAR → SUB → PAR (via Cm/Db/Ab)?

Or should some transitions require returning to HOME first?

**Current implementation allows all direct transitions.**

---

## Recommendations

### ✅ No Changes Needed:
1. Eb conflict (context-dependent, works correctly)
2. Cm/Db conflicts (priority-based, works correctly)
3. F/F7 (clear distinction)
4. C7/C triad (clear distinction)

### ⚠️ User Decision Required:
1. **Ab in PAR** - Should it explicitly be a stay chord?
2. **PAR triple-tap exit** - Should it exist?
3. **Multi-hop philosophy** - Allow SUB ↔ PAR without HOME, or require HOME return?

### 📋 Current Implementation Status:
- Direct space transitions work (SUB → PAR via Cm/Db/Ab)
- PAR → SUB works (via Gm)
- No conflicts found that break the system
- Illegal chords stay in current space (v4.1.6 fix)

---

## Pitch Class Reference (Key C)

| Chord | PCs (relative to C) | In HOME | In SUB | In PAR |
|-------|---------------------|---------|--------|--------|
| C     | [0,4,7]            | Stay (I) | Stay, triple-tap exit | ? |
| C7    | [0,4,7,10]         | Enter SUB | Stay | ? |
| Cm    | [0,3,7]            | Enter PAR | Exit to PAR | Stay |
| Db    | [1,5,8]            | Enter PAR | Exit to PAR | Stay |
| Eb    | [3,7,10]           | Enter PAR | Stay | Stay |
| F     | [5,9,0]            | Stay (IV) | Stay (I in SUB) | Exit to HOME |
| F7    | [5,9,0,3]          | Stay? | ? | Exit to HOME |
| Gm    | [7,10,2]           | Enter SUB | Stay | Exit to SUB |
| Ab    | [8,0,3]            | Enter PAR | Exit to PAR | STAY? (not listed in Bible) |

