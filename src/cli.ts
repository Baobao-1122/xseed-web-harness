#!/usr/bin/env node
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { Command } from "commander"
import { doctorHarness, initHarnessConfig, runHarness } from "./runner/run-harness.js"
import { readPackageVersion } from "./version.js"

const DEFAULT_REPORT_FILE = "harness-report.json"

async function main(): Promise<void> {
  const program = new Command()

  program
    .name("harness")
    .description("@linzhang1122/web-harness — Web 项目分层测试编排 CLI")
    .version(readPackageVersion())

  program
    .command("run")
    .description("按 harness.config.ts 执行分层测试")
    .option("-c, --cwd <path>", "业务项目根目录", process.cwd())
    .option("-p, --profile <name>", "使用 profiles 中的配置，如 ci / local")
    .option("-l, --layer <ids...>", "只跑指定 layer（可多个）")
    .option("--report-file <path>", "写入 JSON 报告", DEFAULT_REPORT_FILE)
    .option("--no-report", "不写入 JSON 报告")
    .action(async (options: {
      cwd: string
      profile?: string
      layer?: string[]
      reportFile?: string
      report: boolean
    }) => {
      await runHarness({
        cwd: resolve(options.cwd),
        profile: options.profile,
        layers: options.layer,
        reportFile: options.report ? options.reportFile : undefined,
      })
    })

  program
    .command("doctor")
    .description("检查 harness 配置与运行环境（node / pnpm / vitest）")
    .option("-c, --cwd <path>", "业务项目根目录", process.cwd())
    .action(async (options: { cwd: string }) => {
      await doctorHarness(resolve(options.cwd))
    })

  program
    .command("init")
    .description("在当前目录生成 harness.config.ts 模板")
    .option("-c, --cwd <path>", "业务项目根目录", process.cwd())
    .option("-f, --force", "覆盖已存在的配置文件")
    .action((options: { cwd: string; force?: boolean }) => {
      const cwd = resolve(options.cwd)
      const target = resolve(cwd, "harness.config.ts")
      if (existsSync(target) && !options.force) {
        throw new Error(`已存在 ${target}，使用 --force 覆盖`)
      }
      const written = initHarnessConfig(cwd)
      console.log(`已生成: ${written}`)
    })

  await program.parseAsync(process.argv)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
})
