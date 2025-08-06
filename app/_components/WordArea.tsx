'use client';

import { useState } from 'react';

interface LetterSlot {
  id: string;
  letter: string;
}

interface WordAreaProps {
  slots: LetterSlot[];
  onSlotClick: (id: string) => void;
}

export default function WordArea({ slots, onSlotClick }: WordAreaProps) {
  return (
    <div id="wordArea">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="letter-slot animate-pop"
          onClick={() => onSlotClick(slot.id)}
        >
          {slot.letter}
        </div>
      ))}
    </div>
  );
} 