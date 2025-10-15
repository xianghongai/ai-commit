import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, GeminiConfig, LLMClient } from './types';

export function createGeminiClient(conf: GeminiConfig): LLMClient {
  const client = new GoogleGenerativeAI(conf.apiKey);

  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const temperature = conf.params?.temperature ?? 0.7;
      const model = client.getGenerativeModel({ model: conf.model });
      // Simple conversion: join message contents in order
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

      const chat = model.startChat({
        generationConfig: {
          temperature,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      return response.text();
    },
  };
}

