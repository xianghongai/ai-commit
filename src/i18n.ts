import * as vscode from 'vscode';

/**
 * Manages internationalization for the extension UI.
 * Note: This is separate from the commit message language (AI_COMMIT_LANGUAGE).
 */
export class I18n {
  private static messages: Record<string, Record<string, string>> = {
    en: {
      'error.noProviders': 'No AI providers configured. Configure ai-commit.providers now?',
      'error.noProvidersForSwitch': 'No providers configured. Add ai-commit.providers in settings.',
      'error.failedToActivate': 'Failed to activate extension',
      'error.gitExtensionNotFound': 'Git extension not found',
      'error.failedToGetStagedChanges': 'Failed to get staged changes',
      'error.noChangesStaged': 'No changes staged for commit',
      'error.scmInputBoxNotFound': 'Unable to find the SCM input box',
      'error.failedToGenerateCommitMessage': 'Failed to generate commit message',
      'error.unexpectedError': 'An unexpected error occurred',
      'error.noWorkspaceFolder': 'No workspace folder found',
      'error.gitDiffRead': 'Error reading Git diff',
      'error.noProvidersConfigured': 'No providers configured. Please configure ai-commit.providers',
      'progress.gettingStagedChanges': 'Getting staged changes...',
      'progress.analyzingChanges': 'Analyzing changes...',
      'progress.analyzingChangesWithContext': 'Analyzing changes with additional context...',
      'progress.generatingCommitMessage': 'Generating commit message...',
      'progress.generatingCommitMessageWithContext': 'Generating commit message with additional context...',
      'button.yes': 'Yes',
      'button.no': 'No',
      'button.retry': 'Retry',
      'button.configure': 'Configure',
      'picker.selectProvider': 'Select AI provider/model',
      'info.providerSet': 'Active AI provider set to: {0}',
      'status.success': 'Success',
      'status.failed': 'Failed',
    },
    'zh-cn': {
      'error.noProviders': '未配置 AI 提供商。现在配置 ai-commit.providers 吗？',
      'error.noProvidersForSwitch': '未配置提供商。请在设置中添加 ai-commit.providers。',
      'error.failedToActivate': '扩展激活失败',
      'error.gitExtensionNotFound': '未找到 Git 扩展',
      'error.failedToGetStagedChanges': '获取暂存更改失败',
      'error.noChangesStaged': '没有暂存的更改可提交',
      'error.scmInputBoxNotFound': '无法找到 SCM 输入框',
      'error.failedToGenerateCommitMessage': '生成提交消息失败',
      'error.unexpectedError': '发生意外错误',
      'error.noWorkspaceFolder': '未找到工作区文件夹',
      'error.gitDiffRead': '读取 Git diff 时出错',
      'error.noProvidersConfigured': '未配置提供商。请配置 ai-commit.providers',
      'progress.gettingStagedChanges': '正在获取暂存的更改...',
      'progress.analyzingChanges': '正在分析更改...',
      'progress.analyzingChangesWithContext': '正在分析更改（附加上下文）...',
      'progress.generatingCommitMessage': '正在生成提交消息...',
      'progress.generatingCommitMessageWithContext': '正在生成提交消息（附加上下文）...',
      'button.yes': '是',
      'button.no': '否',
      'button.retry': '重试',
      'button.configure': '配置',
      'picker.selectProvider': '选择 AI 提供商/模型',
      'info.providerSet': '活动 AI 提供商已设置为：{0}',
      'status.success': '成功',
      'status.failed': '失败',
    },
  };

  private static locale: string = 'en';

  /**
   * Initialize the i18n system with the current VS Code locale
   */
  static initialize() {
    const vscodeLocale = vscode.env.language;
    this.locale = this.normalizeLocale(vscodeLocale);
  }

  /**
   * Normalize VS Code locale to our supported locales
   */
  private static normalizeLocale(vscodeLocale: string): string {
    const locale = vscodeLocale.toLowerCase();
    if (locale === 'zh-cn' || locale === 'zh-hans') {
      return 'zh-cn';
    }
    // Default to English for unsupported locales
    return 'en';
  }

  /**
   * Get a localized message
   * @param key - The message key
   * @param args - Optional arguments for string formatting
   */
  static t(key: string, ...args: string[]): string {
    const messages = this.messages[this.locale] || this.messages.en;
    let message = messages[key] || this.messages.en[key] || key;

    // Simple placeholder replacement: {0}, {1}, etc.
    args.forEach((arg, index) => {
      message = message.replace(`{${index}}`, arg);
    });

    return message;
  }

  /**
   * Check if current locale is Chinese
   */
  static isZhCn(): boolean {
    return this.locale === 'zh-cn';
  }
}
