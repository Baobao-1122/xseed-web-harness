import { describe, expect, it } from "vitest"
import { parseHarnessConfig } from "./schema.js"

describe("parseHarnessConfig", () => {
  it("解析最小合法配置", () => {
    const config = parseHarnessConfig({
      name: "demo",
      layers: {
        L1: {
          name: "unit",
          steps: [{ type: "vitest", patterns: ["**/*.test.ts"] }],
        },
      },
    })

    expect(config.name).toBe("demo")
    expect(config.layers.L1.steps).toHaveLength(1)
  })

  it("拒绝空 layer", () => {
    expect(() =>
      parseHarnessConfig({
        name: "demo",
        layers: {
          L1: { name: "bad", steps: [] },
        },
      }),
    ).toThrow()
  })
})
