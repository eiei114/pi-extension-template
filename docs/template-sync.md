# Template sync for create-pi-extension

The `create-pi-extension` CLI package ships a generated copy of the **template source** (this repository root). Maintainers refresh that bundle before publishing the CLI.

## Command

From the repository root:

```bash
bun run sync:template
```

This writes to `packages/create-pi-extension/template/`. The directory is gitignored because it is generated output.

## What gets copied

[`scripts/sync-template.ts`](../scripts/sync-template.ts) is the source of truth
for what goes into the CLI bundle. It walks the repository directory and copies
regular files recursively; it does not use Git's tracked-file list or
`.gitignore` as a filter. Run sync from a clean checkout: unrelated local files
can be copied if they don't match an exclusion.

- **Top-level exclusions:** `packages/`, `scaffold/`, `node_modules/`, `.git/`,
  `package-lock.json`, `bun.lock`, `bun.lockb`, and the maintainer-only
  `ROADMAP.md`.
- **Nested exclusions:** `.git` and `node_modules` are also skipped at any depth.
- **Path-specific exclusions:** the script's `CLI_TEMPLATE_EXCLUSIONS` list
  skips specific repository-only docs, tooling, and tests, such as this page,
  `scripts/sync-template.ts`, and `tests/sync-template.test.mjs`.
- **README replacement:** sync skips the root `README.md` and copies
  `scaffold/package-readme.md` separately as the bundle's `README.md`.

These rules apply when building the bundle. Later, when the CLI creates a new
project from that bundle, it removes any bootstrap docs still present in the
generated project. That cleanup is separate from the sync exclusions.

## Package versions

The generated template keeps the version in the root `package.json`. The published
CLI has its own version in `packages/create-pi-extension/package.json`; template
sync does not change it. The release workflows use the CLI workspace version.

## Template package.json cleanup

The synced `template/package.json` has monorepo-only fields removed (`workspaces`, `sync:template` script) so the bundled template stays a standalone Pi package.

## CI check

`npm run ci` runs typecheck, `sync:template`, the full test suite, `review:guardrails`, the `create-pi-extension` pack check, and `tests/sync-template.test.mjs`.

## See also

- [`docs/template-sync-checklist.md`](template-sync-checklist.md) — maintainer checklist before publishing the CLI
- [`packages/create-pi-extension/`](../packages/create-pi-extension/) — scaffold CLI source
