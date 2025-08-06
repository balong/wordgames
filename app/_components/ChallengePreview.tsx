'use client';

import { useEffect, useState } from 'react';
import { describeChallenge } from '../_utils/gameLogic';
import type { Challenge } from '../_types/game';

interface ChallengePreviewProps {
  currentChallenge: Challenge;
  upcomingChallenges: Challenge[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export default function ChallengePreview({
  currentChallenge,
  upcomingChallenges,
  isAnimating,
  onAnimationComplete
}: ChallengePreviewProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'animating' | 'complete'>('idle');

  useEffect(() => {
    if (isAnimating) {
      setAnimationState('animating');
      const timer = setTimeout(() => {
        setAnimationState('complete');
        onAnimationComplete();
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isAnimating, onAnimationComplete]);

  return (
    <div className="challenge-preview-container">
      {/* Upcoming challenges (lower opacity) */}
      {upcomingChallenges.map((challenge, index) => (
        <div
          key={`upcoming-${index}`}
          className={`challenge-preview-item upcoming-${index + 1} ${
            animationState === 'animating' ? 'animate-slide-down' : ''
          }`}
          style={{
            opacity: 0.4,
            transform: `translateY(${(index + 1) * 40}px)`,
            transition: animationState === 'animating' ? 'all 0.5s ease-in-out' : 'none'
          }}
        >
          <div 
            className="text-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: describeChallenge(challenge) }}
          />
        </div>
      ))}
      
      {/* Current challenge (full opacity) */}
      <div
        className={`challenge-preview-item current ${
          animationState === 'animating' ? 'animate-slide-up' : ''
        }`}
        style={{
          opacity: 1,
          transform: animationState === 'animating' ? 'translateY(-40px)' : 'translateY(0)',
          transition: animationState === 'animating' ? 'all 0.5s ease-in-out' : 'none'
        }}
      >
        <div 
          id="challengeDesc"
          dangerouslySetInnerHTML={{ __html: describeChallenge(currentChallenge) }}
        />
      </div>
    </div>
  );
} 