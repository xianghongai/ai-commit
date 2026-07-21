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

![截图](https://raw.githubusercontent.com/xianghongai/vscode-ai-commit/main/images/screenshots.gif)

[English](README-EN.md)

遵循 [约定式提交规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)。

## 支持的 Provider

- [x] `openai-compatible`
- [x] `openai`
- [x] `openrouter`
- [x] `gemini`
- [x] `azure-openai`
- [x] `ollama`

## 配置示例

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
  "ai-commit.activeProviderId": "deepseek-v4-flash",
  "ai-commit.commitLanguage": "Simplified Chinese"
}
```

建议将 temperature 设置为较低值（0.2 至 0.5），以获得更稳定、更简洁的提交消息。

`apiKey` 可直接填写明文 Key/Token，也可使用 `${env:VARIABLE_NAME}` [^1] 语法引用环境变量。环境变量必须存在于 VS Code Extension Host 的运行环境中；修改后请完全退出并重新启动 VS Code。

## Credits

- <https://github.com/sitoi/ai-commit>

## License

MIT。

---

[^1]: VS Code 不会为普通设置项自动对 `${env:VARIABLE_NAME}` 做插值。`launch.json` 和 `tasks.json` 等调试或任务配置支持该语法；本扩展在内部解析它。
