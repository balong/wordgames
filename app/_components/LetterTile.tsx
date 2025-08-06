'use client';

interface LetterTileProps {
  letter: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function LetterTile({ letter, onClick, disabled = false }: LetterTileProps) {
  return (
    <div
      className={`tile animate-pop ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {letter}
    </div>
  );
} 