import { TYPES, THEMES } from './constants';
import { rand } from './gameLogic';
import { wordDatabase } from './wordDatabase';
import type { Challenge, ChallengeType } from '../_types/game';

function getWordLength(level: number): number {
  // Progressive word length based on level
  let length: number;
  if (level <= 5) {
    length = 3; // Levels 1-5: 3 letters
  } else if (level <= 10) {
    length = 4; // Levels 6-10: 4 letters
  } else if (level <= 15) {
    length = 5; // Levels 11-15: 5 letters
  } else if (level <= 20) {
    length = 6; // Levels 16-20: 6 letters
  } else if (level <= 25) {
    length = 7; // Levels 21-25: 7 letters
  } else {
    length = 8; // Levels 26+: 8 letters
  }
  
  console.log(`getWordLength(${level}) = ${length} letters`);
  return length;
}

function getVowelCount(level: number): number {
  // More gradual vowel progression
  if (level <= 15) {
    return 2; // Levels 1-15: 2 vowels
  } else if (level <= 30) {
    return 3; // Levels 16-30: 3 vowels
  } else {
    return 4; // Levels 31+: 4 vowels
  }
}

export function createSimpleChallenge(
  letterSet: string[],
  lastType: ChallengeType | null,
  level: number,
  usedChallenges?: Set<string>,
  usedWords?: Set<string>,
  recentTypes?: ChallengeType[]
): Challenge {
  let type: ChallengeType;
  
  // All challenge types available from the beginning
  const allTypes: ChallengeType[] = ['start', 'end', 'vowels', 'contains', 'middle', 'uses', 'unique'];
  
  console.log(`Level ${level}: all challenge types available: ${allTypes.join(', ')}`);
  
  // Use rotation system to ensure all types are used before repeating
  let availableTypes: ChallengeType[];
  
  if (recentTypes && recentTypes.length > 0) {
    // Find types that haven't been used recently
    const unusedTypes = allTypes.filter(t => !recentTypes.includes(t));
    
    if (unusedTypes.length > 0) {
      // Use types that haven't been used recently
      availableTypes = unusedTypes;
      console.log(`Using unused types: ${unusedTypes.join(', ')}`);
    } else {
      // If all types have been used, start fresh
      availableTypes = allTypes;
      console.log(`All types used, starting fresh with: ${allTypes.join(', ')}`);
    }
  } else {
    // No recent types, use all types
    availableTypes = allTypes;
    console.log(`No recent types, using all: ${allTypes.join(', ')}`);
  }
  
  // Never repeat the same challenge type twice in a row
  const avoidLastType = availableTypes.filter(t => t !== lastType);
  if (avoidLastType.length === 0) {
    // If all types are the same as lastType, use all available types
    type = rand(availableTypes) as ChallengeType;
  } else {
    type = rand(avoidLastType) as ChallengeType;
  }
  
  console.log(`Selected challenge type: ${type} (avoided: ${lastType}, recentTypes: ${recentTypes?.join(', ') || 'none'})`);
  
  // Avoid duplicate challenges if usedChallenges is provided
  if (usedChallenges) {
    let attempts = 0;
    const maxAttempts = 50; // Increase attempts to find unique challenges
    
    while (attempts < maxAttempts) {
      // Generate a test challenge to check if it's unique
      let testLetter: string;
      let testCount: number;
      
      if (type === 'vowels') {
        testCount = getVowelCount(level);
        const challengeId = `${type}-${testCount}`;
        if (!usedChallenges.has(challengeId)) {
          break;
        }
      } else if (type === 'contains') {
        testLetter = rand(letterSet);
        testCount = Math.max(2, Math.floor(level / 5) + 2);
        const challengeId = `${type}-${testLetter}-${testCount}`;
        if (!usedChallenges.has(challengeId)) {
          break;
        }
      } else if (type === 'uses') {
        const requiredCount = Math.min(3, Math.floor(level / 5) + 2);
        const requiredLetters = letterSet.slice(0, requiredCount);
        const challengeId = `${type}-${requiredLetters.join(',')}`;
        if (!usedChallenges.has(challengeId)) {
          break;
        }
      } else if (type === 'unique') {
        const challengeId = `${type}`;
        if (!usedChallenges.has(challengeId)) {
          break;
        }
      } else {
        testLetter = rand(letterSet);
        const challengeId = `${type}-${testLetter}`;
        if (!usedChallenges.has(challengeId)) {
          break;
        }
      }
      
      // Try a different type while maintaining rotation
      const remainingTypes = availableTypes.filter(t => t !== type);
      if (remainingTypes.length > 0) {
        type = rand(remainingTypes) as ChallengeType;
      }
      attempts++;
    }
    
    console.log(`Found unique challenge type after ${attempts} attempts: ${type}`);
  }

  // Validate that this challenge type has available words
  const hasAvailableWords = (challengeType: ChallengeType): boolean => {
    const wordLength = getWordLength(level);
    
    switch (challengeType) {
      case 'start':
        return letterSet.some(letter => {
          const words = wordDatabase.findWordsStartingWith(letter, letterSet, usedWords);
          return words.filter(word => word.length >= wordLength).length > 0;
        });
      case 'end':
        return letterSet.some(letter => {
          const words = wordDatabase.findWordsEndingWith(letter, letterSet, usedWords);
          return words.filter(word => word.length >= wordLength).length > 0;
        });
      case 'middle':
        return letterSet.some(letter => {
          const words = wordDatabase.findWordsWithMiddleLetter(letter, letterSet, usedWords);
          return words.filter(word => word.length >= wordLength).length > 0;
        });
      case 'vowels':
        const vowelCount = getVowelCount(level);
        const vowelWords = wordDatabase.findWordsWithVowels(vowelCount, letterSet, usedWords);
        return vowelWords.length > 0;
      case 'contains':
        return letterSet.some(letter => {
          const count = Math.max(2, Math.floor(level / 5) + 2);
          const words = wordDatabase.findWordsContainingLetter(letter, count, letterSet, usedWords);
          return words.filter(word => word.length >= wordLength).length > 0;
        });
      case 'uses':
        const requiredCount = Math.min(3, Math.floor(level / 5) + 2);
        const requiredLetters = letterSet.slice(0, requiredCount);
        const usesWords = wordDatabase.findWordsUsingLetters(requiredLetters, letterSet, usedWords);
        return usesWords.filter(word => word.length >= wordLength).length > 0;
      case 'unique':
        const uniqueWords = wordDatabase.findWordsWithUniqueLetters(letterSet, usedWords);
        return uniqueWords.filter(word => word.length >= wordLength).length > 0;
      default:
        return true;
    }
  };

  // Try to find a challenge type that has available words
  let attempts = 0;
  const maxAttempts = 20;
  while (attempts < maxAttempts && !hasAvailableWords(type)) {
    type = rand(availableTypes) as ChallengeType;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.warn(`Could not find challenge type with available words after ${maxAttempts} attempts`);
    // Fall back to a simple start challenge
    type = 'start';
  }

  const theme = THEMES[TYPES.indexOf(type as (typeof TYPES)[number])] as [string, string];
  
  // Create appropriate challenge based on type
  switch (type) {
    case 'start': {
      // Try different letters to find one that hasn't been used AND is in the letter set
      let letter: string;
      let attempts = 0;
      const maxAttempts = 50; // Increase attempts since we need to find available letters
      
      do {
        letter = rand(letterSet);
        attempts++;
      } while (attempts < maxAttempts && usedChallenges?.has(`start-${letter}`));
      
      console.log(`Selected letter '${letter}' for start challenge after ${attempts} attempts`);
      
      const wordLength = getWordLength(level);
      const words = wordDatabase.findWordsStartingWith(letter, letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating start challenge: letter=${letter}, length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution) {
        return {
          type,
          solution: solution.word,
          letter,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try different letters but maintain length requirement
      for (let attempt = 0; attempt < 10; attempt++) {
        const newLetter = rand(letterSet);
        if (newLetter === letter) continue;
        
        const newWords = wordDatabase.findWordsStartingWith(newLetter, letterSet, usedWords);
        const newValidWords = newWords.filter(word => word.length >= wordLength);
        const newSolution = wordDatabase.getRandomWord(newValidWords);
        if (newSolution) {
          return {
            type,
            solution: newSolution.word,
            letter: newLetter,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // Last resort: find any word of required length that starts with a letter we have
      const allWords = wordDatabase.findWordsWithLetters(letterSet);
      const longWords = allWords.filter(word => word.length >= wordLength);
      
      // Try to find a word that starts with one of our available letters
      for (const availableLetter of letterSet) {
        const wordsStartingWithLetter = longWords.filter(word => word.word[0] === availableLetter);
        const solution = wordDatabase.getRandomWord(wordsStartingWithLetter);
        if (solution) {
          return {
            type,
            solution: solution.word,
            letter: availableLetter,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // If still no solution, use a fallback but log the issue
      console.warn(`Could not find ${wordLength}+ letter word starting with any available letter at level ${level}`);
      const fallbackSolution = wordDatabase.getRandomWord(words);
      const fallbackLetter = fallbackSolution?.word[0] || letterSet[0];
      return {
        type,
        solution: fallbackSolution?.word || 'CAT',
        letter: fallbackLetter,
        requiredLength: wordLength,
        theme
      };
    }
    
    case 'end': {
      // Try different letters to find one that hasn't been used AND is in the letter set
      let letter: string;
      let attempts = 0;
      const maxAttempts = 50; // Increase attempts since we need to find available letters
      
      do {
        letter = rand(letterSet);
        attempts++;
      } while (attempts < maxAttempts && usedChallenges?.has(`end-${letter}`));
      
      console.log(`Selected letter '${letter}' for end challenge after ${attempts} attempts`);
      
      const wordLength = getWordLength(level);
      const words = wordDatabase.findWordsEndingWith(letter, letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating end challenge: letter=${letter}, length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution) {
        return {
          type,
          solution: solution.word,
          letter,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try different letters but maintain length requirement
      for (let attempt = 0; attempt < 10; attempt++) {
        const newLetter = rand(letterSet);
        if (newLetter === letter) continue;
        
        const newWords = wordDatabase.findWordsEndingWith(newLetter, letterSet, usedWords);
        const newValidWords = newWords.filter(word => word.length >= wordLength);
        const newSolution = wordDatabase.getRandomWord(newValidWords);
        if (newSolution) {
          return {
            type,
            solution: newSolution.word,
            letter: newLetter,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // Last resort: find any word of required length that ends with a letter we have
      const allWords = wordDatabase.findWordsWithLetters(letterSet);
      const longWords = allWords.filter(word => word.length >= wordLength);
      
      // Try to find a word that ends with one of our available letters
      for (const availableLetter of letterSet) {
        const wordsEndingWithLetter = longWords.filter(word => word.word[word.word.length - 1] === availableLetter);
        const solution = wordDatabase.getRandomWord(wordsEndingWithLetter);
        if (solution) {
          return {
            type,
            solution: solution.word,
            letter: availableLetter,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // If still no solution, use a fallback but log the issue
      console.warn(`Could not find ${wordLength}+ letter word ending with any available letter at level ${level}`);
      const fallbackSolution = wordDatabase.getRandomWord(words);
      const fallbackLetter = fallbackSolution?.word[fallbackSolution.word.length - 1] || letterSet[0];
      return {
        type,
        solution: fallbackSolution?.word || 'CAT',
        letter: fallbackLetter,
        requiredLength: wordLength,
        theme
      };
    }
    
    case 'middle': {
      // Try different letters to find one that hasn't been used AND is in the letter set
      let letter: string;
      let attempts = 0;
      const maxAttempts = 50; // Increase attempts since we need to find available letters
      
      do {
        letter = rand(letterSet);
        attempts++;
      } while (attempts < maxAttempts && usedChallenges?.has(`middle-${letter}`));
      
      console.log(`Selected letter '${letter}' for middle challenge after ${attempts} attempts`);
      
      const wordLength = getWordLength(level);
      const words = wordDatabase.findWordsWithMiddleLetter(letter, letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating middle challenge: letter=${letter}, length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution) {
        return {
          type,
          solution: solution.word,
          letter,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try different letters but maintain length requirement
      for (let attempt = 0; attempt < 10; attempt++) {
        const newLetter = rand(letterSet);
        if (newLetter === letter) continue;
        
        const newWords = wordDatabase.findWordsWithMiddleLetter(newLetter, letterSet, usedWords);
        const newValidWords = newWords.filter(word => word.length >= wordLength);
        const newSolution = wordDatabase.getRandomWord(newValidWords);
        if (newSolution) {
          return {
            type,
            solution: newSolution.word,
            letter: newLetter,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // Last resort: find any word of required length
      const allWords = wordDatabase.findWordsWithLetters(letterSet);
      const longWords = allWords.filter(word => word.length >= wordLength);
      const anySolution = wordDatabase.getRandomWord(longWords);
      if (anySolution) {
        const middleIndex = Math.floor(anySolution.word.length / 2);
        return {
          type,
          solution: anySolution.word,
          letter: anySolution.word[middleIndex],
          requiredLength: wordLength,
          theme
        };
      }
      
      // If still no solution, use a fallback but log the issue
      console.warn(`Could not find ${wordLength}+ letter word with any letter in middle at level ${level}`);
      const fallbackSolution = wordDatabase.getRandomWord(words);
      const fallbackLetter = fallbackSolution?.word[Math.floor(fallbackSolution.word.length / 2)] || letterSet[0];
      return {
        type,
        solution: fallbackSolution?.word || 'CAT',
        letter: fallbackLetter,
        requiredLength: wordLength,
        theme
      };
    }
    
    case 'vowels': {
      const count = getVowelCount(level);
      const wordLength = getWordLength(level);
      const words = wordDatabase.findWordsWithVowels(count, letterSet, usedWords);
      const solution = wordDatabase.getRandomWord(words);
      
      console.log(`Creating vowels challenge: count=${count}, found ${words.length} words`);
      
      if (solution) {
        return {
          type,
          solution: solution.word,
          count,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try with slightly fewer vowels but not too much less
      for (let fallbackCount = count - 1; fallbackCount >= Math.max(1, count - 1); fallbackCount--) {
        const fallbackWords = wordDatabase.findWordsWithVowels(fallbackCount, letterSet, usedWords);
        const fallbackSolution = wordDatabase.getRandomWord(fallbackWords);
        if (fallbackSolution) {
          console.log(`Using fallback with ${fallbackCount} vowels instead of ${count}`);
          return {
            type,
            solution: fallbackSolution.word,
            count: fallbackCount,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      // Last resort: find any word with vowels
      const allWords = wordDatabase.findWordsWithLetters(letterSet);
      const vowelWords = allWords.filter(word => word.vowels >= 1);
      const anySolution = wordDatabase.getRandomWord(vowelWords);
      if (anySolution) {
        console.warn(`Could not find word with ${count}+ vowels at level ${level}, using word with ${anySolution.vowels} vowels`);
        return {
          type,
          solution: anySolution.word,
          count: anySolution.vowels,
          requiredLength: wordLength,
          theme
        };
      }
      
      // If still no solution, use a fallback but log the issue
      console.warn(`Could not find any word with vowels at level ${level}`);
      return {
        type,
        solution: 'ATE',
        count: 2,
        requiredLength: wordLength,
        theme
      };
    }

    case 'contains': {
      const wordLength = getWordLength(level);
      const letter = rand(letterSet);
      const count = Math.max(2, Math.floor(level / 5) + 2); // Always require at least 2 occurrences
      const words = wordDatabase.findWordsContainingLetter(letter, count, letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating contains challenge: letter=${letter}, count=${count}, length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution && validWords.length > 0) {
        return {
          type,
          solution: solution.word,
          letter,
          count,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try with exactly 2 occurrences (minimum requirement)
      const fallbackWords = wordDatabase.findWordsContainingLetter(letter, 2, letterSet, usedWords);
      const fallbackValidWords = fallbackWords.filter(word => word.length >= wordLength);
      const fallbackSolution = wordDatabase.getRandomWord(fallbackValidWords);
      if (fallbackSolution && fallbackValidWords.length > 0) {
        console.log(`Using fallback: 2 occurrences`);
        return {
          type,
          solution: fallbackSolution.word,
          letter,
          count: 2,
          requiredLength: wordLength,
          theme
        };
      }
      
      console.warn(`Could not find word containing '${letter}' ${count}+ times at level ${level}`);
      return {
        type,
        solution: 'CAT',
        letter,
        count: 1,
        requiredLength: wordLength,
        theme
      };
    }

    case 'uses': {
      const wordLength = getWordLength(level);
      const requiredCount = Math.min(3, Math.floor(level / 5) + 2); // Start with 2, max 3
      const requiredLetters = letterSet.slice(0, requiredCount);
      const words = wordDatabase.findWordsUsingLetters(requiredLetters, letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating uses challenge: letters=[${requiredLetters.join(', ')}], length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution && validWords.length > 0) {
        return {
          type,
          solution: solution.word,
          letters: requiredLetters,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try with fewer required letters
      for (let fallbackCount = requiredCount - 1; fallbackCount >= 1; fallbackCount--) {
        const fallbackLetters = letterSet.slice(0, fallbackCount);
        const fallbackWords = wordDatabase.findWordsUsingLetters(fallbackLetters, letterSet, usedWords);
        const fallbackValidWords = fallbackWords.filter(word => word.length >= wordLength);
        const fallbackSolution = wordDatabase.getRandomWord(fallbackValidWords);
        if (fallbackSolution) {
          console.log(`Using fallback: ${fallbackCount} letters`);
          return {
            type,
            solution: fallbackSolution.word,
            letters: fallbackLetters,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      console.warn(`Could not find word using all letters [${requiredLetters.join(', ')}] at level ${level}`);
      return {
        type,
        solution: 'CAT',
        letters: [letterSet[0]],
        requiredLength: wordLength,
        theme
      };
    }

    case 'unique': {
      const wordLength = getWordLength(level);
      const words = wordDatabase.findWordsWithUniqueLetters(letterSet, usedWords);
      const validWords = words.filter(word => word.length >= wordLength);
      const solution = wordDatabase.getRandomWord(validWords);
      
      console.log(`Creating unique challenge: length=${wordLength}, found ${words.length} words, valid=${validWords.length}`);
      
      if (solution && validWords.length > 0) {
        return {
          type,
          solution: solution.word,
          requiredLength: wordLength,
          theme
        };
      }
      
      // Try with shorter length
      for (let fallbackLength = wordLength - 1; fallbackLength >= 3; fallbackLength--) {
        const fallbackWords = wordDatabase.findWordsWithUniqueLetters(letterSet, usedWords);
        const fallbackValidWords = fallbackWords.filter(word => word.length >= fallbackLength);
        const fallbackSolution = wordDatabase.getRandomWord(fallbackValidWords);
        if (fallbackSolution) {
          console.log(`Using fallback: ${fallbackLength} letters`);
          return {
            type,
            solution: fallbackSolution.word,
            requiredLength: wordLength,
            theme
          };
        }
      }
      
      console.warn(`Could not find word with unique letters at level ${level}`);
      return {
        type,
        solution: 'CAT',
        requiredLength: wordLength,
        theme
      };
    }
    
    default: {
      const letter = rand(letterSet);
      const wordLength = getWordLength(level);
      const solution = 'CAT';
      return {
        type: 'start',
        solution,
        letter,
        requiredLength: wordLength,
        theme
      };
    }
  }
} 