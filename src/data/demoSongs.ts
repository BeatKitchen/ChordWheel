// File: src/data/demoSongs.ts
// Purpose: Demo songs database - Easy to edit and update!
// Installation: Place this file in src/data/ directory
// Import in HarmonyWheel.tsx: import { defaultSong, demoSongs, DEFAULT_BANNER } from "./data/demoSongs";

// ✅ v3.18.78: Added DEFAULT_BANNER constant for empty state message
// ✅ v3.18.43: Added bannerMessage support for promotional messages
// ✅ v3.19.60: Added comment grouping syntax with semicolon separator

/*
 * SEQUENCER COMMENT SYNTAX GUIDE
 * ===============================
 *
 * Comments can be added to sequences in THREE ways:
 *
 * 1. SECTION LABELS (Standalone)
 * --------------------------------
 * Use parentheses with no attached chords for section markers:
 *
 *   (Verse)
 *   |C| Am| F| G|
 *
 *   (Chorus)
 *   |F| G| C| Am|
 *
 * - Section labels appear in the sequence display
 * - They do not play or take any time
 * - Perfect for marking song structure
 *
 *
 * 2. OLD SYNTAX: Colon Outside Parentheses
 * ------------------------------------------
 * Format: (comment): Chord
 *
 * The comment applies to the chord AFTER the colon:
 *
 *   |(this chord might show up as EmMaj7 or even Ebaug): Em7|
 *
 * - Comment is displayed in orange below title when Em7 plays
 * - Comment is highlighted in green in the sequence display
 * - Works for single chords only
 *
 *
 * 3. NEW SYNTAX: Semicolon Inside Parentheses (RECOMMENDED)
 * -----------------------------------------------------------
 * Format: ChordBefore (comment; Chord1 Chord2 Chord3)
 *
 * The comment applies to ALL chords AFTER the semicolon:
 *
 *   |C (this is a stand in for A7; C#dim)| D (functions like a B7; D#dim)|
 *
 * - ChordBefore (C) plays with NO comment
 * - C#dim plays with "this is a stand in for A7" comment displayed
 * - D plays with NO comment
 * - D#dim plays with "functions like a B7" comment displayed
 *
 * - Can apply comment to multiple chords in one group:
 *   |(lots of ways to skin this cat; C G7 Am)|
 *   All three chords (C, G7, Am) display the comment when they play
 *
 * - Comment appears in orange below title during playback
 * - Comment is highlighted in green in sequence display
 * - Chords BEFORE the comment group are NOT affected
 *
 *
 * IMPORTANT LIMITATIONS:
 * -----------------------
 * - Comments CANNOT span multiple bars (the | delimiter breaks them)
 * - Each bar must have its own comment if needed
 * - Comments do not work across bar lines
 *
 * Example that WON'T work:
 *   |(comment; | C | G | Am | )|  ❌ Broken by bar delimiters
 *
 * Example that WILL work:
 *   |(comment; C G Am)|           ✅ All in one bar
 *
 *
 * SYNTAX SUMMARY:
 * ----------------
 * (Section Label)              → Standalone label, no chords
 * (comment): Chord             → Comment on Chord (old syntax)
 * Chord (comment; NextChord)   → Comment on NextChord (new syntax)
 * (comment; Chord1 Chord2)     → Comment on both Chord1 and Chord2
 */

/*
 * DEFAULT BANNER MESSAGE
 * ======================
 * 
 * This message appears when:
 * - User clears the song editor
 * - No demo song is loaded
 * - User is in BEGINNER/INTERMEDIATE/ADVANCED mode (not EXPERT)
 * 
 * UPDATE THIS MESSAGE HERE - never in HarmonyWheel.tsx!
 * Perfect for promotions, CTAs, or seasonal messages.
 */
export const DEFAULT_BANNER = "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!";

/*
 * BANNER MESSAGE INSTRUCTIONS
 * ============================
 * 
 * You can add custom promotional messages that appear when non-Expert users
 * load demo songs. Users CANNOT create these - only you via this file.
 * 
 * HOW TO ADD A BANNER:
 * Add a `bannerMessage` property to any song:
 * 
 * {
 *   title: "Song Name",
 *   content: "...",
 *   bannerMessage: "Your message here with [[links|url]]"
 * }
 * 
 * LINK SYNTAX:
 * [[link text|url]] - Creates a clickable green link
 * 
 * EXAMPLES:
 * - [[Black Friday Sale|https://beatkitchen.io/sale]] - External link
 * - [[Expert mode|expert]] - Button that enables Expert mode
 * - [[gym|https://beatkitchen.io/classroom]] - Opens classroom
 * 
 * TIPS:
 * - Keep under 80 characters for best display
 * - Messages only show when NOT in Expert mode
 * - Green links match the app's signature color
 * - Links with "expert" become buttons instead of links
 * 
 * If no bannerMessage is provided for a song, DEFAULT_BANNER (above) is used.
 */

export interface DemoSong {
  title: string;
  content: string;
  bannerMessage?: string;  // ✅ v3.18.43: Optional promotional message
}

