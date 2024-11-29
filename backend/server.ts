import { config } from 'dotenv';

config();

import express from 'express';
import SageMind from './index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Add timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).send('Request timeout');
  });
  next();
});

const sageMind = new SageMind();

(async () => {
  try {
    console.log('Starting server initialization...');
    await sageMind.initialize();
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})();

app.post('/api/sources', async (req, res) => {
  try {
    const { question } = req.body;
    const { similarPassages } = await sageMind.query(question);
    const sources = await sageMind.getSources(similarPassages);
    res.json({ sources, passages: similarPassages });
  } catch (error: any) {
    console.error('Error in /api/sources:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/answer', async (req, res) => {
  try {
    const { question, passages } = req.body;
    const response = await sageMind.getLLMResponse(passages, question);
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      question,
      response
    }));
    
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
