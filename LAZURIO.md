# Lazurio build of the Composio CLI

This is Lazurio's public fork of [ComposioHQ/composio](https://github.com/ComposioHQ/composio). It
exists to ship a build of the Composio CLI (`ts/packages/cli`) with two changes that no upstream
release contains yet. Lazurio installs this build in the Environments it runs and reads the CLI's
output in its Launchpad. Everything else is upstream code, unchanged.

## What differs from upstream

1. **`composio connections remove <account> --yes`** (`-y`) removes the connection without the
   interactive prompt, so scripts and tools can remove a connection. An ambiguous or unknown
   selector still removes nothing, and without the flag the command asks as before. Upstream pull
   request: [ComposioHQ/composio#4817](https://github.com/ComposioHQ/composio/pull/4817) (open).
2. **`composio connections list`** prints `id` on every entry, `alias` whenever the account has
   one, and `display_name`: the provider identity Composio stores at `state.val.displayName`,
   trimmed, when it is a non-empty string of at most 200 characters. It is the only value the CLI
   reads from `state`, and a top-level `display_name` in a payload is ignored. Upstream pull
   request: [ComposioHQ/composio#4809](https://github.com/ComposioHQ/composio/pull/4809) (closed;
   upstream will implement it its own way).
3. **Release source.** The update check, `composio upgrade`, skill installation, and
   companion-module self-repair fetch releases from `Lazurio/composio` instead of
   `ComposioHQ/composio` (`GITHUB_REPO` in `ts/packages/cli/src/constants.ts`). The
   `COMPOSIO_GITHUB_*` overrides, and `GITHUB_*` for self-repair, work as upstream. The update
   check counts `X.Y.Z-lazurio.N` releases as stable, next to plain `X.Y.Z` (betas stay
   excluded), so it announces a newer Lazurio build, and its next daily refresh replaces a version
   cached by the official CLI. `install.sh` keeps its upstream default source and also accepts
   `X.Y.Z-lazurio.N` versions.

No PostHog key is baked into this build, so it sends no CLI telemetry unless
`COMPOSIO_POSTHOG_PROJECT_API_KEY` is set at run time.

## Branches and tags

- `lazurio/cli-<upstream version>` starts at the exact commit of the upstream stable tag
  `@composio/cli@<upstream version>`. The Lazurio commits reach it only through a reviewed pull
  request from `lazurio/cli-<upstream version>-build`.
- Releases are tagged `@composio/cli@<upstream version>-lazurio.<n>`, with `n` counting from 1 for
  each upstream version, and are cut only from `lazurio/cli-<upstream version>`.
- Nothing is ever force-pushed and no tag is ever moved. A fix is a new commit and a new
  `-lazurio.<n+1>` release; a new upstream version gets a new branch pair with the Lazurio commits
  ported onto it.
- `next` mirrors upstream and carries no Lazurio commits.

## Making a release

1. Merge the pull request into `lazurio/cli-<upstream version>`.
2. Run the **Lazurio CLI Release** workflow (`.github/workflows/lazurio-cli-release.yml`) on that
   branch with `tag` set to `@composio/cli@<upstream version>-lazurio.<n>`. It refuses any other
   tag format, any other branch, a tag that exists on another commit, and a release that is
   already published.
3. The workflow builds the four platform archives the way upstream's `build-cli-binaries.yml`
   does, with the version baked in, packages the skill, writes `checksums.txt`, creates a draft
   release, verifies every asset, and publishes it as the latest release. It then installs the
   release with this repository's `install.sh` on Linux and macOS and checks `composio --version`
   and `composio connections remove --help`.

Install a release with this fork's `install.sh`; the official `https://composio.dev/install` does
not accept `-lazurio.N` versions:

```sh
curl -fsSL https://raw.githubusercontent.com/Lazurio/composio/refs/heads/lazurio/cli-0.4.3/install.sh |
  COMPOSIO_GITHUB_OWNER=Lazurio COMPOSIO_GITHUB_REPO=composio \
  COMPOSIO_INSTALL_VERSION=@composio/cli@0.4.3-lazurio.1 sh
```

## Retirement

When upstream ships equivalents of both changes in a stable release, Lazurio returns to the
official build and these branches get no new releases. An installed Lazurio build keeps fetching
releases from this fork until it is reinstalled from the official installer, or upgraded with
`COMPOSIO_GITHUB_OWNER=ComposioHQ composio upgrade`.
