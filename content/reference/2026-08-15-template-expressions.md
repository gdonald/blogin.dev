---
title: Template Expressions
date: 2026-08-15
order: 1
toc: true
tags: [templates, reference]
description: The complete language inside =, -, and #{} in a HAML layout.
---
Blogin's layouts are HAML. What HAML does not define is the language inside
`= ...`, `- if ...`, and `#{...}`. Ruby HAML embeds Ruby. Blogin embeds a small
language of its own.

Everything it does not do is a stated boundary rather than a missing feature,
and reaching one produces an error naming the file, the line, the column, and
the construct. It never guesses.

## Why a language at all

A layout has to ask questions of the page it is rendering: what is the title,
does this post have tags, which navigation item is current. Answering those takes
expressions. What it does not take is a general-purpose
programming language embedded in a template, and the cost of one is a template
that can do anything, including things nobody can predict from reading it.

So this language can read, compare, iterate, and call what the view offers. It
cannot define, assign, or mutate.

## Values

Every value is one of: null, boolean, integer, number, string, list, or map.
These are the same values configuration and data files produce, so a layout
reads `data` from a JSON file the same way it reads anything else.

## Truthiness

`- if` and `- unless` ask whether a value is true. False are:

- `null`
- `false`
- `0` and `0.0`
- the empty string
- the empty list
- the empty map

Everything else is true. An empty collection being false is what lets a layout
write `- if tags` rather than `- if tags.elems > 0`.

## Grammar

```
expression   := or
or           := and ( "||" and )*
and          := comparison ( "&&" comparison )*
comparison   := additive ( ("==" | "!=" | "<" | "<=" | ">" | ">=" | "eq" | "ne") additive )*
additive     := unary ( ("+" | "-" | "~") unary )*
unary        := ( "!" | "not" )? postfix
postfix      := primary ( "." name call-args? | "<" name ">" | "(" arguments ")" )*
primary      := literal | variable | name | map | "(" expression ")"
literal      := string | number | "true" | "false" | "null"
map          := "{" ( entry ( "," entry )* )? "}"
entry        := name ":" expression
variable     := "$" name
name         := letter ( letter | digit | "-" | "_" )*
arguments    := ( argument ( "," argument )* )?
argument     := expression | ":" name "<" text ">" | ":" name "(" expression ")"
```

`+` concatenates strings, and so does `~`.

`&&` and `||` stop as soon as the answer is known and yield the value rather
than a boolean, so `subtitle || title` reads as a default and
`- if post && post<title>` is safe to write.

## Reading values

**A bare name** is a question asked of the view: `title`, `site-title`,
`has-tags`, `nav-nodes`. The view decides what to return. A name the view does
not offer is an error, not null, because a typo in a layout should be visible.

**`$name`** is a local: a loop variable, or something passed through `:locals`.
An unknown local is an error for the same reason.

**`.name`** reads a member of a map or asks an object for a property:
`$node.url`, `$post.title`. On a list, `.elems`, `.size`, `.count`, `.first`,
and `.last` are built in. On a string, `.chars` and `.elems` are its length.

**`<name>`** reads a map key: `$tag<url>`, `data<archives>`. `$tag.url` and
`$tag<url>` do the same thing, so write whichever reads better.

A missing key reads as null rather than raising, because `- if $entry<image>` is
how a layout asks whether something is there.

**`name(...)`** calls what the view offers, with arguments:
`format-date(date, "%B %e, %Y")`, `nav-current($node)`, `truncate(summary, 200)`.
`url()` and `url` mean the same thing.

## Maps

`{ name: expression, ... }` is the one way to write a map, and it exists because
`:locals` needs one:

```haml
!= render(:partial<header>, :locals({brand: site-title}))
```

A map and a deferred block both open with `{`. A map's first thing is a name
followed by a colon, and nothing else can start that way, so the two are told
apart without any marker.

## Named arguments

`render` takes named arguments:

```haml
!= render(:partial<entry>, :collection(posts), :as<entry>)
```

`:name<text>` passes literal text. `:name(expression)` passes a value. This
shape is accepted for any call, not only `render`.

## Control flow

```haml
- if has-tags
  %p tagged
- elsif has-categories
  %p categorised
- else
  %p untagged

- unless draft
  %p published

- for tags -> $tag
  %li= $tag<name>
```

