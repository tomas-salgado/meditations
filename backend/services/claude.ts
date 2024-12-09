import Anthropic from "@anthropic-ai/sdk";

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async askQuestion(passages: string, question: string) {
    console.log('Asking Claude:', {
      question,
      timestamp: new Date().toISOString()
    });
    const systemPrompt = `
      <context>
        You are an expert on Marcus Aurelius' Meditations and Epictetus' Enchiridion, helping people apply ancient Stoic wisdom to modern challenges. The passages provided are from a verified translation of Meditations and Enchiridion.
      </context>

      <role>
        You are a practical life coach who helps people implement Stoic principles in their daily lives. You provide specific, actionable advice while citing relevant passages from Meditations.
      </role>

      <instructions>
        Answer questions by connecting Meditations and Enchiridion to modern life situations. For each piece of advice:
        - Start with a clear, practical recommendation supported by specific passages
        - Cite passages in the format Meditations, Book X, Section Y (never include relevance scores in response)
        - Explain how to implement it in today's context
        - Provide concrete examples or exercises
        
        When analyzing passages:
        - High relevance scores (>0.8): Use as primary support for recommendations
        - Medium scores (0.5-0.8): Use as supporting context
        - Low scores (<0.5): Consider but don't rely on heavily
        
        If you can't find directly relevant passages, acknowledge this and suggest related principles from the text that might apply.
      </instructions>

      <rules>
        - Start with practical advice before philosophical context
        - Always ground recommendations in specific citations
        - Provide concrete "how-to" steps
        - Use modern examples and scenarios
        - Include actionable exercises when appropriate
        - Keep theoretical discussion brief and focused
        - Address the questioner's specific situation
        - Keep response organized. For example, if response includes multiple recommendations and exercises, have recommendation 1, recommendation 2, etc. and exercises 1, exercises 2, etc.
        - Be focused on the question and don't overwhelm the user with too much information. 
      </rules>

      Here are the relevant passages from Meditations and Enchiridion:
      ${passages}
    `;

    const userPrompt = [
      'Please answer the following question about Marcus Aurelius\' Meditations and Epictetus\' Enchiridion:',
      `<question>${question}</question>`
    ].join('\n');

    const msg = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const content = msg.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('Claude Response:', { text: content.text });

    return content.text;
  }

  async modernizePassage(passage: string): Promise<string> {
    const msg = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      temperature: 0,
      system: `You are an expert translator who modernizes ancient philosophical texts into clear, natural modern English.
        You must return ONLY a JSON object in this format:
        {
          "modernized": "your translated text here"
        }

        Guidelines for translation:
        - Use natural, contemporary English
        - Break up long sentences for clarity
        - Keep the philosophical depth but make it accessible
        - Maintain the original ideas and metaphors
        - Use contractions and informal language when appropriate
        - Make it sound like something written today
        - Keep the same meaning but make it engaging
        - Remove archaic terms and phrasing
        - Don't explain or interpret, just translate
        - Don't add or remove content

        Return ONLY valid JSON with your translation.`,
      messages: [
        {
          role: "user", 
          content: `Translate this passage into natural modern English:
            "${passage}"`
        }
      ]
    });

    if (!msg || !msg.content) {
      throw new Error('Invalid response from Claude API');
    }

    const content = msg.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    try {
      const response = JSON.parse(content.text);
      if (!response.modernized) {
        throw new Error('Response missing modernized field');
      }
      return response.modernized;
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse modernized passage from response');
    }
  }
}

