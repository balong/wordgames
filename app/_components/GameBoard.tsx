'use client';

import { useState, useEffect, useCallback } from 'react';
import LetterTile from './LetterTile';
import WordArea from './WordArea';
import Controls from './Controls';
import Message from './Message';
import Confetti from './Confetti';
import { createLetterSet } from '../_utils/gameLogic';
import { describeChallenge } from '../_utils/gameLogic';
import { createSimpleChallenge } from '../_utils/simpleChallenge';
import { isWord } from '../_actions/wordQuery';
import type { Challenge, ChallengeType, LetterSlot } from '../_types/game';

interface GameBoardProps {
  initialLetterSet?: string[];
}

export default function GameBoard({ initialLetterSet }: GameBoardProps) {
  const [level, setLevel] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
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
    
    // Generate initial upcoming challenges (for levels 1 and 2)
    const initialUpcoming: Challenge[] = [];
    for (let i = 1; i <= 2; i++) {
      try {
        const challenge = createSimpleChallenge(newLetterSet, null, i, new Set(), new Set(), []);
        initialUpcoming.push(challenge);
      } catch (error) {
        console.error(`Error generating initial upcoming challenge ${i}:`, error);
        initialUpcoming.push({
          type: 'start',
          letter: newLetterSet[0],
          solution: 'fallback',
          theme: ['#f6edf5', '#3e3e3e'],
          requiredLength: 3
        });
      }
    }
    setUpcomingChallenges(initialUpcoming);
    
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
      let challenge: Challenge;
      
      // If we have upcoming challenges, use the first one
      if (upcomingChallenges.length > 0) {
        challenge = upcomingChallenges[0];
        // Remove the used challenge from the list
        setUpcomingChallenges(prev => prev.slice(1));
      } else {
        // Generate a new challenge
        challenge = createSimpleChallenge(letters, lastChallengeType, currentLevel, usedChallenges, usedWords, recentTypes);
      }
      
      console.log('Challenge generated:', challenge);
      
      // Create unique challenge identifier with specific letter/count
      let challengeId: string;
      if (challenge.type === 'vowels') {
        challengeId = `${challenge.type}-${challenge.count}`;
      } else if (challenge.type === 'contains') {
        challengeId = `${challenge.type}-${challenge.letter}-${challenge.count}`;
      } else if (challenge.type === 'uses') {
        challengeId = `${challenge.type}-${challenge.letters?.join(',')}`;
      } else if (challenge.type === 'unique') {
        challengeId = `${challenge.type}`;
      } else {
        challengeId = `${challenge.type}-${challenge.letter}`;
      }
      setUsedChallenges(prev => new Set([...prev, challengeId]));
      console.log(`Added challenge to used set: ${challengeId}`);
      
      setCurrentChallenge(challenge);
      setLastType(challenge.type);
      
      // Update recent types (keep last 3 types to avoid repetition)
      setRecentTypes(prev => {
        const newRecent = [...prev, challenge.type];
        return newRecent.slice(-3); // Keep only last 3 types
      });
      
      setUsedSolutions(used);
      applyTheme(challenge.theme);
      setSlots([]);
      setMessage(''); // Clear any previous messages
      setIsSuccess(false); // Clear success state
      setIsLoading(false);
      
      // Generate new upcoming challenges to replace the one we just used
      const updatedUsedChallenges = new Set([...usedChallenges, challengeId]);
      const updatedRecentTypes = [...recentTypes, challenge.type].slice(-3);
      generateUpcomingChallenges(letters, currentLevel, challenge.type, updatedUsedChallenges, updatedRecentTypes);
    } catch (error) {
      console.error('Error generating challenge:', error);
      setMessage("Error loading challenge. Please try again.");
      setGameActive(false);
      setIsLoading(false);
    }
  };

  const generateUpcomingChallenges = (
    letters: string[], 
    currentLevel: number, 
    lastType: ChallengeType | null,
    updatedUsedChallenges?: Set<string>,
    updatedRecentTypes?: ChallengeType[]
  ) => {
    // Use updated state if provided, otherwise use current state
    const usedChallengesForGeneration = updatedUsedChallenges || usedChallenges;
    const recentTypesForGeneration = updatedRecentTypes || recentTypes;
    
    // Generate one new challenge to replace the one that was used
    try {
      const nextLevel = currentLevel + 1;
      
      // Ensure we don't generate the same type as the current challenge
      let challenge: Challenge;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        challenge = createSimpleChallenge(
          letters, 
          lastType, 
          nextLevel, 
          usedChallengesForGeneration, 
          usedWords, 
          recentTypesForGeneration
        );
        attempts++;
      } while (challenge.type === lastType && attempts < maxAttempts);
      
      // Add the new challenge to the existing upcoming challenges
      setUpcomingChallenges(prev => [...prev, challenge]);
    } catch (error) {
      console.error('Error generating upcoming challenge:', error);
      // Add a fallback challenge if generation fails
      const fallbackChallenge = {
        type: 'start' as ChallengeType,
        letter: letters[0],
        solution: 'fallback',
        theme: ['#f6edf5', '#3e3e3e'] as [string, string],
        requiredLength: 3
      };
      setUpcomingChallenges(prev => [...prev, fallbackChallenge]);
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
        nextPuzzle(letterSet, usedSolutions, newLevel, lastType);
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
      
      {/* Upcoming challenges preview */}
      {upcomingChallenges.length > 0 && (
        <div className="mb-4 opacity-50">
          {upcomingChallenges.slice().reverse().map((challenge, index) => (
            <div key={index} className="text-sm mb-1">
              <span className="text-gray-500">Next {index === 0 ? 2 : 1}:</span>{' '}
              <span dangerouslySetInnerHTML={{ __html: describeChallenge(challenge) }} />
            </div>
          ))}
        </div>
      )}
      
      {/* Current challenge */}
      <div 
        id="challengeDesc"
        dangerouslySetInnerHTML={{ __html: describeChallenge(currentChallenge) }}
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