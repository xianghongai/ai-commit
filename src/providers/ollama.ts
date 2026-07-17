import { createRequestAbortScope, getProviderTimeoutMs, getErrorMessage } from './shared';
import type { ChatMessage, LLMClient, OllamaConfig } from './types';

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';

export interface OllamaChatRequest {
  model: string;
  messages: ChatMessage[];
  stream: false;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

/** 按 Ollama /api/chat 契约构造非流式请求，maxTokens 映射为 num_predict。 */
export function buildOllamaChatRequest(conf: OllamaConfig, messages: ChatMessage[]): OllamaChatRequest {
  const options = {
    ...(typeof conf.params?.temperature === 'number' ? { temperature: conf.params.temperature } : {}),
    ...(typeof conf.params?.top_p === 'number' ? { top_p: conf.params.top_p } : {}),
    ...(typeof conf.params?.maxTokens === 'number' ? { num_predict: conf.params.maxTokens } : {}),
  };

  return {
    model: conf.model,
    messages,
    stream: false,
    ...(Object.keys(options).length ? { options } : {}),
  };
}

/** 只消费官方 ChatResponse.message.content，不猜测其它响应字段。 */
export function parseOllamaChatResponse(value: unknown): string {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('message' in value) ||
    typeof value.message !== 'object' ||
    value.message === null ||
    !('content' in value.message) ||
    typeof value.message.content !== 'string'
  ) {
    throw new Error('Ollama returned an invalid chat response');
  }
  return value.message.content;
}

/** 创建 Ollama 原生 /api/chat 客户端，不要求 API Key。 */
export function createOllamaClient(conf: OllamaConfig): LLMClient {
  const timeoutMs = getProviderTimeoutMs(conf);
  const baseUrl = conf.baseUrl ?? DEFAULT_OLLAMA_BASE_URL;
  const endpoint = new URL('api/chat', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  return {
    async chat(messages, options): Promise<string> {
      const abortScope = createRequestAbortScope(timeoutMs, options?.signal);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...conf.headers },
          body: JSON.stringify(buildOllamaChatRequest(conf, messages)),
          signal: abortScope.signal,
        });
        if (!response.ok) {
          throw new Error(`Ollama request failed with HTTP ${response.status}`);
        }
        return parseOllamaChatResponse(await response.json());
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Ollama request failed'), { cause: error });
      } finally {
        abortScope.dispose();
      }
    },
  };
}
