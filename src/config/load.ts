import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { createJiti } from "jiti"
import { parseHarnessConfig, type HarnessConfig } from "./schema.js"

const CONFIG_CANDIDATES = [
  "harness.config.ts",
  "harness.config.mts",
  "harness.config.js",
  "harness.config.mjs",
]

export function findConfigPath(cwd: string): string | null {
  for (const name of CONFIG_CANDIDATES) {
    const fullPath = resolve(cwd, name)
    if (existsSync(fullPath)) return fullPath
  }
  return null
}

export async function loadHarnessConfig(cwd: string): Promise<{ config: HarnessConfig; configPath: string }> {
  const configPath = findConfigPath(cwd)
  if (!configPath) {
    throw new Error(
      `未找到 harness 配置文件。请在项目根目录创建 harness.config.ts，或运行 harness init`,
    )
  }

  const jiti = createJiti(import.meta.url, { interopDefault: true })
  const loaded = await jiti.import(configPath)
  const raw = (loaded as { default?: unknown }).default ?? loaded
  const config = parseHarnessConfig(raw)
  return { config, configPath }
}

export function resolveProfileLayers(config: HarnessConfig, profileName?: string): string[] {
  if (!profileName) {
    return Object.keys(config.layers)
  }

  const profile = config.profiles?.[profileName]
  if (!profile) {
    const available = config.profiles ? Object.keys(config.profiles).join(", ") : "(无)"
    throw new Error(`未知 profile "${profileName}"。可用：${available}`)
  }

  return profile.layers
}

export function resolveLayerFilter(layerFilter: string[] | undefined, profileLayers: string[]): string[] {
  if (!layerFilter?.length) return profileLayers

  const unknown = layerFilter.filter((id) => !profileLayers.includes(id))
  if (unknown.length > 0) {
    throw new Error(`layer 不在当前 profile 中：${unknown.join(", ")}`)
  }

  return layerFilter
}
