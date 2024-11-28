import { config } from 'dotenv';

// Load environment variables before any other imports
config();

// Rest of your imports
import express from 'express';
import MeditationsAI from './index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const meditationsAI = new MeditationsAI();

app.post('/api/sources', async (req, res) => {
  try {
    await meditationsAI.initialize();
    const { question } = req.body;
    const { similarPassages } = await meditationsAI.query(question);
    const sources = await meditationsAI.getSources(similarPassages);
    res.json({ sources, passages: similarPassages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/answer', async (req, res) => {
  try {
    const { question, passages } = req.body;
    const response = await meditationsAI.getLLMResponse(passages, question);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
