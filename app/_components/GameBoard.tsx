'use client';

import { useState, useEffect, useCallback } from 'react';
import LetterTile from './LetterTile';
import WordArea from './WordArea';
import Controls from './Controls';
import Message from './Message';
import Confetti from './Confetti';
import ChallengePreview from './ChallengePreview';
import { createLetterSet } from '../_utils/gameLogic';
import { createSimpleChallenge, getAvailableChallengeTypes } from '../_utils/simpleChallenge';
import { isWord } from '../_actions/wordQuery';
import type { Challenge, ChallengeType, LetterSlot } from '../_types/game';

interface GameBoardProps {
  initialLetterSet?: string[];
}

export default function GameBoard({ initialLetterSet }: GameBoardProps) {
  const [level, setLevel] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [letterSet, setLetterSet] = useState<string[]>([]);
  const [usedSolutions, setUsedSolutions] = useState<Set<string>>(new Set());
  const [usedChallenges, setUsedChallenges] = useState<Set<string>>(new Set());
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [lastType, setLastType] = useState<ChallengeType | null>(null);
  const [recentTypes, setRecentTypes] = useState<ChallengeType[]>([]);
  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Challenge preview system
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sound effects
  const [popSound, setPopSound] = useState<HTMLAudioElement | null>(null);
  const [shineSound, setShineSound] = useState<HTMLAudioElement | null>(null);

  // Initialize sound effects
  useEffect(() => {
    const pop = new Audio('/minimal-pop-click-ui-3-198303.mp3');
    const shine = new Audio('/shine-9-268911.mp3');
    
    // Set shine sound to play only first second
    shine.addEventListener('loadedmetadata', () => {
      shine.currentTime = 0;
    });
    
    setPopSound(pop);
    setShineSound(shine);
  }, []);

  const generateUpcomingChallenges = useCallback(async (
    letters: string[],
    currentLevel: number,
    usedChallenges: Set<string>,
    usedWords: Set<string>,
    recentTypes: ChallengeType[]
  ) => {
    const upcoming: Challenge[] = [];
    
    for (let i = 1; i <= 2; i++) {
      const futureLevel = currentLevel + i;
      const futureUsedChallenges = new Set(usedChallenges);
      const futureUsedWords = new Set(usedWords);
      const futureRecentTypes = [...recentTypes];
      
      try {
        const challenge = createSimpleChallenge(
          letters, 
          null, // No last type for preview
          futureLevel, 
          futureUsedChallenges, 
          futureUsedWords, 
          futureRecentTypes
        );
        upcoming.push(challenge);
        
        // Update tracking for next iteration
        let challengeId: string;
        if (challenge.type === 'vowels') {
          challengeId = `${challenge.type}-${challenge.count}-${challenge.requiredLength}`;
        } else if (challenge.type === 'contains') {
          challengeId = `${challenge.type}-${challenge.letter}-${challenge.count}-${challenge.requiredLength}`;
        } else if (challenge.type === 'uses') {
          challengeId = `${challenge.type}-${challenge.letters?.join(',')}-${challenge.requiredLength}`;
        } else if (challenge.type === 'unique') {
          challengeId = `${challenge.type}-${challenge.requiredLength}`;
        } else {
          challengeId = `${challenge.type}-${challenge.letter}-${challenge.requiredLength}`;
        }
        futureUsedChallenges.add(challengeId);
        futureRecentTypes.push(challenge.type);
        const available = getAvailableChallengeTypes(futureLevel);
        if (available.every(t => futureRecentTypes.includes(t))) {
          futureRecentTypes.splice(0, futureRecentTypes.length, challenge.type);
        }
      } catch (error) {
        console.error(`Error generating preview challenge ${i}:`, error);
      }
    }
    
    return upcoming;
  }, []);

  const startGame = useCallback(() => {
    console.log('Starting game...');
    const newLetterSet = initialLetterSet || createLetterSet();
    console.log('Letter set:', newLetterSet);
    setLetterSet(newLetterSet);
    setUsedSolutions(new Set());
    setUsedChallenges(new Set());
    setUsedWords(new Set());
    setRecentTypes([]);
    setLevel(0);
    setGameActive(true);
    setMessage('');
    setSlots([]);
    setCurrentChallenge(null);
    setIsLoading(true);
    nextPuzzle(newLetterSet, new Set(), 0, null);
  }, [initialLetterSet]);

  const nextPuzzle = async (
    letters: string[],
    used: Set<string>,
    currentLevel: number,
    lastChallengeType: ChallengeType | null
  ) => {
    console.log(`Generating next puzzle for level ${currentLevel}...`);
    try {
      // Use simple challenge for now to test the UI
      const challenge = createSimpleChallenge(letters, lastChallengeType, currentLevel, usedChallenges, usedWords, recentTypes);
      console.log('Challenge generated:', challenge);
      
      // Create unique challenge identifier with specific letter/count
      let challengeId: string;
      if (challenge.type === 'vowels') {
        challengeId = `${challenge.type}-${challenge.count}-${challenge.requiredLength}`;
      } else if (challenge.type === 'contains') {
        challengeId = `${challenge.type}-${challenge.letter}-${challenge.count}-${challenge.requiredLength}`;
      } else if (challenge.type === 'uses') {
        challengeId = `${challenge.type}-${challenge.letters?.join(',')}-${challenge.requiredLength}`;
      } else if (challenge.type === 'unique') {
        challengeId = `${challenge.type}-${challenge.requiredLength}`;
      } else {
        challengeId = `${challenge.type}-${challenge.letter}-${challenge.requiredLength}`;
      }
      const updatedUsedChallenges = new Set(usedChallenges);
      updatedUsedChallenges.add(challengeId);
      setUsedChallenges(updatedUsedChallenges);
      console.log(`Added challenge to used set: ${challengeId}`);

      setCurrentChallenge(challenge);
      setLastType(challenge.type);

      const newRecentTypes = (() => {
        const arr = [...recentTypes, challenge.type];
        const available = getAvailableChallengeTypes(currentLevel);
        if (available.every(t => arr.includes(t))) {
          return [challenge.type];
        }
        return arr;
      })();
      setRecentTypes(newRecentTypes);

      setUsedSolutions(used);
      applyTheme(challenge.theme);
      setSlots([]);
      setMessage(''); // Clear any previous messages
      setIsSuccess(false); // Clear success state
      setIsLoading(false);

      // Generate upcoming challenges for preview
      const upcoming = await generateUpcomingChallenges(
        letters,
        currentLevel,
        updatedUsedChallenges,
        usedWords,
        newRecentTypes
      );
      setUpcomingChallenges(upcoming);
    } catch (error) {
      console.error('Error generating challenge:', error);
      setMessage("Error loading challenge. Please try again.");
      setGameActive(false);
      setIsLoading(false);
    }
  };

  const applyTheme = (theme: [string, string]) => {
    document.documentElement.style.setProperty("--bg", theme[0]);
    document.documentElement.style.setProperty("--accent", theme[1]);
    document.documentElement.style.setProperty("--tile-border", theme[1] + "44");
  };

  const addLetter = (letter: string) => {
    const newSlot: LetterSlot = {
      id: Date.now().toString() + Math.random().toString(),
      letter
    };
    setSlots(prev => [...prev, newSlot]);
    
    // Play pop sound when letter is clicked
    if (popSound) {
      popSound.currentTime = 0;
      popSound.play().catch(err => console.log('Sound play failed:', err));
    }
  };

  const removeSlot = (id: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const clearWord = () => {
    setSlots([]);
  };

  const assembledWord = () => {
    return slots.map(s => s.letter).join("").toLowerCase();
  };

    const handleSubmit = async () => {
    if (!gameActive || !currentChallenge) return;

    const word = assembledWord();
    console.log('Submitting word:', word);
    
    // Basic validation
    if (word.length < 3) {
      setMessage("Need 3+ letters");
      setIsSuccess(false);
      return;
    }
    
    // Check if word has already been used
    if (usedWords.has(word.toLowerCase())) {
      setMessage(`❌ You already used "${word.toUpperCase()}"! Try a different word.`);
      setIsSuccess(false);
      return;
    }
    
    // Check if it's a valid English word
    const isValidWord = await isWord(word);
    if (!isValidWord) {
      setMessage("Not a real word");
      setIsSuccess(false);
      return;
    }
    
    // Check word length requirement
    const requiredLength = currentChallenge.requiredLength || 3;
    if (word.length < requiredLength) {
      setMessage(`Word must be at least ${requiredLength} letters long`);
      setIsSuccess(false);
      return;
    }
    
    // Challenge-specific validation
    const { type, letter, count, solution } = currentChallenge;
    let isValid = false;
    
    switch (type) {
      case 'start':
        isValid = word[0] === (letter || '').toLowerCase();
        break;
      case 'end':
        isValid = word.slice(-1) === (letter || '').toLowerCase();
        break;
      case 'middle':
        const middleIndex = Math.floor(word.length / 2);
        isValid = word[middleIndex] === (letter || '').toLowerCase();
        break;
      case 'vowels':
        const vowelCount = (word.match(/[aeiou]/g) || []).length;
        isValid = vowelCount >= (count || 2);
        break;
      case 'contains':
        const letterCount = (word.match(new RegExp(letter || '', 'gi')) || []).length;
        isValid = letterCount >= (count || 2);
        break;
      case 'uses':
        const requiredLetters = currentChallenge.letters || [];
        isValid = requiredLetters.every(l => word.includes(l.toLowerCase()));
        break;
      case 'unique':
        const uniqueLetters = new Set(word.split(''));
        isValid = uniqueLetters.size === word.length;
        break;
 
      default:
        isValid = word === solution.toLowerCase();
    }
    
    if (isValid) {
      // Add the word to used words set
      setUsedWords(prev => new Set([...prev, word.toLowerCase()]));
      console.log(`Added word '${word}' to used words set`);
      
      // Play shine sound for challenge completion (first 2 seconds only)
      if (shineSound) {
        shineSound.currentTime = 0;
        shineSound.play().catch(err => console.log('Sound play failed:', err));
        
        // Stop the sound after 2 seconds
        setTimeout(() => {
          shineSound.pause();
          shineSound.currentTime = 0;
        }, 2000);
      }
      
      setMessage("✔️ Great!");
      setIsSuccess(true);
      setShowConfetti(true);
      
      setTimeout(() => {
        const newLevel = level + 1;
        console.log(`Level up! ${level} -> ${newLevel}`);
        setLevel(newLevel);
        setSlots([]);
        setIsSuccess(false);
        setShowConfetti(false);
        
        // Start animation
        setIsAnimating(true);
        
        // After animation completes, nextPuzzle will be called with the new level
      }, 2500);
    } else {
      // Provide specific feedback based on challenge type
      let feedback = "Try again!";
      switch (type) {
        case 'start':
          feedback = `Must start with ${letter}`;
          break;
        case 'end':
          feedback = `Must end with ${letter}`;
          break;
        case 'middle':
          feedback = `Need ${letter} in middle`;
          break;
        case 'vowels':
          feedback = `Need ≥${count} vowels`;
          break;
        case 'contains':
          feedback = `Need ≥${count} ${letter}s`;
          break;
        case 'uses':
          const requiredLetters = currentChallenge.letters || [];
          feedback = `Must use: ${requiredLetters.join(', ')}`;
          break;
        case 'unique':
          feedback = `No repeated letters allowed`;
          break;
 
      }
      setMessage(feedback);
      setIsSuccess(false);
    }
  };

  const handleReveal = () => {
    if (gameActive && currentChallenge) {
      const { type, solution, letter, count } = currentChallenge;
      
      // Validate that the solution actually meets the challenge criteria
      let isValidSolution = true;
      let validationMessage = '';
      
      switch (type) {
        case 'start':
          isValidSolution = solution[0] === letter;
          validationMessage = isValidSolution ? '' : ` (should start with ${letter})`;
          break;
        case 'end':
          isValidSolution = solution[solution.length - 1] === letter;
          validationMessage = isValidSolution ? '' : ` (should end with ${letter})`;
          break;
        case 'middle':
          const middleIndex = Math.floor(solution.length / 2);
          isValidSolution = solution[middleIndex] === letter;
          validationMessage = isValidSolution ? '' : ` (should have ${letter} in middle)`;
          break;
        case 'vowels':
          const vowelCount = (solution.match(/[AEIOU]/g) || []).length;
          isValidSolution = vowelCount >= (count || 2);
          validationMessage = isValidSolution ? '' : ` (should have ≥${count} vowels)`;
          break;
        case 'contains':
          const letterCount = (solution.match(new RegExp(letter || '', 'gi')) || []).length;
          isValidSolution = letterCount >= (count || 2);
          validationMessage = isValidSolution ? '' : ` (should contain ≥${count} ${letter}s)`;
          break;
        case 'uses':
          const requiredLetters = currentChallenge.letters || [];
          isValidSolution = requiredLetters.every(l => solution.includes(l));
          validationMessage = isValidSolution ? '' : ` (should use all: ${requiredLetters.join(', ')})`;
          break;
        case 'unique':
          const uniqueLetters = new Set(solution.split(''));
          isValidSolution = uniqueLetters.size === solution.length;
          validationMessage = isValidSolution ? '' : ` (should have no repeated letters)`;
          break;
      }
      
      if (isValidSolution) {
        setMessage(`Answer: ${solution}`);
      } else {
        setMessage(`Answer: ${solution}${validationMessage} - Invalid solution!`);
      }
      setGameActive(false);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    const newLevel = level; // This will be the updated level
    nextPuzzle(letterSet, usedSolutions, newLevel, lastType);
  };

  const handleNewGame = () => {
    startGame();
  };

  useEffect(() => {
    console.log('GameBoard mounted, starting game...');
    startGame();
  }, [startGame]);

  if (isLoading || !currentChallenge) {
    return (
      <div className="flex flex-col items-center">
        <h1>Word Games</h1>
        <div className="text-xl mt-8">Loading...</div>
        {message && <div className="text-lg mt-4">{message}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1>Word Games</h1>
      <div className="text-sm text-gray-600 mb-2">Level {level}</div>
      
      <ChallengePreview
        currentChallenge={currentChallenge}
        upcomingChallenges={upcomingChallenges}
        isAnimating={isAnimating}
        onAnimationComplete={handleAnimationComplete}
      />
      
      <WordArea slots={slots} onSlotClick={removeSlot} />
      
      <div id="tiles">
        {letterSet.map((letter, index) => (
          <LetterTile
            key={index}
            letter={letter}
            onClick={() => addLetter(letter)}
            disabled={!gameActive}
          />
        ))}
      </div>
      
      <Controls
        onSubmit={handleSubmit}
        onClear={clearWord}
        onReveal={handleReveal}
        onNewGame={handleNewGame}
        gameActive={gameActive}
      />
      
      <Message 
        message={message} 
        isSuccess={isSuccess}
        currentTheme={currentChallenge.theme}
      />
      
      <Confetti 
        trigger={showConfetti} 
        theme={currentChallenge.theme}
      />
    </div>
  );
} 