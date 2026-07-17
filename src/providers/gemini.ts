import { GoogleGenAI } from '@google/genai';
import type { Content, GenerateContentConfig, GenerateContentParameters } from '@google/genai';
import { createRequestAbortScope, getProviderTimeoutMs } from './shared';
import type { ChatMessage, GeminiConfig, LLMClient } from './types';

/** 将统一角色映射为 Gemini 的 user/model 内容，并把 system 消息提升为 systemInstruction。 */
export function buildGeminiRequest(
  conf: GeminiConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): GenerateContentParameters {
  const systemInstruction = messages
    .filter(({ role }) => role === 'system')
    .map(({ content }) => content)
    .join('\n\n');
  const contents: Content[] = messages
    .filter(({ role }) => role !== 'system')
    .map(({ role, content }) => ({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text: content }],
    }));

  if (!contents.length) {
    throw new Error('Gemini requires at least one user or assistant message');
  }

  const config: GenerateContentConfig = {
    ...(systemInstruction ? { systemInstruction } : {}),
    ...(typeof conf.params?.temperature === 'number' ? { temperature: conf.params.temperature } : {}),
    ...(typeof conf.params?.top_p === 'number' ? { topP: conf.params.top_p } : {}),
    ...(typeof conf.params?.maxTokens === 'number' ? { maxOutputTokens: conf.params.maxTokens } : {}),
    ...(signal ? { abortSignal: signal } : {}),
  };

  return { model: conf.model, contents, config };
}

/** 创建 Gemini Developer API 客户端并保留真实的消息角色语义。 */
export function createGeminiClient(conf: GeminiConfig): LLMClient {
  const timeoutMs = getProviderTimeoutMs(conf);
  const client = new GoogleGenAI({
    apiKey: conf.apiKey,
    httpOptions: {
      timeout: timeoutMs,
      ...(conf.headers ? { headers: conf.headers } : {}),
    },
  });

  return {
    async chat(messages, options): Promise<string> {
      const abortScope = createRequestAbortScope(timeoutMs, options?.signal);
      try {
        const response = await client.models.generateContent(buildGeminiRequest(conf, messages, abortScope.signal));
        return response.text ?? '';
      } finally {
        abortScope.dispose();
      }
    },
  };
}
