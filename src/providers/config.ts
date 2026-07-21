import type {
  BaseProviderConfig,
  ChatGenerationParams,
  OllamaConfig,
  OpenAIChatConfig,
  ProviderConfig,
  ProviderSettingsEntry,
} from './types';

type ConfigRecord = Record<string, unknown>;
type OpenAIChatSettingsEntry = Extract<
  ProviderSettingsEntry,
  { type: 'openai' | 'openai-compatible' | 'openrouter' }
>;
type AzureOpenAISettingsEntry = Extract<ProviderSettingsEntry, { type: 'azure-openai' }>;
type GeminiSettingsEntry = Extract<ProviderSettingsEntry, { type: 'gemini' }>;

const ENVIRONMENT_API_KEY_PATTERN = /^\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/;

/** 保留环境变量名以便 Registry 生成本地化错误，不暴露密钥值。 */
export class ProviderApiKeyEnvironmentVariableError extends Error {
  constructor(
    readonly providerId: string,
    readonly variableName: string
  ) {
    super(
      `[ai-commit] provider '${providerId}' references environment variable '${variableName}' for apiKey, but it is not set`
    );
    this.name = 'ProviderApiKeyEnvironmentVariableError';
  }
}

/**
 * 将 VS Code settings 的未知输入收敛为可展示、可切换的 Provider 条目。
 *
 * apiKey 在列表阶段允许缺省；协议地址、模型和其它结构字段仍按类型契约校验。
 */
export function parseProviderConfigs(value: unknown): ProviderSettingsEntry[] {
  if (!Array.isArray(value)) {
    throw new Error('[ai-commit] providers must be an array');
  }

  const providers = value.map((item, index) => parseProviderConfig(item, index));
  const ids = new Set<string>();
  for (const provider of providers) {
    if (ids.has(provider.id)) {
      throw new Error(`[ai-commit] provider id '${provider.id}' is duplicated`);
    }
    ids.add(provider.id);
  }
  return providers;
}

/**
 * 精确选择活动 Provider，并在 staged diff 进入 adapter 前强制校验其凭据。
 */
export function selectActiveProvider(
  providers: ProviderSettingsEntry[],
  activeProviderId?: string
): ProviderConfig {
  if (!providers.length) {
    throw new Error('[ai-commit] no providers configured');
  }

  const providerIndex = activeProviderId
    ? providers.findIndex(({ id }) => id === activeProviderId)
    : 0;
  const provider = providers[providerIndex];
  if (!provider) {
    throw new Error(`[ai-commit] active provider '${activeProviderId}' was not found`);
  }
  return validateProviderConfig(provider, providerIndex);
}

/** 将选中的 settings 条目收敛为 adapter 可消费的完整 ProviderConfig。 */
export function validateProviderConfig(
  conf: ProviderSettingsEntry,
  index = 0
): ProviderConfig {
  switch (conf.type) {
    case 'openai':
    case 'openai-compatible':
    case 'openrouter':
    case 'azure-openai':
    case 'gemini':
      return {
        ...conf,
        apiKey: requireActiveApiKey(conf.apiKey, conf.id, index),
      };
    case 'ollama':
      return conf;
    default:
      return assertNever(conf);
  }
}

function parseProviderConfig(value: unknown, index: number): ProviderSettingsEntry {
  const record = requireRecord(value, `providers[${index}]`);
  const type = requireString(record, 'type', index);
  const base = parseBaseProviderConfig(record, index);

  switch (type) {
    case 'openai':
      return parseOpenAIConfig(record, base, type, false, index);
    case 'openai-compatible':
    case 'openrouter':
      return parseOpenAIConfig(record, base, type, true, index);
    case 'azure-openai':
      return parseAzureOpenAIConfig(record, base, index);
    case 'gemini':
      return parseGeminiConfig(record, base, index);
    case 'ollama':
      return parseOllamaConfig(record, base, index);
    default:
      throw new Error(`[ai-commit] provider '${base.id}': unknown type '${type}'`);
  }
}

function parseBaseProviderConfig(record: ConfigRecord, index: number): Omit<BaseProviderConfig, 'type'> {
  const modelKind = optionalString(record, 'modelKind', index);
  if (modelKind !== undefined && modelKind !== 'chat') {
    throw new Error(`[ai-commit] providers[${index}].modelKind must be 'chat'`);
  }

  return {
    id: requireString(record, 'id', index),
    model: requireString(record, 'model', index),
    ...(modelKind ? { modelKind: 'chat' as const } : {}),
    ...optionalPositiveNumberProperty(record, 'timeoutMs', index),
    ...parseHeadersProperty(record, index),
    ...parseParamsProperty(record, index),
  };
}

function parseOpenAIConfig(
  record: ConfigRecord,
  base: Omit<BaseProviderConfig, 'type'>,
  type: OpenAIChatConfig['type'],
  requireBaseUrl: boolean,
  index: number
): OpenAIChatSettingsEntry {
  const baseUrl = requireBaseUrl
    ? requireString(record, 'baseUrl', index)
    : optionalString(record, 'baseUrl', index);
  const apiKey = optionalString(record, 'apiKey', index);
  const organization = optionalString(record, 'organization', index);
  if (type === 'openai') {
    return {
      ...base,
      type,
      ...(apiKey ? { apiKey } : {}),
      ...(baseUrl ? { baseUrl } : {}),
      ...(organization ? { organization } : {}),
    };
  }
  return {
    ...base,
    type,
    ...(apiKey ? { apiKey } : {}),
    baseUrl: requireString(record, 'baseUrl', index),
    ...(organization ? { organization } : {}),
  };
}

