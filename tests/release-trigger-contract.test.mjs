import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertReleaseTriggerContract } from "../scripts/release-trigger-contract.mjs";

const release = readFileSync(new URL("../.github/workflows/auto-release.yml", import.meta.url), "utf8");
const publish = readFileSync(new URL("../.github/workflows/publish.yml", import.meta.url), "utf8");

test("code merge cannot directly or indirectly trigger release/publication", () => {
  assert.doesNotThrow(() => assertReleaseTriggerContract(release, publish));
  assert.match(publish, /if: steps\.published\.outputs\.skip != 'true'/);
  assert.match(release, /gh workflow run publish\.yml/); // explicit handoff is kept for manual release
  assert.match(release, /require\('\.\/packages\/create-pi-extension\/package\.json'\)\.version/);
  assert.match(publish, /require\('\.\/packages\/create-pi-extension\/package\.json'\)\.version/);
});

test("release version validation rejects leading zeroes in numeric components", () => {
  const pattern = release.match(/grep -Eq '([^']+)'/)?.[1];
  assert.ok(pattern, "release workflow must validate the version with grep -E");
  const stableSemver = new RegExp(pattern);
  for (const version of ["0.0.0", "1.2.3", "10.20.300"]) {
    assert.match(version, stableSemver);
  }
  for (const version of ["01.2.3", "1.02.3", "1.2.03", "1.2", "1.2.3-beta"]) {
    assert.doesNotMatch(version, stableSemver);
  }
});

test("direct main publish, indirect main auto-release and broad tags are rejected", () => {
  assert.throws(() => assertReleaseTriggerContract(release, publish.replace("    tags:", "    branches: [main]\n    tags:")));
  assert.throws(() => assertReleaseTriggerContract(release.replace("  workflow_dispatch:", "  push:\n    branches: [main]"), publish));
  assert.throws(() => assertReleaseTriggerContract(release, publish.replace("'v*.*.*'", "'*'")));
});

test("ambiguous trigger aliases and removed manual main gate fail closed", () => {
  assert.throws(() => assertReleaseTriggerContract(release.replace("on:", "on: *triggers"), publish));
  assert.throws(() => assertReleaseTriggerContract(release.replace(" && github.ref == 'refs/heads/main'", ""), publish));
});
