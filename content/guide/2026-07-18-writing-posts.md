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

## Reference links and footnotes

Links can carry their target in a separate definition rather than inline. Write
`[text][label]` in the body and define the label anywhere in the file:

```
See [the home page][home] for more.

[home]: https://example.com "Optional title"
```

A collapsed form, `[text][]`, uses the text as the label. Labels match
case-insensitively, and an undefined reference is left as literal text.

Footnotes use `[^label]` where the note is cited, with a matching definition:

```
A claim that needs a source[^src].

[^src]: The cited source.
```

Footnotes are numbered in the order they are first referenced and collected into
a footnotes section at the end of the post, each with a link back to its
reference. Reference and footnote definition lines never render as content.

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

## Table of contents

Set `toc: true` in front matter to turn on the table of contents for a post. The
show layout renders it from the post's headings when the flag is set. See
[Layouts](/guide/layouts/) for the template side.

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

## Tags and taxonomies

Tags are collected across every section. Each tag gets a page at `/tags/<tag>`
listing its posts, and a tag index at `/tags` lists every tag with counts.

Tags are one taxonomy. Declare more in `blogin.json` and group posts by any
front-matter key:

```json
"taxonomies": ["tags", "categories"]
```

```
---
title: My Post
tags: [raku, web]
categories: [tutorials]
---
```

Each taxonomy `name` builds a page per term at `/name/<term>` and an index at
`/name`. A term page renders through `layouts/<name>.haml` when present, then
`layouts/<singular>.haml`, then `layouts/term.haml`, then `layouts/index.haml`,
so `categories` can style its term pages with a `categories.haml` while tags keep
using `tag.haml`.
