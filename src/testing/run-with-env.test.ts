import { describe, expect, it } from "vitest"
import { runWithEnv, runWithEnvSync } from "./run-with-env.js"

describe("runWithEnv", () => {
  it("临时写入并在 finally 后恢复", async () => {
    const original = process.env.HARNESS_TEST_KEY
    delete process.env.HARNESS_TEST_KEY

    await runWithEnv({ HARNESS_TEST_KEY: "true" }, async () => {
      expect(process.env.HARNESS_TEST_KEY).toBe("true")
    })

    expect(process.env.HARNESS_TEST_KEY).toBe(original)
  })

  it("fn 抛错时仍恢复环境", async () => {
    process.env.HARNESS_TEST_KEY = "before"

    await expect(
      runWithEnv({ HARNESS_TEST_KEY: "during" }, () => {
        throw new Error("boom")
      }),
    ).rejects.toThrow("boom")

    expect(process.env.HARNESS_TEST_KEY).toBe("before")
    delete process.env.HARNESS_TEST_KEY
  })
})

describe("runWithEnvSync", () => {
  it("同步执行并恢复", () => {
    const result = runWithEnvSync({ HARNESS_SYNC_KEY: "1" }, () => {
      return process.env.HARNESS_SYNC_KEY
    })

    expect(result).toBe("1")
    expect(process.env.HARNESS_SYNC_KEY).toBeUndefined()
  })
})
