import { LLMClient, ProviderConfig } from './types';
import { createOpenAICompatibleClient } from './openaiCompatible';
import { createAzureOpenAIClient } from './azureOpenAI';
import { createGeminiClient } from './gemini';

export function createClient(conf: ProviderConfig): LLMClient {
  switch (conf.type) {
    case 'openai':
    case 'openai-compatible':
    case 'openrouter':
      return createOpenAICompatibleClient(conf);
    case 'azure-openai':
      return createAzureOpenAIClient(conf);
    case 'gemini':
      return createGeminiClient(conf);
    default:
      throw new Error(`Unsupported provider type: ${(conf as any).type}`);
  }
}

