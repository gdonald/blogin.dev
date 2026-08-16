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

An unknown key is a warning naming the closest real key, so a typo is reported
rather than silently ignored. A key with the wrong type stops the build.

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | string | empty | Site title, available to layouts and feeds. |
| `base-url` | string | empty | Absolute base, with no trailing slash, for feeds, the sitemap, and canonical links. |
| `author` | string | empty | Site author, available to layouts and feeds. |
| `output-dir` | string | `public` | Where the build writes, relative to the site root. |
| `home-section` | string | empty | Section whose listing is also the site root. |
| `css-framework` | string | `none` | Class-map profile: `none`, `bootstrap5`, `pico`, or `bulma`. |
| `theme` | string | empty | Name of a directory under `themes/` to fall back to for layouts, assets, and static files. |
| `page-size` | integer | `10` | Posts per listing page. |
| `summary-length` | integer | `200` | Character cap on a summary derived from the body. |
| `reading-wpm` | integer | `200` | Words per minute behind the reading-time estimate. |
| `related-count` | integer | `5` | Maximum related posts listed on a post's page. |
| `search-text-length` | integer | `2000` | Characters of body text indexed per post. |
| `search-cap` | integer | `10` | Maximum search results the browser shows. |
| `clean-urls` | boolean | `false` | Extensionless URLs when true. True needs web-server configuration, see [Deploying](/guide/deploying/). |
| `debug` | boolean | `false` | Emit provenance comments around rendered partials and pages. |
| `search` | boolean | `true` | Emit the search index and its script. |
| `highlight` | boolean | `false` | Server-side syntax highlighting for fenced code. |
| `robots` | boolean | `true` | Emit `robots.txt`. |
| `minify` | boolean | `false` | Minify CSS and JavaScript under `assets/`. Files under `static/` are left verbatim. |
| `fingerprint` | boolean | `false` | Name each `assets/` file for a hash of its content and rewrite every reference. Files under `static/` keep their names. |
| `image-widths` | list of integers | empty | Widths to write each raster image at, with a `srcset` wherever a page references it. |
| `taxonomies` | list of strings | `["tags"]` | Front-matter keys to group posts by. |
| `feed-formats` | list of strings | `["atom"]` | Any of `atom`, `rss`, `json`. |
| `languages` | list of strings | empty | Language codes, each built into its own `/<code>/` subtree. |
| `language-config` | map | empty | Per-language overrides such as `title`, keyed by code. |
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
| `label` | Nav label and listing heading. Defaults to the humanized name. |
| `order` | Sort position in the nav, ahead of alphabetical. |
| `page-size` | Posts per listing page for this section. |
| `nav` | Include the section in the nav when true. |
| `layout` | Layout name override for the section. |
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
