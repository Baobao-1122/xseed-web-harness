import { compareShape } from "./shape.js"

type ObjectKeys<T> = T extends (infer Item)[]
  ? Item extends Record<string, unknown>
    ? readonly (keyof Item & string)[]
    : never
  : T extends Record<string, unknown>
    ? readonly (keyof T & string)[]
    : never

export type AdapterParityOptions<T> = {
  /** 用例标签，出现在错误信息中 */
  label?: string
  mock: () => T | Promise<T>
  real: () => T | Promise<T>
  /** 对象/数组元素：只比较这些字段 */
  keys?: ObjectKeys<T>
  /** 自定义比较；返回 string 表示失败原因 */
  compare?: (mock: T, real: T) => string | undefined
}

function formatLabel(label?: string): string {
  return label ? `[${label}] ` : ""
}

function compareArrayParity<T>(
  mockItems: T[],
  realItems: T[],
  keys: readonly string[] | undefined,
  label: string | undefined,
  compare?: (mock: T, real: T) => string | undefined,
): void {
  if (mockItems.length !== realItems.length) {
    throw new Error(
      `${formatLabel(label)}数组长度不一致：mock ${mockItems.length}，real ${realItems.length}`,
    )
  }

  for (let index = 0; index < mockItems.length; index += 1) {
    const mockItem = mockItems[index]
    const realItem = realItems[index]
    const itemLabel = label ? `${label}[${index}]` : `[${index}]`

    if (compare) {
      const reason = compare(mockItem, realItem)
      if (reason) {
        throw new Error(`${formatLabel(itemLabel)}${reason}`)
      }
      continue
    }

    if (
      keys &&
      typeof mockItem === "object" &&
      mockItem !== null &&
      typeof realItem === "object" &&
      realItem !== null
    ) {
      const reason = compareShape(
        mockItem as Record<string, unknown>,
        realItem as Record<string, unknown>,
        keys as readonly (keyof Record<string, unknown>)[],
      )
      if (reason) {
        throw new Error(`${formatLabel(itemLabel)}${reason}`)
      }
    }
  }
}

/**
 * 在同一操作下对比 mock / real adapter 的返回，确保双模行为一致。
 */
export async function assertAdapterParity<T>(
  options: AdapterParityOptions<T>,
): Promise<{ mock: T; real: T }> {
  const { label, mock, real, keys, compare } = options
  const mockResult = await mock()
  const realResult = await real()

  if (compare) {
    const reason = compare(mockResult, realResult)
    if (reason) {
      throw new Error(`${formatLabel(label)}${reason}`)
    }
    return { mock: mockResult, real: realResult }
  }

  if (Array.isArray(mockResult) && Array.isArray(realResult)) {
    compareArrayParity(mockResult, realResult, keys as readonly string[] | undefined, label, compare)
    return { mock: mockResult, real: realResult }
  }

  if (
    keys &&
    typeof mockResult === "object" &&
    mockResult !== null &&
    typeof realResult === "object" &&
    realResult !== null
  ) {
    const reason = compareShape(
      mockResult as Record<string, unknown>,
      realResult as Record<string, unknown>,
      keys as readonly (keyof Record<string, unknown>)[],
    )
    if (reason) {
      throw new Error(`${formatLabel(label)}${reason}`)
    }
    return { mock: mockResult, real: realResult }
  }

  if (mockResult !== realResult) {
    throw new Error(
      `${formatLabel(label)}mock / real 结果不一致：${String(mockResult)} !== ${String(realResult)}`,
    )
  }

  return { mock: mockResult, real: realResult }
}
