import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { LLMClient, OpenAICompatibleConfig, ChatMessage } from './types';

export function createOpenAICompatibleClient(conf: OpenAICompatibleConfig): LLMClient {
  const client = new OpenAI({
    apiKey: conf.apiKey,
    baseURL: conf.baseUrl,
    organization: (conf as any).organization,
    defaultHeaders: conf.headers,
  } as any);

  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const temperature = conf.params?.temperature ?? 0.7;
      const top_p = conf.params?.top_p;
      const max_tokens = conf.params?.maxTokens;

      const completion = await client.chat.completions.create({
        model: conf.model,
        messages: messages as unknown as ChatCompletionMessageParam[],
        temperature,
        ...(typeof top_p === 'number' ? { top_p } : {}),
        ...(typeof max_tokens === 'number' ? { max_tokens } : {}),
      });

      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
