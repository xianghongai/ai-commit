import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { getProviderTimeoutMs, toOpenAIChatMessages } from './shared';
import type { ChatMessage, LLMClient, OpenAIChatConfig } from './types';

/** 构造 OpenAI Chat Completions 请求体，保持已验证的 compatible 参数映射。 */
export function buildOpenAIChatRequest(
  conf: OpenAIChatConfig,
  messages: ChatMessage[]
): ChatCompletionCreateParamsNonStreaming {
  return {
    model: conf.model,
    messages: toOpenAIChatMessages(messages),
    temperature: conf.params?.temperature ?? 0.7,
    ...(typeof conf.params?.top_p === 'number' ? { top_p: conf.params.top_p } : {}),
    ...(typeof conf.params?.maxTokens === 'number' ? { max_tokens: conf.params.maxTokens } : {}),
  };
}

/** 创建 OpenAI 官方、OpenRouter 或 OpenAI-compatible 聊天客户端。 */
export function createOpenAICompatibleClient(conf: OpenAIChatConfig): LLMClient {
  const client = new OpenAI({
    apiKey: conf.apiKey,
    ...(conf.baseUrl ? { baseURL: conf.baseUrl } : {}),
    organization: conf.organization,
    defaultHeaders: conf.headers,
    timeout: getProviderTimeoutMs(conf),
  });

  return {
    async chat(messages, options): Promise<string> {
      const completion = await client.chat.completions.create(buildOpenAIChatRequest(conf, messages), {
        signal: options?.signal,
      });
      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
