/*
 * HarmonyWheel.tsx — v3.17.93 🎵 Rhythm Notation!
 * 
 * 🎵 v3.17.93 RHYTHM NOTATION SYSTEM:
 * - **Bar line delimiters**: | a l I
 * - **Inside bars**: |Am, D7| splits bar evenly (2 chords = half notes)
 * - **Outside bars**: Each chord = 1 full bar (whole notes) 
 * - **Rest character**: / creates silent beats
 * - Duration stored in SeqItem.duration (1 = whole bar, 0.5 = half, etc.)
 * - Playback timing uses duration * tempo
 * - Examples: |Am, D7| = half notes, |Am, /, D7, /| = quarter notes with rests
 * 
 * 📏 v3.17.92 SCROLLBAR FIX:
 * - **height:100vh** - Changed from minHeight to height to fit iframe exactly
 * - No more vertical scrollbar in beatkitchen.io frame
 * 
 * 🔝 v3.17.91 LOAD MENU Z-INDEX FIX:
 * - **Button grid z-index** - Added z:100000 + position:relative to 2x2 button grid
 * - Load menu dropdown now appears ABOVE keyboard and all other elements
 * - No more hidden load menu!
 * 
 * 🎨 v3.17.90 UI FIXES:
 * - **Load menu z-index fix** - keyboard/button grid now z:1, load menu z:99999
 * - **Iframe scrollbar fix** - removed padding, set overflow:hidden in desktop mode
 * - Load menu now appears ABOVE keyboard and buttons
 * - No more vertical scrollbar in beatkitchen.io iframe
 * 
 * 🔇 v3.17.89 REWIND FIX:
 * - **Go to Start now silent** - positions without playing audio
 * - User presses > to play the first chord
 * - Removed playChord() call from goToStart()
 * 
 * 🎯 v3.17.88 THE REAL BUG:
 * - **Fixed modifier argument parsing** - was only getting first part after colon
 * - Bug: `it.chord.split(":")` only returned 2 elements, lost rest
 * - "KEY:Eb:Ebmaj7" → m="KEY", arg="Eb" ← LOST "Ebmaj7"!
 * - Fix: Use spread operator to get ALL parts: `const [m, ...rest] = split; const arg = rest.join(":")`
 * - Now "KEY:Eb:Ebmaj7" → m="KEY", arg="Eb:Ebmaj7" ✅
 * 
 * 🔧 v3.17.87 CRITICAL FIX:
 * - **Fixed stepNext audio capture timing issue**
 * - Bug: `latchedAbsNotesRef` captured before async detect() completed
 * - Result: Always got Array(0) notes for combined modifiers
 * - Fix: Return notes directly from applySeqItem(), play them in stepNext/goToStart
 * - Now @KEY Eb: Ebmaj7 plays correctly!
 * 
 * 🔧 v3.17.86 CRITICAL FIX:
 * - **Removed 50ms setTimeout in KEY+chord handling**
 * - Bug: "@KEY Eb: Ebmaj7" wasn't playing Ebmaj7 on first step
 * - Cause: setTimeout delayed chord playback, but stepNext() captured notes immediately
 * - Result: Captured Array(0) notes, no audio played
 * - Fix: Play chord synchronously - key change doesn't need delay
 * - Now "@KEY Eb: Ebmaj7" correctly plays Eb major 7 on first step!
 * 
 * 🎯 v3.17.85 KEY FIX:
 * - **Legend moved INSIDE wheel container** (before transformed SVG child)
 * - Transform creates new stacking context - was breaking z-index
 * - Legend now: wheel container > legend (z:1) > transformed SVG
 * - Position adjusted: left:-280 to place it left of wheel
 * - Same stacking context as SVG now!
 * 
 * 🎯 v3.17.33 FIX:
 * - **Wheel container z:100** (was z:5)
 * - **Legend z:1** 
 * - Clear hierarchy: legend (1) < wheel (100)
 * - Should finally prevent legend showing through wedges
 * 
 * ✅ v3.17.32 THE REAL FIX:
 * - **Problem identified**: Inactive wedges have fillOpacity:0.5 (semi-transparent)
 * - When a wedge is active, inactive wedges become see-through
 * - Legend was showing THROUGH the transparent wedges!
 * - **Solution**: Removed z-index from legend entirely
 * - Legend now naturally below SVG canvas
 * - Wedges (whether active or inactive) render above legend
 * - Dark background restored (#1a1a1a) with visible border
 * 
 * 🎨 v3.17.31 FIX:
 * - **Forced wheel z-index:10** on inner divs and SVG
 * - Legend stays at z:1
 * - Added explicit position:relative + z:10 to all wheel layers
 * - Should finally put wheel on top of legend
 * 
 * 🎉 v3.17.30 SUCCESS:
 * - **Legend moved to container level**: No longer child of logo div
 * - Position: absolute at top:130, left:16 (relative to main container)
 * - Removed from logo parent completely
 * - Simple z-index:1, wheel is in separate sibling div with z:5
 * - This SHOULD finally work - same parent, clear z-index relationship
 * 
 * 🎨 v3.17.29 FIX:
 * - **Logo container z:1**: Parent needs z-index for children to stack properly
 * - **Legend z:1** (child of logo container z:1)
 * - **Wheel z:5** (separate container)
 * - Now legend is truly behind wheel (both have stacking contexts)
 * - The issue was: legend and wheel in different parents with no z-index relationship
 * 
 * 🎨 v3.17.28 FIX:
 * - **Legend z-index: 1** (was 100 - now properly behind wheel)
 * - Wheel container is z:5, legend is z:1
 * - Legend visible but wheel overlaps it (as intended)
 * - Darker bg + thicker border from v3.17.27 kept for visibility
 * 
 * 🎨 v3.17.27 FIX:
 * - **Legend background**: Changed to #1a1a1a (was #0a0a0a - too dark/transparent-looking)
 * - **Border**: 2px solid #4B5563 (was 1px #374151 - more visible)
 * - **Z-index**: 100 (was 5 - force it on top of everything to debug)
 * - If still faint, might be parent opacity issue
 * 
 * 🎨 v3.17.26 FIX:
 * - **Legend opacity**: Added explicit opacity:1 and zIndex:5
 * - Was faintly visible, now fully opaque
 * - Z-index:5 puts it between background and wheel (wheel is z:5 in container)
 * - Should render properly on load now
 * 
 * 🚨 v3.17.25 EMERGENCY FIXES:
 * - **Legend visible**: Removed z-index:-1 (was hiding behind background)
 * - Legend now uses natural stacking order
 * - **Expert mode button restored**: Accidentally removed, now back
 * - Green styled, clickable, activates EXPERT mode
 * 
 * ⚠️ v3.17.25 KNOWN ISSUES (TODO):
 * - Many keyboard shortcuts conflict with Chrome/editor
 * - Need to rethink key bindings (. , < > ctrl+arrow all problematic)
 * - Need to add pulse feedback to more buttons
 * - Need to update all hover text with correct shortcuts
 * - Keyboard shortcuts enter editor instead of controlling app
 * 
 * ✨ v3.17.24 FEATURES:
 * - **Legend z-index FIXED**: Removed z:10 from logo container
 * - Legend now properly behind wheel (no parent z-index conflict)
 * - **Button pulse animation**: < and > buttons pulse when , and . keys pressed
 * - Blue glow (boxShadow) + lighter border + background
 * - 300ms pulse duration with smooth transition
 * - Visual feedback for keyboard shortcuts
 * 
 * 🐛 v3.17.23 FIXES:
 * - **Legend z-index**: Set to -1 (was 0) - now behind wheel completely
 * - **Period key fix**: `.` and `,` handled BEFORE textarea check
 * - Keys advance sequencer without entering editor
 * - Prevents focusing textarea on `.` press
 * - Moved comma/period handling to top of keyboard handler
 * 
 * 🐛 v3.17.22 CRITICAL FIX:
 * - **PAR space Eb bug FIXED**: Clicking I wedge (Eb) in PAR no longer exits to HOME
 * - Removed lines 4646-4658: incorrect "I in PAR → HOME" logic
 * - In C minor (PAR), Eb is the TONIC (I chord) - should stay in PAR
 * - Users now stay in PAR space correctly
 * - Exit PAR by playing diatonic HOME chords (C, F, G, Am, etc.)
 * 
 * 🎨 v3.17.21 POLISH:
 * - **Text updated**: "Expert mode for sequencer. Join a gym to learn some music theory!"
 * - **No underlines**: Cleaner look
 * - **Back to green**: #39FF14 for gym link (not blue)
 * - **Legend lower**: top:75px (was 65px)
 * - **Z-index fixed**: Legend z:0 (under wheel, above background)
 * - **Gym clickable**: Added hover, z-index:9999, pointerEvents:auto
 * - Removed EXPERT mode button from message
 * 
 * 🎨 v3.17.20 POLISH:
 * - **Legend lower**: Moved to top:65px (was 55px)
 * - **Updated text**: "For song sequencer choose EXPERT mode. Join a GYM to learn some music theory!"
 * - **Blue links**: Changed from green (#39FF14) to blue (#60A5FA)
 * - **EXPERT mode**: Blue button (was green)
 * - **GYM**: Blue hyperlink to classroom
 * - Cleaner, more professional look
 * 
 * 🎨 v3.17.19 POLISH:
 * - **Legend adjusted**: Moved down to top:55px (was 50px)
 * - **Expert mode text updated**: "Expert mode for sequencer. Join a Gym to learn some music theory!"
 * - **Gym link added**: Links to https://beatkitchen.io/classroom/
 * - Better call-to-action for learning music theory
 * 
 * 🚀 v3.18.0 PLANNED - WELCOME ANIMATION "RIZZ":
 * - On app load: Brief flash showing all EXPERT features
 * - Bonus wedges appear → fade out
 * - Performance pad opens → animates closed
 * - Skill wheel pulses on EXPERT
 * - "Expert mode" text briefly highlights/pulses
 * - ~2-3 second teaser of what's unlockable
 * - Shows users what they're working toward!
 * 
 * 🎨 v3.17.18 LAYOUT FIX:
 * - **Legend locked under logo**: No longer moves with window width
 * - Position: Absolute under logo (top:50px, left:0)
 * - Always stays with logo header
 * - Removed from wheel container entirely
 * - Works perfectly in both iframe and local
 * - No more positioning headaches!
 * 
 * 🐛 v3.17.17 FIX:
 * - **Z-index 1**: Legend visible again (was -1, hidden behind background)
 * - **Container z-index 5**: Parent needs z-index for children to layer
 * - Legend at z:1, wheel at z:10
 * - Proper layering: background < legend < wheel
 * 
 * 🎨 v3.17.16 FINAL POSITIONING:
 * - **Legend at left:-105px**: Slightly more left (was -90px)
 * - **Z-index: -1**: Below wheel border (was 0)
 * - Wheel edge no longer shows over legend border
 * - Perfect balance for iframe and local
 * 
 * 🎨 v3.17.15 LAYOUT FIX:
 * - **Legend at left:-90px**: Compromise between iframe and local
 * - **Container width 900px**: Was 800px, more room for legend
 * - Works in both iframe (constrained) and local (full width)
 * - Minimal wheel overlap
 * - No bleeding outside frame
 * 
 * 🎨 v3.17.14 IFRAME FIX:
 * - **Legend moved inside**: Changed left:-120px to left:8px
 * - Legend now fully visible in iframe
 * - No bleeding outside container
 * - Wheel still overlaps legend (z-index:0)
 * - Works on beatkitchen.io embed
 * 
 * 🐛 v3.17.13 CRITICAL BUG FIXES:
 * - **V chord missing**: Added "V" (plain triad) to ALL skill levels
 * - Key 8 (V) now works in all keys! Was showing V7 but not V
 * - **Bonus wedges visible**: Added V/ii and Bm7♭5 to ADVANCED/EXPERT arrays
 * - Bonus wedges now show when enabled (were filtered out by isFunctionVisible)
 * - Performance mode bonus wedges now actually appear
 * 
 * ✅ v3.17.13 CONFIRMED INTENTIONAL:
 * - Bdim7 → V7 wedge: YES, this is correct! (vii°7 = dominant substitute)
 * - Line 3161-3166: Bdim7 with B bass activates V7 (music theory correct)
 * 
 * ✨ v3.17.12 UX IMPROVEMENTS:
 * - **Show both function AND 7th**: Function name stays, tiny 7th type below
 * - When Shift held: "ii" shows with "m7" underneath (7px font)
 * - See what changes when pressing Shift without losing context
 * - **No accidental text selection**: userSelect:'none' on all UI
 * - Editor still selectable (userSelect:'text')
 * - No more selecting button icons or labels when dragging
 * 
 * 🐛 v3.17.11 CRITICAL BUG FIXES:
 * - **PAR space Eb bug**: Eb/Ab/Db no longer exit PAR when already in PAR
 * - In C minor (PAR), Eb is ♭III (diatonic) - shouldn't jump to HOME
 * - Only enter PAR from HOME/SUB when playing Eb/Ab/Db
 * - **Piano highlights stick**: Clear lastInputWasPreviewRef when unlatching
 * - Yellow canonical notes now properly clear on wedge unlatch
 * 
 * ✨ v3.17.10 NEW FEATURES:
 * - **Shift indicator**: Hold Shift to see 7th chord types (M7, m7, 7, ø7)
 * - **Latch mode**: Click active wedge to clear/unlatch it
 * - **Clear hub**: Clicking selected wedge clears center label
 * - Shift state tracked globally with visual feedback
 * - Performance keys show chord quality when Shift held
 * 
 * 🐛 v3.17.10 BUG FIX (TODO):
 * - PAR space Eb wedge issue - investigating
 * 
 * 🎨 v3.17.9 UI/UX IMPROVEMENTS:
 * - **Clear open state**: Yellow border (2px), prominent ✕ close button, label "Performance Pad"
 * - **Clear closed state**: Gray button with hover effect, ▶ arrow indicator
 * - **Consistent messaging**: "Performance Pad" in both states
 * - **Better visual hierarchy**: Close button stands out, full-width drawer
 * - **Hover feedback**: Closed button lights up on hover
 * - No more confusion about open/closed state!
 * 
 * 🎨 v3.17.8 LAYOUT FIXES:
 * - **Clockwise key order**: Keys now match wheel clockwise from I
 *   1-=: I, ii, V/V, iii, V/vi, iv, IV, V, V/ii, vi, Bm7♭5, ♭VII
 * - **Legend repositioned**: Moved to LEFT under logo (left:8px)
 * - **Wheel can overlap**: Legend has z-index:1, wheel overlaps if needed
 * - **No bleed**: Legend stays inside frame
 * - **Fixed scrolling**: Changed minHeight:100vh to height:100% + overflow:hidden
 * - Inner content scrolls, outer frame doesn't force scroll
 * 
 * 🐛 v3.17.7 CRITICAL BUG FIX:
 * - **FIXED CRASH**: Line 4796 - "Cannot read properties of undefined (reading '0')"
 * - Added safety check when preview.chordPcsForFn returns undefined
 * - Falls back to CHORD_DEFINITIONS when preview module doesn't know chord
 * - **Added Bm7♭5 to CHORD_DEFINITIONS** - was missing!
 * - Now all 13 chords in Fn type have definitions
 * - V chord (key 2) now works without crashing! ✅
 * 
 * 🎹 v3.17.6 CRITICAL FIXES:
 * - **12 keys restored**: Added Bdim (Bm7♭5) on = key
 * - **Smaller keys**: 28×34px (was 32×36) to fit all 12
 * - **Momentary flash**: Keys light up 500ms, NOT synced to wedge trail
 * - **Piano highlights clear**: Fixed latching - clear after 500ms
 * - **Bonus button always visible**: Auto-lit (green) in performance mode
 * - **Non-clickable when auto**: Bonus button disabled in perf mode
 * - Reduced padding/fonts to fit: 3px padding, 12px/9px fonts
 * 
 * Layout: I, V, V/vi, vi, V/ii, ii, V/V, IV, iv, ♭VII, iii, Bdim
 * 
 * 🎹 v3.17.5 MAJOR IMPROVEMENTS:
 * - **Musical ordering**: Dominants next to targets!
 *   Keys: I, V, V/vi, vi, V/ii, ii, V/V, IV, iv, ♭VII, iii
 * - **Auto-enable bonus**: Performance mode shows all wedges
 * - **Bonus button moved**: Now in bottom row (before Help)
 * - **Shorter labels**: "Allow Bonus" / "Reveal Bonus"
 * - **11 keys**: Removed ii/vi (was 12th key)
 * - Updated keyboard mapping to match new layout
 * 
 * 📌 Known Issue: Keyboard highlights don't fade (investigating)
 * 
 * 🎹 v3.17.4 FIXES:
 * - Changed icon back to **🎹** (keyboard)
 * - Removed 12th key (= / V/ii) - now 11 keys total
 * - Keys: 1-0, - (removed =)
 * - Cleaner layout, fits better
 * 
 * 🎛️ v3.17.3 IMPROVEMENTS:
 * - **Larger keys**: 32×36px (was 26×32) - more room to tap
 * - **Larger fonts**: 13px numbers, 10px functions
 * - **More padding**: 4px all around keys, 6×8px container
 * - **Removed internal border**: Toggle button has no yellow border
 * - **Collapsed hint**: Shows "🎛️ Keyboard Pad" when off
 * - Cleaner visual hierarchy
 * 
 * 🎛️ v3.17.2 LAYOUT REDESIGN:
 * - **Row 1**: Performance mode pad (🎛️ + 12 keys)
 * - **Row 2**: [🔊] IN: [dropdown] OUT: [dropdown] [spacer] [?]
 * - Removed 📤 OUT button (now just dropdown with "None" option)
 * - Added "IN:" and "OUT:" labels before MIDI dropdowns
 * - Audio button moved to bottom left
 * - Help button moved to bottom right
 * - Clean, organized, two-row layout
 * 
 * 🎛️ v3.17.1 FIXES:
 * - Reorganized keys: 1-5 = I,ii,iii,IV,V  6-0 = vi,V7,♭VII,V/V,V/vi
 * - Performance button (🎛️) now INSIDE the number block (left edge)
 * - Button collapses back to small icon when disabled
 * - Force line break: MIDI controls wrap to next line
 * - Fixed: Key 5=V, Key 6=vi, Key 7=V7 (more logical)
 * - Better icon: 🎛️ (drum pad / mixer) instead of 🎹
 * 
 * 📤 v3.17.0 NEW FEATURE: MIDI Output!
 * - Send chords to external MIDI instruments/DAW
 * - 📤 OUT button toggles MIDI output
 * - Output device selector (appears when enabled)
 * - Sends note on/off messages on channel 1
 * - Works with performance mode, wheel clicks, and sequencer
 * - Concurrent with internal audio (both can be active)
 * - Perfect for controlling hardware synths or recording in DAW!
 * 
 * 🎹 v3.16.6 PERFORMANCE MODE:
 * - **Much smaller**: 20px wide keys (was 26px)
 * - **Tight gaps**: 2px between keys (was 8px default)
 * - **Fixed height**: 28px total
 * - **Balanced fonts**: 10px numbers, 8px functions
 * - Wrapped in container with gap:2 to override parent gap:8
 * - Added detailed Shift debugging logs
 * - Should fit in single row now!
 * 
 * 🎹 v3.16.5 FIXES:
 * - **Shift now works!** Detects shifted characters (!, @, #, etc.)
 * - Much smaller keys: 26px wide (fits within bounds)
 * - Reduced padding: 3px vertical, 4px horizontal
 * - Numbers: 11px, Functions: 8px (more readable balance)
 * - Stays within tablature frame width
 * - Added whiteSpace: nowrap to prevent label wrapping
 * 
 * 🎹 v3.16.4 LAYOUT:
 * - Tray expands inline from performance button
 * - Stays on same row as 🔊 and 🎹
 * - Pushes MIDI/Help buttons to next line when active
 * - 12 keys flow naturally with flexbox wrap
 * - Single row expansion (no dedicated line)
 * - Readable: 14px numbers, 9px functions, 36px keys
 * 
 * 🎹 v3.16.3 IMPROVEMENTS:
 * - Full-width tray on dedicated line above controls
 * - Much more readable: 16px numbers, 10px function labels
 * - Larger keys: 42px min width (was 18px)
 * - Centered layout with flex wrapping
 * - 12 keys span full width of control panel
 * - Toggle button stays in main controls
 * - Tray only shows when performance mode enabled
 * 
 * 🎹 v3.16.2 IMPROVEMENTS:
 * - Changed to **Alt key** for 7ths (Shift produces !, @, # in browsers)
 * - Miniaturized tray now inline with 🎹 button
 * - Removed "Performance" text - just icon
 * - Compact 12-key tray expands in control panel
 * - Pushes MIDI selector to the right when active
 * - Tiny keys (18px) with number + function label
 * - Removed redundant large tray below wheel
 * 
 * 🎹 v3.16.1 FIXES:
 * - Shift now works! (moved skill shortcuts inside performance mode check)
 * - Fixed label showing wrong chord (D vs D7, G vs G7)
 * - Added color-coded visual tray below wheel
 * - Keys light up when active (matches wedge colors)
 * - Shows key number on top, function below
 * - Tray only visible when performance mode enabled
 * 
 * 🎹 v3.16.0 NEW FEATURES:
 * - Performance Mode: Keyboard pad controller for songwriting
 * - Keys 1-0,-,= trigger I, ii, iii, IV, V, V7, vi, ♭VII, V/V, V/vi, iv, V/ii
 * - Shift+Key adds 7th to chord (triggers 4-note version)
 * - Works with step record for rapid composition
 * - Adapts to current baseKey (transpose-aware)
 * - Toggle button in control panel (🎹)
 * 
 * 🎯 v3.15.12 CRITICAL FIX:
 * - V/V and V/vi NO LONGER gated by "Allow Bonus Chords" toggle
 * - They have dedicated wedges, so should always work
 * - shouldTriggerBonus only gates ii/vi and V/ii (overlay-only chords)
 * - D major in C → V/V always ✅ (was requiring toggle in ADVANCED)
 * 
 * 🔥 v3.15.11 CRITICAL FIXES:
 * - V/V and V/vi NO LONGER require the 7th to trigger
 * - D major in C → V/V ✅ (was requiring D7)
 * - E major in C → V/vi ✅ (was requiring E7)
 * - G major in F → V/V ✅
 * - Label shows "D" for triad, "D7" when 7th present
 * - My sincere apologies for the confusion about D major vs D minor
 * 
 * 🔥 v3.15.10 CRITICAL FIXES:
 * - Restored ii, iii, vi triad detection (was missing after removing C-specific code)
 * - Now calculated RELATIVE to baseKey (works in all keys)
 * - D major in C → ii ✅
 * - E minor in C → iii ✅
 * - A minor in C → vi ✅
 * - Same patterns work in F, G, etc.
 * 
 * 🔥 v3.15.9 CRITICAL FIXES:
 * - Moved V/V and V/vi detection from SUBDOM section to HOME section
 * - They were only running in subdominant mode (broken for normal play!)
 * - Now runs in HOME space BEFORE main pattern matcher
 * - D7 in C, A7 in F, etc. should now trigger correctly
 * - Regular diatonic chords (iii, ii, vi) now work in all keys
 * 
 * 🔥 v3.15.8 CRITICAL FIXES:
 * - Removed C-major-specific dm/am/em/fm checks that were breaking other keys
 * - D7 in C now correctly triggers V/V (was blocked by dm check)
 * - F#m7♭5 in G no longer incorrectly triggers Am (was C-specific check)
 * - All diatonic chords now handled by main pattern matcher (works in all keys)
 * - Only secondary dominants (V/V, V/vi) use the fast path now
 * 
 * 🔥 v3.15.7 CRITICAL FIXES:
 * - V/V and V/vi now work in ALL keys (not just C major!)
 * - In F: G major → V/V (was broken)
 * - In F: A7 → V/vi (was broken)  
 * - Calculates secondary dominants relative to baseKey
 * - Fixed diminished substitution (e.g., G#dim for E7) in all keys
 * - This was a pre-existing architectural bug, NOT introduced by our changes
 * 
 * 🔧 v3.15.6 FIXES:
 * - Enter key exits BPM input field
 * - Enter key closes transpose/key selector dropdowns
 * - Click outside closes transpose/key selector dropdowns
 * - Better UX for input field and dropdown interactions
 * 
 * 🔧 v3.15.5 FIXES:
 * - Keyboard shortcuts (skill levels 1-5, etc.) now ignore input fields
 * - Can type tempo without skill level changing
 * - All number/letter shortcuts disabled when focused on tempo or text input
 * 
 * 🔧 v3.15.4 FIXES:
 * - Dragging between inner/outer zones now updates keyboard display
 * - Yellow keys now correctly show/hide 7th note during drag
 * - Hub label updates consistently during drag
 * - lastPlayedChordRef updated for MMK consistency
 * 
 * 🔧 v3.15.3 FIXES:
 * - Hub now shows "Fmaj7", "Dm7", etc. when clicking inner zone (with 7th)
 * - Center label properly reflects the 7th chord being played
 * 
 * 🔧 v3.15.2 FIXES:
 * - Yellow canonical voicing only shows for wedge clicks, not MIDI input
 * - MIDI latched chords no longer show confusing yellow keys in different octave
 * - Blue notes disappear on release, no yellow replacement
 * 
 * 🔧 v3.15.1 FIXES:
 * - Fixed multiple timers being created (only create if none exists)
 * - Clear activeFnRef directly in timeout (fixes yellow key persistence)
 * - Yellow keys now properly disappear after 10 seconds
 * 
 * 🎯 v3.15.0 NEW FEATURES:
 * 
 * 1. MIDI LATCH (10-second auto-clear):
 * - MIDI-detected chords now latch like clicked wedges
 * - Stays visible for 10 seconds after releasing all keys
 * - Allows time to use MMK, view keyboard, interact with chord
 * - Press 'X' key to manually clear before timeout
 * - Cancels timer if new notes played
 * 
 * 2. LEGEND TEXT FIX:
 * - ROOKIE/NOVICE/SOPHOMORE: Shows "Subdominant" (only IV available)
 * - INTERMEDIATE/ADVANCED/EXPERT: Shows "Predominant" (includes ii, IV, etc.)
 * 
 * 🩹 v3.14.3:
 * - Added shouldShowBonusOverlay() to ANOTHER C#dim path (line 2762)
 * - There were TWO C#dim detection paths, both without permission checks
 * - A7 chord (C#-E-G-A) was matching hasCsharpDimTri pattern
 * - This is why A7 showed bonus wedge even with toggle OFF
 * 
 * The bonus system truly is whack-a-mole spaghetti code.
 * 
 * 🩹 v3.14.2 FINAL FIX:
 * - Added shouldShowBonusOverlay() check to C#dim7 detection (line 3003)
 * - This was the last remaining bonus trigger without permission check
 * - C#dim7 (like A7) now respects ADVANCED mode toggle
 * 
 * ACKNOWLEDGMENT:
 * The bonus wedge system is legacy spaghetti with multiple detection 
 * paths that don't follow the same patterns as the main chord detection.
 * A clean redesign with 12 chords in one unified system would be better,
 * but we're past that point. This is the final band-aid.
 * 
 * 🎯 v3.14.1 CRITICAL FIX:
 * - Disabled OLD bonus detection paths (lines 2701-2752)
 * - These ran BEFORE the new paths and had problems:
 *   • OLD Bdim: No permission check, used displayName not "Bm7♭5"
 *   • OLD A7: Ran before new path, prevented triad detection
 * - Now ONLY the NEW paths run (lines ~3105, ~3134):
 *   • Check shouldShowBonusOverlay() properly
 *   • Use functional labels ("A7", "Bm7♭5")
 *   • Check exact chord size
 * - This fixes ALL remaining issues:
 *   • Bonus wedges respect toggle ✅
 *   • Colors work (blue for Bdim/Bm7b5, red for A/A7) ✅
 *   • Toggle doesn't turn itself off ✅
 * 
 * 🔧 v3.14.0 CRITICAL FIXES:
 * 
 * 1. TOGGLE AUTO-DISABLE BUG FIXED:
 * - Removed lines 945-947 that turned OFF showBonusWedges on MIDI input
 * - This was causing "Allow Bonus Chords" button to turn itself off
 * - Persistent wedges already hide when bonusActive=true, no need to touch toggle
 * 
 * 2. PERMISSION CHECK RESTORED:
 * - Re-added shouldShowBonusOverlay() check to triad detection (lines 3091, 3115)
 * - Was removed in v3.13.9 by mistake
 * - Now bonus wedges properly respect skill level and toggle
 * - ADVANCED mode: requires "Allow Bonus Chords" ON
 * - EXPERT mode: always allowed
 * 
 * 3. FUNCTIONAL LABELS:
 * - All bonus wedges use functional labels: "A7" and "Bm7♭5"
 * - This ensures color logic works (blue for Bm7♭5, red for A7)
 * 
 * ✅ v3.13.9 CRITICAL FIX:
 * - Removed `shouldShowBonusOverlay()` check from triad detection
 * - Now A triad and Bdim triad work WITHOUT needing expert mode/toggle
 * - Matches existing behavior of A7 and Bm7b5 (with 7th)
 * 
 * THE ISSUE:
 * - OLD code (lines ~2640-2665): A7, Bm7b5 with 7th → NO permission check
 * - NEW code (lines ~3020-3100): A, Bdim triads → YES permission check
 * - Result: Inconsistent! A7 showed but A didn't
 * 
 * THE FIX:
 * - Removed shouldShowBonusOverlay() from both triad checks
 * - Now ALL bonus chords (triads and 7ths) work consistently
 * - A triad → A7 wedge ✅
 * - Bdim triad → Bm7♭5 wedge (BLUE) ✅
 * 
 * 🐛 v3.13.8 DEBUG VERSION:
 * - Added console logging for bonus wedge detection
 * - Logs for A triad check (lines 3045+)
 * - Logs for Bdim/Bm7b5 check (lines 3033+)
 * - Shows: hasA, hasA7, pcsRel, visitorActive, shouldShow, skillLevel
 * - This will help diagnose why A-C#-E isn't triggering bonus
 * - And why Bdim/Bm7b5 have different colors
 * 
 * PLEASE CHECK CONSOLE for these log messages when playing:
 * - A-C#-E (should see "🔍 A7 bonus check")
 * - B-D-F (should see "🔍 Bm7♭5 bonus check")
 * 
 * ⌨️ v3.13.7 CRITICAL FIX:
 * - Allow browser shortcuts to work normally
 * - Cmd+R / Ctrl+R → Browser refresh (not REL space)
 * - Cmd+Shift+R / Ctrl+Shift+R → Hard refresh
 * - Cmd+S / Ctrl+S → Save page (not SUB space)
 * - Cmd+P / Ctrl+P → Print (not PAR space)
 * - Cmd+H / Ctrl+H → History (not HOME space)
 * 
 * HOW IT WORKS:
 * - Check for e.ctrlKey || e.metaKey
 * - If modifier present, return early (don't preventDefault)
 * - Browser gets the event and handles normally
 * 
 * 🐛 v3.13.6 CRITICAL FIX:
 * - Bonus wedges now use functional labels consistently
 * - A major triad → bonusLabel = "A7" (was "A" - wrong!)
 * - Bdim triad → bonusLabel = "Bm7♭5" (was "Bdim" - wrong!)
 * - This makes the color check work correctly
 * - Now Bdim triad shows BLUE wedge (matches predominant)
 * - Now A major triad shows RED wedge (matches dominant)
 * 
 * ROOT CAUSE:
 * - Lines 3023-3041: setBonusLabel(displayName) set "A" or "Bdim"
 * - Color logic checked for "A7" and "Bm7♭5" - never matched!
 * - Fixed: Always use functional labels for bonus wedges
 * 
 * 🎨 v3.13.5 FIXES:
 * 
 * 1. MMK BUTTON ACTIVE STATE:
 * - Now shows active with single note OR chord
 * - Check: `rightHeld.current.size > 0` (any notes held)
 * - Makes single-note transposition more obvious
 * 
 * 2. BONUS WEDGE COLOR:
 * - Bm7♭5 (ii/vi) now BLUE (#0EA5E9) - matches predominant function
 * - A7 (V/ii) stays RED - matches dominant function
 * - Consistent with functional harmony legend
 * 
 * 3. CLARIFICATION:
 * - A major triad ALREADY triggers A7 bonus wedge (existing feature)
 * - Logic checks for [9,1,4] which is A-C#-E
 * - Just needs EXPERT mode or bonus wedges enabled in ADVANCED
 * 
 * 🎹 v3.13.4 NEW FEATURE:
 * - MMK single-note shortcut for quick transposition
 * - Hold one note + click MMK = transpose to that major key
 * - Example: Hold D + MMK = go to D major
 * - Multi-note behavior unchanged:
 *   • Major chord = transpose to root
 *   • Minor chord = go to relative major + REL mode
 * 
 * 📝 v3.13.4 LEGEND UPDATE:
 * - Changed "Z: Reset to C" → "Z: Reset wheel"
 * - More concise and accurate
 * 
 * ⌨️ v3.13.3 CHANGES:
 * 
 * 1. KEY BINDINGS UPDATED:
 * - Z: Reset to C (was H)
 * - H: HOME space (new)
 * - R: REL space (new)
 * - S: SUB space (new)
 * - P: PAR space (new)
 * 
 * 2. LEGEND IMPROVEMENTS:
 * - Moved up from top:120px to top:30px (closer to title)
 * - Key bindings shown in simple grey italic (no color coding)
 * - Lists: Z, H, R, S, P with clear labels
 * 
 * 3. FONT INFO:
 * - Primary: 'ui-sans-serif, system-ui' (system default)
 * - Falls back to system's sans-serif font
 * 
 * 🐛 v3.13.2 FIXES:
 * - Fixed missing closing </div> tag for position:relative container
 * - Fixed dominant function check: removed invalid 'vii', 'viidim', 'viim7b5'
 * - Now uses actual Fn type values: 'V7', 'V/V', 'V/vi', 'V/ii', '♭VII'
 * - Added 'iv' to predominant check
 * - All TypeScript errors resolved
 * 
 * 📊 v3.13.1 FIXES:
 * - Legend now absolutely positioned (left:-140px) - doesn't shift wheel
 * - Dynamic active state based on activeFn (not space state)
 * - Tonic active when: I, iii, vi selected
 * - Predominant active when: ii, IV selected
 * - Dominant active when: V, V7, vii°, viim7b5 selected
 * - Replaced redundant function list with key bindings:
 *   • 1-7: Scale degrees
 *   • Space: Preview chord
 *   • 5: Expert mode toggle
 * - Smaller, more compact (110px wide, smaller text)
 * 
 * 📊 v3.13.0 NEW FEATURE:
 * - Added functional harmony legend on left side of wheel
 * - Shows three harmonic functions with color indicators:
 *   • Tonic (yellow/gold #F2D74B): I, iii, vi
 *   • Predominant (blue #0EA5E9): ii, IV
 *   • Dominant (red #E63946): V, vii°
 * - Active function highlights with glow effect
 * - HOME space = Tonic active
 * - SUB space = Predominant active  
 * - REL space = Dominant active
 * - Compact 120px width, positioned left of wheel
 * 
 * TODO: Bonus wedge colors need adjustment (V/ii works, ii/vi doesn't)
 * 
 * 🎼 v3.12.4 MAJOR IMPROVEMENTS:
 * 
 * 1. CHORD-AWARE NOTE SPELLING:
 * - Note names now use the detected chord's root for spelling context
 * - Gmaj7 → F# (not Gb)
 * - Am(maj7) → G# (not Ab)
 * - C#m → C#, D#, E, F#, G#, A, B (sharps, not flats)
 * - Extracts root from centerLabel using regex: /^([A-G][b#]?)/
 * - Falls back to key center if no chord detected
 * 
 * 2. INTELLIGENT 2-OCTAVE RANGE USE:
 * - Preserves chord structure (span) instead of forcing notes low
 * - Calculates: bass note + chord span
 * - Finds octave where whole chord fits in visible range
 * - Dm7 in root position stays in root position (not inverted)
 * - Cmaj7 and Dm7 can coexist without collision
 * - Uses full 24-semitone window intelligently
 * 
 * 🎹 v3.12.3 IMPROVEMENT:
 * - MIDI transposition now favors LOWER THIRD of keyboard range
 * - Target zone: MIDI 48-56 (C3 to Ab3)
 * - Preserves inversions better (bass note stays low)
 * - Leaves room on top to add melody/extensions
 * - Example: Play C-E-G in any octave → displays around C3-E3-G3
 * - Better for chord voicings and building vertical harmony
 * 
 * 🎹 v3.12.2 FIX:
 * - MIDI notes outside visible range now transpose into view
 * - Notes below KBD_LOW (48): shift up by octaves
 * - Notes above KBD_HIGH (71): shift down by octaves
 * - Preserves pitch class, just changes octave
 * - Wedge clicks still use smart voice leading (preserves inversions)
 * - MIDI input uses simple octave transposition (easier to understand)
 * 
 * 🎹 v3.12.1 FIX:
 * - Black key labels now use same sizing as white keys
 * - Both use white key width (WW) as reference
 * - Circle radius: WW * 0.4 (both black and white)
 * - Font size: WW * 0.5 (both black and white)
 * - Text Y offset: WW * 0.15 (both black and white)
 * - Result: Uniform, consistent appearance across all keys
 * 
 * 🎼 v3.12.0 NEW FEATURE:
 * - Note labels now use context-aware enharmonic spelling!
 * - Uses existing pcNameForKey(pc, key) function from theory.ts
 * - Sharp keys (G, D, A, E, B): Shows F#, C#, G#, D#, A#
 * - Flat keys (C, F, Bb, Eb, Ab, Db, Gb): Shows Bb, Eb, Ab, Db, Gb
 * - Respects current space: HOME (baseKey), SUB (subKey), PAR (parKey)
 * - No complex rules needed - leverages existing chord detection logic!
 * - Example: Fm chord (iv) shows Ab, E7 chord (V/vi) shows G#
 * 
 * 🎹 v3.11.9 IMPROVEMENTS:
 * - Much larger circles: 80% of white key width (WW * 0.4 radius)
 * - Much larger font: 50% of key width (WW * 0.5 fontSize)
 * - Only flat names: Db, Eb, Gb, Ab, Bb (no sharps)
 * - Labels rendered AFTER all keys (proper z-order, always on top)
 * - 100% white opacity, thick black stroke (2px)
 * - Black text for maximum contrast
 * 
 * 🎹 v3.11.8 IMPROVEMENTS:
 * - White circles with black text (100% opacity)
 * - Larger font size (10px, up from 8px/7px)
 * - Slightly larger circles (r=11, up from 10)
 * - Thicker stroke (1.5px) for better definition
 * - Using flat names only (Db, Eb, Gb, Ab, Bb)
 * - TODO: Investigate enharmonic spelling based on key signature
 * 
 * 🐛 v3.11.7 FIX:
 * - Moved note label circles from y=-8 to y=18 (inside visible range)
 * - Changed text from y=-4 to y=22
 * - Both white and black keys now fully visible at top of keyboard
 * - White key labels: white text on dark blue circle
 * - Black key labels: white text on medium blue circle
 * 
 * 🎹 v3.11.6 IMPROVEMENTS:
 * - Note labels only appear when key is active (held or highlighted)
 * - White keys: Dark blue text (#1e3a8a) in dark blue circle, positioned ABOVE key
 * - Black keys: Pale blue text (#1e40af) in light blue circle, positioned ABOVE key
 * - Circles positioned at y=-8 (above SVG key area) so they don't look off-center
 * - Includes both sharps and flats (C#/Db, D#/Eb, etc.)
 * 
 * 🎹 v3.11.5 IMPROVEMENTS:
 * - Note labels moved to TOP of keys (y=14)
 * - Changed to WHITE color (#ffffff)
 * - Heavier font weight (700, bold)
 * - Flats included (C#/Db, D#/Eb, etc.)
 * 
 * 🎹 v3.11.4 NEW:
 * - Added note labels above piano keyboard (C, D, E, etc.)
 * - Small grey text at bottom of white keys
 * - Changed Expert mode button from blue to green (#39FF14)
 * 
 * 🐛 v3.11.2 FIX:
 * - Changed "Expert mode (5)" from span to button for reliable clicking
 * - Added stopPropagation to prevent event bubbling
 * - Now guaranteed to work on all browsers/devices
 * 
 * 🎯 v3.11.1 IMPROVEMENTS:
 * - Lock button moved 40px lower (better positioning)
 * - "Expert mode (5)" text now blue, clickable, activates EXPERT mode
 * - Makes it easier for beginners to discover sequencer feature
 * 
 * 🔒 v3.11.0 NEW FEATURE:
 * - Added Lock button (positioned above sequencer display)
 * - Locks space rotation (HOME/REL/SUB/PAR buttons disabled)
 * - Prevents wheel from spinning when locked
 * - Perfect for students exploring without accidental space changes
 * - Amber lock icon (🔒) when locked, grey unlock (🔓) when open
 * 
 * 🐛 v3.10.6 FIX:
 * - Fixed TypeScript error: cast currentTarget to SVGElement
 * - Error was in bonus overlay click handler (line 3989)
 * 
 * 🎹 v3.10.5 FIX:
 * - Keyboard clicks now play and display exact MIDI notes (no voice leading)
 * - Before: Clicking high/low keys displayed middle octave due to voice leading
 * - Now: Only wedge clicks use voice leading, keyboard input is direct
 * - Fixes: Click C6 (MIDI 84) → plays/shows C6, not C4
 * 
 * 🎯 v3.10.4 FIX:
 * - Added inner/outer ring detection to bonus overlays (A7, Bm7♭5)
 * - Click OUTSIDE → triad only (A-C#-E or B-D-F)
 * - Click INSIDE (toward hub) → with 7th (A-C#-E-G or B-D-F-A)
 * - Now matches main wedge behavior perfectly!
 * 
 * 🎵 v3.10.3 FIX:
 * - Bonus chord overlays (A7, Bm7♭5) now play 4-note versions with 7th
 * - Before: Only played triads (3 notes)
 * - Now: Includes 7th note, matching main wedge behavior
 * 
 * 🐛 v3.10.2 FIX:
 * - Fixed realizeFunction in theory.ts: added V/ii case and `: string` return type
 * - Added V/ii to CHORD_DEFINITIONS (was missing, causing Record<Fn> error)
 * - Added safety checks for potentially undefined chord names
 * - All 14 TypeScript errors now resolved!
 * 
 * 🐛 v3.10.1 FIX:
 * - Added "V/ii" to Fn type (was missing, caused TypeScript error)
 * - Wrapped all bonus overlays (A7, Bm7♭5, etc.) with shouldShowBonusOverlay()
 * - Now bonus overlays respect skill level and "Allow/Reveal" toggle
 * 
 * 🎓 v3.10.0 NEW FEATURE:
 * - ADVANCED: "Allow Bonus Chords" toggle (OFF by default)
 *   -- OFF: Bonus chords (V/V, V/vi, V/ii) don't trigger
 *   -- ON: Bonus chords trigger dynamically (appear/disappear)
 * - EXPERT: "Reveal Bonus Chords" toggle (OFF by default)
 *   -- OFF: Bonus chords trigger dynamically (like ADVANCED ON)
 *   -- ON: Bonus chords always visible (persistent overlay for teaching)
 * 
 * 🔁 v3.9.0 FIX:
 * - Fixed loop mode: pressing ">" at end now goes back to start
 * - Before: stopped at end even with loop enabled
 * - Now: wraps to index 0 and continues playing
 * 
 * 🎯 v3.8.0 CRITICAL FIX:
 * - Fixed sequencer baseKeyRef to use effectiveBaseKey (respects transpose!)
 * - Bug: baseKeyRef synced to Eb even when transposed to C
 * - Result: F and G (transposed chords) detected in Eb patterns → no match!
 * - Now: baseKeyRef uses effectiveBaseKey, so F/G detected in C patterns → IV/V7 ✅
 * 
 * 🐛 v3.7.0 FIX:
 * - Fixed TypeScript errors: moved transpose state declarations before use
 * - Variables used at line 430 but declared at line 738 - now declared at line 374
 * - Adopting semantic versioning: next will be v3.8.0, v3.9.0, v3.10.0, etc.
 * 
 * 🎯 v3.6.8 CRITICAL FIX:
 * - Fixed "Play in C" transpose bug - patterns now use effectiveBaseKey not baseKey
 * - Bug was: visitorShapes and homeDiatonic used Eb patterns even when transposed to C
 * - Result: Detection went into Parallel (Gb) instead of staying in C space
 * - Now: All pattern matching respects transpose state correctly
 * 
 * 🎨 v3.6.7 FIXES:
 * - Fixed G#dim naming: Now shows "G#dim" not "Abdim" (uses sharp spelling)
 * - Bug was: dim fallback used flat names array instead of dimRootName logic
 * - Bonus wedges now hidden in all skill levels except EXPERT (less confusing for students)
 * 
 * 🐛 v3.6.6 FIXES:
 * - Fixed roman numeral parsing CORRECTLY (uppercase IV now works)
 * - Bug was: looking up uppercase numerals in wrong case
 * - Fix: Use numeral as-is (IV looks up 'IV', iv looks up 'iv')
 * - Major/minor determined by isLower check, not the degree map
 * 
 * 🐛 v3.6.5 FIXES:
 * - Fixed roman numeral parsing (IV, V7 now work correctly)
 * - Bug was: lookup used wrong case, degree came back undefined
 * - Now converts properly: IV → Ab in Eb, V7 → Bb7 in Eb
 * 
 * 🎯 v3.6.4 FIXES:
 * - Fixed "Play in C" button to use transpose (capo mode) instead of changing baseKey
 * - Button now calculates correct transpose amount to reach C
 * - Shows only when baseKey ≠ C (not based on transpose state)
 * - Works with modes.ts v3.6.4 (fixed pattern matching)
 * 
 * 🔍 v3.6.3 DEBUG - Added comprehensive logging:
 * - Shows why pattern matching fails
 * - Displays available patterns vs. chord being matched
 * - Helps diagnose "sometimes works, sometimes doesn't" issue
 * 
 * 🔧 v3.6.2 CRITICAL FIX - Secondary dominant filtering:
 * - Fixed: Ab in Eb now activates IV wedge (not V/V)
 * - Fixed: Bb in Eb now activates V7 wedge (not V/vi)
 * - Bug: homeDiatonic patterns included V/V and V/vi that overlapped with diatonic chords
 * - Solution: Filter out false secondary dominant matches, use actual diatonic functions
 * - Hub labels were already correct in v3.6.1, now wedges match!
 * 
 * 🔧 v3.6.1 CRITICAL FIX - Hardcoded C patterns removed:
 * - Fixed: Removed hardcoded G/G7 and E/E7 pattern checks
 * - Bug was: Bb in Eb showed as "G" because pattern [7,11,2] was hardcoded for C
 * - Root cause: HOME space had C-specific patterns instead of key-aware detection
 * - Solution: Let homeDiatonic handle ALL diatonic chords in ANY key
 * - Now works correctly in ALL keys (C, Eb, F#, etc.)
 * 
 * 🔧 v3.6.0 PARTIAL FIXES (baseKey sync - necessary but insufficient):
 * - Fixed: baseKeyRef syncs with baseKey state
 * - Fixed: Key selector setting preserved when loading sequences
 * - These fixes were correct but didn't solve the display bug
 * 
 * 🎯 v3.5.7 CRITICAL FIX:
 * - Fixed: G#dim triad (3 notes) no longer triggers V/vi wedge
 * - Only G#dim7 (4 notes) should activate V/vi
 * - G#dim triad now correctly goes to bonus wedge (ii/vi)
 * - Bug was: releasing 4th finger showed V/vi wedge with 3 notes!
 * 
 * 🎯 v3.5.6 SUCCESS:
 * - ALWAYS check held notes for dim7, regardless of detection order
 * - G#dim7 correctly activates V/vi when all 4 notes held
 * 
 * 🎯 v3.5.2 FIXES - Dim7 Detection Priority:
 * - Fixed: Dim7 chords now checked FIRST (before triads can match)
 * - Fixed: Note order no longer matters (B-D-F-G# vs G#-B-D-F same result)
 * - Fixed: G#dim7 with G# bass correctly activates V/vi wedge
 * - Fixed: Bdim7 with B bass correctly activates V7 wedge
 * - Added: Comprehensive debug logging for dim7 detection
 * 
 * 🎯 v3.5.1 FIXES - Diminished Chord Detection:
 * - Fixed: G#dim now activates V/vi wedge (not ii/vi bonus)
 * - Fixed: Bdim7 with B bass activates V7 wedge (resolves to C)
 * - Fixed: Dim7 bass note determines function (symmetrical chord)
 * - Fixed: Only ONE inversion per dim7 activates wedge, others off-grid
 * - Added: E and G triads to their respective wedge families
 * - Fixed: Spelling now shows G#dim (not Abdim) in HOME space
 * 
 * 🎯 v3.5.0 MAJOR FEATURE - TRUE KEY TRANSPOSE:
 * - Transpose now shifts EVERYTHING (like a capo):
 *   • MIDI input transposed (C key → D with +2)
 *   • Hub displays transposed chords (shows D, not C)
 *   • Wedges light for transposed chords
 *   • Base key shifts (C → D with +2)
 *   • Sequencer chords transposed
 *   • Works WITH @KEY (adds/subtracts from specified key)
 * 
 * - Added Bypass Toggle (🔇/🔊):
 *   • Temporarily disable transpose without resetting value
 *   • Perfect for A/B comparison
 *   • Resume exactly where you left off
 * 
 * - Removed double-transpose bugs:
 *   • Notes already transposed at input, don't re-transpose at playback
 *   • Fixed stepNext, togglePlayPause, playback effect
 * 
 * - @KEY directive support:
 *   • No longer disables transpose
 *   • Transpose adds to @KEY value
 *   • Example: @KEY F + transpose +2 = key becomes G
 * 
 * 🎹 v3.5.0 TRANSPOSE IMPLEMENTATION:
 * - Transpose UI fully functional (was already mostly working)
 * - @KEY directive disables transpose (grays out button with ⚠)
 * - Keyboard shortcuts: T toggles dropdown, Shift+↑/↓ adjusts semitones
 * - Transpose affects playback only, not detection (correct behavior)
 * - Active transpose shows RED border, inactive shows BLUE
 * - Works with all sequence features (step record, comments, modifiers)
 * 
 * 🐛 v3.5.0 HOTFIX:
 * - Fixed A triad triggering wrong wedge (was vi, now correctly V/ii bonus)
 * - Bonus wedge label stays "A7" (functional), center shows "A" or "A7" (actual)
 * - Reverted audio context changes (was working fine before)
 * 
 * 🔊 v3.5.0 AUDIO + BONUS WEDGE FIXES:
 * - Fixed A/A7 bonus wedge (V/ii) - now shows "A" for triad, "A7" for seventh
 * - Fixed audio context resume - now properly awaits resume promise
 * - Audio should work on first MIDI input without needing speaker toggle
 * 
 * 🎯 v3.5.0 CRITICAL FIX - G TRIAD vs G7:
 * - Fixed all triads being labeled as 7th chords (G→G7, D→D7, E→E7, etc.)
 * - Root cause: realizeFunction("V7") always returned "G7" even for triads
 * - Solution: Use absName from theory.ts (which correctly detects "G" vs "G7")
 * - Applied fix to both HOME and PAR space detection
 * - Preserves functional triggering (G triad still triggers V7 wedge correctly)
 * - But now displays correct chord name in hub/notation/step record
 * 
 * 🐛 v3.4.3 BUG FIXES:
 * - Restored loop button (🔁)
 * - Restored comment navigation buttons (<< >>)
 * - Fixed Play button (was ▶️, now shows ▷ and ■)
 * - Fixed Prev/Next buttons (were emoji, now < >)
 * - Fixed Play colors (green when stopped, red when playing)
 * - Added flexWrap to transport row
 *
 * 
 * 🔧 v3.4.3 FIXES:
 * - Transpose/Reset only visible in EXPERT mode (or if transpose non-zero)
 * - Fixed double-reset issue: now fully resets spaces in one click
 * - Added subHasSpunRef, recentRelMapRef clearing to resetAll
 * 
 * 🔧 v3.4.3 FIXES:
 * - Transpose always visible if non-zero, turns yellow when active
 * - Transpose dropdown now horizontal (13 columns instead of 5 rows)
 * - Reset button doesn't trigger HOME wedge anymore
 * - Removed marginLeft:auto from Reset (better positioning)
 * 
 * 🎨 v3.4.3 MAJOR LAYOUT REORGANIZATION:
 * - Sequencer moved below keyboard
 * - Transport controls above sequencer (with Step Record)
 * - MMK + Show Bonus + Transpose + Reset combined in one row
 * - Transpose and Reset moved up from bottom
 * - Step Record moved down with transport
 * - Reset button changed to yellow
 * - Song display always visible, shows message when not EXPERT
 * - Enter button text changed to "APPLY"
 */
