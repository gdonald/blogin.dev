---
title: Getting Started
date: 2026-07-19
order: 2
toc: true
tags: [intro]
description: Install Blogin and build your first site.
---
## Install

```bash
zef install Blogin
```

## Create a site

```bash
blogin init myblog
```

This scaffolds a buildable starter site: a `blogin.json`, a first post under
`content/posts/`, the layouts, and an `assets/` tree.

## Directories

| Source | Purpose |
| --- | --- |
| `content/` | Markdown posts, grouped into sections by subdirectory. |
| `layouts/` | HAML templates and partials. |
| `assets/css`, `assets/js`, `assets/img` | Stylesheets, scripts, and images, copied to `public/assets/` keeping their subfolders. |
| `static/` | Files copied to the site root as-is, for `favicon.ico`, `CNAME`, and the like. |
| `data/` | Optional JSON and YAML exposed to layouts. |
| `shortcodes/` | Optional shortcode templates. |

Blogin's own generated stylesheet and search assets are written under
`public/assets/` too, so everything an app serves lives in one place.

## Build

```bash
cd myblog
blogin build
```

The generated HTML lands in `public/`, ready to deploy to any static host.

## Preview

```bash
blogin serve
```

This builds the site, serves it locally, and rebuilds as you edit.
