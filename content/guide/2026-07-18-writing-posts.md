---
title: Writing Posts
date: 2026-07-18
order: 3
tags: [authoring]
description: Front matter, sections, and tags.
---
A post is a Markdown file with a `---` front matter block:

```
---
title: My Post
date: 2026-07-20
tags: [raku, web]
description: A short summary.
---
The body goes here.
```

Run `blogin new "My Post"` to scaffold one with the front matter filled in.

## Sections

The subdirectory a file sits in under `content/` is its section, and the section
is both the URL prefix and the layout selector. A file at `content/posts/hello.md`
becomes `/posts/hello` and renders through `layouts/posts/show.haml` when present,
otherwise `layouts/show.haml`. Nested directories become nested sections and
nested nav entries.

## Summaries

A listing and a feed entry show a short summary of each post rather than the
whole body. Blogin picks the summary in this order:

1. A `summary` in front matter, used verbatim.
2. The text before a `<!--more-->` marker in the body.
3. The first block of the body, capped at `summary-length` characters (200 by
   default, set in `blogin.json`).

```
---
title: A Longer Post
summary: One sentence that stands in for the post on listing pages.
---
```

Or mark the cut point in the body:

```
The opening paragraph that reads as the teaser.

<!--more-->

The rest of the post, shown only on the post's own page.
```

The marker never appears in the rendered page. A layout reaches the summary in a
listing through `$entry<summary>`.

## Ordering

A section listing shows its posts newest first by date. Set an `order` in front
matter to place a post explicitly instead:

```
---
title: Getting Started
order: 2
---
```

Posts with an `order` sort ascending and come before any post without one. Posts
without an `order` keep the newest-first date order behind them. This suits a
guide or a documentation section where reading order matters more than date.

## Tags

Tags are collected across every section. Each tag gets a page at `/tags/<tag>`
listing its posts, and a tag index at `/tags` lists every tag with counts.
