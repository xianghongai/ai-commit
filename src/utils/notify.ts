import * as vscode from 'vscode';
import { ProviderConfig } from '../providers/types';
import { I18n } from '../i18n';

// Format as yyyy-MM-dd HH:mm:ss
export function formatTimestamp(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}

export function getProviderLabel(conf: ProviderConfig): string {
  return conf.displayName || `${conf.type} · ${conf.model}`;
}

// Show a transient toast-like notification (bottom-right) that auto-hides after timeout
export function showToast(message: string, timeoutMs?: number) {
  const ms = Math.max(1000, timeoutMs ?? 3000);
  void vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: message }, async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

export function notifyStatusToast(status: 'success' | 'failed', conf: ProviderConfig) {
  const statusText = status === 'success' ? I18n.t('status.success') : I18n.t('status.failed');
  const text = `${statusText} ${formatTimestamp()} ${getProviderLabel(conf)}`;
  showToast(text);
}
