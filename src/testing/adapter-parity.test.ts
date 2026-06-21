import { describe, expect, it } from "vitest"
import { assertAdapterParity } from "./adapter-parity.js"

describe("assertAdapterParity", () => {
  it("对象 keys 一致时通过", async () => {
    const result = await assertAdapterParity({
      label: "getUser",
      mock: () => ({ id: "1", name: "mock", secret: "x" }),
      real: () => ({ id: "1", name: "mock", secret: "y" }),
      keys: ["id", "name"],
    })

    expect(result.mock.name).toBe("mock")
  })

  it("数组按 index 比较 keys", async () => {
    await expect(
      assertAdapterParity({
        mock: () => [{ id: "1", name: "a" }],
        real: () => [{ id: "1", name: "b" }],
        keys: ["id", "name"],
      }),
    ).rejects.toThrow("字段 name 不一致")
  })

  it("自定义 compare 优先", async () => {
    await expect(
      assertAdapterParity({
        mock: () => 10,
        real: () => 20,
        compare: (a, b) => (a === b ? undefined : "数值不一致"),
      }),
    ).rejects.toThrow("数值不一致")
  })

  it("数组长度不一致时抛出", async () => {
    await expect(
      assertAdapterParity({
        mock: () => [{ id: "1" }],
        real: () => [],
        keys: ["id"],
      }),
    ).rejects.toThrow("数组长度不一致")
  })
})
