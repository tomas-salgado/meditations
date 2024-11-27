import { config } from 'dotenv';
import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';
import { ClaudeService } from './services/claude';
import { SearchResult } from './types/index';

config();


class MeditationsAI {
  private openai: OpenAIService;
  private pinecone: PineconeService;
  private claude: ClaudeService;

  constructor() {
    this.openai = new OpenAIService();
    this.pinecone = new PineconeService();
    this.claude = new ClaudeService();
  }

  async initialize(): Promise<void> {
    await this.pinecone.initialize();
  }

  async query(question: string): Promise<string> {
    // 1. Generate embedding for the question
    const questionEmbedding = await this.openai.generateEmbedding(question);

    // 2. Search for similar passages in Pinecone
    const similarPassages = await this.pinecone.searchSimilar(questionEmbedding);

    // 3. Format the passages for LLM consumption
    const formattedPassages = similarPassages.map(formatPassageForLLM).join('\n\n---\n\n');

    // 4. Get response from Claude
    const claudeResponse = await this.claude.askQuestion(formattedPassages, question);

    // 5. Return both the AI response and the supporting passages
    return [
      claudeResponse,
      '\n\nRelevant passages from Meditations:\n',
      formattedPassages
    ].join('\n');
  }
}

export default MeditationsAI;

function formatPassageForLLM(passage: SearchResult): string {
  const parts = [
    '[Book]: ' + passage.book,
    '[Section]: ' + passage.section, 
    '[Relevance Score]: ' + passage.score.toFixed(2),
    '[Source]: ' + passage.source,
    '[Text]: ' + passage.text
  ];

  return parts.join('\n');
}

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
