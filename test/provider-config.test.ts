import assert from 'node:assert/strict';
import { test } from 'vitest';
import { parseProviderConfigs, selectActiveProvider } from '@/providers/config';

test('parses OpenAI without requiring a custom base URL', () => {
  const providers = parseProviderConfigs([{ id: 'openai', type: 'openai', model: 'model', apiKey: 'key' }]);
  assert.equal(providers[0].type, 'openai');
  assert.equal('baseUrl' in providers[0] ? providers[0].baseUrl : undefined, undefined);
});

test('passes a plaintext API key through unchanged', () => {
  const providers = parseProviderConfigs([{ id: 'openai', type: 'openai', model: 'model', apiKey: 'plaintext-key' }]);

  const activeProvider = selectActiveProvider(providers, 'openai');
  assert.equal('apiKey' in activeProvider ? activeProvider.apiKey : undefined, 'plaintext-key');
});

test('resolves the documented API key environment placeholder for the active provider', () => {
  process.env.AI_COMMIT_TEST_KEY = 'resolved-key';
  try {
    const providers = parseProviderConfigs([
      {
        id: 'openai',
        type: 'openai',
        model: 'model',
        apiKey: '${env:AI_COMMIT_TEST_KEY}',
      },
    ]);
    const activeProvider = selectActiveProvider(providers, 'openai');
    assert.equal('apiKey' in activeProvider ? activeProvider.apiKey : undefined, 'resolved-key');
  } finally {
    delete process.env.AI_COMMIT_TEST_KEY;
  }
});

test('rejects duplicate provider IDs', () => {
  assert.throws(
    () =>
      parseProviderConfigs([
        { id: 'same', type: 'ollama', model: 'first' },
        { id: 'same', type: 'ollama', model: 'second' },
      ]),
    /duplicated/
  );
});

test('rejects a stale active provider instead of falling back', () => {
  const providers = parseProviderConfigs([{ id: 'local', type: 'ollama', model: 'model' }]);
  assert.throws(() => selectActiveProvider(providers, 'removed-provider'), /was not found/);
});

test('allows inactive provider templates without API keys', () => {
  const providers = parseProviderConfigs([
    { id: 'active', type: 'openai', model: 'active-model', apiKey: 'key' },
    {
      id: 'template',
      type: 'openai-compatible',
      model: 'template-model',
      baseUrl: 'https://example.invalid/v1',
    },
  ]);

  assert.equal(selectActiveProvider(providers, 'active').id, 'active');
  assert.throws(
    () => selectActiveProvider(providers, 'template'),
    /provider 'template' \(providers\[1\]\)\.apiKey is required for the active provider/
  );
});

test('requires an API key when the first provider is implicitly active', () => {
  const providers = parseProviderConfigs([{ id: 'template', type: 'openai', model: 'template-model' }]);

  assert.throws(
    () => selectActiveProvider(providers),
    /provider 'template' \(providers\[0\]\)\.apiKey is required for the active provider/
  );
});

test('treats an unresolved API key as an allowed inactive template credential', () => {
  delete process.env.AI_COMMIT_MISSING_TEST_KEY;
  const providers = parseProviderConfigs([
    {
      id: 'template',
      type: 'gemini',
      model: 'template-model',
      apiKey: '${env:AI_COMMIT_MISSING_TEST_KEY}',
    },
    { id: 'local', type: 'ollama', model: 'local-model' },
  ]);

  assert.equal('apiKey' in providers[0] ? providers[0].apiKey : undefined, '${env:AI_COMMIT_MISSING_TEST_KEY}');
  assert.equal(selectActiveProvider(providers, 'local').id, 'local');
  assert.throws(
    () => selectActiveProvider(providers, 'template'),
    /references environment variable 'AI_COMMIT_MISSING_TEST_KEY' for apiKey, but it is not set/
  );
});

test('validates provider-specific required fields', () => {
  assert.throws(
    () => parseProviderConfigs([{ id: 'compatible', type: 'openai-compatible', model: 'model', apiKey: 'key' }]),
    /baseUrl is required/
  );
  assert.throws(
    () => parseProviderConfigs([{ id: 'azure', type: 'azure-openai', model: 'model', apiKey: 'key' }]),
    /endpoint is required/
  );
});
