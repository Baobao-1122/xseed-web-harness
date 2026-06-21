import type { HarnessConfig } from "./config/schema.js"

/** 供业务项目 harness.config.ts 使用，带类型提示 */
export function defineHarnessConfig(config: HarnessConfig): HarnessConfig {
  return config
}

export { parseHarnessConfig } from "./config/schema.js"
export type {
  HarnessConfig,
  HarnessLayer,
  HarnessProfile,
  Step,
  VitestStep,
  ShellStep,
  MatrixStep,
} from "./config/schema.js"