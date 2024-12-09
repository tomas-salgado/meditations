import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAIService } from '../backend/services/openai';
import { PineconeService } from '../backend/services/pinecone';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

// Modified Section type for Enchiridion
interface Section {
  chapter: number;
  content: string;
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

// Simplified parser for Enchiridion format
function parseText(text: string): Section[] {
  const sections: Section[] = [];
  const chapters = text.split(/(?=^[IVX]+$)/m);
  
  for (const chapter of chapters) {
    // Skip empty chapters
    if (!chapter.trim()) continue;
    
    // Extract chapter number and content
    const lines = chapter.split('\n');
    const romanNumeral = lines[0].trim();
    if (romanNumeral.match(/^[IVX]+$/)) {
      sections.push({
        chapter: romanNumeralToNumber(romanNumeral),
        content: lines.slice(1).join('\n').trim()
      });
    }
  }
  
  return sections;
}

async function setupEnchiridionEmbeddings() {
  console.log('Starting Enchiridion embeddings setup...');
  
  const openai = new OpenAIService();
  const pinecone = new PineconeService();
  await pinecone.initialize();

  try {
    // 1. Load Enchiridion text
    console.log('Loading Enchiridion text...');
    const text = await fs.readFile(
      path.join(__dirname, '../data/enchiridion.txt'), 
      'utf-8'
    );

    // 2. Split into chapters
    console.log('Splitting into chapters...');
    const chapters = parseText(text);
    console.log(`Found ${chapters.length} chapters to process`);

    // 3. Generate embeddings and store in Pinecone
    console.log('\nGenerating embeddings...');
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const progress = `[${i + 1}/${chapters.length}]`;
      console.log(`\n${progress} Processing Chapter ${chapter.chapter}`);
      
      try {
        const content = chapter.content;
        console.log('\nText being embedded:');
        console.log('-------------------');
        console.log(content);
        console.log('-------------------\n');
        
        const embedding = await openai.generateEmbedding(content);
        console.log(`${progress} Generated embedding (${embedding.length} dimensions)`);
        
        await pinecone.storeEmbedding({
          id: `enchiridion-chapter${chapter.chapter}`,
          values: embedding,
          metadata: {
            source: "Enchiridion",
            book: 1,
            section: chapter.chapter,
            text: content
          }
        });
        console.log(`${progress} ✓ Successfully stored in Pinecone`);

        // Reduced delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(`${progress} ✗ Error processing chapter:`, error.message);
        continue;
      }
    }

    console.log('\nSetup complete! All chapters processed.');
  } catch (error: any) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

setupEnchiridionEmbeddings(); 