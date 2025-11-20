import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { ConfigKeys, ConfigurationManager } from './config';

// Map user-friendly flavor names to actual file names
function mapFlavorToFilename(flavor: string): string {
  const flavorMap: Record<string, string> = {
    'Conventional Commits': 'without_gitmoji.md',
    'Conventional Commits with Gitmoji': 'with_gitmoji.md',
    // Backward compatibility for old config values
    without_gitmoji: 'without_gitmoji.md',
    with_gitmoji: 'with_gitmoji.md',
  };
  return flavorMap[flavor] || 'without_gitmoji.md';
}

// Load prompt content from prompt directory based on flavor
function loadPromptFromBundle(): string {
  // try external file first
  const external = loadExternalPromptFile();
  if (external) {
    return external;
  }

  // fallback to bundled flavor
  const flavor =
    (vscodeWorkspaceGet('ai-commit.promptFlavor', 'Conventional Commits') as string) || 'Conventional Commits';
  const filename = mapFlavorToFilename(flavor);
  const full = path.join(__dirname, '..', 'prompt', filename);
  try {
    return fs.readFileSync(full, 'utf8');
  } catch {
    // Fallback minimal prompt
    return 'You are a git commit message generator. Output only the commit message.';
  }
}

function vscodeWorkspaceGet<T>(key: string, defaultValue: T): T {
  // Lazy import to avoid circular
  const vscode = require('vscode') as typeof import('vscode');
  const config = vscode.workspace.getConfiguration();
  const value = config.get<T>(key, defaultValue);
  return value ?? defaultValue;
}

function expandPath(p: string): string {
  if (!p) {
    return p;
  }
  // expand env vars: ${env:VAR}
  p = p.replace(/\$\{env:([A-Z0-9_]+)\}/gi, (_, name) => process.env[name] ?? '');
  // expand home ~ at start
  if (p.startsWith('~')) {
    p = path.join(os.homedir(), p.slice(1));
  }
  return p;
}

function loadExternalPromptFile(): string | undefined {
  const file = vscodeWorkspaceGet('ai-commit.promptFile', '') as string;
  if (!file || !String(file).trim()) {
    return undefined;
  }
  const full = expandPath(file.trim());
  try {
    if (fs.existsSync(full)) {
      return fs.readFileSync(full, 'utf8');
    }
  } catch {
    // ignore
  }
  return undefined;
}

export const getMainCommitPrompt = async () => {
  const language =
    ConfigurationManager.getInstance().getConfig<string>(ConfigKeys.COMMIT_LANGUAGE, 'English') ?? 'English';
  let base = loadPromptFromBundle();
  // Replace placeholders
  base = base.replace(/\{\{LANG\}\}/g, language);
  const supplement = `\n\nRemember: All output MUST be in ${language} language. Your response must contain NOTHING but the commit message itself.`;
  return [{ role: 'system', content: `${base}${supplement}` }];
};
