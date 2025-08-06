import { ALPHABET, VOWELS, EXCLUDE, TILES_TOTAL } from './constants';
import type { Challenge } from '../_types/game';

export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createLetterSet(): string[] {
  const set = new Set<string>();
  
  // Add 3 vowels
  while (set.size < 3) {
    set.add(rand(VOWELS));
  }
  
  // Add 5 consonants (excluding difficult letters)
  const goodCons = ALPHABET.filter(ch => 
    !VOWELS.includes(ch) && !EXCLUDE.includes(ch)
  );
  
  while (set.size < TILES_TOTAL) {
    set.add(rand(goodCons));
  }
  
  return [...set];
}

export function fitsLetters(word: string, letterSet: string[]): boolean {
  return word.toUpperCase().split("").every(ch => letterSet.includes(ch));
}

export function getVowelCount(word: string): number {
  return (word.match(/[aeiou]/gi) || []).length;
}

export function getMiddleLetter(word: string): string {
  return word[Math.floor(word.length / 2)].toUpperCase();
}

export function describeChallenge(challenge: Challenge): string {
  const { type, letter, count, letters, requiredLength } = challenge;
  
  switch (type) {
    case 'start':
      return `Word starting with <b>${letter || '?'}</b> (${requiredLength || 3}+ letters)`;
    case 'end':
      return `Word ending with <b>${letter || '?'}</b> (${requiredLength || 3}+ letters)`;
    case 'middle':
      return `Word with <b>${letter || '?'}</b> in middle (${requiredLength || 3}+ letters)`;
    case 'vowels':
      return `Word with ≥${count || 2} vowels`;
    case 'contains':
      return `Word containing ≥${count || 2} <b>${letter || '?'}s</b> (${requiredLength || 3}+ letters)`;
    case 'uses':
      return `Word using all: <b>${letters?.join(', ') || '?'}</b> (${requiredLength || 3}+ letters)`;
    case 'unique':
      return `Word with no repeated letters (${requiredLength || 3}+ letters)`;
 
    default:
      return '';
  }
} 