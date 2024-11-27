import { Chapter, Section } from '../types';

// Helper function to convert Roman numerals to numbers
function romanNumeralToNumber(roman: string): number {
  const values: Record<string, number> = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100
  };
  
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = values[roman[i]];
    const next = values[roman[i + 1]];
    if (next > current) {
      result += next - current;
      i++;
    } else {
      result += current;
    }
  }
  return result;
}

export function splitIntoChapters(text: string): Chapter[] {
  // Implementation will go here
  throw new Error('Not implemented');
}

export function preprocessText(text: string): string {
  // Implementation will go here
  throw new Error('Not implemented');
}

export function parseText(text: string): Section[] {
  const sections: Section[] = [];
  let currentBook = 0;
  
  // Split by double newline to separate major blocks
  const blocks = text.split('\n\n');
  
  for (const block of blocks) {
    // Check if this is a book header
    if (block.trim().startsWith('THE ')) {
      currentBook++;
      continue;
    }
    
    // Check if this is a numbered section
    const match = block.match(/^([IVX]+)\.\s+(.*)/s);
    if (match) {
      const [_, romanNumeral, content] = match;
      sections.push({
        book: currentBook,
        number: romanNumeralToNumber(romanNumeral),
        content: content.trim()
      });
    }
  }
  
  return sections;
}
