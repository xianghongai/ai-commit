import * as fs from 'fs-extra';
import * as vscode from 'vscode';
import { getDiffStaged } from './git-utils';
import { getMainCommitPrompt } from './prompts';
import { ProgressHandler } from './utils';
import { ProviderRegistry } from './providers/registry';
import { createClient } from './providers/factory';
import { ChatMessage } from './providers/types';
import { notifyStatusToast } from './utils/notify';
import { I18n } from './i18n';

/**
 * Generates a chat completion prompt for the commit message based on the provided diff.
 *
 * @param {string} diff - The diff string representing changes to be committed.
 * @param {string} additionalContext - Additional context for the changes.
 * @returns {Promise<Array<{ role: string, content: string }>>} - A promise that resolves to an array of messages for the chat completion.
 */
const generateCommitMessageChatCompletionPrompt = async (diff: string, additionalContext?: string) => {
  const INIT_MESSAGES_PROMPT = await getMainCommitPrompt();
  const chatContextAsCompletionRequest: ChatMessage[] = [...(INIT_MESSAGES_PROMPT as any)];

  if (additionalContext) {
    chatContextAsCompletionRequest.push({
      role: 'user',
      content: `Additional context for the changes:\n${additionalContext}`,
    });
  }

  chatContextAsCompletionRequest.push({
    role: 'user',
    content: diff,
  });
  return chatContextAsCompletionRequest;
};

/**
 * Retrieves the repository associated with the provided argument.
 *
 * @param {any} arg - The input argument containing the root URI of the repository.
 * @returns {Promise<vscode.SourceControlRepository>} - A promise that resolves to the repository object.
 */
export async function getRepo(arg) {
  const gitApi = vscode.extensions.getExtension('vscode.git')?.exports.getAPI(1);
  if (!gitApi) {
    throw new Error(I18n.t('error.gitExtensionNotFound'));
  }

  if (typeof arg === 'object' && arg.rootUri) {
    const resourceUri = arg.rootUri;
    const realResourcePath: string = fs.realpathSync(resourceUri!.fsPath);
    for (let i = 0; i < gitApi.repositories.length; i++) {
      const repo = gitApi.repositories[i];
      if (realResourcePath.startsWith(repo.rootUri.fsPath)) {
        return repo;
      }
    }
  }
  return gitApi.repositories[0];
}

/**
 * Generates a commit message based on the changes staged in the repository.
 *
 * @param {any} arg - The input argument containing the root URI of the repository.
 * @returns {Promise<void>} - A promise that resolves when the commit message has been generated and set in the SCM input box.
 */
export async function generateCommitMsg(arg) {
  return ProgressHandler.withProgress('', async (progress) => {
    try {
      const repo = await getRepo(arg);

      const providerConf = ProviderRegistry.getActiveProviderOrThrow();
      const client = createClient(providerConf);

      progress.report({ message: I18n.t('progress.gettingStagedChanges') });
      const { diff, error } = await getDiffStaged(repo);

      if (error) {
        throw new Error(`${I18n.t('error.failedToGetStagedChanges')}: ${error}`);
      }

      if (!diff || diff === 'No changes staged.') {
        throw new Error(I18n.t('error.noChangesStaged'));
      }

      const scmInputBox = repo.inputBox;
      if (!scmInputBox) {
        throw new Error(I18n.t('error.scmInputBoxNotFound'));
      }

      const additionalContext = scmInputBox.value.trim();

      progress.report({
        message: additionalContext
          ? I18n.t('progress.analyzingChangesWithContext')
          : I18n.t('progress.analyzingChanges'),
      });
      const messages = await generateCommitMessageChatCompletionPrompt(diff, additionalContext);

      progress.report({
        message: additionalContext
          ? I18n.t('progress.generatingCommitMessageWithContext')
          : I18n.t('progress.generatingCommitMessage'),
      });
      try {
        const commitMessage = await client.chat(messages as ChatMessage[]);
        if (commitMessage) {
          scmInputBox.value = commitMessage;
          // Success notification
          notifyStatusToast('success', providerConf);
        } else {
          throw new Error(I18n.t('error.failedToGenerateCommitMessage'));
        }
      } catch (err) {
        // Failure notification
        try {
          notifyStatusToast('failed', providerConf);
        } catch {}
        // Fallback to generic message; adapter-specific messages should surface raw err.message
        const message = (err as any)?.message || I18n.t('error.unexpectedError');
        throw new Error(message);
      }
    } catch (error) {
      throw error;
    }
  });
}
