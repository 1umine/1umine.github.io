# 页面模板

这里集中存放可修改的 HTML。页面文案、标签结构和 CSS class 都可以在对应文件中直接编辑。保存后运行 `npm run build`，或者在 `npm run dev` 运行时刷新浏览器。

## 页面在哪里

| 文件 | 内容 |
| --- | --- |
| `layout.html` | 所有页面共用的文档结构、head、顶部导航、页脚 |
| `home.html` | 首页介绍、装饰图案、分类栏、文章列表容器 |
| `article.html` | 文章标题、正文、目录、上下篇导航 |
| `archive.html` | 归档页标题和按年份排列的文章 |
| `about.html` | 关于页的介绍文案 |
| `404.html` | 页面不存在时的提示 |

## 公共组件在哪里

| `partials/` 下的文件 | 内容 |
| --- | --- |
| `sidebar.html` | 首页搜索框、自我介绍、标签漫游和引言 |
| `post-card.html` | 首页的一张文章卡片 |
| `category-filter.html` | 一个分类筛选按钮 |
| `tag.html`、`tag-count.html` | 标签链接和文章数量 |
| `toc-link.html` | 文章目录的一条章节链接 |
| `post-navigation.html` | 上一篇或下一篇链接 |
| `archive-year.html`、`archive-row.html` | 一个归档年份及其文章条目 |
| `math-styles.html` | 含公式页面使用的本地 KaTeX 样式链接 |
| `empty-tags.html`、`empty-toc.html` | 没有标签或章节时的提示 |
| `empty-navigation.html` | 没有上一篇时的布局占位 |

## 占位符怎么写

普通数据使用双花括号，自动转义 HTML，适用于文字和带引号的属性：

```html
<h1>{{ title }}</h1>
<a href="{{ homeUrl }}">首页</a>
```

已渲染的 HTML 使用三花括号，比如正文、卡片列表、公共组件：

```html
<div class="prose">{{{ content }}}</div>
```

请勿把普通文章标题、摘要或用户输入改成三花括号，以保留 HTML 转义。模板仅支持命名占位符，不执行 JavaScript，也不支持模板内循环或条件表达式。

循环、条件和变量数据在 `scripts/pages.mjs` 中准备；占位符替换在 `scripts/template.mjs` 中实现，无额外模板依赖。新增变量时，必须在对应的 `render("模板名", { ... })` 调用中提供同名数据，遗漏变量时构建会明确报出模板文件名和变量名。

公共数据通常包括 `author`、`description`、`homeUrl`、`aboutUrl`。每个页面的完整变量列表以 `scripts/pages.mjs` 中对应方法为准。

## 常见修改

- 修改首页大标题：编辑 `home.html` 中的 `<h1>`。
- 修改个人介绍：编辑 `about.html` 和 `partials/sidebar.html`。
- 修改导航或页脚：编辑 `layout.html`。
- 修改文章卡片：编辑 `partials/post-card.html`。
- 修改配色和间距：编辑 `public/style.css`。

`public/app.js` 使用部分 class 和 id 查找元素，例如 `.post-card`、`.filter`、`#search` 和 `.toc`。只改文案不受影响；重命名这些标记时需要同步更新脚本与样式。
