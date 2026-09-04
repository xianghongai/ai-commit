import assert from 'node:assert/strict';
import { test } from 'vitest';
import { buildAzureOpenAIChatRequest } from '@/providers/azureOpenAI';
import { createClient } from '@/providers/factory';
import { buildGeminiRequest } from '@/providers/gemini';
import { buildOllamaChatRequest, parseOllamaChatResponse } from '@/providers/ollama';
import { buildOpenAIChatRequest } from '@/providers/openaiCompatible';
import type { ChatMessage, ProviderConfig } from '@/providers/types';

const messages: ChatMessage[] = [
  { role: 'system', content: 'system instruction' },
  { role: 'user', content: 'staged diff' },
  { role: 'assistant', content: 'previous answer' },
];

test('preserves the verified OpenAI-compatible request mapping', () => {
  const request = buildOpenAIChatRequest(
    {
      id: 'compatible',
      type: 'openai-compatible',
      baseUrl: 'https://example.invalid/v1',
      apiKey: 'key',
      model: 'model',
      params: { temperature: 0.4, top_p: 0.8, maxTokens: 256 },
    },
    messages
  );
  assert.equal(request.temperature, 0.4);
  assert.equal(request.top_p, 0.8);
  assert.equal(request.max_tokens, 256);
  assert.deepEqual(request.messages, messages);
});

test('builds Azure Chat Completions parameters independently of deployment routing', () => {
  const request = buildAzureOpenAIChatRequest(
    {
      id: 'azure',
      type: 'azure-openai',
      endpoint: 'https://example.invalid',
      apiKey: 'key',
      apiVersion: 'version',
      deployment: 'deployment',
      model: 'model',
    },
    messages
  );
  assert.equal(request.model, 'model');
  assert.deepEqual(request.messages, messages);
});

test('maps Gemini system and assistant roles to the official SDK contract', () => {
  const request = buildGeminiRequest(
    {
      id: 'gemini',
      type: 'gemini',
      apiKey: 'key',
      model: 'model',
      params: { temperature: 0.3, top_p: 0.7, maxTokens: 128 },
    },
    messages
  );
  assert.equal(request.config?.systemInstruction, 'system instruction');
  assert.equal(request.config?.topP, 0.7);
  assert.equal(request.config?.maxOutputTokens, 128);
  assert.deepEqual(request.contents, [
    { role: 'user', parts: [{ text: 'staged diff' }] },
    { role: 'model', parts: [{ text: 'previous answer' }] },
  ]);
});

test('builds and parses the official Ollama non-streaming chat contract', () => {
  const request = buildOllamaChatRequest(
    {
      id: 'ollama',
      type: 'ollama',
      model: 'model',
      params: { temperature: 0.2, top_p: 0.6, maxTokens: 64 },
    },
    messages
  );
  assert.deepEqual(request, {
    model: 'model',
    messages,
    stream: false,
    options: { temperature: 0.2, top_p: 0.6, num_predict: 64 },
  });
  assert.equal(
    parseOllamaChatResponse({ message: { role: 'assistant', content: 'commit message' }, done: true }),
    'commit message'
  );
  assert.throws(() => parseOllamaChatResponse({ response: 'unexpected fallback' }), /invalid chat response/);
});

test('factory implements every ProviderConfig discriminator', () => {
  const configs: ProviderConfig[] = [
    { id: 'openai', type: 'openai', apiKey: 'key', model: 'model' },
    {
      id: 'compatible',
      type: 'openai-compatible',
      baseUrl: 'https://example.invalid/v1',
      apiKey: 'key',
      model: 'model',
    },
    {
      id: 'openrouter',
      type: 'openrouter',
      baseUrl: 'https://example.invalid/v1',
      apiKey: 'key',
      model: 'model',
    },
    {
      id: 'azure',
      type: 'azure-openai',
      endpoint: 'https://example.invalid',
      apiKey: 'key',
      apiVersion: 'version',
      deployment: 'deployment',
      model: 'model',
    },
    { id: 'gemini', type: 'gemini', apiKey: 'key', model: 'model' },
    { id: 'ollama', type: 'ollama', model: 'model' },
  ];

  for (const config of configs) {
    assert.equal(typeof createClient(config).chat, 'function');
  }
});
