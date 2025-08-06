'use server';

import { isWord, wordMatches } from './wordQuery';
import { fitsLetters, getVowelCount, getMiddleLetter } from '../_utils/gameLogic';
import type { Challenge } from '../_types/game';

export async function validateWord(
  word: string,
  challenge: Challenge,
  letterSet: string[]
): Promise<{ isValid: boolean; message: string }> {
  // Basic validation
  if (word.length < 3) {
    return { isValid: false, message: "Need 3+ letters" };
  }

  if (!fitsLetters(word, letterSet)) {
    return { isValid: false, message: "Use provided letters only" };
  }

  if (!(await isWord(word))) {
    return { isValid: false, message: "Not a real word" };
  }

  // Challenge-specific validation
  const { type, letter, count, base, target } = challenge;

  switch (type) {
    case 'start':
      if (word[0] !== letter?.toLowerCase()) {
        return { isValid: false, message: `Must start with ${letter}` };
      }
      break;

    case 'end':
      if (word.slice(-1) !== letter?.toLowerCase()) {
        return { isValid: false, message: `Must end with ${letter}` };
      }
      break;

    case 'middle':
      if (getMiddleLetter(word) !== letter) {
        return { isValid: false, message: `Need ${letter} in middle` };
      }
      break;

    case 'vowels':
      if (getVowelCount(word) < (count || 0)) {
        return { isValid: false, message: `Need ≥${count} vowels` };
      }
      break;

    case 'rhyme':
      if (!(await wordMatches(`rel_rhy=${target}`, word))) {
        return { isValid: false, message: `Doesn't rhyme with ${target}` };
      }
      break;

    case 'synonym':
      if (!(await wordMatches(`rel_syn=${base}`, word))) {
        return { isValid: false, message: `Not a synonym of ${base}` };
      }
      break;

    case 'antonym':
      if (!(await wordMatches(`rel_ant=${base}`, word))) {
        return { isValid: false, message: `Not an antonym of ${base}` };
      }
      break;
  }

  return { isValid: true, message: "✔️ Great!" };
} 