/*
 * HarmonyWheel.tsx — v3.4.3
 * 
 * 🔴 v3.4.3 ENTER BUTTON TEXT:
 * - Red Enter button now shows "LOAD" text below icon
 * - Only appears when there are unsaved changes
 * - Makes it obvious when changes need loading
 * 
 * 🔄 v3.3.4 BUTTON SWAP:
 * - Enter button (⏎) now immediately right of textarea
 * - Library button (📁) moved after Enter
 * - Better visual flow: edit → load → library
 * 
 * 🎨 v3.3.3 VISUAL TWEAK:
 * - Non-current sequence items now display in grey (#9CA3AF) for better focus
 * - Current item stays bright green (#39FF14)
 * - Comments even dimmer (#6b7280)
 * 
 * 🛑 v3.3.2 STEP RECORD EXIT:
 * - Step record mode now exits automatically when:
 *   • Transport buttons pressed (<<, <, >, play/pause, stop)
 *   • Enter key pressed to load sequence
 * - Prevents loop recording situation
 * - setStepRecord(false) + stepRecordRef.current = false in all transport handlers
 * 
 * 📝 v3.3.1 TERMINOLOGY UPDATES:
 * - "Auto Record" → "Step Record" (everywhere)
 * - "Song/Playlist/Editor" → "Sequencer" (in UI text)
 * - Variable names updated: autoRecord → stepRecord, autoRecordRef → stepRecordRef
 * - Placeholder text: "Song Name" → "Sequence Name"
 * - Menu tooltips and comments updated
 * 
 * 🎨 v3.3.0 SKILL SELECTOR UI:
 * - Simplified horizontal skill selector (removed complex radial wheel)
 * - Square borders instead of circles
 * - Selected skill shown in bright color
 * - Larger icons (40px, up from 36px)
 * - Expert mode shows "EXPERT\n(all functions)"
 * - Better readability and consistency
 * 
 * 💬 v3.2.7 COMMENTS PAUSE:
 * - Comments now pause when you press > (don't auto-skip)
 * - Allows visual section breaks in sequences
 * - "# B Section" will pause, then next > plays the chord
 * - Combined still works: "# Section: Chord" plays immediately
 * 
 * 🔧 v3.2.6 PARSER FIX:
 * - Improved comment+chord regex to handle m7b5, b5, #5, etc.
 * - Reminder: Use colon not comma: "# B Section: Bm7b5" ✅
 * - Not comma: "# B Section, Bm7b5" ❌ (splits into separate tokens)
 * 
 * 🎯 v3.2.5 QUALITY OF LIFE:
 * - Forgiving parser: @HOME: F (space after colon) now works
 * - Combined comments: # Verse: Am plays Am after displaying "Verse"
 * - Combined KEY: @KEY: B F#m changes key to B and plays F#m
 * - Don't auto-play first chord on load or "Go to Start"
 * - Better textarea click targets (explicit line-height)
 * - 📌 TODO: Add Help button to overlay with full documentation
 * 
 * 🎯 v3.2.4 COMBINED MODIFIERS:
 * - Can now combine space switches with chords in one token!
 * - Examples: @HOME:F, @SUB:Gm7, HOME:C, SUB F (space or colon)
 * - No more rhythm-breaking double clicks!
 * - Usage: F, F, C, C, G, G, C, C7, @HOME:F, F, C, C, G, G7, C, C
 * 
 * ⏮️ v3.2.3 REVERT:
 * - Reverted v3.2.2 change (C triad no longer auto-exits SUB)
 * - Original MIDI logic is correct and carefully tuned
 * - Use manual @HOME modifier in sequencer for edge cases
 * - Example: F, F, C, C, G, G, C, C7, @HOME, F, F, C, C, G, G7, C, C
 * 
 * 🏠 v3.2.2 SUB EXIT FIX (REVERTED):
 * - Plain C triad now exits SUB space when latched (returns HOME)
 * - Allows C7 → F → C progression to work correctly in sequencer
 * - C7 enters SUB, F stays in SUB, plain C returns to HOME
 * 
 * 🔊 v3.2.1 AUDIO FIX:
 * - Restored audio playback in sequencer (was removed in v3.2.0)
 * - Now detect() handles detection AND we play the audio
 * 
 * 🎯 v3.2.0 MAJOR REFACTOR:
 * - Sequencer now uses IDENTICAL detection logic as MIDI input!
 * - applySeqItem() simulates MIDI state and calls detect()
 * - Single source of truth for all chord detection
 * - G chord now lights V wedge in sequencer ✅
 * - C7 activates SUB space in sequencer ✅
 * - All MIDI rules (SUB/PAR/REL activation, bonus chords) now work in sequencer!
 * 
 * 🔧 v3.1.4 CRASH FIX:
 * - FIXED: Crash when playing plain V chord (preview module doesn't know about V yet)
 * - Added fallback to CHORD_DEFINITIONS when preview.chordPcsForFn returns undefined
 * - G chord now plays AND lights V wedge without crashing!
 * 
 * 🔥 v3.1.3 CRITICAL FIX:
 * - FIXED: G triad now lights V wedge (was only lighting for G7)
 * - Restored single source of truth - sequencer now matches MIDI behavior
 * - G (V triad) now correctly returns "V" function instead of null
 * 
 * ✅ v3.1.2 BUG FIX:
 * - FIXED: G chord now plays correct notes (G-B-D instead of C-E-G)
 * - Added latchedAbsNotesRef to bypass React state timing issue
 * - stepNext now uses ref for synchronous note access
 * 
 * 🔧 v3.1.1 DEBUG/FIX:
 * - Added comprehensive console logging for stepNext flow
 * - Added displayIndex separate from seqIndex for proper sync
 * - Fixed G chord fallback parser (added logging)
 * - Investigating why first G plays C-E-G instead of G-B-D
 * 
 * 🎉 v3.1.0 NEW FEATURES:
 * - ✅ Help overlay system with keyboard shortcuts and UI tips
 * - ✅ Audio initialization splash (Web Audio API compliance)
 * - ✅ Version display in status bar
 * 
 * PREVIOUS CHANGES (v2.45.0):
 * - **THE CRITICAL FIX:** pcsRel now relative to baseKey, not C!
 * - Changed: `toRel = (n) => ((n - NAME_TO_PC["C"] + 12) % 12)`
 * - To: `toRel = (n) => ((n - NAME_TO_PC[baseKeyRef.current] + 12) % 12)`
 * 
 * THIS MAKES:
 * - ✅ All isSubset() checks work in any key
 * - ✅ Play E major chords, see E major functions
 * - ✅ Play Ab major chords, see Ab major functions  
 * - ✅ Bonus chords (Bdim, Bm7♭5, A7) transpose correctly
 * - ✅ SUB entry works in any key (ii of IV)
 * - ✅ PAR entry works in any key (vi of ♭VI)
 * - ✅ ALL hardcoded checks now relative!
 * 
 * MODIFIED BY: Claude AI for Nathan Rosenberg / Beat Kitchen
 * DATE: November 1, 2025
 */

// Prefer ii (Gm/Gm7) over ♭VII (Bb) when Bb triad co-occurs with G/Gm context
function preferIiOverFlatVII(S: Set<number>): boolean {
  const hasAll = (ns: number[]) => ns.every(n => S.has(n));
  const hasBbTriad = hasAll([10, 2, 5]);   // Bb–D–F
  const hasGm      = hasAll([7, 10, 2]);   // G–Bb–D
  const hasG       = S.has(7);             // G present
  const DIM_OPACITY = 0.32;  // tweak 0..1

  return hasBbTriad && (hasGm || hasG);
}
// HarmonyWheel.tsx — v2.37.7 (drop-in)
// - Keeps your v2.29.x behavior, SUB Gm7 debounce, bonus overlays, etc.
// - Fixes: center label legibility; guitar tab now updates from active wedge;
//          input/keyboard/guitar are aligned; buttons stack above tab.
// - Adds: arrow-key nav for the input; consistent layout grid.
// - Relies on your existing ./lib/* and ./components/GuitarTab files.

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Fn, KeyName } from "./lib/types";
import {
  FN_COLORS, FN_LABEL_COLORS, HUB_RADIUS, HUB_FILL, HUB_STROKE, HUB_STROKE_W,
  CENTER_FONT_FAMILY, CENTER_FONT_SIZE, CENTER_FILL,
  WHEEL_W, WHEEL_H, VISITOR_ROTATE_DEG, ROTATION_ANIM_MS,
  NEGATIVE_ON_VISITOR, EPS_DEG, BONUS_OVERLAY, BONUS_CENTER_ANCHOR_DEG,
  BONUS_OUTER_R, BONUS_OUTER_OVER, BONUS_INNER_R, BONUS_FILL, BONUS_STROKE,
  BONUS_TEXT_FILL, BONUS_TEXT_SIZE, BONUS_FUNCTION_BY_LABEL, SHOW_WEDGE_LABELS,
  SHOW_CENTER_LABEL, LATCH_PREVIEW, PREVIEW_USE_SEVENTHS, MIDI_SUPPORTED,
  RING_FADE_MS, UI_SCALE_DEFAULT, KBD_WIDTH_FRACTION, KBD_HEIGHT_FACTOR_DEFAULT,
  IV_ROTATE_DEG,
  // v3 layout/animation knobs
  DIM_FADE_MS, JIGGLE_DEG, JIGGLE_MS, BONUS_DEBOUNCE_MS,
  KEYBOARD_WIDTH_FRACTION, GUITAR_TAB_WIDTH_FRACTION
} from "./lib/config";

import GuitarTab from "./components/GuitarTab";

// v3.1.0: Help overlay with visual callouts
import HelpOverlay from "./components/HelpOverlay";

// v3.1.0: Circular skill selector with radial text
import SkillWheel from "./components/SkillWheel";

import { computeLayout, annulusTopDegree } from "./lib/geometry";
import {
  pcFromMidi, pcNameForKey, FLAT_NAMES, NAME_TO_PC, T, subsetOf,
  internalAbsoluteName, mapDimRootToFn_ByBottom, mapDim7_EbVisitor, add12,
  realizeFunction, getSubKey, getParKey
} from "./lib/theory";
import {
  VISITOR_SHAPES, C_REQ7, C_REQT, EB_REQ7, EB_REQT, firstMatch, getVisitorShapesFor, getDiatonicTablesFor
} from "./lib/modes";
import { BonusDebouncer } from "./lib/overlays";
import * as preview from "./lib/preview";
import { defaultSong, demoSongs } from "./data/demoSongs";
import { 
  generateShareableURL, 
  getSongFromURL, 
  exportSongToFile, 
  importSongFromFile,
  copyToClipboard,
  parseSongMetadata
} from "./lib/songManager";

const HW_VERSION = 'v3.17.93';
const PALETTE_ACCENT_GREEN = '#7CFF4F'; // palette green for active outlines

import { DIM_OPACITY } from "./lib/config";


export default function HarmonyWheel(){
  // v3.1.0: Skill level icon paths (from public folder)
  const skillIcons = {
    ROOKIE: "/assets/rookie.png",
    NOVICE: "/assets/novice.png",
    SOPHOMORE: "/assets/sophomore.png",
    ADVANCED: "/assets/advanced.png",
    EXPERT: "/assets/expert.png",
  };
  /* ---------- Core state ---------- */
  const [baseKey,setBaseKey]=useState<KeyName>("C");
  
  // Transpose state - must be declared early for effectiveBaseKey calculation
  const [transpose, setTranspose] = useState(0); // Semitones (-12 to +12)
  const [transposeBypass, setTransposeBypass] = useState(false); // Temporarily disable transpose
  
  // Skill level system
  type SkillLevel = "ROOKIE" | "NOVICE" | "SOPHOMORE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("ADVANCED");
  
  // Define which functions are visible at each level (cumulative)
  const SKILL_LEVEL_FUNCTIONS: Record<SkillLevel, Fn[]> = {
    "ROOKIE": ["I", "IV", "V", "V7"],  // ✅ v3.17.13: Added V (plain triad)
    "NOVICE": ["I", "IV", "V", "V7", "vi"],  
    "SOPHOMORE": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi"],  
    "INTERMEDIATE": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "ii", "iii", "♭VII", "iv"],  
    "ADVANCED": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "V/ii", "ii", "iii", "♭VII", "iv", "Bm7♭5"],  // ✅ v3.17.13: Added V/ii and Bm7♭5
    "EXPERT": ["I", "IV", "V", "V7", "vi", "V/V", "V/vi", "V/ii", "ii", "iii", "♭VII", "iv", "Bm7♭5"]  // ✅ v3.17.13: Added V/ii and Bm7♭5
  };
  
  // Check if a function is visible at current skill level
  const isFunctionVisible = (fn: Fn): boolean => {
    return SKILL_LEVEL_FUNCTIONS[skillLevel].includes(fn);
  };
  
  // Bonus wedges available in ADVANCED and EXPERT
  const bonusWedgesAllowed = skillLevel === "ADVANCED" || skillLevel === "EXPERT";
  

