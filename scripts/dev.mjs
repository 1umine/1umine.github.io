import http from "node:http"
import { readFile, stat } from "node:fs/promises"
import { watch } from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"
const root = path.resolve("dist")
const config = JSON.parse(await readFile("site.config.json", "utf8"))
const base = "/" + config.basePath.split("/").filter(Boolean).join("/")
let running = false,
  pending = false
async function build() {
  if (running) {
    pending = true
    return
  }
  running = true
  await new Promise((resolve) =>
    spawn(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" }).on(
      "exit",
      resolve,
    ),
  )
  running = false
  if (pending) {
    pending = false
    await build()
  }
}
await build()
let timer
for (const dir of ["posts", "public", "scripts", "templates", "site.config.json"])
  watch(dir, { recursive: true }, () => {
    clearTimeout(timer)
    timer = setTimeout(build, 200)
  })
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
}
http
  .createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      )
      if (base !== "/") {
        if (!pathname.startsWith(base + "/") && pathname !== base) {
          res.writeHead(404)
          res.end()
          return
        }
        pathname = pathname.slice(base.length)
      }
      let file = path.resolve(root, "." + (pathname || "/"))
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403)
        res.end()
        return
      }
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html")
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      })
      res.end(await readFile(file))
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      res.end(
        await readFile(path.join(root, "404.html")).catch(() => "Not found"),
      )
    }
  })
  .listen(4321, "127.0.0.1", () =>
    console.log(
      `预览：http://localhost:4321${base === "/" ? "/" : base + "/"} （修改后刷新页面）`,
    ),
  )
