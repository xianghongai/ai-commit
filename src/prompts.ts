import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigKeys, ConfigurationManager } from './config';
import { I18n } from './i18n';
import { getErrorMessage } from './providers/shared';
import type { ChatMessage } from './providers/types';

const FLAVOR_FILES: Record<string, string> = {
  'Conventional Commits': 'without_gitmoji.md',
  'Conventional Commits with Gitmoji': 'with_gitmoji.md',
  // 兼容旧版本已写入 settings 的 flavor 值；用户迁移完成后仍可长期无害保留。
  without_gitmoji: 'without_gitmoji.md',
  with_gitmoji: 'with_gitmoji.md',
};

/** 读取自定义或内置 Prompt；显式自定义文件失败时不允许静默降级。 */
function loadMainPrompt(): string {
  const config = vscode.workspace.getConfiguration('ai-commit');
  const promptFile = config.get<string>('promptFile', '').trim();
  if (promptFile) {
    const fullPath = expandPath(promptFile);
    try {
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      throw new Error(I18n.t('error.customPromptRead', fullPath, getErrorMessage(error, 'Unknown error')), {
        cause: error,
      });
    }
  }

  const flavor = config.get<string>('promptFlavor', 'Conventional Commits');
  const filename = FLAVOR_FILES[flavor] ?? FLAVOR_FILES['Conventional Commits'];
  const fullPath = path.join(__dirname, '..', 'prompt', filename);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    throw new Error(I18n.t('error.bundledPromptRead', filename), { cause: error });
  }
}

/** 展开 Prompt 路径中契约允许的环境变量与用户主目录前缀。 */
function expandPath(value: string): string {
  const expandedEnvironment = value.replace(
    /\$\{env:([A-Z0-9_]+)\}/gi,
    (_match, name: string) => process.env[name] ?? ''
  );
  if (expandedEnvironment === '~') {
    return os.homedir();
  }
  if (expandedEnvironment.startsWith('~/')) {
    return path.join(os.homedir(), expandedEnvironment.slice(2));
  }
  return expandedEnvironment;
}

/** 返回带语言约束的 system 消息。 */
export async function getMainCommitPrompt(): Promise<ChatMessage[]> {
  const language =
    ConfigurationManager.getInstance().getConfig<string>(ConfigKeys.COMMIT_LANGUAGE, 'English') ?? 'English';
  const base = loadMainPrompt().replace(/\{\{LANG\}\}/g, language);
  const supplement = `\n\nRemember: All output MUST be in ${language} language. Your response must contain NOTHING but the commit message itself.`;
  return [{ role: 'system', content: `${base}${supplement}` }];
}
