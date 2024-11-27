import { config } from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIService } from '../src/services/openai';

// Load environment variables
config();

async function testSimpleUpload() {
  try {
    // 1. Initialize OpenAI
    const openai = new OpenAIService();
    
    console.log('Configuration:', {
      apiKey: process.env.PINECONE_API_KEY?.slice(0, 5) + '...',
      environment: process.env.PINECONE_ENVIRONMENT
    });

    // 2. Initialize Pinecone directly
    console.log('Connecting to Pinecone...');
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = "meditations"
    
    // Get index reference
    console.log('Getting index reference...');
    const index = pc.index(indexName);
    
    // 3. Generate test embeddings for multiple texts
    const testData = [
      { id: 'test-1', text: "What is virtue? It is to live according to nature and reason." },
      { id: 'test-2', text: "The best revenge is to be unlike him who performed the injury." }
    ];
    
    console.log('Generating embeddings...');
    const embeddings = await Promise.all(
      testData.map(d => openai.generateEmbedding(d.text))
    );
    
    // 4. Prepare records for batch upsert
    const records = testData.map((d, i) => ({
      id: d.id,
      values: embeddings[i],
      metadata: { text: d.text }
    }));
    
    // 5. Store in Pinecone
    console.log('Storing in Pinecone...');
    await index.upsert(records);
    
    console.log('Successfully stored embeddings!');
    
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      cause: error.cause?.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }
}

testSimpleUpload();

