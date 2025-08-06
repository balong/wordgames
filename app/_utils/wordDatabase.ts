import { COMMON_WORD_FREQUENCIES } from './wordDatabaseData';

interface WordEntry {
  word: string;
  frequency: number;
  length: number;
  vowels: number;
}

class WordDatabase {
  private words: Map<string, WordEntry> = new Map();
  private wordsByLength: Map<number, WordEntry[]> = new Map();
  private wordsByVowels: Map<number, WordEntry[]> = new Map();
  private wordsStartingWith: Map<string, WordEntry[]> = new Map();
  private wordsEndingWith: Map<string, WordEntry[]> = new Map();
  private wordsWithMiddleLetter: Map<string, WordEntry[]> = new Map();

  constructor() {
    this.loadWords();
  }

  private loadWords() {
    try {
      // Use the processed word database
      Object.entries(COMMON_WORD_FREQUENCIES).forEach(([word, frequency]) => {
        if (word.length >= 3 && word.length <= 8) {
          const entry: WordEntry = {
            word: word.toUpperCase(),
            frequency,
            length: word.length,
            vowels: (word.match(/[aeiou]/g) || []).length
          };
          
          this.words.set(word.toUpperCase(), entry);
          
          // Index by length
          if (!this.wordsByLength.has(entry.length)) {
            this.wordsByLength.set(entry.length, []);
          }
          this.wordsByLength.get(entry.length)!.push(entry);
          
          // Index by vowel count
          if (!this.wordsByVowels.has(entry.vowels)) {
            this.wordsByVowels.set(entry.vowels, []);
          }
          this.wordsByVowels.get(entry.vowels)!.push(entry);
          
          // Index by starting letter
          const startLetter = entry.word[0];
          if (!this.wordsStartingWith.has(startLetter)) {
            this.wordsStartingWith.set(startLetter, []);
          }
          this.wordsStartingWith.get(startLetter)!.push(entry);
          
          // Index by ending letter
          const endLetter = entry.word[entry.word.length - 1];
          if (!this.wordsEndingWith.has(endLetter)) {
            this.wordsEndingWith.set(endLetter, []);
          }
          this.wordsEndingWith.get(endLetter)!.push(entry);
          
          // Index by middle letter
          const middleIndex = Math.floor(entry.word.length / 2);
          const middleLetter = entry.word[middleIndex];
          if (!this.wordsWithMiddleLetter.has(middleLetter)) {
            this.wordsWithMiddleLetter.set(middleLetter, []);
          }
          this.wordsWithMiddleLetter.get(middleLetter)!.push(entry);
        }
      });
      
      console.log(`Loaded ${this.words.size} words into database`);
      console.log(`Words by length:`, Object.fromEntries(
        Array.from(this.wordsByLength.entries()).map(([length, words]) => [length, words.length])
      ));
      console.log(`Words by vowels:`, Object.fromEntries(
        Array.from(this.wordsByVowels.entries()).map(([vowels, words]) => [vowels, words.length])
      ));
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }

  public findWordsWithLetters(letterSet: string[]): WordEntry[] {
    const availableLetters = new Map<string, number>();
    letterSet.forEach(letter => {
      availableLetters.set(letter, (availableLetters.get(letter) || 0) + 1);
    });

    console.log(`Searching for words with letter set: ${letterSet.join(', ')}`);
    console.log(`Available letters:`, Object.fromEntries(availableLetters));

    const results = Array.from(this.words.values()).filter(entry => {
      const wordLetters = new Map<string, number>();
      entry.word.split('').forEach(letter => {
        wordLetters.set(letter, (wordLetters.get(letter) || 0) + 1);
      });

      // Check if we can make this word with available letters
      for (const [letter, count] of wordLetters) {
        const available = availableLetters.get(letter) || 0;
        if (available < count) return false;
      }
      return true;
    });

    console.log(`Found ${results.length} words that can be made with available letters`);
    if (results.length > 0) {
      console.log(`Sample words:`, results.slice(0, 5).map(w => w.word));
    }

    return results;
  }

  public findWordsStartingWith(letter: string, letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => word.word[0] === letter);
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words starting with '${letter}', ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsEndingWith(letter: string, letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => word.word[word.word.length - 1] === letter);
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words ending with '${letter}', ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsWithMiddleLetter(letter: string, letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => {
      const middleIndex = Math.floor(word.word.length / 2);
      return word.word[middleIndex] === letter;
    });
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words with '${letter}' in middle, ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsWithVowels(vowelCount: number, letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => word.vowels >= vowelCount);
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words with ${vowelCount}+ vowels, ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsContainingLetter(letter: string, count: number, letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => {
      const letterCount = (word.word.match(new RegExp(letter, 'gi')) || []).length;
      return letterCount >= count;
    });
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words containing '${letter}' ${count}+ times, ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsUsingLetters(requiredLetters: string[], letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => {
      return requiredLetters.every(letter => word.word.toLowerCase().includes(letter.toLowerCase()));
    });
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words using all letters [${requiredLetters.join(', ')}], ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public findWordsWithUniqueLetters(letterSet: string[], usedWords?: Set<string>): WordEntry[] {
    const allWords = this.findWordsWithLetters(letterSet);
    const results = allWords.filter(word => {
      const uniqueLetters = new Set(word.word.toLowerCase().split(''));
      return uniqueLetters.size === word.word.length;
    });
    const availableResults = usedWords ? results.filter(word => !usedWords.has(word.word.toLowerCase())) : results;
    console.log(`Found ${results.length} words with unique letters, ${availableResults.length} available (not used)`);
    return availableResults;
  }

  public getRandomWord(words: WordEntry[]): WordEntry | null {
    if (words.length === 0) return null;
    
    // Sort by frequency (higher frequency = more common = better)
    const sortedWords = words.sort((a, b) => b.frequency - a.frequency);
    
    // Pick from top 30% most common words for better quality
    const topWords = sortedWords.slice(0, Math.ceil(sortedWords.length * 0.3));
    return topWords[Math.floor(Math.random() * topWords.length)];
  }
}

// Create a singleton instance
export const wordDatabase = new WordDatabase(); 