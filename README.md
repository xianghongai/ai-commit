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
- [x] `openai`
- [x] `openrouter`
- [x] `gemini`
- [x] `azure-openai`
- [x] `ollama`

`openai-compatible` 已完成真实服务验证；其它 Provider 已按官方 SDK/API 契约实现，并通过本地请求映射和响应解析测试，尚未使用真实账号联调。

## Configuration Example

```json
{
  "ai-commit.providers": [
    {
      "id": "deepseek-v4-flash",
      "type": "openai-compatible",
      "baseUrl": "https://api.deepseek.com",
      "apiKey": "${env:DEEP_SEEK_API_KEY}",
      "model": "deepseek-v4-flash",
      "params": {
        "temperature": 0.4,
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
  "ai-commit.commitLanguage": "Simplified Chinese"
}
```

提示：建议将温度（temperature）设置较低（0.2 ~ 0.5），以便输出更稳定、简洁的提交信息

Tip: It is recommended to set the temperature to a lower value (0.2 ~ 0.5) to output more stable and concise commit messages.

`apiKey`、`baseUrl`、`endpoint` 和自定义请求头支持 `${env:VAR}` 环境变量引用。显式设置的 `activeProviderId` 必须匹配唯一 Provider；失效配置会停止生成，不会自动切换到其它服务。

未启用的 Provider 可以省略 `apiKey` 作为配置模板；当它被设为 `activeProviderId` 或通过切换命令启用时，扩展才会强制校验其 API Key。Provider 的协议地址、模型和其它结构字段仍需符合对应类型契约。

## Special Thanks

- Fork from [sitoi/ai-commit](https://github.com/sitoi/ai-commit)
