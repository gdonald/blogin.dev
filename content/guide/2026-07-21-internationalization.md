---
title: Internationalization
date: 2026-07-21
order: 12
tags: [configuration]
description: Build a site in more than one language.
---
List the languages you write in and Blogin builds each into its own subtree.

```json
"languages": ["en", "fr"],
"language-config": {
  "en": { "title": "My Site" },
  "fr": { "title": "Mon Site" }
}
```

Put each language's content under a directory named for its code:

```
content/
  en/
    posts/
      2026-07-19-hello.md
  fr/
    posts/
      2026-07-19-hello.md
```

Each language builds into `public/<code>/`, with its own pages, listings,
taxonomies, and feeds rooted at `/<code>/`. The site root gets an `index.html`
that redirects to the first language, and nothing else. Layouts, `assets/`, and
`static/` are read from one place, and each language publishes its own copy of
the assets and static files under `public/<code>/`, along with its own
`sitemap.xml`, `robots.txt`, `404.html`, and `search-index.json`.
`language-config` sets a per-language `title`, and no other setting can be
overridden per language.

## Translations and the switcher

Two files in the same section of different language trees are treated as
translations when their filenames match, ignoring a leading date and the
extension. They are matched by filename rather than slug, so a translated title, and
the different slug it produces, still resolves to the right page. A layout reaches the switcher through `languages`, a
list of `{ code, url, current }` where `url` is the translation in that language,
or that language's home page when there is no translation. On a listing page,
`url` is the same section in that language:

```haml
%nav.languages
  - for languages -> $lang
    - if $lang<current>
      %a.current{href: "#{$lang<url>}"}= $lang<code>
    - else
      %a{href: "#{$lang<url>}"}= $lang<code>
```

The expression language has no ternary operator, so a two-branch `- if` is how a
layout picks between two pieces of markup. See
[Template Expressions](/reference/template-expressions/).
