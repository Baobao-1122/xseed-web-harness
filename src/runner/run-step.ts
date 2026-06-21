import { spawnSync } from "node:child_process"
import type { Step } from "../config/schema.js"
import type { StepResult } from "../report/summary.js"

export type RunContext = {
  cwd: string
  baseEnv: NodeJS.ProcessEnv
  labelPrefix?: string
}

function mergeEnv(base: NodeJS.ProcessEnv, extra?: Record<string, string>): NodeJS.ProcessEnv {
  return { ...base, ...extra }
}

function runVitestStep(step: Extract<Step, { type: "vitest" }>, ctx: RunContext): StepResult {
  const label = `${ctx.labelPrefix ?? ""}vitest: ${step.patterns.join(" ")}`.trim()
  const started = Date.now()
  const args = ["vitest", "run", ...step.patterns]
  const result = spawnSync("pnpm", args, {
    cwd: ctx.cwd,
    env: mergeEnv(ctx.baseEnv, step.env),
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  const success = result.status === 0
  return {
    label,
    success,
    durationMs: Date.now() - started,
    error: success ? undefined : `vitest 退出码 ${result.status ?? "unknown"}`,
  }
}

function runShellStep(step: Extract<Step, { type: "shell" }>, ctx: RunContext): StepResult {
  const label = `${ctx.labelPrefix ?? ""}shell: ${step.command}`.trim()
  const started = Date.now()
  const result = spawnSync(step.command, {
    cwd: step.cwd ?? ctx.cwd,
    env: mergeEnv(ctx.baseEnv, step.env),
    stdio: "inherit",
    shell: true,
  })

  const success = result.status === 0
  return {
    label,
    success,
    durationMs: Date.now() - started,
    error: success ? undefined : `shell 退出码 ${result.status ?? "unknown"}`,
  }
}

function runMatrixStep(step: Extract<Step, { type: "matrix" }>, ctx: RunContext): StepResult[] {
  const results: StepResult[] = []

  for (const value of step.values) {
    const matrixCtx: RunContext = {
      ...ctx,
      baseEnv: mergeEnv(ctx.baseEnv, { [step.envKey]: value }),
      labelPrefix: `[${step.envKey}=${value}] `,
    }

    for (const nested of step.steps) {
      results.push(...runStep(nested, matrixCtx))
    }
  }

  return results
}

export function runStep(step: Step, ctx: RunContext): StepResult[] {
  if (step.type === "vitest") {
    return [runVitestStep(step, ctx)]
  }

  if (step.type === "shell") {
    return [runShellStep(step, ctx)]
  }

  return runMatrixStep(step, ctx)
}

export function flattenStepSuccess(results: StepResult[]): boolean {
  return results.every((item) => item.success)
}
