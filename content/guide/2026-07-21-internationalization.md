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
that redirects to the first language. Layouts and assets are shared across
languages, and `language-config` overrides settings like `title` per language.

## Translations and the switcher

Two files with the same path in different language trees are treated as
translations, matched by filename rather than slug, so a translated title, and
the different slug it produces, still resolves to the right page. A layout reaches the switcher through `languages`, a
list of `{ code, url, current }` where `url` is the translation in that language,
or that language's home page when there is no translation:

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
