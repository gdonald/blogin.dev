---
title: Writing Posts
date: 2026-07-18
order: 3
toc: true
tags: [markdown]
description: Front matter, sections, and tags.
---
A post is a Markdown file with a `---` front matter block:

```
---
title: My Post
date: 2026-07-20
tags: [cpp, web]
description: A short summary.
---
The body goes here.
```

Run `blogin new "My Post"` to scaffold one with the front matter filled in.

`updated` is the date the post last changed, in the same form as `date`. It
becomes `article:modified_time` and the post's `<lastmod>` in the sitemap.
`noindex: true` asks search engines to leave the post out of their index and
leaves it out of the sitemap.

`image` names the picture a link preview shows for the post, such as
`image: /assets/images/my-post.png`. See
[Metadata and SEO](/guide/metadata-and-seo/#share-images).

No key is required. A post with no `title` takes one from its filename, with any
leading date and the extension removed and each word capitalized, so
`2026-07-20-my-post.md` is titled `My Post`. The date falls back to a date at the
front of the filename, the slug follows the title, and the
layout follows the section. `draft`, `date`, `description`, `summary`, `slug`,
`layout`, `order`, `toc`, `tags`, `aliases`, `image`, `updated`, and `noindex`
are read. `draft: true` leaves a post out of the build unless you pass
`blogin build --drafts`. Any other key is read only when `taxonomies` in `blogin.json` names
it, and then it groups posts the way `tags` does.

## Slugs

A slug comes from the title, lowercased, keeping only ASCII letters and digits.
Any run of other characters, including whitespace, punctuation, and non-ASCII
letters such as `é`, becomes a single hyphen, with none at the start or end. A
title written only in non-ASCII characters needs an explicit `slug`. Three characters carry the whole meaning of a name
and are spelled out rather than dropped: `+` becomes `plus`, `#` becomes
`sharp`, and `&` becomes `and`. So a `c++` tag is `c-plus-plus` and a `c` tag is
`c`, two pages rather than one overwriting the other.

Set `slug` in front matter to choose the URL yourself.

## Markdown

The body is CommonMark, with GitHub Flavored Markdown for the extensions:
tables, task lists, strikethrough, and fenced code blocks with an info string.
Footnotes, reference links, attribute lists, math, and Mermaid diagrams are
covered below and in [Math and Diagrams](/guide/math-and-diagrams/).

```
| Column | Column |
| --- | --- |
| a | b |

- [x] done
- [ ] not done

~~struck through~~
```

## Definition lists

A paragraph followed by a line starting with `: ` becomes a term and its
definition:

```
Term
: what it means
```

which renders as:

```html
<dl>
<dt>Term</dt>
<dd>what it means</dd>
</dl>
```

One term takes as many definitions as you give it, and a list holds as many
terms as you like:

```
--src <dir>
: the content directory
: defaults to `content`

--out <dir>
: where the site is written
```

A definition holds inline markup, so `: with *emphasis*` works. The CLI pages on
this site are written this way.

## Links and images

A link or an image takes an optional attribute list in braces right after the
closing paren. Use `key=value` for an attribute, `.name` for a class, and
`#name` for an id:

```
[the docs](https://example.com){target=_blank rel=noopener .external}

![A cat](/images/cat.png){.rounded #hero}
```

Wrap an image in a link to make the image itself clickable. The attribute list
belongs to the link, so a linked thumbnail opens its full-size version in a new
tab:

```
[![A cat](/images/cat-thumb.png)](/images/cat.png){target=_blank}
```

That renders an `<img>` inside the `<a>`, and the image keeps any attribute
list of its own:

```
[![A cat](/images/cat-thumb.png){.thumb}](/images/cat.png){target=_blank}
```

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
titled `Hello` becomes `/posts/hello/`, written as `public/posts/hello/index.html`,
or `/posts/hello` with `"clean-urls": true`. The last part of the URL is the
post's slug, not its filename. The post renders through `layouts/posts/show.haml` when present,
otherwise `layouts/show.haml`. Nested directories become nested sections and
nested nav entries.

## Summaries

A listing and a feed entry show a short summary of each post rather than the
whole body. Blogin picks the summary in this order:

1. A `summary` in front matter, used verbatim.
2. The text before a `<!--more-->` marker in the body.
3. The first non-empty line of the body's text, a heading if the body opens with
   one, cut at a word boundary to `summary-length` characters (200 by default,
   set in `blogin.json`) with `…` appended when it was cut.

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

The marker is an HTML comment, so it stays in the page source but is never
shown. A layout reaches the summary in a
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
Feeds and the previous and next links use the same order.

## Future-dated posts

A post whose `date` is in the future is left out of a normal build, so you can
write ahead and publish by dating. Pass `blogin build --future` to include them
while previewing.

## Shortcodes

Shortcodes expand to HTML that Markdown cannot express on its own. Write one on
its own line in a post body, with `key="value"` or `key='value'` arguments:

```
{{< youtube id="dQw4w9WgXcQ" >}}

{{< figure src="/img/photo.png" alt="A photo" caption="On location" >}}
```

Two shortcodes are built in: `youtube` embeds the video in an `<iframe>` inside `<div class="video">`, which
your stylesheet sizes, and `figure`
wraps an image with an optional caption.

### Adding your own

Put an HTML template in a `shortcodes/` directory beside `content/`, named for the
shortcode. A `{{ key }}` placeholder is replaced with the matching argument, HTML
escaped:

```
shortcodes/note.html
```

```html
<aside class="note">{{ text }}</aside>
```

Then use it in a post:

```
{{< note text="Heads up" >}}
```

which renders `<aside class="note">Heads up</aside>`. A file named for a built-in,
such as `shortcodes/youtube.html`, overrides that built-in. An unrecognized
shortcode is left in the page as plain text so nothing silently vanishes.

## Redirects

When a post moves, list its old URLs in `aliases` so old links keep working:

```
---
title: My Post
aliases: [/old-path, /2020/01/my-post]
---
```

The build writes a small redirecting page at each alias that sends the browser to
the post's current URL, so redirects work on any static host.

A page the content tree publishes always keeps its own path, so an alias can
never replace one. If two posts claim the same alias, the first keeps it and the
build says so.

## Tags and taxonomies

Tags are collected across every section. Each tag gets a page at
`/tags/<tag-slug>/` listing its posts, and a tag index at `/tags/` lists every
tag with counts. With `"clean-urls": true` the trailing slashes are dropped.

Tags are one taxonomy. Declare more in `blogin.json` and group posts by any
front-matter key:

```json
"taxonomies": ["tags", "categories"]
```

```
---
title: My Post
tags: [cpp, web]
categories: [tutorials]
---
```

Each taxonomy `name` builds a page per term at `/name/<term-slug>/` and an index
at `/name/`, the term put through the same slug rules as a title. A term page paginates at the site's `page-size`, the same as any other
listing. A term page renders through `layouts/<singular>.haml` when present, then
`layouts/term.haml`, then `layouts/<name>.haml`, then `layouts/index.haml`, so
`tags` styles its term pages with `tag.haml` and `categories` with a
`categorie.haml` or a shared `term.haml`.

The index renders through `layouts/<name>.haml`, then `layouts/index.haml`. Since
term pages prefer the singular, a `tags.haml` styles the tag index alone while
`tag.haml` styles each term page, letting the index show a tag cloud and the term
pages show post listings. Both layouts get a `heading`: the term name on a term
page, the humanized taxonomy name on the index. A listing receives its terms as
`posts`, so the index iterates them the same way a section listing iterates its
posts.

## Showing a post's tags

Building the tag pages does not link to them from each post. The post layout
receives the post's tags as `{ name, url }` links, so `show.haml` renders them
itself:

```haml
- if has-tags
  %nav.tags
    - for tags -> $tag
      %a{href: "#{$tag<url>}"}= $tag<name>
```

`tags` holds the post's own terms in the `tags` taxonomy, each `url` pointing at
that tag's page, and `has-tags` is false when the post has none, so the block
drops out. The scaffold `show.haml` ships this markup, so a fresh site links a
post's tags without any editing. Nothing else surfaces tags automatically: the nav is
built from content sections, so link to `/tags` from a layout when you want the
tag index in it.