`- for` iterates a list. Iterating null or a scalar is an error, since it is
almost always a mistake rather than an empty result.

There is no ternary operator. Write a two-branch `- if` instead, or reach for
`||` when what you want is a default.

## Output

`=` writes an escaped value. `!=` writes it raw. `#{...}` interpolates inside
text and inside attribute values, and escapes.

Escaping means `&`, `<`, `>`, and `"` become entities. There is no way to write
markup accidentally: raw output is always spelled `!=`.

## Blocks

One form takes a block, and only one:

```haml
!= cache-fragment('header', { render(:partial<header>) })
```

The block is not a closure. It is an expression whose evaluation is deferred,
which is all `cache-fragment` needs. Blocks cannot take parameters, be stored,
or be passed anywhere else.

## Worked examples

Each of these is a pattern a real site uses, with what the language is doing
spelled out.

### A post's page

```haml
%article
  %h1= title
  - if show-dates
    %p.meta= "#{format-date(date, "%B %e, %Y")} · #{reading-time} min read"
  != body
```

`title`, `show-dates`, `date`, `reading-time`, and `body` are names the view
answers. `format-date` is a call the view offers, taking the date and a strftime
pattern. `body` is written with `!=` because it is HTML the Markdown renderer
produced. Everything else is written with `=` and escapes.

### A listing entry

```haml
.card
  %h5
    %a{href: "#{$entry<url>}"}= $entry<title>
  %p= $entry<description>
  - if index-dates
    %small= $entry<date>
```

`$entry` is the loop variable the listing passed in through `:collection` and
`:as`. `<url>` reads a key of it. The `href` is written with interpolation
because it is part of a larger string. The attribute value escapes either way.

### Navigation, which is recursive

```haml
%li
  - if nav-current($node)
    %a.active{href: "#{$node.url}"}= $node.label
  - else
    %a{href: "#{$node.url}"}= $node.label
  - if $node.children.elems
    %ul
      != render(:partial<nav-item>, :collection($node.children), :as<node>)
```

`nav-current($node)` asks the view whether this node is the section being
rendered. `$node.children.elems` is the list's length, and an empty list is
false, so the test could be written `- if $node.children` just as well. The
partial renders itself, once per child, with `$node` rebound each time.

### A default

```haml
%title= page-title || site-title
```

`||` yields the left value when it is true and the right one otherwise, rather
than a boolean, which is what makes it read as a default.

### A fragment rendered once

```haml
!= cache-fragment('header', { render(:partial<header>) })
```

The name is advisory. What decides whether the rendered bytes are reused is what
the fragment read while rendering: a header reading only site-level values
renders once for the whole build, and one reading the current url renders per
page. Asking for reuse cannot produce a stale fragment.

### Values passed to a partial

```haml
!= render(:partial<header>, :locals({brand: site-title}))
```

Inside `_header.haml`, that is `$brand`. `:locals` takes a map, which is the
reason the language has one.

## What it does not do

Each of these is refused with an error rather than half-supported:

- **Assignment.** No `=`, no `my`, no accumulating a variable across a loop.
- **List literals.** A map is written because `:locals` needs one. Nothing needs
  a list literal, so there is not one.
- **User-defined functions.** A layout calls what the view offers.
- **Mutation.** Nothing a template does changes a value another template sees.
- **Arbitrary method chains into the host.** `.uc`, `.split`, `.map` and the
  like are not available. What the view offers is the whole surface.
- **General closures.** Only the deferred-block form above.
- **Ranges, regular expressions, and case statements.** No equivalent.
- **Arithmetic beyond `+` and `-`.** No `*`, `/`, or `%`. Layouts do not
  calculate. Views do.

## Errors

An error names where it happened and what was refused:

```
layouts/show.haml:14:11: no such name 'has-tag' (did you mean 'has-tags'?)
layouts/_entry.haml:3:22: cannot iterate a string
layouts/base.haml:9:5: assignment is not supported
```

A suggestion appears when a name is close to one that exists, since the usual
cause is a typo rather than a misunderstanding.

The names the view answers are listed in
[Template Data](/guide/template-data/). The HAML constructs around them are in
[HAML Compatibility](/reference/haml-compatibility/).
