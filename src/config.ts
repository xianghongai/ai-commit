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
  private configCache: Map<string, any> = new Map();
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
      const value = config.get<T>(key, defaultValue);
      this.configCache.set(key, value as T);
    }
    return this.configCache.get(key);
  }

  dispose() {
    this.disposable.dispose();
  }

}
