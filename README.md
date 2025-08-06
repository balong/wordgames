# WordGames

A fun word puzzle game built with Next.js where players create words from letter tiles to solve various challenges.

## Features

- **Progressive Difficulty**: Word length increases from 3+ to 8+ letters as you advance
- **7 Challenge Types**: 
  - Start: Words beginning with specific letters
  - End: Words ending with specific letters  
  - Middle: Words with letters in the middle
  - Vowels: Words with minimum vowel counts
  - Contains: Words with multiple occurrences of letters
  - Uses: Words using specific required letters
  - Unique: Words with no repeated letters
- **Word Database**: 2,000+ common English words
- **Word Reuse Prevention**: Can't use the same word twice
- **Challenge Rotation**: Ensures variety in challenge types
- **Original Styling**: Preserved visual design from the prototype

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React** with hooks for state management
- **Tailwind CSS** for styling
- **Server Components** for data loading
- **Client Components** for interactivity

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to play!

## Live Demo

Deployed on Vercel - coming soon!
