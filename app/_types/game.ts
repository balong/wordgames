export type ChallengeType = 'start' | 'end' | 'middle' | 'vowels' | 'rhyme' | 'synonym' | 'antonym' | 'contains' | 'uses' | 'unique';

export interface Challenge {
  type: ChallengeType;
  solution: string;
  letter?: string;
  count?: number;
  base?: string;
  target?: string;
  theme: [string, string]; // [background, accent]
  letters?: string[];
  requiredLength?: number;
}

export interface GameState {
  level: number;
  gameActive: boolean;
  currentChallenge: Challenge | null;
  letterSet: string[];
  usedSolutions: Set<string>;
  lastType: ChallengeType | null;
}

export interface LetterSlot {
  letter: string;
  id: string;
}

export interface GameMessage {
  text: string;
  isSuccess?: boolean;
} 