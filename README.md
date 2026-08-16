# blogin.dev

The Blogin documentation site, itself a Blogin site. The source tree
lives at the repository root: `content/` holds the Markdown pages, `layouts/`
the HAML templates, `static/` and `assets/` the files it serves, and
`blogin.json` the site configuration.

`content/` has three sections:

| Section      | What is in it                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `guide/`     | Task-shaped pages: getting started, writing posts, layouts, deploying.                                      |
| `cli/`       | One page per command.                                                                                       |
| `reference/` | The template expression language, the HAML compatibility registry, and the YAML subset a data file may use. |

## Building

Render the site with `blogin build` from the repository root. `blogin serve`
previews it on `http://127.0.0.1:3000` and rebuilds as you edit.

`deploy.sh` builds and rsyncs `public/` to the production server. Pass
`--dry-run` to see the transfer without changing anything.
