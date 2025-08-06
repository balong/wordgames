export const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export const VOWELS = [..."AEIOU"];
export const EXCLUDE = ["X", "Y", "Z", "Q", "J"];
export const TILES_TOTAL = 8;
export const TYPES = ["middle", "start", "end", "vowels", "contains", "uses", "unique"] as const;
export const FREQ_THRESHOLD = 2; // Minimum frequency (Datamuse log10 usage) to be considered "common"

export const BASE_BANK = {
  rhyme: ["time", "day", "light", "rain", "game", "star"],
  synonym: ["happy", "angry", "small", "big", "fast", "smart"],
  antonym: ["hot", "dark", "old", "full", "hard", "slow"]
} as const;

export const THEMES = [
  ["#F8EAD8", "#F15A24"], // Orange
  ["#DDF4F6", "#008C9E"], // Teal
  ["#F9DDEC", "#D90368"], // Pink
  ["#E8F6DD", "#5C7F0B"], // Green
  ["#E6E0FF", "#6B4EFF"], // Purple
  ["#FFF4DA", "#FF9F1C"], // Yellow
  ["#E1E8F0", "#3066BE"]  // Blue
] as const;

export const CSS_VARIABLES = {
  bg: 'var(--bg)',
  accent: 'var(--accent)',
  tile: 'var(--tile)',
  tileBorder: 'var(--tile-border)'
} as const; 