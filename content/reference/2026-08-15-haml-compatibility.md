---
title: HAML Compatibility
date: 2026-08-15
order: 2
toc: true
tags: [templates, reference]
description: Every HAML construct Blogin reads, each marked supported, changed, or unsupported.
---
There is no HAML standard. Ruby HAML is a reference implementation that embeds
Ruby, and every implementation embeds some host language. The structural syntax
is what carries across, and the expression language is what differs. See
[Template Expressions](/reference/template-expressions/) for the language inside
`=`, `-`, and `#{}`.

This page is a registry rather than prose, because a compatibility claim nothing
checks goes stale. Blogin's test suite walks a corpus of real sites and fails
when one of them uses a construct that has no recorded decision, and this page is
the published form of that record. Adding a construct to a real
layout either passes or says which decision is missing, rather than producing a
render bug nobody looks for.

## Status of every construct

`supported` works the way HAML users expect. `changed` works but not
identically, with the difference stated. `unsupported` is refused with an error
naming the file and line.

| Construct | Syntax | Status | Notes |
| --- | --- | --- | --- |
| element | `%tag` | supported | |
| class shorthand | `.name` | supported | Combines with a `class` attribute |
| id shorthand | `#name` | supported | |
| attribute hash | `{key: value}` | supported | |
| attribute rocket | `{'k' => v}` | supported | |
| attribute HTML | `(key='value')` | supported | |
| nested attribute | `{data: {a: b}}` | supported | Writes `data-a` |
| boolean attribute | `{disabled: true}` | changed | A false or null value omits the attribute rather than writing it empty |
| self closing | `%tag/` | supported | Void tags close themselves without it |
| doctype | `!!! 5` | supported | Always writes the HTML5 doctype |
| escaped output | `= expr` | supported | |
| raw output | `!= expr` | supported | |
| interpolation | `#{expr}` | supported | Escapes the value, not the text around it |
| inline text | `%tag text` | supported | Text, whatever it starts with. Only a line of its own is a comment or a control line |
| text escape | `\text` | supported | The rest of the line is text, including any character HAML would otherwise read |
| silent comment | `-#` | supported | Never reaches the page |
| HTML comment | `/` | changed | Treated as a silent comment rather than written as an HTML comment |
| plain filter | `:plain` | supported | |
| escaped filter | `:escaped` | supported | |
| JavaScript filter | `:javascript` | supported | |
| CSS filter | `:css` | supported | |
| conditional | `- if` | supported | |
| else if | `- elsif` | supported | |
| else | `- else` | supported | |
| negated conditional | `- unless` | supported | |
| loop | `- for xs -> $x` | supported | Iterating a non-list is an error |
| partial render | `render(...)` | supported | |
| partial name | `:partial<name>` | supported | Resolves `_name.haml` |
| collection | `:collection(xs)` | supported | |
| item binding | `:as<name>` | supported | |
| locals | `:locals(map)` | supported | The map is written `{name: value}` |
| yield | `yield` | supported | |
| fragment cache | `cache-fragment` | changed | The name is advisory. Reuse is decided by what the fragment read. See below |
| boolean literal | `True` / `False` | supported | Accepted alongside `true` and `false` |

## Deliberately not carried over

Each of these is refused with an error rather than half-supported.

| Construct | Why |
| --- | --- |
| `%p<` and `%p>` whitespace control | Whitespace rules here are this engine's own, so an operator that adjusts Ruby HAML's rules has nothing to adjust |
| `~` preserve | Same reason |
| `[@obj]` object reference | Names a Ruby object's class and id, which has no meaning here |
| `\|` multiline | One expression per line |
| `:ruby`, `:erb`, and other host filters | There is no host language to run |

## The two real differences

### cache-fragment is advisory

Naming a fragment normally means asserting by hand that its output does not
vary, and a wrong assertion serves one page's markup to another. Here the key is
derived from the values the fragment read while rendering. A fragment reading
only site-level values renders once and is reused. One reading page state
renders per page, whichever name it was given. That is faster, because it finds
reuse nobody annotated, and safer, because it cannot serve a stale fragment.

A reused fragment is not rendered again. The names it read the first time are
resolved against the next page, which gives that page's key before anything is
rendered, and a key already in the cache ends the work there. Where the fragment
is written is part of its key too, so two fragments that happen to read the same
values are still two fragments.

### An HTML comment is silent

`/` writes a comment into the page in Ruby HAML. Here it is dropped, the same as
`-#`. A template comment that reaches the reader is more often a mistake than an
intent. If you need a literal HTML comment in the page, write one with `:plain`.
