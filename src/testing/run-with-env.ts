type EnvPatch = Record<string, string | undefined>

function applyEnvPatch(env: EnvPatch): Record<string, string | undefined> {
  const previous: Record<string, string | undefined> = {}

  for (const key of Object.keys(env)) {
    previous[key] = process.env[key]
    const value = env[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  return previous
}

function restoreEnv(previous: Record<string, string | undefined>): void {
  for (const key of Object.keys(previous)) {
    const value = previous[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

/**
 * 在临时环境变量下执行 fn，结束后恢复 process.env。
 * 适用于 USE_MOCK=true/false 等双模 adapter 测试。
 */
export async function runWithEnv<T>(env: EnvPatch, fn: () => T | Promise<T>): Promise<T> {
  const previous = applyEnvPatch(env)
  try {
    return await fn()
  } finally {
    restoreEnv(previous)
  }
}

/** runWithEnv 的同步版本 */
export function runWithEnvSync<T>(env: EnvPatch, fn: () => T): T {
  const previous = applyEnvPatch(env)
  try {
    return fn()
  } finally {
    restoreEnv(previous)
  }
}
