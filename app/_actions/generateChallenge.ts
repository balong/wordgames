'use server';

import { TYPES, BASE_BANK, THEMES } from '../_utils/constants';
import { rand, fitsLetters, getVowelCount, getMiddleLetter } from '../_utils/gameLogic';
import { wordQuery } from './wordQuery';
import type { Challenge, ChallengeType } from '../_types/game';

export async function generateChallenge(
  letterSet: string[], 
  lastType: ChallengeType | null,
  level: number,
  usedSolutions: Set<string>
): Promise<Challenge | null> {
  const fitsLettersCheck = (w: string) => fitsLetters(w, letterSet);
  const unseen = (w: string) => !usedSolutions.has(w.toUpperCase());
  const remember = (w: string) => usedSolutions.add(w.toUpperCase());

  let attempts = 0;
  while (attempts < 60) {
    let type: ChallengeType;
    do {
      type = rand([...TYPES]);
    } while (type === lastType);

    const theme = THEMES[TYPES.indexOf(type)] as [string, string];
    const puzzle = await genChallenge(type, theme, letterSet, level, fitsLettersCheck, unseen, remember);
    
    if (puzzle) {
      return puzzle;
    }
    attempts++;
  }
  
  return null;
}

async function genChallenge(
  type: ChallengeType,
  theme: [string, string],
  letterSet: string[],
  level: number,
  fitsLetters: (w: string) => boolean,
  unseen: (w: string) => boolean,
  remember: (w: string) => void
): Promise<Challenge | null> {
  let word: string;
  let letter: string | undefined;
  let count: number | undefined;
  let base: string | undefined;
  let target: string | undefined;

  if (["start", "end", "middle"].includes(type)) {
    letter = rand(letterSet);
    const pattern = type === "start" 
      ? `${letter.toLowerCase()}*` 
      : type === "end" 
        ? `*${letter.toLowerCase()}` 
        : `*${letter.toLowerCase()}*`;
    
    const list = await wordQuery(`sp=${pattern}`);
    const filtered = list.filter(w => fitsLetters(w) && unseen(w) && w.length >= 3);
    
    if (!filtered.length) return null;
    
    word = rand(filtered).toUpperCase();
    if (type === "middle") {
      letter = getMiddleLetter(word);
    }
  } else if (type === "vowels") {
    count = level < 3 ? 2 : level < 6 ? 3 : 4;
    const list = await wordQuery(`sp=*${rand(letterSet).toLowerCase()}*`);
    const filtered = list.filter(w => 
      fitsLetters(w) && 
      unseen(w) && 
      getVowelCount(w) >= count!
    );
    
    if (!filtered.length) return null;
    word = rand(filtered).toUpperCase();
  } else if (type === "rhyme") {
    target = rand([...BASE_BANK.rhyme]);
    const list = await wordQuery(`rel_rhy=${target}`);
    const filtered = list.filter(w => fitsLetters(w) && unseen(w));
    
    if (!filtered.length) return null;
    word = rand(filtered).toUpperCase();
  } else if (type === "synonym") {
    base = rand([...BASE_BANK.synonym]);
    const list = await wordQuery(`rel_syn=${base}`);
    const filtered = list.filter(w => fitsLetters(w) && unseen(w));
    
    if (!filtered.length) return null;
    word = rand(filtered).toUpperCase();
  } else if (type === "antonym") {
    base = rand([...BASE_BANK.antonym]);
    const list = await wordQuery(`rel_ant=${base}`);
    const filtered = list.filter(w => fitsLetters(w) && unseen(w));
    
    if (!filtered.length) return null;
    word = rand(filtered).toUpperCase();
  } else {
    return null;
  }

  remember(word);
  
  return {
    type,
    solution: word,
    letter,
    count,
    base,
    target,
    theme
  };
} 