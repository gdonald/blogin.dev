---
title: Data File YAML
date: 2026-08-15
order: 3
toc: true
tags: [templates, reference]
description: The YAML subset a data file may use, and what is refused.
---
Blogin reads YAML in two places: `data/*.yaml` (or `.yml`, with subdirectories
becoming nested maps), which a layout reads through `data`, and `_data.yaml` (or
`_data.yml`) in a content directory, which is merged into `data` for pages in
that directory and every directory below it. See [Data files](/guide/data-files/) for how they load.
Front matter is not YAML and is not covered here. It is a block of keys and
values read directly.

What follows is not all of YAML. It is the part data files use, written down so
that everything outside it is a stated boundary. The constructs in
[What is refused](#what-is-refused) fail with the line number and what was
refused. A few others are read in a way you may not expect, and are listed after
that table.

Full YAML 1.2 is a project of its own. Anchors and aliases, tags, multiple
documents in one file, block scalar folding, and type resolution are the parts
that make it one, and none of them appears in a data file that lists the entries
of a menu.

## What is read

### Block mappings

Keys and values, nested by indentation. Indentation is spaces. A tab is not
refused, and a tab-indented line is read as if it were not indented, so do not
indent with tabs.

```yaml
site:
  name: Example
  owner:
    name: A Person
    email: person@example.com
```

The split between key and value happens at the first colon outside quotes that
is followed by a space or ends the line, so `a:b: c` has the key `a:b`. A key
that must contain `: ` is quoted.

### Block sequences

```yaml
archives:
  - 2026
  - 2025
```

The dashes may also sit at the key's own indentation, which is the other common
style:

```yaml
archives:
- 2026
- 2025
```

A sequence of mappings, with the first key on the dash line:

```yaml
links:
  - title: Home
    url: /
  - title: Notes
    url: /notes/
```

A nested sequence goes on its own line, indented:

```yaml
matrix:
  -
    - a
    - b
```

Writing that as `- - a` is refused rather than read as the string `- a`.

### Flow sequences

A list of scalars on one line:

```yaml
tags: [cpp, web, notes]
```

Brackets or braces inside it are not read as structure. They become part of the
strings around them, so do not nest them.

### Scalars

| Written | Read as |
| --- | --- |
| `null`, `~`, nothing after the colon | null |
| `true`, `false` | boolean |
| `42`, `-7` | integer |
| `3.14`, `-0.5` | number |
| anything else | string |

A plain scalar needs no quotes. Single quotes make a string literal, with no
escapes inside, so `'C:\path'` is those characters. Double quotes take `\n`,
`\t`, `\r`, `\"`, and `\\`, and any other escape is an error.

```yaml
title: A Title
quoted: 'true'
message: "line one\nline two"
```

`quoted` above is the string `true`, not the boolean.

### Comments

A `#` at the start of a line or after a space or tab runs to the end of the line. A `#`
inside quotes is a character.

```yaml
# The menu, in the order it is shown.
color: "#663399"   # not a comment
```

### The document marker

A line of `---` on its own is skipped wherever it appears. A file may open with
one, and a second document after another `---` is read as part of the first.

## What is refused

Each of these fails with a line number rather than being guessed at.

| Written | Message |
| --- | --- |
| `{a: 1}` | flow mappings are not supported |
| `&anchor`, `*alias` | anchors and aliases are not supported |
| `\|`, `>`, `\|-`, `>-` | block scalars are not supported |
| `- - a` | a nested sequence on the same line is not supported. Indent it on its own line |
| a line indented past its parent | unexpected indentation |
| a line with no colon where a key belongs | expected 'key: value' |
| a `- item` where a key belongs | a sequence item where a mapping key was expected |
| `"\q"` | unknown escape in a double-quoted scalar |
| nesting deeper than 64 levels | nested too deeply |

These are read rather than refused. Multiple documents are merged into one, a
tag such as `!!str` becomes part of the string, a repeated key keeps its last
value, and a complex key fails with `expected 'key: value'`. None of them
belongs in a data file.

## JSON is read too

A data file may be `.json` instead, and JSON is read in full, up to 64 levels of
nesting. The two produce the same values, so `data<menu>` reads the same whether
`menu.yaml` or `menu.json` is what sits in `data/`. If both exist, `menu.yaml` (or
`.yml`) wins over `menu.json`.
