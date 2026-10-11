import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runBunLoader } from "./fixtures/extension-entrypoints/run-loader.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const BUN_LOADER = fileURLToPath(new URL("fixtures/extension-entrypoints/loader.mjs", import.meta.url));

test("every pi.extensions entrypoint has a runtime-loadable Pi shape", () => {
  const result = runBunLoader({ cwd: ROOT, loader: BUN_LOADER });

  assert.equal(
    result.status,
    0,
    `Bun could not load a pi.extensions entrypoint:\n${result.stderr || result.stdout}`,
  );
});

test("Windows Bun batch shim and spaced loader path execute without argv corruption", { skip: process.platform !== "win32" }, () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-bun shim-"));
  try {
    const probe = join(dir, "bun-path.mjs");
    writeFileSync(probe, "console.log(process.execPath);\n");
    const resolved = runBunLoader({ cwd: ROOT, loader: probe });
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const bunPath = resolved.stdout.trim();
    assert.ok(bunPath && !/["%!\r\n]/.test(bunPath));
    const shim = join(dir, "bun-shim.cmd");
    writeFileSync(shim, `@"${bunPath}" %*\r\n`);
    const spacedLoader = join(dir, "extension loader.mjs");
    writeFileSync(spacedLoader, readFileSync(BUN_LOADER));
    const previous = spawnSync(shim, [spacedLoader], { cwd: ROOT, encoding: "utf8", timeout: 15000 });
    assert.equal(previous.status, null, "direct Windows .cmd spawning must reproduce the old failure");
    assert.ok(previous.error, "old launcher must fail, not silently skip execution");
    const actual = runBunLoader({ cwd: ROOT, loader: spacedLoader, executable: shim });
    assert.equal(actual.status, 0, actual.stderr || actual.stdout);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Windows Bun launch rejects shell expansion or injected path text", () => {
  for (const unsafe of ['bad"path', "%BUN_PATH%", "bad!path", "bad\npath", "bad\rpath"]) {
    assert.throws(() => runBunLoader({ cwd: ROOT, loader: unsafe, platform: "win32" }), /Unsafe Windows Bun launch path/);
    assert.throws(() => runBunLoader({ cwd: ROOT, loader: BUN_LOADER, executable: unsafe, platform: "win32" }), /Unsafe Windows Bun launch path/);
  }
});
