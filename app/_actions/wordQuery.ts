'use server';

import { FREQ_THRESHOLD } from '../_utils/constants';

interface DatamuseResult {
  word: string;
  tags?: string[];
}

async function fetchJson(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    return [];
  }
}

export async function wordQuery(query: string): Promise<string[]> {
  const arr = await fetchJson(`https://api.datamuse.com/words?${query}&md=f&max=1000`);
  
  return arr
    .filter((o: DatamuseResult) => {
      if (!o.word || o.word.length < 3 || !/^[a-zA-Z]+$/.test(o.word)) {
        return false;
      }
      
      const tag = (o.tags || []).find((t: string) => t.startsWith("f:"));
      const freq = tag ? parseFloat(tag.slice(2)) : 0;
      
      return freq >= FREQ_THRESHOLD;
    })
    .map((o: DatamuseResult) => o.word);
}

export async function isWord(word: string): Promise<boolean> {
  const response = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  return Array.isArray(response) && response.length > 0;
}

export async function wordMatches(query: string, word: string): Promise<boolean> {
  const list = await wordQuery(query);
  return list.map(x => x.toLowerCase()).includes(word.toLowerCase());
} 