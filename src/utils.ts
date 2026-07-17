import * as vscode from 'vscode';

/** 包装扩展通知进度，并把 VS Code CancellationToken 暴露给任务。 */
export class ProgressHandler {
  static async withProgress<T>(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>,
      token: vscode.CancellationToken
    ) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `[AI Commit] ${title}`,
        cancellable: true,
      },
      task
    );
  }
}

/** 将 VS Code 取消事件转换为 Provider SDK 通用的 AbortSignal。 */
export function createCancellationSignal(token: vscode.CancellationToken): {
  signal: AbortSignal;
  dispose: () => void;
} {
  const controller = new AbortController();
  const subscription = token.onCancellationRequested(() => controller.abort());
  if (token.isCancellationRequested) {
    controller.abort();
  }
  return {
    signal: controller.signal,
    dispose: () => subscription.dispose(),
  };
}
