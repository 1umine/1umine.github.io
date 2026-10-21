import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePost, renderMarkdown } from '../scripts/content.mjs';
test('行内和独立数学公式生成 HTML 与可访问 MathML',()=>{
  const { html } = renderMarkdown('质能 $E=mc^2$。\n\n$$\n\\frac{1}{2} + \\sum_{i=1}^{n} i\n$$');
  assert.match(html,/class="katex"/); assert.match(html,/katex-display/);
  assert.match(html,/<math/); assert.match(html,/annotation encoding="application\/x-tex"/);
});
test('代码块、行内代码和转义美元符号不渲染为公式',()=>{
  const { html } = renderMarkdown('`$x$`\n\n```latex\n$x$\n```\n\n价格 \\$20');
  assert.doesNotMatch(html,/class="katex/); assert.match(html,/价格 \$20/);
});
test('矩阵与多行公式正常渲染，错误公式不会中断生成',()=>{
  const { html } = renderMarkdown('$$\n\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}\n$$\n\n$$\n\\begin{bmatrix}1 & 2 \\\\ 3 & 4\\end{bmatrix}\n$$');
  assert.doesNotMatch(html,/katex-error/);
  assert.match(renderMarkdown('$\\unknowncommand{x}$').html,/color.*#cc0000/);
  assert.match(renderMarkdown('$\\frac{1}$').html,/katex-error/);
});
test('读取 YAML 元数据、中文标签与日期',()=>{
  const post = parsePost('---\ntitle: 一篇文章\ndate: 2026-10-21\ncategory: 技术\ntags: [JavaScript, 中文, 中文]\n---\n## 开始\n正文','nested/test.md');
  assert.equal(post.title,'一篇文章'); assert.equal(post.date,'2026-10-21');
  assert.deepEqual(post.tags,['JavaScript','中文']); assert.equal(post.headings[0].id,'开始');
});
test('重复和相互冲突的标题锚点始终唯一',()=>{
  const result = renderMarkdown('## 标题\n## 标题\n## 标题-2\n### `代码` 标题\n## !!!');
  assert.equal(new Set(result.headings.map(h=>h.id)).size,5);
  assert.equal(result.headings[3].title,'代码 标题'); assert.equal(result.headings[4].id,'section');
});
test('无 front matter 的文件也能生成文章',()=>{
  const post = parsePost('# 第一篇\n\n正文','first.md');
  assert.equal(post.title,'第一篇'); assert.equal(post.category,'随笔'); assert.doesNotMatch(post.html,/<h1/);
});
test('跳过草稿并拒绝无效日期',()=>{
  assert.equal(parsePost('---\ndraft: true\n---\n内容','draft.md'),null);
  assert.throws(()=>parsePost('---\ndate: nope\n---\n正文','bad.md'),/date/);
});
test('支持代码、表格，并转义原始 HTML 和危险链接',()=>{
  const { html } = renderMarkdown('```js\nconst x = 1;\n```\n\n| A | B |\n|---|---|\n|1|2|\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))');
  assert.match(html,/hljs-keyword/); assert.match(html,/<table>/); assert.doesNotMatch(html,/<script>|href="javascript:/);
});
