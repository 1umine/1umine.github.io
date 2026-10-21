// Prepare template data here. Page markup lives in templates/.
export function createPages({ render, config, url, posts, categories, tags }) {
  const common = {
    author: config.author,
    description: config.description,
    homeUrl: url(""),
    aboutUrl: url("about.html"),
  }
  const categoryUrl = category => `${url("")}?category=${encodeURIComponent(category)}`
  const tagLink = (tag, count) => render("partials/tag", {
    href: `${url("")}?tag=${encodeURIComponent(tag)}`,
    label: count === undefined ? `# ${tag}` : tag,
    count: count === undefined ? "" : render("partials/tag-count", { count }),
  })
  const postTags = post => post.tags.map(tag => tagLink(tag)).join("")
  const navigation = (post, label) => render("partials/post-navigation", { ...post, label })

  function layout(title, body, description = config.description, current = "home") {
    return render("layout", {
      ...common,
      title, body, description,
      siteTitle: config.title,
      year: new Date().getFullYear(),
      faviconUrl: url("favicon.svg"),
      styleUrl: url("style.css"),
      scriptUrl: url("app.js"),
      archiveUrl: url("archive.html"),
      homeCurrent: current === "home" ? 'aria-current="page"' : "",
      archiveCurrent: current === "archive" ? 'aria-current="page"' : "",
      aboutCurrent: current === "about" ? 'aria-current="page"' : "",
      mathStyles: body.includes('class="katex')
        ? render("partials/math-styles", { href: url("assets/katex/katex.min.css") }) : "",
    })
  }

  return {
    home() {
      return layout("文章", render("home", {
        ...common,
        count: posts.length,
        paddedCount: String(posts.length).padStart(2, "0"),
        emptyHidden: posts.length ? "hidden" : "",
        categories: categories.map(category => render("partials/category-filter", {
          category, count: posts.filter(post => post.category === category).length,
        })).join(""),
        cards: posts.map((post, index) => render("partials/post-card", {
          ...post,
          categoryUrl: categoryUrl(post.category),
          tagsJson: JSON.stringify(post.tags),
          search: [post.title, post.description, post.category, ...post.tags].join(" ").toLowerCase(),
          displayDate: post.date.replaceAll("-", "."),
          tags: postTags(post),
          number: String(index + 1).padStart(2, "0"),
        })).join(""),
        sidebar: render("partials/sidebar", {
          ...common,
          authorUpper: config.author.toUpperCase(),
          tags: tags.map(tag => tagLink(tag, posts.filter(post => post.tags.includes(tag)).length)).join("")
            || render("partials/empty-tags"),
        }),
      }))
    },
    article(post, index) {
      const previous = posts[index + 1], next = posts[index - 1]
      return layout(post.title, render("article", {
        ...common, ...post,
        categoryUrl: categoryUrl(post.category),
        tags: postTags(post),
        content: post.html,
        previous: previous ? navigation(previous, "← 上一篇") : render("partials/empty-navigation"),
        next: next ? navigation(next, "下一篇 →") : "",
        headings: post.headings.map(heading => render("partials/toc-link", {
          ...heading, anchor: encodeURIComponent(heading.id),
        })).join("") || render("partials/empty-toc"),
      }), post.description, "article")
    },
    archive() {
      const years = [...new Set(posts.map(post => post.date.slice(0, 4)))]
      return layout("归档", render("archive", {
        count: posts.length,
        years: years.map(year => render("partials/archive-year", {
          year,
          rows: posts.filter(post => post.date.startsWith(year)).map(post => render("partials/archive-row", {
            ...post, displayDate: post.date.slice(5).replace("-", " / "),
          })).join(""),
        })).join(""),
      }), config.description, "archive")
    },
    about() {
      return layout("关于", render("about", common), config.description, "about")
    },
    notFound() {
      return layout("页面未找到", render("404", common))
    },
  }
}
