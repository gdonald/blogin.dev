---
title: Pagination
date: 2026-07-10
order: 8.5
toc: true
tags: [templates, configuration]
description: How listings split into pages, the URLs they get, and how to render your own.
---
Any listing that holds more posts than `page-size` splits into numbered pages. A
section listing, the home page, and every taxonomy term page paginate the same
way, with the same URLs and the same helpers.

## Page size

`page-size` in `blogin.json` sets it for the whole site, and defaults to 10:

```json
"page-size": 10
```

A section overrides it for its own listing:

```json
"sections": {
  "notes": { "page-size": 30 }
}
```

A value below 1 is raised to 1, so a typo cannot produce a listing with no posts
on it.

Taxonomy term pages use the site's `page-size`. There is no per-taxonomy
override, so a tag with 200 posts paginates at the same size a section does.

## The URLs

The first page keeps the listing's own path. Later pages sit under `page/`:

| Page | `clean-urls: false` | `clean-urls: true` |
| --- | --- | --- |
| Section, page 1 | `/notes/` | `/notes` |
| Section, page 2 | `/notes/page/2/` | `/notes/page/2` |
| Home, page 1 | `/` | `/` |
| Home, page 2 | `/page/2/` | `/page/2` |
| Tag, page 2 | `/tags/cpp/page/2/` | `/tags/cpp/page/2` |

Page 1 never gets a `page/1` URL, so the canonical address of a listing does not
change when it grows past one page.

## Rendering the bar

`pagination-html` is the ready-made one. It returns an empty string on a
single-page listing, so it can sit in a layout unconditionally:

```haml
%section
  %h1= heading
  - for posts -> $entry
    %article
      %a{href: "#{$entry<url>}"}= $entry<title>
  != pagination-html
```

It renders first, previous, a window of numbers, next, and last:

```html
<nav class="blogin-pagination" aria-label="Pagination">
  <ul>
    <li><a aria-label="First" href="/notes/">&laquo;</a></li>
    <li><a rel="prev" aria-label="Previous" href="/notes/">&lsaquo;</a></li>
    <li><a href="/notes/">1</a></li>
    <li><span aria-current="page">2</span></li>
    <li><a href="/notes/page/3/">3</a></li>
    <li><a href="/notes/page/4/">4</a></li>
    <li><a rel="next" aria-label="Next" href="/notes/page/3/">&rsaquo;</a></li>
    <li><a aria-label="Last" href="/notes/page/4/">&raquo;</a></li>
  </ul>
</nav>
```

The current page is a `<span>` rather than a link, marked `aria-current="page"`.
The previous and next links carry `rel="prev"` and `rel="next"`. The first and
last links appear only when there is a previous or next page to go to, so page 1
of a listing shows no leading arrows.

The number window is the current page and up to three either side, clamped to
what exists, so the bar never grows past seven numbers however many pages the
listing has.

Its classes come from the active CSS framework, so the same call renders
Bootstrap's `.pagination`/`.page-item`/`.page-link` and Bulma's
`.pagination`/`.pagination-list`/`.pagination-link` with no layout change. See
[CSS Frameworks](/guide/css-frameworks/). The outer `<nav>` always carries
`blogin-pagination`, which is what to target when styling it yourself.

## Rendering your own

`pagination-links` gives the same pages as data, one entry per page, for a
layout that wants different markup:

```
{ number, url, current }
```

It is empty on a single-page listing, which is what makes it safe to gate on:

```haml
- if pagination-links
  %nav.pages
    - for pagination-links -> $page
      - if $page<current>
        %span.current= $page<number>
      - else
        %a{href: "#{$page<url>}"}= $page<number>
```

Unlike `pagination-html`, this is every page rather than a window, so a listing
with 40 pages yields 40 entries. Add your own windowing if that matters.

Two more values are on the listing context for a bar built by hand:

| Method | Returns |
| --- | --- |
| `page-number` | The page being rendered, starting at 1. |
| `total-pages` | How many pages the listing has. |

Which gives the plainest possible bar:

```haml
- if total-pages > 1
  %p.pages
    = "Page #{page-number} of #{total-pages}"
```

## Turning it off

There is no key that disables pagination. Set `page-size` high enough to hold
the section:

```json
"sections": {
  "docs": { "page-size": 1000 }
}
```

`pagination-html` and `pagination-links` are both empty on a single-page
listing, so a layout needs no change when a section stops paginating.

## What does not paginate

A post's own page, and the taxonomy index at `/tags`, which lists every term on
one page however many there are.

Feeds do not paginate either, and they are not cut to `page-size`. A feed
carries every published post in its scope, so a reader subscribing to
`/notes/feed.xml` gets the whole section rather than its first page.
