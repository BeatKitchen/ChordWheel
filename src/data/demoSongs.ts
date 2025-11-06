// File: src/data/demoSongs.ts
// Purpose: Demo songs database - Easy to edit and update!
// Installation: Place this file in src/data/ directory
// Import in HarmonyWheel.tsx: import { defaultSong, demoSongs } from "./data/demoSongs";

// ✅ v3.18.43: Added bannerMessage support for promotional messages

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
 * DEFAULT MESSAGE (if no bannerMessage):
 * "[[Expert mode|expert]] for sequencer. Join a [[gym|https://beatkitchen.io/classroom]] to learn some music theory!"
 */

export interface DemoSong {
  title: string;
  content: string;
  bannerMessage?: string;  // ✅ v3.18.43: Optional promotional message
}

export const demoSongs: DemoSong[] = [
  {
    title: "DEBUG TEST",
    content: "@TITLE Hello World, @Key G, #hello darkness my old friend, B7, Em\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
    // No banner - uses default message
  },
  {
    title: "Simple Progression",
    content: "@TITLE Simple Song, @KEY C, # Verse, C, Am, F, G, C, Am, F, G, # Chorus, F, G, C, Am, F, G, C, C\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
    // Example: Add banner like this:
    // bannerMessage: "Try [[Expert mode|expert]] to unlock the sequencer!"
  },
  {
    title: "Autumn Leaves",
    content: "@TITLE Autumn Leaves, @KEY Am, # A Section, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, Am, # B Section, Bm7b5, E7, Am, Am, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, E7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
  },
  {
    title: "I-V-vi-IV (Pop Progression)",
    content: "@TITLE Pop Progression, @KEY C, # Verse, C, G, Am, F, C, G, Am, F, # Chorus, C, G, Am, F, C, G, F, F\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
  },
  {
    title: "12-Bar Blues in C",
    content: "@TITLE 12-Bar Blues, @KEY C, # Chorus, C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
  },
  {
    title: "Giant Steps (First 4 bars)",
    content: "@TITLE Giant Steps, @KEY B, # First 4 bars, BM7, D7, GM7, Bb7, EbM7, Am7, D7, GM7\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
  },
  {
    title: "Functional Notation Example",
    content: "@TITLE Functional Demo, @KEY C, # Using Roman numerals, I, vi, ii, V7, I, IV, V7, I, # With secondary dominants, I, V/vi, vi, V/V, V7, I\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
  },
  {
    title: "Forgiving Notation Test",
    content: "@TITLE Notation Test, @KEY C, # Minus notation, A-, D-, # M7 notation, CM7, FM7, # Extensions, G7b9, G13, D9, # Half-dim, Bm7-5, # Mixed, Am, E7, FM7, G7, C\n\n@RHYTHM1 |x x x x|\n@RHYTHM2 |x / x /|\n@RHYTHM3 |x x / x x x / x|"
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
 * bannerMessage: "🎉 [[50% off all courses|https://beatkitchen.io/sale]] this week!"
 * 
 * ANNOUNCEMENT:
 * bannerMessage: "New! [[Expert mode|expert]] includes chord progressions."
 * 
 * CALL TO ACTION:
 * bannerMessage: "Love this? [[Join our community|https://beatkitchen.io/discord]]"
 * 
 * SEASONAL:
 * bannerMessage: "Happy holidays! Use code HARMONY25 at [[checkout|https://beatkitchen.io/shop]]"
 * 
 * MULTIPLE LINKS:
 * bannerMessage: "Try [[Expert mode|expert]] or join a [[gym|https://beatkitchen.io/classroom]]!"
 * 
 * SIMPLE TEXT (no links):
 * bannerMessage: "Thanks for using Harmony Wheel! 🎵"
 * 
 * ==========================================
 * 
 * REMEMBER:
 * - Users can't see or edit bannerMessage in the app
 * - Only you can add/change them via this file
 * - Perfect for promotions, announcements, CTAs
 * - Keep messages concise (~80 chars max)
 */