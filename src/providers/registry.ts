import * as vscode from 'vscode';
import { ProviderConfig, OpenAICompatibleConfig, AzureOpenAIConfig, GeminiConfig, OllamaConfig } from './types';
import { I18n } from '../i18n';

function resolveEnv(value: string): string {
  // Replace ${env:VAR} with process.env.VAR if present
  const envPattern = /\$\{env:([A-Z0-9_]+)\}/gi;
  return value.replace(envPattern, (_m, name) => process.env[name] ?? '');
}

function deepResolveEnv<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'string') {
    return resolveEnv(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => deepResolveEnv(v)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const out: any = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj as any)) {
      (out as any)[k] = deepResolveEnv(v);
    }
    return out as T;
  }
  return obj;
}

function assertOpenAICompatible(conf: any): asserts conf is OpenAICompatibleConfig {
  if (!conf.baseUrl) {
    throw new Error(`[ai-commit] provider '${conf.id}': baseUrl is required`);
  }
  if (!conf.apiKey) {
    throw new Error(`[ai-commit] provider '${conf.id}': apiKey is required`);
  }
  if (!conf.model) {
    throw new Error(`[ai-commit] provider '${conf.id}': model is required`);
  }
}

function assertAzureOpenAI(conf: any): asserts conf is AzureOpenAIConfig {
  const miss: string[] = [];
  if (!conf.endpoint) {
    miss.push('endpoint');
  }
  if (!conf.apiKey) {
    miss.push('apiKey');
  }
  if (!conf.apiVersion) {
    miss.push('apiVersion');
  }
  if (!conf.deployment) {
    miss.push('deployment');
  }
  if (!conf.model) {
    miss.push('model');
  }
  if (miss.length) {
    throw new Error(`[ai-commit] provider '${conf.id}': missing ${miss.join(', ')}`);
  }
}

function assertGemini(conf: any): asserts conf is GeminiConfig {
  if (!conf.apiKey) {
    throw new Error(`[ai-commit] provider '${conf.id}': apiKey is required`);
  }
  if (!conf.model) {
    throw new Error(`[ai-commit] provider '${conf.id}': model is required`);
  }
}

function assertOllama(conf: any): asserts conf is OllamaConfig {
  if (!conf.model) {
    throw new Error(`[ai-commit] provider '${conf.id}': model is required`);
  }
}

export class ProviderRegistry {
  static getProviders(): ProviderConfig[] {
    const cfg = vscode.workspace.getConfiguration('ai-commit');
    const raw = cfg.get<any[]>('providers', []) || [];
    const resolved = deepResolveEnv(raw) as ProviderConfig[];
    return resolved;
  }

  static getActiveProviderId(): string | undefined {
    const cfg = vscode.workspace.getConfiguration('ai-commit');
    return cfg.get<string>('activeProviderId') || undefined;
  }

  static async setActiveProviderId(id: string) {
    const cfg = vscode.workspace.getConfiguration('ai-commit');
    await cfg.update('activeProviderId', id, vscode.ConfigurationTarget.Global);
  }

  static validate(conf: ProviderConfig) {
    switch (conf.type) {
      case 'openai':
      case 'openai-compatible':
      case 'openrouter':
        assertOpenAICompatible(conf);
        break;
      case 'azure-openai':
        assertAzureOpenAI(conf);
        break;
      case 'gemini':
        assertGemini(conf);
        break;
      case 'ollama':
        assertOllama(conf);
        break;
      default:
        throw new Error(`[ai-commit] provider '${(conf as any).id}': unknown type '${(conf as any).type}'`);
    }
  }

  static getActiveProviderOrThrow(): ProviderConfig {
    const providers = this.getProviders();
    if (!providers.length) {
      throw new Error(I18n.t('error.noProvidersConfigured'));
    }
    const activeId = this.getActiveProviderId();
    const chosen = providers.find((p) => p.id === activeId) ?? providers[0];
    this.validate(chosen);
    return chosen;
  }
}
