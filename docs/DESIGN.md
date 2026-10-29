# @linzhang1122/web-harness — 设计说明

> 独立仓库，供多个 Web 管理系统（Next.js + Vitest）复用。  
> **不**替代 Vitest；**不**包含具体业务（CEC102、RBAC 等）。

## 已对齐决策

| 项 | 结论 |
|----|------|
| 包名 | `@linzhang1122/web-harness` |
| 仓库 | 独立 `xseed-web-harness`，与 `saa-s-ui` 分离 |
| 核心职责 | CLI 编排：config → layers → steps → 报告 |
| 断言 | Vitest 负责通用 `expect`；本包 `/testing` 仅提供跨项目语义助手（0.2 扩展） |
| 业务 | 各项目 `harness.config.ts` + 自有测试/fixture |

## 架构分层

```
业务项目（如 saa-s-ui）
  harness.config.ts     ← 定义 L1/L2/L3 layers 与 steps
  lib/**/*.test.ts      ← Vitest 用例（业务断言在此）
        │
        ▼
@linzhang1122/web-harness
  harness run           ← 读 config，按 layer 顺序执行
  harness doctor        ← 检查 node / pnpm / vitest / config
  harness init          ← 生成 config 模板
        │
        ▼
  step: vitest          ← pnpm vitest run <patterns>
  step: shell           ← 任意 shell 命令（lint、协议脚本等）
  step: matrix          ← 环境矩阵（如 USE_MOCK=true/false）
```

## 版本规划

| 版本 | 范围 |
|------|------|
| **0.1** | CLI + config schema + vitest/shell/matrix + JSON 报告 + `/testing` 占位 |
| **0.2** | ✅ 扩展 `/testing`：Response 403、adapter parity、runWithEnv |
| **0.3** | `harness init` 增强、CI Action 示例、可选 plugin 机制 |

## 接入业务项目（后续，非本仓库职责）

```json
{
  "devDependencies": {
    "@linzhang1122/web-harness": "file:../xseed-web-harness"
  },
  "scripts": {
    "test:harness": "harness run",
    "test:harness:ci": "harness run --profile ci"
  }
}
```

## 参考首发项目

- `saa-s-ui`：律能智慧运营平台（CEC102、双模 adapter、RBAC）
