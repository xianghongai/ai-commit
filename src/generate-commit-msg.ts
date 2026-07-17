import * as fs from 'fs-extra';
import * as vscode from 'vscode';
import { getDiffStaged } from './git-utils';
import { I18n } from './i18n';
import { getMainCommitPrompt } from './prompts';
import { createClient } from './providers/factory';
import { getErrorMessage } from './providers/shared';
import type { ChatMessage } from './providers/types';
import { ProviderRegistry } from './providers/registry';
import type { ProviderConfig } from './providers/types';
import { selectRepositoryByPath } from './repository-utils';
import { createCancellationSignal, ProgressHandler } from './utils';
import { notifyStatusToast } from './utils/notify';

interface GitRepository {
  rootUri: vscode.Uri;
  inputBox: {
    value: string;
  };
}

interface GitApi {
  repositories: GitRepository[];
}

interface GitExtensionExports {
  getAPI(version: 1): GitApi;
}

interface RepositoryCommandArgument {
  rootUri: vscode.Uri;
}

/** 生成模型所需消息，并保留 SCM 输入框中的附加上下文。 */
export async function generateCommitMessageChatCompletionPrompt(
  diff: string,
  additionalContext?: string
): Promise<ChatMessage[]> {
  const messages = await getMainCommitPrompt();
  if (additionalContext) {
    messages.push({
      role: 'user',
      content: `Additional context for the changes:\n${additionalContext}`,
    });
  }
  messages.push({ role: 'user', content: diff });
  return messages;
}

/** 根据 SCM 命令参数选择仓库；传入仓库无法匹配时拒绝回退到其它仓库。 */
export async function getRepo(arg: unknown): Promise<GitRepository> {
  const gitExtension = vscode.extensions.getExtension<GitExtensionExports>('vscode.git');
  const gitApi = gitExtension?.exports?.getAPI(1);
  if (!gitApi) {
    throw new Error(I18n.t('error.gitExtensionNotFound'));
  }
  if (!gitApi.repositories.length) {
    throw new Error(I18n.t('error.repositoryNotFound'));
  }

  if (isRepositoryCommandArgument(arg)) {
    const resourcePath = fs.realpathSync(arg.rootUri.fsPath);
    const repository = selectRepositoryByPath(
      gitApi.repositories.map((candidate) => ({
        rootPath: fs.realpathSync(candidate.rootUri.fsPath),
        value: candidate,
      })),
      resourcePath
    );
    if (!repository) {
      throw new Error(I18n.t('error.repositoryNotFound'));
    }
    return repository;
  }

  return gitApi.repositories[0];
}

/** 根据目标仓库的 staged diff 生成提交消息并写入其 SCM 输入框。 */
export async function generateCommitMsg(arg: unknown): Promise<void> {
  return ProgressHandler.withProgress('', async (progress, token) => {
    const cancellation = createCancellationSignal(token);
    let providerConf: ProviderConfig | undefined;
    try {
      const repo = await getRepo(arg);
      providerConf = ProviderRegistry.getActiveProviderOrThrow();
      const client = createClient(providerConf);

      progress.report({ message: I18n.t('progress.gettingStagedChanges') });
      const { diff, error } = await getDiffStaged(repo);
      if (error) {
        throw new Error(`${I18n.t('error.failedToGetStagedChanges')}: ${error}`);
      }
      if (!diff) {
        throw new Error(I18n.t('error.noChangesStaged'));
      }

      const additionalContext = repo.inputBox.value.trim();
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
      const commitMessage = await client.chat(messages, { signal: cancellation.signal });
      if (token.isCancellationRequested) {
        throw new vscode.CancellationError();
      }
      if (!commitMessage) {
        throw new Error(I18n.t('error.failedToGenerateCommitMessage'));
      }

      repo.inputBox.value = commitMessage;
      notifyStatusToast('success', providerConf);
    } catch (error) {
      if (token.isCancellationRequested || error instanceof vscode.CancellationError) {
        throw new vscode.CancellationError();
      }
      if (providerConf) {
        notifyStatusToast('failed', providerConf);
      }
      throw new Error(getErrorMessage(error, I18n.t('error.unexpectedError')), { cause: error });
    } finally {
      cancellation.dispose();
    }
  });
}

function isRepositoryCommandArgument(value: unknown): value is RepositoryCommandArgument {
  return typeof value === 'object' && value !== null && 'rootUri' in value && value.rootUri instanceof vscode.Uri;
}
