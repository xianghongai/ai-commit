import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { AzureOpenAIConfig, ChatMessage, LLMClient } from './types';

export function createAzureOpenAIClient(conf: AzureOpenAIConfig): LLMClient {
  const client = new OpenAI({
    apiKey: conf.apiKey,
    baseURL: `${conf.endpoint}/openai/deployments/${conf.deployment}`,
    // Azure requires api-version as query and uses 'api-key' header
    defaultQuery: { 'api-version': conf.apiVersion },
    defaultHeaders: { 'api-key': conf.apiKey, ...(conf.headers || {}) },
  } as any);

  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const temperature = conf.params?.temperature ?? 0.7;
      const top_p = conf.params?.top_p;
      const max_tokens = conf.params?.maxTokens;

      const completion = await client.chat.completions.create({
        model: conf.model, // In Azure path-based routing, model can be kept as deployment's model name
        messages: messages as unknown as ChatCompletionMessageParam[],
        temperature,
        ...(typeof top_p === 'number' ? { top_p } : {}),
        ...(typeof max_tokens === 'number' ? { max_tokens } : {}),
      });

      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
