import { z } from "zod"

const vitestStepSchema = z.object({
  type: z.literal("vitest"),
  patterns: z.array(z.string()).min(1),
  env: z.record(z.string()).optional(),
})

const shellStepSchema = z.object({
  type: z.literal("shell"),
  command: z.string().min(1),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
})

type StepSchema = z.ZodType<Step>

const stepSchema: StepSchema = z.lazy(() =>
  z.discriminatedUnion("type", [
    vitestStepSchema,
    shellStepSchema,
    z.object({
      type: z.literal("matrix"),
      envKey: z.string().min(1),
      values: z.array(z.string()).min(1),
      steps: z.array(stepSchema).min(1),
    }),
  ]),
)

export type VitestStep = z.infer<typeof vitestStepSchema>
export type ShellStep = z.infer<typeof shellStepSchema>
export type MatrixStep = {
  type: "matrix"
  envKey: string
  values: string[]
  steps: Step[]
}
export type Step = VitestStep | ShellStep | MatrixStep

const layerSchema = z.object({
  name: z.string().min(1),
  steps: z.array(stepSchema).min(1),
})

const profileSchema = z.object({
  layers: z.array(z.string()).min(1),
})

export const harnessConfigSchema = z.object({
  name: z.string().min(1),
  profiles: z.record(profileSchema).optional(),
  layers: z.record(layerSchema),
})

export type HarnessConfig = z.infer<typeof harnessConfigSchema>
export type HarnessLayer = z.infer<typeof layerSchema>
export type HarnessProfile = z.infer<typeof profileSchema>

export function parseHarnessConfig(input: unknown): HarnessConfig {
  return harnessConfigSchema.parse(input)
}
