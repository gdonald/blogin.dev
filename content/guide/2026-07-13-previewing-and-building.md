---
title: Previewing and Building
date: 2026-07-13
order: 10
toc: true
tags: [cli, builds]
description: The preview server, incremental builds, and debug output.
---
## The preview server

```bash
blogin serve --port 3000
```

It binds loopback only, so nothing outside the machine reaches it.

`serve` builds the site into `.blogin-preview/`, serves that locally, and watches
the source tree. It never writes `public/`, so serving a site cannot leave the
directory you deploy holding preview output. A preview is unminified and
unfingerprinted, and it keeps its own build state, so the two builds never read
each other's.
Any change to content, layouts, or static assets triggers a full rebuild in
place, and config edits are picked up too. Every directory under the watched
trees is watched, however deeply nested, and a directory you add while the server
runs is picked up without a restart. A save that fires several filesystem
events is coalesced into one rebuild. Extensionless URLs resolve to their `.html`
files, matching how a production host rewrites, so local preview behaves like the
deployed site. The server is for previewing only, and what you deploy is
static files.

`minify` and `fingerprint` are off while serving, whatever `blogin.json` says,
and the server prints a line saying so when the config asks for them.
Fingerprinting renames every asset on each build, which would leave an already
open page pointing at files the rebuild just deleted, and it costs that renaming
work on every save. `blogin build` still applies both, so what you deploy is
unaffected.

## Live reload

Each served HTML page carries a small client that holds a WebSocket to the
server. When a rebuild finishes, the server pushes the list of output files the
rebuild rewrote, and the page acts on it:

- The page reloads when its own HTML file changed, or when a script it loads
  changed.
- A changed stylesheet is swapped in place, so styling updates without a reload
  and without losing scroll position or form state.
- A changed image is re-fetched in place.
- A rebuild that rewrote nothing sends nothing, and no page reloads.

The client reconnects on its own when the socket drops, so a restarted server
picks the page back up. On reconnecting it compares the build the page is showing
against the one the server is serving, and reloads when they differ, which covers
edits made while the server was down. Preview responses are sent with
`Cache-Control: no-store` so a reloaded page never comes back from the browser
cache.

The injection happens only while serving. Built `public/` files never contain it,
and the preview is written elsewhere in any case.

## Incremental builds

A rebuild only does the work the change requires. When nothing changed, nothing
is parsed, rendered, or written. When one post changed, that post is rendered
along with the pages that reference it, and everything else is left alone.
Output for a deleted post is pruned. Pass `--force` to ignore what the last
build recorded and rebuild everything.

The result is byte-identical to a build from scratch, checked against randomised
sequences of edits rather than a handful of examples.

Pass `--counters` to see the work a build did: posts parsed, templates compiled,
pages rendered, files read and written, and directory walks. Those numbers are
deterministic across machines, which is what makes them useful for telling
whether a change did more work than it needed to.

A `.keep` file is yours, not build output, so pruning leaves it alone and the
directory holding it survives. Keep one at `public/.keep` to track the output
directory in git, or in any directory under `public/` the build writes nothing
into. `blogin clean` leaves `.keep` files and their directories in place too.

## Asset optimization

Three `blogin.json` keys tune the emitted assets, and all three act only on the
assets pipeline under `public/assets/`. Files copied verbatim from `static/` to
the site root are never touched, so a `favicon.ico` or `CNAME` keeps its exact
name.

`minify` shrinks every CSS and JavaScript file under `assets/`: it strips
comments, collapses whitespace, and drops blank and comment-only script lines
while keeping line breaks so JavaScript semicolon insertion stays safe.

`fingerprint` renames each CSS, JavaScript, and image file under `assets/` to
include a short hash of its content, such as `style.1a2b3c4d.css`, and rewrites
every reference to it in the built HTML and CSS. A changed asset gets a new name,
so a far-future cache never serves a stale file. Hashing the bytes rather than
the file's size and timestamp means the same input produces the same names on
any machine, so two builds of the same source agree. Both keys default off.

`image-widths` turns on responsive images. Given a list like `[320, 640, 960]`,
the build resizes each raster image to every width smaller than the original,
writing variants like `photo-320.png` beside it, and adds a `srcset` to each
reference so the browser picks the right size. It needs an image resizer on the
build host: ImageMagick or, on macOS, `sips`. With no widths set, images are
copied unchanged.

## Debug output

`blogin build --debug` injects HTML comments marking each template and partial
boundary and a provenance comment before each post body naming its source file,
so a page says which layout produced what. It is a separate axis from
`--verbose`, which only affects log output. Comment text is sanitized so a stray
`-->` cannot break out.

Turn it on for a site permanently with `"debug": true` in `blogin.json`, and
turn that off for one build with `--no-debug`.