export const demoSongs: DemoSong[] = [
  
{
  title: "WELCOME TO BEAT KITCHEN",
  content: `@TITLE From today's Beat Kitchen MUSIC THEORY GYM
@KEY C
@TEMPO 160

|Fmaj7 * * / Fmaj7 / Fmaj7 E7 |* / E7 * * * * *|
|Am7 (passing chord; Abm7) | Gm7 C7 |
|Fmaj7 * * * / / / E7 |* / E7 * * * * *|
|Am |Am7 |

@RHYTHM1 |x x x x|
@RHYTHM2 |x / x /|
@RHYTHM3 |x x / x x x / x|`,
  bannerMessage: "Use [[EXPERT mode|expert]] for sequencer. Join a [[Music Theory Gym|https://beatkitchen.io/classroom]] and we'll use this together!"
},


// NEW SONG FORMAT

{
  title: "BLACKBIRD",
  content: `@TITLE Blackbird (Paul McCartney) @KEY G, @TEMPO 180

|G Am7| G | * |
|C (this is a stand in for A7; C#dim) | D (functions like a B7; D#dim) |
|Em |(this chord might show up as EmMaj7 or even Ebaug): Em7|  
| Em7 | A7 | Cm| * | 
|G | A7 | (topic for another day here. lots of ways to skin this cat; C) | G | 

@RHYTHM1 |x / x x / x x x |
@RHYTHM2 |x / x /|
@RHYTHM3 |x x / x x x / x|

`,

  bannerMessage: "Use [[EXPERT mode|expert]] for sequencer. Join a [[Music Theory Gym|https://beatkitchen.io/classroom]] and we'll use this together!"
},

// END NEW SONG FORMAT

  {
    title: "Simple Progression",
    content: "@TITLE Simple Song\n@KEY C\n@TEMPO 100\n\n(Verse)\n|C| Am| F| G| C| Am| F| G|\n\n(Chorus)\n|F| G| C| Am| F| G| C| C|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "Try [[Expert mode|expert]] to unlock the sequencer!"
  },
  {
    title: "Autumn Leaves",
    content: "@TITLE Autumn Leaves\n@KEY Am\n@TEMPO 140\n\n(A Section)\n|Dm7| G7| CMaj7| FMaj7| Bm7b5| E7| Am| Am|\n\n(B Section)\n|Bm7b5| E7| Am| Am| Dm7| G7| CMaj7| FMaj7| Bm7b5| E7| Am| E7|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "I-V-vi-IV (Pop Progression)",
    content: "@TITLE Pop Progression\n@KEY C\n@TEMPO 120\n\n(Verse)\n|C| G| Am| F| C| G| Am| F|\n\n(Chorus)\n|C| G| Am| F| C| G| F| F|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "12-Bar Blues in C",
    content: "@TITLE 12-Bar Blues\n@KEY C\n@TEMPO 120\n\n|C7| C7| C7| C7|\n|F7| F7| C7| C7|\n|G7| F7| C7| G7|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Giant Steps (First 4 bars)",
    content: "@TITLE Giant Steps\n@KEY B\n@TEMPO 180\n\n(First 4 bars)\n|BM7| D7| GM7| Bb7| EbM7| Am7| D7| GM7|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Functional Notation Example",
    content: "@TITLE Functional Demo\n@KEY C\n@TEMPO 100\n\n(Using Roman numerals)\n|I| vi| ii| V7| I| IV| V7| I|\n\n(With secondary dominants)\n|I| V/vi| vi| V/V| V7| I|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Forgiving Notation Test",
    content: "@TITLE Notation Test\n@KEY C\n@TEMPO 120\n\n(Minus notation)\n|A-| D-|\n\n(M7 notation)\n|CM7| FM7|\n\n(Extensions)\n|G7b9| G13| D9|\n\n(Half-dim)\n|Bm7-5|\n\n(Mixed)\n|Am| E7| FM7| G7| C|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  }
];

// Default song (first one)
export const defaultSong = demoSongs[0].content;

// Get song by title
export function getSongByTitle(title: string): string | undefined {
  return demoSongs.find(song => song.title === title)?.content;
}

// Get all song titles
export function getSongTitles(): string[] {
  return demoSongs.map(song => song.title);
}

/*
 * QUICK REFERENCE - BANNER MESSAGE EXAMPLES
 * ==========================================
 * 
 * PROMOTION:
 * DEFAULT_BANNER = "🎉 [[50% off all courses|https://beatkitchen.io/sale]] this week!"
 * 
 * ANNOUNCEMENT:
 * DEFAULT_BANNER = "New! [[Expert mode|expert]] includes chord progressions."
 * 
 * CALL TO ACTION:
 * DEFAULT_BANNER = "Love this? [[Join our community|https://beatkitchen.io/discord]]"
 * 
 * SEASONAL:
 * DEFAULT_BANNER = "Happy holidays! Use code HARMONY25 at [[checkout|https://beatkitchen.io/shop]]"
 * 
 * MULTIPLE LINKS:
 * DEFAULT_BANNER = "Try [[Expert mode|expert]] or join a [[gym|https://beatkitchen.io/classroom]]!"
 * 
 * SIMPLE TEXT (no links):
 * DEFAULT_BANNER = "Thanks for using Harmony Wheel! 🎵"
 * 
 * ==========================================
 * 
 * REMEMBER:
 * - Users can't see or edit DEFAULT_BANNER in the app
 * - Only you can change it via this file
 * - Perfect for promotions, announcements, CTAs
 * - Keep messages concise (~80 chars max)
 * - This is THE place to update promotional messages - nowhere else!
 */