---
title: Configuration
date: 2026-07-12
order: 11
tags: [reference]
description: The keys in blogin.json.
---
Site-wide settings live in `blogin.json` at the project root. Command-line
options override the file.

| Key | Meaning |
| --- | --- |
| `title` | Site title, available to layouts. |
| `base-url` | Absolute base for feeds and the sitemap. |
| `author` | Site author, available to layouts and feeds. |
| `output-dir` | Where the build writes (default `public`). |
| `home-section` | Section whose listing is also the site root. |
| `clean-urls` | Extensionless URLs when true. |
| `css-framework` | Class-map profile: `none`, `bootstrap5`, ... |
| `page-size` | Posts per listing page. |
| `summary-length` | Character cap on an auto-generated post summary (default 200). |
| `robots` | Emit `robots.txt` (default true). |
| `taxonomies` | Front-matter keys to group posts by (default `["tags"]`). |
| `feed-formats` | Feed formats to emit: `atom`, `rss`, `json` (default `["atom"]`). |
| `highlight` | Server-side syntax highlighting for fenced code. |
| `search` | Emit the search index and script. |
| `search-text-length` | Characters of body text indexed per post (default 2000). |
| `search-cap` | Maximum search results shown (default 10). |
| `debug` | Emit provenance comments around rendered partials and pages. |

## Per-section overrides

The `sections` map overrides settings for one section, including its nav label,
nav order, visibility, page size, and whether dates show:

```
"sections": {
  "guide": { "label": "Guide", "order": 1, "page-size": 20 }
}
```

| Section key | Meaning |
| --- | --- |
| `label` | Nav label and listing heading (defaults to the humanized name). |
| `order` | Sort position in the nav. |
| `page-size` | Posts per listing page for this section. |
| `nav` | Include the section in the nav when true. |
| `layout` | Layout name override for the section. |
| `index-dates` | Show post dates on the section's listing pages (default true). |
| `show-dates` | Show the post date on the section's post pages (default true). |

Set `index-dates` or `show-dates` to `false` to hide dates on reference-style
sections while a blog keeps them.
