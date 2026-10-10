import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const BUN_LOADER = fileURLToPath(new URL("fixtures/extension-entrypoints/loader.mjs", import.meta.url));

test("every pi.extensions entrypoint has a runtime-loadable Pi shape", () => {
  const result = spawnSync("bun", [BUN_LOADER], {
    cwd: ROOT,
    encoding: "utf8",
  });

  assert.equal(
    result.status,
    0,
    `Bun could not load a pi.extensions entrypoint:\n${result.stderr || result.stdout}`,
  );
});
