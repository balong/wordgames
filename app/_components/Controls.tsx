'use client';

interface ControlsProps {
  onSubmit: () => void;
  onClear: () => void;
  onReveal: () => void;
  onNewGame: () => void;
  gameActive: boolean;
}

export default function Controls({ 
  onSubmit, 
  onClear, 
  onReveal, 
  onNewGame, 
  gameActive 
}: ControlsProps) {
  return (
    <div className="controls">
      <button onClick={onClear}>
        Clear
      </button>
      <button
        onClick={onSubmit}
        disabled={!gameActive}
        style={{ opacity: !gameActive ? 0.5 : undefined, cursor: !gameActive ? 'not-allowed' : undefined }}
      >
        Submit
      </button>
      <button
        onClick={onReveal}
        disabled={!gameActive}
        style={{ opacity: !gameActive ? 0.5 : undefined, cursor: !gameActive ? 'not-allowed' : undefined }}
      >
        Show Answer
      </button>
      <button onClick={onNewGame}>
        New Game
      </button>
    </div>
  );
} 