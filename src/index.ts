import { config } from 'dotenv';
import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';

// Load environment variables
config();

class MeditationsAI {
  private openai: OpenAIService;
  private pinecone: PineconeService;

  constructor() {
    this.openai = new OpenAIService();
    this.pinecone = new PineconeService();
  }

  async initialize(): Promise<void> {
    // Implementation for loading and processing Meditations text
    // and storing embeddings will go here
  }

  async query(question: string): Promise<string> {
    // Implementation for handling user queries will go here
    throw new Error('Not implemented');
  }
}

export default MeditationsAI;

async function main() {
  const meditationsAI = new MeditationsAI();
  try {
    console.log('Initializing MeditationsAI...');
    await meditationsAI.initialize();
    
    // Test query
    const response = await meditationsAI.query('What is virtue?');
    console.log('Response:', response);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();
