// File: src/data/demoSongs.ts
// Purpose: Demo songs database - Easy to edit and update!
// Installation: Place this file in src/data/ directory
// Import in HarmonyWheel.tsx: import { defaultSong, demoSongs } from "./data/demoSongs";

// Demo songs for HarmonyWheel

export interface DemoSong {
  title: string;
  content: string;
}

export const demoSongs: DemoSong[] = [
  {
    title: "DEBUG TEST",
    content: "@TITLE Hello World, @Key G, #hello darkness my old friend, B7, Em"
  },
  {
    title: "Simple Progression",
    content: "@TITLE Simple Song, @KEY C, # Verse, C, Am, F, G, C, Am, F, G, # Chorus, F, G, C, Am, F, G, C, C"
  },
  {
    title: "Autumn Leaves",
    content: "@TITLE Autumn Leaves, @KEY Am, # A Section, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, Am, # B Section, Bm7b5, E7, Am, Am, Dm7, G7, CMaj7, FMaj7, Bm7b5, E7, Am, E7"
  },
  {
    title: "I-V-vi-IV (Pop Progression)",
    content: "@TITLE Pop Progression, @KEY C, # Verse, C, G, Am, F, C, G, Am, F, # Chorus, C, G, Am, F, C, G, F, F"
  },
  {
    title: "12-Bar Blues in C",
    content: "@TITLE 12-Bar Blues, @KEY C, # Chorus, C7, C7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7"
  },
  {
    title: "Giant Steps (First 4 bars)",
    content: "@TITLE Giant Steps, @KEY B, # First 4 bars, BM7, D7, GM7, Bb7, EbM7, Am7, D7, GM7"
  },
  {
    title: "Functional Notation Example",
    content: "@TITLE Functional Demo, @KEY C, # Using Roman numerals, I, vi, ii, V7, I, IV, V7, I, # With secondary dominants, I, V/vi, vi, V/V, V7, I"
  },
  {
    title: "Forgiving Notation Test",
    content: "@TITLE Notation Test, @KEY C, # Minus notation, A-, D-, # M7 notation, CM7, FM7, # Extensions, G7b9, G13, D9, # Half-dim, Bm7-5, # Mixed, Am, E7, FM7, G7, C"
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