function parseAzureOpenAIConfig(
  record: ConfigRecord,
  base: Omit<BaseProviderConfig, 'type'>,
  index: number
): AzureOpenAISettingsEntry {
  return {
    ...base,
    type: 'azure-openai',
    endpoint: requireString(record, 'endpoint', index),
    ...optionalStringProperty(record, 'apiKey', index),
    apiVersion: requireString(record, 'apiVersion', index),
    deployment: requireString(record, 'deployment', index),
  };
}

function parseGeminiConfig(
  record: ConfigRecord,
  base: Omit<BaseProviderConfig, 'type'>,
  index: number
): GeminiSettingsEntry {
  return {
    ...base,
    type: 'gemini',
    ...optionalStringProperty(record, 'apiKey', index),
  };
}

function parseOllamaConfig(
  record: ConfigRecord,
  base: Omit<BaseProviderConfig, 'type'>,
  index: number
): OllamaConfig {
  return {
    ...base,
    type: 'ollama',
    ...optionalStringProperty(record, 'baseUrl', index),
  };
}

function parseHeadersProperty(record: ConfigRecord, index: number): Pick<BaseProviderConfig, 'headers'> {
  const value = record.headers;
  if (value === undefined) {
    return {};
  }
  const headers = requireRecord(value, `providers[${index}].headers`);
  const parsedHeaders: Record<string, string> = {};
  for (const [name, headerValue] of Object.entries(headers)) {
    if (typeof headerValue !== 'string') {
      throw new Error(`[ai-commit] providers[${index}].headers.${name} must be a string`);
    }
    parsedHeaders[name] = headerValue;
  }
  return { headers: parsedHeaders };
}

function parseParamsProperty(record: ConfigRecord, index: number): Pick<BaseProviderConfig, 'params'> {
  if (record.params === undefined) {
    return {};
  }
  const paramsRecord = requireRecord(record.params, `providers[${index}].params`);
  const params: ChatGenerationParams = {
    ...optionalNumberProperty(paramsRecord, 'temperature', `providers[${index}].params`),
    ...optionalNumberProperty(paramsRecord, 'top_p', `providers[${index}].params`),
    ...optionalNumberProperty(paramsRecord, 'maxTokens', `providers[${index}].params`),
  };

  if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
    throw new Error(`[ai-commit] providers[${index}].params.temperature must be between 0 and 2`);
  }
  if (params.top_p !== undefined && (params.top_p < 0 || params.top_p > 1)) {
    throw new Error(`[ai-commit] providers[${index}].params.top_p must be between 0 and 1`);
  }
  if (params.maxTokens !== undefined && params.maxTokens < 1) {
    throw new Error(`[ai-commit] providers[${index}].params.maxTokens must be at least 1`);
  }
  return { params };
}

function optionalStringProperty(
  record: ConfigRecord,
  key: string,
  index: number
): Record<string, string> {
  const value = optionalString(record, key, index);
  return value === undefined ? {} : { [key]: value };
}

function optionalPositiveNumberProperty(
  record: ConfigRecord,
  key: string,
  index: number
): Record<string, number> {
  const property = optionalNumberProperty(record, key, `providers[${index}]`);
  const value = property[key];
  if (value !== undefined && value <= 0) {
    throw new Error(`[ai-commit] providers[${index}].${key} must be greater than 0`);
  }
  return property;
}

function optionalNumberProperty(record: ConfigRecord, key: string, path: string): Record<string, number> {
  const value = record[key];
  if (value === undefined) {
    return {};
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`[ai-commit] ${path}.${key} must be a finite number`);
  }
  return { [key]: value };
}

function requireString(record: ConfigRecord, key: string, index: number): string {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[ai-commit] providers[${index}].${key} is required`);
  }
  return value.trim();
}

function requireActiveApiKey(value: string | undefined, id: string, index: number): string {
  if (!value) {
    throw new Error(
      `[ai-commit] provider '${id}' (providers[${index}]).apiKey is required for the active provider`
    );
  }
  const environmentReference = ENVIRONMENT_API_KEY_PATTERN.exec(value);
  if (!environmentReference) {
    return value;
  }
  const variableName = environmentReference[1];
  const resolvedValue = process.env[variableName];
  if (!resolvedValue) {
    throw new ProviderApiKeyEnvironmentVariableError(id, variableName);
  }
  return resolvedValue;
}

function optionalString(record: ConfigRecord, key: string, index: number): string | undefined {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`[ai-commit] providers[${index}].${key} must be a string`);
  }
  return value.trim() || undefined;
}

function requireRecord(value: unknown, path: string): ConfigRecord {
  if (!isConfigRecord(value)) {
    throw new Error(`[ai-commit] ${path} must be an object`);
  }
  return value;
}

function isConfigRecord(value: unknown): value is ConfigRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertNever(value: never): never {
  void value;
  throw new Error('[ai-commit] unsupported provider configuration');
}
