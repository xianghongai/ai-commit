import { AzureOpenAI } from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { getProviderTimeoutMs, toOpenAIChatMessages } from './shared';
import type { AzureOpenAIConfig, ChatMessage, LLMClient } from './types';

/** Azure OpenAI 仍要求 model 字段，但实际路由由 deployment 决定。 */
export function buildAzureOpenAIChatRequest(
  conf: AzureOpenAIConfig,
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

/** 使用 openai SDK 的原生 AzureOpenAI 客户端，避免手工拼接部署路径。 */
export function createAzureOpenAIClient(conf: AzureOpenAIConfig): LLMClient {
  const client = new AzureOpenAI({
    apiKey: conf.apiKey,
    endpoint: conf.endpoint,
    apiVersion: conf.apiVersion,
    deployment: conf.deployment,
    defaultHeaders: conf.headers,
    timeout: getProviderTimeoutMs(conf),
  });

  return {
    async chat(messages, options): Promise<string> {
      const completion = await client.chat.completions.create(buildAzureOpenAIChatRequest(conf, messages), {
        signal: options?.signal,
      });
      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
