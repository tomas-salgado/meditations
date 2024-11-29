import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Environment variables:', {
        OPENAI_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
        ANTHROPIC_KEY_EXISTS: !!process.env.ANTHROPIC_API_KEY,
        PINECONE_KEY_EXISTS: !!process.env.PINECONE_API_KEY
      });
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.client = new OpenAI({
      apiKey: apiKey
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      input: text,
      model: "text-embedding-3-small"
    });

    return response.data[0].embedding;
  }
}
