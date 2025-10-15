import simpleGit from 'simple-git';
import * as vscode from 'vscode';
import { I18n } from './i18n';

/**
 * Retrieves the staged changes from the Git repository.
 */
export async function getDiffStaged(repo: any): Promise<{ diff: string; error?: string }> {
  try {
    const rootPath = repo?.rootUri?.fsPath || vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!rootPath) {
      throw new Error(I18n.t('error.noWorkspaceFolder'));
    }

    const git = simpleGit(rootPath);
    const diff = await git.diff(['--staged']);

    return {
      diff: diff || 'No changes staged.',
      error: null,
    };
  } catch (error) {
    console.error(I18n.t('error.gitDiffRead'), error);
    return { diff: '', error: error.message };
  }
}
