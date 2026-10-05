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
checks goes stale. Blogin's test suite walks a corpus of real sites, counts every
recorded construct it finds, checks each one has a status, and renders every
layout. It detects only constructs already in its table, so a new construct is
recorded by adding it there. This page is the published form of that table, plus
the constructs below that are not carried over.

## Status of every construct

`supported` works the way HAML users expect. `changed` works but not
identically, with the difference stated.

| Construct | Syntax | Status | Notes |
| --- | --- | --- | --- |
| element | `%tag` | supported | |
| class shorthand | `.name` | supported | Combines with a `class` attribute |
| id shorthand | `#name` | changed | An `id` attribute replaces the shorthand id rather than joining it |
| attribute hash | `{key: value}` | supported | |
| attribute rocket | `{'k' => v}` | supported | |
| attribute HTML | `(key='value')` | changed | One attribute, or several separated by commas. Attributes separated only by spaces are read as one value |
| nested attribute | `{data: {a: b}}` | supported | Writes `data-a` |
| boolean attribute | `{disabled: true}` | changed | When the value is an unquoted expression, `true` writes the bare attribute and `false` or `null` omits it. `{disabled}` alone also writes it |
| self closing | `%tag/` | supported | Void tags close themselves without it |
| doctype | `!!! 5` | supported | Always writes the HTML5 doctype |
| escaped output | `= expr` | supported | |
| raw output | `!= expr` | supported | |
| interpolation | `#{expr}` | changed | In text, escapes the value and not the text around it. In an attribute, escapes the whole value. Not interpolated in filters or in an expression string |
| inline text | `%tag text` | supported | Text, whatever it starts with. Only a line of its own is a comment or a control line |
| text escape | `\text` | supported | The rest of the line is text, including any character HAML would otherwise read |
| silent comment | `-#` | supported | Never reaches the page |
| HTML comment | `/` | changed | Treated as a silent comment rather than written as an HTML comment |
| plain filter | `:plain` | changed | The body is written as it is. `#{}` is not interpolated |
| escaped filter | `:escaped` | changed | The body is escaped. `#{}` is not interpolated |
| JavaScript filter | `:javascript` | changed | The body is written as it is. `#{}` is not interpolated |
| CSS filter | `:css` | changed | The body is written as it is. `#{}` is not interpolated |
| conditional | `- if` | supported | |
| else if | `- elsif` | supported | |
| else | `- else` | changed | Anything after `else` on the line is ignored, so write `- elsif` rather than `- else if` |
| negated conditional | `- unless` | supported | |
| loop | `- for xs -> $x` | supported | Iterating a non-list is an error |
| partial render | `render(...)` | supported | Only as the whole expression of a `=` or `!=` line |
| partial name | `:partial<name>` | supported | Resolves `_name.haml` |
| collection | `:collection(xs)` | supported | |
| item binding | `:as<name>` | supported | |
| locals | `:locals(map)` | supported | The map is written `{name: value}` |
| yield | `yield` | changed | Only as `= yield` or `!= yield`, and written raw either way |
| fragment cache | `cache-fragment` | changed | The name is advisory. Reuse is decided by what the fragment read. Also spelled `cache_fragment`. See below |
| boolean literal | `True` / `False` | supported | Accepted alongside `true` and `false`. `Nil` is accepted for `null` |

## Deliberately not carried over

None of these is interpreted. A host filter is refused with `no such filter`
when the template renders. The others are not recognized and come out as
literal text, so `%p< inner` writes `<p>< inner</p>`.

| Construct | Why |
| --- | --- |
| `%p<` and `%p>` whitespace control | Whitespace rules here are this engine's own, so an operator that adjusts Ruby HAML's rules has nothing to adjust |
| `~` preserve | Same reason |
| `[@obj]` object reference | Names a Ruby object's class and id, which has no meaning here |
| `\|` multiline | One expression per line |
| `:ruby`, `:erb`, and other host filters | There is no host language to run |

## Two differences in detail

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
