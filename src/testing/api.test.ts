import { describe, expect, it } from "vitest"
import {
  assertApiForbidden,
  assertResponseError,
  assertResponseForbidden,
  assertResponseOk,
} from "./api.js"

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("assertApiForbidden", () => {
  it("403 状态通过", () => {
    expect(() => assertApiForbidden(403)).not.toThrow()
  })

  it("非 403 状态抛出", () => {
    expect(() => assertApiForbidden(401, "GET /users")).toThrow("GET /users: 期望 HTTP 403")
  })
})

describe("assertResponseForbidden", () => {
  it("校验 status 与 message", async () => {
    const response = jsonResponse({ message: "权限不足" }, 403)
    await expect(assertResponseForbidden(response)).resolves.toBeUndefined()
    await expect(assertResponseForbidden(response, { message: "权限不足" })).resolves.toBeUndefined()
    await expect(assertResponseForbidden(response, { message: /权限/ })).resolves.toBeUndefined()
  })

  it("message 不匹配时抛出", async () => {
    const response = jsonResponse({ message: "权限不足" }, 403)
    await expect(assertResponseForbidden(response, { message: "无权限" })).rejects.toThrow(
      "期望 message",
    )
  })
})

describe("assertResponseError", () => {
  it("校验任意错误 status 与 message", async () => {
    const response = jsonResponse({ message: "请先登录" }, 401)
    await expect(assertResponseError(response, { status: 401, message: "请先登录" })).resolves.toBeUndefined()
  })
})

describe("assertResponseOk", () => {
  it("200 通过", async () => {
    await expect(assertResponseOk(new Response(null, { status: 200 }))).resolves.toBeUndefined()
  })
})
