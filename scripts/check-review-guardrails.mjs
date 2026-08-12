#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packageJson = readJson(join(ROOT, "package.json"));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function toPosix(path) {
  return path.replaceAll("\\", "/");
}

function walkMarkdown(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(path));
    if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
  }
  return files;
}

function releaseTarget() {
  if (Array.isArray(packageJson.workspaces) && packageJson.workspaces.includes("packages/*")) {
    return {
      args: ["pack", "--dry-run", "--json", "--workspace", "create-pi-extension"],
      lockKey: "packages/create-pi-extension",
      manifest: readJson(join(ROOT, "packages", "create-pi-extension", "package.json")),
      prefix: "template/",
    };
  }
  return { args: ["pack", "--dry-run", "--json"], lockKey: "", manifest: packageJson, prefix: "" };
}

function packedFiles() {
  const target = releaseTarget();
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "npm_execpath is required; run this guard through npm run review:guardrails");
  const output = execFileSync(process.execPath, [npmCli, ...target.args], { cwd: ROOT, encoding: "utf8" });
  const result = JSON.parse(output);
  assert.equal(result.length, 1, "npm pack must return exactly one package");
  return { files: new Set(result[0].files.map((item) => item.path)), prefix: target.prefix };
}

function checkReleaseState() {
  const target = releaseTarget();
  const releasePackage = target.manifest;
  const lockPath = join(ROOT, "package-lock.json");
  if (existsSync(lockPath)) {
    const lock = readJson(lockPath);
    assert.equal(
      lock.packages?.[target.lockKey]?.version,
      releasePackage.version,
      `package-lock packages['${target.lockKey}'] version must match ${releasePackage.name}`,
    );
  }

  const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
  const escaped = releasePackage.version.replaceAll(".", "\\.");
  assert.match(changelog, new RegExp(`^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m"), "CHANGELOG must contain a dated current-version entry");

  for (const path of [join(ROOT, "README.md"), ...walkMarkdown(join(ROOT, "docs"))]) {
    const content = readFileSync(path, "utf8");
    const installPattern = /pi install npm:([^\s`]+)@(\d+\.\d+\.\d+)/g;
    for (const match of content.matchAll(installPattern)) {
      const referencedName = match[1];
      if (referencedName === releasePackage.name) {
        assert.equal(match[2], releasePackage.version, `${relative(ROOT, path)} pins stale package version ${match[2]}`);
      }
    }
  }
}

function checkPackageDocs() {
  const { files, prefix } = packedFiles();
  const sourceRoot = prefix ? join(ROOT, "packages", "create-pi-extension", "template") : ROOT;
  const markdown = [join(sourceRoot, "README.md"), ...walkMarkdown(join(sourceRoot, "docs"))].filter(existsSync);
  for (const source of markdown) {
    const sourceRelative = toPosix(relative(sourceRoot, source));
    assert.ok(files.has(`${prefix}${sourceRelative}`), `${sourceRelative} is documented but absent from npm tarball`);
    const content = readFileSync(source, "utf8");
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#", 1)[0].trim();
      if (!target || /^(?:https?:|mailto:|npm:)/.test(target)) continue;
      const resolved = resolve(dirname(source), decodeURIComponent(target));
      if (!existsSync(resolved)) {
        throw new Error(`${sourceRelative} references missing file ${target}`);
      }
      if (!statSync(resolved).isFile()) continue;
      const targetRelative = toPosix(relative(sourceRoot, resolved));
      assert.ok(files.has(`${prefix}${targetRelative}`), `${sourceRelative} references ${targetRelative}, but npm tarball omits it`);
    }
  }
}

checkReleaseState();
checkPackageDocs();
console.log("Review guardrails G1/G2 passed");
