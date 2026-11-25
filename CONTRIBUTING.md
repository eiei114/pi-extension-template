# Contributing

Thanks for helping improve this Pi package.

## Development

Run these commands from the repository root with Node.js 24 (to match CI),
npm, and Bun on your `PATH`. Although you start validation with npm,
`npm run ci` calls `sync:template`, which uses Bun to run the template sync script.

```bash
npm install
npm run ci
```

## Local Pi testing

```bash
pi -e .
```

## Pull requests

Before opening a PR:

- Run `npm run ci`
- Update docs when behavior changes
- Update `CHANGELOG.md` for user-facing changes
- Keep package contents small and intentional
- Run `npm pack --dry-run` when you add, remove, or rename `docs/` files so `package.json` `files` matches what you ship

## Release

Releases publish **`create-pi-extension`** to npm through Trusted Publishing. The root template source is not published. Do not add `NPM_TOKEN` to GitHub Secrets.

Before bumping the version, run the local validation steps in `docs/publish-local-validation.md` (at minimum `npm ci`, `npm run ci`, plus the tarball check).

From the repository root, bump the published CLI workspace version, not the
private root `pi-extension-template` package version:

```bash
npm version patch --workspace create-pi-extension --no-git-tag-version
```

Commit the version bump and submit it through the normal PR process. Preparing
or merging the bump does not create a tag or publish to npm. After separate
release authorization, follow the [release guide](docs/release.md#publish) to
manually dispatch `auto-release.yml` on `main`.
