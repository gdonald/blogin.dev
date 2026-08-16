---
title: CSS Frameworks
date: 2026-07-16
order: 6
toc: true
tags: [styling]
description: Emit framework-specific classes without touching the core renderer.
---
Blogin adds framework-specific classes to the HTML it writes, taken from the
profile you name in the `css-framework` config key. The renderer itself knows no
framework. It asks the profile for a named slot and writes back whatever it
returns, so no framework is mentioned anywhere in the rendering code.

## Profiles

| Profile | What it does | Stylesheet | Script |
| --- | --- | --- | --- |
| `none` | Plain semantic HTML, no classes anywhere. The default. | none | none |
| `bootstrap5` | Classes each element Bootstrap needs classed, and ships a navbar and grid the scaffold uses. | Bootstrap 5.3 | `bootstrap.bundle.min.js` |
| `pico` | Styles bare semantic HTML, so the only class is the one bounding page width. | Pico 2 | none |
| `bulma` | Wraps the rendered body in `.content`, which is how Bulma styles prose, and classes tables, images, pagination, and tags. | Bulma 1 | none |

Any of the four can be scaffolded:

```bash
blogin init myblog --framework bulma
```

or set on a site you already have, by putting `"css-framework": "bulma"` in
`blogin.json`. An unknown name stops the build and lists the four that work.

## What each profile classes

The renderer and the pagination helper ask for a slot by name. This is every
slot and what each profile answers, and an empty cell means the framework styles
that element without a class:

| Slot | `none` | `bootstrap5` | `pico` | `bulma` |
| --- | --- | --- | --- | --- |
| `article` | | | | `content` |
| `table` | | `table` | | `table` |
| `blockquote` | | `blockquote` | | |
| `image` | | `img-fluid` | | `image` |
| `heading` | | | | |
| `list` | | | | |
| `definition-list` | | | | |
| `code-block` | | | | |
| `pagination-nav` | | | | `pagination` |
| `pagination-list` | | `pagination` | | `pagination-list` |
| `pagination-item` | | `page-item` | | |
| `pagination-link` | | `page-link` | | `pagination-link` |
| `pagination-active-item` | | `active` | | |
| `pagination-active-link` | | | | `is-current` |
| `nav` | | `nav` | | `navbar` |
| `container` | | `container` | `container` | `container` |
| `tag` | | `badge text-bg-secondary` | | `tag` |
| `post-nav-button` | | `btn btn-primary` | | `button` |

An empty cell is a decision rather than a gap. Bootstrap and Pico both style
bare headings, lists, and definition lists, and Bulma styles them through the
`.content` wrapper, so nothing classes them. Blogin's spec suite asserts every
cell of this table, so a profile cannot drift from what is written here.

## The content wrapper

Bulma is the one profile that needs a wrapper. It styles prose only inside
`.content`, so a bare `<h1>` or `<ul>` gets no Bulma styling at all. When a
profile names an `article` class, the renderer wraps the rendered post body in
it:

```html
<div class="content">
  <h1>Title</h1>
  <p>Some text.</p>
</div>
```

No other profile names one, so no other profile gets a wrapper and the markup is
unchanged.

## One layout, four sites

The point of the slots is that a layout does not branch on the framework. This
listing is the whole of what you write:

```haml
%section
  %h1= heading
  - for posts -> $entry
    %article
      %a{href: "#{$entry<url>}"}= $entry<title>
  != pagination-html
```

Switching `css-framework` changes what it produces without touching the file.
The pagination bar, on page 2 of a four-page listing:

**`none` and `pico`**

```html
<nav class="blogin-pagination" aria-label="Pagination">
  <ul>
    <li><a aria-label="First" href="/posts/">&laquo;</a></li>
    <li><a href="/posts/">1</a></li>
    <li><span aria-current="page">2</span></li>
  </ul>
</nav>
```

**`bootstrap5`**

```html
<nav class="blogin-pagination" aria-label="Pagination">
  <ul class="pagination">
    <li class="page-item"><a class="page-link" aria-label="First" href="/posts/">&laquo;</a></li>
    <li class="page-item"><a class="page-link" href="/posts/">1</a></li>
    <li class="page-item active"><span class="page-link" aria-current="page">2</span></li>
  </ul>
</nav>
```

**`bulma`**

```html
<nav class="blogin-pagination pagination" aria-label="Pagination">
  <ul class="pagination-list">
    <li><a class="pagination-link" aria-label="First" href="/posts/">&laquo;</a></li>
    <li><a class="pagination-link" href="/posts/">1</a></li>
    <li><span class="pagination-link is-current" aria-current="page">2</span></li>
  </ul>
</nav>
```

Trimmed to the first three items each. `blogin-pagination` is on the `<nav>`
under every profile, so a rule of your own targets all four at once. See
[Pagination](/guide/pagination/).

## What the scaffold writes per framework

`blogin init --framework <name>` records the choice in `blogin.json` and writes
layouts to match. Three of the four share the same layouts, because Pico styles
bare semantic HTML and Bulma styles the rendered body through the wrapper, so
neither needs markup the plain scaffold does not already have.

| Framework | Layouts | `assets/css/style.css` |
| --- | --- | --- |
| `none` | The plain set | A small stylesheet, since nothing else styles the page |
| `pico` | The plain set | Empty |
| `bulma` | The plain set | Empty |
| `bootstrap5` | Its own `base`, `index`, `_entry`, `_header`, `_nav`, `_nav-item`, and `_footer` | Empty |

Bootstrap is the exception because its navbar, grid, and utility classes are
markup rather than styling. Its `base.haml` differs from the plain one in two
lines:

```haml
%body.d-flex.flex-column.min-vh-100
  %main.container.my-4.flex-grow-1
```

against the plain scaffold's:

```haml
%body
  %main{class: framework-class('container')}
```

Switching a site from `none` to `pico` or `bulma` afterwards needs no layout
edit at all, since the plain layouts already ask for the container slot.
Switching to `bootstrap5` gets you the stylesheet and the classes, but not the
navbar markup, so scaffold a throwaway site with `--framework bootstrap5` and
copy the layouts across if you want that too.

## Wiring the assets

Layouts emit the selected framework's assets through two helpers:

- `framework-stylesheet-tag` renders the stylesheet `<link>` in the document head.
- `framework-script-tag` renders the JavaScript bundle `<script>` before the
  closing `</body>`.

Both read the selected profile, so changing `css-framework` swaps the linked
assets without editing a template. Bootstrap is the only profile shipping
JavaScript, and it is what powers the responsive navbar toggle, dropdowns, and
collapses. The other three render an empty script tag.

## Reading a slot from a layout

`framework-class('container')` returns the class for a slot, or an empty string
under a profile that leaves it bare. An empty class drops out of the tag rather
than writing `class=""`, so one layout serves every profile:

```haml
%main{class: framework-class('container')}
  = yield
```

That is what the scaffolded `base.haml` does, which is why a site scaffolded
with `none` picks up Pico's or Bulma's container by changing one config key.

The built-in `pagination-html` reads its slots the same way, so a paginated
listing looks right under each profile with no layout change.
