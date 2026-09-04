# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## v1.0.6 (2026-07-21)

- 更新截图格式、致谢与许可证信息。

## v1.0.5 (2026-07-21)

### 变更

- 移除 Provider 配置中的 `displayName` 字段，统一以 `model` 显示。

### 修复

- 重构 `apiKey` 的环境变量解析；变量缺失时抛出本地化错误，不再静默失败。

## v1.0.4 (2026-07-20)

- 依赖包名从 `@google/generative-ai` 切换到 `@google/genai`。

## v1.0.3 (2026-07-20)

### 新增

- 支持 Ollama，可对接本地模型。

### 变更

- 重构 Provider 配置系统，多家服务商共用一套配置契约。

## v1.0.2 (2026-06-17)

- 更新提示词中的提交消息格式规范。

## v1.0.1 (2025-11-20)

### 修复

- 统一提示词相关设置项，此前多处配置读取路径不一致。

## v1.0.0 (2025-10-15)

首个稳定版本。

### 新增

- 多 Provider 支持：OpenAI、OpenAI 兼容服务、OpenRouter、Gemini、Azure OpenAI。
- 界面与提交消息的国际化，提交语言可在 19 种语言间选择。
- 提示词分 Conventional Commits 与 Conventional Commits with Gitmoji 两种风格，也可指向自定义提示词文件。

### 变更

- 构建改用 tsup。
- 项目图标替换为 SVG 格式。

### 修复

- 修正 Gemini temperature 设置的上限。
- 修复 vsce 打包命令报错。
