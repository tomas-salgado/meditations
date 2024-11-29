import { Pinecone } from '@pinecone-database/pinecone';
import { Embedding, SearchResult } from '../types';

export class PineconeService {
  private client: Pinecone;
  private index: any;

  constructor() {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  async initialize() {
    try {
      console.log('Initializing Pinecone index...');
      this.index = this.client.index('meditations-modernized');
      
      console.log('PineconeService initialized successfully');
    } catch (error: any) {
      console.error('Pinecone initialization error:', {
        message: error.message,
        cause: error.cause?.message,
        code: error.cause?.code,
        stack: error.stack
      });
      throw error;
    }
  }

  async storeEmbedding(embedding: Embedding): Promise<void> {
    if (!this.index) {
      throw new Error('Pinecone index not initialized. Call initialize() first.');
    }
    
    await this.index.upsert([{
      id: embedding.id,
      values: embedding.values,
      metadata: embedding.metadata
    }]);
  }

  async searchSimilar(embedding: number[]): Promise<SearchResult[]> {
    const results = await this.index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true
    });
    
    return results.matches.map((match: any) => ({
      score: match.score,
      book: match.metadata.book,
      section: match.metadata.section,
      text: match.metadata.text,
      source: match.metadata.source
    }));
  }
}
