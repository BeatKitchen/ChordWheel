// File: src/lib/songManager.ts
// Purpose: Song import/export and URL sharing utilities
// Installation: Place this file in src/lib/ directory
// Import in HarmonyWheel.tsx: import { generateShareableURL, ... } from "./lib/songManager";

// Song Management Utilities
// Handles import, export, and URL-based sharing

export interface SongData {
  title?: string;
  key?: string;
  content: string;
}

// Encode song to URL-safe base64
export function encodeSongToURL(songContent: string): string {
  try {
    // Compress and encode
    const encoded = btoa(encodeURIComponent(songContent));
    return encoded;
  } catch (e) {
    console.error('Error encoding song:', e);
    return '';
  }
}

// Decode song from URL parameter
export function decodeSongFromURL(encoded: string): string {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    return decoded;
  } catch (e) {
    console.error('Error decoding song:', e);
    return '';
  }
}

// Generate shareable URL
export function generateShareableURL(songContent: string, baseURL: string = window.location.origin): string {
  const encoded = encodeSongToURL(songContent);
  return `${baseURL}?song=${encoded}`;
}

// Parse song from URL parameter
export function getSongFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('song');
  
  if (encoded) {
    return decodeSongFromURL(encoded);
  }
  
  return null;
}

// Export song as downloadable file
export function exportSongToFile(songContent: string, filename: string = 'harmony-wheel-song.txt') {
  const blob = new Blob([songContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import song from file
export function importSongFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Parse song metadata
export function parseSongMetadata(songContent: string): SongData {
  const data: SongData = { content: songContent };
  
  // Extract title
  const titleMatch = songContent.match(/@TITLE\s+([^,]+)/i);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
  }
  
  // Extract key
  const keyMatch = songContent.match(/@KEY\s+([A-G][#b]?m?)/i);
  if (keyMatch) {
    data.key = keyMatch[1].trim();
  }
  
  return data;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

// Validate song format
export function validateSong(songContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!songContent.trim()) {
    errors.push('Song content is empty');
    return { valid: false, errors };
  }
  
  // Check for at least one chord or modifier
  const tokens = songContent.split(',').map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) {
    errors.push('No valid tokens found');
  }
  
  // Warn if no key specified
  if (!songContent.includes('@KEY')) {
    errors.push('Warning: No key specified (will default to C)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Format song for display
export function formatSongForDisplay(songContent: string): string {
  return songContent
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)
    .join(',\n');
}

// Compress song for shorter URLs (advanced)
export function compressSong(songContent: string): string {
  // Simple abbreviations for shorter URLs
  return songContent
    .replace(/@TITLE\s+/gi, '@T ')
    .replace(/@KEY\s+/gi, '@K ')
    .replace(/@HOME/gi, '@H')
    .replace(/@SUB/gi, '@S')
    .replace(/@REL/gi, '@R')
    .replace(/@PAR/gi, '@P');
}

export function decompressSong(compressed: string): string {
  // Restore full syntax
  return compressed
    .replace(/@T\s+/g, '@TITLE ')
    .replace(/@K\s+/g, '@KEY ')
    .replace(/@H/g, '@HOME')
    .replace(/@S/g, '@SUB')
    .replace(/@R/g, '@REL')
    .replace(/@P/g, '@PAR');
}