// Unified provider types and client interface

export type ProviderType =
  | 'openai'
  | 'openai-compatible'
  | 'openrouter'
  | 'gemini'
  | 'azure-openai'
  | 'ollama';

export type ModelKind = 'chat';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BaseProviderConfig {
  id: string;
  type: ProviderType;
  model: string;
  modelKind?: ModelKind; // default: 'chat'
  displayName?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  params?: {
    temperature?: number;
    top_p?: number;
    maxTokens?: number;
    // Additional vendor-specific params can be injected via adapter
  };
}

export interface OpenAICompatibleConfig extends BaseProviderConfig {
  type: 'openai' | 'openai-compatible' | 'openrouter';
  baseUrl: string; // e.g., https://api.openai.com/v1 or siliconflow
  apiKey: string;
  organization?: string;
}

export interface AzureOpenAIConfig extends BaseProviderConfig {
  type: 'azure-openai';
  endpoint: string; // e.g. https://your-aoai.openai.azure.com
  apiKey: string;
  apiVersion: string; // e.g. 2024-06-01
  deployment: string; // deployment name
}

export interface GeminiConfig extends BaseProviderConfig {
  type: 'gemini';
  apiKey: string;
}

export interface OllamaConfig extends BaseProviderConfig {
  type: 'ollama';
  baseUrl?: string; // default http://127.0.0.1:11434
}

export type ProviderConfig =
  | OpenAICompatibleConfig
  | AzureOpenAIConfig
  | GeminiConfig
  | OllamaConfig;

export interface LLMClient {
  chat(messages: ChatMessage[]): Promise<string>;
}

