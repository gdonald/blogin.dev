---
title: Metadata and SEO
date: 2026-07-21
order: 9
toc: true
tags: [seo, configuration]
description: Open Graph and Twitter tags, structured data, share images, noindex, and robots.txt.
---
Blogin emits per-page metadata for search engines and social cards, and a
site-wide `robots.txt`, without any template work beyond a single call in the
page head.

## head-meta

A layout's `base.haml` head calls `head-meta`, which the scaffold includes:

```haml
%head
  %title= site-title
  != head-meta
```

For a post page it emits a canonical link and the article metadata:

```html
<link rel="canonical" href="https://example.com/posts/hello/"/>
<meta name="description" content="A short description."/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="Hello"/>
<meta property="og:description" content="A short description."/>
<meta property="og:url" content="https://example.com/posts/hello/"/>
<meta property="og:site_name" content="My Site"/>
<meta property="article:published_time" content="2026-07-20"/>
<meta property="article:modified_time" content="2026-08-02"/>
<meta property="article:tag" content="cpp"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:site" content="@example"/>
<meta name="twitter:creator" content="@example"/>
<meta name="twitter:title" content="Hello"/>
<meta name="twitter:description" content="A short description."/>
<link rel="alternate" type="application/atom+xml" title="My Site" href="https://example.com/feed.xml"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"Hello","url":"https://example.com/posts/hello/","description":"A short description.","datePublished":"2026-07-20","dateModified":"2026-08-02","author":{"@type":"Person","name":"Pat Lee"}}</script>
```

The description is the post's front-matter `description`, falling back to the
derived summary. The canonical and `og:url` links are absolute, built from
`base-url` in `blogin.json`, so set `base-url` for them to be complete. A listing
page emits the same tags with `og:type` of `website`, without the description
tags, the `article:` tags, or a `BlogPosting`. Its title is the section label:
the site title on the root listing, the term on a term page, and the humanized
taxonomy name on a taxonomy index.

The `article:` tags appear on post pages only. `article:published_time` is the
post's `date`, `article:modified_time` is its `updated` date, and there is one
`article:tag` per tag. Each is left out when the post does not set it.

`twitter:site` and `twitter:creator` come from `twitter` in `blogin.json`,
written as given, so include the `@`. Without it both are left out.

There is one `<link rel="alternate">` per format in `feed-formats`, so browsers
and feed readers can find the site-wide feeds from any page. A site with no
posts writes no feeds and so links none.

## Structured data

`head-meta` writes JSON-LD that search engines read for rich results. A post
page gets a `BlogPosting` with the headline, URL, description, dates, share
image, and `author` from `blogin.json`, leaving out any of these the page does
not have. The site's front page gets a `WebSite`. A root `index.md` is a post
page, so it gets both:

```html
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"My Site","url":"https://example.com/"}</script>
```

A `<` in a title or description is written as `\u003c`, so no text can end the
script element.

## noindex

These pages carry `<meta name="robots" content="noindex"/>` and are left out of
the sitemap:

- The 404 page.
- Every listing page after the first.
- A post with `noindex: true` in its front matter.

## Share images

A link preview on LinkedIn, Facebook, Slack, or X shows an image when the page
names one. Set `image` in a post's front matter:

```
---
title: Hello
image: /assets/images/hello.png
---
```

Set `image` in `blogin.json` for the image every other page uses, listings
included:

```json
{
  "base-url": "https://example.com",
  "image": "/assets/images/share.png"
}
```

With an image, `head-meta` adds these tags and switches the Twitter card to the
large one:

```html
<meta property="og:image" content="https://example.com/assets/images/hello.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="627"/>
<meta name="twitter:card" content="summary_large_image"/>
```

The path is a URL on the site, so `/assets/images/hello.png` is the file at
`assets/images/hello.png` and `/hello.png` is the file at `static/hello.png`. A
theme's `assets/` and `static/` are searched after the site's own. `og:image` is
made absolute from `base-url`, and with `"fingerprint": true` an image under
`assets/` is named by its hashed file. An image in `static/` keeps its name. A full `https://` URL is written as given.

The width and height are read from the file's header, for PNG, JPEG, GIF, and
WebP. For any other format, or for an image on another host, the two tags are
left out. The build warns when a named image is missing or its size cannot be
read. When the image's size changes, the next build rewrites every page that
uses it.

Make share images 1200 by 627 pixels. LinkedIn shows that size as a large card
and a smaller image as a thumbnail. After deploying, the
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) shows the
tags LinkedIn read and refreshes its cached preview.

## robots.txt

A build with at least one post writes `robots.txt` at the output root, unless
`static/robots.txt` supplies your own:

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

The `Sitemap` line appears when `base-url` is set. Turn the file off with
`"robots": false` in `blogin.json`.
