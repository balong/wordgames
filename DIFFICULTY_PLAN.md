# Letter Vibes Difficulty Scaling Plan

## Overview
This document defines the exact difficulty progression for Letter Vibes challenges. Difficulty increases every 5 completed challenges (levels 0-4, 5-9, 10-14, etc.).

## Challenge Types & Introduction Schedule

### Available Challenge Types
- **start**: Word starting with a specific letter
- **end**: Word ending with a specific letter  
- **middle**: Word with a specific letter in the middle position
- **vowels**: Word with a minimum number of vowels

### Challenge Type Introduction
- **Level 0-4**: start, end, vowels
- **Level 5+**: start, end, middle, vowels

## Word Length Requirements by Level

### For start/end/middle challenges:
| Level Range | Required Length | Example Words |
|-------------|----------------|---------------|
| 0-4         | 3+ letters     | cat, dog, hat |
| 5-9         | 4+ letters     | star, talk, walk |
| 10-14       | 5+ letters     | about, above, abuse |
| 15-19       | 6+ letters     | abroad, absent, accent |
| 20-24       | 7+ letters     | ability, absence, academy |
| 25+         | 8+ letters     | abortion, absolute, academic |

### For vowels challenges:
| Level Range | Required Vowels | Example Words |
|-------------|-----------------|---------------|
| 0-4         | 2+ vowels      | eat, see, tea |
| 5-9         | 3+ vowels      | audio, area, idea |
| 10+         | 4+ vowels      | beautiful, education |

## Implementation Requirements

### Level Calculation
- Level starts at 0
- Level increments by 1 for each completed challenge
- Difficulty tier = Math.floor(level / 5)

### Word Length Function
```typescript
function getWordLength(level: number): number {
  const tier = Math.floor(level / 5);
  return Math.min(3 + tier, 8); // 3, 4, 5, 6, 7, 8
}
```

### Vowel Count Function
```typescript
function getVowelCount(level: number): number {
  const tier = Math.floor(level / 5);
  return Math.min(2 + tier, 4); // 2, 3, 4
}
```

### Challenge Type Selection
```typescript
function getAvailableTypes(level: number): ChallengeType[] {
  const baseTypes = ['start', 'end', 'vowels'];
  return level >= 5 ? [...baseTypes, 'middle'] : baseTypes;
}
```

## Validation Rules

### Word Length Validation
- For start/end/middle challenges: word.length >= requiredLength
- For vowels challenges: vowelCount >= requiredVowels

### Challenge Generation Requirements
1. Must find words that meet the exact length/vowel requirements
2. Must ensure words can be formed from available letter set
3. Must avoid previously used solutions
4. Must provide fallback options if exact requirements can't be met

## Testing Scenarios

### Level 0-4 (Tier 0)
- ✅ start: 3+ letter words starting with available letters
- ✅ end: 3+ letter words ending with available letters  
- ✅ vowels: 2+ vowel words
- ❌ middle: Should not appear

### Level 5-9 (Tier 1)
- ✅ start: 4+ letter words starting with available letters
- ✅ end: 4+ letter words ending with available letters
- ✅ middle: 4+ letter words with middle letter (NEW!)
- ✅ vowels: 3+ vowel words

### Level 10-14 (Tier 2)
- ✅ start: 5+ letter words starting with available letters
- ✅ end: 5+ letter words ending with available letters
- ✅ middle: 5+ letter words with middle letter
- ✅ vowels: 3+ vowel words

### Level 15-19 (Tier 3)
- ✅ start: 6+ letter words starting with available letters
- ✅ end: 6+ letter words ending with available letters
- ✅ middle: 6+ letter words with middle letter
- ✅ vowels: 4+ vowel words

### Level 20-24 (Tier 4)
- ✅ start: 7+ letter words starting with available letters
- ✅ end: 7+ letter words ending with available letters
- ✅ middle: 7+ letter words with middle letter
- ✅ vowels: 4+ vowel words

### Level 25+ (Tier 5+)
- ✅ start: 8+ letter words starting with available letters
- ✅ end: 8+ letter words ending with available letters
- ✅ middle: 8+ letter words with middle letter
- ✅ vowels: 4+ vowel words

## Debug Information
The console should show:
- Current level
- Required word length for letter challenges
- Required vowel count for vowel challenges
- Available challenge types for current level
- Number of valid words found for each challenge type

## Database Requirements
The word database must contain sufficient words for each tier:
- Tier 0: 3-4 letter words with 2+ vowels
- Tier 1: 4-5 letter words with 3+ vowels  
- Tier 2: 5-6 letter words with 3+ vowels
- Tier 3: 6-7 letter words with 4+ vowels
- Tier 4: 7-8 letter words with 4+ vowels
- Tier 5+: 8 letter words with 4+ vowels 