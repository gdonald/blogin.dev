---
title: Configuration
date: 2026-07-12
order: 11
toc: true
tags: [configuration]
description: The keys in blogin.json.
---
Site-wide settings live in `blogin.json` beside the content directory. Every key
is optional. Command-line options override the file.

An unknown key is a warning, with a "did you mean" suggestion when a real key is
within three edits of it, so a typo is reported rather than silently ignored. A key with the wrong type stops the build.

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | string | empty | Site title, available to layouts and feeds. |
| `base-url` | string | empty | Absolute base, with no trailing slash, for feeds, the sitemap, and canonical links. |
| `author` | string | empty | Site author, available to layouts and feeds. |
| `twitter` | string | empty | The site's X handle, with the `@`, written as `twitter:site` and `twitter:creator`. |
| `image` | string | empty | Share image for any page whose front matter sets no `image`. See [Metadata and SEO](/guide/metadata-and-seo/#share-images). |
| `output-dir` | string | `public` | Where the build writes, relative to the site root. |
| `home-section` | string | empty | Section whose listing is also the site root. |
| `css-framework` | string | `none` | Class-map profile: `none`, `bootstrap5`, `pico`, or `bulma`. |
| `theme` | string | empty | Name of a directory under `themes/` to fall back to for layouts, assets, and static files. |
| `page-size` | integer | `10` | Posts per listing page. |
| `summary-length` | integer | `200` | Character cap on a summary derived from the body. |
| `reading-wpm` | integer | `200` | Words per minute behind the reading-time estimate. |
| `related-count` | integer | `5` | Maximum related posts listed on a post's page. |
| `search-text-length` | integer | `2000` | Characters of each post's summary written into the search index. |
| `search-cap` | integer | `10` | Maximum search results the browser shows. |
| `clean-urls` | boolean | `false` | Extensionless URLs when true. True needs web-server configuration, see [Deploying](/guide/deploying/). |
| `debug` | boolean | `false` | Emit provenance comments around rendered partials and pages. |
| `search` | boolean | `true` | Emit the search index and its script. |
| `highlight` | boolean | `false` | Server-side syntax highlighting for fenced code. |
| `robots` | boolean | `true` | Emit `robots.txt`. |
| `minify` | boolean | `false` | Minify CSS and JavaScript under `assets/`. Files under `static/` are left verbatim. |
| `fingerprint` | boolean | `false` | Name each `assets/` file for a hash of its content and rewrite every reference. Files under `static/` keep their names. |
| `image-widths` | list of integers | empty | Widths to write each raster image under `assets/` at, for each width smaller than the original, with a `srcset` wherever a page references it. Files under `static/` are copied as they are. |
| `taxonomies` | list of strings | `["tags"]` | Front-matter keys to group posts by. |
| `feed-formats` | list of strings | `["atom"]` | Any of `atom`, `rss`, `json`. |
| `languages` | list of strings | empty | Language codes, each built into its own `/<code>/` subtree. |
| `language-config` | map | empty | A per-language site `title`, keyed by code. `title` is the only key read. |
| `sections` | map | empty | Per-section overrides, keyed by section name. See below. |

The fingerprint hash is taken over the file's bytes, not its size and timestamp,
so the same input produces the same names on every machine and a rebuild that
changes nothing changes no name.

## Per-section overrides

The `sections` map overrides settings for one section, including its nav label,
nav order, visibility, page size, and whether dates show:

```json
"sections": {
  "guide": { "label": "Guide", "order": 1, "page-size": 20 }
}
```

| Section key | Meaning |
| --- | --- |
| `label` | Nav label and listing heading. Defaults to the humanized name. A section with `nav: false` uses the humanized name as its heading. |
| `order` | Integer sort key for the nav, ascending. A section without one counts as 0, and ties sort by name, so a negative `order` moves a section to the front. |
| `page-size` | Posts per listing page for this section. |
| `nav` | Set to `false` to leave the section out of the nav. Included by default. |
| `layout` | The layout the section's posts render through, in place of `show.haml`. A post's own front-matter `layout` comes first, and `show.haml` is used when the named file does not exist. |
| `index-dates` | Show post dates on the section's listing pages (default true). |
| `show-dates` | Show the post date on the section's post pages (default true). |

Set `index-dates` or `show-dates` to `false` to hide dates on reference-style
sections while a blog keeps them.

## A working example

```json
{
  "title": "My Site",
  "base-url": "https://example.com",
  "clean-urls": true,
  "highlight": true,
  "minify": true,
  "fingerprint": true,
  "feed-formats": ["atom", "json"],
  "sections": {
    "notes": { "label": "Notes", "order": 1, "page-size": 20 }
  }
}
```
