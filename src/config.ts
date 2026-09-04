import * as vscode from 'vscode';
// Minimal configuration manager for common settings only

/**
 * Configuration keys used in the AI commit extension.
 * @constant {Object}
 * @property {string} COMMIT_LANGUAGE - The language for AI commit messages.
 */
export enum ConfigKeys {
  COMMIT_LANGUAGE = 'commitLanguage',
}

/**
 * Manages the configuration for the AI commit extension.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  // 缓存跨多种配置项类型，取值时由 getConfig 的类型参数还原
  private configCache: Map<string, unknown> = new Map();
  private disposable: vscode.Disposable;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ai-commit')) {
        this.configCache.clear();

        // no-op for now; provider switching is handled by ProviderRegistry
      }
    });
  }

  static getInstance(context?: vscode.ExtensionContext): ConfigurationManager {
    if (!this.instance && context) {
      this.instance = new ConfigurationManager(context);
    }
    return this.instance;
  }

  getConfig<T>(key: string, defaultValue?: T): T {
    if (!this.configCache.has(key)) {
      const config = vscode.workspace.getConfiguration('ai-commit');
      this.configCache.set(key, config.get<T>(key) ?? defaultValue);
    }
    // 缓存值类型已在写入处丢失，只能由调用方的类型参数还原
    return this.configCache.get(key) as T;
  }

  dispose() {
    this.disposable.dispose();
  }
}
