---
title: Markdown 写作
date: 2026-10-18
category: 技术探索
tags: [demo]
description: 让写作回到文字本身。从一份 Markdown 文件开始，理解这个轻量博客的内容组织与发布方式。
---
## 从一份文件开始

在 `posts` 文件夹中新建一个 `.md` 文件，就能开始写作。文件可以放在子目录中，让你的内容组织更自然。

```yaml
---
title: 我的第一篇文章
date: 2026-10-21
category: 技术探索
tags: [Markdown, 开发]
description: 用一句话介绍这篇文章。
---
```

## 用标题组织思路

使用二级标题划分主要章节，用三级标题补充细节。页面会自动生成文章目录，每个标题都有独立的锚点。

### 常见 Markdown 写法

你可以使用 **粗体**、*斜体*、`行内代码`，也可以插入链接、图片、列表和表格。

| 写法 | 用途 |
| --- | --- |
| `## 章节标题` | 创建章节和目录锚点 |
| `**重点**` | 强调重要内容 |
| `> 一段引用` | 摘录值得记住的话 |

### 让代码更易读

代码块标记语言后，会获得对应的语法高亮。右上角的按钮可以复制整段代码。

```javascript
const thoughts = ['学习', '实践', '记录'];

function keepGrowing(notes) {
  return notes.map(note => `${note}，然后再向前一步。`);
}

console.log(keepGrowing(thoughts));
```

## 预览与发布

```bash
npm install
npm run dev
```

预览地址是 `http://localhost:4321`。修改文章后刷新页面，即可看到变化。

执行 `npm run build` 后，所有页面都会输出到 `dist` 文件夹，可以部署到任意静态托管服务。

## 让分类保持简单

分类适合回答「这篇文章属于哪个主题」，标签则适合描述更具体的关联。一篇文章属于一个分类，可以拥有多个标签。
