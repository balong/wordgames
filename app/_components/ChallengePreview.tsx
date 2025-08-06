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
      }, 800); // Animation duration - matches CSS transition
      return () => clearTimeout(timer);
    }
  }, [isAnimating, onAnimationComplete]);

  return (
    <div className="challenge-preview-container">
      {/* Upcoming challenges (lower opacity, positioned above current) */}
      {upcomingChallenges.map((challenge, index) => (
        <div
          key={`upcoming-${index}`}
          className={`challenge-preview-item upcoming-${index + 1} ${
            animationState === 'animating' ? 'animate-slide-down' : ''
          }`}
          style={{
            opacity: 0.4,
            transform: `translateY(${-(index + 1) * 40}px)`,
            transition: animationState === 'animating' ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          <div 
            className="text-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: describeChallenge(challenge) }}
          />
        </div>
      ))}
      
      {/* Current challenge (full opacity, at bottom) */}
      <div
        className={`challenge-preview-item current ${
          animationState === 'animating' ? 'animate-fade-out' : ''
        }`}
        style={{
          opacity: animationState === 'animating' ? 0 : 1,
          transform: 'translateY(0)',
          transition: animationState === 'animating' ? 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
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