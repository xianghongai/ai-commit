import * as vscode from 'vscode';
import { I18n } from '../i18n';
import { getErrorMessage } from './shared';
import {
  parseProviderConfigs,
  resolveEnvironmentVariables,
  selectActiveProvider,
  validateProviderConfig,
} from './config';
import type { ProviderConfig, ProviderSettingsEntry } from './types';

/** 读取、解析和选择 VS Code settings 中的 Provider。 */
export class ProviderRegistry {
  static getProviders(): ProviderSettingsEntry[] {
    const config = vscode.workspace.getConfiguration('ai-commit');
    const raw = config.get<unknown>('providers', []);
    try {
      return parseProviderConfigs(resolveEnvironmentVariables(raw));
    } catch (error) {
      throw new Error(
        I18n.t('error.invalidProviderConfig', getErrorMessage(error, I18n.t('error.unexpectedError'))),
        { cause: error }
      );
    }
  }

  static getActiveProviderId(): string | undefined {
    const config = vscode.workspace.getConfiguration('ai-commit');
    return config.get<string>('activeProviderId') || undefined;
  }

  static async setActiveProviderId(id: string): Promise<void> {
    selectActiveProvider(this.getProviders(), id);
    const config = vscode.workspace.getConfiguration('ai-commit');
    await config.update('activeProviderId', id, vscode.ConfigurationTarget.Global);
  }

  static validate(conf: ProviderSettingsEntry): ProviderConfig {
    return validateProviderConfig(conf);
  }

  /** 显式配置失效时拒绝 fallback，避免代码 diff 被发送给非预期 Provider。 */
  static getActiveProviderOrThrow(): ProviderConfig {
    const providers = this.getProviders();
    if (!providers.length) {
      throw new Error(I18n.t('error.noProvidersConfigured'));
    }
    const activeProviderId = this.getActiveProviderId();
    if (activeProviderId && !providers.some(({ id }) => id === activeProviderId)) {
      throw new Error(I18n.t('error.activeProviderNotFound', activeProviderId));
    }
    try {
      return selectActiveProvider(providers, activeProviderId);
    } catch (error) {
      throw new Error(
        I18n.t('error.invalidProviderConfig', getErrorMessage(error, I18n.t('error.unexpectedError'))),
        { cause: error }
      );
    }
  }
}
