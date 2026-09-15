# Local validation for the publish workflow

Run these checks locally **before** merging a version bump to `main` or dispatching `.github/workflows/publish.yml`. They mirror what the publish job runs after the npm registry skip guard.

Publishing itself stays in GitHub Actions (Trusted Publishing). Do not run `npm publish` locally.

## Prerequisites

- Node.js **24** (matches `publish.yml` and `ci.yml`)
- [Bun](https://bun.sh/) (for `sync:template`)
- Dependencies installed with a clean lockfile:

```bash
npm ci
```

## Quick path (recommended)

From the repository root:

```bash
npm run ci
```

`npm run ci` runs, in order:

1. `npm run typecheck`
2. `npm run sync:template` — refresh `packages/create-pi-extension/template/`
3. `npm test` — unit, smoke, CLI, guardrail, and contract tests
4. `npm run review:guardrails` — validate `.github/workflows/*.yml` review guardrails
5. `npm run pack:check` — `npm pack --dry-run` for the `create-pi-extension` workspace
6. `node --test tests/sync-template.test.mjs` — assert the bundled template matches the source

If this passes, you have covered the same validation steps as the publish workflow (except the registry skip guard and Trusted Publishing).

## Tarball check (publish workflow parity)

`publish.yml` also verifies that the dry-run tarball lists `template/`:

```bash
cd packages/create-pi-extension
npm pack --dry-run 2>&1 | tee /tmp/pack.txt
grep -q 'template/' /tmp/pack.txt
```

On Windows PowerShell:

```powershell
cd packages/create-pi-extension
npm pack --dry-run 2>&1 | Tee-Object -Variable pack
$pack -match 'template/'
```

If `grep` / `-match` fails, the bundled template is missing from the published package. Re-run `npm run sync:template` and check [`docs/template-sync-checklist.md`](template-sync-checklist.md).

## Mapping to `publish.yml`

| Publish workflow step | Local equivalent |
| --- | --- |
| Skip already published version | Not reproducible locally (registry HTTP check). Use Actions logs or `npm view create-pi-extension@<version>` after publish. |
| `npm ci` | `npm ci` |
| Sync bundled template | `npm run sync:template` (included in `npm run ci`) |
| Validate package | `npm run ci` |
| Verify tarball includes `template/` | See [Tarball check](#tarball-check-publish-workflow-parity) above |
| Publish to npm | **Do not run locally.** See [`docs/release.md`](release.md). |

## Optional: scaffold smoke test

Before a release, confirm the CLI still scaffolds a working project:

```bash
node packages/create-pi-extension/src/cli.mjs /tmp/test-scaffold-pkg
cd /tmp/test-scaffold-pkg
npm install
npm run ci
```

Requires Pi only if you also want to run `pi -e .` in the generated project. See [`docs/template-sync-checklist.md`](template-sync-checklist.md#cli-scaffold-testオプションだが推奨).

## Pre-merge checklist

- [ ] `npm run ci` passes on the branch that will merge to `main`
- [ ] Tarball dry-run includes `template/` under `packages/create-pi-extension`
- [ ] Root `package.json` version is final for the release
- [ ] `CHANGELOG.md` has the release notes and date
- [ ] [`docs/release.md`](release.md) Trusted Publisher settings are unchanged or updated in the same PR

After merge, version bumps on `main` trigger `auto-release.yml`, which tags and dispatches `publish.yml`. See [`docs/release.md`](release.md#publish) for the full release path.

## Related docs

- [`docs/release.md`](release.md) — Trusted Publishing, tagging, and CI publish triggers
- [`docs/template-sync-checklist.md`](template-sync-checklist.md) — template sync and bundled-template verification
- [`docs/publish-rerun-rollout.md`](publish-rerun-rollout.md) — rerun skip guard behavior on npm
