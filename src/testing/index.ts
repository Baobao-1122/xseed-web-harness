/**
 * @xseed/web-harness/testing — Vitest 伴侣助手
 *
 * 不替代 Vitest expect；提供跨 Web 项目可复用的语义化断言与环境工具。
 */

export function assertDefined<T>(value: T | null | undefined, label = "value"): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${label} 不应为 null / undefined`)
  }
}

export {
  assertApiStatus,
  assertApiOk,
  assertApiForbidden,
  readResponseJson,
  assertResponseStatus,
  assertResponseOk,
  assertResponseForbidden,
  assertResponseError,
} from "./api.js"
export type { ApiErrorExpectation } from "./api.js"

export { assertShapeEqual, compareShape } from "./shape.js"

export { runWithEnv, runWithEnvSync } from "./run-with-env.js"

export { assertAdapterParity } from "./adapter-parity.js"
export type { AdapterParityOptions } from "./adapter-parity.js"
