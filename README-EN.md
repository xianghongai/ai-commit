# AI Commit

<p align="center">
  <a href="https://github.com/xianghongai/vscode-ai-commit">
    <img src="https://img.shields.io/github/repo-size/xianghongai/vscode-ai-commit?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-ai-commit">
    <img src="https://img.shields.io/visual-studio-marketplace/v/nicholashsiang.vscode-ai-commit?color=%234ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-ai-commit">
    <img src="https://img.shields.io/visual-studio-marketplace/d/nicholashsiang.vscode-ai-commit?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-ai-commit">
    <img src="https://img.shields.io/visual-studio-marketplace/r/nicholashsiang.vscode-ai-commit?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://github.com/xianghongai/vscode-ai-commit">
    <img src="https://img.shields.io/github/license/xianghongai/vscode-ai-commit?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
</p>

![Screenshot](https://raw.githubusercontent.com/xianghongai/vscode-ai-commit/main/images/screenshots.png)

Adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/)."

## Supported Providers

- [x] `openai-compatible`
- [x] `openai`
- [x] `openrouter`
- [x] `gemini`
- [x] `azure-openai`
- [x] `ollama`

`openai-compatible` has been verified against a live service. The remaining providers are implemented against their official SDK/API contracts and covered by local request-mapping and response-parsing tests, but have not yet been verified with live accounts.

## Configuration example

```json
{
  "ai-commit.providers": [
    {
      "id": "deepseek-v4-flash",
      "type": "openai-compatible",
      "baseUrl": "https://api.deepseek.com",
      "apiKey": "${env:DEEPSEEK_API_KEY}",
      "model": "deepseek-v4-flash",
      "params": {
        "temperature": 0.4
      }
    },
    {
      "id": "deepseek-ai/DeepSeek-V4-Flash",
      "type": "openai-compatible",
      "baseUrl": "https://api.siliconflow.cn/v1",
      "apiKey": "${env:SILICONFLOW_DEEPSEEK_API_KEY}",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "params": {
        "temperature": 0.4
      }
    },
    {
      "id": "compatible-default",
      "type": "openai-compatible",
      "baseUrl": "<OPENAI_COMPATIBLE_BASE_URL>",
      "apiKey": "${env:OPENAI_COMPATIBLE_API_KEY}",
      "model": "<MODEL_NAME>",
      "params": { "temperature": 0.4 }
    },
    {
      "id": "openai-default",
      "type": "openai",
      "apiKey": "${env:OPENAI_API_KEY}",
      "model": "<OPENAI_MODEL>",
      "params": { "temperature": 0.3 }
    },
    {
      "id": "gemini-default",
      "type": "gemini",
      "apiKey": "${env:GEMINI_API_KEY}",
      "model": "<GEMINI_MODEL>",
      "params": { "temperature": 0.4 }
    },
    {
      "id": "azure-openai-default",
      "type": "azure-openai",
      "endpoint": "<AZURE_OPENAI_ENDPOINT>",
      "apiKey": "${env:AZURE_OPENAI_API_KEY}",
      "apiVersion": "<AZURE_OPENAI_API_VERSION>",
      "deployment": "<DEPLOYMENT_NAME>",
      "model": "<MODEL_NAME>",
      "params": { "temperature": 0.3 }
    },
    {
      "id": "ollama-local",
      "type": "ollama",
      "model": "<OLLAMA_MODEL>",
      "timeoutMs": 120000,
      "params": { "temperature": 0.3 }
    }
  ],
  "ai-commit.activeProviderId": "compatible-default",
  "ai-commit.commitLanguage": "English"
}
```

Set temperature to a relatively low value (0.2 to 0.5) for more stable and concise commit messages.

`apiKey` accepts a plaintext key/token or an environment-variable reference using `${env:VARIABLE_NAME}` [^1]. The environment variable must be available to the VS Code Extension Host. Completely quit and restart VS Code after changing it.

## Special Thanks

- Forked from [sitoi/ai-commit](https://github.com/sitoi/ai-commit)

---

[^1]: VS Code does not automatically interpolate `${env:VARIABLE_NAME}` in arbitrary settings. Debug and task configurations such as `launch.json` and `tasks.json` support the syntax; this extension resolves it internally.
