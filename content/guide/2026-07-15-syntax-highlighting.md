---
title: Syntax Highlighting
date: 2026-07-15
order: 7
tags: [markdown]
description: Server-side highlighting for fenced code.
---
Set `"highlight": true` in `blogin.json` and Blogin highlights fenced code during
the build. Highlighting is server-side: there is no client JavaScript, and the
pages work without it.

A fenced block's info string names the language:

````
```cpp
int x = 1;  // a comment
```
````

The highlighter tokenizes the code into spans, escaping the source:

```cpp
const std::string greeting = "hello";  // keywords, strings, numbers, comments
```

Recognized languages are `c`, `cpp`, `java`, `go`, `rust`, `javascript`,
`typescript`, `python`, `ruby`, `raku`, `bash`, and `json`. Only the first word of the
info string selects the highlighter, so ```` ```cpp title=main.cpp ```` still
highlights as C++.

An unrecognized language falls back to escaped plain text and its code block is
labeled with an `hl-plain` class, so a stylesheet can tell a highlighted block
from an unhighlighted one.

## Styling

Highlighting emits `hl-keyword`, `hl-string`, `hl-number`, and `hl-comment`
classes. The build emits `public/assets/css/blogin.css` with a default color
scheme for them, along with base styling for code blocks and heading anchors.
Link it from `base.haml` and override any rule in your own stylesheet. Because
the spans are plain HTML, any color scheme is a matter of CSS.
