import { spawnSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { loadHarnessConfig, resolveLayerFilter, resolveProfileLayers } from "../config/load.js"
import type { HarnessConfig } from "../config/schema.js"
import {
  createEmptyReport,
  finalizeReport,
  printReportSummary,
  type HarnessReport,
  type LayerResult,
} from "../report/summary.js"
import { flattenStepSuccess, runStep } from "./run-step.js"

export type RunHarnessOptions = {
  cwd: string
  profile?: string
  layers?: string[]
  reportFile?: string
  env?: Record<string, string>
}

export async function runHarness(options: RunHarnessOptions): Promise<HarnessReport> {
  const startedAt = new Date()
  const { config } = await loadHarnessConfig(options.cwd)
  const profileLayers = resolveProfileLayers(config, options.profile)
  const layerIds = resolveLayerFilter(options.layers, profileLayers)

  let report = createEmptyReport({
    project: config.name,
    profile: options.profile,
    cwd: options.cwd,
    startedAt,
  })

  const baseEnv: NodeJS.ProcessEnv = {
    ...process.env,
    ...options.env,
  }

  for (const layerId of layerIds) {
    const layer = config.layers[layerId]
    if (!layer) {
      throw new Error(`未定义的 layer: ${layerId}`)
    }

    const layerStarted = Date.now()
    const stepResults = []

    console.log(`\n── ${layerId} ${layer.name} ──`)

    for (const step of layer.steps) {
      const results = runStep(step, { cwd: options.cwd, baseEnv })
      stepResults.push(...results)

      const failed = results.find((item) => !item.success)
      if (failed) {
        report = appendLayer(report, {
          layerId,
          layerName: layer.name,
          steps: stepResults,
          success: false,
          durationMs: Date.now() - layerStarted,
        })
        report = finalizeReport(report, startedAt)
        writeReportFile(report, options)
        printReportSummary(report)
        throw new Error(`layer ${layerId} 在步骤「${failed.label}」失败`)
      }
    }

    report = appendLayer(report, {
      layerId,
      layerName: layer.name,
      steps: stepResults,
      success: flattenStepSuccess(stepResults),
      durationMs: Date.now() - layerStarted,
    })
  }

  report = finalizeReport(report, startedAt)
  writeReportFile(report, options)
  printReportSummary(report)

  if (!report.success) {
    throw new Error("harness 未通过")
  }

  return report
}

function appendLayer(report: HarnessReport, layer: LayerResult): HarnessReport {
  return {
    ...report,
    layers: [...report.layers, layer],
  }
}

function writeReportFile(report: HarnessReport, options: RunHarnessOptions): void {
  if (!options.reportFile) return
  const target = resolve(options.cwd, options.reportFile)
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf8")
}

export async function doctorHarness(cwd: string): Promise<void> {
  const checks: { name: string; ok: boolean; hint?: string }[] = []

  try {
    await loadHarnessConfig(cwd)
    checks.push({ name: "harness.config 可读", ok: true })
  } catch (error) {
    checks.push({
      name: "harness.config 可读",
      ok: false,
      hint: error instanceof Error ? error.message : String(error),
    })
  }

  checks.push(checkCommand("node", ["--version"]))
  checks.push(checkCommand("pnpm", ["--version"]))
  checks.push(checkCommand("pnpm", ["vitest", "--version"]))

  console.log("\n@xseed/web-harness doctor\n")
  for (const item of checks) {
    const icon = item.ok ? "✓" : "✗"
    const hint = item.hint ? ` — ${item.hint}` : ""
    console.log(`${icon} ${item.name}${hint}`)
  }

  const failed = checks.filter((item) => !item.ok)
  if (failed.length > 0) {
    throw new Error(`doctor 未通过（${failed.length} 项）`)
  }
}

function checkCommand(command: string, args: string[]): { name: string; ok: boolean; hint?: string } {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  })
  const ok = result.status === 0
  const output = (result.stdout ?? result.stderr ?? "").trim()
  return {
    name: `${command} ${args.join(" ")}`.trim(),
    ok,
    hint: ok ? output.split("\n")[0] : output || `退出码 ${result.status ?? "unknown"}`,
  }
}

export function initHarnessConfig(cwd: string): string {
  const target = resolve(cwd, "harness.config.ts")
  const template = `import { defineHarnessConfig } from "@xseed/web-harness"

export default defineHarnessConfig({
  name: "my-web-app",
  profiles: {
    ci: { layers: ["L1"] },
    local: { layers: ["L1"] },
  },
  layers: {
    L1: {
      name: "单元测试",
      steps: [{ type: "vitest", patterns: ["lib/**/*.test.ts"] }],
    },
  },
})
`
  writeFileSync(target, template, "utf8")
  return target
}

export type { HarnessConfig }
