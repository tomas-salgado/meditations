import OpenAI from 'openai';
import { Chapter } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
