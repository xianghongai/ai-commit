import * as vscode from 'vscode';
import { generateCommitMsg } from './generate-commit-msg';
import { ProviderRegistry } from './providers/registry';
import { I18n } from './i18n';

/**
 * Manages the registration and disposal of commands.
 */
export class CommandManager {
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  registerCommands() {
    this.registerCommand('extension.ai-commit', generateCommitMsg);
    this.registerCommand('extension.configure-ai-commit', () =>
      vscode.commands.executeCommand('workbench.action.openSettings', 'ai-commit')
    );

    // Switch active provider (vendor/model)
    this.registerCommand('ai-commit.switchProvider', async () => {
      const providers = ProviderRegistry.getProviders();
      if (!providers.length) {
        vscode.window.showWarningMessage(I18n.t('error.noProvidersForSwitch'));
        return;
      }
      const activeId = ProviderRegistry.getActiveProviderId();
      const items = providers.map((p) => ({
        label: p.displayName || p.id,
        description: `${p.type} · ${p.model}`,
        picked: p.id === activeId,
        id: p.id,
      }));
      const pick = await vscode.window.showQuickPick(items, { placeHolder: I18n.t('picker.selectProvider') });
      if (pick) {
        await ProviderRegistry.setActiveProviderId(pick.id);
        vscode.window.showInformationMessage(I18n.t('info.providerSet', pick.label));
      }
    });

    /**
     * @deprecated
     * This function is deprecated because Gemini API does not currently support listing models via API.
     *
     * Show available Gemini models
     */
    /*
    this.registerCommand('ai-commit.showAvailableGeminiModels', async () => {
      const configManager = ConfigurationManager.getInstance();
      const models = await configManager.getAvailableGeminiModels(); // Use the updated function
      const selected = await vscode.window.showQuickPick(models, {
        placeHolder: 'Please select a Gemini model'
      });

      if (selected) {
        const config = vscode.workspace.getConfiguration('ai-commit');
        await config.update('GEMINI_MODEL', selected, vscode.ConfigurationTarget.Global);
      }
    });
    */
  }

  private registerCommand(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        const result = await vscode.window.showErrorMessage(
          `${I18n.t('status.failed')}: ${error.message}`,
          I18n.t('button.retry'),
          I18n.t('button.configure')
        );

        if (result === I18n.t('button.retry')) {
          await handler(...args);
        } else if (result === I18n.t('button.configure')) {
          await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-commit');
        }
      }
    });

    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
