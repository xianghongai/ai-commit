import * as vscode from 'vscode';
import { CommandManager } from './commands';
import { ConfigurationManager } from './config';
import { ProviderRegistry } from './providers/registry';
import { I18n } from './i18n';

/**
 * Activates the extension and registers commands.
 *
 * @param {vscode.ExtensionContext} context - The context for the extension.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    // Initialize i18n system
    I18n.initialize();

    const configManager = ConfigurationManager.getInstance(context);

    const commandManager = new CommandManager(context);
    commandManager.registerCommands();

    context.subscriptions.push({
      dispose: () => {
        configManager.dispose();
        commandManager.dispose();
      },
    });

    const providers = ProviderRegistry.getProviders();
    if (!providers.length) {
      const result = await vscode.window.showWarningMessage(
        I18n.t('error.noProviders'),
        I18n.t('button.yes'),
        I18n.t('button.no')
      );
      if (result === I18n.t('button.yes')) {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-commit.providers');
      }
    }
  } catch (error) {
    console.error(I18n.t('error.failedToActivate'), error);
    throw error;
  }
}

/**
 * Deactivates the extension.
 * This function is called when the extension is deactivated.
 */
export function deactivate() {}
