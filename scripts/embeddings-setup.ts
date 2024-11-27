import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { OpenAIService } from '../src/services/openai';
import { PineconeService } from '../src/services/pinecone';

config();

interface Section {
  book: number;
  number: number;
  content: string;
}

function parseText(text: string): Section[] {
  const sections: Section[] = [];
  let currentBook = 0;
  
  // Split by double newline to separate major blocks
  const blocks = text.split('\n\n');
  
  for (const block of blocks) {
    // Check if this is a book header
    if (block.trim().startsWith('THE ')) {
      // Extract book number (could make this more robust)
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

async function setupEmbeddings() {
  console.log('Starting embeddings setup...');
  
  const openai = new OpenAIService();
  const pinecone = new PineconeService();
  await pinecone.initialize();

  try {
    // 1. Load Meditations text
    console.log('Loading Meditations text...');
    const text = await fs.readFile(
      path.join(__dirname, '../data/meditations.txt'), 
      'utf-8'
    );

    // 2. Split into chapters
    console.log('Splitting into chapters...');
    const chapters: Section[] = parseText(text);
    console.log(`Found ${chapters.length} sections to process`);

    // 3. Generate embeddings and store in Pinecone
    console.log('\nGenerating embeddings and storing in Pinecone...');
    for (const [index, chapter] of chapters.entries()) {
      const progress = `[${index + 1}/${chapters.length}]`;
      console.log(`\n${progress} Processing Book ${chapter.book}, Section ${chapter.number}`);
      
      try {
        const embedding = await openai.generateEmbedding(chapter.content);
        console.log(`${progress} Generated embedding (${embedding.length} dimensions)`);
        
        await pinecone.storeEmbedding({
          id: `book${chapter.book}-section${chapter.number}`,
          values: embedding,
          metadata: {
            chapter: chapter.number,
            text: chapter.content.slice(0, 1000) // Store first 1000 chars as metadata
          }
        });
        console.log(`${progress} ✓ Successfully stored in Pinecone`);

      } catch (error: any) {
        console.error(`${progress} ✗ Error processing section:`, error.message);
        continue; // Skip to next chapter if there's an error
      }

      // Optional: Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\nSetup complete! All sections processed.');
  } catch (error: any) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupEmbeddings();
