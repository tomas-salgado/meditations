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
      environment: process.env.PINECONE_ENVIRONMENT!
    });
    
    // Get index reference
    console.log('Getting index reference...');
    const index = pc.index('meditations');
    
    // 3. Generate a test embedding
    const testText = "What is virtue? It is to live according to nature and reason.";
    console.log('Generating embedding...');
    const embedding = await openai.generateEmbedding(testText);
    
    // 4. Store in Pinecone
    console.log('Storing in Pinecone...');
    await index.upsert([{
      id: 'test-1',
      values: embedding,
      metadata: {
        text: testText
      }
    }]);
    
    console.log('Successfully stored embedding!');
    
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      cause: error.cause?.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }
}

testSimpleUpload();

