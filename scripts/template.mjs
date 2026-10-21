import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { escape } from "./content.mjs"

// Only named slots are supported; templates never execute JavaScript.
// {{ value }} escapes text/attributes; {{{ value }}} inserts rendered HTML.
export function renderTemplate(source, data, name = "template") {
  return source.replace(
    /\{\{\{\s*(\w+)\s*\}\}\}|\{\{\s*(\w+)\s*\}\}/g,
    (_, raw, escaped) => {
      const key = raw || escaped
      if (!Object.hasOwn(data, key)) {
        throw new Error(`${name}: 缺少模板变量 ${key}`)
      }
      return raw ? String(data[key] ?? "") : escape(data[key] ?? "")
    },
  )
}

export async function loadTemplates(directory) {
  const sources = new Map()
  const files = await readdir(directory, { recursive: true })
  await Promise.all(files.filter(file => file.endsWith(".html")).map(async file => {
    const name = file.replaceAll("\\", "/").replace(/\.html$/, "")
    sources.set(name, await readFile(path.join(directory, file), "utf8"))
  }))
  return (name, data = {}) => {
    if (!sources.has(name)) throw new Error(`找不到模板：${name}.html`)
    return renderTemplate(sources.get(name), data, `${name}.html`)
  }
}
