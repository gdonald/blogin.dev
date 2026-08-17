---
title: Getting Started
date: 2026-07-19
order: 2
toc: true
tags: [intro, cli]
description: Install Blogin and build your first site.
---
## Install

The current release is **0.9.1**.

**macOS**

```bash
brew tap gdonald/blogin
brew trust gdonald/blogin
brew install blogin
```

Homebrew refuses to load a formula from a tap outside its own until you trust
it. That is once per machine, not once per install or upgrade, and it applies to
every third-party tap rather than to this one in particular. Only `homebrew/core`
and `homebrew/cask` are trusted without asking.

Blogin can join `homebrew/core`, which would drop both the tap and the trust
step, once it meets Homebrew's notability bar: 225 stars, 90 forks, or 90
watchers when the author submits it. If you find Blogin useful, a star on
[github.com/gdonald/Blogin](https://github.com/gdonald/Blogin){target=_blank rel=noopener}
counts toward
that.

**Linux, and Windows through WSL2**

```bash
curl -LO https://github.com/gdonald/Blogin/releases/latest/download/blogin-linux-x86_64
chmod +x blogin-linux-x86_64
sudo mv blogin-linux-x86_64 /usr/local/bin/blogin
```

Swap `x86_64` for `arm64` on an ARM machine. See
[Other ways to install](#other-ways-to-install) to check the download against its
checksum, for the universal macOS binary, and for building from source.

Confirm it runs. With no command it prints its usage:

```bash
blogin
```

## Your first site

```bash
blogin init myblog        # write a site that already builds
cd myblog
blogin new "Hello World"  # a dated post with its front matter filled in
blogin serve              # http://127.0.0.1:3000, rebuilding as you edit
```

Open `http://127.0.0.1:3000` and edit `content/posts/`. The page reloads itself
as you save. When you are ready to publish:

```bash
blogin build
```

The finished site lands in `public/`, ready for any static host. See
[Deploying](/guide/deploying/).

`blogin init` takes `--framework bootstrap5` to scaffold against Bootstrap 5
rather than plain semantic HTML. See [CSS Frameworks](/guide/css-frameworks/).

## Where things go

| Directory | What belongs there |
| --- | --- |
| `content/` | Markdown posts. A subdirectory is a section. |
| `layouts/` | HAML templates and partials. |
| `assets/css`, `assets/js`, `assets/img` | Stylesheets, scripts, and images, copied to `public/assets/`. Minifying, fingerprinting, and responsive images apply here. |
| `static/` | Copied to the site root untouched, keeping exact names, for `favicon.ico`, `CNAME`, `.well-known/`, and the like. |
| `data/` | Optional JSON and YAML a layout reads. See [Data files](/guide/data-files/). |
| `shortcodes/` | Optional shortcode templates. See [Writing Posts](/guide/writing-posts/). |
| `themes/` | Optional layout and asset sets to fall back to. See [Themes](/guide/themes/). |
| `public/` | The built site. Named by `output-dir`. |
| `.blogin-preview/` | What `blogin serve` builds. Never deployed, and safe to ignore in version control. |

Blogin's own stylesheet and search assets are written under `public/assets/`
too, so everything the site serves lives in one place.

## Upgrading

```bash
brew upgrade blogin
```

On Linux, download the new binary over the old one with the same three commands
as the install. `blogin build` reads the previous build's records, so a version
change rebuilds what it needs to and nothing more.

## Other ways to install

### The macOS binary without Homebrew

Prefer Homebrew on macOS, because it clears the quarantine attribute Gatekeeper
checks. The binary is unsigned, so a browser download is quarantined and macOS
refuses to run it. Installing through Homebrew removes that attribute.

`blogin-macos-universal` carries Apple silicon and Intel in one file. Fetch it
with `curl`, which sets no quarantine attribute:

```bash
curl -LO https://github.com/gdonald/Blogin/releases/latest/download/blogin-macos-universal
curl -LO https://github.com/gdonald/Blogin/releases/latest/download/blogin-macos-universal.sha256
shasum -a 256 -c blogin-macos-universal.sha256
chmod +x blogin-macos-universal
sudo mv blogin-macos-universal /usr/local/bin/blogin
```

If you did download it through a browser, clear the attribute yourself:

```bash
xattr -d com.apple.quarantine blogin
```

### Checking a Linux download

Every binary ships with a `.sha256` beside it:

```bash
curl -LO https://github.com/gdonald/Blogin/releases/latest/download/blogin-linux-x86_64.sha256
sha256sum -c blogin-linux-x86_64.sha256
```

### Verifying a download came from the release build

A checksum proves a file arrived intact. It does not prove where it came from,
because whoever replaced the file could replace the checksum beside it. The
release also carries a build provenance attestation, signed by GitHub with a
short-lived certificate issued to the workflow that built it. No long-lived
private key is involved.

Verifying needs the [GitHub CLI](https://cli.github.com){target=_blank rel=noopener}:

```bash
gh attestation verify blogin-linux-x86_64 --repo gdonald/Blogin
```

It reports which workflow built the file, from which commit. A file built
anywhere else fails, even with a matching checksum. The macOS binary, both Linux
binaries, and `SHA256SUMS` are all attested.

### Building from source

This works on any platform, and is the only route on anything the release
binaries do not cover.

You need a C++23 compiler and CMake 3.28 or newer. Ninja is optional and used
when it is present. There is nothing else to install: no runtime, no package
manager, and no libraries beyond what the compiler ships.

With clang, on macOS or Linux:

```bash
git clone https://github.com/gdonald/Blogin.git
cd Blogin
cmake --preset release
cmake --build build/release -j
sudo cmake --install build/release
```

With GCC 14 or newer, on Linux:

```bash
git clone https://github.com/gdonald/Blogin.git
cd Blogin
cmake --preset gcc-release
cmake --build build/gcc-release -j
sudo cmake --install build/gcc-release
```

Both install to `/usr/local/bin/blogin`. Set `CMAKE_INSTALL_PREFIX` to install
somewhere else, or copy the built binary wherever you keep your own.

The presets that do not say `gcc` select clang, which is what the release
binaries are built with. Both compilers build and run the whole test suite on
every push.

## Platforms

| Platform | Install | Notes |
| --- | --- | --- |
| macOS 13.3 and newer | Homebrew, or the universal binary | Apple silicon and Intel in one file. |
| Linux x86_64 and arm64 | The static binary | Any distribution. No libc, no loader, no glibc version floor. |
| Windows | WSL2, then follow Linux | No native build. |

The Linux binaries are statically linked, so one file per architecture covers
Debian, Ubuntu, Fedora, Arch, Alpine, and anything else. The release build
checks this by running the binary in a container holding a shell and no
libraries at all, so a build that picked up a dependency fails rather than
ships.

There is no `.deb` or `.rpm`, and none is planned. A package would carry the
same single file the download does, with a version floor the static binary does
not have.

Homebrew runs on Linux, but it wants glibc and gcc and installs its own when the
system's are too old. That is a lot of machinery to deliver one file that needs
nothing, so the download is the shorter path even where `brew` is already there.

Windows has no native build, since the file watcher behind `blogin serve` is
written against FSEvents and inotify and the preview server uses POSIX sockets.
WSL2 is a Linux kernel, so the Linux binary works there with live reload and
everything else. WSL1 is not enough, because its inotify support is incomplete.

## When something goes wrong

**`cannot watch N directories: the per-user limit was reached`**

`blogin serve` on Linux watches one inotify handle per directory, and a large
site can pass the per-user cap. Raise it:

```bash
sudo sysctl fs.inotify.max_user_watches=524288
```

Add `fs.inotify.max_user_watches=524288` to `/etc/sysctl.conf`, or a file under
`/etc/sysctl.d/`, to keep it across reboots. `blogin build` never watches
anything, so it is unaffected.

**`two posts write the same page '/posts/hello-world/'`**

Two posts in one section produced the same slug, so one would overwrite the
other. The message names both files. Give one of them a `slug` in its front
matter, or retitle it. See [Writing Posts](/guide/writing-posts/).

**`no content directory at 'content'. Is this a Blogin site?`**

`blogin build` and `blogin serve` are run from the site root, beside
`blogin.json`. Pass `--src` if your content lives somewhere else.

**`port 3000 is already in use. Pass --port to choose another`**

Another process holds the port, often a `blogin serve` you left running.
`blogin serve --port 4000` picks a different one.

**`post already exists: ... (pass --force to overwrite it)`**

`blogin new` refuses to write over a post. Pick a different title, or pass
`--force` when you meant to replace it.

**`unparseable date 'soon' in 'content/posts/x.md'`**

A `date` in front matter is `YYYY-MM-DD`. A date that does not exist, such as
`2026-02-30`, is refused the same way.

**`missing title in 'content/posts/x.md'`**

`title` is the only required front matter key.

**`blogin: command not found`**

The binary is not on your `PATH`. Check where it landed with `ls -l
/usr/local/bin/blogin`, and confirm `/usr/local/bin` is on your `PATH` with
`echo $PATH`.

**Responsive images are not being written**

`image-widths` needs an image resizer on the build host: ImageMagick, or `sips`
on macOS. Without one the build says so and carries on with the images
unchanged. `brew install imagemagick`, or `apt install imagemagick`.

**Extensionless URLs give a 404 once deployed**

`clean-urls` writes `posts/hello.html` and links it as `/posts/hello`, which the
host has to rewrite. See [Deploying](/guide/deploying/) for the nginx and Apache
configuration, or leave `clean-urls` off and every host serves the site with no
setup at all.
