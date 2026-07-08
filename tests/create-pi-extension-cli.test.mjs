import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI = join(ROOT, "packages", "create-pi-extension", "src", "cli.mjs");

function runCli(packageName, cwd, env = {}) {
  execFileSync(process.execPath, [CLI, packageName], {
    cwd,
    env: {
      ...process.env,
      CREATE_PI_EXTENSION_YES: "1",
      CREATE_PI_EXTENSION_SKIP_POST_SETUP: "1",
      CREATE_PI_EXTENSION_AUTHOR: "Test Author",
      ...env,
    },
    stdio: "pipe",
  });
}

function readProject(cwd, directoryName) {
  const projectDir = join(cwd, directoryName);
  const packageJson = JSON.parse(readFileSync(join(projectDir, "package.json"), "utf8"));
  const readme = readFileSync(join(projectDir, "README.md"), "utf8");
  const license = readFileSync(join(projectDir, "LICENSE"), "utf8");
  return { projectDir, packageJson, readme, license };
}

test("create-pi-extension scaffolds an unscoped package", () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "create-pi-extension-"));
  try {
    runCli("my-pi-package", tempRoot);
    const { packageJson, readme, license } = readProject(tempRoot, "my-pi-package");

    assert.equal(packageJson.name, "my-pi-package");
    assert.equal(packageJson.author, "Test Author");
    assert.match(packageJson.repository.url, /github\.com\/.+\/my-pi-package$/);
    assert.equal(packageJson.scripts.ci, "npm run typecheck && npm test && npm run pack:check");
    assert.equal(packageJson.scripts["sync:template"], undefined);
    assert.match(readme, /my-pi-package/);
    assert.doesNotMatch(readme, /PACKAGE_NAME|OWNER\/REPO|YOUR_NAME/);
    assert.match(license, /Test Author/);
    assert.doesNotMatch(license, /YOUR_NAME/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("create-pi-extension scaffolds a scoped package without extra scope prompt", () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "create-pi-extension-"));
  try {
    runCli("@my-scope/my-pi-tool", tempRoot);
    const { packageJson } = readProject(tempRoot, "my-pi-tool");

    assert.equal(packageJson.name, "@my-scope/my-pi-tool");
    assert.ok(existsSync(join(tempRoot, "my-pi-tool", "package.json")));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("create-pi-extension runs git init and bun install when post-setup is enabled", { timeout: 120_000 }, () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "create-pi-extension-"));
  try {
    execFileSync(process.execPath, [CLI, "post-setup-pkg"], {
      cwd: tempRoot,
      env: {
        ...process.env,
        CREATE_PI_EXTENSION_YES: "1",
        CREATE_PI_EXTENSION_AUTHOR: "Test Author",
      },
      stdio: "pipe",
    });

    const projectDir = join(tempRoot, "post-setup-pkg");
    assert.ok(existsSync(join(projectDir, ".git")));
    assert.ok(existsSync(join(projectDir, "node_modules")));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
