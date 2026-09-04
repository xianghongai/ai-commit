# AGENTS.md

本文件记录本仓库内 Codex/Agent 协作规则。适用于整个仓库；如果子目录后续出现更近层级的 `AGENTS.md`，以更近层级规则为准。

## 项目概况

- 本仓库是一个 VS Code 扩展，用 AI 根据 Git 暂存区 diff 生成符合约定的提交消息。
- 扩展入口在 `src/extension.ts`，命令注册在 `src/commands.ts`，提交消息生成流程在 `src/generate-commit-msg.ts`。
- Git 暂存区读取在 `src/git-utils.ts`；默认只分析 staged diff，不应擅自改为读取未暂存或全部工作区变更。
- Prompt 逻辑在 `src/prompts.ts` 和 `prompt/*.md`；Provider 类型、校验、工厂和适配器集中在 `src/providers/`。
- VS Code manifest、配置项、命令和菜单定义在 `package.json`；扩展 manifest 本地化文案在 `package.nls.json` 和 `package.nls.zh-cn.json`。
- 项目使用 TypeScript、CommonJS，由 `esbuild.js` 打包到 `dist`；格式化用 oxfmt，检查用 oxlint，测试用 Vitest。
- 测试放在仓库根的 `test/`，通过 `@/` 别名引用 `src/`。
- 发布 tag 必须带 `v` 前缀，否则不触发 `.github/workflows/ci.yml`。

## 工作边界

- 优先做小范围、可验证的修改；不要在未被要求时重构扩展架构、替换构建工具或批量改写文件风格。
- 不要提交真实 API Key、账号、Token、私有证书、内网地址、真实服务域名或个人/客户信息。配置示例只使用占位符。
- 不要把本地临时环境、端口、代理、个人路径或未确认的运行状态写入源码、文档或本文件。
- `dist/`、`*.vsix`、`node_modules/` 是构建或依赖产物；除非用户明确要求发布产物，否则不要把它们作为主要改动目标。
- 修改依赖时使用现有包管理约束，仓库已有 `pnpm-lock.yaml`，优先使用 `pnpm`。

## Provider 与配置契约

- `ProviderConfig` 的字段来源以 `src/providers/types.ts` 为准；新增或调整字段时，同步更新 `package.json` 的 `contributes.configuration`。
- 新增配置项时，同时维护 `package.nls.json` 和 `package.nls.zh-cn.json`，避免 VS Code 设置页出现缺失本地化键。
- Provider 配置支持 `${env:VAR}` 环境变量解析；不要为了兼容未知输入格式而引入无契约的多路径猜测。
- 新增 Provider 类型时，需要同步完成类型定义、配置 schema、`ProviderRegistry.validate` 校验、`createClient` 分发和具体 adapter。
- `package.json` 中出现但代码尚未完整支持的 Provider，不要在 README 或提示文案中描述为已可用，除非同时补齐实现与验证。
- Adapter 抛出的错误应保留有助于用户配置排查的信息，但不得泄露密钥、完整请求头或敏感配置。

## Prompt 与提交消息行为

- 内置 prompt 模板位于 `prompt/without_gitmoji.md` 和 `prompt/with_gitmoji.md`；`ai-commit.promptFile` 设置后会覆盖内置模板。
- Prompt 中的 `{{LANG}}` 占位符用于提交消息语言，和 VS Code UI 语言不是同一概念。
- 生成结果应只写入提交消息本身，不应包含解释、Markdown 包裹、代码块或额外寒暄。
- SCM 输入框中已有内容会作为附加上下文传给模型；修改相关逻辑时要保留这一用户工作流。
- 涉及 staged diff、prompt 内容或模型返回值的调试日志要谨慎，默认不要把用户代码 diff 或提示词完整输出到控制台。

## 国际化

- VS Code manifest 文案使用 `package.nls.json` 和 `package.nls.zh-cn.json`。
- 扩展运行时通知、进度、错误和 Quick Pick 文案集中在 `src/i18n.ts`。
- 新增用户可见文案时至少维护英文和简体中文两份；不要混用硬编码文案与 i18n key。
- `ai-commit.commitLanguage` 控制 AI 生成提交消息的语言，不应被误用为扩展界面语言。

## 代码风格

- 保持现有 TypeScript 风格和模块边界：命令层处理 VS Code 交互，Provider 层处理模型调用，Prompt 层处理提示词读取与语言补充。
- `.oxlintrc.json` 将 `typescript/no-explicit-any` 设为 error，新代码不要引入 `any`；但不要为此对既有代码做大范围类型改造。
- 只在复杂业务规则、兼容分支、错误处理或维护边界不明显时添加注释；避免重复代码表面含义的注释。
- 公共接口或跨文件契约变更时，优先让类型和校验表达约束，再用少量注释说明非显然设计原因。

## 验证

- 常规源码修改后优先运行：
  - `pnpm run check-types`
  - `pnpm run lint`
  - `pnpm run format:check`
- 涉及打包、发布入口、依赖或 `package.json` manifest 时运行：
  - `pnpm run package`
- 涉及 VS Code 集成行为、命令注册或 Git API 交互时，视变更范围运行：
  - `pnpm run test`
- 改动 `.vscodeignore` 或运行时读取的资源路径时，必须跑 `pnpm run vsce:package` 并用 `unzip -l *.vsix` 核对 `prompt/` 与 `images/` 是否随包发布。
- 调整 `lint-staged` 匹配模式时，不要让被 oxfmt/oxlint 忽略的文件（如 `pnpm-lock.yaml`）成为某条模式的唯一匹配项——两者在目标全被忽略时以非零码退出，会挡下提交。
- 如果某个验证命令因环境限制无法运行，需要在最终回复中说明具体命令和失败原因。

## 文档更新

- README 面向用户，描述已实现能力、配置示例和使用方式；不要把内部临时计划或未完成 Provider 宣称为可用功能。
- 配置示例中的服务地址、密钥和组织信息必须使用占位符，不要写入真实值。
- 如果修改命令、配置项、Provider 支持范围或 prompt 行为，需要同步检查 README、`package.json` 和本地化文件是否需要更新。
