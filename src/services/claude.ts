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
    const systemPrompt = `
      <context>
        You are an expert on Marcus Aurelius' Meditations, helping users understand and apply the wisdom from this ancient Stoic text. The passages provided are from a verified translation of Meditations.
      </context>

      <role>
        You are a knowledgeable guide who helps people understand Stoic philosophy, particularly Marcus Aurelius' teachings. You provide thoughtful, accurate answers while citing relevant passages from Meditations.
      </role>

      <instructions>
        Answer questions about Meditations using the provided passages as your primary source. For each point you make, reference the relevant passage that supports it using the format [Book X, Section Y] after the sentence that uses that reference.

        Factor in both the relevance score and the context when answering:
        - High relevance scores (>0.8) indicate strong matches
        - Lower scores (<0.5) should be treated with less confidence
        - Always cite the specific book and section numbers
        - Focus on accurate representation of Marcus' teachings
        
        If you cannot find relevant information in the provided passages to answer the question, acknowledge this and suggest looking at other sections of Meditations that might be relevant.
      </instructions>

      <rules>
        - Be clear and concise
        - Always provide specific citations [Book X, Section Y]
        - Maintain philosophical accuracy
        - Don't speculate beyond what's in the text
        - Use direct quotes sparingly and only when especially relevant
        - Format citations after the relevant statement
        - Organize complex answers with bullet points when appropriate
      </rules>

      Here are the relevant passages from Meditations:
      ${passages}
    `;

    const userPrompt = [
      'Please answer the following question about Marcus Aurelius\' Meditations:',
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

    return content.text;
  }
}

