# @xseed/web-harness

可复用的 **Web 项目测试 harness**：用配置文件描述分层质量门禁，CLI 统一编排 Vitest、Shell 与环境矩阵（如 `USE_MOCK=true/false`）。

> 设计说明见 [docs/DESIGN.md](./docs/DESIGN.md)

## 安装

### 方式 A：本地联调（推荐，未发布 npm 时）

两个仓库平级放置：

```
Formal work/
├── xseed-web-harness/
└── saa-s-ui/          ← 或其他 Web 项目
```

在业务项目 `package.json` 添加：

```json
{
  "devDependencies": {
    "@xseed/web-harness": "file:../xseed-web-harness"
  }
}
```

然后 `pnpm install`（会自动执行 harness 的 `prepare` → `pnpm build`）。

### 方式 B：npm tarball

在 harness 仓库打包：

```bash
cd xseed-web-harness
pnpm pack:check    # 测试 + 构建 + 生成 .pack/*.tgz
```

在业务项目安装：

```bash
pnpm add -D /path/to/xseed-web-harness/.pack/xseed-web-harness-0.2.0.tgz
```

### 方式 C：npm 私服（发布后）

```bash
pnpm add -D @xseed/web-harness
```

## 快速开始

```bash
# 在业务项目根目录
harness init
harness doctor
harness run --profile ci
```

## harness.config.ts

```typescript
import { defineHarnessConfig } from "@xseed/web-harness"

export default defineHarnessConfig({
  name: "my-web-app",
  profiles: {
    ci: { layers: ["L1", "L2"] },
    local: { layers: ["L1"] },
  },
  layers: {
    L1: {
      name: "单元测试",
      steps: [{ type: "vitest", patterns: ["lib/**/*.test.ts"] }],
    },
    L2: {
      name: "双模矩阵",
      steps: [{
        type: "matrix",
        envKey: "USE_MOCK",
        values: ["true", "false"],
        steps: [{ type: "vitest", patterns: ["lib/**/*.integration.test.ts"] }],
      }],
    },
  },
})
```

完整示例：[templates/harness.config.example.ts](./templates/harness.config.example.ts)

## CLI

| 命令 | 说明 |
|------|------|
| `harness run` | 执行配置中的 layers |
| `harness run --profile ci` | 使用 `profiles.ci` |
| `harness run --layer L1 L2` | 只跑指定 layer |
| `harness doctor` | 检查 config、node、pnpm、vitest |
| `harness init` | 生成 `harness.config.ts` 模板 |

默认写入 `harness-report.json`（可用 `--no-report` 关闭）。

## Step 类型

| type | 用途 |
|------|------|
| `vitest` | `pnpm vitest run <patterns>`，可带 `env` |
| `shell` | 执行任意命令（lint、CEC102 脚本等） |
| `matrix` | 对 `envKey` 取多个 `values`，嵌套执行子 steps |

## @xseed/web-harness/testing

Vitest **伴侣**助手（不替代 `expect`）：

```typescript
import {
  assertApiForbidden,
  assertResponseForbidden,
  assertAdapterParity,
  runWithEnv,
} from "@xseed/web-harness/testing"

// 路由权限测试（number 或 Response）
assertApiForbidden(res.status)
await assertResponseForbidden(res, { message: "权限不足" })

// 双模 adapter 一致性
await runWithEnv({ USE_MOCK: "true" }, async () => {
  await assertAdapterParity({
    label: "listUsers",
    mock: () => mockAdapter.listUsers(),
    real: () => realAdapter.listUsers(),
    keys: ["id", "name"],
  })
})
```

| API | 用途 |
|-----|------|
| `assertApiStatus` / `assertApiForbidden` | 基于 status number 的快速断言 |
| `assertResponseForbidden` / `assertResponseError` | Response + `{ message }` 正文 |
| `assertAdapterParity` | mock / real adapter 同操作结果对比 |
| `runWithEnv` / `runWithEnvSync` | 临时切换 `process.env`（如 `USE_MOCK`） |
| `assertShapeEqual` | 指定 keys 的对象字段对比 |

## 开发本包

```bash
pnpm install
pnpm build
pnpm test
node dist/cli.js --help
```

## License

MIT
