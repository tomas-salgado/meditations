import { config } from 'dotenv';
import { OpenAIService } from './services/openai';
import { PineconeService } from './services/pinecone';
import { ClaudeService } from './services/claude';
import { SearchResult } from './types/index';

config();

class Aurelius {
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

  async query(question: string): Promise<{ similarPassages: SearchResult[]}> {
    const questionEmbedding = await this.openai.generateEmbedding(question);
    const similarPassages = await this.pinecone.searchSimilar(questionEmbedding);
    return { similarPassages };
  }

  async getSources(similarPassages: SearchResult[]): Promise<Array<{
    title: string;
    details: string;
    text: string;
    score: number;
  }>> {
    return similarPassages.map(passage => ({
      title: 'Meditations',
      details: `Book ${passage.book}, Section ${passage.section}`,
      text: passage.text,
      score: passage.score
    }));
  }

  async getLLMResponse(similarPassages: SearchResult[], question: string): Promise<string> {
    const formattedPassages = similarPassages.map(formatPassageForLLM).join('\n\n---\n\n');
    const claudeResponse = await this.claude.askQuestion(formattedPassages, question);
    return claudeResponse;
  }  
}


export default Aurelius;

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
