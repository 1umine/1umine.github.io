import { readFile, writeFile, mkdir, readdir, cp, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parsePost } from "./content.mjs"
import { loadTemplates } from "./template.mjs"
import { createPages } from "./pages.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))
const config = JSON.parse(
  await readFile(path.join(root, "site.config.json"), "utf8"),
)
const base = "/" + config.basePath.split("/").filter(Boolean).join("/")
const url = (p) => `${base === "/" ? "" : base}/${p}`
const out = path.join(root, "dist")
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(path.join(dir, entry.name))
          : path.join(dir, entry.name),
      ),
    )
  ).flat()
}
const files = await walk(path.join(root, "posts"))
const posts = (
  await Promise.all(
    files
      .filter((f) => /\.md$/i.test(f))
      .map(async (file) => {
        const filename = path
          .relative(path.join(root, "posts"), file)
          .replaceAll("\\", "/")
        const post = parsePost(await readFile(file, "utf8"), filename)
        if (post)
          post.href = url(
            "posts/" +
              filename
                .replace(/\.md$/i, ".html")
                .split("/")
                .map(encodeURIComponent)
                .join("/"),
          )
        return post
      }),
  )
)
  .filter(Boolean)
  .sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  )
const categories = [...new Set(posts.map((p) => p.category))]
const tags = [...new Set(posts.flatMap((p) => p.tags))]
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await cp(path.join(root, "public"), out, { recursive: true })
const katexDist = path.dirname(fileURLToPath(import.meta.resolve("katex")))
await mkdir(path.join(out, "assets/katex"), { recursive: true })
await cp(
  path.join(katexDist, "katex.min.css"),
  path.join(out, "assets/katex/katex.min.css"),
)
await cp(path.join(katexDist, "fonts"), path.join(out, "assets/katex/fonts"), {
  recursive: true,
})
await cp(
  path.join(katexDist, "../LICENSE"),
  path.join(out, "assets/katex/LICENSE"),
)
for (const file of files.filter((f) => !/\.md$/i.test(f))) {
  const dest = path.join(
    out,
    "posts",
    path.relative(path.join(root, "posts"), file),
  )
  await mkdir(path.dirname(dest), { recursive: true })
  await cp(file, dest)
}
const render = await loadTemplates(path.join(root, "templates"))
const pages = createPages({ render, config, url, posts, categories, tags })
await writeFile(path.join(out, "index.html"), pages.home())
for (const [index, post] of posts.entries()) {
  const dest = path.join(out, "posts", post.filename.replace(/\.md$/i, ".html"))
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, pages.article(post, index))
}
await writeFile(path.join(out, "archive.html"), pages.archive())
await writeFile(path.join(out, "about.html"), pages.about())
await writeFile(path.join(out, "404.html"), pages.notFound())
await writeFile(path.join(out, ".nojekyll"), "")
console.log(
  `已生成 ${posts.length} 篇文章、${categories.length} 个分类、${tags.length} 个标签 → dist/`,
)
