---
title: Template Expressions
date: 2026-08-15
order: 1
toc: true
tags: [templates, reference]
description: The language inside =, -, and #{} in a HAML layout.
---
Blogin's layouts are HAML. What HAML does not define is the language inside
`= ...`, `- if ...`, and `#{...}`. Ruby HAML embeds Ruby. Blogin embeds a small
language of its own.

Everything it does not do is a stated boundary rather than a missing feature,
and reaching one produces an error naming the line, the column, and the
construct, and the template file for an error found while compiling it. It
never guesses.

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
or           := and ( ("||" | "or") and )*
and          := comparison ( ("&&" | "and") comparison )*
comparison   := additive ( ("==" | "!=" | "<" | "<=" | ">" | ">=" | "eq" | "ne") additive )*
additive     := unary ( ("+" | "-" | "~") unary )*
unary        := ( "!" | "not" ) unary | postfix
postfix      := primary ( "." name call-args? | "<" name ">" | "(" arguments ")" )*
primary      := literal | variable | name | map | block | "(" expression ")"
literal      := string | number | "true" | "false" | "True" | "False" | "null" | "Nil"
block        := "{" expression "}"
map          := "{" ( entry ( "," entry )* )? "}"
entry        := name ":" expression
variable     := "$" name
name         := ( letter | "_" ) ( letter | digit | "-" | "_" )*
arguments    := ( argument ( "," argument )* )?
argument     := expression | ":" name "<" text ">" | ":" name "(" expression ")"
```

A string is written in single or double quotes. A backslash makes the next
character literal, there are no `\n`-style escapes, and `#{}` is not
interpolated inside an expression string. A number is unsigned digits with an
optional fractional part. There is no unary minus, so write `0 - 1`.

`+` adds two numbers and concatenates when either side is a string. `~` always
concatenates, writing numbers and booleans as text. `-` subtracts numbers. A side
that is not a number counts as 0. `<`, `<=`, `>`, and `>=` compare two numbers or
two strings, and anything else is an error. `==` between different types is
false, so `"1" == 1` is false.

An expression nests at most 64 levels deep, and past that it is refused with
`nested too deeply, past 64 levels`. Each link of a chain written on one line
counts as a level, so `1 + 1 + 1 ...` with 64 or more operators is refused, and
so is a run of 64 member reads.

`&&` and `||` stop as soon as the answer is known and yield the value rather
than a boolean, so `page-title || site-title` reads as a default and
`- if has-tags && tags.first<name>` is safe to write.

## Reading values

**A bare name** is a question asked of the view: `title`, `site-title`,
`has-tags`, `nav-nodes`. The view decides what to return. A name the view does
not offer is an error, not null, because a typo in a layout should be visible. A
bare name is looked up among the locals first, so inside a partial `brand` and
`$brand` both read a local named `brand`.

**`$name`** is a local: a loop variable, or something passed through `:locals`.
An unknown local is an error for the same reason.

**`.name`** reads a member of a map or asks an object for a property:
`$node.url`, `$post.title`. On a list, `.elems`, `.size`, `.count`, `.first`,
and `.last` are built in. On a string, `.chars` and `.elems` are its length in
bytes. `.name()` with empty parentheses is the same read as `.name`.
`.name(arguments)` calls the view's `name` with those arguments, and the value
before the dot is not passed.

**`<name>`** reads a map key: `$tag<url>`, `data<archives>`. `$tag.url` and
`$tag<url>` do the same thing, so write whichever reads better.

A missing key reads as null rather than raising, because `- if $entry<image>` is
how a layout asks whether something is there. Only a map answers a missing key
with null. Reading a member of null, a boolean, or a number is an error, so
`$entry<image><url>` fails when `image` is absent. Guard it with
`- if $entry<image>` first.

**`name(...)`** calls what the view offers, with arguments:
`format-date(date, "%B %e, %Y")`, `nav-current($node)`, `truncate(summary, 200)`.
`url()` and `url` mean the same thing.

`truncate(text, length)` defaults to 200 characters, breaks at the last space,
and appends `…`. `group-by(list, field)` returns `{ key, items }` maps, sorted
by key descending. `nav-current(node)` reads the node's `current`.
`framework-class(name)` returns the active framework's class for a slot, or an
empty string. `debug-open(label)` and `debug-close(label)` write
`<!-- begin label -->` and `<!-- end label -->` only when `debug` is on.

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
shape is accepted for any call, not only `render`. Without `:as`, each
collection item is `$item`. Partials may nest 32 deep.

## Control flow

```haml
- if has-tags
  %p tagged
- elsif has-related
  %p related
- else
  %p untagged

- unless show-dates
  %p undated

- for tags -> $tag
  %li= $tag<name>
```

`- for` iterates a list. Iterating null or a scalar is an error, since it is
almost always a mistake rather than an empty result.

There is no ternary operator. Write a two-branch `- if` instead, or reach for
`||` when what you want is a default.

## Output

`=` writes an escaped value. `!=` writes it raw. `#{...}` interpolates inside
HAML text and inside quoted attribute values. In text the value is escaped, and
in an attribute the whole finished value is escaped. Filter bodies (`:plain`,
`:javascript`, `:css`, `:escaped`) are not interpolated.

Escaping means `&`, `<`, `>`, and `"` become entities. Raw output is spelled
`!=`. The one exception is `yield`, which writes the wrapped page as it is with
either `=` or `!=`.

## Blocks

Only `cache-fragment` defers a block:

```haml
!= cache-fragment('header', { render(:partial<header>) })
```

The block is not a closure. It is an expression whose evaluation is deferred,
which is all `cache-fragment` needs. Passed to any other call, a block is
evaluated on the spot, as if written without braces. Written anywhere but an
argument, it is an error. `render(...)` and `cache-fragment(...)` must be the
whole expression of a `=` or `!=` line.

## Working examples

Each of these is a pattern a real site uses, with what the language is doing
spelled out.

### A post's page

```haml
%article
  %h1= title
  - if show-dates
    %p.meta #{format-date(date, "%B %e, %Y")} · #{reading-time} min read
  != body
```

`title`, `show-dates`, `date`, `reading-time`, and `body` are names the view
answers. The meta line is HAML text, so its `#{}` holes are interpolated and
escaped. `format-date` takes the date and a pattern, defaulting to `%Y-%m-%d`.
It understands `%Y %m %d %e %B %b %A %a %%`, where `%e` is the unpadded day, and
returns its input unchanged when it is not a date. `body` is written with `!=`
because it is HTML the Markdown renderer produced.

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
  like are not available. On a string or a list they are an error. On a map
  they read a key of that name, which is usually null. What the view offers is
  the whole surface.
- **General closures.** Only the deferred-block form above.
- **Ranges, regular expressions, and case statements.** No equivalent.
- **Arithmetic beyond `+` and `-`.** No `*`, `/`, or `%`. Layouts do not
  calculate. Views do.

## Errors

An error names where it happened and what was refused. An error found while
compiling a template also names the file:

```
blogin: line 2, column 3: no such name 'has-tag' (did you mean 'has-tags'?)
blogin: line 2, column 1: cannot iterate string
blogin: line 2, column 5: layouts/show.haml: assignment is not supported
```

Error messages call a list an `array` and a map an `object`.

A suggestion appears when a name is close to one that exists, since the usual
cause is a typo rather than a misunderstanding.

The names the view answers are listed in
[Template Data](/guide/template-data/). The HAML constructs around them are in
[HAML Compatibility](/reference/haml-compatibility/).
