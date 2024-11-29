import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { OpenAIService } from '../backend/services/openai';
import { PineconeService } from '../backend/services/pinecone';
import { Section } from '../backend/types';
import { ClaudeService } from '../backend/services/claude';

config();

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

// Helper function to parse text into sections
function parseText(text: string): Section[] {
  const sections: Section[] = [];
  let currentBook = 0;
  
  const blocks = text.split('\n\n');
  
  for (const block of blocks) {
    // Check if this is a book header
    if (block.trim().startsWith('THE ')) {
      // Extract book number (could make this more robust)
      currentBook++;
      continue;
    }
    
    // Check if this is a numbered section
    const match = block.match(/^([IVX]+)\.\s+([\s\S]*)/);
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

async function setupEmbeddings() {
  console.log('Starting embeddings setup...');
  
  const openai = new OpenAIService();
  const pinecone = new PineconeService();
  const claude = new ClaudeService();
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
    console.log('\nModernizing passages and generating embeddings...');
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const progress = `[${i + 1}/${chapters.length}]`;
      console.log(`\n${progress} Processing Book ${chapter.book}, Section ${chapter.number}`);
      
      try {
        const modernizedContent = await claude.modernizePassage(chapter.content);
        console.log('\nText being embedded:');
        console.log('-------------------');
        console.log(modernizedContent);
        console.log('-------------------\n');
        
        const embedding = await openai.generateEmbedding(modernizedContent);
        console.log(`${progress} Generated embedding (${embedding.length} dimensions)`);
        
        await pinecone.storeEmbedding({
          id: `book${chapter.book}-section${chapter.number}`,
          values: embedding,
          metadata: {
            source: "Meditations",
            book: chapter.book,
            section: chapter.number,
            text: modernizedContent
          }
        });
        console.log(`${progress} ✓ Successfully stored in Pinecone`);

        // Reduced delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(`${progress} ✗ Error processing section:`, error.message);
        continue;
      }
    }

    console.log('\nSetup complete! All sections processed.');
  } catch (error: any) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

setupEmbeddings();
