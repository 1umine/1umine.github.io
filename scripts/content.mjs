import MarkdownIt from "markdown-it"
import { parse } from "yaml"
import hljs from "highlight.js"
import { katex } from "@mdit/plugin-katex"

export const escape = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  )
export function renderMarkdown(source) {
  const headings = []
  const used = new Set()
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight(code, language) {
      return language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : ""
    },
  })
  md.use(katex, { throwOnError: false, trust: false, output: "htmlAndMathml" })
  md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
    const inline = tokens[index + 1]
    const title = inline.children
      .filter(
        (t) =>
          t.type === "text" ||
          t.type === "code_inline" ||
          t.type === "math_inline",
      )
      .map((t) => t.content)
      .join("")
    const base =
      title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "") || "section"
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    tokens[index].attrSet("id", id)
    headings.push({ id, title, level: Number(tokens[index].tag.slice(1)) })
    return self.renderToken(tokens, index, options)
  }
  return { html: md.render(source), headings }
}
export function parsePost(source, filename) {
  source = source.replace(/^\uFEFF/, "")
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (/^---\r?\n/.test(source) && !front)
    throw new Error(`${filename}: front matter 缺少结束标记`)
  const data = front ? parse(front[1]) || {} : {}
  if (typeof data !== "object" || Array.isArray(data))
    throw new Error(`${filename}: front matter 必须是键值对象`)
  const content = front ? source.slice(front[0].length) : source
  if (data.draft === true) return null
  const title = String(
    data.title ||
      content.match(/^#\s+(.+)$/m)?.[1] ||
      filename.replace(/\.md$/i, "").split("/").at(-1),
  )
  const date = data.date ? new Date(data.date) : new Date("1970-01-01")
  if (Number.isNaN(date.getTime()))
    throw new Error(`${filename}: date 格式无效`)
  const tags =
    data.tags == null
      ? []
      : Array.isArray(data.tags)
        ? data.tags
        : String(data.tags).split(",")
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  const body = content.replace(/^#\s+[^\n]+\r?\n/, "")
  return {
    title,
    date: date.toISOString().slice(0, 10),
    category: String(data.category || "随笔"),
    tags: [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))],
    description: String(data.description || plain.slice(0, 110)),
    minutes: Math.max(1, Math.ceil(content.length / 650)),
    filename,
    ...renderMarkdown(body),
  }
}
