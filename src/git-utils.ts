import simpleGit from 'simple-git';
import * as vscode from 'vscode';
import { I18n } from './i18n';

interface GitDiffRepository {
  rootUri?: {
    fsPath: string;
  };
}

/**
 * Retrieves the staged changes from the Git repository.
 */
export async function getDiffStaged(repo: GitDiffRepository): Promise<{ diff: string; error?: string }> {
  try {
    const rootPath = repo?.rootUri?.fsPath || vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!rootPath) {
      throw new Error(I18n.t('error.noWorkspaceFolder'));
    }

    const git = simpleGit(rootPath);
    const diff = await git.diff(['--staged']);

    return {
      diff,
    };
  } catch (error) {
    console.error(I18n.t('error.gitDiffRead'), error);
    return {
      diff: '',
      error: error instanceof Error ? error.message : I18n.t('error.unexpectedError'),
    };
  }
}