// --- Auto-clear bonus overlays so base wedges return to full color on release
useEffect(() => {
  const clear = () => {
    try {
      setBonusActive(false); setBonusLabel && setBonusLabel("");
    } catch {}
  };
  window.addEventListener("keyup", clear);
  window.addEventListener("pointerup", clear);
  window.addEventListener("mouseup", clear);
  window.addEventListener("touchend", clear);
  return () => {
    window.removeEventListener("keyup", clear);
    window.removeEventListener("pointerup", clear);
    window.removeEventListener("mouseup", clear);
    window.removeEventListener("touchend", clear);
  };
}, []);

  // PHASE 2B: Dynamic SUB and PAR keys (not hardcoded!)
  // SUB = IV of baseKey (F when base=C, Db when base=Ab, A when base=E, etc.)
  // PAR = ♭VI of baseKey (Eb when base=C, Cb when base=Ab, G when base=E, etc.)
  const subKey = useMemo(() => getSubKey(baseKey), [baseKey]);
  const parKey = useMemo(() => getParKey(baseKey), [baseKey]);
  
  // Helper: Transpose a key name by N semitones
  const transposeKey = (key: KeyName, semitones: number): KeyName => {
    const pc = NAME_TO_PC[key];
    const newPc = (pc + semitones + 12) % 12;
    const result = FLAT_NAMES[newPc]; // Always use flat names for keys
    return result;
  };
  
  // ✅ v3.6.7 FIX: Calculate transpose and effective key EARLY so patterns can use it
  const effectiveTranspose = transposeBypass ? 0 : transpose;
  const effectiveBaseKey = effectiveTranspose !== 0 ? transposeKey(baseKey, effectiveTranspose) : baseKey;
  
  // Dynamic VISITOR_SHAPES (PAR entry chords) - uses effectiveBaseKey (respects transpose!)
  const visitorShapes = useMemo(() => getVisitorShapesFor(effectiveBaseKey), [effectiveBaseKey]);
  
  // Dynamic diatonic matching tables for HOME and PAR spaces - uses effectiveBaseKey (respects transpose!)
  const homeDiatonic = useMemo(() => getDiatonicTablesFor(effectiveBaseKey), [effectiveBaseKey]);
  
  // ✅ v3.6.0 FIX: Ensure baseKeyRef always syncs with baseKey state
  // Critical for sequencer to use correct key context
  useEffect(() => {
    console.log('🔑 [v3.6.0] baseKey synced to ref:', baseKey);
    baseKeyRef.current = baseKey;
  }, [baseKey]);
  const parDiatonic = useMemo(() => getDiatonicTablesFor(parKey), [parKey]);

  const [activeFn,setActiveFn]=useState<Fn|"">("I");
  const activeFnRef=useRef<Fn|"">("I"); useEffect(()=>{activeFnRef.current=activeFn;},[activeFn]);

  const [centerLabel,setCenterLabel]=useState("C");
  const lastPlayedChordRef = useRef<string>("C"); // Track for Make My Key
  const lastDetectedChordRef = useRef<string>("C"); // From theory.ts - pure MIDI detection

  const [visitorActive,_setVisitorActive]=useState(false);
  const visitorActiveRef=useRef(false);
  const setVisitorActive=(v:boolean)=>{ visitorActiveRef.current=v; _setVisitorActive(v); };

  const [relMinorActive,_setRelMinorActive]=useState(false);
  const relMinorActiveRef=useRef(false);
  const setRelMinorActive=(v:boolean)=>{ relMinorActiveRef.current=v; _setRelMinorActive(v); };

  // SUB (F)
  const [subdomActive,_setSubdomActive]=useState(false);
  const subdomActiveRef=useRef(false);
  const setSubdomActive=(v:boolean)=>{ subdomActiveRef.current=v; _setSubdomActive(v); };
  const subdomLatchedRef = useRef(false);
  const subLastSeenFnRef = useRef<Fn>("I");
  const subExitCandidateSinceRef = useRef<number | null>(null);
  const subHasSpunRef = useRef(false);

  // windows/suppression
  const RECENT_PC_WINDOW_MS = 360;
  const recentRelMapRef = useRef<Map<number, number>>(new Map());
  const lastPcsRelSizeRef = useRef<number>(0);
  const homeSuppressUntilRef = useRef(0);
  const subHoldUntilRef = useRef<number>(0);
  const justExitedSubRef = useRef(false);

  const [rotationOffset,setRotationOffset]=useState(0);
  const [targetRotation,setTargetRotation]=useState(0);

  /* ---------- Rotation animation ---------- */
  const animRef=useRef<{from:number;to:number;start:number;dur:number;raf:number|null}|null>(null);
  const ease=(t:number)=> t<0.5?2*t*t:-1+(4-2*t)*t;
  useEffect(()=>{ if(animRef.current?.raf) cancelAnimationFrame(animRef.current.raf);},[]);
  useEffect(()=>{
    if(animRef.current?.raf) cancelAnimationFrame(animRef.current.raf);
    const from = rotationOffset, to = targetRotation;
    if(Math.abs(from - to) < EPS_DEG){ setRotationOffset(to); animRef.current = null; return; }
    const a = { from, to, start: performance.now(), dur: ROTATION_ANIM_MS, raf: 0 as unknown as number };
    animRef.current = a as any;
    const tick=()=>{ const k=Math.min(1,(performance.now()-a.start)/a.dur);
      setRotationOffset(a.from + (a.to - a.from) * ease(k));
      if(k<1){ a.raf=requestAnimationFrame(tick);} else { animRef.current=null; setRotationOffset(to); }
    };
    a.raf=requestAnimationFrame(tick);
    return ()=>{ if(a.raf) cancelAnimationFrame(a.raf); };
  },[targetRotation]);

  // Regular rotation (relative/parallel). SUB doesn’t hold persistent rotation.
  useEffect(()=>{
    if(relMinorActive || visitorActive) setTargetRotation(VISITOR_ROTATE_DEG);
    else if(!subdomActive) setTargetRotation(0);
  },[relMinorActive, visitorActive, subdomActive]);

  /* ---------- Bonus + trails ---------- */
  const [bonusActive,setBonusActive]=useState(false);
  const [bonusLabel,setBonusLabel]=useState("");
  const bonusDeb = useRef(new BonusDebouncer()).current;
  const [showBonusWedges, setShowBonusWedges] = useState(false); // Toggle for bonus wedge visibility
  const showBonusWedgesRef = useRef(false);
  useEffect(() => { 
    showBonusWedgesRef.current = showBonusWedges; 
  }, [showBonusWedges]);
  
  // ✅ v3.15.0: MIDI latch - keep last detected chord visible for 10s after note-off
  const midiLatchTimeoutRef = useRef<number | null>(null);
  const latchedChordRef = useRef<{fn: Fn | "", label: string} | null>(null);
  
  /* ---------- Space Lock (v3.11.0) ---------- */
  const [spaceLocked, setSpaceLocked] = useState(false);
  
  // Audio playback
  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio enabled
  const [audioInitialized, setAudioInitialized] = useState(false); // ✅ v3.17.85: Track if audio is ready
  const [showAudioPrompt, setShowAudioPrompt] = useState(false); // ✅ v3.17.85: iOS audio prompt
  const audioEnabledRef = useRef(true); // Ref for MIDI callback closure
  const [audioReady, setAudioReady] = useState(false); // ✅ v3.17.85: Start false, set true when initialized
  
  // Sync audioReady with audioInitialized
  useEffect(() => {
    setAudioReady(audioInitialized && audioEnabled);
  }, [audioInitialized, audioEnabled]);
  
  // Initialize audio context on mount since we start with audio enabled
  useEffect(() => {
    if (audioEnabled) {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        // Will be resumed on first user interaction
        const resumeAudio = async () => {
          await ctx.resume();
          setAudioReady(true);
          document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio, { once: true });
      } else {
        setAudioReady(true);
      }
    }
    
    // Global mouseup to catch releases outside wedges (for drag)
    const handleGlobalMouseUp = () => {
      if (wedgeHeldRef.current) {
        console.log('🛑 Global mouseup - releasing wedge');
        wedgeHeldRef.current = false;
        currentHeldFnRef.current = null;
        lastPlayedWith7thRef.current = null;
        
        // Stop all active chord notes
        const ctx = audioContextRef.current;
        if (ctx) {
          const now = ctx.currentTime;
          const releaseTime = 0.4;
          activeChordNoteIdsRef.current.forEach(noteId => {
            const nodes = activeNotesRef.current.get(noteId);
            if (nodes) {
              nodes.gain.gain.cancelScheduledValues(now);
              nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
              nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
              setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
            }
          });
        }
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [audioEnabled]); // Run once on mount
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Map<string, {osc1: OscillatorNode, osc2: OscillatorNode, osc3: OscillatorNode, gain: GainNode}>>(new Map());
  let noteIdCounter = 0; // For generating unique note IDs
  
  // Voice leading for chord playback
  const previousVoicingRef = useRef<number[]>([60, 64, 67]); // Default C major [C4, E4, G4]
  const activeChordNoteIdsRef = useRef<Set<string>>(new Set()); // Track note IDs instead of MIDI numbers
  const wedgeHeldRef = useRef(false); // Track if wedge is being held down
  const lastWedgeClickTimeRef = useRef<number>(0); // ✅ v3.17.85: Track click timing
  const wedgeClickFnRef = useRef<Fn | "">(""); // ✅ v3.17.85: Track which wedge was clicked
  const keyboardHeldNotesRef = useRef<Set<number>>(new Set()); // Track which keyboard notes are held
  const lastPlayedWith7thRef = useRef<boolean | null>(null); // Track if last chord had 7th
  const currentHeldFnRef = useRef<Fn | null>(null); // Track which function is being held
  
  // ✅ v3.17.10: Shift key state for visual indicator
  const [shiftHeld, setShiftHeld] = useState(false);
  
  // Help overlay
  const [showHelp, setShowHelp] = useState(false);
  
  // ✅ v3.17.85: Track window size - use 768px breakpoint (more standard)
  const [isDesktop, setIsDesktop] = useState(true); // Default true to avoid flicker
  
  useEffect(() => {
    // Set correct value after mount - 768px is standard mobile/tablet breakpoint
    setIsDesktop(window.innerWidth >= 768);
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ✅ v3.17.85: Initialize audio on first user interaction (mobile requirement)
  useEffect(() => {
    const initAudio = () => {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setAudioInitialized(true);
          setShowAudioPrompt(false);
        });
      } else {
        setAudioInitialized(true);
        setShowAudioPrompt(false);
      }
    };
    
    // Listen for first touch/click
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });
    
    // Show prompt after 2 seconds if not initialized on mobile
    const promptTimer = setTimeout(() => {
      if (!audioInitialized && !isDesktop) {
        setShowAudioPrompt(true);
      }
    }, 2000);
    
    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
      clearTimeout(promptTimer);
    };
  }, [audioInitialized, isDesktop]);
  
  // ✅ v3.17.85: Load song from URL - optimized to prevent spam
  const [hasLoadedFromURL, setHasLoadedFromURL] = useState(false);
  const [urlSearchParam, setUrlSearchParam] = useState('');
  
  // Track URL changes
  useEffect(() => {
    const currentSearch = window.location.search;
    if (currentSearch !== urlSearchParam) {
      setUrlSearchParam(currentSearch);
      setHasLoadedFromURL(false); // Reset flag when URL changes
    }
  }, [urlSearchParam]);
  
  // Load from URL when params change
  useEffect(() => {
    if (hasLoadedFromURL) return; // Already loaded this URL
    
    const params = new URLSearchParams(urlSearchParam);
    const songParam = params.get('song');
    
    if (!songParam) return; // No song to load
    
    console.log('📨 Received song param:', songParam.substring(0, 50) + '...');
    const songData = decodeSongFromURL(songParam);
    
    if (songData && typeof songData === 'object' && typeof songData.text === 'string') {
      let cleanText = songData.text.trim();
      
      // Remove array brackets if present
      if (cleanText.startsWith('[') && cleanText.endsWith(']')) {
        cleanText = cleanText.slice(1, -1).trim();
      }
      
      // Remove any JSON-like wrappers if they leaked through
      if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        console.warn('⚠️ JSON object detected in text field, attempting to extract...');
        try {
          const nested = JSON.parse(cleanText);
          if (nested.text) cleanText = nested.text;
        } catch(e) {
          // Not parseable, use as-is
        }
      }
      
      console.log('📥 Loading shared song:', songData.title);
      console.log('📝 Final clean text:', cleanText);
      
      // Set states - text will appear in editor
      setBaseKey(songData.key || 'C');
      setSkillLevel('EXPERT');
      setInputText(cleanText);
      setLoadedSongText(cleanText); // Mark as loaded (no red border)
      setHasLoadedFromURL(true);
      
      // Auto-parse after states settle
      setTimeout(() => {
        console.log('🎵 Auto-parsing shared song');
        parseAndLoadSequence();
      }, 200);
      
      console.log('✅ Shared song loaded - will auto-parse');
    } else {
      console.error('Invalid song data:', songData);
    }
  }, [urlSearchParam, hasLoadedFromURL]);
  
  // ✅ v3.17.24: Button pulse animation when key pressed
  const [pulsingButton, setPulsingButton] = useState<string | null>(null);
  const [pulsingWedge, setPulsingWedge] = useState<Fn | "">(""); // ✅ v3.17.85: Visual feedback on click
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showTransposeDropdown, setShowTransposeDropdown] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [shareURL, setShareURL] = useState<string>('');
  const [showShareCopied, setShowShareCopied] = useState(false); // ✅ v3.17.85: Share feedback
  const [showShareModal, setShowShareModal] = useState(false); // ✅ v3.17.85: Share options modal
  const [keyChangeFlash, setKeyChangeFlash] = useState(false);
  const [stepRecord, setStepRecord] = useState(false); // v3.3.1: Renamed from autoRecord
  const stepRecordRef = useRef(false); // v3.3.1: Renamed from stepRecordRef
  
  // ✅ v3.16.0: Performance Mode - keyboard pad controller
  const [performanceMode, setPerformanceMode] = useState(false);
  const performanceModeRef = useRef(false);
  
  // ✅ v3.17.6: Momentary flash for performance keys (500ms, independent of wedge trail)
  const [performanceFlashKey, setPerformanceFlashKey] = useState<string>('');
  const performanceFlashTimeoutRef = useRef<number | null>(null); // Browser timeout returns number
  
  // ✅ v3.15.5: Refs for click-outside detection
  const transposeDropdownRef = useRef<HTMLDivElement>(null);
  const keyDropdownRef = useRef<HTMLDivElement>(null);
  
  const [trailFn, setTrailFn] = useState<Fn|"">("");
  const [trailTick, setTrailTick] = useState(0);
  const [trailOn] = useState(true);
  useEffect(()=>{ if(!trailFn) return;
    let raf:number; const start=performance.now();
    const loop=()=>{ const dt=performance.now()-start;
      if(dt<RING_FADE_MS){ setTrailTick(dt); raf=requestAnimationFrame(loop); }
      else { setTrailFn(""); setTrailTick(0);}
    };
    raf=requestAnimationFrame(loop);
    return ()=>{ if(raf) cancelAnimationFrame(raf); };
  },[trailFn]);

  const [bonusTrailOn, setBonusTrailOn] = useState(false);
  const [bonusTrailTick, setBonusTrailTick] = useState(0);
  const lastBonusGeomRef = useRef<{a0Top:number;a1Top:number}|null>(null);

  /* ---------- MIDI ---------- */
  const midiAccessRef=useRef<any>(null);
  const [inputs, setInputs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  
  // ✅ v3.17.0: MIDI Output support
  const [outputs, setOutputs] = useState<any[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>("");
  const [midiOutputEnabled, setMidiOutputEnabled] = useState(false);
  const midiOutputRef = useRef<any>(null);

  const rightHeld=useRef<Set<number>>(new Set());
  const rightSus=useRef<Set<number>>(new Set());
  const leftHeld=useRef<Set<number>>(new Set());
  const sustainOn=useRef(false);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiName, setMidiName] = useState("");

  const [latchedAbsNotes, setLatchedAbsNotes] = useState<number[]>([]);
  const latchedAbsNotesRef = useRef<number[]>([]); // Synchronous mirror for immediate playback
  const lastInputWasPreviewRef = useRef(false);

  const lastMidiEventRef = useRef<"on"|"off"|"cc"|"other">("other");


  const bindToInput=(id:string, acc:any)=>{
    acc.inputs.forEach((i:any)=>{ i.onmidimessage=null; });
    const dev = acc.inputs.get(id);
    if(!dev){ setSelectedId(""); setMidiConnected(false); setMidiName(""); return; }
    dev.onmidimessage=(e:any)=>{
      setMidiConnected(true); setMidiName(dev.name||"MIDI");
      lastInputWasPreviewRef.current = false;
      const [st,d1,d2]=e.data, type=st&0xf0;

      if (type===0x90 && d2>0) {
        lastMidiEventRef.current = "on";
        
        // ✅ v3.14.0: Removed auto-disable of showBonusWedges toggle
        // The persistent wedges already hide when bonusActive becomes true
        // No need to touch the user's toggle setting
        
        // Transpose octave: A0 to C2 (MIDI 21-36)
        if (d1<=36){
          leftHeld.current.add(d1);
          const lowest = Math.min(...leftHeld.current);
          const k = pcNameForKey(pcFromMidi(lowest), "C") as KeyName;
          setBaseKey(k);
        } else {
          // v3.5.0: Apply transpose to MIDI input
          const transposedNote = d1 + effectiveTranspose;
          console.log('🎹 MIDI INPUT:', {
            originalNote: d1,
            transpose: effectiveTranspose,
            transposedNote,
            noteName: `${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][d1 % 12]} → ${['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'][transposedNote % 12]}`
          });
          rightHeld.current.add(transposedNote);
          if (sustainOn.current) rightSus.current.add(transposedNote);
          
          // Play audio for MIDI keyboard input (use transposed note)
          if (audioEnabledRef.current) {
            const velocity = d2 / 127;
            playNote(transposedNote, velocity, false);
          }
        }
        detect();
      } else if (type===0x80 || (type===0x90 && d2===0)) {
        lastMidiEventRef.current = "off";
        if (d1<=36) leftHeld.current.delete(d1);
        else { 
          // v3.5.0: Apply transpose to note-off as well
          const transposedNote = d1 + effectiveTranspose;
          rightHeld.current.delete(transposedNote); 
          rightSus.current.delete(transposedNote);
          
          // Stop audio for MIDI keyboard note-off (use transposed note)
          if (audioEnabledRef.current) {
            stopNote(transposedNote);
          }
        }
        // Don't call detect() immediately on note-off - keep chord visible
        // User can then click "Make This My Key" button
        // Only detect after a delay
        setTimeout(() => {
          detect();
          
          // ✅ v3.15.0: Start 10-second latch timer if all notes released
          const allNotesReleased = rightHeld.current.size === 0 && rightSus.current.size === 0;
          if (allNotesReleased && midiLatchTimeoutRef.current === null) {
            // Only start timer if one isn't already running
            const timerId = window.setTimeout(() => {
              console.log('⏰ TIMEOUT FIRING - clearing everything');
              latchedChordRef.current = null;
              activeFnRef.current = ""; // ✅ Clear ref immediately
              setActiveFn("");
              setCenterLabel("");
              setLatchedAbsNotes([]); // ✅ Clear keyboard highlights
              lastInputWasPreviewRef.current = false; // ✅ Clear preview flag
              midiLatchTimeoutRef.current = null;
              console.log('⏱️ MIDI latch timeout - cleared display and keyboard highlights');
            }, 10000);
            
            midiLatchTimeoutRef.current = timerId;
            console.log('⏱️ MIDI latch timer started - 10s until clear, timerId:', timerId);
          }
        }, 50);
      } else if (type===0xB0 && d1===64) {
        lastMidiEventRef.current = "cc";
        const on = d2>=64;
        if (!on && sustainOn.current){
          for (const n of Array.from(rightSus.current))
            if (!rightHeld.current.has(n)) rightSus.current.delete(n);
          sustainOn.current = false;
          detect();
        } else if (on && !sustainOn.current){
          sustainOn.current = true;
          for (const n of rightHeld.current) rightSus.current.add(n);
        }
      }
    };
    setSelectedId(id); setMidiConnected(true); setMidiName(dev.name||"MIDI");
  };

  useEffect(()=>{ if(!MIDI_SUPPORTED || midiAccessRef.current) return;
    (async()=>{
      try{
        const acc:any=await (navigator as any).requestMIDIAccess({sysex:false});
        midiAccessRef.current=acc;
        
        // Setup inputs
        const list=Array.from(acc.inputs.values());
        setInputs(list as any[]);
        if(list.length>0){ bindToInput((list[0] as any).id, acc); } else { setMidiConnected(false); setMidiName(""); }
        
        // ✅ v3.17.0: Setup outputs
        const outputList=Array.from(acc.outputs.values());
        setOutputs(outputList as any[]);
        if(outputList.length>0){ 
          const firstOutput = outputList[0] as any;
          setSelectedOutputId(firstOutput.id);
          midiOutputRef.current = firstOutput;
        }
        
        acc.onstatechange=()=>{
          const fresh=Array.from(acc.inputs.values());
          setInputs(fresh as any[]);
          if(selectedId && !fresh.find((i:any)=>i.id===selectedId)){
            if(fresh[0]) bindToInput((fresh[0] as any).id, acc);
            else { setSelectedId(""); setMidiConnected(false); setMidiName(""); }
          }
          
          // Update outputs
          const freshOutputs=Array.from(acc.outputs.values());
          setOutputs(freshOutputs as any[]);
          if(selectedOutputId && !freshOutputs.find((o:any)=>o.id===selectedOutputId)){
            if(freshOutputs[0]) {
              setSelectedOutputId((freshOutputs[0] as any).id);
              midiOutputRef.current = freshOutputs[0];
            } else {
              setSelectedOutputId("");
              midiOutputRef.current = null;
            }
          }
        };
      }catch{/* ignore */}
    })();
  },[selectedId, selectedOutputId]);

  /* ---------- v3: Sequence / input ---------- */
  const [inputText, setInputText] = useState(defaultSong);
  const [loadedSongText, setLoadedSongText] = useState(defaultSong); // Track what's actually loaded
  type SeqItem = { 
    kind: "chord" | "modifier" | "comment" | "title"; 
    raw: string; 
    chord?: string; 
    comment?: string; 
    title?: string;
    duration?: number; // ✅ v3.17.93: Duration in bars (1 = whole bar, 0.5 = half bar, etc.)
  };
  const [sequence, setSequence] = useState<SeqItem[]>([]);
  const [seqIndex, setSeqIndex] = useState(-1); // What's loaded in hub (ready to play next)
  const [displayIndex, setDisplayIndex] = useState(-1); // What we're showing/highlighting (what was just played)
  
  // Playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(60); // BPM (beats per minute)
  
  // Debug: Log transpose changes
  useEffect(() => {
    console.log('🎹 TRANSPOSE STATE:', {
      transpose,
      transposeBypass,
      effectiveTranspose,
      baseKey,
      willBecomeKey: effectiveBaseKey
    });
  }, [transpose, transposeBypass, baseKey, effectiveTranspose, effectiveBaseKey]);
  
  // Debug: Log effective base key
  useEffect(() => {
    console.log('🎯 EFFECTIVE BASE KEY:', effectiveBaseKey, '(original:', baseKey, ')');
  }, [effectiveBaseKey, baseKey]);
  
  // Ref for baseKey - uses effectiveBaseKey for transpose
  const baseKeyRef = useRef<KeyName>("C"); 
  useEffect(() => { baseKeyRef.current = effectiveBaseKey; }, [effectiveBaseKey]);
  
  const [loopEnabled, setLoopEnabled] = useState(false);
  const playbackTimerRef = useRef<number | null>(null);
  const [songTitle, setSongTitle] = useState(""); // Static song title from @TITLE
  
  // Autoload preloaded playlist on mount
  useEffect(() => {
    if (inputText && sequence.length === 0) {
      parseAndLoadSequence();
    }
  }, []); // Run once on mount
  
  // Comment only shows if immediately following current chord
  const activeComment = (() => {
    if (seqIndex < 0 || seqIndex >= sequence.length - 1) return ""; // No comment if at end or invalid
    
    // Check if next item is a comment
    const nextItem = sequence[seqIndex + 1];
    if (nextItem && nextItem.kind === "comment") {
      return nextItem.comment || "";
    }
    return "";
  })();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to select current item in textarea (highlight with yellow)
  const selectCurrentItem = (indexToSelect?: number) => {
    // Use explicit index if provided, otherwise use current seqIndex
    const idx = indexToSelect !== undefined ? indexToSelect : seqIndex;
    
    if (!textareaRef.current || idx < 0 || !sequence[idx]) return;
    
    // Get the raw text of item at idx
    const currentRaw = sequence[idx].raw;
    
    // Use loadedSongText since that's what the sequence was parsed from
    const textToSearch = loadedSongText || inputText;
    
    // Find the Nth occurrence (where N = idx)
    // Split by comma and find our token
    const tokens = textToSearch.split(',').map(t => t.trim());
    let charPos = 0;
    let foundIndex = -1;
    
    for (let i = 0; i <= idx && i < tokens.length; i++) {
      const token = tokens[i];
      const nextPos = textToSearch.indexOf(token, charPos);
      if (nextPos !== -1) {
        if (i === idx) {
          foundIndex = nextPos;
          break;
        }
        charPos = nextPos + token.length;
      }
    }
    
    if (foundIndex !== -1) {
      textareaRef.current.setSelectionRange(foundIndex, foundIndex + currentRaw.length);
      // Keep focused so selection is visible
      textareaRef.current.focus();
    }
  };

  // Insert current chord at cursor position in textarea
  const insertCurrentChord = () => {
    if (!textareaRef.current || !currentGuitarLabel) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = inputText.substring(0, start);
    const after = inputText.substring(end);
    
    // Add comma before if needed (not at start and previous char isn't comma or space)
    const needsCommaBefore = start > 0 && before[before.length - 1] !== ',' && before[before.length - 1] !== ' ';
    
    // Always add comma and space after
    const insertion = (needsCommaBefore ? ', ' : '') + currentGuitarLabel + ', ';
    const newText = before + insertion + after;
    setInputText(newText);
    
    // Move cursor to after inserted text
    const newCursorPos = start + insertion.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const parseAndLoadSequence = ()=>{
    const APP_VERSION = "v3.17.93-harmony-wheel";
    console.log('=== PARSE AND LOAD START ===');
    console.log('🏷️  APP VERSION:', APP_VERSION);
    console.log('Input text:', inputText);
    setLoadedSongText(inputText); // Save what we're loading
    
    // Handle empty input gracefully
    if (!inputText.trim()) {
      setSequence([]);
      setSeqIndex(-1);
      setDisplayIndex(-1);
      setSongTitle("");
      // ✅ v3.6.0 FIX: Only reset key for truly empty input
      // Don't reset when loading actual sequences - preserve key selector setting
      setBaseKey("C");
      goHome();
      return;
    }
    
    // ✅ v3.17.93: RHYTHM NOTATION - Parse bar lines and calculate durations
    // Bar delimiters: | a l I
    // Inside bars: |Am, D7| = split bar evenly
    // Rest character: / = silent beat
    const BAR_DELIMITERS = /[\|alI]/g;
    
    // First pass: identify bar-delimited sections
    const rawTokens: Array<{text: string; hasBarLine: boolean}> = [];
    let currentSection = "";
    let insideBar = false;
    
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      
      if (['|', 'a', 'l', 'I'].includes(char)) {
        if (currentSection.trim()) {
          rawTokens.push({text: currentSection.trim(), hasBarLine: insideBar});
          currentSection = "";
        }
        insideBar = !insideBar;
      } else if (char === ',' && !insideBar) {
        // Comma outside bars: end of token
        if (currentSection.trim()) {
          rawTokens.push({text: currentSection.trim(), hasBarLine: false});
          currentSection = "";
        }
      } else {
        currentSection += char;
      }
    }
    
    // Don't forget last section
    if (currentSection.trim()) {
      rawTokens.push({text: currentSection.trim(), hasBarLine: insideBar});
    }
    
    // Second pass: split bar-delimited sections by comma and calculate durations
    const tokens: Array<{text: string; duration: number}> = [];
    for (const section of rawTokens) {
      if (section.hasBarLine) {
        // Inside bars: split evenly
        const chords = section.text.split(',').map(s => s.trim()).filter(Boolean);
        const durationEach = 1.0 / chords.length; // Split 1 bar evenly
        for (const chord of chords) {
          tokens.push({text: chord, duration: durationEach});
        }
      } else {
        // Outside bars: full bar each
        tokens.push({text: section.text, duration: 1.0});
      }
    }
    
    console.log('Parsed tokens with rhythm:', tokens);
    let title = "";
    // ✅ v3.6.0 FIX: Start from current baseKey, don't reset to C
    // This preserves manual key selector changes
    let currentKey: KeyName = baseKey; // Track key for functional notation
    
    const items: SeqItem[] = tokens.map(tokenObj => {
      const tok = tokenObj.text;
      const dur = tokenObj.duration;
      
      // Handle rest character
      if (tok === '/') {
        return { kind:"comment", raw:tok, comment: "(rest)", duration: dur };
      }
      
      // Comments start with #
      if (tok.startsWith("#")) {
        const commentText = tok.slice(1).trim();
        // NEW v3.2.5: Check if comment includes a chord after colon
        // Example: "# Verse: Am" or "# Bridge: F#m"
        if (commentText.includes(":")) {
          const colonIdx = commentText.indexOf(":");
          const beforeColon = commentText.substring(0, colonIdx).trim();
          const afterColon = commentText.substring(colonIdx + 1).trim();
          // If text after colon looks like a chord, it's a combined comment+chord
          // Updated v3.2.6: Better regex to handle m7b5, dim7, maj7, etc.
          const chordPattern = /^([A-G][#b]?)(m|maj|min|dim|aug|sus)?(7|9|11|13)?(b5|#5|♭5|#9|b9)?$/;
          if (afterColon && chordPattern.test(afterColon)) {
            return { kind:"comment", raw:tok, comment: beforeColon, chord: afterColon };
          }
        }
        return { kind:"comment", raw:tok, comment: commentText };
      }
      
      // Modifiers start with @
      if (tok.startsWith("@")) {
        const remainder = tok.slice(1).trim();
        // ✅ v3.17.85 FIX: Parse cmd from first word, then handle rest with colon support
        // "@KEY Eb: Ebmaj7" should parse as cmd="KEY", arg="Eb: Ebmaj7"
        const firstSpaceIdx = remainder.search(/\s/);
        let cmd, arg;
        
        if (firstSpaceIdx === -1) {
          // No space, check for colon: "@HOME:F"
          if (remainder.includes(":")) {
            [cmd, arg] = remainder.split(":", 2);
            arg = arg?.trim() || "";
          } else {
            // Just command, no arg: "@HOME"
            cmd = remainder;
            arg = "";
          }
        } else {
          // Has space: "@KEY Eb: Ebmaj7" or "@HOME F"
          cmd = remainder.substring(0, firstSpaceIdx);
          arg = remainder.substring(firstSpaceIdx + 1).trim();
        }
        
        const upper = (cmd||"").toUpperCase().trim();
        
        // Check for TITLE
        if (upper === "TITLE" || upper === "TI") {
          title = arg;
          return { kind:"title", raw:tok, title: arg };
        }
        
        // Check for KEY - update currentKey for functional notation
        if (upper === "KEY" || upper === "K") {
          const keyArg = arg.trim();
          // NEW v3.2.5: Check if there's a chord after the key
          // "@KEY Eb: Ebmaj7" → arg="Eb: Ebmaj7", split to get key and chord
          // Check for colon first (combined), then comma, then space
          let newKey: KeyName;
          let chordAfterKey = "";
          
          if (keyArg.includes(":")) {
            // Combined with colon: "Eb: Ebmaj7"
            const [k, ...c] = keyArg.split(":");
            newKey = k.trim() as KeyName;
            chordAfterKey = c.join(":").trim();
          } else if (keyArg.includes(",")) {
            // Comma separator: "Eb, Ebmaj7"
            const [k, ...c] = keyArg.split(",");
            newKey = k.trim() as KeyName;
            chordAfterKey = c.join(",").trim();
          } else {
            // Space separator: "Eb Ebmaj7"
            const parts = keyArg.split(/\s+/);
            newKey = parts[0] as KeyName;
            chordAfterKey = parts.slice(1).join(" ").trim();
          }
          
          if (FLAT_NAMES.includes(newKey)) {
            currentKey = newKey;
          }
          
          if (chordAfterKey) {
            return { kind:"modifier", raw:tok, chord: `KEY:${newKey}:${chordAfterKey}` };
          }
          return { kind:"modifier", raw:tok, chord: `KEY:${newKey}` };
        }
        
        // Normalize abbreviations: REL, SUB, PAR, HOME
        let normalized = upper;
        if (upper === "SUBDOM" || upper === "SUB") normalized = "SUB";
        else if (upper === "RELATIVE" || upper === "REL") normalized = "REL";
        else if (upper === "PARALLEL" || upper === "PAR") normalized = "PAR";
        else if (upper === "HOME" || upper === "HOM") normalized = "HOME";
        
        // NEW v3.2.4: Check if arg contains a chord to play after switching
        // Supports: @HOME:F, @SUB F, HOME:Gm7, etc.
        const chordArg = arg.trim();
        if (chordArg && (normalized === "HOME" || normalized === "SUB" || normalized === "REL" || normalized === "PAR")) {
          // Split into separate modifier + chord items
          // This allows: @HOME:F to (1) switch to HOME, then (2) play F
          return { kind:"modifier", raw:tok, chord: `${normalized}:${chordArg}` };
        }
        
        return { kind:"modifier", raw:tok, chord: `${normalized}:${arg}` };
      }
      
      // Check if it's functional notation (Roman numerals)
      // Supported: I-VII with variations (upper/lowercase, accidentals, 7ths, secondary dominants)
      // Examples: I, ii, ♭VII, V7, V/vi, ii/vi, ♭III, VI
      const functionalPattern = /^(♭|#)?([IViv]+)(7|M7|m7|maj7|dom7)?(\/([IViv]+))?$/;
      const match = tok.match(functionalPattern);
      
      console.log('[PARSER] Checking token:', tok, 'functionalPattern match:', match ? 'YES' : 'NO');
      
      if (match) {
        // It's functional notation - convert to literal chord based on current key
        const accidental = match[1] || '';
        const numeral = match[2];
        const quality = match[3] || '';
        const secondaryTarget = match[5]; // For V/vi style notation
        
        console.log('[PARSER] Roman numeral detected:', { accidental, numeral, quality, secondaryTarget, currentKey });
        
        // Convert Roman numeral to scale degree (0-11)
        const romanToDegreeLower: Record<string, number> = {
          'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
        };
        const romanToDegreeUpper: Record<string, number> = {
          'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11
        };
        
        const isLower = numeral === numeral.toLowerCase();
        const degreeMap = isLower ? romanToDegreeLower : romanToDegreeUpper;
        // ✅ v3.6.5 FIX: Use matching case - lowercase maps use lowercase keys, uppercase maps use uppercase keys
        let degree = degreeMap[numeral]; // Use numeral as-is (already correct case)
        
        console.log('[PARSER] Degree lookup:', { numeral, isLower, degree });
        
        if (degree !== undefined) {
          // If secondary dominant (e.g., V/vi), calculate target first
          if (secondaryTarget) {
            // Get target degree
            const targetIsLower = secondaryTarget === secondaryTarget.toLowerCase();
            const targetMap = targetIsLower ? romanToDegreeLower : romanToDegreeUpper;
            const targetDegree = targetMap[targetIsLower ? secondaryTarget : secondaryTarget.toLowerCase()];
            
            if (targetDegree !== undefined) {
              // V/vi means V of vi - so add degree to target
              degree = (targetDegree + degree) % 12;
            }
          }
          
          // Apply accidental
          if (accidental === '♭' || accidental === 'b') degree = (degree - 1 + 12) % 12;
          if (accidental === '#') degree = (degree + 1) % 12;
          
          // Get root note based on current key and degree
          const keyPc = NAME_TO_PC[currentKey] || 0;
          const rootPc = (keyPc + degree) % 12;
          
          // Convert PC back to note name
          const pcToName: Record<number, string> = {
            0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
            6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'
          };
          const rootName = pcToName[rootPc];
          
          // Build chord name
          let chordName = rootName;
          if (isLower) chordName += 'm'; // Lowercase = minor
          if (quality) chordName += quality;
          
          console.log('[PARSER] ✅ Converted roman numeral:', tok, '→', chordName, 'in key', currentKey);
          
          // Return as chord with original functional notation as raw
          return { kind:"chord", raw:tok, chord: chordName, duration: dur };
        } else {
          console.log('[PARSER] ❌ Failed to convert roman numeral - degree undefined');
        }
      }
      
      // Everything else is a literal chord
      return { kind:"chord", raw:tok, chord: tok, duration: dur };
    });
    
    setSongTitle(title);
    setSequence(items);
    setLoadedSongText(inputText); // Track what's actually loaded
    
    // Find first non-title, non-KEY item to set as initial index
    let initialIdx = 0;
    while (initialIdx < items.length && 
           (items[initialIdx].kind === "title" || 
            (items[initialIdx].kind === "modifier" && items[initialIdx].chord?.startsWith("KEY:")))) {
      initialIdx++;
    }
    
    // Check if first item is @KEY, apply it first
    if (items.length) {
      const firstItem = items[0];
      if (firstItem.kind === "modifier" && firstItem.chord?.startsWith("KEY:")) {
        // First item sets key, apply it
        applySeqItem(firstItem);
      } else {
        // ✅ v3.6.0 FIX: No @KEY directive found
        // DON'T reset baseKey - preserve manual key selector setting!
        // Old behavior: setBaseKey("C") - this broke key selector
        // New behavior: Keep current baseKey (set via selector or previous sequence)
        console.log('🔑 [v3.6.0] No @KEY directive, preserving baseKey:', baseKey);
        goHome();
      }
      
      // Set index to first playable item (but don't play it yet - v3.2.5)
      if (initialIdx < items.length) {
        console.log('Setting initial index to:', initialIdx, 'chord =', items[initialIdx]?.raw);
        setSeqIndex(initialIdx);
        setDisplayIndex(initialIdx);
        // REMOVED v3.2.5: Don't auto-play first chord on load
        // applySeqItem(items[initialIdx]);
        selectCurrentItem(initialIdx); // Pass explicit index
        console.log('=== PARSE AND LOAD END ===\n');
      } else {
        setSeqIndex(-1);
        setDisplayIndex(-1);
      }
    } else {
      setSeqIndex(-1);
      setDisplayIndex(-1);
    }
  };

  const stepPrev = ()=>{
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    if (!sequence.length) return;
    let i = seqIndex - 1;
    if (i < 0) i = 0; // Stay at beginning
    
    // Skip backwards over titles only (v3.2.7: Keep comments - they should pause)
    while (i > 0 && sequence[i]?.kind === "title") {
      i--;
    }
    
    setSeqIndex(i);
    setDisplayIndex(i);
    applySeqItem(sequence[i]);
    selectCurrentItem(i); // Pass explicit index
    // Don't play - just move backward
  };
  
  const stepNext = ()=>{
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    if (!sequence.length) return;
    
    console.log('=== STEP NEXT START ===');
    console.log('Before: seqIndex =', seqIndex, 'displayIndex =', displayIndex);
    
    // seqIndex points to what we should play now
    const currentIdx = seqIndex;
    console.log('currentIdx =', currentIdx, 'chord =', sequence[currentIdx]?.raw);
    
    // Make sure it's applied (in case we backed up with <)
    console.log('Calling applySeqItem for:', sequence[currentIdx]?.raw);
    const notesToPlay = applySeqItem(sequence[currentIdx]);
    
    console.log('📋 Captured notes to play:', notesToPlay);
    
    // Play it with the captured notes
    if (notesToPlay.length > 0 && audioEnabledRef.current) {
      console.log('🔊 Playing:', sequence[currentIdx].raw, 'notes:', notesToPlay.length);
      playChord(notesToPlay, 1.5);
    }
    
    // Update displayIndex to show what we just played
    console.log('Setting displayIndex to:', currentIdx);
    setDisplayIndex(currentIdx);
    selectCurrentItem(currentIdx);
    
    // Advance seqIndex to next (but DON'T apply it yet)
    let i = currentIdx + 1;
    if (i >= sequence.length) {
      console.log('At end of sequence');
      // ✅ v3.9.0: If loop enabled, go back to start
      if (loopEnabled) {
        console.log('🔁 Loop enabled - going back to start');
        i = 0;
        // Skip any initial titles
        while (i < sequence.length && sequence[i]?.kind === "title") {
          i++;
        }
        if (i >= sequence.length) {
          console.log('No playable items in sequence');
          return;
        }
      } else {
        return;
      }
    }
    
    // Skip titles only (v3.2.7: Keep comments - they should pause)
    while (i < sequence.length && sequence[i]?.kind === "title") {
      i++;
    }
    
    if (i >= sequence.length) {
      console.log('No more items after skipping titles');
      return;
    }
    
    console.log('Advancing seqIndex to:', i, 'chord =', sequence[i]?.raw);
    // Just advance index - next > will apply it
    setSeqIndex(i);
    console.log('=== STEP NEXT END ===\n');
  };
  
  // Playback controls
  const togglePlayPause = () => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    if (isPlaying) {
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    } else {
      // Start playing
      if (sequence.length === 0) return;
      
      // v3.5.0: Play first chord BEFORE starting playback timer
      let startIdx = seqIndex;
      if (startIdx < 0 || startIdx >= sequence.length) {
        startIdx = 0;
      }
      
      // Apply the first item to get notes
      applySeqItem(sequence[startIdx]);
      
      // Immediately play it using the ref (like stepNext does)
      const notesToPlay = [...latchedAbsNotesRef.current];
      const currentItem = sequence[startIdx];
      if (currentItem?.kind === "chord" && notesToPlay.length > 0) {
        // v3.5.0: Notes already transposed, don't transpose again
        const noteDuration = (60 / tempo) * 0.8;
        playChord(notesToPlay, noteDuration);
      }
      
      // NOW start the playback loop
      setIsPlaying(true);
    }
  };
  
  const stopPlayback = (silent = false) => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    // Reset to beginning
    // v3.5.0: Skip audio when silent=true (for reset button)
    if (sequence.length > 0 && !silent) {
      setSeqIndex(0);
      applySeqItem(sequence[0]);
      setTimeout(() => selectCurrentItem(), 0);
    }
  };
  
  const goToStart = () => {
    // v3.3.2: Exit step record when using transport controls
    if (stepRecord) {
      setStepRecord(false);
      stepRecordRef.current = false;
    }
    
    console.log('=== GO TO START ===');
    if (sequence.length > 0) {
      // Find first playable item (skip titles and KEY-only modifiers)
      let startIdx = 0;
      while (startIdx < sequence.length) {
        const item = sequence[startIdx];
        
        // Skip titles
        if (item.kind === "title") {
          startIdx++;
          continue;
        }
        
        // ✅ v3.17.85: Skip KEY-only, but NOT combined KEY:X:Chord
        if (item.kind === "modifier" && item.chord?.startsWith("KEY:")) {
          const parts = item.chord.split(":");
          // If only 2 parts (KEY:X), skip. If 3+ parts (KEY:X:Chord), play it!
          if (parts.length <= 2) {
            startIdx++;
            continue;
          }
        }
        
        // Found a playable item
        break;
      }
      if (startIdx < sequence.length) {
        console.log('Going to index:', startIdx, 'chord =', sequence[startIdx]?.raw);
        setSeqIndex(startIdx);
        setDisplayIndex(startIdx);
        
        // ✅ v3.17.88: Apply item for detection/wedge lighting, but DON'T play audio
        // User can press > to play the first chord
        const notesToPlay = applySeqItem(sequence[startIdx]);
        
        // ❌ Don't play on rewind - just position
        // User presses > to play
        console.log('🔇 Rewind complete - positioned at start (no audio)');
        
        selectCurrentItem(startIdx);
      }
    }
    console.log('=== GO TO START END ===\n');
  };
  
  // Skip to next comment
  const skipToNextComment = () => {
    if (!sequence.length) return;
    for (let i = seqIndex + 1; i < sequence.length; i++) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        applySeqItem(sequence[i]);
        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to end
    const lastIdx = sequence.length - 1;
    setSeqIndex(lastIdx);
    applySeqItem(sequence[lastIdx]);
    setTimeout(() => selectCurrentItem(), 0);
  };
  
  // Skip to previous comment
  const skipToPrevComment = () => {
    if (!sequence.length) return;
    for (let i = seqIndex - 1; i >= 0; i--) {
      if (sequence[i].kind === "comment") {
        setSeqIndex(i);
        applySeqItem(sequence[i]);
        setTimeout(() => selectCurrentItem(), 0);
        return;
      }
    }
    // No comment found, go to beginning
    setSeqIndex(0);
    applySeqItem(sequence[0]);
    setTimeout(() => selectCurrentItem(), 0);
  };
  
  // Reset function - resets key, space, transpose, and playback
  const resetAll = () => {
    // v3.4.3: Full reset including all refs
    setBaseKey("C");
    setTranspose(0);
    setTransposeBypass(false);
    // Reset ALL space states and refs
    setSubdomActive(false);
    subdomLatchedRef.current = false;
    subHasSpunRef.current = false;
    setRelMinorActive(false);
    setVisitorActive(false);
    // Clear recent maps
    recentRelMapRef.current.clear();
    lastPcsRelSizeRef.current = 0;
    stopPlayback(true); // v3.5.0: Silent stop
  };
  
  const handleInputKeyNav: React.KeyboardEventHandler<HTMLTextAreaElement> = (e)=>{
    // Only handle Return/Enter and Ctrl+I in textarea
    // Arrow keys work normally for cursor movement
    
    // Return/Enter loads sequence (no line breaks supported)
    if (e.key==="Enter"){ 
      e.preventDefault();
      
      // v3.3.2: Exit step record when loading sequence
      if (stepRecord) {
        setStepRecord(false);
        stepRecordRef.current = false;
      }
      
      parseAndLoadSequence();
      // Blur textarea to exit edit mode
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    }
    // Ctrl+I or Cmd+I inserts current chord
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i'){
      e.preventDefault();
      insertCurrentChord();
    }
  };

  const applySeqItem = (it: SeqItem): number[] => {
    // Returns MIDI notes to be played by caller
    // NEW v3.2.5: Handle combined comments (# comment: Chord)
    if (it.kind==="comment") {
      // If comment has a chord attached, play it
      if (it.chord) {
        console.log('🔄 Combined comment:', it.comment, '+ chord:', it.chord);
        return applySeqItem({ kind: "chord", raw: it.chord, chord: it.chord });
      }
      return [];
    }
    
    if (it.kind==="title") return []; // Skip titles
    if (it.kind==="modifier" && it.chord){
      // ✅ v3.17.88: Split modifier properly - get ALL parts after first colon
      // "KEY:Eb:Ebmaj7" → m="KEY", arg="Eb:Ebmaj7"
      const [m, ...restParts] = it.chord.split(":");
      const arg = restParts.join(":");
      
      // NEW v3.2.4: Check if arg is a chord name (combined space+chord)
      const isSpaceModifier = m === "HOME" || m === "SUB" || m === "REL" || m === "PAR";
      const hasChordArg = arg && arg.trim() && isSpaceModifier;
      
      if (m==="HOME"){ 
        goHome();
        // If chord specified, play it after switching
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: HOME + chord:', chordName);
          // Recursively call applySeqItem with chord item
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="SUB"){ 
        if(!subdomActiveRef.current) toggleSubdom();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: SUB + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="REL"){ 
        if(!relMinorActiveRef.current) toggleRelMinor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: REL + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="PAR"){ 
        if(!visitorActiveRef.current) toggleVisitor();
        if (hasChordArg) {
          const chordName = arg.trim();
          console.log('🔄 Combined modifier: PAR + chord:', chordName);
          return applySeqItem({ kind: "chord", raw: chordName, chord: chordName });
        }
      }
      else if (m==="KEY"){ 
        // Change key center
        // NEW v3.2.5: Check if format is KEY:C:Am (key + chord)
        const parts = arg?.split(":") || [];
        const newKey = parts[0]?.trim() as KeyName;
        const chordAfterKey = parts.slice(1).join(":").trim();
        
        if (newKey && FLAT_NAMES.includes(newKey)) {
          setBaseKey(newKey);
        }
        
        if (chordAfterKey) {
          console.log('🔄 Combined KEY change:', newKey, '+ chord:', chordAfterKey);
          // ✅ v3.17.87: Return notes to be played by caller
          return applySeqItem({ kind: "chord", raw: chordAfterKey, chord: chordAfterKey });
        }
      }
      return [];
    }
    if (it.kind==="chord" && it.chord){
      // 🎯 CRITICAL: Simulate MIDI input to use IDENTICAL detection logic!
      // This makes sequencer behavior match keyboard playing exactly.
      
      const chordName = it.chord.trim();
      console.log('🎹 Simulating MIDI for sequencer:', chordName);
      
      // Parse chord to get pitch classes
      const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
      if (!match) {
        console.warn('⚠️ Could not parse chord:', chordName);
        return [];
      }
      
      let root = match[1];
      const quality = match[2] || "";
      
      // ✅ v3.17.85 FIX: Convert sharps to flats for NAME_TO_PC lookup
      const sharpToFlat: Record<string, string> = {
        'C#': 'Db',
        'D#': 'Eb', 
        'F#': 'Gb',
        'G#': 'Ab',
        'A#': 'Bb'
      };
      if (sharpToFlat[root]) {
        console.log(`🔄 Converting ${root} → ${sharpToFlat[root]}`);
        root = sharpToFlat[root];
      }
      
      console.log('🔍 Parsed:', { chordName, root, quality });
      
      // Get root pitch class
      const rootPc = NAME_TO_PC[root as KeyName];
      if (rootPc === undefined) {
        console.warn('⚠️ Unknown root:', root, 'Available keys:', Object.keys(NAME_TO_PC));
        return [];
      }
      
      console.log('✅ Root PC:', rootPc);
      
      // Determine intervals based on quality
      let intervals: number[] = [];
      if (quality === "m" || quality === "min") {
        intervals = [0, 3, 7]; // Minor triad
      } else if (quality === "7") {
        intervals = [0, 4, 7, 10]; // Dominant 7th
      } else if (quality === "m7") {
        intervals = [0, 3, 7, 10]; // Minor 7th
      } else if (quality === "maj7" || quality === "Maj7" || quality === "M7") {
        intervals = [0, 4, 7, 11]; // Major 7th
      } else if (quality === "m7b5" || quality === "m7♭5") {
        intervals = [0, 3, 6, 10]; // Half-diminished
      } else if (quality === "dim" || quality === "°") {
        intervals = [0, 3, 6]; // Diminished triad
      } else if (quality === "dim7" || quality === "°7") {
        intervals = [0, 3, 6, 9]; // Fully diminished 7th
      } else if (quality === "aug" || quality === "+") {
        intervals = [0, 4, 8]; // Augmented triad
      } else {
        intervals = [0, 4, 7]; // Major triad (default)
      }
      
      // Create MIDI notes (using C4=60 as base, keep in comfortable range)
      const baseMidi = 60;
      let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
      
      // Transpose down an octave if root is too high (keeps G-B in range)
      if (rootPc > 4) {
        midiNotes = midiNotes.map(n => n - 12);
      }
      
      // v3.5.0: Apply transpose to sequencer chords (like MIDI input)
      midiNotes = midiNotes.map(n => n + effectiveTranspose);
      
      console.log('🎹 Simulated MIDI notes:', midiNotes, 'for chord:', chordName, 'transpose:', effectiveTranspose);
      
      // 🔑 KEY INSIGHT: Temporarily set MIDI state, call detect(), then restore
      const savedRightHeld = new Set(rightHeld.current);
      const savedEvent = lastMidiEventRef.current;
      
      // ✅ v3.6.0 CRITICAL FIX: Force baseKeyRef sync before detection
      // ✅ v3.8.0 CRITICAL FIX: Sync to effectiveBaseKey (respects transpose!)
      // Bug: Was syncing to baseKey, so transpose didn't affect detection
      // Example: In Eb with transpose to C, Ab→F transposed but detected in Eb patterns
      // Ensures sequencer chords are detected in correct key context
      baseKeyRef.current = effectiveBaseKey;
      console.log('🔑 [SEQ-FIX v3.8.0] baseKeyRef synced to:', effectiveBaseKey, '(original baseKey:', baseKey, ')');
      
      // Simulate MIDI note-on
      rightHeld.current = new Set(midiNotes);
      lastMidiEventRef.current = "on";
      
      // Call the SAME detect() function that MIDI uses!
      detect();
      
      // Restore previous state (so we don't interfere with actual MIDI)
      rightHeld.current = savedRightHeld;
      lastMidiEventRef.current = savedEvent;
      
      console.log('✅ Sequencer detection complete');
      
      // ✅ v3.17.87: Return notes instead of playing here
      // Caller (stepNext/goToStart) will play them
      return midiNotes;
    }
    
    return []; // No notes to play
  };

  // Highlight current chord in editor
  const highlightCurrentChordInEditor = () => {
    if (!textareaRef.current || seqIndex < 0 || seqIndex >= sequence.length) return;
    
    const currentItem = sequence[seqIndex];
    if (!currentItem) return;
    
    // Find the position of this item in the text
    const text = inputText;
    const tokens = text.split(',').map(t => t.trim());
    
    // Find which token index corresponds to seqIndex
    let tokenCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (tokenCount === seqIndex) {
        // Found it! Now find the position in the original text
        let charPos = 0;
        for (let j = 0; j < i; j++) {
          charPos = text.indexOf(tokens[j], charPos);
          charPos += tokens[j].length + 1; // +1 for comma
        }
        charPos = text.indexOf(tokens[i], charPos);
        
        const tokenLength = tokens[i].length;
        textareaRef.current.setSelectionRange(charPos, charPos + tokenLength);
        textareaRef.current.focus();
        break;
      }
      tokenCount++;
    }
  };

  // Check for song in URL on mount
  useEffect(() => {
    const songFromURL = getSongFromURL();
    if (songFromURL) {
      setInputText(songFromURL);
      // Auto-load the song
      setTimeout(() => parseAndLoadSequence(), 100);
    }
  }, []);
  
  // Song management handlers
  const handleExportSong = () => {
    const metadata = parseSongMetadata(inputText);
    const filename = metadata.title 
      ? `${metadata.title.replace(/\s+/g, '-').toLowerCase()}.txt`
      : 'harmony-wheel-song.txt';
    exportSongToFile(inputText, filename);
  };
  
  const handleGenerateShareURL = () => {
    const url = generateShareableURL(inputText);
    setShareURL(url);
    copyToClipboard(url);
  };
  
  const handleImportSong = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSongFromFile(file).then(content => {
        setInputText(content);
        parseAndLoadSequence();
      }).catch(err => {
        console.error('Failed to import song:', err);
      });
    }
  };
  
  const handleLoadDemoSong = (songContent: string) => {
    setInputText(songContent);
    setShowSongMenu(false);
    setTimeout(() => parseAndLoadSequence(), 100);
  };

  // ✅ v3.15.5: Click-outside detection for dropdowns
  useEffect(() => {
    performanceModeRef.current = performanceMode;
  }, [performanceMode]);

  // ✅ v3.17.5: Auto-enable bonus wedges when performance mode turns on
  useEffect(() => {
    if (performanceMode && !showBonusWedges) {
      setShowBonusWedges(true);
    }
  }, [performanceMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close transpose dropdown if click outside
      if (showTransposeDropdown && 
          transposeDropdownRef.current && 
          !transposeDropdownRef.current.contains(event.target as Node)) {
        setShowTransposeDropdown(false);
      }
      
      // Close key dropdown if click outside
      if (showKeyDropdown && 
          keyDropdownRef.current && 
          !keyDropdownRef.current.contains(event.target as Node)) {
        setShowKeyDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTransposeDropdown, showKeyDropdown]);

  // ✅ v3.15.5: Enter key to close dropdowns
  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showTransposeDropdown) {
          setShowTransposeDropdown(false);
        }
        if (showKeyDropdown) {
          setShowKeyDropdown(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEnterKey);
    return () => document.removeEventListener('keydown', handleEnterKey);
  }, [showTransposeDropdown, showKeyDropdown]);

  // Global keyboard handler for arrow keys and Enter (when not in textarea)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ✅ v3.17.10: Track shift key for visual indicator
      if (e.key === 'Shift') {
        setShiftHeld(true);
      }
      
      // ✅ v3.17.23: Handle . and , for sequencer BEFORE checking if in textarea
      // ✅ v3.17.85: Changed to Shift+comma/period (< >) to avoid editor conflict
      if (e.shiftKey && (e.key === '<' || e.key === '>')) {
        e.preventDefault();
        if (e.key === '<') { // Shift+,
          setPulsingButton('prev');
          setTimeout(() => setPulsingButton(null), 300);
          stepPrev();
        } else { // Shift+.
          setPulsingButton('next');
          setTimeout(() => setPulsingButton(null), 300);
          stepNext();
        }
        return;
      }
      
      // Only handle if NOT in textarea or input field
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;
      
      // ✅ v3.17.8: Performance Mode - Clockwise from I (matches wheel)
      if (performanceModeRef.current) {
        // Map both normal and shifted keys
        const keyMap: Record<string, Fn> = {
          '1': 'I', '!': 'I',
          '2': 'ii', '@': 'ii',
          '3': 'V/V', '#': 'V/V',
          '4': 'iii', '$': 'iii',
          '5': 'V/vi', '%': 'V/vi',
          '6': 'iv', '^': 'iv',
          '7': 'IV', '&': 'IV',
          '8': 'V', '*': 'V',
          '9': 'V/ii', '(': 'V/ii',
          '0': 'vi', ')': 'vi',
          '-': 'Bm7♭5', '_': 'Bm7♭5',
          '=': '♭VII', '+': '♭VII'
        };
        
        const fn = keyMap[e.key];
        if (fn) {
          e.preventDefault();
          e.stopPropagation();
          // Detect 7th by checking if shifted key was pressed
          const shiftedKeys = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
          const with7th = shiftedKeys.includes(e.key);
          console.log('🎹 Performance Mode:', { 
            rawKey: e.key, 
            code: e.code,
            shiftKey: e.shiftKey,
            fn, 
            with7th, 
            isShiftedChar: shiftedKeys.includes(e.key),
            detectedAs7th: with7th
          });
          
          // Flash the key
          if (performanceFlashTimeoutRef.current) {
            clearTimeout(performanceFlashTimeoutRef.current);
          }
          // Find which key number this is
          const keyNumber = Object.keys(keyMap).find(k => keyMap[k] === fn && !shiftedKeys.includes(k));
          if (keyNumber) {
            setPerformanceFlashKey(keyNumber);
            performanceFlashTimeoutRef.current = setTimeout(() => {
              setPerformanceFlashKey('');
            }, 500);
          }
          
          previewFn(fn, with7th);
          
          // Clear piano highlights after 500ms
          setTimeout(() => {
            setLatchedAbsNotes([]);
          }, 500);
          
          return; // Stop processing - don't run other shortcuts
        }
      }
      
      // Skill level shortcuts: 1-5 (only when NOT in performance mode)
      if (!performanceModeRef.current) {
        if (e.key === '1') {
          e.preventDefault();
          setSkillLevel('ROOKIE');
          return;
        } else if (e.key === '2') {
          e.preventDefault();
          setSkillLevel('NOVICE');
          return;
        } else if (e.key === '3') {
          e.preventDefault();
          setSkillLevel('SOPHOMORE');
          return;
        } else if (e.key === '4') {
          e.preventDefault();
          setSkillLevel('ADVANCED');
          return;
        } else if (e.key === '5') {
          e.preventDefault();
          setSkillLevel('EXPERT');
          return;
        }
      }
      
      // Navigation shortcuts
      // ✅ v3.17.85: Cmd+Shift+< for goToStart (Shift+< is used for stepPrev)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '<') {
        e.preventDefault();
        goToStart();
        return;
      }
      
      // Playback controls
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopPlayback();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        skipToNextComment();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        skipToPrevComment();
      } else if (e.key === 'ArrowRight') {
        // ✅ v3.17.85: Plain arrow for step (only when not in editor)
        e.preventDefault();
        stepNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      // Transpose controls
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const hasKeyDirective = loadedSongText.includes('@KEY');
        if (!hasKeyDirective) {
          setShowTransposeDropdown(prev => !prev);
        }
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        setTranspose(prev => Math.min(12, prev + 1));
      } else if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        setTranspose(prev => Math.max(-12, prev - 1));
      // Tempo controls
      } else if (e.key === '[') {
        e.preventDefault();
        setTempo(prev => Math.max(20, prev - 10));
      } else if (e.key === ']') {
        e.preventDefault();
        setTempo(prev => Math.min(240, prev + 10));
      // Reset (extend H key)
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        resetAll();
      // Legacy arrow navigation (still work)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepNext();
      } else if (e.key === 'Enter' && inputText.trim()) {
        e.preventDefault();
        parseAndLoadSequence();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertCurrentChord();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        makeThisMyKey();
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        goHomeC(); // Return to HOME C (reset to C)
      } else if (e.key === 'h' || e.key === 'H') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts
        e.preventDefault();
        goHome(); // HOME space
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey || e.metaKey) return; // ✅ v3.13.7: Allow Cmd+R/Ctrl+R for browser refresh
        e.preventDefault();
        toggleRelMinor(); // REL space
      } else if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts (save)
        e.preventDefault();
        toggleSubdom(); // SUB space
      } else if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts (print)
        e.preventDefault();
        toggleVisitor(); // PAR space
      } else if (e.key === 'x' || e.key === 'X') {
        // ✅ v3.15.0: Clear MIDI latch
        e.preventDefault();
        if (midiLatchTimeoutRef.current !== null) {
          clearTimeout(midiLatchTimeoutRef.current);
          midiLatchTimeoutRef.current = null;
        }
        latchedChordRef.current = null;
        activeFnRef.current = ""; // ✅ Clear ref immediately
        setActiveFn("");
        setCenterLabel("");
        setLatchedAbsNotes([]); // ✅ Clear keyboard highlights
        lastInputWasPreviewRef.current = false; // ✅ Clear preview flag
        console.log('❌ MIDI latch manually cleared with X key');
      }
    };
    
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftHeld(false);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [inputText, sequence, seqIndex, centerLabel]); // Re-attach when these change

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }
    
    // Play current chord immediately (if it's a chord)
    const currentItem = sequence[seqIndex];
    if (currentItem?.kind === "chord" && currentItem.chord && latchedAbsNotes.length > 0) {
      // ✅ v3.17.93: Use duration from SeqItem (in bars)
      const barsPerBeat = 4; // 4/4 time signature
      const itemDuration = currentItem.duration || 1.0; // Default to 1 bar
      const noteDuration = (60 / tempo) * barsPerBeat * itemDuration * 0.8; // 80% of duration
      playChord(latchedAbsNotes, noteDuration);
    }
    
    // ✅ v3.17.93: Calculate interval using duration from current item
    const itemDuration = currentItem?.duration || 1.0; // Default to 1 bar if not specified
    const barsPerBeat = 4; // 4/4 time signature  
    const interval = (60 / tempo) * barsPerBeat * itemDuration * 1000; // milliseconds
    
    // Wait, then advance to next
    playbackTimerRef.current = window.setTimeout(() => {
      // Advance to next item
      let nextIndex = seqIndex + 1;
      
      // Skip over comments and titles
      while (nextIndex < sequence.length && 
             (sequence[nextIndex]?.kind === "comment" || sequence[nextIndex]?.kind === "title")) {
        nextIndex++;
      }
      
      if (nextIndex < sequence.length) {
        setSeqIndex(nextIndex);
        applySeqItem(sequence[nextIndex]);
        setTimeout(() => selectCurrentItem(), 0);
      } else {
        // End of sequence
        if (loopEnabled) {
          // Loop back to start (skip title/key)
          let startIdx = 0;
          while (startIdx < sequence.length && 
                 (sequence[startIdx].kind === "title" || 
                  (sequence[startIdx].kind === "modifier" && sequence[startIdx].chord?.startsWith("KEY:")))) {
            startIdx++;
          }
          setSeqIndex(startIdx);
          applySeqItem(sequence[startIdx]);
          setTimeout(() => selectCurrentItem(), 0);
        } else {
          setIsPlaying(false);
        }
      }
    }, interval);
    
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, seqIndex, tempo, sequence, transpose, latchedAbsNotes, loopEnabled]);

  /* ---------- layout & bonus geometry ---------- */
  const cx=260, cy=260, r=220;
  const layout = useMemo(()=> computeLayout(cx,cy,r,rotationOffset), [rotationOffset]);

  const bonusArcGeom = useMemo(()=>{
    const segI = layout.find(s=>s.fn==="I");
    const segB7 = layout.find(s=>s.fn==="♭VII");
    if(!segI || !segB7) return null;
    const g = rotationOffset, norm=(d:number)=>(d%360+360)%360;
    const startGap = norm(segB7.endTop);
    const endGap = norm(segI.startTop);
    const gapCW = norm(endGap - startGap);
    const centerTop = (BONUS_OVERLAY && BONUS_CENTER_ANCHOR_DEG != null) ? norm(BONUS_CENTER_ANCHOR_DEG) : norm(startGap + gapCW/2);
    const span = 15, half = span/2;
    const a0Top = norm(centerTop - half + g);
    const a1Top = norm(centerTop + half + g);
    const midTop = norm(centerTop + g);
    const outerAbs = Math.max(r*BONUS_OUTER_R, r*BONUS_OUTER_OVER);
    const innerAbs = r*BONUS_INNER_R;
    const rMid=(outerAbs+innerAbs)/2, rad=((midTop-90)*Math.PI)/180;
    const labelPos={x:cx + rMid*Math.cos(rad), y: cy + rMid*Math.sin(rad)};
    return { a0Top, a1Top, labelPos };
  },[layout, rotationOffset]);

  useEffect(()=>{ if(bonusActive && bonusArcGeom){
    lastBonusGeomRef.current = { a0Top: bonusArcGeom.a0Top, a1Top: bonusArcGeom.a1Top };
  }}, [bonusActive, bonusArcGeom]);

  useEffect(()=>{ if(!bonusActive && lastBonusGeomRef.current){
    let raf:number; const start=performance.now();
    setBonusTrailOn(true);
    const loop=()=>{ const dt=performance.now()-start;
      if(dt<RING_FADE_MS){ setBonusTrailTick(dt); raf=requestAnimationFrame(loop); }
      else { setBonusTrailOn(false); setBonusTrailTick(0); }
    };
    raf=requestAnimationFrame(loop);
    return ()=>{ if(raf) cancelAnimationFrame(raf); };
  }}, [bonusActive]);

  /* ---------- taps ---------- */
  const TAP_MS = 1500, TRIPLE_COUNT = 3;
  const TAP_LOG_REF = { current: {} as Record<string, number[]> } as const;
  const TAP_STATE_REF = { current: { REL_Am:false, REL_C:false, VIS_G:false } as Record<string, boolean> } as const;
  const pushTap = (name:string)=>{ const now=performance.now(); const arr=(TAP_LOG_REF.current[name] ||= []); arr.push(now); while(arr.length && now-arr[0]>TAP_MS) arr.shift(); return arr.length; };
  const setTapEdge = (name:string, present:boolean)=>{ const prev=!!TAP_STATE_REF.current[name]; if(present && !prev){ const n=pushTap(name); TAP_STATE_REF.current[name]=true; return n; } if(!present && prev){ TAP_STATE_REF.current[name]=false; } return 0; };

  /* ---------- Trails + center helpers ---------- */
  const makeTrail=()=>{ if(activeFnRef.current){ setTrailFn(activeFnRef.current as Fn); } };
  const stopDimFade = ()=>{
    if (dimFadeRafRef.current != null) cancelAnimationFrame(dimFadeRafRef.current);
    dimFadeRafRef.current = null; setDimFadeOn(false); setDimFadeTick(0);
  };
  const startDimFade = ()=>{
    stopDimFade(); setDimFadeOn(true);
    const start = performance.now();
    const tick = ()=>{
      const dt = performance.now() - start;
      if (dt < DIM_FADE_MS){ setDimFadeTick(dt); dimFadeRafRef.current = requestAnimationFrame(tick); }
      else { setDimFadeTick(DIM_FADE_MS); stopDimFade(); }
    };
    dimFadeRafRef.current = requestAnimationFrame(tick);
  };

  const setActiveWithTrail=(fn:Fn,label:string)=>{ 
    const fullStack = new Error().stack?.split('\n').slice(1, 8).join('\n');
    console.log('🎯 setActiveWithTrail called:', { fn, label, stepRecord: stepRecordRef.current });
    console.log('📍 Stack trace:', fullStack);
    
    // ✅ v3.15.0: Save for MIDI latch and cancel any pending clear timer
    latchedChordRef.current = { fn, label };
    console.log('💾 Saved latched chord:', { fn, label });
    if (midiLatchTimeoutRef.current !== null) {
      console.log('🚫 Cancelling existing timeout (new chord detected):', midiLatchTimeoutRef.current);
      clearTimeout(midiLatchTimeoutRef.current);
      midiLatchTimeoutRef.current = null;
    }
    
    if(activeFnRef.current && activeFnRef.current!==fn){ makeTrail(); } 
    setActiveFn(fn); 
    setCenterLabel(SHOW_CENTER_LABEL?label:""); 
    lastPlayedChordRef.current = label; // Save for Make My Key
    console.log('📝 lastPlayedChordRef set to:', label);
    
    // Auto-record: append chord to inputText
    if (stepRecordRef.current && label) {
      setInputText(prev => prev ? `${prev}, ${label}` : label);
    }
    
    setBonusActive(false); setBonusLabel(""); 
    stopDimFade();
  };
  
  // ✅ v3.10.0: Helper to check if bonus chord should trigger based on skill level
  const shouldTriggerBonus = (fn: Fn): boolean => {
    // Bonus functions: V/V, V/vi, V/ii (secondary dominants)
    const isBonusFunction = fn === "V/V" || fn === "V/vi" || fn === "V/ii";
    if (!isBonusFunction) return true; // Not a bonus chord, always allow
    
    // In EXPERT: always allow (they can trigger dynamically)
    if (skillLevel === "EXPERT") return true;
    
    // In ADVANCED: only if showBonusWedges is ON
    if (skillLevel === "ADVANCED") return showBonusWedgesRef.current;
    
    // Below ADVANCED: never allow bonus chords
    return false;
  };
  
  // v3.10.1: Helper for bonus overlays (A7, Bm7♭5, etc.) that don't use wedges
  const shouldShowBonusOverlay = (): boolean => {
    const result = (() => {
      // In EXPERT: always allow
      if (skillLevel === "EXPERT") return true;
      
      // In ADVANCED: only if showBonusWedges is ON
      if (skillLevel === "ADVANCED") return showBonusWedgesRef.current;
      
      // Below ADVANCED: never show
      return false;
    })();
    
    console.log('🎭 shouldShowBonusOverlay:', {
      skillLevel,
      showBonusWedges: showBonusWedgesRef.current,
      result
    });
    
    return result;
  };
  
  const centerOnly=(t:string)=>{ 
    console.log('🎯 centerOnly called:', { t, stepRecord: stepRecordRef.current });
    
    // ✅ v3.15.0: Save for MIDI latch and cancel any pending clear timer
    const cleaned = t.replace(/^[#@]\s*/, '').trim();
    latchedChordRef.current = { fn: "", label: cleaned };
    if (midiLatchTimeoutRef.current !== null) {
      console.log('🚫 Cancelling existing timeout (centerOnly called):', midiLatchTimeoutRef.current);
      clearTimeout(midiLatchTimeoutRef.current);
      midiLatchTimeoutRef.current = null;
    }
    
    makeTrail(); 
    if (activeFnRef.current) startDimFade();
    setCenterLabel(SHOW_CENTER_LABEL ? cleaned : ""); 
    lastPlayedChordRef.current = cleaned; // Save for Make My Key
    console.log('📝 lastPlayedChordRef set to:', cleaned);
    
    // Auto-record: append chord to inputText
    if (stepRecordRef.current && cleaned && !cleaned.startsWith('#') && !cleaned.startsWith('@')) {
      setInputText(prev => prev ? `${prev}, ${cleaned}` : cleaned);
    }
    
    setBonusActive(false); setBonusLabel(""); 
  };
  
  // Helper to preview a chord by name (for playlist navigation)
  const previewChordByName = (chordName: string) => {
    lastInputWasPreviewRef.current = true;
    const renderKey: KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    console.log('🔍 previewChordByName called:', { 
      chordName, 
      renderKey, 
      baseKey: baseKeyRef.current,
      subKey,
      parKey,
      visitor: visitorActiveRef.current,
      subdom: subdomActiveRef.current,
      rel: relMinorActiveRef.current
    });
    
    // Map chord name to function (I, ii, iii, IV, V, vi, etc.)
    // This activates the correct wedge!
    const chordToFunction = (chord: string, key: KeyName): Fn | null => {
      const baseKey = key;
      const chordRoot = chord.match(/^([A-G][#b]?)/)?.[1];
      if (!chordRoot) return null;
      
      // Map chord roots to scale degrees in C major
      const degreeMap: Record<string, number> = {
        'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11,
        'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10
      };
      
      const keyDegree = degreeMap[baseKey] || 0;
      const chordDegree = degreeMap[chordRoot];
      if (chordDegree === undefined) return null;
      
      // Calculate relative degree (0-11)
      const relativeDegree = (chordDegree - keyDegree + 12) % 12;
      
      // Map to function based on degree and quality
      const isMinor = chord.includes('m') && !chord.includes('maj') && !chord.includes('M');
      const is7th = chord.includes('7');
      const isMaj7 = chord.includes('Maj') || chord.includes('maj') || chord.includes('M7');
      
      // Diatonic functions
      // Don't match I7 (dominant 7 on tonic - non-diatonic blues/jazz)
      if (relativeDegree === 0) {
        if (is7th && !isMaj7) return null; // I7 is non-diatonic, use fallback
        return "I";
      }
      if (relativeDegree === 2) return isMinor ? "ii" : null;    // ii (Dm in C)
      if (relativeDegree === 4) return isMinor ? "iii" : null;   // iii (Em in C)
      if (relativeDegree === 5) return isMinor ? "iv" : "IV";    // IV (F in C) or iv (Fm in C)
      // V - plain V triad OR V7
      if (relativeDegree === 7) {
        if (is7th) return "V7"; // G7, GMaj7 in C
        return "V"; // Plain G triad in C - should light V wedge!
      }
      if (relativeDegree === 9) return isMinor ? "vi" : null;    // vi (Am in C)
      if (relativeDegree === 10) return "♭VII";   // ♭VII (Bb in C)
      
      return null;
    };
    
    const fn = chordToFunction(chordName, renderKey);
    console.log('🔍 chordToFunction returned:', fn, 'for chord:', chordName);
    
    if (fn) {
      // Use previewFn logic to activate wedge
      // Only add 7th if explicitly in chord name OR if it's V7/V/V/etc
      const with7th = PREVIEW_USE_SEVENTHS || fn.includes("7") || chordName.includes("7") || chordName.includes("9") || chordName.includes("11") || chordName.includes("13");
      const pcs = preview.chordPcsForFn(fn, renderKey, with7th);
      
      // Guard: preview module might not know about plain "V" yet
      if (!pcs || pcs.length === 0) {
        console.warn('⚠️ preview.chordPcsForFn returned empty for:', fn, 'falling back to CHORD_DEFINITIONS');
        // Use CHORD_DEFINITIONS instead
        const chordDef = CHORD_DEFINITIONS[fn as Fn];
        if (chordDef) {
          const keyPc = NAME_TO_PC[renderKey];
          const absPcs = chordDef.triad.map(pc => (pc + keyPc) % 12);
          const rootPc = absPcs[0];
          const absRootPos = preview.absChordRootPositionFromPcs(absPcs, rootPc);
          const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
          latchedAbsNotesRef.current = fitted;
          setLatchedAbsNotes(fitted);
          setActiveWithTrail(fn, realizeFunction(fn, renderKey));
        }
        return;
      }
      
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      latchedAbsNotesRef.current = fitted; // Update ref synchronously
      setLatchedAbsNotes(fitted);
      setActiveWithTrail(fn, realizeFunction(fn, renderKey));
    } else {
      // Fallback: parse chord manually for keyboard display only
      console.log('🔧 Entering fallback parser for:', chordName);
      try {
        const match = chordName.match(/^([A-G][#b]?)(.*)?$/);
        if (match) {
          const root = match[1];
          let quality = match[2] || '';
          console.log('🔧 Parsed root:', root, 'quality:', quality);
          
          // Normalize quality string for better parsing
          // Handle alternate notations: A- → Am, AM7 → AMaj7, Bm7-5 → Bm7b5
          quality = quality
            .replace(/^-(?!5)/, 'm')      // A- → Am (but not -5)
            .replace(/^M7/, 'Maj7')       // AM7 → AMaj7, FM7 → FMaj7
            .replace(/m-5/, 'm7b5')       // Bm-5 → Bm7b5
            .replace(/-5/, '7b5')         // A-5 → A7b5
            .replace(/ø/, 'm7b5');        // Aø → Am7b5
          
          const rootPc = NAME_TO_PC[root as KeyName];
          let intervals: number[] = [0, 4, 7]; // Default: major triad
          console.log('🔧 Root PC:', rootPc, 'intervals:', intervals);
          
          // Check for minor (m or -)
          const isMinor = quality.includes('m') && !quality.includes('maj') && !quality.includes('Maj') && !quality.includes('M');
          if (isMinor) {
            intervals = [0, 3, 7]; // Minor triad
          }
          
          // Check for 7th, 9th, 11th, 13th (all get dominant 7th for now)
          if (quality.match(/\d+/)) {
            const hasExtension = quality.match(/7|9|11|13/);
            if (hasExtension) {
              if (quality.includes('maj') || quality.includes('Maj') || quality.includes('M7')) {
                intervals.push(11); // Major 7th
              } else if (isMinor) {
                intervals.push(10); // Minor 7th
              } else {
                intervals.push(10); // Dominant 7th
              }
            }
          }
          
          // Check for b5 or #5
          if (quality.includes('b5')) {
            intervals[2] = 6; // Flatten the 5th
          } else if (quality.includes('#5') || quality.includes('+')) {
            intervals[2] = 8; // Sharpen the 5th
          }
          
          const baseMidi = 60;
          let midiNotes = intervals.map(interval => baseMidi + rootPc + interval);
          const fitted = preview.fitNotesToWindowPreserveInversion(midiNotes, KBD_LOW, KBD_HIGH);
          console.log('🔧 Setting latchedAbsNotes to:', fitted);
          latchedAbsNotesRef.current = fitted; // Update ref synchronously  
          setLatchedAbsNotes(fitted);
          console.log('🔧 latchedAbsNotes updated successfully');
        }
      } catch (e) {
        console.warn('Could not parse chord:', chordName, e);
      }
      
      console.log('🔧 Calling centerOnly for:', chordName);
      centerOnly(chordName);
    }
  };

  const hardClearGhostIfIdle = ()=>{
    if(rightHeld.current.size===0 && rightSus.current.size===0){
      if(!lastInputWasPreviewRef.current) setLatchedAbsNotes([]);
    }
  };
  const clear=()=>{ 
    makeTrail(); hardClearGhostIfIdle(); 
    if (activeFnRef.current) startDimFade();
    setBonusActive(false); setBonusLabel(""); setCenterLabel(""); 
    setActiveFn("");
  };

  /* ---------- SUB spin + jiggle ---------- */
  const subSpinTimerRef = useRef<number | null>(null);
  const clearSubSpinTimer = ()=>{ if(subSpinTimerRef.current!=null){ window.clearTimeout(subSpinTimerRef.current); subSpinTimerRef.current=null; } };
  const SUB_SPIN_DEG = Math.abs(IV_ROTATE_DEG || 168);

  const subJiggleExit = ()=>{
    setTimeout(()=> setTargetRotation(JIGGLE_DEG), 10);
    setTimeout(()=> setTargetRotation(-JIGGLE_DEG), 10 + JIGGLE_MS);
    setTimeout(()=> setTargetRotation(0), 10 + 2*JIGGLE_MS);
  };

  const subSpinEnter = ()=>{
    if (spaceLocked) return; // ✅ v3.11.0: Locked
    if (subHasSpunRef.current) return;
    clearSubSpinTimer();
    setTargetRotation(IV_ROTATE_DEG ?? -168);
    subSpinTimerRef.current = window.setTimeout(()=>{
      setRotationOffset(0); setTargetRotation(0);
      subSpinTimerRef.current = null; subHasSpunRef.current = true;
    }, ROTATION_ANIM_MS + 20) as unknown as number;
  };
  const subSpinExit = ()=>{
    if (spaceLocked) return; // ✅ v3.11.0: Locked
    clearSubSpinTimer();
    setTargetRotation(SUB_SPIN_DEG);
    subSpinTimerRef.current = window.setTimeout(()=>{
      setRotationOffset(0); setTargetRotation(0);
      subSpinTimerRef.current = null; subHasSpunRef.current = false;
      subJiggleExit();
    }, ROTATION_ANIM_MS + 20) as unknown as number;
  };
  const subLatch = (fn: Fn)=>{
    subdomLatchedRef.current = true;
    subExitCandidateSinceRef.current = null;
    subLastSeenFnRef.current = fn;
    homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
  };

  /* ---------- window helpers (SUB only) ---------- */
  const updateRecentRel = (pcsRel:Set<number>)=>{
    const now = performance.now();
    const delta = Math.abs((pcsRel.size || 0) - (lastPcsRelSizeRef.current || 0));
    if (delta >= 2) recentRelMapRef.current.clear();
    lastPcsRelSizeRef.current = pcsRel.size;

    for(const [pc,ts] of recentRelMapRef.current){
      if(now - ts > RECENT_PC_WINDOW_MS) recentRelMapRef.current.delete(pc);
    }
    pcsRel.forEach(pc => recentRelMapRef.current.set(pc, now));
  };
  const windowedRelSet = ():Set<number>=>{
    const now = performance.now();
    const out = new Set<number>();
    for(const [pc,ts] of recentRelMapRef.current){
      if(now - ts <= RECENT_PC_WINDOW_MS) out.add(pc);
    }
    return out;
  };
  const isSubsetIn = (need:number[], pool:Set<number>) => subsetOf(T(need), pool);
  const exactSetIn = (need:number[], pool:Set<number>) => {
    const needSet = T(need); if(!subsetOf(needSet, pool)) return false;
    for(const p of pool) if(!needSet.has(p)) return false;
    return true;
  };

  /* ---------- detection ---------- */
  const SUB_EXIT_DEBOUNCE_MS = 420;

  // protect C7 / Fmaj7 / Gm7 while in SUB from release-order bounces
  const PROTECT_SUPERSETS: Array<Set<number>> = [
    T([5,9,0,4]),    // Fmaj7
    T([0,4,7,10]),   // C7
    T([7,10,2,5]),   // Gm7
  ];
  const within = (pool:Set<number>, sup:Set<number>)=>{
    for(const p of pool) if(!sup.has(p)) return false;
    return true;
  };
  const protectedSubset = (current:Set<number>)=>{
    if(current.size < 3) return false;
    for(const sup of PROTECT_SUPERSETS) if(within(current, sup)) return true;
    return false;
  };

  const findDim7Root = (S:Set<number>): number | null => {
    for (let pc=0; pc<12; pc++){
      if (S.has(pc) && S.has((pc+3)%12) && S.has((pc+6)%12) && S.has((pc+9)%12)) return pc;
    }
    return null;
  };

  const detectDisplayTriadLabel = (pcsRel:Set<number>, _key:KeyName): string | null => {
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    const norm = (x:number)=>((x%12)+12)%12;
    for (let root=0; root<12; root++){
      const sus2 = [root, norm(root+2), norm(root+7)];
      if (sus2.every(p=>pcsRel.has(p))) return `${names[root]}sus2`;
      const sus4 = [root, norm(root+5), norm(root+7)];
      if (sus4.every(p=>pcsRel.has(p))) return `${names[root]}sus4`;
      const aug  = [root, norm(root+4), norm(root+8)];
      if (aug.every(p=>pcsRel.has(p))) return `${names[root]}aug`;
    }
    return null;
  };

  const bdimTimerRef = useRef<number | null>(null);
  const clearBdimTimer = ()=>{ if (bdimTimerRef.current!=null){ window.clearTimeout(bdimTimerRef.current); bdimTimerRef.current=null; } };

  function detect(){

    const evt = lastMidiEventRef.current;
    const isNoteOn  = (evt === "on");
    const isNoteOff = (evt === "off");

    const phys=[...rightHeld.current], sus=sustainOn.current?[...rightSus.current]:[], merged=new Set<number>([...phys,...sus]);
    const absHeld=[...merged];
    const pcsAbs=new Set(absHeld.map(pcFromMidi));
    
    // DEBUG: Log space state when chords are detected
    if (pcsAbs.size >= 3) {
      console.log('🔍 [DETECT] Space state:', {
        absHeldNotes: absHeld,
        pcsAbs: [...pcsAbs],
        baseKey: baseKeyRef.current,
        effectiveBaseKey: baseKeyRef.current,
        transpose: effectiveTranspose,
        visitor: visitorActiveRef.current,
        subdom: subdomActiveRef.current,
        rel: relMinorActiveRef.current,
        parKey,
        subKey
      });
    }
    
    // MIDI shortcut detection moved to note-off to avoid interference with playing
    // Now handled separately in MIDI message handler

    if(pcsAbs.size===0){
      console.log('🔍 No notes held - checking latch state:', {
        latchedChord: latchedChordRef.current,
        hasLatchedChord: !!latchedChordRef.current,
        subdomActive: subdomActiveRef.current,
        subdomLatched: subdomLatchedRef.current
      });
      
      setTapEdge("REL_Am", false); setTapEdge("REL_C", false); setTapEdge("VIS_G", false);
      bonusDeb.reset();

      // ✅ v3.15.0: Check for latched chord before clearing
      if (latchedChordRef.current) {
        console.log('🔒 MIDI latch active - keeping display:', latchedChordRef.current);
        // Restore the latched chord display
        if (latchedChordRef.current.fn) {
          setActiveFn(latchedChordRef.current.fn);
        }
        setCenterLabel(latchedChordRef.current.label);
        return; // Don't clear!
      }

      if (subdomActiveRef.current && subdomLatchedRef.current) {
        if (!centerLabel) setCenterLabel(subKey);
        if (!activeFnRef.current) setActiveFn(subLastSeenFnRef.current || "I");
        hardClearGhostIfIdle();
        return;
      }
      hardClearGhostIfIdle();
      console.log('❌ No latch - clearing display');
      return clear();
    }

    setLatchedAbsNotes(absHeld);

    // PHASE 2C: Convert to baseKey-relative (not C-relative!)
    // This makes ALL isSubset() checks work in any key
    const toRel=(n:number)=>((n-NAME_TO_PC[baseKeyRef.current]+12)%12);
    const pcsRel=new Set([...pcsAbs].map(toRel));
    // MODIFIED v2.37.9: Pass absHeld array to internalAbsoluteName for dim7 root disambiguation
    const absName = internalAbsoluteName(pcsAbs, baseKeyRef.current, absHeld) || "";
    
    // v3.5.0: Fix diminished chord spelling in HOME space
    // G#dim (leading tone to A), C#dim (leading tone to D), Ebdim (ties to bIII parallel)
    let displayName = absName;
    if ((absName.includes('°') || absName.includes('dim')) && !relMinorActiveRef.current && !subdomActiveRef.current && !visitorActiveRef.current) {
      // HOME space only - spell based on function
      const before = displayName;
      displayName = displayName
        .replace(/^Ab(dim|°)/, 'G#$1')   // G# is leading tone to A (V/vi function)
        .replace(/^Db(dim|°)/, 'C#$1')   // C# is leading tone to D (V/ii function)  
        .replace(/^D#(dim|°)/, 'Eb$1');  // Eb ties to bIII in parallel (keep flat)
      if (before !== displayName) {
        console.log('🔤 Spelling fix:', before, '→', displayName);
      }
      // Gb→F# naturally handled by theory.ts
    }
    
    // Store for Make My Key - this is the pure MIDI detection result
    if (absName) {
      lastDetectedChordRef.current = absName;
      console.log('💎 lastDetectedChordRef set to:', absName, '(from theory.ts)');
    }

    updateRecentRel(pcsRel);

    const isSubset = (need:number[])=> subsetOf(T(need), pcsRel);

    /* ---------- PRIORITY DIM7 CHECK (v3.5.6) ---------- */
    // CRITICAL: Check ALL dim7 chords BEFORE any other logic (including PAR)
    // Must run IMMEDIATELY after getting absName from theory.ts
    
    // v3.5.6: ALWAYS check if currently held notes form a dim7, regardless of what was detected
    // This prevents Bdim from showing when all 4 notes of G#dim7 are held
    const currentPcsRel = new Set([...merged].map(n => pcFromMidi(n)).map(n => (n - NAME_TO_PC[baseKeyRef.current] + 12) % 12));
    const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
    const bassPc = bassNote !== null ? (bassNote % 12) : null;
    
    console.log('🔍 [DIM7 ALWAYS-CHECK]', {
      currentPcsRel: [...currentPcsRel].sort((a,b) => a-b),
      absHeld,
      bassNote,
      bassPc,
      absName,
      displayName
    });
    
    // G#dim7 [8,11,2,5] with G# bass → V/vi wedge
    // Check if ALL 4 notes are currently held
    if (currentPcsRel.size >= 4 && [8,11,2,5].every(pc => currentPcsRel.has(pc)) && bassPc === 8) {
      if (shouldTriggerBonus("V/vi")) {
        console.log('✅ G#dim7 ALWAYS detected (all 4 notes held) → V/vi');
        setActiveWithTrail("V/vi", displayName);
        return;
      }
    }
    
    // ✅ v3.17.85 FIX: Bm7b5 ABSOLUTE PRIORITY - must check before diatonic
    // Bm7b5 [11,2,5,9] shares notes with Dm7 [2,5,9,0] - must catch it early!
    if (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.has(9) && pcsRel.size === 4) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ Bm7♭5 EARLY CHECK → ii/vi bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("Bm7♭5");
        return;
      }
    }
    
    // Bdim7 [11,2,5,8] with B bass → V7 wedge (exception!)
    if (currentPcsRel.size >= 4 && [11,2,5,8].every(pc => currentPcsRel.has(pc)) && bassPc === 11) {
      console.log('✅ Bdim7 ALWAYS detected (all 4 notes held) → V7');
      setActiveWithTrail("V7", displayName);
      return;
    }
    
    // ✅ v3.17.85 FIX: C#dim triad [1,4,7] → V/ii bonus (must check before diatonic)
    if (pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.size === 3) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ C#dim TRIAD EARLY CHECK → V/ii bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        return;
      }
    }
    
    // ✅ v3.17.85 FIX: C#dim7 [1,4,7,10] → V/ii bonus (removed bass requirement for sequencer)
    if (currentPcsRel.size >= 4 && [1,4,7,10].every(pc => currentPcsRel.has(pc))) {
      if (shouldShowBonusOverlay()) {
        console.log('✅ C#dim7 EARLY CHECK (any inversion) → V/ii bonus');
        setActiveFn("");
        setCenterLabel(displayName);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label

        return;
      }
    }
    
    // If we get here and it's a dim triad (3 notes), allow it through
    // (not part of a held dim7 chord)
    const exactSet=(need:number[])=>{
      const needSet=T(need); if(!subsetOf(needSet, pcsRel)) return false;
      for(const p of pcsRel) if(!needSet.has(p)) return false;
      return true;
    };

    const amPresent = isSubset([9,0,4]) || isSubset([9,0,4,2]);
    const cPresent  = isSubset([0,4,7]) || isSubset([0,4,7,11]);

    // ---------- triple-taps ----------
    if (isNoteOn) {
    if(setTapEdge("REL_Am", amPresent) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setRelMinorActive(true); setVisitorActive(false);
      setActiveWithTrail("vi", absName || "Am"); return;
    }
    if(setTapEdge("REL_C", cPresent) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setRelMinorActive(false); setVisitorActive(false);
      setActiveWithTrail("I", absName || "C"); setCenterLabel("C"); return;
    }
    const gPresentTap = visitorActiveRef.current && (isSubset([7,11,2]) || isSubset([7,11,2,5]));
    // Unconditional V7 detection: if G7 present anywhere, drive V wedge
    if (!visitorActiveRef.current && (isSubset([7,11,2,5]))) {
      if (subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G7"); return;
    }

    if(setTapEdge("VIS_G", gPresentTap) >= 3){
      if(subdomActiveRef.current) subSpinExit();
      setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
      homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
      setVisitorActive(false); setRelMinorActive(false);
      setActiveWithTrail("V7", absName || "G/G7"); return;
    }
    }

    /* ---------- BONUS OVERLAYS ---------- */
    {
      const inParallel = visitorActiveRef.current;

      const isFullDim7 = (() => {
        const r = findDim7Root(pcsRel);
        return r !== null;
      })();

      // ========== NEW v2.45.0: vii°7 special case (works in all keys!) ==========
      // vii°7 (leading tone dim7) acts as dominant substitute in ANY key
      // Pattern: [11,2,5,8] relative to tonic (7th scale degree + dim7 intervals)
      // C: Bdim7, F: Edim7, G: F#dim7, Ab: Gdim7, etc.
      // Allow extra notes (doubled roots, etc.) as long as core pattern present
      const hasVii7Pattern = isSubset([11,2,5,8]) && isFullDim7;
      if (!inParallel && hasVii7Pattern) {
        // Light the V7 wedge, display actual chord name in hub
        setActiveFn("V7"); 
        setCenterLabel(displayName); // Use actual name (Bdim7, Edim7, etc.)
        setBonusActive(false);  // Don't use bonus overlay
        return;
      }
      // ========== END NEW v2.45.0 ==========

      // ✅ v3.14.0: OLD Bdim/Bm7b5 detection DISABLED
      // This old code is superseded by better detection at line ~3105 which:
      // - Checks shouldShowBonusOverlay() properly
      // - Uses functional label "Bm7♭5" for consistent colors
      // - Checks exact chord size
      /*
      const hasBDF   = isSubset([11,2,5]);
      const hasBDFG  = isSubset([11,2,5,9]);
      // Check for G7 more broadly: G-B-F tritone (with or without D)
      // This prevents false bonus triggers on G7 voicings without the 5th
      const hasG7 = isSubset([7,11,5]); // G-B-F (essential tritone)
      
      // Don't trigger dim bonus if G7 is present (G7 takes priority)
      if (!inParallel && !isFullDim7 && !hasG7 && (hasBDF || hasBDFG)){
        clearBdimTimer();
        bdimTimerRef.current = window.setTimeout(()=>{
          // Double-check G7 hasn't appeared during debounce (race condition guard)
          const currentPcsRel = new Set([...absHeld].map(pcFromMidi).map(n => (n - NAME_TO_PC[baseKeyRef.current] + 12) % 12));
          const stillHasG7 = [7,11,5].every(pc => currentPcsRel.has(pc));
          if (stillHasG7) return; // Abort bonus if G7 detected
          
          // Use actual chord name (Bdim in C, Edim in F, etc.)
          setActiveFn(""); 
          setCenterLabel(displayName);
          setBonusActive(true); 
          setBonusLabel(displayName);
        }, BONUS_DEBOUNCE_MS) as unknown as number;
        return;
      } else {
        clearBdimTimer();
      }
      */

      const hasCsharpDimTri  = isSubset([1,4,7]);
      const hasCsharpHalfDim = isSubset([1,4,7,11]);
      const isCsharpFullDim7 = (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12));
      if (!inParallel && (hasCsharpDimTri || hasCsharpHalfDim || isCsharpFullDim7) && shouldShowBonusOverlay()){
        // MODIFIED v2.37.10: Use actual chord name instead of hardcoding "A7"
        // The chord identifier now correctly names these (C#dim, C#dim7, C#m7♭5)
        // They still light the A7 bonus wedge (correct functional behavior)
        setActiveFn(""); 
        setCenterLabel(absName || "A7");  // Use absName, fallback to A7 if needed
        setBonusActive(true); 
        setBonusLabel("A7");  // Wedge label stays "A7" (functional label)
        return;
      }

      // ✅ v3.14.0: OLD A/A7 detection DISABLED  
      // This old code is superseded by better detection at line ~3134 which:
      // - Checks shouldShowBonusOverlay() properly
      // - Uses functional label "A7" for consistent colors
      // - Checks exact chord size
      /*
      const hasA7tri = isSubset([9,1,4]);
      const hasA7    = hasA7tri || isSubset([9,1,4,7]);
      if (hasA7 && shouldShowBonusOverlay()){
        // v3.5.0: Use absName for center label to distinguish A from A7
        // But keep bonus wedge label as "A7" (functional label)
        const centerLabelToUse = absName || "A7";
        setActiveFn(""); setCenterLabel(centerLabelToUse);
        setBonusActive(true); setBonusLabel("A7"); // Wedge always shows "A7"
        return;
      }
      */

      setBonusActive(false); setBonusLabel("");
    }

    /* ---------- SUBDOM (F) ---------- */
    {
      const enterByGm = isSubset([7,10,2]) || isSubset([7,10,2,5]);
      const enterByC7 = isSubset([0,4,7,10]);

      if (!subdomActiveRef.current && isNoteOn && (enterByGm || enterByC7)) {

        if (relMinorActiveRef.current) setRelMinorActive(false);
        setVisitorActive(false);

        setSubdomActive(true);
        setCenterLabel(subKey);
        if (enterByGm) { setActiveWithTrail("ii", absName || (isSubset([7,10,2,5])?"Gm7":"Gm")); subLatch("ii"); }
        else           { setActiveWithTrail("V7", absName || "C7");                               subLatch("V7"); }
        subSpinEnter();
        return;
      }

      if (subdomActiveRef.current) {
        // Ignore mode transitions on note-off while in SUB; keep latch fresh.
        if (isNoteOff) {
           homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
           // Keep current fn/label; prevents Gm/Gm7 bounce on release.
              return;
            }
        const useWindow = performance.now() < homeSuppressUntilRef.current;
        const S = useWindow ? windowedRelSet() : pcsRel;
        // Strong jiggle guard: brief hold + prioritize ii(Gm/Gm7) over bVII(Bb)
        const now = performance.now();
        if (now < subHoldUntilRef.current) {
          // During hold window, refuse to exit SUB
          return;
        }
        // If Bb triad present alongside G (i.e., Gm/Gm7 context), stay on ii
        if (preferIiOverFlatVII(S) || isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S)) {
          subLatch("ii");
          setActiveWithTrail("ii", isSubsetIn([7,10,2,5], S) ? "Gm7" : "Gm");
          subHoldUntilRef.current = now + 220; // short anti-bounce hold
          return;
        }


        const bbTri   = isSubsetIn([10,2,5], S);
        const bb7     = isSubsetIn([10,2,5,8], S);

        const bbMaj7Exact = exactSetIn([10,2,5,9], S);
        if (bbMaj7Exact){
          setActiveWithTrail("IV","Bbmaj7"); subLatch("IV");
          return;
        }
        const bbmStay = isSubsetIn([10,1,5], S) || isSubsetIn([10,1,5,8], S);
        if (bbmStay){
          setActiveWithTrail("iv", isSubsetIn([10,1,5,8], S) ? "Bbm7" : "Bbm");
          subLatch("iv");
          return;
        }

        if (bbTri || bb7){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = 0;
          setActiveWithTrail("♭VII", absName || (bb7 ? "Bb7" : "Bb"));
          return;
        }

        const eb   = isSubsetIn([3,7,10], S) || isSubsetIn([3,7,10,2], S);
        const ab   = isSubsetIn([8,0,3], S) || isSubsetIn([8,0,3,6], S);
        const db   = isSubsetIn([1,5,8], S) || isSubsetIn([1,5,8,11], S);
        
        // ✅ v3.17.11: Don't enter PAR if already in PAR (Eb/Ab/Db are diatonic in minor)
        if ((eb || ab || db) && !visitorActiveRef.current){
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setRelMinorActive(false);
          setVisitorActive(true);
          const m7 = firstMatch(EB_REQ7, pcsRel);
          if (m7){ setActiveWithTrail(m7.f as Fn, m7.n); return; }
          const tri = firstMatch(EB_REQT, pcsRel);
          if (tri){ setActiveWithTrail(tri.f as Fn, tri.n); return; }
          setActiveWithTrail("I","Eb");
          return;
        }

        if (subdomLatchedRef.current && S.size < 3) {
          homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
          return;
        }

        const stayOnF       = isSubsetIn([5,9,0], S) || isSubsetIn([5,9,0,4], S);
        const stayOnGm      = isSubsetIn([7,10,2], S) || isSubsetIn([7,10,2,5], S);
        const stayOnC7      = isSubsetIn([0,4,7,10], S);
        const isCtriadExact = exactSetIn([0,4,7], S);

        const exitOnCmaj7 = isSubsetIn([0,4,7,11], S);
        const exitOnAm7   = exactSetIn([9,0,4,7], S);
        const exitOnDm    = isSubsetIn([2,5,9], S) || isSubsetIn([2,5,9,0], S);

        if (exitOnCmaj7 || exitOnAm7 || exitOnDm) {
          subdomLatchedRef.current = false;
          subSpinExit();
          setSubdomActive(false);
          setVisitorActive(false); setRelMinorActive(false);
          homeSuppressUntilRef.current = performance.now() + 140;
          justExitedSubRef.current = true;
          return;
        }

        if (stayOnF || stayOnGm || stayOnC7 || isCtriadExact) {
          if (stayOnF)          { setActiveWithTrail("I",  absName || (isSubsetIn([5,9,0,4], S)?"Fmaj7":"F"));   subLatch("I"); }
          else if (stayOnGm)    { setActiveWithTrail("ii", absName || (isSubsetIn([7,10,2,5], S)?"Gm7":"Gm"));   subLatch("ii"); }
          else if (stayOnC7)    { setActiveWithTrail("V7", absName || "C7");                                     subLatch("V7"); }
          else                  { setActiveWithTrail("V7", absName || "C");                                      subLatch("V7"); }
          return;
        }

        if (protectedSubset(S)) { homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS; return; }
        const nowT = performance.now();
        if (subExitCandidateSinceRef.current==null) { subExitCandidateSinceRef.current = nowT; return; }
        if (nowT - subExitCandidateSinceRef.current < SUB_EXIT_DEBOUNCE_MS) return;

        subExitCandidateSinceRef.current = null;
        subdomLatchedRef.current = false;
        subSpinExit();
        setSubdomActive(false);
        setVisitorActive(false); setRelMinorActive(false);
        homeSuppressUntilRef.current = performance.now() + 140;
        justExitedSubRef.current = true;
        return;
      }
    }

    /* ---------- PARALLEL quick rule ---------- */
    if (visitorActiveRef.current && (isSubset([2,6,9,0]) || exactSet([2,6,9,0]))){
      if (shouldTriggerBonus("V/V")) {
        setVisitorActive(false);
        setActiveWithTrail("V/V", "D7");
        return;
      }
    }

    // Guard Fm7 exact in HOME
    if (!visitorActiveRef.current && !subdomActiveRef.current){
      if (exactSet([5,8,0,3])){ setRelMinorActive(false); setActiveWithTrail("iv","Fm7"); return; }
    }

    /* Enter Parallel (PAR) - now dynamic for all keys! */
      if(isNoteOn && !visitorActiveRef.current && !subdomActiveRef.current){
      const vHit = visitorShapes.find(v=>subsetOf(v.pcs, pcsRel)) || null;
      if(vHit){
        if(relMinorActiveRef.current) setRelMinorActive(false);
        setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
        setVisitorActive(true);
        setActiveWithTrail(vHit.fn, vHit.name);
        return;
      }
    }

    /* Parallel exits (Eb) */
    if(visitorActiveRef.current && !relMinorActiveRef.current){
      if(cPresent){ setVisitorActive(false); setActiveWithTrail("I", absName || "C"); return; }
      if(amPresent){ setVisitorActive(false); setActiveWithTrail("vi", absName || "Am"); return; }
      const fMaj   = isSubset([5,9,0]) || isSubset([5,9,0,4]);
      if (fMaj){
        setVisitorActive(false);
        setActiveWithTrail("IV", absName || (isSubset([5,9,0,4]) ? "Fmaj7" : "F"));
        return;
      }
    }

    if(!subdomActiveRef.current && exactSet([10,1,5,8])){ centerOnly("Bbm7"); return; }

    if(visitorActiveRef.current && (isSubset([2,5,9]) || isSubset([2,5,9,0]))){
      setVisitorActive(false); setActiveWithTrail("ii", absName || (isSubset([2,5,9,0])?"Dm7":"Dm")); return;
    }
    if(visitorActiveRef.current && (isSubset([4,7,11]) || isSubset([4,7,11,2]))){
      setVisitorActive(false); setActiveWithTrail("iii", absName || (isSubset([4,7,11,2])?"Em7":"Em")); return;
    }

    /* ---------- explicit dim7 mapping in HOME ---------- */
    if (!visitorActiveRef.current){
      const root = findDim7Root(pcsRel);
      if (root!==null){
        // ========== NEW v2.37.11: Use absName from theory.ts for ALL dim7 chords ==========
        // Previously hardcoded F#dim7, G#dim7, Bdim7 - now all use proper lowest-note naming
        
        // Special case: C#dim7 family uses A7 bonus overlay (not wedge)
        if (pcsRel.has(1) && pcsRel.has((1+3)%12) && pcsRel.has((1+6)%12) && pcsRel.has((1+9)%12)){
          // ✅ v3.14.1: Add permission check
          if (shouldShowBonusOverlay()) {
            setActiveFn(""); setCenterLabel(absName || "C#dim7"); // Use absName, not hardcoded "A7"
            setBonusActive(true); setBonusLabel("A7");
            return;
          }
        }
        
        // ========== NEW v2.45.0: vii°7 in REL Am (works in all keys!) ==========
        // vii°7 of meta-key should map to V7, not be misidentified
        const hasVii7Pattern = pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && pcsRel.has(8);
        if (hasVii7Pattern) {
          // Always map to V7 (dominant function) regardless of current space
          setActiveWithTrail("V7", absName); // Use actual name
          return;
        }
        // ========== END v2.45.0 ==========
        
        // All other dim7 chords: use absName from theory.ts (which uses lowest note)
        const dimLabel = absName || `${["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"][root]}dim7`;
        const mapped = mapDimRootToFn_ByBottom(root) || "V7";
        setActiveWithTrail(mapped as Fn, dimLabel);
        return;
      }
    }
    
    /* ========== NEW v2.45.0: PAR EXIT for secondary dominants ========== */
    // When in PAR, certain chords signal return to HOME (secondary dominant area)
    // Check these BEFORE PAR diatonic matching
    if (visitorActiveRef.current) {
      // Exit on F#dim7 family (V/V function) - relative to meta-key
      // Pattern [6,9,0,3] in C = F#dim7, works in all keys
      const hasFsharpDim7 = pcsRel.has(6) && pcsRel.has(9) && pcsRel.has(0) && pcsRel.has(3);
      if (hasFsharpDim7 && shouldTriggerBonus("V/V")) {
        setVisitorActive(false);
        setActiveWithTrail("V/V", absName);
        return;
      }
      
      // Exit on A7/A (V/ii function - use bonus wedge)
      const hasA = isSubset([9,1,4]);
      if (hasA && shouldShowBonusOverlay()) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7");
        setCenterLabel(displayName);
        setActiveFn("");
        return;
      }
      
      // Exit on C#dim7 family (V/ii function - use bonus wedge)
      const hasCsharpDim7 = pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10);
      if (hasCsharpDim7 && shouldShowBonusOverlay()) {
        setVisitorActive(false);
        setBonusActive(true);
        setBonusLabel("A7"); // Functional label
        setCenterLabel(displayName); // Actual chord name
        setActiveFn("");
        return;
      }
    }
    /* ========== END v2.45.0 ========== */

    /* In PAR mapping - now dynamic for all keys! */
    if(visitorActiveRef.current){
      // CRITICAL: Check vii° and vii°7 FIRST (before diatonic matching)
      // vii° and vii°7 act as V chord for meta-key in ALL keys
      // In PAR space, this means V/vi function, NOT V7 of PAR key
      // Pattern [11,2,5] for vii° triad, [11,2,5,8] for vii°7
      // MUST check BEFORE diatonic because [11,2,5] matches Bb triad subset!
      // Allow extra notes (e.g., doubled roots) as long as core pattern present
      const hasViiTriad = isSubset([11,2,5]) && pcsRel.size <= 4; // Allow up to 4 notes
      const hasVii7 = isSubset([11,2,5,8]); // Any size OK for dim7
      if (hasViiTriad || hasVii7) {
        // Light V/vi wedge, display actual chord name
        setActiveFn("V/vi"); 
        setCenterLabel(displayName); // Edim/Edim7 in F, Bdim/Bdim7 in C, etc.
        setBonusActive(false);
        return;
      }
      
      // Now check diatonic (after vii° check)
      const m7 = firstMatch(parDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, parKey);
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
      const tri = firstMatch(parDiatonic.reqt, pcsRel); 
      if(tri){ 
        // v3.5.0: Use absName from theory.ts instead of realizeFunction
        const chordName = absName || realizeFunction(tri.f as Fn, parKey);
        console.log('[DETECT] Matched PAR tri:', { 
          fn: tri.f, 
          chordName, 
          absName,
          usingAbsName: !!absName,
          parKey,
          baseKey: baseKeyRef.current,
          pcsRel: [...pcsRel],
          triPattern: tri.s ? [...tri.s] : 'none'
        });
        setActiveWithTrail(tri.f as Fn, chordName); 
        return; 
      }
    }

    /* In C mapping */
    console.log('🏠 HOME CHECK:', {
      now: performance.now(),
      suppressUntil: homeSuppressUntilRef.current,
      willRun: performance.now() >= homeSuppressUntilRef.current,
      pcsRelSize: pcsRel.size
    });
    
    if (performance.now() >= homeSuppressUntilRef.current){
      // v3.5.1: Get bass note for diminished chord function detection
      const bassNote = absHeld.length > 0 ? Math.min(...absHeld) : null;
      const bassPc = bassNote !== null ? (bassNote % 12) : null;
      
      // ✅ v3.15.8: Check secondary dominants BEFORE main pattern matching
      // Calculate relative to baseKey (not C-specific)
      const baseKeyPC = NAME_TO_PC[baseKeyRef.current];
      
      // V/V = V of V = dominant of scale degree 5 = scale degree 2
      // In C: D or D7 (2,6,9) or (2,6,9,0). In F: G or G7 (7,11,2) or (7,11,2,5).
      const vOfV_root = (baseKeyPC + 2) % 12;
      const vOfV_triad = [(vOfV_root + 0) % 12, (vOfV_root + 4) % 12, (vOfV_root + 7) % 12];
      const vOfV_seventh = (vOfV_root + 10) % 12;
      const vOfV_hasTriad = isSubsetIn(vOfV_triad, pcsAbs);
      const vOfV_has7th = isSubsetIn([vOfV_seventh], pcsAbs);
      const vOfV = vOfV_hasTriad; // Trigger on triad alone OR with 7th
      
      // V/vi = V of vi = dominant of scale degree 6 (relative minor) = scale degree 4  
      // In C: E or E7 (4,8,11) or (4,8,11,2). In F: A or A7 (9,1,4) or (9,1,4,7).
      const vOfVi_root = (baseKeyPC + 4) % 12;
      const vOfVi_triad = [(vOfVi_root + 0) % 12, (vOfVi_root + 4) % 12, (vOfVi_root + 7) % 12];
      const vOfVi_seventh = (vOfVi_root + 10) % 12;
      const vOfVi_hasTriad = isSubsetIn(vOfVi_triad, pcsAbs);
      const vOfVi_has7th = isSubsetIn([vOfVi_seventh], pcsAbs);
      const vOfVi = vOfVi_hasTriad; // Trigger on triad alone OR with 7th
      
      // V/vi also includes diminished substitution (e.g., G#dim for E7 in C)
      const vOfVi_dimSub_root = (vOfVi_root + 4) % 12; // Minor third above V/vi root
      const vOfVi_dimTriad = [(vOfVi_dimSub_root + 0) % 12, (vOfVi_dimSub_root + 3) % 12, (vOfVi_dimSub_root + 6) % 12];
      const vOfVi_dimSub = isSubsetIn(vOfVi_dimTriad, pcsAbs) && (pcsAbs.size === 3 || (pcsAbs.size === 4 && bassPc === vOfVi_dimSub_root));

      // ✅ v3.15.11: V/V and V/vi ALWAYS trigger (have dedicated wedges)
      // shouldTriggerBonus only gates bonus overlays (ii/vi, V/ii) without wedges
      if (vOfV){ 
        const vOfV_rootName = pcNameForKey(vOfV_root, baseKeyRef.current);
        const chordLabel = vOfV_has7th ? `${vOfV_rootName}7` : vOfV_rootName;
        setActiveWithTrail("V/V", chordLabel); 
        return; 
      }
      if (vOfVi || vOfVi_dimSub){ 
        let chordName: string;
        if (vOfVi_dimSub) {
          chordName = displayName;
        } else {
          const rootName = pcNameForKey(vOfVi_root, baseKeyRef.current);
          chordName = vOfVi_has7th ? `${rootName}7` : rootName;
        }
        setActiveWithTrail("V/vi", chordName); 
        return; 
      }
      
      // ✅ v3.15.9: Check common diatonic triads (ii, iii, vi) - pattern matcher may not have them
      // These are RELATIVE to baseKey (scale degrees), not absolute pitch classes
      const ii_triad = isSubsetIn([2, 5, 9], pcsRel);
      const ii_7th = isSubsetIn([2, 5, 9, 0], pcsRel);
      const iii_triad = isSubsetIn([4, 7, 11], pcsRel);
      const iii_7th = isSubsetIn([4, 7, 11, 2], pcsRel);
      const vi_triad = isSubsetIn([9, 0, 4], pcsRel);
      const vi_7th = isSubsetIn([9, 0, 4, 7], pcsRel);
      
      if (ii_triad || ii_7th) {
        const chordName = absName || realizeFunction("ii" as Fn, baseKeyRef.current);
        // ✅ v3.17.85: Don't append 7 if already present (Fm7 → Fm77 bug)
        const label = ii_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("ii", label);
        return;
      }
      if (iii_triad || iii_7th) {
        const chordName = absName || realizeFunction("iii" as Fn, baseKeyRef.current);
        const label = iii_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("iii", label);
        return;
      }
      if (vi_triad || vi_7th) {
        const chordName = absName || realizeFunction("vi" as Fn, baseKeyRef.current);
        const label = vi_7th && !chordName.match(/7|9|11|13/) ? `${chordName}7` : chordName;
        setActiveWithTrail("vi", label);
        return;
      }
      
      // ✅ v3.6.1 FIX: REMOVED hardcoded E/E7 and G/G7 checks
      // Old code checked for patterns [4,8,11] (E) and [7,11,2] (G) in C
      // But these patterns mean DIFFERENT chords in other keys!
      // In Eb: [7,11,2] = Bb (not G), [4,8,11] = G (not E)
      // Solution: Let homeDiatonic patterns handle ALL diatonic chords
      // This makes the system work correctly in ANY key
      
      // PRIORITY: Check bonus chords (triads and half-dim only - dim7 checked above)
      // ii/vi bonus: Bdim triad (any inversion) or Bm7♭5 (any inversion)
      const hasBdimTriad = isSubset([11,2,5]) && pcsRel.size === 3; // Bdim triad, any inversion
      const hasBm7b5 = isSubset([11,2,5,9]) && pcsRel.size === 4; // Bm7♭5, any inversion
      
      console.log('🔍 Bm7♭5 bonus check:', {
        hasBdimTriad,
        hasBm7b5,
        pcsRel: Array.from(pcsRel),
        visitorActive: visitorActiveRef.current,
        shouldShow: shouldShowBonusOverlay(),
        skillLevel
      });
      
      // ✅ v3.14.0: Re-add shouldShowBonusOverlay check (was removed in v3.13.9 by mistake)
      if (!visitorActiveRef.current && (hasBdimTriad || hasBm7b5) && shouldShowBonusOverlay()) {
        console.log('✅ Bm7♭5 BONUS TRIGGERED!');
        setActiveFn(""); 
        setCenterLabel(displayName);
        setBonusActive(true); 
        setBonusLabel("Bm7♭5"); // ✅ v3.13.6: Use functional label for wedge
        return;
      }
      
      // V/ii bonus (A7 family): A, A7, C#dim triad, C#m7♭5 (C#dim7 checked above)
      const hasA = isSubset([9,1,4]) && pcsRel.size === 3; // A triad, any inversion
      const hasA7 = isSubset([9,1,4,7]) && pcsRel.size === 4; // A7, any inversion
      const hasCSharpDimTriad = isSubset([1,4,7]) && pcsRel.size === 3; // C#dim triad [C#,E,G], any inversion
      const hasCSharpHalfDim = isSubset([1,4,7,11]) && pcsRel.size === 4; // C#m7♭5, any inversion
      
      console.log('🔍 A7 bonus check:', {
        hasA,
        hasA7,
        hasCSharpDimTriad,
        hasCSharpHalfDim,
        pcsRel: Array.from(pcsRel),
        visitorActive: visitorActiveRef.current,
        shouldShow: shouldShowBonusOverlay(),
        skillLevel
      });
      
      // ✅ v3.14.0: Re-add shouldShowBonusOverlay check (was removed in v3.13.9 by mistake)
      if (!visitorActiveRef.current && (hasA || hasA7 || hasCSharpDimTriad || hasCSharpHalfDim) && shouldShowBonusOverlay()) {
        console.log('✅ A7 BONUS TRIGGERED!');
        setActiveFn(""); 
        setCenterLabel(displayName); // Show actual chord name
        setBonusActive(true); 
        setBonusLabel("A7"); // ✅ v3.13.6: Use functional label for wedge
        return;
      }
      
      if (exactSet([6,9,0,4]) && shouldTriggerBonus("V/V")){ setActiveWithTrail("V/V","F#m7♭5"); return; }
      
      // ✅ v3.17.85 FIX #3: DEFENSIVE - Don't let bonus chords match diatonic
      // If bonus chord present but permission denied, show in hub without lighting wedge
      const isBonusChordPattern = 
        (pcsRel.has(11) && pcsRel.has(2) && pcsRel.has(5) && (pcsRel.size === 3 || (pcsRel.has(9) && pcsRel.size === 4))) || // Bdim/Bm7b5
        (pcsRel.has(1) && pcsRel.has(4) && pcsRel.has(7) && pcsRel.has(10) && pcsRel.size === 4) || // C#dim7
        (pcsRel.has(9) && pcsRel.has(1) && pcsRel.has(4) && (pcsRel.size === 3 || (pcsRel.has(7) && pcsRel.size === 4))); // A/A7
        
      if (isBonusChordPattern && !shouldShowBonusOverlay()) {
        console.log('🛡️ DEFENSIVE: Bonus chord detected but permission denied - showing in hub only');
        centerOnly(displayName);
        return;
      }
      
      const m7 = firstMatch(homeDiatonic.req7, pcsRel); 
      if(m7){ 
        // Prefer displayName for 7th chords (with corrected spelling)
        const hasSeventhQuality = /(maj7|m7♭5|m7|mMaj7|dim7|[^m]7)$/.test(absName);
        const chordName = hasSeventhQuality ? displayName : realizeFunction(m7.f as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched m7:', { fn: m7.f, chordName, absName, displayName, hasSeventhQuality, baseKey: baseKeyRef.current });
        setActiveWithTrail(m7.f as Fn, chordName); 
        return; 
      }
      if(/(maj7|m7♭5|m7$|dim7$|[^m]7$)/.test(absName)) { centerOnly(displayName); return; }
      const tri = firstMatch(homeDiatonic.reqt, pcsRel); 
      if(tri){ 
        // ✅ v3.6.2 FIX: Filter out incorrect secondary dominant matches
        // Bug: In Eb, pattern [5,9,0] (Ab = IV) matches as "V/V" instead of "IV"
        // Root cause: homeDiatonic includes V/V and V/vi patterns that overlap with diatonic chords
        // Solution: If it matches V/V or V/vi, verify it's actually a secondary dominant
        
        let functionToUse = tri.f;
        
        // Check if this is a false V/V or V/vi match
        if (tri.f === "V/V" || tri.f === "V/vi") {
          // These should only match if they're ACTUALLY secondary dominants
          // In the base key, check if this chord is diatonic
          const rootPc = pcsAbs.values().next().value;
          if (rootPc === undefined) {
            // Safety check - if we can't get the root, use the match as-is
            functionToUse = tri.f;
          } else {
            const relativeToBase = (rootPc - NAME_TO_PC[baseKeyRef.current] + 12) % 12;
            
            // Check if this is actually a diatonic chord in the base key
            // IV in any key has relative degree 5 (5 semitones from tonic)
            // V in any key has relative degree 7 (7 semitones from tonic)
            if (relativeToBase === 5) {
              // This is IV, not V/V!
              functionToUse = "IV";
              console.log('🔧 Corrected V/V → IV (diatonic subdominant)');
            } else if (relativeToBase === 7) {
              // This is V, not V/vi!
              functionToUse = "V7";
              console.log('🔧 Corrected V/vi → V7 (diatonic dominant)');
            }
          }
        }
        
        // v3.5.0: Use absName from theory.ts instead of realizeFunction
        // This prevents G triad from being labeled "G7" just because it triggers V7 function
        const chordName = absName || realizeFunction(functionToUse as Fn, baseKeyRef.current);
        console.log('[DETECT] Matched tri:', { 
          fn: tri.f,
          correctedFn: functionToUse,
          chordName, 
          absName,
          usingAbsName: !!absName,
          baseKey: baseKeyRef.current, 
          pcsRel: [...pcsRel],
          triPattern: tri.s ? [...tri.s] : 'none'
        });
        console.log('🎯 WEDGE ACTIVATION:', functionToUse, '→', chordName, 'in key', baseKeyRef.current);
        setActiveWithTrail(functionToUse as Fn, chordName); 
        return; 
      }
      
      // ✅ v3.6.3 DEBUG: Log why no match was found
      console.log('❌ NO TRI MATCH FOUND:', {
        pcsRel: [...pcsRel],
        absName,
        baseKey: baseKeyRef.current,
        availablePatterns: homeDiatonic.reqt.map(p => ({
          f: p.f,
          pattern: [...p.s]
        }))
      });
    }

    // diminished fallback by bottom note
    const rhs=absHeld.filter(n=>n>36).sort((a,b)=>a-b);
    if(rhs.length>=3){
      const bottom=rhs[0], rootPc=pcFromMidi(bottom);
      const tri=T([rootPc, add12(rootPc,3), add12(rootPc,6)]);
      const sev=T([rootPc, add12(rootPc,3), add12(rootPc,6), add12(rootPc,9)]);
      const pcsRH=new Set(rhs.map(pcFromMidi));
      const has7=subsetOf(sev, pcsRH) , hasTri=subsetOf(tri, pcsRH);
      if(has7 || hasTri){
        // ✅ v3.6.7 FIX: Use dimRootName for proper sharp spelling (G#dim not Abdim)
        // Import dimRootName logic: Bb(10), Eb(3), C#(1), else use sharps
        const dimName = (pc: number) => 
          pc===10 ? "Bb" : (pc===3 ? "Eb" : (pc===1 ? "C#" : 
          ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][pc]));
        const label=has7?`${dimName(rootPc)}dim7`:`${dimName(rootPc)}dim`;
        const mapped = visitorActiveRef.current ? (mapDim7_EbVisitor(pcsRel) || mapDimRootToFn_ByBottom(rootPc)) : mapDimRootToFn_ByBottom(rootPc);
        if(mapped){ setActiveWithTrail(mapped, label); return; }
        centerOnly(label); return;
      }
    }

    const triDisp = detectDisplayTriadLabel(pcsRel, baseKeyRef.current);
    console.log('[DETECT] Fallback:', { triDisp, absName, displayName, result: triDisp || displayName });
    centerOnly(triDisp || displayName);
  }
  /* ---------- controls ---------- */
  const goHome = ()=>{
    if(subdomActiveRef.current) subSpinExit();
    setRelMinorActive(false);
    setVisitorActive(false);
    setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false;
    homeSuppressUntilRef.current = 0; justExitedSubRef.current = false;
    setTargetRotation(0);
    // Don't reset to C - use current baseKey!
    setActiveFn("I");
    setCenterLabel(baseKeyRef.current); // Show current key in hub
    stopDimFade();
  };
  
  const goHomeC = ()=>{
    // Reset to C key and HOME space
    setBaseKey("C");
    setTimeout(() => goHome(), 20);
  };
  
  const makeThisMyKey = ()=>{
    // ✅ v3.13.4: Single note shortcut - if only one note held, go to that major key
    // This allows quick transposition without playing a full chord
    const heldNotes = Array.from(rightHeld.current);
    
    if (heldNotes.length === 1) {
      // Single note - use it as the root of a major key
      const midiNote = heldNotes[0];
      const pc = pcFromMidi(midiNote);
      const rootName = FLAT_NAMES[pc] as KeyName;
      
      console.log('🔑 Make My Key (single note):', rootName, '- Quick major key transposition');
      
      if (FLAT_NAMES.includes(rootName)) {
        setBaseKey(rootName);
        setTimeout(() => {
          goHome();
          console.log('🔑 Transposed to', rootName, 'major');
        }, 50);
      }
      return;
    }
    
    // Multi-note: Original chord-based logic
    // Simple rule: Make the root of the chord the new key center
    // UNLESS it's a minor chord, then use relative major + REL mode
    
    // CRITICAL: Use lastDetectedChordRef (from theory.ts) instead of lastPlayedChordRef
    // lastPlayedChordRef can be polluted by preview/latch/space-switching
    // lastDetectedChordRef contains the pure MIDI detection result
    const chordToUse = lastDetectedChordRef.current;
    if (!chordToUse) return;
    
    // Parse chord name to get root
    const match = chordToUse.match(/^([A-G][b#]?)(m|min|maj|M)?/);
    if (!match) return;
    
    const rootName = match[1] as KeyName;
    const quality = match[2] || "";
    const isMinor = quality.startsWith("m") && !quality.startsWith("maj");
    
    console.log('🔑 Make My Key:', chordToUse, '(from theory.ts) → root:', rootName, 'isMinor:', isMinor, 'currentLabel:', centerLabel);
    
    if (isMinor) {
      // Minor chord - go to relative major and activate REL
      const rootPc = NAME_TO_PC[rootName];
      if (rootPc === undefined) return;
      
      // Calculate relative major PC
      const relativeMajorPc = (rootPc + 3) % 12; // Minor 3rd up
      
      // Get the key name directly from FLAT_NAMES (prefer flats for key centers)
      const relativeMajorKey = FLAT_NAMES[relativeMajorPc] as KeyName;
      
      console.log('🔑 Minor:', rootName, '(pc:', rootPc, ') → relative major:', relativeMajorKey, '(pc:', relativeMajorPc, '), current baseKey:', baseKeyRef.current);
      
      // Check if we're already in the correct relative major
      if (baseKeyRef.current === relativeMajorKey) {
        console.log('🔑 Already in correct key, just activating REL');
        // Just activate REL mode, don't change base key
        if (!relMinorActiveRef.current) {
          toggleRelMinor();
        }
      } else {
        // Need to change base key
        if (FLAT_NAMES.includes(relativeMajorKey)) {
          console.log('🔑 Changing base key from', baseKeyRef.current, 'to', relativeMajorKey);
          setBaseKey(relativeMajorKey);
          goHome(); // Reset to home first
          setTimeout(() => {
            if (!relMinorActiveRef.current) {
              toggleRelMinor();
            }
          }, 100);
        }
      }
    } else {
      // Major chord (including 7ths, maj7s, etc.) - use root as new key
      console.log('🔑 Major → new key:', rootName);
      if (FLAT_NAMES.includes(rootName)) {
        setBaseKey(rootName);
        // Force immediate state update
        setTimeout(() => {
          goHome();
          console.log('🔑 Called goHome, should be in', rootName, 'now');
        }, 50);
      }
    }
  };
  
  const toggleVisitor = ()=>{
    if (spaceLocked) return; // ✅ v3.11.0: Locked
    const on = !visitorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && relMinorActiveRef.current) setRelMinorActive(false);
    setVisitorActive(on);
    if(on){ setActiveFn("I"); setCenterLabel(parKey); stopDimFade(); }
  };
  const toggleRelMinor = ()=>{
    if (spaceLocked) return; // ✅ v3.11.0: Locked
    const on = !relMinorActiveRef.current;
    if(on && subdomActiveRef.current){ subSpinExit(); setSubdomActive(false); subdomLatchedRef.current=false; subHasSpunRef.current=false; }
    if(on && visitorActiveRef.current) setVisitorActive(false);
    setRelMinorActive(on);
    if(on){ setActiveFn("vi"); setCenterLabel("Am"); stopDimFade(); }
  };
  const toggleSubdom = ()=>{
    if (spaceLocked) return; // ✅ v3.11.0: Locked
    const on = !subdomActiveRef.current;
    if(on){
      setVisitorActive(false); setRelMinorActive(false);
      setSubdomActive(true);
      subdomLatchedRef.current = true;
      subExitCandidateSinceRef.current = null;
      subLastSeenFnRef.current = "I";
      homeSuppressUntilRef.current = performance.now() + RECENT_PC_WINDOW_MS;
      setActiveFn("I"); setCenterLabel(subKey);
      subSpinEnter();
      stopDimFade();
    } else {
      subdomLatchedRef.current = false;
      subExitCandidateSinceRef.current = null;
      subSpinExit();
      setSubdomActive(false);
      homeSuppressUntilRef.current = performance.now() + 140;
      justExitedSubRef.current = true;
      setActiveFn("I"); setCenterLabel("C");
      stopDimFade();
    }
  };

  const wrapperStyle: React.CSSProperties = ((visitorActive || relMinorActive) && NEGATIVE_ON_VISITOR)
    ? { filter:"invert(1) hue-rotate(180deg)" } : {};

  const fnFillColor = (fn: Fn) =>
    (relMinorActive && fn === "V/V") ? FN_COLORS["IV"] : FN_COLORS[fn];

  const fnDisplay = (fn: Fn): string => fn; // v3.5.0: Display function as-is (V/vi shows as V/vi)

  const [dimFadeTick, setDimFadeTick] = useState(0);
  const [dimFadeOn, setDimFadeOn] = useState(false);
  const dimFadeRafRef = useRef<number | null>(null);

  /* ---------- label key + center text style ---------- */
  // v3.5.0: Use effectiveBaseKey for transpose support
  const labelKey = (visitorActive ? parKey : (subdomActive ? subKey : effectiveBaseKey)) as KeyName;
  
  // Debug: Log wedge label key
  useEffect(() => {
    console.log('🏷️ WEDGE LABEL KEY:', {
      labelKey,
      effectiveBaseKey,
      baseKey,
      visitor: visitorActive,
      subdom: subdomActive
    });
  }, [labelKey, effectiveBaseKey, baseKey, visitorActive, subdomActive]);
  
  const centerTextStyle: React.CSSProperties = {
    fontFamily: CENTER_FONT_FAMILY, paintOrder: "stroke", stroke: "#000", strokeWidth: 1.2 as any
  };

  /* ---------- wedges ---------- */
  const wedgeNodes = useMemo(()=>{
    // v3.5.0: Use effectiveBaseKey for transpose support
    const renderKey:KeyName = visitorActive ? parKey : effectiveBaseKey;
    console.log('🎨 RENDERING WEDGES with key:', renderKey);
    const dimK = Math.min(1, Math.max(0, dimFadeTick / DIM_FADE_MS));
    const fadedBase = 0.5 + 0.5 * dimK; // 0.5→1.0
    return layout
      .filter(({fn}) => isFunctionVisible(fn)) // Filter by skill level
      .map(({fn,path,labelPos})=>{
      const isActive = activeFn===fn;
      const isTrailing = trailOn && (trailFn===fn);
      const k = isTrailing ? Math.min(1, Math.max(0, trailTick / RING_FADE_MS)) : 0;
      const globalActive = (activeFn!=="" || bonusActive); 
      const fillOpacity = isActive ? 1 : (globalActive ? 0.5 : (dimFadeOn ? fadedBase : 1));
      const ringTrailOpacity = 1 - 0.9*k; const ringTrailWidth = 5 - 3*k;
      return (
        <g key={fn} 
           style={{touchAction: 'none', cursor: 'pointer'}}
           onPointerDown={(e)=>{
             // ✅ v3.17.85: Touch support - pointer events work for mouse + touch
             e.preventDefault(); // Prevent default touch behaviors
             
             // ✅ v3.17.85: Click-to-clear with timer - only clear if clicking same wedge after delay
             const now = Date.now();
             const timeSinceLastClick = now - lastWedgeClickTimeRef.current;
             const sameWedge = wedgeClickFnRef.current === fn;
             
             if (isActive && sameWedge && timeSinceLastClick > 10000) {
               // Long delay (10s+) between clicks on same active wedge = clear it
               console.log('🔓 Unlatching active wedge (10s+ since last click):', fn);
               setActiveFn("");
               setCenterLabel("");
               setLatchedAbsNotes([]);
               lastInputWasPreviewRef.current = false;
               lastWedgeClickTimeRef.current = 0;
               wedgeClickFnRef.current = "";
               return;
             }
             
             // Track this click for next time
             lastWedgeClickTimeRef.current = now;
             wedgeClickFnRef.current = fn;
             
             // ✅ v3.17.85: Visual pulse feedback
             setPulsingWedge(fn);
             setTimeout(() => setPulsingWedge(""), 300);
             
             // Quick clicks or different wedge = play normally
             wedgeHeldRef.current = true; // Mark wedge as held
             currentHeldFnRef.current = fn; // Remember which function
             
             // Calculate click position relative to wheel center
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) { previewFn(fn); return; }
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const ctm = svg.getScreenCTM();
             
             // Safari/zoom debugging
             console.log('🔍 CTM:', {
               ctm: ctm ? 'exists' : 'null',
               a: ctm?.a,
               d: ctm?.d,
               clientX: e.clientX,
               clientY: e.clientY
             });
             
             if (!ctm) {
               console.warn('⚠️ getScreenCTM() returned null, using fallback');
               previewFn(fn, true); // Default to 7th if transform fails
               return;
             }
             
             const svgP = pt.matrixTransform(ctm.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r; // 0 = center, 1 = outer edge
             
             // Inner zone (< threshold) = play with 7th
             // Outer zone (>= threshold) = play triad only
             const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
             lastPlayedWith7thRef.current = playWith7th; // Remember what we played
             
             console.log('🖱️ Click coords:', {
               svgX: svgP.x.toFixed(1),
               svgY: svgP.y.toFixed(1),
               dx: dx.toFixed(1),
               dy: dy.toFixed(1),
               clickRadius: clickRadius.toFixed(1),
               wheelRadius: r,
               normalizedRadius: normalizedRadius.toFixed(2),
               threshold: SEVENTH_RADIUS_THRESHOLD,
               playWith7th
             });
             previewFn(fn, playWith7th);
           }}
           onPointerEnter={(e)=>{
             // ✅ v3.17.85: Pointer events for touch + mouse
             // If dragging from another wedge, activate this wedge
             console.log('🔍 onPointerEnter:', fn, 'buttons:', e.buttons, 'wedgeHeld:', wedgeHeldRef.current, 'currentFn:', currentHeldFnRef.current);
             
             if (e.buttons === 1 && wedgeHeldRef.current && currentHeldFnRef.current !== fn) {
               console.log('🎯 Dragged to new wedge:', fn, 'from:', currentHeldFnRef.current);
               
               // Stop previous chord with quick fade
               const ctx = audioContextRef.current;
               if (ctx) {
                 const now = ctx.currentTime;
                 console.log('🔇 Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
                 activeChordNoteIdsRef.current.forEach(noteId => {
                   const nodes = activeNotesRef.current.get(noteId);
                   if (nodes) {
                     nodes.gain.gain.cancelScheduledValues(now);
                     nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                     nodes.gain.gain.linearRampToValueAtTime(0, now + 0.05); // Quick 50ms fade
                     setTimeout(() => stopNoteById(noteId), 100);
                   }
                 });
                 activeChordNoteIdsRef.current.clear();
               }
               
               currentHeldFnRef.current = fn;
               
               // Calculate radius for 7th determination
               const svg = e.currentTarget.ownerSVGElement;
               if (!svg) return;
               
               const pt = svg.createSVGPoint();
               pt.x = e.clientX;
               pt.y = e.clientY;
               const ctm = svg.getScreenCTM();
               if (!ctm) {
                 console.warn('⚠️ CTM null in onMouseEnter');
                 previewFn(fn, true);
                 return;
               }
               const svgP = pt.matrixTransform(ctm.inverse());
               
               const dx = svgP.x - cx;
               const dy = svgP.y - cy;
               const clickRadius = Math.sqrt(dx*dx + dy*dy);
               const normalizedRadius = clickRadius / r;
               
               const playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
               lastPlayedWith7thRef.current = playWith7th;
               
               console.log('🎵 Playing new chord:', fn, 'with7th:', playWith7th);
               // Play new chord
               previewFn(fn, playWith7th);
             }
           }}
           onMouseMove={(e)=>{
             e.preventDefault(); // Prevent text selection
             
             // Only process if wedge is being held
             if (!wedgeHeldRef.current || currentHeldFnRef.current !== fn) return;
             
             const svg = e.currentTarget.ownerSVGElement;
             if (!svg) return;
             
             const pt = svg.createSVGPoint();
             pt.x = e.clientX;
             pt.y = e.clientY;
             const ctm = svg.getScreenCTM();
             if (!ctm) {
               console.warn('⚠️ CTM null in onMouseMove');
               return;
             }
             const svgP = pt.matrixTransform(ctm.inverse());
             
             const dx = svgP.x - cx;
             const dy = svgP.y - cy;
             const clickRadius = Math.sqrt(dx*dx + dy*dy);
             const normalizedRadius = clickRadius / r;
             
             const shouldHave7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
             
             // If 7th state changed, update hub label and audio
             if (shouldHave7th !== lastPlayedWith7thRef.current) {
               console.log('🎵 Drag changed 7th (hub update):', shouldHave7th);
               lastPlayedWith7thRef.current = shouldHave7th;
               
               // Update hub label
               const renderKey = visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current);
               const chordName = realizeFunction(fn, renderKey);
               
               if (!chordName) return; // Safety check
               
               // Add or remove appropriate 7th extension
               let updatedLabel = chordName;
               if (shouldHave7th) {
                 if (!chordName.includes('7')) {
                   // Check if it's a major or dominant chord
                   // I, IV = maj7, V7 = 7, ii, iii, vi = m7
                   if (fn === "I" || fn === "IV") {
                     updatedLabel = chordName + 'maj7';
                     setCenterLabel(updatedLabel);
                   } else if (fn === "V7") {
                     // V7 already has 7 in the function name, but chord might show as "G"
                     updatedLabel = chordName.includes('7') ? chordName : chordName + '7';
                     setCenterLabel(updatedLabel);
                   } else if (fn === "ii" || fn === "iii" || fn === "vi" || fn === "iv") {
                     // Minor chords - check if already has 'm' to avoid "Amm7"
                     if (chordName.includes('m')) {
                       updatedLabel = chordName + '7'; // Already has 'm', just add '7'
                       setCenterLabel(updatedLabel);
                     } else {
                       updatedLabel = chordName + 'm7';
                       setCenterLabel(updatedLabel);
                     }
                   } else {
                     updatedLabel = chordName + '7';
                     setCenterLabel(updatedLabel);
                   }
                 }
               } else {
                 updatedLabel = chordName.replace(/maj7|m7|7/g, '');
                 setCenterLabel(updatedLabel);
               }
               
               // Update lastPlayedChordRef for MMK consistency
               lastPlayedChordRef.current = updatedLabel;
               
               // ✅ v3.15.3: Update keyboard display to match triad/7th
               const chordDef = CHORD_DEFINITIONS[fn];
               if (chordDef) {
                 const keyPc = NAME_TO_PC[renderKey];
                 const transposedTriad = chordDef.triad.map(pc => (pc + keyPc) % 12);
                 
                 let pcs: number[];
                 if (shouldHave7th && chordDef.seventh !== undefined) {
                   const transposedSeventh = (chordDef.seventh + keyPc) % 12;
                   pcs = [...transposedTriad, transposedSeventh];
                 } else {
                   pcs = transposedTriad;
                 }
                 
                 const rootPc = pcs[0];
                 const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
                 const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
                 setLatchedAbsNotes(fitted);
               }
               
               // Get the 7th note for this function
               const chordDef2 = CHORD_DEFINITIONS[fn];
               
               if (chordDef2 && chordDef2.seventh !== undefined && audioEnabledRef.current) {
                 const keyPc = NAME_TO_PC[renderKey];
                 const seventhPc = (chordDef2.seventh + keyPc) % 12;
                 
                 // Special case: For minor tonic chords (vi, iv in minor contexts),
                 // use root doubling instead of 7th for better harmonic minor sound
                 const isMinorTonic = (relMinorActiveRef.current && fn === "vi") || 
                                      (relMinorActiveRef.current && fn === "iv");
                 
                 if (shouldHave7th) {
                   // Add the 4th note
                   let fourthNoteMidi;
                   
                   if (isMinorTonic) {
                     // Use root note an octave down
                     const rootPc = chordDef2.triad[0];
                     const transposedRootPc = (rootPc + keyPc) % 12;
                     fourthNoteMidi = 48; // Start at C3
                     while ((fourthNoteMidi % 12) !== transposedRootPc) fourthNoteMidi++;
                     console.log('🎵 Using root doubling for minor tonic:', fourthNoteMidi);
                   } else {
                     // Normal 7th
                     fourthNoteMidi = 60;
                     while ((fourthNoteMidi % 12) !== seventhPc) fourthNoteMidi++;
                     while (fourthNoteMidi < 60) fourthNoteMidi += 12;
                     while (fourthNoteMidi > 72) fourthNoteMidi -= 12;
                   }
                   
                   console.log('➕ Adding 4th note:', fourthNoteMidi);
                   const noteId = playNote(fourthNoteMidi, 0.6, true);
                   if (noteId) {
                     activeChordNoteIdsRef.current.add(noteId);
                   }
                 } else {
                   // Remove the 4th note - replay triad
                   console.log('➖ Removing 4th note');
                   const triadPcs = chordDef2.triad.map(pc => (pc + keyPc) % 12);
                   playChordWithVoiceLeading(triadPcs);
                 }
               }
             }
           }}
           onPointerUp={()=>{
             // ✅ v3.17.85: Touch support
             console.log('🛑 Pointer up on wedge, releasing');
             wedgeHeldRef.current = false; // Release wedge
             currentHeldFnRef.current = null;
             lastPlayedWith7thRef.current = null; // Reset
             // Stop all active chord notes with fade
             const ctx = audioContextRef.current;
             if (ctx) {
               const now = ctx.currentTime;
               const releaseTime = 0.4; // Match keyboard release time
               activeChordNoteIdsRef.current.forEach(noteId => {
                 const nodes = activeNotesRef.current.get(noteId);
                 if (nodes) {
                   nodes.gain.gain.cancelScheduledValues(now);
                   nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                   nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
                   setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
                 }
               });
             }
           }}
           onPointerLeave={(e)=>{
             // ✅ v3.17.85: Touch support
             // If pointer button is still down, we're dragging - don't clear refs!
             if (e.buttons === 1) {
               console.log('🔄 Pointer button still down, keeping drag state');
               return;
             }
             
             // Pointer button released - actually leaving
             console.log('👋 Pointer left wedge and button released');
             wedgeHeldRef.current = false; // Release wedge
             currentHeldFnRef.current = null;
             lastPlayedWith7thRef.current = null; // Reset
             // Stop all active chord notes with fade
             const ctx = audioContextRef.current;
             if (ctx) {
               const now = ctx.currentTime;
               const releaseTime = 0.4;
               activeChordNoteIdsRef.current.forEach(noteId => {
                 const nodes = activeNotesRef.current.get(noteId);
                 if (nodes) {
                   nodes.gain.gain.cancelScheduledValues(now);
                   nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
                   nodes.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
                   setTimeout(() => stopNoteById(noteId), (releaseTime * 1000) + 50);
                 }
               });
             }
           }}>
          <path d={path} fill={fnFillColor(fn)} opacity={fillOpacity} stroke="#ffffff" strokeWidth={2}/>
          {isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={5} opacity={1} />}
          {isTrailing && !isActive && <path d={path} fill="none" stroke="#39FF14" strokeWidth={ringTrailWidth} opacity={ringTrailOpacity} />}
          {pulsingWedge === fn && <path d={path} fill="none" stroke="#FFFFFF" strokeWidth={8} opacity={0.8} style={{animation: 'pulse 0.3s ease-out'}} />}
          {SHOW_WEDGE_LABELS && (
            <text x={labelPos.x} y={labelPos.y-6} textAnchor="middle" fontSize={16}
              style={{ fill: FN_LABEL_COLORS[fn], fontWeight:600, paintOrder:"stroke", stroke:'#000', strokeWidth:0.9 }}>
              <tspan x={labelPos.x} dy={0}>{fnDisplay(fn)}</tspan>
              <tspan x={labelPos.x} dy={17} fontSize={13}>{realizeFunction(fn, labelKey)}</tspan>
            </text>
          )}
        </g>
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[layout, activeFn, trailFn, trailTick, trailOn, effectiveBaseKey, visitorActive, relMinorActive, subdomActive, labelKey, dimFadeOn, dimFadeTick, skillLevel, pulsingWedge]);

  const activeBtnStyle = (on:boolean, spaceColor?:string): React.CSSProperties =>
    ({padding:"6px 10px", border:`2px solid ${on ? (spaceColor || "#39FF14") : "#374151"}`, borderRadius:8, background:"#111", color:"#fff", cursor:"pointer"});

  /* ---------- Preview helper ---------- */
  const KBD_LOW=48, KBD_HIGH=71;
  
  // Configuration for radial click zones
  const SEVENTH_RADIUS_THRESHOLD = 0.75; // Inner 75% = 7th chords, outer 25% = triads (v3.5.0: increased for easier clicking)
  
  // Complete chord definitions for C major metaspace
  // Format: [root_pc, third_pc, fifth_pc, seventh_pc (optional)]
  const CHORD_DEFINITIONS: Record<Fn, {triad: number[], seventh?: number}> = {
    "I":     {triad: [0, 4, 7],   seventh: 11},  // C-E-G (B)  = Cmaj7
    "ii":    {triad: [2, 5, 9],   seventh: 0},   // D-F-A (C)  = Dm7
    "iii":   {triad: [4, 7, 11],  seventh: 2},   // E-G-B (D)  = Em7
    "IV":    {triad: [5, 9, 0],   seventh: 4},   // F-A-C (E)  = Fmaj7
    "iv":    {triad: [5, 8, 0],   seventh: 3},   // F-Ab-C (Eb) = Fm7
    "V":     {triad: [7, 11, 2]},                // G-B-D (no 7th) = G major triad
    "V7":    {triad: [7, 11, 2],  seventh: 5},   // G-B-D (F)  = G7
    "vi":    {triad: [9, 0, 4],   seventh: 7},   // A-C-E (G)  = Am7
    "♭VII":  {triad: [10, 2, 5]},                // Bb-D-F (no 7th)
    "V/V":   {triad: [2, 6, 9],   seventh: 0},   // D-F#-A (C) = D7
    "V/vi":  {triad: [4, 8, 11],  seventh: 2},   // E-G#-B (D) = E7
    "V/ii":  {triad: [9, 1, 4],   seventh: 7},   // A-C#-E (G) = A7
    "Bm7♭5": {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bm7b5 (vii°)
  };
  
  // Bonus wedge definitions
  const BONUS_CHORD_DEFINITIONS: Record<string, {triad: number[], seventh?: number}> = {
    "A7":    {triad: [9, 1, 4],   seventh: 7},   // A-C#-E (G) = A7 (V/ii)
    "Bm7♭5": {triad: [11, 2, 5],  seventh: 9},   // B-D-F (A)  = Bm7b5 (ii/vi, aka vii°)
  };
  
  const previewFn = (fn:Fn, include7thOverride?: boolean)=>{
    lastInputWasPreviewRef.current = true;
    const renderKey:KeyName = visitorActiveRef.current
      ? parKey
      : (subdomActiveRef.current ? subKey : baseKeyRef.current);
    
    // Determine if we should include the 7th
    let with7th: boolean;
    if (include7thOverride !== undefined) {
      with7th = include7thOverride; // From radial click zone
    } else {
      with7th = false; // Default to triads for now
    }
    
    // Get chord definition from table (these are relative to C major)
    const chordDef = CHORD_DEFINITIONS[fn];
    let pcs: number[];
    
    if (chordDef) {
      // Transpose the chord definition to the current key
      const keyPc = NAME_TO_PC[renderKey];
      const transposedTriad = chordDef.triad.map(pc => (pc + keyPc) % 12);
      
      if (with7th && chordDef.seventh !== undefined) {
        const transposedSeventh = (chordDef.seventh + keyPc) % 12;
        pcs = [...transposedTriad, transposedSeventh];
      } else {
        pcs = transposedTriad;
      }
      console.log('🎹 Preview:', fn, 'Key:', renderKey, 'with7th:', with7th, 'PCs:', pcs);
    } else {
      // Fallback to old method for any missing functions
      console.warn('⚠️ Function not in chord table, using fallback:', fn);
      pcs = preview.chordPcsForFn(fn, renderKey, with7th);
    }
    
    const rootPc = pcs[0];
    const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
    const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
    setLatchedAbsNotes(fitted);
    
    // ✅ v3.16.0: Update label based on ACTUAL notes played
    let chordLabel = realizeFunction(fn, renderKey);
    
    // Only add 7th suffix if we're actually playing with 7th
    if (with7th && chordDef && chordDef.seventh !== undefined) {
      // Add 7th suffix based on chord quality
      if (fn === "I" || fn === "IV") {
        chordLabel += "maj7";
      } else if (fn === "V7") {
        // V7 always shows as V7 (name already has it)
      } else if (fn === "V/V" || fn === "V/vi" || fn === "V/ii") {
        // Secondary dominants: show "D7" when with7th, "D" when triad
        if (!chordLabel.endsWith("7")) {
          chordLabel += "7";
        }
      } else if (fn === "ii" || fn === "iii" || fn === "vi" || fn === "iv") {
        chordLabel += "7";
      } else if (fn === "♭VII") {
        chordLabel += "7";
      }
    } else if (fn === "V7") {
      // Special case: V7 played as triad should show as "G" not "G7"
      chordLabel = chordLabel.replace("7", "");
    }
    
    setActiveWithTrail(fn, chordLabel);
    
    if (audioEnabledRef.current) {
      playChordWithVoiceLeading(pcs);
    }
    
    // Check if this wedge click should trigger a space rotation (with 600ms delay)
    console.log('🔍 previewFn called. fn:', fn, 'Space:', {
      sub: subdomActiveRef.current,
      rel: relMinorActiveRef.current, 
      par: visitorActiveRef.current
    });
    
    setTimeout(() => {
      console.log('🔍 setTimeout fired after 600ms. fn:', fn);
      
      // === SUB SPACE EXITS ===
      if (subdomActiveRef.current) {
        // iii (Am in F) → HOME (vi in C)
        if (fn === "iii") {
          console.log('🔄 iii wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 400);
        }
        // I in SUB (F) → HOME (IV in C)
        else if (fn === "I") {
          console.log('🔄 I wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("IV");
            console.log('✨ Highlighted IV wedge');
          }, 400);
        }
        // V7 in SUB (C) → HOME (I in C)
        else if (fn === "V7") {
          console.log('🔄 V7 wedge in SUB → returning to HOME');
          setSubdomActive(false);
          subdomLatchedRef.current = false;
          subExitCandidateSinceRef.current = null;
          subSpinExit();
          setTimeout(() => {
            setActiveFn("I");
            console.log('✨ Highlighted I wedge');
          }, 400);
        }
      }
      
      // === REL SPACE EXITS ===
      else if (relMinorActiveRef.current) {
        // I in REL (Am) → HOME (vi in C)
        if (fn === "I") {
          console.log('🔄 I wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("vi");
            console.log('✨ Highlighted vi wedge');
          }, 200);
        }
        // ♭VII in REL (G) → HOME (V7 in C)  
        else if (fn === "♭VII") {
          console.log('🔄 ♭VII wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("V7");
            console.log('✨ Highlighted V7 wedge');
          }, 200);
        }
        // iv in REL (Dm) → HOME (ii in C)
        else if (fn === "iv") {
          console.log('🔄 iv wedge in REL → returning to HOME');
          setRelMinorActive(false);
          setTimeout(() => {
            setActiveFn("ii");
            console.log('✨ Highlighted ii wedge');
          }, 200);
        }
      }
      
      // ✅ v3.17.22: Removed incorrect PAR exit logic
      // PAR space I wedge (Eb in C minor) should NOT exit to HOME
      // Users stay in PAR unless they play a diatonic HOME chord
      
      // Other space rotation logic can be added here
    }, 600); // 600ms delay so chord doesn't move under cursor
  };

  /* ---------- Render ---------- */
  const currentGuitarLabel = (() => {
    // Priority 1: If bonus wedge is active, use bonusLabel
    if (bonusActive && bonusLabel) {
      return bonusLabel;
    }
    // Priority 2: If active function from main wheel
    if (activeFnRef.current){
      const dispKey = (visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current)) as KeyName;
      return realizeFunction(activeFnRef.current as Fn, dispKey) || null;
    }
    // Priority 3: Fall back to center label from MIDI/manual play
    return centerLabel || null;
  })();

  /* ---------- Audio Synthesis (Vintage Rhodes) ---------- */
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // ✅ v3.17.85: Resume audio context on mobile (required by iOS/Android)
    if (audioContextRef.current.state === 'suspended') {
      console.log('🔊 Audio context suspended, resuming...');
      audioContextRef.current.resume().then(() => {
        console.log('✅ Audio context resumed successfully');
      }).catch(err => {
        console.error('❌ Failed to resume audio context:', err);
      });
    }
    return audioContextRef.current;
  };

  const playNote = (midiNote: number, velocity: number = 0.5, isChordNote: boolean = false) => {
    console.log('🎵 playNote START:', {midiNote, velocity, isChordNote, audioEnabledState: audioEnabled, audioEnabledRef: audioEnabledRef.current});
    
    if (!audioEnabledRef.current) {  // Use ref instead of state!
      console.log('❌ Audio disabled, returning');
      return;
    }
    
    console.log('🔊 Initializing audio context...');
    const ctx = initAudioContext();
    console.log('🔊 Context state:', ctx.state, 'Sample rate:', ctx.sampleRate);
    
    if (ctx.state === 'suspended') {
      console.log('⚠️ Context suspended, attempting resume...');
      ctx.resume();
    }
    
    // Generate unique ID for this note instance (allows same MIDI note multiple times)
    const noteId = `${midiNote}-${Date.now()}-${Math.random()}`;
    console.log('🆔 Generated note ID:', noteId);
    
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = ctx.currentTime;
    console.log('📊 Frequency:', freq.toFixed(2), 'Hz, Time:', now.toFixed(3));
    
    // Simplified Rhodes - 2 oscillators for cleaner sound
    console.log('🎹 Creating oscillators...');
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.003;
    
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    gain1.gain.value = 0.5 * velocity;
    gain2.gain.value = 0.4 * velocity;
    
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0;
    // ✅ v3.17.85: Reduced to prevent clipping (chords = multiple notes adding up)
    const mobileBoost = !isDesktop ? 1.5 : 1.0;
    const chordSafety = 0.5; // Divide by 2 since chords can have 3-4 notes
    mainGain.gain.linearRampToValueAtTime(0.6 * velocity * mobileBoost * chordSafety, now + 0.015);
    mainGain.gain.linearRampToValueAtTime(0.45 * velocity * mobileBoost * chordSafety, now + 0.08);
    mainGain.gain.linearRampToValueAtTime(0.4 * velocity * mobileBoost * chordSafety, now + 0.3);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 8000 + (midiNote * 50); // Very bright - almost no filtering
    filter.Q.value = 0.2; // Minimal resonance
    
    console.log('🔗 Connecting audio graph...');
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);
    
    console.log('▶️ Starting oscillators...');
    try {
      osc1.start(now);
      osc2.start(now);
      console.log('✅ Oscillators started successfully!');
    } catch(err) {
      console.error('❌ Error starting oscillators:', err);
      return;
    }
    
    activeNotesRef.current.set(noteId, {osc1, osc2, osc3: osc1, gain: mainGain});
    console.log('💾 Stored note. Active count:', activeNotesRef.current.size);
    
    // Shorter sustain times
    if (isChordNote) {
      // Chord notes: check if wedge is being held
      if (wedgeHeldRef.current) {
        // Don't auto-fade - will be stopped on mouse up
        console.log('🎹 Wedge held - no auto-fade');
      } else {
        // Normal fade after 1.5 seconds
        const fadeStart = now + 1.5;
        mainGain.gain.linearRampToValueAtTime(0, fadeStart + 0.15);
        setTimeout(() => stopNoteById(noteId), 1700);
      }
    } else {
      // MIDI keyboard notes: sustain indefinitely until note-off
      // Attack -> Decay -> Sustain (hold)
      const decayTime = now + 0.05; // Quick decay
      mainGain.gain.linearRampToValueAtTime(0.7 * velocity, decayTime); // Drop to sustain level
      // No auto-fade! Will be stopped by MIDI note-off
      console.log('🎹 MIDI note - sustaining until note-off');
    }
    
    console.log('✅ playNote COMPLETE, returning ID:', noteId);
    return noteId; // Return ID so we can stop this specific instance
  };

  const stopNoteById = (noteId: string) => {
    const nodes = activeNotesRef.current.get(noteId);
    if (nodes && audioContextRef.current) {
      try {
        const now = audioContextRef.current.currentTime;
        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
        nodes.gain.gain.linearRampToValueAtTime(0, now + 0.5); // Lengthened from 0.05 to 0.5
        
        setTimeout(() => {
          try {
            nodes.osc1.stop();
            nodes.osc2.stop();
            nodes.osc3.stop();
          } catch(e) { /* already stopped */ }
          activeNotesRef.current.delete(noteId);
        }, 550); // Updated timeout to match release
      } catch(e) { /* ignore */ }
    }
  };

  const stopNote = (midiNote: number) => {
    // Stop all instances of this MIDI note
    const noteIdsToStop: string[] = [];
    activeNotesRef.current.forEach((_, noteId) => {
      if (noteId.startsWith(`${midiNote}-`)) {
        noteIdsToStop.push(noteId);
      }
    });
    noteIdsToStop.forEach(id => stopNoteById(id));
  };

  const playChord = (midiNotes: number[], duration: number = 1.0) => {
    if (!audioEnabled) return;
    
    // Stop all currently playing notes first for quick cutoff
    const activeNotes = Array.from(activeNotesRef.current.keys());
    activeNotes.forEach(noteId => stopNoteById(noteId));
    
    // Play new notes
    const noteIds: string[] = [];
    midiNotes.forEach(note => {
      const id = playNote(note, 0.4, true); // Mark as chord note
      if (id) noteIds.push(id);
    });
    
    // Auto-release after duration
    setTimeout(() => {
      noteIds.forEach(id => stopNoteById(id));
    }, duration * 1000);
  };

  // ✅ v3.17.0: MIDI Output - Send notes to external device
  const activeMidiNotesRef = useRef<Set<number>>(new Set());
  
  const sendMidiNoteOn = (note: number, velocity: number = 100) => {
    if (!midiOutputEnabled || !midiOutputRef.current) return;
    try {
      // MIDI note on: [0x90 = note on channel 1, note, velocity]
      midiOutputRef.current.send([0x90, note, velocity]);
      activeMidiNotesRef.current.add(note);
      console.log('📤 MIDI OUT: Note ON', note, 'vel', velocity);
    } catch (e) {
      console.error('Failed to send MIDI:', e);
    }
  };
  
  const sendMidiNoteOff = (note: number) => {
    if (!midiOutputEnabled || !midiOutputRef.current) return;
    try {
      // MIDI note off: [0x80 = note off channel 1, note, velocity 0]
      midiOutputRef.current.send([0x80, note, 0]);
      activeMidiNotesRef.current.delete(note);
      console.log('📤 MIDI OUT: Note OFF', note);
    } catch (e) {
      console.error('Failed to send MIDI:', e);
    }
  };
  
  const stopAllMidiNotes = () => {
    activeMidiNotesRef.current.forEach(note => sendMidiNoteOff(note));
    activeMidiNotesRef.current.clear();
  };

  // ✅ v3.17.85: Song sharing via URL
  const encodeSongToURL = () => {
    const songData = {
      text: inputText,
      key: baseKey,
      title: "Shared Song"
    };
    const json = JSON.stringify(songData);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    // ✅ v3.17.85: Use beatkitchen.io/harmony instead of current origin
    const url = `https://beatkitchen.io/harmony?song=${base64}`;
    return url;
  };

  const decodeSongFromURL = (base64: string) => {
    try {
      // Clean the base64 string - remove any leading/trailing whitespace or characters
      const cleanBase64 = base64.trim().replace(/[^A-Za-z0-9+/=]/g, '');
      
      const json = decodeURIComponent(escape(atob(cleanBase64)));
      console.log('🔍 Decoded JSON:', json);
      
      const songData = JSON.parse(json);
      console.log('🔍 Parsed songData:', songData);
      
      // Validate it's an object with text property
      if (typeof songData !== 'object' || !songData.text) {
        console.error('Invalid song data format');
        return null;
      }
      
      return songData;
    } catch (e) {
      console.error('Failed to decode song:', e);
      return null;
    }
  };

  const handleShareSong = () => {
    const url = encodeSongToURL();
    console.log('📤 Attempting to copy URL:', url);
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          console.log('✅ Copied via navigator.clipboard');
          setShareURL(url);
          setShowShareCopied(true);
          setTimeout(() => setShowShareCopied(false), 3000);
        })
        .catch((err) => {
          console.error('❌ Clipboard API failed:', err);
          // Fallback: try execCommand
          fallbackCopyToClipboard(url);
        });
    } else {
      // Fallback for older browsers
      console.log('⚠️ navigator.clipboard not available, using fallback');
      fallbackCopyToClipboard(url);
    }
  };
  
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      console.log(successful ? '✅ Copied via execCommand' : '❌ execCommand failed');
      if (successful) {
        setShareURL(text);
        setShowShareCopied(true);
        setTimeout(() => setShowShareCopied(false), 3000);
      }
    } catch (err) {
      console.error('❌ Fallback copy failed:', err);
      alert('Could not copy to clipboard. Please copy this URL manually:\n\n' + text);
    }
    
    document.body.removeChild(textArea);
  };

  const playChordWithVoiceLeading = (chordPitchClasses: number[]) => {
    if (!audioEnabledRef.current && !midiOutputEnabled) return;  // Skip if both disabled
    
    console.log('🎼 Playing chord. PCs:', chordPitchClasses);
    
    // Simple approach: play each pitch class in a reasonable octave range
    const BASE_OCTAVE = 60; // C4
    const notesToPlay: number[] = [];
    
    // Convert pitch classes to actual MIDI notes in a comfortable range
    chordPitchClasses.forEach(pc => {
      // Find this pitch class near C4
      let midiNote = BASE_OCTAVE;
      while ((midiNote % 12) !== pc) {
        midiNote++;
        if (midiNote > BASE_OCTAVE + 12) {
          // Wrapped around, start from below
          midiNote = BASE_OCTAVE - 12;
          while ((midiNote % 12) !== pc && midiNote < BASE_OCTAVE + 12) {
            midiNote++;
          }
          break;
        }
      }
      notesToPlay.push(midiNote);
    });
    
    // Sort notes low to high
    notesToPlay.sort((a, b) => a - b);
    console.log('🎵 MIDI notes to play:', notesToPlay);
    
    // ✅ v3.17.0: Send to MIDI output if enabled
    if (midiOutputEnabled) {
      stopAllMidiNotes(); // Stop previous chord
      notesToPlay.forEach(note => sendMidiNoteOn(note, 100));
    }
    
    // Internal audio playback
    if (audioEnabledRef.current) {
      const ctx = audioContextRef.current;
      if (ctx) {
        const now = ctx.currentTime;
        const FAST_FADE = 0.1;
        
        // Stop ALL previous chord notes
        console.log('🔇 Stopping', activeChordNoteIdsRef.current.size, 'previous notes');
        activeChordNoteIdsRef.current.forEach(noteId => {
          const nodes = activeNotesRef.current.get(noteId);
          if (nodes) {
            nodes.gain.gain.cancelScheduledValues(now);
            nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
            nodes.gain.gain.linearRampToValueAtTime(0, now + FAST_FADE);
            setTimeout(() => stopNoteById(noteId), FAST_FADE * 1000 + 50);
          }
        });
        
        activeChordNoteIdsRef.current.clear();
        
        // Play all notes
        console.log('🔊 Playing', notesToPlay.length, 'notes');
        notesToPlay.forEach(note => {
          const noteId = playNote(note, 0.6, true);
          if (noteId) {
            activeChordNoteIdsRef.current.add(noteId);
          }
        });
      }
    }
    
    previousVoicingRef.current = notesToPlay;
  };

  // Calculate notes to highlight on keyboard for current chord
  const keyboardHighlightNotes = (() => {
    // Priority 1: If from preview/playlist, show yellow highlights
    if (latchedAbsNotes.length > 0 && lastInputWasPreviewRef.current) {
      return new Set(latchedAbsNotes);
    }
    // Priority 2: If active function but no manual play, AND in preview mode, calculate root position
    // ✅ v3.15.1: Only show canonical voicing for wedge clicks, not MIDI input
    if (activeFnRef.current && rightHeld.current.size === 0 && lastInputWasPreviewRef.current) {
      const dispKey = (visitorActiveRef.current ? parKey : (subdomActiveRef.current ? subKey : baseKeyRef.current)) as KeyName;
      const fn = activeFnRef.current as Fn;
      const with7th = PREVIEW_USE_SEVENTHS || fn === "V7" || fn === "V/V" || fn === "V/vi";
      const pcs = preview.chordPcsForFn(fn, dispKey, with7th);
      
      // ✅ v3.17.6: Safety check - if preview module doesn't know this chord, use CHORD_DEFINITIONS
      if (!pcs || pcs.length === 0) {
        const chordDef = CHORD_DEFINITIONS[fn];
        if (chordDef) {
          const keyPc = NAME_TO_PC[dispKey];
          const transposedPcs = chordDef.triad.map(pc => (pc + keyPc) % 12);
          const rootPc = transposedPcs[0];
          const absRootPos = preview.absChordRootPositionFromPcs(transposedPcs, rootPc);
          const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
          return new Set(fitted);
        }
        return new Set<number>(); // Fallback if chord unknown
      }
      
      const rootPc = pcs[0];
      const absRootPos = preview.absChordRootPositionFromPcs(pcs, rootPc);
      const fitted = preview.fitNotesToWindowPreserveInversion(absRootPos, KBD_LOW, KBD_HIGH);
      return new Set(fitted);
    }
    // Don't show yellow highlights for manual MIDI play - only blue (disp) handles that
    return new Set<number>();
  })();

  return (
    <div style={{
      background:'#111', 
      color:'#fff', 
      height: isDesktop ? '100vh' : 'auto',  // ✅ v3.17.92: Changed from minHeight to height
      overflow: isDesktop ? 'hidden' : 'hidden',  // ✅ v3.17.90: Prevent scroll in iframe
      padding: isDesktop ? 0 : 0,  // ✅ v3.17.90: No padding to prevent iframe scrollbar
      fontFamily:'ui-sans-serif, system-ui', 
      userSelect:'none',
      WebkitUserSelect:'none',
      WebkitTouchCallout:'none',
      MozUserSelect:'none',
      msUserSelect:'none',
      touchAction: 'pan-y' // ✅ v3.17.85: Allow vertical scrolling on background
    }}>
      {/* ✅ v3.17.85: iOS Audio Prompt with silent note trick */}
      {showAudioPrompt && (
        <div
          onClick={() => {
            const ctx = initAudioContext();
            ctx.resume().then(() => {
              // Play silent note to fully unlock
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              gain.gain.value = 0.001;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.01);
              
              setAudioInitialized(true);
              setAudioEnabled(true);
              audioEnabledRef.current = true;
              setShowAudioPrompt(false);
            });
          }}
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            background: '#1a1a1a',
            border: '2px solid #39FF14',
            borderRadius: 12,
            padding: 20,
            zIndex: 99999,
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔊</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Tap to Enable Sound</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>iOS requires user interaction to play audio</div>
        </div>
      )}
      
      {/* ✅ v3.17.85: Share Modal */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: '2px solid #60A5FA',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
              Share This Song
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>
              {songTitle || 'Your sequence'} will be shared via URL
            </div>
            
            <button
              onClick={() => {
                handleShareSong();
                setShowShareModal(false);
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#60A5FA',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12
              }}
            >
              📋 Copy Link to Clipboard
            </button>
            
            <button
              onClick={() => setShowShareModal(false)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'transparent',
                border: '2px solid #374151',
                borderRadius: 8,
                color: '#9CA3AF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {showShareCopied && (
              <div style={{
                marginTop: 16,
                padding: '8px 12px',
                background: '#1a3310',
                border: '1px solid #39FF14',
                borderRadius: 6,
                color: '#39FF14',
                fontSize: 14
              }}>
                ✓ Link copied! Send it to anyone.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{
        width: isDesktop ? '100%' : '100vw',
        maxWidth: isDesktop ? 900 : 'none',
        margin:'0 auto', 
        border: isDesktop ? '1px solid #374151' : 'none',
        borderRadius: isDesktop ? 12 : 0,
        padding: isDesktop ? 8 : 4,
        minHeight:'fit-content',
        overflow: isDesktop ? 'visible' : 'hidden',
        position:'relative',
        fontSize: isDesktop ? '16px' : 'min(2.2vw, 16px)',
        boxSizing: 'border-box',
        userSelect:'none',
        WebkitUserSelect:'none',
        WebkitTouchCallout:'none'
      }}>

        {/* ✅ v3.17.85: Legend - moved up to reduce overlap */}
        {isDesktop && (
          <div style={{
            position:'absolute',
            top:90,
            left:140,
            background:'#1a1a1a',
            border:'2px solid #4B5563',
            borderRadius:8,
            padding:'10px',
            width:110,
            fontSize:10,
            pointerEvents:'none'
          }}>
          <div style={{fontWeight:600, marginBottom:6, color:'#9CA3AF', fontSize:9, textTransform:'uppercase', letterSpacing:'0.05em'}}>
            Function
          </div>
          
          {(() => {
            const fn = activeFn;
            const isTonic = fn === 'I' || fn === 'iii' || fn === 'vi';
            const isPredom = fn === 'ii' || fn === 'IV' || fn === 'iv';
            const isDom = fn === 'V7' || fn === 'V/V' || fn === 'V/vi' || fn === 'V/ii' || fn === '♭VII';
            
            return (
              <>
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isTonic ? '#33280a' : 'transparent',
                  border: isTonic ? '1px solid #F2D74B' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#F2D74B',
                    border:'1px solid #F9E89B',
                    flexShrink:0
                  }}/>
                  <span style={{color: isTonic ? '#F2D74B' : '#9CA3AF', fontSize:10}}>
                    Tonic
                  </span>
                </div>
                
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isPredom ? '#082f49' : 'transparent',
                  border: isPredom ? '1px solid #0EA5E9' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#0EA5E9',
                    border:'1px solid #38BDF8',
                    flexShrink:0
                  }}/>
                  <span style={{color: isPredom ? '#0EA5E9' : '#9CA3AF', fontSize:10}}>
                    {skillLevel === 'ROOKIE' || skillLevel === 'NOVICE' || skillLevel === 'SOPHOMORE' 
                      ? 'Subdominant' 
                      : 'Predominant'}
                  </span>
                </div>
                
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:6,
                  marginBottom:5,
                  padding:'3px 5px',
                  borderRadius:4,
                  background: isDom ? '#4a1d07' : 'transparent',
                  border: isDom ? '1px solid #E63946' : '1px solid transparent'
                }}>
                  <div style={{
                    width:10,
                    height:10,
                    borderRadius:'50%',
                    background:'#E63946',
                    border:'1px solid #F87171',
                    flexShrink:0
                  }}/>
                  <span style={{color: isDom ? '#E63946' : '#9CA3AF', fontSize:10}}>
                    Dominant
                  </span>
                </div>
                
                <div style={{
                  marginTop:8,
                  paddingTop:6,
                  borderTop:'1px solid #374151',
                  fontSize:8,
                  color:'#6b7280',
                  fontStyle:'italic',
                  lineHeight:1.4
                }}>
                  <div>Z: Reset wheel</div>
                  <div>H: HOME</div>
                  <div>R: REL</div>
                  <div>S: SUB</div>
                  <div>P: PAR</div>
                </div>
              </>
            );
          })()}
          </div>
        )}

        {/* BKS Logo Header with Emblem + Help Button - v3.17.85: High z-index */}
        <div style={{marginBottom:0, position:'relative', zIndex:10002, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div style={{position:'relative', marginLeft: isDesktop ? 140 : '2%'}}>
            <svg width="300" height="44" viewBox="0 0 400 70" preserveAspectRatio="xMinYMin meet" style={{opacity:0.85, display:'block'}}>
            <g transform="matrix(0.733705,0,0,0.733705,2.67091,-1.60525)">
              <g transform="matrix(-1,0,0,1,99.7819,4.76996e-06)">
                <circle cx="49.891" cy="49.891" r="44.3" style={{fill:'none', stroke:'#e5e7eb', strokeWidth:'3.7px'}}/>
              </g>
              <g transform="matrix(1,0,0,1,4.76996e-06,-0.221515)">
                <path d="M22.769,50.112L22.769,60.376C22.769,61.058 22.928,61.731 23.233,62.341C24.788,65.452 29.171,65.607 30.942,62.613L31.164,62.238C31.586,61.524 31.81,60.71 31.81,59.88L31.81,31.824C31.81,31.07 32,30.329 32.363,29.669C34.159,26.403 38.926,26.636 40.394,30.062L40.48,30.263C40.725,30.833 40.85,31.447 40.85,32.067L40.85,75.405C40.85,75.719 40.884,76.036 40.949,76.343C41.977,81.205 48.978,81.156 49.825,76.26C49.868,76.006 49.891,75.749 49.891,75.491L49.891,24.704C49.891,24.466 49.91,24.228 49.948,23.993C50.779,18.798 58.321,19.001 58.872,24.233L58.932,24.798L58.932,68.208C58.932,68.796 59.046,69.378 59.268,69.923L59.325,70.064C60.898,73.924 66.424,73.743 67.742,69.79C67.895,69.331 67.972,68.852 67.972,68.369L67.972,40.098C67.972,39.256 68.205,38.432 68.643,37.714L68.75,37.539C70.576,34.551 74.976,34.738 76.542,37.87C76.852,38.49 77.013,39.172 77.013,39.864L77.013,50.112" style={{fill:'none', stroke:'#e5e7eb', strokeWidth:'3.7px'}}/>
              </g>
              <g transform="matrix(1,0,0,1,4.76996e-06,-1.523e-05)">
                {/* BEAT */}
                <g transform="matrix(60.3825,0,0,60.3825,102.739,71.3567)">
                  <path d="M0.083,-0L0.083,-0.711L0.315,-0.711C0.389,-0.711 0.447,-0.695 0.489,-0.663C0.531,-0.631 0.552,-0.583 0.552,-0.519C0.552,-0.488 0.543,-0.461 0.524,-0.436C0.505,-0.412 0.48,-0.394 0.449,-0.381C0.495,-0.374 0.532,-0.354 0.559,-0.32C0.587,-0.286 0.6,-0.247 0.6,-0.201C0.6,-0.136 0.579,-0.086 0.537,-0.052C0.494,-0.017 0.437,-0 0.365,-0L0.083,-0ZM0.179,-0.333L0.179,-0.075L0.365,-0.075C0.409,-0.075 0.443,-0.086 0.467,-0.108C0.491,-0.129 0.503,-0.16 0.503,-0.2C0.503,-0.239 0.491,-0.271 0.466,-0.295C0.442,-0.319 0.408,-0.332 0.366,-0.333L0.179,-0.333ZM0.179,-0.409L0.335,-0.409C0.371,-0.409 0.4,-0.419 0.422,-0.438C0.445,-0.458 0.456,-0.485 0.456,-0.521C0.456,-0.559 0.444,-0.588 0.42,-0.607C0.395,-0.626 0.361,-0.635 0.315,-0.635L0.179,-0.635L0.179,-0.409Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,141.127,71.3567)">
                  <path d="M0.471,-0.33L0.179,-0.33L0.179,-0.075L0.521,-0.075L0.521,-0L0.083,-0L0.083,-0.711L0.516,-0.711L0.516,-0.635L0.179,-0.635L0.179,-0.405L0.471,-0.405L0.471,-0.33Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,174.444,71.3567)">
                  <path d="M0.45,-0.183L0.183,-0.183L0.119,-0L0.021,-0L0.277,-0.711L0.36,-0.711L0.611,-0L0.513,-0L0.45,-0.183ZM0.21,-0.264L0.423,-0.264L0.319,-0.569L0.316,-0.569L0.21,-0.264Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,208.822,71.3567)">
                  <path d="M0.58,-0.635L0.346,-0.635L0.346,-0L0.25,-0L0.25,-0.635L0.018,-0.635L0.018,-0.711L0.58,-0.711L0.58,-0.635Z" style={{fill:'#e5e7eb'}}/>
                </g>
                {/* KITCHEN */}
                <g transform="matrix(60.3825,0,0,60.3825,259.947,71.3567)">
                  <path d="M0.242,-0.321L0.179,-0.321L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.179,-0.396L0.232,-0.396L0.496,-0.711L0.604,-0.711L0.605,-0.708L0.317,-0.372L0.625,-0.002L0.625,-0L0.508,-0L0.242,-0.321Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,298.335,71.3567)">
                  <rect x="0.093" y="-0.711" width="0.097" height="0.711" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,314.551,71.3567)">
                  <path d="M0.58,-0.635L0.346,-0.635L0.346,-0L0.25,-0L0.25,-0.635L0.018,-0.635L0.018,-0.711L0.58,-0.711L0.58,-0.635Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,349.843,71.3567)">
                  <path d="M0.59,-0.228L0.591,-0.225C0.593,-0.158 0.569,-0.102 0.521,-0.057C0.473,-0.012 0.409,0.01 0.33,0.01C0.25,0.01 0.184,-0.018 0.134,-0.075C0.083,-0.132 0.058,-0.204 0.058,-0.292L0.058,-0.418C0.058,-0.506 0.083,-0.578 0.134,-0.635C0.184,-0.693 0.25,-0.721 0.33,-0.721C0.41,-0.721 0.474,-0.7 0.522,-0.657C0.569,-0.614 0.593,-0.557 0.591,-0.487L0.59,-0.484L0.498,-0.484C0.498,-0.534 0.483,-0.573 0.454,-0.602C0.425,-0.631 0.383,-0.646 0.33,-0.646C0.276,-0.646 0.234,-0.624 0.202,-0.581C0.17,-0.537 0.154,-0.484 0.154,-0.419L0.154,-0.292C0.154,-0.227 0.17,-0.173 0.202,-0.13C0.234,-0.087 0.276,-0.065 0.33,-0.065C0.383,-0.065 0.425,-0.079 0.454,-0.108C0.483,-0.137 0.498,-0.177 0.498,-0.228L0.59,-0.228Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,388.084,71.3567)">
                  <path d="M0.621,-0L0.524,-0L0.524,-0.314L0.179,-0.314L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.179,-0.39L0.524,-0.39L0.524,-0.711L0.621,-0.711L0.621,-0Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,430.57,71.3567)">
                  <path d="M0.471,-0.33L0.179,-0.33L0.179,-0.075L0.521,-0.075L0.521,-0L0.083,-0L0.083,-0.711L0.516,-0.711L0.516,-0.635L0.179,-0.635L0.179,-0.405L0.471,-0.405L0.471,-0.33Z" style={{fill:'#e5e7eb'}}/>
                </g>
                <g transform="matrix(60.3825,0,0,60.3825,463.887,71.3567)">
                  <path d="M0.621,-0L0.524,-0L0.182,-0.543L0.179,-0.542L0.179,-0L0.083,-0L0.083,-0.711L0.179,-0.711L0.521,-0.168L0.524,-0.169L0.524,-0.711L0.621,-0.711L0.621,-0Z" style={{fill:'#e5e7eb'}}/>
                </g>
                {/* ® Symbol */}
                <g transform="matrix(35.2026,0,0,35.2026,506.403,51.2485)">
                  <path d="M0.043,-0.356C0.043,-0.458 0.077,-0.545 0.144,-0.615C0.211,-0.686 0.293,-0.721 0.39,-0.721C0.486,-0.721 0.567,-0.686 0.635,-0.615C0.702,-0.545 0.736,-0.458 0.736,-0.356C0.736,-0.253 0.702,-0.166 0.635,-0.096C0.567,-0.025 0.485,0.01 0.39,0.01C0.293,0.01 0.211,-0.025 0.144,-0.096C0.077,-0.166 0.043,-0.253 0.043,-0.356ZM0.102,-0.356C0.102,-0.269 0.13,-0.197 0.186,-0.137C0.242,-0.078 0.31,-0.049 0.39,-0.049C0.469,-0.049 0.537,-0.078 0.593,-0.138C0.649,-0.197 0.677,-0.27 0.677,-0.356C0.677,-0.442 0.649,-0.514 0.593,-0.573C0.537,-0.632 0.469,-0.661 0.39,-0.661C0.31,-0.661 0.242,-0.632 0.186,-0.573C0.13,-0.514 0.102,-0.442 0.102,-0.356ZM0.319,-0.319L0.319,-0.154L0.246,-0.154L0.246,-0.569L0.383,-0.569C0.432,-0.569 0.471,-0.559 0.499,-0.537C0.527,-0.516 0.542,-0.485 0.542,-0.444C0.542,-0.424 0.536,-0.406 0.525,-0.391C0.515,-0.375 0.499,-0.363 0.479,-0.353C0.5,-0.344 0.516,-0.331 0.525,-0.314C0.535,-0.297 0.54,-0.276 0.54,-0.251L0.54,-0.224C0.54,-0.211 0.54,-0.199 0.541,-0.188C0.542,-0.178 0.545,-0.169 0.548,-0.162L0.548,-0.154L0.473,-0.154C0.47,-0.161 0.468,-0.171 0.468,-0.184C0.467,-0.198 0.467,-0.211 0.467,-0.225L0.467,-0.251C0.467,-0.274 0.461,-0.292 0.45,-0.303C0.44,-0.314 0.422,-0.319 0.396,-0.319L0.319,-0.319ZM0.319,-0.383L0.393,-0.383C0.414,-0.383 0.432,-0.388 0.447,-0.399C0.462,-0.409 0.469,-0.423 0.469,-0.441C0.469,-0.465 0.463,-0.482 0.45,-0.491C0.437,-0.501 0.415,-0.506 0.383,-0.506L0.319,-0.506L0.319,-0.383Z" style={{fill:'#e5e7eb'}}/>
                </g>
              </g>
            </g>
          </svg>
          <div style={{fontSize:11, fontWeight:500, color:'#9CA3AF', marginTop:0}}>
            HarmonyWheel {HW_VERSION}
          </div>
          </div>
          
          {/* Skill Wheel only - top right - v3.17.85: High z-index for clickability */}
          <div style={{
            display:'flex', 
            alignItems:'flex-start', 
            position:'absolute',
            right: isDesktop ? 200 : 8,
            top: 0,
            zIndex:10001
          }}>
            {/* Circular Skill Selector */}
            <SkillWheel current={skillLevel} onChange={setSkillLevel} />
          </div>
        </div>

        {/* Wheel - v3.17.85: Bigger on mobile, matches keyboard width */}
        <div style={{position:'relative', width:'100%', maxWidth:WHEEL_W, margin:'0 auto', marginTop:-30, zIndex:1000}}>

        {/* Wheel - centered as before */}
        <div className="relative"
             style={{
               width:'100%',
               maxWidth:WHEEL_W,
               aspectRatio: '1/1',
               margin:'0 auto', 
               marginTop:-30,
               transform: isDesktop ? `scale(1.15)` : 'scale(1.1)',
               transformOrigin:'center top',
               position:'relative',
               zIndex:10
             }}>
          <div style={{...wrapperStyle, position:'relative', zIndex:10}}>
            <svg width="100%" height="100%" viewBox={`0 0 ${WHEEL_W} ${WHEEL_H}`} className="select-none" style={{display:'block', userSelect: 'none', WebkitUserSelect: 'none', position:'relative', zIndex:10, maxWidth:'100%', maxHeight:'100%', touchAction:'pan-y'}}>
  {/* ✅ v3.17.85: Black backing circle - pointer-events none for scrolling */}
  <circle cx={260} cy={260} r={224} fill="#111" style={{pointerEvents: 'none'}} />
  
  {/* Labels moved to status bar area */}

  {wedgeNodes}

              {/* Hub */}
              <circle 
                cx={260} 
                cy={260} 
                r={220*HUB_RADIUS} 
                fill={HUB_FILL} 
                stroke={HUB_STROKE} 
                strokeWidth={HUB_STROKE_W}
              />
              
              {SHOW_CENTER_LABEL && centerLabel && (
                <text 
                  x={260} 
                  y={260+8}
                  textAnchor="middle" 
                  style={{
                    fontFamily: CENTER_FONT_FAMILY, 
                    paintOrder:"stroke", 
                    stroke:"#000", 
                    strokeWidth:1.2 as any,
                    pointerEvents: 'none'
                  }} 
                  fontSize={CENTER_FONT_SIZE} 
                  fill={CENTER_FILL}
                >
                  {centerLabel}
                </text>
              )}

              {/* Bonus overlay + trailing */}
              {/* (kept exactly as in your v2.30.0 block) */}
              {/* 
              {/* -------- BEGIN BONUS BLOCK -------- */}
{/* Persistent bonus wedges when toggle is on (50% opacity) - EXPERT only */}
{showBonusWedges && !bonusActive && skillLevel === "EXPERT" && (() => {
  const toRad = (deg:number) => (deg - 90) * Math.PI/180;
  const arc = (cx:number, cy:number, r:number, a0:number, a1:number) => {
    const x0 = cx + r * Math.cos(toRad(a0));
    const y0 = cy + r * Math.sin(toRad(a0));
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const large = Math.abs(a1-a0) > 180 ? 1 : 0;
    const sweep = a1 > a0 ? 1 : 0;
    return {x0,y0,x1,y1,large,sweep};
  };
  const ring = (cx:number, cy:number, r0:number, r1:number, a0:number, a1:number) => {
    const o = arc(cx,cy,r1,a0,a1);
    const i = arc(cx,cy,r0,a1,a0);
    return `M ${o.x0},${o.y0} A ${r1},${r1} 0 ${o.large} ${o.sweep} ${o.x1},${o.y1}`
         + ` L ${i.x0},${i.y0} A ${r0},${r0} 0 ${i.large} ${i.sweep} ${i.x1},${i.y1} Z`;
  };
  const cx = 260, cy = 260;
  const r0 = 220*BONUS_INNER_R;
  const r1 = 220*BONUS_OUTER_R*1.06;
  const span = 16;
  const base = (typeof BONUS_CENTER_ANCHOR_DEG === 'number' ? BONUS_CENTER_ANCHOR_DEG : 0);
  const anchorA7 = base - 30;
  const anchorBdim = base + 30;
  
  // Render both wedges
  const wedges = [
    { label: 'A7', funcLabel: 'V/ii', anchor: anchorA7 },
    { label: 'Bm7♭5', funcLabel: 'ii/vi', anchor: anchorBdim }
  ];
  
  return (
    <g key="bonus-persistent">
      {wedges.map(w => {
        const a0 = w.anchor - span/2 + rotationOffset;
        const a1 = w.anchor + span/2 + rotationOffset;
        const pathD = ring(cx,cy,r0,r1,a0,a1);
        const textR = (r0+r1)/2;
        const mid = (a0+a1)/2;
        const tx = cx + textR * Math.cos(toRad(mid));
        const ty = cy + textR * Math.sin(toRad(mid));
        
        // Click handler to preview and enable insert
        const handleClick = (e: React.MouseEvent) => {
          // Show chord in hub and trigger keyboard/tab display
          lastInputWasPreviewRef.current = true;
          centerOnly(w.label);
          
          // ✅ v3.10.4: Add radius detection for inner/outer ring behavior
          // Calculate click position relative to wheel center
          const svg = (e.currentTarget as SVGElement).ownerSVGElement;
          let playWith7th = true; // Default to 7th if we can't detect radius
          
          if (svg) {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const ctm = svg.getScreenCTM();
            
            if (ctm) {
              const svgP = pt.matrixTransform(ctm.inverse());
              const dx = svgP.x - cx;
              const dy = svgP.y - cy;
              const clickRadius = Math.sqrt(dx*dx + dy*dy);
              const normalizedRadius = clickRadius / r; // 0 = center, 1 = outer edge
              
              // Inner zone (< threshold) = play with 7th
              // Outer zone (>= threshold) = play triad only
              playWith7th = normalizedRadius < SEVENTH_RADIUS_THRESHOLD;
              
              console.log('🖱️ Bonus click:', {
                label: w.label,
                clickRadius: clickRadius.toFixed(1),
                normalizedRadius: normalizedRadius.toFixed(2),
                threshold: SEVENTH_RADIUS_THRESHOLD,
                playWith7th
              });
            }
          }
          
          // Get chord definition from bonus table
          const bonusChordDef = BONUS_CHORD_DEFINITIONS[w.label];
          
          if (bonusChordDef && audioEnabledRef.current) {
            // Play with or without 7th based on click zone
            const pcs = (playWith7th && bonusChordDef.seventh !== undefined)
              ? [...bonusChordDef.triad, bonusChordDef.seventh]
              : bonusChordDef.triad;
            console.log('🎵 Bonus wedge clicked:', w.label, 'with7th:', playWith7th, 'PCs:', pcs);
            playChordWithVoiceLeading(pcs);
          }
          
          // Update keyboard highlight based on what we're playing
          const chordName = w.label;
          
          // Define both triad and seventh versions
          const chordNotes: Record<string, {triad: number[], seventh: number[]}> = {
            'A7': {
              triad: [57, 61, 64],           // A3 C#4 E4
              seventh: [57, 61, 64, 67]      // A3 C#4 E4 G4
            },
            'Bm7♭5': {
              triad: [59, 62, 65],           // B3 D4 F4
              seventh: [59, 62, 65, 69]      // B3 D4 F4 A4
            }
          };
          
          if (chordNotes[chordName]) {
            setLatchedAbsNotes(playWith7th ? chordNotes[chordName].seventh : chordNotes[chordName].triad);
          }
        };
        
        return (
          <g 
            key={w.label} 
            onMouseDown={handleClick}
            style={{cursor: 'pointer'}}
          >
            <path d={pathD} 
                  fill={w.label === 'Bm7♭5' ? '#0EA5E9' : BONUS_FILL} 
                  stroke={PALETTE_ACCENT_GREEN} 
                  strokeWidth={1.5 as any}/>
            <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {w.funcLabel}
            </text>
            <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                  style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any, pointerEvents: 'none' }}>
              {w.label}
            </text>
          </g>
        );
      })}
    </g>
  );
})()}

