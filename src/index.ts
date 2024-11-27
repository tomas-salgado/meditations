import { config } from 'dotenv';
import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';

config();

class MeditationsAI {
  private openai: OpenAIService;
  private pinecone: PineconeService;

  constructor() {
    this.openai = new OpenAIService();
    this.pinecone = new PineconeService();
  }

  async initialize(): Promise<void> {
    await this.pinecone.initialize();
  }

  async query(question: string): Promise<string> {
    // 1. Generate embedding for the question
    const questionEmbedding = await this.openai.generateEmbedding(question);

    // 2. Search for similar passages in Pinecone
    const similarPassages = await this.pinecone.searchSimilar(questionEmbedding);

    // 3. Format the response with sources including book and chapter
    const response = similarPassages.map(passage => 
      `Book ${passage.book}, Chapter ${passage.chapter}, Score: ${passage.score.toFixed(2)}\n${passage.text}\n`
    ).join('\n---\n');

    return `Here are the most relevant passages from Meditations:\n\n${response}`;
  }
}

export default MeditationsAI;

async function main() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const meditationsAI = new MeditationsAI();
  
  try {
    await meditationsAI.initialize();
    
    // Prompt the user for input
    readline.question('Enter your question about Meditations: ', async (question: string) => {
      try {
        const response = await meditationsAI.query(question);
        console.log('\n' + response);
      } catch (error: any) {
        console.error('Error:', error.message);
      } finally {
        readline.close();
      }
    });
  } catch (error: any) {
    console.error('Error:', error.message);
    readline.close();
  }
}

main();
