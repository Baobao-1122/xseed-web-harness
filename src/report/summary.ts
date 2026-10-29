export type StepResult = {
  label: string
  success: boolean
  durationMs: number
  error?: string
}

export type LayerResult = {
  layerId: string
  layerName: string
  steps: StepResult[]
  success: boolean
  durationMs: number
}

export type HarnessReport = {
  project: string
  profile?: string
  cwd: string
  startedAt: string
  finishedAt: string
  durationMs: number
  success: boolean
  layers: LayerResult[]
}

export function createEmptyReport(input: {
  project: string
  profile?: string
  cwd: string
  startedAt: Date
}): HarnessReport {
  return {
    project: input.project,
    profile: input.profile,
    cwd: input.cwd,
    startedAt: input.startedAt.toISOString(),
    finishedAt: input.startedAt.toISOString(),
    durationMs: 0,
    success: true,
    layers: [],
  }
}

export function finalizeReport(report: HarnessReport, startedAt: Date): HarnessReport {
  const finishedAt = new Date()
  const success = report.layers.every((layer) => layer.success)
  return {
    ...report,
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    success,
  }
}

export function printReportSummary(report: HarnessReport): void {
  const icon = report.success ? "✅" : "❌"
  console.log(`\n${icon} @linzhang1122/web-harness — ${report.project}`)
  if (report.profile) console.log(`   profile: ${report.profile}`)
  console.log(`   耗时: ${(report.durationMs / 1000).toFixed(1)}s\n`)

  for (const layer of report.layers) {
    const layerIcon = layer.success ? "✓" : "✗"
    console.log(`${layerIcon} ${layer.layerId} ${layer.layerName} (${(layer.durationMs / 1000).toFixed(1)}s)`)
    for (const step of layer.steps) {
      const stepIcon = step.success ? "  ·" : "  ✗"
      const suffix = step.success ? "" : ` — ${step.error ?? "失败"}`
      console.log(`${stepIcon} ${step.label} (${(step.durationMs / 1000).toFixed(1)}s)${suffix}`)
    }
  }

  console.log("")
}
