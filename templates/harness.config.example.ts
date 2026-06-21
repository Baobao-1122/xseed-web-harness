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
      steps: [{ type: "vitest", patterns: ["lib/**/*.test.ts", "app/**/*.test.ts"] }],
    },
    L2: {
      name: "双模验收示例",
      steps: [
        {
          type: "matrix",
          envKey: "USE_MOCK",
          values: ["true", "false"],
          steps: [{ type: "vitest", patterns: ["lib/**/*.integration.test.ts"] }],
        },
      ],
    },
    L3: {
      name: "Shell 脚本示例",
      steps: [{ type: "shell", command: "pnpm lint" }],
    },
  },
})
