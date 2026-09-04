/** Provider 类型必须与 VS Code manifest 中的配置枚举保持一致。 */
export type ProviderType = 'openai' | 'openai-compatible' | 'openrouter' | 'gemini' | 'azure-openai' | 'ollama';

export type ModelKind = 'chat';

/** 所有 adapter 共同消费的最小聊天消息契约。 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 单次聊天调用的运行时控制项，不写入持久化配置。 */
export interface ChatRequestOptions {
  signal?: AbortSignal;
}

/** 各 Provider 当前共同支持的生成参数。 */
export interface ChatGenerationParams {
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
}

/** Provider 配置的公共字段；timeoutMs 的单位为毫秒。 */
export interface BaseProviderConfig {
  id: string;
  type: ProviderType;
  model: string;
  modelKind?: ModelKind;
  timeoutMs?: number;
  headers?: Record<string, string>;
  params?: ChatGenerationParams;
}

/** OpenAI 官方服务允许省略 baseUrl，交由 SDK 使用官方默认值。 */
export interface OpenAIConfig extends BaseProviderConfig {
  type: 'openai';
  baseUrl?: string;
  apiKey: string;
  organization?: string;
}

/** OpenAI-compatible 与 OpenRouter 必须明确声明目标 API 根地址。 */
export interface OpenAICompatibleConfig extends BaseProviderConfig {
  type: 'openai-compatible' | 'openrouter';
  baseUrl: string;
  apiKey: string;
  organization?: string;
}

export type OpenAIChatConfig = OpenAIConfig | OpenAICompatibleConfig;

/** Azure OpenAI 使用 SDK 原生 endpoint、deployment 与 apiVersion 契约。 */
export interface AzureOpenAIConfig extends BaseProviderConfig {
  type: 'azure-openai';
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  deployment: string;
}

/** Gemini Developer API 的 API Key 配置。 */
export interface GeminiConfig extends BaseProviderConfig {
  type: 'gemini';
  apiKey: string;
}

/** Ollama 的 baseUrl 可省略，此时连接本机默认服务地址。 */
export interface OllamaConfig extends BaseProviderConfig {
  type: 'ollama';
  baseUrl?: string;
}

export type ProviderConfig = OpenAIConfig | OpenAICompatibleConfig | AzureOpenAIConfig | GeminiConfig | OllamaConfig;

type OptionalApiKey<TConfig extends ProviderConfig> = TConfig extends { apiKey: string }
  ? Omit<TConfig, 'apiKey'> & { apiKey?: string }
  : TConfig;

/**
 * VS Code settings 中保存的 Provider 条目。
 *
 * 未启用条目可以省略 apiKey 作为配置模板；进入 adapter 前必须收敛为完整 ProviderConfig。
 */
export type ProviderSettingsEntry = OptionalApiKey<ProviderConfig>;

/** Provider adapter 对命令层暴露的统一客户端边界。 */
export interface LLMClient {
  chat(messages: ChatMessage[], options?: ChatRequestOptions): Promise<string>;
}
