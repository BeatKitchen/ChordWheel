// File: src/data/demoSongs.ts
// Purpose: Demo songs database - Easy to edit and update!
// Installation: Place this file in src/data/ directory
// Import in HarmonyWheel.tsx: import { defaultSong, demoSongs, DEFAULT_BANNER } from "./data/demoSongs";

// ✅ v3.18.78: Added DEFAULT_BANNER constant for empty state message
// ✅ v3.18.43: Added bannerMessage support for promotional messages

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
    content: "@TITLE Demo Song, @KEY C, @TEMPO 120, @LOOP, #hello darkness my old friend, |E7 / E7 / E7 E7 E7 /|E7 / E7 / E7 E7 E7 /|Am / Am / Am Am Am /||Am / Am / Am Am Am /|\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "Use [[EXPERT mode|expert]] for sequencer. Join a [[Music Theory Gym|https://beatkitchen.io/classroom]] and we'll use this together!"
  },
  {
    title: "Simple Progression",
    content: "@TITLE Simple Song, @KEY C, @TEMPO 100, @LOOP, # Verse, C, Am, F, G, C, Am, F, G, # Chorus, F, G, C, Am, F, G, C, C\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "Try [[Expert mode|expert]] to unlock the sequencer!"
  },
  {
    title: "Autumn Leaves",
    content: "@TITLE Autumn Leaves, @KEY Am, @TEMPO 140, @LOOP, # A Section, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, Am, # B Section, Bm7b5, E7, Am, Am, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, E7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "I-V-vi-IV (Pop Progression)",
    content: "@TITLE Pop Progression, @KEY C, @TEMPO 120, @LOOP, # Verse, C, G, Am, F, C, G, Am, F, # Chorus, C, G, Am, F, C, G, F, F\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "12-Bar Blues in C",
    content: "@TITLE 12-Bar Blues, @KEY C, @TEMPO 120, @LOOP, # Chorus, C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Giant Steps (First 4 bars)",
    content: "@TITLE Giant Steps, @KEY B, @TEMPO 180, # First 4 bars, BM7, D7, GM7, Bb7, EbM7, Am7, D7, GM7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Functional Notation Example",
    content: "@TITLE Functional Demo, @KEY C, @TEMPO 100, @LOOP, # Using Roman numerals, I, vi, ii, V7, I, IV, V7, I, # With secondary dominants, I, V/vi, vi, V/V, V7, I\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
    bannerMessage: "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
  },
  {
    title: "Forgiving Notation Test",
    content: "@TITLE Notation Test, @KEY C, @TEMPO 120, # Minus notation, A-, D-, # M7 notation, CM7, FM7, # Extensions, G7b9, G13, D9, # Half-dim, Bm7-5, # Mixed, Am, E7, FM7, G7, C\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|",
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