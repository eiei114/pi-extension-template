# Roadmap

> Living roadmap for `pi-extension-template` — the template source for new Pi
> extension OSS projects. The published npm artifact is
> [`create-pi-extension`](https://www.npmjs.com/package/create-pi-extension)
> (the scaffold CLI). The repository root is template source, not published.

This file exists so the **Weekly maintenance seed planner** (and any human
maintainer) can pick the next bounded micro-maintenance candidate without
re-discovering project state. Update it whenever a release ships, a major item
is resolved, or the seed backlog is exhausted.

Status snapshot date: **2026-10-05**.

---

## 1. Current status

| Aspect | State |
|---|---|
| Latest GitHub release / tag | `v0.3.1` (2026-09-30) |
| Root `package.json` version | `0.3.1` (synced into `create-pi-extension` on publish) |
| `create-pi-extension` on npm | **Published** — `0.3.1` via Trusted Publishing (`publish.yml` green on tagged releases). |
| Legacy `pi-extension-template` on npm | `0.1.6` remains on npm as a legacy root package; README steers users to `create-pi-extension`. |
| CI (`.github/workflows/ci.yml`) | Green on `main`. Runs typecheck, `sync:template`, tests, `review:guardrails`, `pack:check`, and template-sync assertions. |
| Pi SDK alignment | Examples on Pi **0.99.x** (`@earendil-works/*` devDeps at `0.99.1`). `ctx.hasUI` guards, lifecycle events, TUI custom entries current. |
| Example coverage | Extension (`hello`, typed tool, TUI dashboard, skill-bridge, package-layout), Agent Skill, prompt template, theme (all 51 tokens), plus entrypoint-shape checks. |
| Tests | `greeting`, `format-table`, `config-contract`, `error-contract`, `create-pi-extension` CLI scaffold (unscoped + scoped), `smoke` (theme tokens, manifest entries, workflow shape, stale-doc guard), runtime entrypoint shapes, package contents, `review-guardrails`, `sync-template`. |

### 1.1 What is healthy

- **CI is reliable and fast** (~30 s). Template-sync assertions prevent the
  bundled CLI template from drifting from repository source.
- **Dependabot** keeps `@earendil-works/*` and `typebox` current via a weekly
  multi-ecosystem group; PRs merge cleanly because examples track the latest
  patterns.
- **Examples are fresh** through the Pi 0.99.1 SDK bump (PR #119); entrypoint runtime-shape and package-content checks now cover common scaffold regressions (PR #117–#118).
- **Release plumbing is well-documented** (`docs/release.md`,
  `docs/publish-rerun-rollout.md`, `auto-release.yml` → `publish.yml` handoff).
- **Publish workflow races fixed** — concurrent publish runs are serialized (PR #98).
- **Onboarding docs accurate** — README and npm badges point at live
  `create-pi-extension` (DOT-1539); stale follow-up references removed
  (DOT-1218); CHANGELOG structure reconciled (DOT-1693).

### 1.2 What is at risk

- **Two package names on npm are out of sync with intent**: the legacy root
  `pi-extension-template` is still published while `create-pi-extension` is the
  intended onboarding artifact (TD-02, human-owned deprecation decision).
- **Runtime coverage is still partial** — entrypoint shape checks catch export regressions, but the examples are not exercised in a real Pi session. Further drift can still surface only after scaffolding.
- **Post-release maintenance is accumulating** — the latest tests and metadata refactors landed after `v0.3.1`; a human should decide when to cut the next release.

---

## 2. Project purpose & priorities

`pi-extension-template` is the **onboarding template** for the Pi package
ecosystem. Its job is to make a new contributor productive in minutes:

1. `bunx create-pi-extension my-pi-package` → working, CI-green Pi package.
2. Copy-pasteable examples for every Pi resource type (extension, skill, prompt,
   theme) that match the *current* Pi SDK.
3. A trustworthy, reproducible publish path (npm Trusted Publishing).

**Priorities (in order):**

1. **Keep onboarding docs accurate** — README badges and install paths must
   reference the live `create-pi-extension` npm package, not the legacy root
   name.
2. **Keep examples correct** against the latest Pi SDK (the template's core
   value proposition is "examples that compile and run today").
3. **Keep the scaffold CLI ergonomic** (interactive defaults, scoped names,
   non-interactive mode for CI).
4. **Minimal, intentional docs** (Pi OSS minimal-docs policy: `docs/` is
   optional, bootstrap docs get cleaned up after generation).
5. **Low-risk maintenance hygiene** (changelog accuracy, dependency grouping,
   stale-reference cleanup).

---

## 3. Short-term goals (next 1–2 releases)

### v0.3.2 — "maintenance follow-up" (next patch candidate)

Goal: package the post-`v0.3.1` maintenance changes after human review, without
performing a release as part of roadmap triage.

- Decide whether the post-release test and metadata changes warrant a patch release.
- Apply `npm pkg fix` and verify publish warning clears (seed S-10).

### v0.4.0 — "ergonomic + broader scaffold" (next feature line)

Goal: make the CLI usable non-interactively and extend verification without
sacrificing the minimal template surface.

- Non-interactive / flag-driven CLI mode (`--name`, `--yes`, `--version`) for
  CI and scripted use (seed S-08).
- Consolidate bootstrap docs per minimal-docs policy (seed S-07).
- Group `@earendil-works/*` Dependabot updates separately from Actions (seed S-09).
- Add broader runtime validation for examples beyond export-shape assertions.

---

## 4. Known technical debt

| ID | Item | Severity | Ownership | Notes |
|---|---|---|---|---|
| TD-01 | ~~`create-pi-extension` not on npm~~ — **resolved** for `0.1.8` / `0.2.x` publishes; keep `publish.yml` diagnostics for first-time forks | ~~Blocker~~ Closed (this repo) | **Human** for new forks | README + `publish.yml` now distinguish unregistered package vs already-published skip. |
| TD-02 | Legacy root `pi-extension-template` is published on npm (`0.1.6`) despite docs saying it is not | High | **Human** (npm ownership) | Decide: deprecate on npm, or transfer. |
| TD-03 | No full Pi-session validation of example extensions — export-shape checks now exist | Medium | AI | Examples can still drift beyond load-time shape checks. Broader coverage is a v0.4.0 candidate. |
| TD-04 | ~~`CHANGELOG.md` has duplicate headers / undated versions~~ — **resolved** (DOT-1693) | ~~Low~~ Closed | AI | All shipped versions now have ISO dates; `Unreleased` holds only pending work. |
| TD-05 | ~~Docs reference resolved follow-up placeholders~~ — **resolved** (DOT-1218) | ~~Low~~ Closed | AI | Regression test in `tests/smoke.test.mjs` guards against reintroduction. |
| TD-06 | Bootstrap docs (`github-template.md`, `repository-settings.md`, `typescript.md`) labeled delete-or-merge but still standalone | Low | AI | Minimal-docs policy. Covered by seed S-07. |
| TD-07 | Root `package.json` `author` is still the `YOUR_NAME` placeholder | Low | AI | Cosmetic; template source only. Tracked here only — not a bounded seed (the one-field change is <30 min). |
| TD-08 | `publish.yml` log shows `npm warn publish npm auto-corrected some errors in your package.json` | Low | AI | Re-run `npm pkg fix` in `packages/create-pi-extension/`; verify warning clears. Covered by seed S-10. |

> **Human-owned areas** (per project policy): release/publish, npm ownership,
> secrets, billing, permissions. AI agents must not perform these; flag them
> and stop. TD-02 requires a human maintainer to act on npm.

---

## 5. Maintenance seed backlog

Each seed is intentionally bounded to **30–90 minutes** so the weekly planner
can promote one into a backlog issue. Promote in roughly the listed order;
earlier seeds unblock or de-risk later ones. When a seed is completed, strike
it through and move the detail into the relevant release section above.

| Seed | Title | Estimate | Depends on | Why needed |
|---|---|---|---|---|
| **S-01** ✅ | ~~Add `ROADMAP.md` to the repository~~ — done (PR #63, DOT-858) | — | — | — |
| **S-02** ✅ | ~~Diagnose + clarify `publish.yml` `E404` failure~~ — done (DOT-1228, DOT-1744) | ~60 min | — | — |
| **S-03** ✅ | ~~Hardening: README must not advertise a 404 npm package~~ — done (DOT-1539) | ~30 min | — | — |
| **S-04** ✅ | ~~Reconcile `CHANGELOG.md` (dates, no dup headers)~~ — done (DOT-1693, PR #105) | ~45 min | — | — |
| **S-05** ✅ | ~~Remove stale follow-up issue references from docs~~ — done (DOT-1218) | ~30 min | — | — |
| **S-06** ✅ | ~~Add extension entrypoint shape assertion test~~ — done (PR #117) | — | — | Runtime shape checks catch export regressions before scaffolding. |
| **S-07** | Consolidate bootstrap docs (minimal-docs policy) | ~75 min | — | Standalone bootstrap docs violate minimal-docs policy and confuse new maintainers (TD-06). |
| **S-08** | Non-interactive flags for `create-pi-extension` CLI | ~90 min | — | CI and scripted onboarding need `--name` / `--yes` / `--version` without interactive prompts (v0.4.0 goal). |
| **S-09** | Group `@earendil-works/*` Dependabot updates | ~30 min | — | Current multi-ecosystem group bundles npm + Actions; Pi SDK bumps deserve a dedicated group to reduce review noise. |
| **S-10** | Apply `npm pkg fix` and verify publish warning clears | ~30 min | — | Publish logs warn about auto-corrected `package.json`; fixing metadata prevents silent drift (TD-08). |

### Seed detail + acceptance criteria

**S-01 — Add `ROADMAP.md`** ✅
- [x] `ROADMAP.md` exists at repo root and is linked from `README.md` (Docs section).
- [x] `npm run ci` passes; `scaffold/package-readme.md` cross-link considered.
- [x] Status snapshot, priorities, and ≥3 seeds with acceptance criteria present.
- *Status: ✅ complete — `ROADMAP.md` added and linked from `README.md` in PR #63 (DOT-858).*

**S-02 — Diagnose + clarify `publish.yml` `E404` failure** ✅
- [x] `publish.yml` distinguishes "package name not registered on npm" from "version already published" and prints an actionable message for the former.
- [x] `docs/release.md` gains a "First publish / Trusted Publisher not configured" troubleshooting subsection.
- [x] CI still green. (Does **not** perform the publish — that is human-owned.)
- *Status: ✅ complete — publish diagnostics and release troubleshooting shipped in PR #73 (DOT-1228); ROADMAP reconciliation and doc regression guard in DOT-1744.*

**S-03 — README must not advertise a 404 npm package** ✅
- [x] npm badge + Quick start point at the live `create-pi-extension` package on npm.
- [x] No install/quick-start command advertises the legacy `pi-extension-template` npm name.
- [x] `npm run ci` passes.
- *Status: ✅ complete — README install paths use `create-pi-extension@latest`, root `package.json` is marked `private`, and sync tests guard npm badge targets (DOT-1539).*

**S-04 — Reconcile `CHANGELOG.md`** ✅
- [x] Every `[x.y.z]` header that shipped has a real ISO date.
- [x] No duplicate `### Changed` blocks under `Unreleased`; released items under their version headers.
- [x] `npm run ci` passes.
- *Status: ✅ complete — CHANGELOG structure reconciled in PR #105 (DOT-1693).*

**S-05 — Remove stale follow-up issue references from docs** ✅
- [x] `grep -rn "DOT-710\|05-implement-create-pi-extension-cli\|follow-up issue \`[0-9]" docs/` returns nothing stale.
- [x] Cross-links point to current docs or are removed.
- [x] `npm run ci` passes.
- *Status: ✅ complete — stale DOT-710 reference removed from `docs/template-sync.md`; regression test added in `tests/smoke.test.mjs` (DOT-1218).*

**S-06 — Extension entrypoint shape assertion test** ✅
- [x] A test loads each `pi.extensions` entrypoint and asserts a function-valued default export, then invokes it with a proxy API object.
- [x] Test fails loudly if an entrypoint regresses; runs in CI.
- [x] `npm run ci` passes.
- *Status: ✅ complete — runtime entrypoint shape coverage added in PR #117.*

**S-07 — Consolidate bootstrap docs**
- [ ] `docs/github-template.md` and `docs/repository-settings.md` folded into `docs/template-checklist.md` (or removed) per minimal-docs policy.
- [ ] No broken internal links; `README.md` Docs section updated.
- [ ] `npm run ci` passes (including `pack:check` file list).

**S-08 — Non-interactive CLI flags**
- [ ] `create-pi-extension --version` prints the package version.
- [ ] `--name <pkg>` and `--yes` allow a fully non-interactive scaffold for CI.
- [ ] New CLI test covers the non-interactive path; existing interactive tests still pass.

**S-09 — Grouped Dependabot updates**
- [ ] `.github/dependabot.yml` groups `@earendil-works/*` into a dedicated PR (separate from github-actions).
- [ ] `npm run ci` passes; sample grouped config validated.

**S-10 — Apply `npm pkg fix`**
- [ ] `npm pkg fix` is a no-op on both root and `packages/create-pi-extension` `package.json`.
- [ ] Publish warning ("auto-corrected some errors") does not recur on the next `publish.yml` run.
- [ ] `npm run ci` passes.

---

## 6. How the weekly planner uses this file

1. Read §1 (status) and §4 (debt) to confirm nothing changed since last week.
2. Pick the **first non-struck seed in §5** whose dependencies are met and
   whose ownership allows an AI run (avoid TD-02 — human-owned).
3. Promote it to a backlog issue scoped to the listed acceptance criteria.
4. When the seed's PR merges, strike the row here and record it under the
   target release in §3.

## 7. Conventions

- **Versioning:** the root `package.json` version is the source of truth and is
  synced into `create-pi-extension` on publish. Bump via `npm version
  <patch|minor|major>`; `auto-release.yml` tags and dispatches `publish.yml`.
- **Changelog:** keep `Unreleased` for unreleased work; date every released
  header.
- **Docs:** follow the Pi OSS minimal-docs policy — `docs/` is optional and
  bootstrap docs are delete-or-merge after setup.
- **Publish:** npm Trusted Publishing only. Never add `NPM_TOKEN`. Publish
  actions are human-owned.
