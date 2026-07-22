---
title: Previewing and Building
date: 2026-07-13
order: 10
toc: true
tags: [cli, builds]
description: The dev server, incremental builds, and debug output.
---
## The preview server

```bash
blogin serve --port 3000
```

`serve` builds the site, serves `public/` locally, and watches the source tree.
Any change to content, layouts, or static assets triggers a full rebuild in
place, and config edits are picked up too. Extensionless URLs resolve to their
`.html` files, matching how a production host rewrites, so local preview behaves
like the deployed site. The server is a dev tool only; production ships static
files.

The preview server also reloads the open page for you. It injects a small client
into each served HTML page that polls a build-version endpoint, and a successful
rebuild bumps that version so the browser refreshes on its own. Polling keeps no
long-lived connection open, so closing a tab leaves nothing for the server to
write to. The injection happens only while serving. Built `public/` files never
contain it.

## Incremental builds

`blogin build` renders every page but writes a file only when its content
changed, so rebuilding an unchanged site writes nothing and editing one post
rewrites just that post and the pages that reference it. Output for a deleted post
is pruned. Pass `--force` to rewrite everything.

## Asset optimization

Two `blogin.json` keys tune the emitted assets. `minify` shrinks every emitted
and copied CSS and JavaScript file: it strips comments, collapses whitespace, and
drops blank and comment-only script lines while keeping line breaks so JavaScript
semicolon insertion stays safe.

`fingerprint` renames each CSS, JavaScript, and image file to include a
content hash, such as `style.1a2b3c4d.css`, and rewrites every reference to it in
the built HTML and CSS. A changed asset gets a new name, so a far-future cache
never serves a stale file. Both default off.

`image-widths` turns on responsive images. Given a list like `[320, 640, 960]`,
the build resizes each raster image to every width smaller than the original,
writing variants like `photo-320.png` beside it, and adds a `srcset` to each
reference so the browser picks the right size. It needs an image resizer on the
build host: ImageMagick or, on macOS, `sips`. With no widths set, images are
copied unchanged.

## Debug output

`blogin build --debug` injects HTML comments marking each template and partial
boundary and a provenance comment before each post body naming its source file.
It is a separate axis from `--verbose`/`--quiet`, which only affect log output.
Comment text is sanitized so a stray `-->` cannot break out.
