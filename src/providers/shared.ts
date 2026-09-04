import type { BaseProviderConfig, ChatMessage } from './types';

export const DEFAULT_PROVIDER_TIMEOUT_MS = 120_000;

/** 返回 Provider 的有效超时；配置校验负责拒绝非正数。 */
export function getProviderTimeoutMs(conf: BaseProviderConfig): number {
  return conf.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
}

/** 将公共聊天消息复制为 OpenAI Chat Completions 可接受的文本消息。 */
export function toOpenAIChatMessages(messages: ChatMessage[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}

/**
 * 合并上游取消信号与 Provider 超时。
 * 调用方必须在请求结束后执行 dispose，避免长期保留取消监听器。
 */
export function createRequestAbortScope(
  timeoutMs: number,
  upstreamSignal?: AbortSignal
): {
  signal: AbortSignal;
  dispose: () => void;
} {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);

  if (upstreamSignal?.aborted) {
    abortFromUpstream();
  } else {
    upstreamSignal?.addEventListener('abort', abortFromUpstream, { once: true });
  }

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout);
      upstreamSignal?.removeEventListener('abort', abortFromUpstream);
    },
  };
}

/** 未知异常只在通用错误边界提取标准 Error.message。 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
