import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const BUN_LOADER = String.raw`
  const packageJson = await Bun.file("package.json").json();
  const api = new Proxy({}, { get: () => () => undefined });

  for (const entrypoint of packageJson.pi.extensions) {
    const module = await import(new URL(entrypoint, import.meta.url).href);
    if (typeof module.default !== "function") {
      throw new Error(
        entrypoint +
          " must export a default Pi extension loader function; got " +
          typeof module.default,
      );
    }
    module.default(api);
  }
`;

test("every pi.extensions entrypoint has a runtime-loadable Pi shape", () => {
  const result = spawnSync("bun", ["--eval", BUN_LOADER], {
    cwd: ROOT,
    encoding: "utf8",
  });

  assert.equal(
    result.status,
    0,
    `Bun could not load a pi.extensions entrypoint:\n${result.stderr || result.stdout}`,
  );
});
