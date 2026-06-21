import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** 从包根 package.json 读取版本（dist/cli.js → ../package.json） */
export function readPackageVersion(): string {
  const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string }
  return pkg.version
}