{/* Active bonus wedge (full opacity when clicked) */}
{bonusActive && (() => {
  // Basic arc ring between inner/outer radii
  const toRad = (deg:number) => (deg - 90) * Math.PI/180; // 0° at 12 o'clock
  const arc = (cx:number, cy:number, r:number, a0:number, a1:number) => {
    const x0 = cx + r * Math.cos(toRad(a0));
    const y0 = cy + r * Math.sin(toRad(a0));
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const large = Math.abs(a1-a0) > 180 ? 1 : 0;
    const sweep = a1 > a0 ? 1 : 0;
    return {x0,y0,x1,y1,large,sweep};
  };
  const ring = (cx:number, cy:number, r0:number, r1:number, a0:number, a1:number) => {
    const o = arc(cx,cy,r1,a0,a1);
    const i = arc(cx,cy,r0,a1,a0);
    return `M ${o.x0},${o.y0} A ${r1},${r1} 0 ${o.large} ${o.sweep} ${o.x1},${o.y1}`
         + ` L ${i.x0},${i.y0} A ${r0},${r0} 0 ${i.large} ${i.sweep} ${i.x1},${i.y1} Z`;
  };
  const cx = 260, cy = 260;
  const r0 = 220*BONUS_INNER_R;
  const r1 = 220*BONUS_OUTER_R*1.06; // extend a hair past rim
  const span = 16; // degrees
  const base = (typeof BONUS_CENTER_ANCHOR_DEG === 'number' ? BONUS_CENTER_ANCHOR_DEG : 0);
  // Space the two bonuses so they never overlap; pick anchor by current bonus label.
  const anchorA7   = base - 30;
  const anchorBdim = base + 30;
  const anchor = (bonusLabel === 'A7') ? anchorA7 : anchorBdim;
  const a0 = anchor - span/2 + rotationOffset;
  const a1 = anchor + span/2 + rotationOffset;
  const pathD = ring(cx,cy,r0,r1,a0,a1);
  const textR = (r0+r1)/2;
      const funcLabel = (bonusLabel === 'A7') ? 'V/ii' : 'ii/vi';
  const mid = (a0+a1)/2;
  const tx = cx + textR * Math.cos(toRad(mid));
  const ty = cy + textR * Math.sin(toRad(mid));
  return (
    <g key="bonus">
      <path d={pathD} fill={bonusLabel === 'Bm7♭5' ? '#0EA5E9' : BONUS_FILL} stroke={PALETTE_ACCENT_GREEN} strokeWidth={1.5 as any}/>
      <text x={tx} y={ty} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
            style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
        {funcLabel}
      </text>\n          <text x={tx} y={ty+12} textAnchor="middle" fontSize={BONUS_TEXT_SIZE}
                style={{ fill: BONUS_TEXT_FILL, fontWeight: 700, paintOrder:'stroke', stroke:'#000', strokeWidth:1 as any }}>
            {bonusLabel}
          </text>
    </g>
  );
})()}
{/* -------- END BONUS BLOCK -------- */}

            </svg>
            
            {/* ✅ v3.11.0: Lock Button - positioned above sequencer display */}
            <button
              onClick={() => setSpaceLocked(!spaceLocked)}
              style={{
                position: 'absolute',
                right: 40,
                bottom: isDesktop ? 120 : 60,  // ← v3.17.85: LOWER on mobile (was backwards!)
                width: 32,
                height: 32,
                padding: 0,
                border: `2px solid ${spaceLocked ? '#F59E0B' : '#374151'}`,
                borderRadius: '50%',
                background: spaceLocked ? '#78350F' : '#0a0a0a',
                color: spaceLocked ? '#FCD34D' : '#9CA3AF',
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 10,
              }}
              title={spaceLocked ? "🔒 Spaces locked - click to unlock" : "🔓 Click to lock spaces"}
            >
              {spaceLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
        
        </div> {/* End of position:relative container for legend+wheel */}

        {/* Bottom Grid: input + keyboard (left), buttons + guitar tab (right) */}
        {(()=>{

          // keyboard geometry (scoped)
          const KBD_LOW=48, KBD_HIGH=71;
          const whites:number[]=[], blacks:number[]=[];
          for(let m=KBD_LOW;m<=KBD_HIGH;m++){ ([1,3,6,8,10].includes(pcFromMidi(m))?blacks:whites).push(m); }

          const whiteCount = whites.length;
          const totalW = (WHEEL_W * KBD_WIDTH_FRACTION);
          const WW = totalW / whiteCount;
          const HW = WW * 4.0 * KBD_HEIGHT_FACTOR_DEFAULT * 1.2; // 1.2x for taller tablature
          const WB = WW * 0.68;
          const HB = HW * 0.62;

          const whitePos:Record<number,number>={}, blackPos:Record<number,number>={};
          let x=0; for(const m of whites){ whitePos[m]=x; x+=WW; }
          for(const m of blacks){
            const L=m-1,R=m+1; const hasL=whitePos[L]!=null, hasR=whitePos[R]!=null;
            if(hasL&&hasR){ const xL=whitePos[L], xR=whitePos[R]; blackPos[m]=xL+(xR-xL)-(WB/2); }
            else if(hasL){ blackPos[m]=whitePos[L]+WW-(WB/2);} else if(hasR){ blackPos[m]=whitePos[R]-(WB/2);}
          }

          const rhDisplaySet = ()=>{ 
            const phys=[...rightHeld.current], sus=sustainOn.current?[...rightSus.current]:[], merged=new Set<number>([...phys,...sus]);
            let src = Array.from(new Set(Array.from(merged))).sort((a,b)=>a-b);
            if(src.length===0 && LATCH_PREVIEW && lastInputWasPreviewRef.current && latchedAbsNotes.length){
              src = [...new Set(latchedAbsNotes)].sort((a,b)=>a-b);
            }
            if(src.length===0) return new Set<number>();
            
            // ✅ v3.12.4: Use full 2-octave range intelligently
            if (lastInputWasPreviewRef.current) {
              // Wedge clicks - use smart voice leading
              const fitted = preview.fitNotesToWindowPreserveInversion(src, KBD_LOW, KBD_HIGH);
              return new Set(fitted);
            } else {
              // MIDI input - preserve chord structure in 2-octave window
              // Strategy: Find the octave that fits the chord best
              if (src.length === 0) return new Set<number>();
              
              const bass = src[0]; // Lowest note
              const span = src[src.length - 1] - bass; // Chord span
              
              // Try to keep the chord structure intact
              // Find an octave where bass is in range and top note doesn't exceed HIGH
              let bestOctave = 0;
              let testBass = bass;
              
              // Shift up until bass is at least KBD_LOW
              while (testBass < KBD_LOW) {
                testBass += 12;
                bestOctave += 12;
              }
              
              // Check if chord fits without exceeding KBD_HIGH
              // If not, shift down one octave (but keep bass >= KBD_LOW)
              while (testBass + span > KBD_HIGH && testBass - 12 >= KBD_LOW) {
                testBass -= 12;
                bestOctave -= 12;
              }
              
              const transposed = src.map(note => note + bestOctave);
              return new Set(transposed);
            }
          };
          const disp = rhDisplaySet();

          // guitar tab sizing (square)
          const rightW = WHEEL_W * GUITAR_TAB_WIDTH_FRACTION;
          const tabSize = Math.min(rightW, HW);

          return (
            <div style={{maxWidth: WHEEL_W, margin:'0 auto 0', marginTop: 25}}>
              {/* UNIFIED LAYOUT - Same structure always, no shifting */}
              
              
              {/* Row 1: Sequence display - v3.4.3: Always visible, shows message when not EXPERT */}
              {skillLevel === "EXPERT" ? (
                sequence.length > 0 && (
                  <div style={{
                    border:'1px solid #374151',
                    borderRadius:8,
                    background:'#0f172a',
                    overflow:'hidden',
                    marginBottom: 6
                  }}>
                    {/* Song Title */}
                    {songTitle && (
                      <div style={{
                        padding:'2px 8px',
                        fontSize:11,
                        fontWeight:600,
                        color:'#39FF14',
                        textAlign:'left',
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center'
                      }}>
                        <span>{songTitle}</span>
                        <span style={{fontSize:10, color:'#9CA3AF', fontWeight:400}}>
                          {baseKey} major
                        </span>
                      </div>
                    )}
                    
                    {/* Windowed sequence view */}
                    <div style={{
                      padding:'4px 8px',
                      color:'#e5e7eb',
                      fontSize:12,
                      minHeight:24,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      whiteSpace:'nowrap'
                    }}>
                      {(() => {
                        const WINDOW_SIZE = 3;
                        const start = Math.max(0, seqIndex - WINDOW_SIZE);
                        const end = Math.min(sequence.length, seqIndex + WINDOW_SIZE + 1);
                        const visibleItems = sequence.slice(start, end);
                        
                        return (
                          <>
                            {start > 0 && <span style={{marginRight:8, color:'#6b7280'}}>...</span>}
                            {visibleItems.map((item, localIdx) => {
                              const globalIdx = start + localIdx;
                              const isCurrent = globalIdx === displayIndex;
                              const isComment = item.kind === "comment";
                              const isTitle = item.kind === "title";
                              
                              if (isTitle) return null;
                              
                              return (
                                <span key={globalIdx} style={{
                                  marginRight: 8,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: isCurrent ? '#374151' : 'transparent',
                                  fontWeight: isCurrent ? 600 : 400,
                                  fontStyle: isComment ? 'italic' : 'normal',
                                  color: isCurrent ? '#39FF14' : (isComment ? '#6b7280' : '#9CA3AF')
                                }}>
                                  {isComment ? item.raw.replace(/^#\s*/, '') : item.raw}
                                </span>
                              );
                            })}
                            {end < sequence.length && <span style={{marginLeft:0, color:'#6b7280'}}>...</span>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )
              ) : (
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                  background:'#0f172a',
                  padding:'8px 12px',
                  marginBottom: 2,
                  marginTop: -20,
                  textAlign:'center',
                  color:'#6b7280',
                  fontSize:11,
                  fontStyle:'italic',
                  whiteSpace:'nowrap',
                  overflow:'hidden',
                  textOverflow:'ellipsis'
                }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🎯 Expert mode button clicked!');
                      setSkillLevel('EXPERT');
                    }}
                    style={{
                      color: '#39FF14',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontWeight: 600,
                      background: 'rgba(57, 255, 20, 0.1)',
                      border: '1px solid transparent',
                      padding: '2px 6px',
                      margin: '0 2px',
                      borderRadius: '3px',
                      font: 'inherit',
                      fontSize: 11,
                      fontStyle: 'normal',
                      display: 'inline-block',
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
                      e.currentTarget.style.borderColor = '#39FF14';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    Expert mode
                  </button>
                  {' '}for sequencer.{' '}Join a{' '}
                  <a 
                    href="https://beatkitchen.io/classroom/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🏋️ Gym link clicked');
                    }}
                    style={{
                      color: '#39FF14',
                      textDecoration: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'rgba(57, 255, 20, 0.1)',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                    }}
                  >
                    gym
                  </a>
                  {' '}to learn some music theory!
                </div>
              )}
              
              <div style={{
                display:'grid', 
                gridTemplateColumns: '65% 35%',
                columnGap:12, 
                marginBottom:6,
                position: 'relative',
                zIndex: 1  // ✅ v3.17.90: Stay below load menu (99999)
              }}>
                {/* Left: Key Button + Space Buttons + Keyboard */}
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {/* Key + Space buttons */}
                  <div style={{display:'flex', gap:8, flexWrap:'nowrap', position:'relative', justifyContent:'space-between', alignItems:'center'}}>
                    {/* Key Button - left aligned */}
                    <div style={{position:'relative'}}>
                      <button 
                        onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                        style={{
                          ...activeBtnStyle(true, '#39FF14'),
                          minWidth:60,
                          transition: 'box-shadow 0.3s ease-out',
                          boxShadow: keyChangeFlash ? '0 0 20px #39FF14' : 'none',
                          background: '#1a3310',  // Solid green background
                          fontWeight: 700,
                          fontSize: 14
                        }}
                      >
                        {baseKey}
                      </button>
                      
                      {/* Dropdown */}
                      {showKeyDropdown && (
                        <div ref={keyDropdownRef} style={{
                          position:'absolute',
                          top:'100%',
                          left:0,
                          marginTop:4,
                          background:'#1f2937',
                          border:'1px solid #39FF14',
                          borderRadius:6,
                          padding:4,
                          zIndex:1000,
                          display:'grid',
                          gridTemplateColumns:'repeat(4, 1fr)',
                          gap:4,
                          minWidth:200
                        }}>
                          {FLAT_NAMES.map(k => (
                            <button
                              key={k}
                              onClick={() => {
                                setBaseKey(k);
                                setShowKeyDropdown(false);
                                setKeyChangeFlash(true);
                                setTimeout(() => setKeyChangeFlash(false), 300);
                              }}
                              style={{
                                padding:'6px 10px',
                                border:k === baseKey ? '2px solid #39FF14' : '1px solid #374151',
                                borderRadius:4,
                                background:k === baseKey ? '#1a3310' : '#111',
                                color:k === baseKey ? '#39FF14' : '#e5e7eb',
                                cursor:'pointer',
                                fontSize:12,
                                fontWeight:k === baseKey ? 600 : 400
                              }}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Space buttons - right aligned */}
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={goHome}         style={activeBtnStyle(!(visitorActive||relMinorActive||subdomActive), '#F2D74B')}>HOME</button>
                      <button onClick={toggleRelMinor} style={activeBtnStyle(relMinorActive, '#F0AD21')}>REL</button>
                      <button onClick={toggleSubdom}   style={activeBtnStyle(subdomActive, '#0EA5E9')}>SUB</button>
                      <button onClick={toggleVisitor}  style={activeBtnStyle(visitorActive, '#9333ea')}>PAR</button>
                    </div>
                  </div>
                  
                  {/* Keyboard - aligned to bottom */}
                  <div style={{width:'100%'}}>
                    <svg viewBox={`0 0 ${totalW} ${HW}`} className="select-none"
                        style={{display:'block', width:'100%', height:'auto', border:'1px solid #374151', borderRadius:8, background:'#0f172a'}}>
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr; 
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      const fillColor = held ? "#AEC9FF" : (highlighted ? "#FFE999" : "#f9fafb");
                      
                      // Get note name - use flats for black keys
                      const noteNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
                      const noteName = noteNames[m % 12];
                      
                      return (
                        <g key={`w-${m}`}>
                          <rect x={x} y={0} width={WW} height={HW}
                                fill={fillColor} stroke="#1f2937"
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false; 
                                  rightHeld.current.add(m); 
                                  detect();
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag - if mouse is down, play note
                                  if (e.buttons === 1) { // Left button held
                                    rightHeld.current.add(m);
                                    detect();
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }} />
                        </g>
                      );
                    })}
                    {Object.entries(blackPos).map(([mStr,x])=>{
                      const m=+mStr; 
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      const fillColor = held ? "#6B93D6" : (highlighted ? "#D4B560" : "#1f2937");
                      const strokeColor = held ? "#4A7BC0" : (highlighted ? "#B8972D" : "#0a0a0a");
                      
                      // Get note name - use flats
                      const noteNames = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
                      const noteName = noteNames[m % 12];
                      
                      return (
                        <g key={`b-${m}`}>
                          <rect x={x} y={0} width={WB} height={HB}
                                fill={fillColor} stroke={strokeColor}
                                onMouseDown={()=>{
                                  lastInputWasPreviewRef.current = false; 
                                  rightHeld.current.add(m); 
                                  detect();
                                  // Play audio
                                  if (audioEnabledRef.current) {
                                    playNote(m, 0.6, false);
                                  }
                                }}
                                onMouseEnter={(e)=>{
                                  // Support drag
                                  if (e.buttons === 1) {
                                    rightHeld.current.add(m);
                                    detect();
                                    if (audioEnabledRef.current) {
                                      playNote(m, 0.6, false);
                                    }
                                  }
                                }}
                                onMouseUp={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }}
                                onMouseLeave={()=>{
                                  rightHeld.current.delete(m); 
                                  rightSus.current.delete(m); 
                                  detect();
                                  // Stop audio
                                  if (audioEnabledRef.current) {
                                    stopNote(m);
                                  }
                                }} />
                        </g>
                      );
                    })}
                    
                    {/* Note labels - rendered last so they're on top */}
                    {Object.entries(whitePos).map(([mStr,x])=>{
                      const m=+mStr;
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      if (!held && !highlighted) return null;
                      
                      // ✅ v3.12.4: Chord-aware spelling - use chord root for context
                      let noteName: string;
                      if (centerLabel) {
                        // Extract root from chord label (e.g. "Gmaj7" → "G", "C#m" → "C#")
                        const rootMatch = centerLabel.match(/^([A-G][b#]?)/);
                        if (rootMatch) {
                          const chordRoot = rootMatch[1] as KeyName;
                          noteName = pcNameForKey(m % 12, chordRoot);
                        } else {
                          // Fallback to key center
                          const currentKey = visitorActiveRef.current ? parKey 
                            : subdomActiveRef.current ? subKey 
                            : baseKeyRef.current;
                          noteName = pcNameForKey(m % 12, currentKey);
                        }
                      } else {
                        // No chord - use key center
                        const currentKey = visitorActiveRef.current ? parKey 
                          : subdomActiveRef.current ? subKey 
                          : baseKeyRef.current;
                        noteName = pcNameForKey(m % 12, currentKey);
                      }
                      
                      return (
                        <g key={`wl-${m}`}>
                          <circle
                            cx={x + WW/2}
                            cy={20}
                            r={WW * 0.4}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          <text 
                            x={x + WW/2} 
                            y={20 + WW * 0.15}
                            textAnchor="middle" 
                            fontSize={WW * 0.5}
                            fontWeight={700}
                            fill="#000000"
                            style={{pointerEvents: 'none', userSelect: 'none'}}
                          >
                            {noteName}
                          </text>
                        </g>
                      );
                    })}
                    {Object.entries(blackPos).map(([mStr,x])=>{
                      const m=+mStr;
                      const held=disp.has(m);
                      const highlighted = keyboardHighlightNotes.has(m);
                      if (!held && !highlighted) return null;
                      
                      // ✅ v3.12.4: Chord-aware spelling - use chord root for context
                      let noteName: string;
                      if (centerLabel) {
                        // Extract root from chord label (e.g. "Gmaj7" → "G", "C#m" → "C#")
                        const rootMatch = centerLabel.match(/^([A-G][b#]?)/);
                        if (rootMatch) {
                          const chordRoot = rootMatch[1] as KeyName;
                          noteName = pcNameForKey(m % 12, chordRoot);
                        } else {
                          // Fallback to key center
                          const currentKey = visitorActiveRef.current ? parKey 
                            : subdomActiveRef.current ? subKey 
                            : baseKeyRef.current;
                          noteName = pcNameForKey(m % 12, currentKey);
                        }
                      } else {
                        // No chord - use key center
                        const currentKey = visitorActiveRef.current ? parKey 
                          : subdomActiveRef.current ? subKey 
                          : baseKeyRef.current;
                        noteName = pcNameForKey(m % 12, currentKey);
                      }
                      
                      return (
                        <g key={`bl-${m}`}>
                          {/* Same styling as white keys - use WW for sizing */}
                          <circle
                            cx={x + WB/2}
                            cy={20}
                            r={WW * 0.4}
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          <text 
                            x={x + WB/2} 
                            y={20 + WW * 0.15}
                            textAnchor="middle" 
                            fontSize={WW * 0.5}
                            fontWeight={700}
                            fill="#000000"
                            style={{pointerEvents: 'none', userSelect: 'none'}}
                          >
                            {noteName}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                </div>
                
                {/* Guitar Tab - v3.17.85: Always visible, scales on mobile */}
                <div style={{
                  border:'1px solid #374151',
                  borderRadius:8,
                    background:'#0f172a',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    minHeight: HW,
                    maxHeight: HW,
                    overflow:'hidden'
                  }}>
                    <GuitarTab chordLabel={currentGuitarLabel} width={totalW * 0.35} height={HW}/>
                  </div>
              </div>
              
              
              {/* Row: Reset + MMK + Show Bonus + Transpose - v3.5.0: Reordered */}
              <div style={{marginTop: 6, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                {/* Reset - v3.5.0: Moved left, renamed "Key ↻" */}
                {skillLevel === "EXPERT" && (
                  <button 
                    onClick={resetAll}
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #F2D74B', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#F2D74B', 
                      cursor:'pointer', 
                      fontSize:11
                    }}
                    title="Reset All (Ctrl+H)"
                  >
                    Key ↻
                  </button>
                )}
                
                {skillLevel === "EXPERT" && (
                  <button 
                    onClick={makeThisMyKey}
                    disabled={!centerLabel && rightHeld.current.size === 0}
                    style={{
                      padding:'6px 10px', 
                      border:"1px solid #F2D74B", 
                      borderRadius:6, 
                      background: (centerLabel || rightHeld.current.size > 0) ? '#332810' : '#111', 
                      color: (centerLabel || rightHeld.current.size > 0) ? "#F2D74B" : "#666",
                      cursor: (centerLabel || rightHeld.current.size > 0) ? "pointer" : "not-allowed",
                      fontSize:11,
                      fontWeight:500,
                      opacity: (centerLabel || rightHeld.current.size > 0) ? 1 : 0.5
                    }}
                    title="Make current chord your new key center (K)"
                  >
                    ⚡ Make My Key
                  </button>
                )}
                
                {/* Transpose - v3.5.0: Disabled when @KEY present */}
                {(skillLevel === "EXPERT" || transpose !== 0) && (() => {
                  const hasKeyDirective = loadedSongText.includes('@KEY');
                  const transposeActive = transpose !== 0;
                  const disabled = hasKeyDirective && transposeActive;
                  
                  return (
                  <div style={{position:'relative'}}>
                    <button 
                      onClick={() => !hasKeyDirective && setShowTransposeDropdown(!showTransposeDropdown)}
                      style={{
                        padding:'6px 10px', 
                        border: (transpose === 0 || transposeBypass) ? '1px solid #6B7280' : '2px solid #EF4444',
                        borderRadius:8, 
                        background: (transpose === 0 || transposeBypass) ? '#111' : '#2a1010',
                        color: (transpose === 0 || transposeBypass) ? '#6B7280' : '#EF4444',
                        cursor: hasKeyDirective ? 'not-allowed' : 'pointer',
                        fontSize:11,
                        opacity: hasKeyDirective ? 0.5 : 1
                      }}
                      title={hasKeyDirective ? "Transpose disabled (song uses @KEY)" : (transposeBypass ? "Transpose bypassed (click to edit)" : "Transpose (T)")}
                    >
                      TR {transpose > 0 ? `+${transpose}` : transpose}
                      {hasKeyDirective && ' ⚠'}
                    </button>
                    
                    {showTransposeDropdown && !hasKeyDirective && (
                      <div ref={transposeDropdownRef} style={{
                        position:'absolute',
                        bottom:'100%',
                        left:0,
                        marginBottom:4,
                        background:'#1f2937',
                        border: transpose !== 0 ? '1px solid #F2D74B' : '1px solid #60A5FA',
                        borderRadius:6,
                        padding:8,
                        zIndex:1000,
                        display:'grid',
                        gridTemplateColumns:'repeat(13, 1fr)', // 2 rows: positive top, negative bottom
                        gridTemplateRows:'repeat(2, 1fr)',
                        gap:4
                      }}>
                        {/* Row 1: 0 to +12 */}
                        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(semitones => (
                          <button
                            key={semitones}
                            onClick={() => {
                              setTranspose(semitones);
                              setTransposeBypass(false); // Clear bypass when changing value
                              setShowTransposeDropdown(false);
                            }}
                            style={{
                              padding:'6px 8px',
                              border: transpose === semitones ? `1px solid ${transpose !== 0 ? '#F2D74B' : '#60A5FA'}` : '1px solid #374151',
                              borderRadius:4,
                              background: transpose === semitones ? (transpose !== 0 ? '#332810' : '#1e3a5f') : '#111',
                              color: transpose === semitones ? (transpose !== 0 ? '#F2D74B' : '#60A5FA') : '#9CA3AF',
                              cursor:'pointer',
                              fontSize:10,
                              fontWeight: transpose === semitones ? 600 : 400,
                              minWidth:32
                            }}
                          >
                            {semitones > 0 ? `+${semitones}` : semitones}
                          </button>
                        ))}
                        {/* Row 2: -1 to -12 */}
                        {[-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12].map(semitones => (
                          <button
                            key={semitones}
                            onClick={() => {
                              setTranspose(semitones);
                              setTransposeBypass(false); // Clear bypass when changing value
                              setShowTransposeDropdown(false);
                            }}
                            style={{
                              padding:'6px 8px',
                              border: transpose === semitones ? `1px solid ${transpose !== 0 ? '#F2D74B' : '#60A5FA'}` : '1px solid #374151',
                              borderRadius:4,
                              background: transpose === semitones ? (transpose !== 0 ? '#332810' : '#1e3a5f') : '#111',
                              color: transpose === semitones ? (transpose !== 0 ? '#F2D74B' : '#60A5FA') : '#9CA3AF',
                              cursor:'pointer',
                              fontSize:10,
                              fontWeight: transpose === semitones ? 600 : 400,
                              minWidth:32
                            }}
                          >
                            {semitones}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })()}
                
                {/* Transpose Bypass - v3.5.0: Toggle to temporarily disable */}
                {transpose !== 0 && (
                  <button 
                    onClick={() => setTransposeBypass(!transposeBypass)}
                    style={{
                      padding:'6px 10px', 
                      border: transposeBypass ? '1px solid #6B7280' : '2px solid #10B981', 
                      borderRadius:8, 
                      background: transposeBypass ? '#111' : '#1a3a2a', 
                      color: transposeBypass ? '#6B7280' : '#10B981', 
                      cursor:'pointer', 
                      fontSize:11,
                      fontWeight: transposeBypass ? 400 : 600
                    }}
                    title={transposeBypass ? "Resume transpose" : "Bypass transpose (temporary disable)"}
                  >
                    {transposeBypass ? 'TR OFF' : 'TR ON'}
                  </button>
                )}
                
                {/* Play in C - Transpose to C (capo analogy) */}
                {baseKey !== 'C' && skillLevel === "EXPERT" && (
                  <button 
                    onClick={() => {
                      // Calculate transpose needed to reach C from current key
                      const currentPc = NAME_TO_PC[baseKey] || 0;
                      const transposeAmount = currentPc === 0 ? 0 : (12 - currentPc) % 12;
                      setTranspose(transposeAmount);
                      setTransposeBypass(false); // Engage transpose
                    }}
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #60A5FA', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#60A5FA', 
                      cursor:'pointer', 
                      fontSize:11
                    }}
                    title={`Transpose to C (like a capo on fret ${NAME_TO_PC[baseKey] || 0})`}
                  >
                    🎹 Play in C
                  </button>
                )}
              </div>
              
              
              {/* Row: Transport Controls + Step Record - v3.4.3: Fixed missing buttons */}
              {skillLevel === "EXPERT" && sequence.length > 0 && (
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:6, marginBottom:6, flexWrap:'wrap'}}>
                  {/* 1. Go to start */}
                  <button 
                    onClick={goToStart} 
                    style={{
                      padding:'6px 10px', 
                      border:'2px solid #9CA3AF', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16
                    }} 
                    title="Go to start (Cmd+Shift+<)"
                  >
                    ⏮️
                  </button>
                  
                  {/* 2. Prev chord - BLUE */}
                  <button 
                    onClick={stepPrev} 
                    style={{
                      padding:'6px 10px', 
                      border: pulsingButton === 'prev' ? '2px solid #60A5FA' : '2px solid #3B82F6',
                      borderRadius:8, 
                      background: pulsingButton === 'prev' ? '#1e3a8a' : '#111',
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700,
                      transition: 'all 0.15s ease-out',
                      boxShadow: pulsingButton === 'prev' ? '0 0 12px rgba(96, 165, 250, 0.6)' : 'none'
                    }} 
                    title="Previous chord (<)"
                  >
                    &lt;
                  </button>
                  
                  {/* 3. Next chord - BLUE */}
                  <button 
                    onClick={stepNext} 
                    style={{
                      padding:'6px 10px', 
                      border: pulsingButton === 'next' ? '2px solid #60A5FA' : '2px solid #3B82F6',
                      borderRadius:8, 
                      background: pulsingButton === 'next' ? '#1e3a8a' : '#111',
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:14,
                      fontWeight:700,
                      transition: 'all 0.15s ease-out',
                      boxShadow: pulsingButton === 'next' ? '0 0 12px rgba(96, 165, 250, 0.6)' : 'none'
                    }} 
                    title="Next chord (>)"
                  >
                    &gt;
                  </button>
                  
                  {/* 4. Play/Stop - GREEN for ▷, RED for ■ */}
                  <button 
                    onClick={togglePlayPause}
                    style={{
                      padding:'6px 10px',
                      border: isPlaying ? '2px solid #EF4444' : '2px solid #10B981', 
                      borderRadius:8, 
                      background: isPlaying ? '#2a1a1a' : '#1a3a2a', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16,
                      fontWeight:700
                    }}
                    title={isPlaying ? "Stop (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? '■' : '▷'}
                  </button>
                  
                  {/* 5. Loop button */}
                  <button 
                    onClick={() => setLoopEnabled(!loopEnabled)}
                    style={{
                      padding:'6px 10px', 
                      border: loopEnabled ? '2px solid #10B981' : '2px solid #374151', 
                      borderRadius:8, 
                      background: loopEnabled ? '#1a3a2a' : '#111', 
                      color:'#fff', 
                      cursor:'pointer', 
                      fontSize:16
                    }} 
                    title={loopEnabled ? "Loop enabled" : "Loop disabled"}
                  >
                    🔁
                  </button>
                  
                  {/* 6. Prev comment - GREY */}
                  <button 
                    onClick={skipToPrevComment} 
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #6B7280', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#9CA3AF', 
                      cursor:'pointer', 
                      fontSize:12
                    }} 
                    title="Previous comment (Ctrl+←)"
                  >
                    {"<<"}
                  </button>
                  
                  {/* 7. Next comment - GREY */}
                  <button 
                    onClick={skipToNextComment} 
                    style={{
                      padding:'6px 10px', 
                      border:'1px solid #6B7280', 
                      borderRadius:8, 
                      background:'#111', 
                      color:'#9CA3AF', 
                      cursor:'pointer', 
                      fontSize:12
                    }} 
                    title="Next comment (Ctrl+→)"
                  >
                    {">>"}
                  </button>
                  
                  {/* Tempo input */}
                  <input 
                    type="number"
                    min="1"
                    max="240"
                    value={tempo}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 60;
                      setTempo(Math.max(1, Math.min(240, val)));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur(); // Exit input on Enter
                      }
                    }}
                    style={{
                      width: 50,
                      padding: '6px',
                      border: '1px solid #374151',
                      borderRadius: 6,
                      background: '#0a0a0a',
                      color: '#E5E7EB',
                      fontSize: 12,
                      textAlign: 'center'
                    }}
                    title="Tempo (BPM)"
                  />
                  <span style={{fontSize: 11, color: '#9CA3AF'}}>BPM</span>
                  
                  {/* Step Record - v3.4.0: Moved here from MMK row */}
                  <button 
                    onClick={() => {
                      const newState = !stepRecord;
                      setStepRecord(newState);
                      stepRecordRef.current = newState;
                    }}
                    style={{
                      padding:'6px 10px', 
                      border:`1px solid ${stepRecord ? '#ff4444' : '#374151'}`, 
                      borderRadius:6, 
                      background: stepRecord ? '#331010' : '#1f2937', 
                      color: stepRecord ? '#ff4444' : '#9CA3AF', 
                      cursor:'pointer',
                      fontSize:11,
                      fontWeight: stepRecord ? 600 : 400,
                      marginLeft:'auto'
                    }}
                    title="Toggle step record: automatically add played chords to sequencer"
                  >
                    {stepRecord ? '⏺ Recording' : '⏺ Step Record'}
                  </button>
                </div>
              )}
              
              
              {/* Row 2: Sequencer + Buttons - EXPERT ONLY */}
              {skillLevel === "EXPERT" && (
                <div style={{marginBottom: 6, display:'flex', gap:8, alignItems:'stretch', maxWidth:'100%', overflow:'hidden'}}>
                  <textarea
                    ref={textareaRef}
                    placeholder={'Type chords, modifiers, and comments...\nExamples:\n@TITLE Sequence Name, @KEY C\nC, Am7, F, G7\n@SUB F, Bb, C7, @HOME\n@REL Em, Am, @PAR Cm, Fm\n@KEY G, D, G, C\n# Verse: lyrics or theory note'}
                    rows={3}
                    value={inputText}
                    onChange={(e)=>setInputText(e.target.value)}
                    onKeyDown={handleInputKeyNav}
                    style={{
                      flex: 1,
                      padding:'8px 10px',
                      border:'1px solid #374151',
                      background: '#0f172a',
                      color: '#e5e7eb',
                      borderRadius:8,
                      fontFamily:'ui-sans-serif, system-ui',
                      resize:'vertical',
                      fontSize: isDesktop ? 12 : 16, // ✅ v3.17.85: 16px on mobile prevents iOS zoom
                      lineHeight: '1.5', // v3.2.5: Explicit line-height for better click targets
                      userSelect: 'text' // ✅ v3.17.12: Allow text selection in editor
                    }}
                  />
                  
                  {/* ✅ v3.17.85: 2x2 Button Grid - Constrained width */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 120px)',
                    gap: 8,
                    marginTop: 8,
                    position: 'relative',
                    zIndex: 100000  // ✅ v3.17.91: High z-index so load menu appears above keyboard
                  }}>
                    {/* Top Left: Enter Button */}
                    <button 
                      onClick={parseAndLoadSequence}
                      style={{
                        padding:'8px 12px',
                        border: inputText !== loadedSongText ? '2px solid #EF4444' : '2px solid #39FF14',
                        borderRadius:8,
                        background: inputText !== loadedSongText ? '#2a1a1a' : '#1a3310',
                        color: inputText !== loadedSongText ? '#EF4444' : '#39FF14',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title={inputText !== loadedSongText ? "Load changes (Enter)" : "Sequence loaded"}
                    >
                      <span style={{fontSize:18, lineHeight:1}}>⏎</span>
                      <span>{inputText !== loadedSongText ? 'ENTER' : 'READY'}</span>
                    </button>
                    
                    {/* Top Right: Load Button */}
                    <div style={{position:'relative'}}>
                      <button 
                        onClick={() => setShowSongMenu(!showSongMenu)}
                        style={{
                          width: '100%',
                          padding:'8px 12px',
                          border:'2px solid #60A5FA',
                          borderRadius:8,
                          background:'#111',
                          color:'#60A5FA',
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap: 8,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                        title="Load saved songs"
                      >
                        <span style={{fontSize:18}}>📁</span>
                        <span>LOAD</span>
                      </button>
                    
                      {/* Load Menu Dropdown - Calculate position dynamically */}
                      {showSongMenu && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: 4,
                        background: '#1a1a1a',
                        border: '2px solid #60A5FA',
                        borderRadius: 8,
                        padding: 8,
                        zIndex: 99999,
                        minWidth: 250,
                        maxHeight: 400,
                        overflowY: 'auto'
                      }}>
                        <div style={{fontSize:12, fontWeight:600, color:'#60A5FA', marginBottom:8, paddingBottom:8, borderBottom:'1px solid #374151'}}>
                          SONG MENU
                        </div>
                        
                        {/* Demo Songs */}
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:10, color:'#9CA3AF', marginBottom:4, textTransform:'uppercase'}}>Demo Songs</div>
                          {demoSongs.map((song, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLoadDemoSong(song.content)}
                              style={{
                                width:'100%',
                                padding: '6px 8px',
                                border: 'none',
                                background: 'transparent',
                                color: '#e5e7eb',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: 4,
                                fontSize: 11,
                                marginBottom:2
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {song.title}
                            </button>
                          ))}
                        </div>
                        
                        {/* Import/Export */}
                        <div style={{borderTop:'1px solid #374151', paddingTop:8}}>
                          <div style={{fontSize:10, color:'#9CA3AF', marginBottom:4, textTransform:'uppercase'}}>Import / Export</div>
                          
                          {/* Import */}
                          <label style={{
                            width:'100%',
                            padding: '6px 8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#e5e7eb',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 4,
                            fontSize: 11,
                            display:'block',
                            marginBottom:2
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            📂 Import from file...
                            <input 
                              type="file" 
                              accept=".txt,.md" 
                              onChange={handleImportSong}
                              style={{display:'none'}}
                            />
                          </label>
                          
                          {/* Export */}
                          <button
                            onClick={handleExportSong}
                            style={{
                              width:'100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#e5e7eb',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: 4,
                              fontSize: 11,
                              marginBottom:2
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            💾 Export to file...
                          </button>
                          
                          {/* Share URL */}
                          <button
                            onClick={handleGenerateShareURL}
                            style={{
                              width:'100%',
                              padding: '6px 8px',
                              border: 'none',
                              background: 'transparent',
                              color: '#e5e7eb',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: 4,
                              fontSize: 11
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            🔗 Copy share link
                          </button>
                          
                          {shareURL && (
                            <div style={{
                              marginTop:8,
                              padding:6,
                              background:'#0f172a',
                              borderRadius:4,
                              fontSize:9,
                              color:'#10B981',
                              wordBreak:'break-all'
                            }}>
                              ✓ Link copied to clipboard!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                    
                    {/* Bottom Left: Clear Button */}
                    <button
                      onClick={() => {
                        setInputText('');
                        setLoadedSongText('');
                        setSequence([]);
                        setSeqIndex(0);
                        setDisplayIndex(0);
                      }}
                      style={{
                        padding:'8px 12px',
                        border:'2px solid #9CA3AF',
                        borderRadius:8,
                        background:'#1a1a1a',
                        color:'#9CA3AF',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title="Clear editor"
                    >
                      <span style={{fontSize:18}}>✕</span>
                      <span>CLEAR</span>
                    </button>
                    
                    {/* Bottom Right: Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      style={{
                        padding:'8px 12px',
                        border: `2px solid ${showShareCopied ? '#39FF14' : '#60A5FA'}`,
                        borderRadius:8,
                        background: showShareCopied ? '#1a3310' : '#111',
                        color: showShareCopied ? '#39FF14' : '#60A5FA',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap: 8,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                      title="Share this song"
                    >
                      <span style={{fontSize:18}}>{showShareCopied ? '✓' : '✉️'}</span>
                      <span>{showShareCopied ? 'SENT' : 'SHARE'}</span>
                    </button>
                  </div>
                </div>
              )}
              <div style={{marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151'}}>
                
                {/* Row 1: Performance Mode */}
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                  {/* ✅ v3.17.9: Clear open/closed states */}
                  {performanceMode ? (
                    /* OPEN STATE - Yellow border, close button prominent */
                    <div style={{ 
                      display: 'flex', 
                      gap: 4, 
                      alignItems: 'center',
                      padding: '6px 8px',
                      border: '2px solid #F2D74B',
                      borderRadius: 6,
                      background: '#332810',
                      width: '100%'
                    }}>
                      {/* Close button - prominent X */}
                      <button
                        onClick={() => setPerformanceMode(false)}
                        title="Close Performance Pad"
                        style={{
                          padding:"5px 9px", 
                          border:'1px solid #F2D74B', 
                          borderRadius:4, 
                          background: '#1a1a1a', 
                          color: '#F2D74B',
                          cursor: 'pointer',
                          fontSize:14,
                          lineHeight: 1,
                          marginRight: 2,
                          fontWeight: 700
                        }}
                      >
                        ✕
                      </button>
                      
                      {[
                        { key: '1', fn: 'I', color: FN_COLORS['I'] },
                        { key: '2', fn: 'ii', color: FN_COLORS['ii'] },
                        { key: '3', fn: 'V/V', color: FN_COLORS['V/V'] },
                        { key: '4', fn: 'iii', color: FN_COLORS['iii'] },
                        { key: '5', fn: 'V/vi', color: FN_COLORS['V/vi'] },
                        { key: '6', fn: 'iv', color: FN_COLORS['iv'] },
                        { key: '7', fn: 'IV', color: FN_COLORS['IV'] },
                        { key: '8', fn: 'V', color: FN_COLORS['V'] },
                        { key: '9', fn: 'V/ii', color: FN_COLORS['iv'] },
                        { key: '0', fn: 'vi', color: FN_COLORS['vi'] },
                        { key: '-', fn: 'Bm7♭5', color: '#0EA5E9' },
                        { key: '=', fn: '♭VII', color: FN_COLORS['♭VII'] }
                      ].map(({ key, fn, color }) => {
                        // Use flash state for momentary highlight (500ms)
                        const isFlashing = performanceFlashKey === key;
                        return (
                          <div 
                            key={key} 
                            onClick={(e) => {
                              const with7th = e.shiftKey;
                              // Clear any existing timeout
                              if (performanceFlashTimeoutRef.current) {
                                clearTimeout(performanceFlashTimeoutRef.current);
                              }
                              // Flash this key
                              setPerformanceFlashKey(key);
                              performanceFlashTimeoutRef.current = setTimeout(() => {
                                setPerformanceFlashKey('');
                              }, 500);
                              // Play the chord
                              previewFn(fn as Fn, with7th);
                              // Clear piano highlights after 500ms
                              setTimeout(() => {
                                setLatchedAbsNotes([]);
                              }, 500);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px 3px',
                              borderRadius: 3,
                              background: isFlashing ? color : '#1a1a1a',
                              border: `1px solid ${isFlashing ? color : '#2a2a2a'}`,
                              width: 28,
                              height: 34,
                              flex: '0 0 auto',
                              transition: 'all 0.1s',
                              opacity: isFlashing ? 1 : 0.7,
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            title={`${fn} - Click for triad, Shift+Click for 7th`}
                          >
                            <div style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: isFlashing ? '#000' : color,
                              fontFamily: 'monospace',
                              lineHeight: 1
                            }}>{key}</div>
                            <div style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: isFlashing ? '#000' : '#888',
                              marginTop: 2,
                              lineHeight: 1,
                              whiteSpace: 'nowrap'
                            }}>
                              {fn}
                            </div>
                            {/* ✅ v3.17.12: Show 7th type below function when shift held */}
                            {shiftHeld && (
                              <div style={{
                                fontSize: 7,
                                fontWeight: 500,
                                color: isFlashing ? '#000' : color,
                                marginTop: 1,
                                lineHeight: 1,
                                opacity: 0.8
                              }}>
                                {(() => {
                                  const chordType = {
                                    'I': 'M7', 'IV': 'M7',  // Major 7th
                                    'ii': 'm7', 'iii': 'm7', 'vi': 'm7', 'iv': 'm7',  // Minor 7th
                                    'V': '7', 'V7': '7', 'V/V': '7', 'V/vi': '7', 'V/ii': '7',  // Dominant 7th
                                    '♭VII': '7',
                                    'Bm7♭5': 'ø7'  // Half-diminished
                                  }[fn] || '7';
                                  return chordType;
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* CLOSED STATE - Subtle gray button with open icon */
                    <button
                      onClick={() => setPerformanceMode(true)}
                      title="Open Performance Pad - Use keyboard 1-0,-,= to trigger chords"
                      style={{
                        padding:"8px 12px", 
                        border:'1px solid #4B5563', 
                        borderRadius:6, 
                        background: '#1F2937', 
                        color: '#D1D5DB',
                        cursor: 'pointer',
                        fontSize:11,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#374151';
                        e.currentTarget.style.borderColor = '#6B7280';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1F2937';
                        e.currentTarget.style.borderColor = '#4B5563';
                      }}
                    >
                      <span style={{fontSize:14}}>🎹</span>
                      <span style={{fontWeight: 500}}>Performance Pad</span>
                      <span style={{fontSize:10, opacity:0.6}}>▶</span>
                    </button>
                  )}
                </div>
                
                {/* Row 2: Audio + MIDI + Help */}
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                  {/* Audio button */}
                  <button 
                    onClick={async () => {
                      const newState = !audioEnabled;
                      setAudioEnabled(newState);
                      audioEnabledRef.current = newState;
                      
                      if (newState) {
                        const ctx = initAudioContext();
                        if (ctx.state === 'suspended') {
                          await ctx.resume();
                        }
                        // ✅ v3.17.85: Play silent note to fully unlock iOS audio in iframe
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        gain.gain.value = 0.001; // Nearly silent
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.01);
                        
                        setTimeout(() => {
                          setAudioReady(true);
                          setAudioInitialized(true);
                        }, 100);
                      } else {
                        setAudioReady(false);
                      }
                    }}
                    title={audioEnabled ? "Audio enabled - click to mute" : "Click to enable audio"}
                    style={{
                      padding:"4px 8px", 
                      border:`1px solid ${audioEnabled ? '#39FF14' : '#374151'}`, 
                      borderRadius:6, 
                      background: audioEnabled ? '#1a3310' : '#111', 
                      color: audioEnabled ? '#39FF14' : '#9CA3AF',
                      cursor: 'pointer',
                      fontSize:14
                    }}
                  >
                    {audioEnabled ? (audioReady ? '🔊' : '⏳') : '🔇'}
                  </button>

                  {MIDI_SUPPORTED && (
                    <>
                      {/* MIDI Input */}
                      <span style={{fontSize:11, color:'#9CA3AF', marginLeft:4}}>IN:</span>
                      <select value={selectedId} onChange={(e)=>{ const acc=midiAccessRef.current; if(acc) bindToInput(e.target.value, acc); }}
                        style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}>
                        {inputs.length===0 && <option value="">None</option>}
                        {inputs.map((i:any)=>(<option key={i.id} value={i.id}>{i.name || `Input ${i.id}`}</option>))}
                      </select>
                      
                      {/* MIDI Output */}
                      <span style={{fontSize:11, color:'#9CA3AF', marginLeft:8}}>OUT:</span>
                      <select 
                        value={midiOutputEnabled ? selectedOutputId : ""} 
                        onChange={(e)=>{ 
                          const acc=midiAccessRef.current;
                          if(acc) {
                            if (e.target.value === "") {
                              setMidiOutputEnabled(false);
                              midiOutputRef.current = null;
                            } else {
                              const output = acc.outputs.get(e.target.value);
                              if(output) {
                                setSelectedOutputId(e.target.value);
                                midiOutputRef.current = output;
                                setMidiOutputEnabled(true);
                              }
                            }
                          }
                        }}
                        style={{padding:"4px 6px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#fff", fontSize:11}}>
                        <option value="">None</option>
                        {outputs.map((o:any)=>(<option key={o.id} value={o.id}>{o.name || `Output ${o.id}`}</option>))}
                      </select>
                    </>
                  )}
                  
                  {/* Spacer */}
                  <div style={{flex:1}} />
                  
                  {/* ✅ v3.17.6: Allow Bonus Chords - always visible, auto-lit in perf mode */}
                  {bonusWedgesAllowed && (
                    <button 
                      onClick={() => !performanceMode && setShowBonusWedges(!showBonusWedges)}
                      title={performanceMode
                        ? "Bonus enabled (auto-on in Performance Mode)"
                        : (skillLevel === "EXPERT" 
                          ? "Reveal bonus wedges persistently for teaching" 
                          : "Allow bonus wedges to trigger dynamically")}
                      style={{
                        padding:'4px 8px', 
                        border:`1px solid ${(showBonusWedges || performanceMode) ? '#39FF14' : '#374151'}`, 
                        borderRadius:6, 
                        background: (showBonusWedges || performanceMode) ? '#1a3310' : '#111', 
                        color: (showBonusWedges || performanceMode) ? '#39FF14' : '#9CA3AF', 
                        cursor: performanceMode ? 'default' : 'pointer',
                        fontSize:11,
                        fontWeight: (showBonusWedges || performanceMode) ? 600 : 400,
                        opacity: performanceMode ? 0.7 : 1
                      }}
                    >
                      {skillLevel === "EXPERT" 
                        ? ((showBonusWedges || performanceMode) ? '✓ Reveal Bonus' : 'Reveal Bonus')
                        : ((showBonusWedges || performanceMode) ? '✓ Allow Bonus' : 'Allow Bonus')
                      }
                    </button>
                  )}
                  
                  {/* Help button */}
                  <button onClick={()=>setShowHelp(true)}
                    style={{padding:"4px 8px", border:"1px solid #374151", borderRadius:6, background:"#111", color:"#9CA3AF", cursor:"pointer", fontSize:14}}>
                    ?
                  </button>
                </div>
                
                {/* Old controls removed - replaced above */}
                <div style={{display:'none'}}>

                  
                  {/* Right: Status + Help */}
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span style={{
                      fontSize:11,
                      padding:'2px 6px',
                      border: `2px solid ${visitorActive ? '#9333ea' : relMinorActive ? '#F0AD21' : subdomActive ? '#0EA5E9' : (visitorActive || relMinorActive || subdomActive) ? '#F2D74B' : '#6b7280'}`,
                      background:'#ffffff18',
                      borderRadius:6
                    }}>
                      {visitorActive ? `space: Parallel (${parKey})`
                        : relMinorActive ? 'space: Relative minor (Am)'
                        : subdomActive ? `space: Subdominant (${subKey})`
                        : (midiConnected ? `MIDI: ${midiName||'Connected'}` : 'MIDI: none')}
                    </span>
                    
                    {/* Help Button */}
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        border: `2px solid ${showHelp ? '#39FF14' : '#374151'}`,
                        borderRadius: '50%',
                        background: showHelp ? '#1a3310' : '#0a0a0a',
                        color: showHelp ? '#39FF14' : '#9CA3AF',
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title="Help & Keyboard Shortcuts"
                    >
                      ?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
      
      {/* Help Callouts */}
      
      {/* Help Overlay */}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

// HarmonyWheel v3.17.93 - Added rhythm notation with bar lines and rests

// EOF - HarmonyWheel.tsx v3.17.93