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
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-ai-commit">
    <img src="https://img.shields.io/github/license/xianghongai/vscode-ai-commit?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
</p>

![ScreenShots](https://raw.githubusercontent.com/xianghongai/vscode-ai-commit/main/images/screenshots.png)

## Changes

- 配置，支持多个提供商/模型 / Settings supports multiple providers/models
- 生成提交消息默认不带 Emoji / Generate commit messages default without Emoji
- 基于 tsup 构建 / Built with tsup
- 整了一个“融合度”好的图标 / Made a good icon
- 支持自定义提示词文件，而不是在配置中设定 / Support custom prompt file, instead of setting in configuration

## Supported Providers

- [x] `openai-compatible`
- [ ] `openai`
- [ ] `gemini`
- [ ] `azure-openai`
- [ ] `ollama`

## Configuration Example

```json
{
  "ai-commit.providers": [
    {
      "id": "siliconflow-qwen",
      "displayName": "SiliconFlow (Qwen3 235B)",
      "type": "openai-compatible",
      "baseUrl": "https://api.siliconflow.cn/v1",
      "apiKey": "<API_KEY>",
      "model": "Qwen/Qwen3-235B-A22B-Instruct-2507",
      "params": { "temperature": 0.4 }
    },
    {
      "id": "openai-gpt4o-mini",
      "displayName": "OpenAI (gpt-4o-mini)",
      "type": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "<API_KEY>",
      "model": "gpt-4o-mini",
      "params": { "temperature": 0.3 }
    },
    {
      "id": "gemini-flash",
      "displayName": "Gemini (2.0 Flash)",
      "type": "gemini",
      "apiKey": "<API_KEY>",
      "model": "gemini-2.0-flash-001",
      "params": { "temperature": 0.4 }
    },
    {
      "id": "azure-gpt4o",
      "displayName": "Azure OpenAI (gpt-4o-mini)",
      "type": "azure-openai",
      "endpoint": "https://your-aoai.openai.azure.com",
      "apiKey": "<API_KEY>",
      "apiVersion": "2024-06-01",
      "deployment": "gpt-4o-mini",
      "model": "gpt-4o-mini",
      "params": { "temperature": 0.3 }
    }
  ],
  "ai-commit.activeProviderId": "siliconflow-qwen",
  "ai-commit.AI_COMMIT_LANGUAGE": "Simplified Chinese"
}
```

提示：建议将温度（temperature）设置较低（0.2 ~ 0.5），以便输出更稳定、简洁的提交信息

Tip: It is recommended to set the temperature to a lower value (0.2 ~ 0.5) to output more stable and concise commit messages.

## Special Thanks

- Fork from [sitoi/ai-commit](https://github.com/sitoi/ai-commit)
