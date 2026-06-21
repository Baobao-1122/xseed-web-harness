function formatContext(context?: string): string {
  return context ? `${context}: ` : ""
}

export function assertApiStatus(status: number, expected: number, context?: string): void {
  if (status !== expected) {
    throw new Error(`${formatContext(context)}期望 HTTP ${expected}，实际 ${status}`)
  }
}

export function assertApiOk(status: number, context?: string): void {
  assertApiStatus(status, 200, context)
}

export function assertApiForbidden(status: number, context?: string): void {
  assertApiStatus(status, 403, context)
}

export type ApiErrorExpectation = {
  status: number
  message?: string | RegExp
}

/** 解析 Response JSON body；非 JSON 时返回 undefined（clone 后读取，不消耗原 body） */
export async function readResponseJson(response: Response): Promise<unknown> {
  const text = await response.clone().text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

export async function assertResponseStatus(
  response: Response,
  expected: number,
  context?: string,
): Promise<void> {
  assertApiStatus(response.status, expected, context)
}

export async function assertResponseOk(response: Response, context?: string): Promise<void> {
  await assertResponseStatus(response, 200, context)
}

/**
 * 断言标准 403 响应（status + 可选 `{ message }` 正文）。
 * 对齐 Web API 路由规范：错误体使用 `message` 字段。
 */
export async function assertResponseForbidden(
  response: Response,
  options?: { message?: string | RegExp; context?: string },
): Promise<void> {
  const { message, context } = options ?? {}
  await assertResponseStatus(response, 403, context)

  if (message === undefined) return

  const body = await readResponseJson(response)
  if (body === null || typeof body !== "object") {
    throw new Error(`${formatContext(context)}403 响应体应为 JSON 对象`)
  }

  const actualMessage = (body as Record<string, unknown>).message
  if (typeof actualMessage !== "string") {
    throw new Error(`${formatContext(context)}403 响应体缺少 string 类型 message 字段`)
  }

  if (typeof message === "string" && actualMessage !== message) {
    throw new Error(
      `${formatContext(context)}期望 message「${message}」，实际「${actualMessage}」`,
    )
  }

  if (message instanceof RegExp && !message.test(actualMessage)) {
    throw new Error(
      `${formatContext(context)}message「${actualMessage}」不匹配 ${String(message)}`,
    )
  }
}

export async function assertResponseError(
  response: Response,
  expected: ApiErrorExpectation,
  context?: string,
): Promise<void> {
  await assertResponseStatus(response, expected.status, context)

  if (expected.message === undefined) return

  const body = await readResponseJson(response)
  if (body === null || typeof body !== "object") {
    throw new Error(`${formatContext(context)}错误响应体应为 JSON 对象`)
  }

  const actualMessage = (body as Record<string, unknown>).message
  if (typeof actualMessage !== "string") {
    throw new Error(`${formatContext(context)}错误响应体缺少 string 类型 message 字段`)
  }

  const { message } = expected
  if (typeof message === "string" && actualMessage !== message) {
    throw new Error(
      `${formatContext(context)}期望 message「${message}」，实际「${actualMessage}」`,
    )
  }

  if (message instanceof RegExp && !message.test(actualMessage)) {
    throw new Error(
      `${formatContext(context)}message「${actualMessage}」不匹配 ${String(message)}`,
    )
  }
}
