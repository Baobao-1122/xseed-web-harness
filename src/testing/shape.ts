export function assertShapeEqual<T extends Record<string, unknown>>(
  actual: T,
  expected: T,
  keys: (keyof T)[],
): void {
  for (const key of keys) {
    if (actual[key] !== expected[key]) {
      throw new Error(
        `字段 ${String(key)} 不一致：期望 ${String(expected[key])}，实际 ${String(actual[key])}`,
      )
    }
  }
}

/** 比较两个对象在指定 keys 上的值是否一致 */
export function compareShape<T extends Record<string, unknown>>(
  actual: T,
  expected: T,
  keys: readonly (keyof T)[],
): string | undefined {
  for (const key of keys) {
    if (actual[key] !== expected[key]) {
      return `字段 ${String(key)} 不一致：期望 ${String(expected[key])}，实际 ${String(actual[key])}`
    }
  }
  return undefined
}
