import test from "node:test"
import assert from "node:assert/strict"
import { renderTemplate } from "../scripts/template.mjs"

test("模板转义文字和属性，保留已渲染的正文", () => {
  const html = renderTemplate('<a title="{{ title }}">{{ title }}</a>{{{ body }}}', {
    title: '<script>"&',
    body: '<p class="katex">公式</p>',
  })
  assert.equal(html, '<a title="&lt;script&gt;&quot;&amp;">&lt;script&gt;&quot;&amp;</a><p class="katex">公式</p>')
})

test("正文中的模板语法不被再次执行", () => {
  assert.equal(renderTemplate("{{{ body }}}", { body: "示例 {{ title }} 和 {{{ content }}}" }),
    "示例 {{ title }} 和 {{{ content }}}")
})

test("缺失变量报告模板和变量名", () => {
  assert.throws(() => renderTemplate("{{ title }}", {}, "article.html"), /article\.html: 缺少模板变量 title/)
})
