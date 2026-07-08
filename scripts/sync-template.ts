import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const TEMPLATE_DEST = join(ROOT, "packages", "create-pi-extension", "template");
const CLI_PACKAGE_JSON = join(ROOT, "packages", "create-pi-extension", "package.json");

const TOP_LEVEL_EXCLUSIONS = new Set([
  "packages",
  "node_modules",
  ".git",
  "bun.lock",
  "bun.lockb",
]);

function shouldExclude(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  const topLevel = normalized.split("/")[0];
  if (TOP_LEVEL_EXCLUSIONS.has(topLevel)) {
    return true;
  }

  return normalized.split("/").some((segment) => segment === "node_modules" || segment === ".git");
}

function copyDirectory(source: string, destination: string, relativePath = ""): void {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const nextRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    if (shouldExclude(nextRelativePath)) {
      continue;
    }

    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destinationPath, { recursive: true });
      copyDirectory(sourcePath, destinationPath, nextRelativePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}

function stripMonorepoFields(packageJsonPath: string): void {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<string, unknown>;
  delete packageJson.workspaces;
  if (packageJson.scripts && typeof packageJson.scripts === "object") {
    const scripts = { ...(packageJson.scripts as Record<string, string>) };
    delete scripts["sync:template"];
    packageJson.scripts = scripts;
  }
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function syncRepositoryVersion(): void {
  const rootPackageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    version: string;
  };
  const cliPackageJson = JSON.parse(readFileSync(CLI_PACKAGE_JSON, "utf8")) as {
    version: string;
  };
  cliPackageJson.version = rootPackageJson.version;
  writeFileSync(CLI_PACKAGE_JSON, `${JSON.stringify(cliPackageJson, null, 2)}\n`);
}

function main(): void {
  if (existsSync(TEMPLATE_DEST)) {
    rmSync(TEMPLATE_DEST, { recursive: true, force: true });
  }
  mkdirSync(TEMPLATE_DEST, { recursive: true });

  copyDirectory(ROOT, TEMPLATE_DEST);
  stripMonorepoFields(join(TEMPLATE_DEST, "package.json"));
  syncRepositoryVersion();

  const fileCount = countFiles(TEMPLATE_DEST);
  console.log(
    `Synced template to ${relative(ROOT, TEMPLATE_DEST)} (${fileCount} files). Version: ${
      JSON.parse(readFileSync(CLI_PACKAGE_JSON, "utf8")).version
    }`,
  );
}

function countFiles(directory: string): number {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(entryPath);
    } else if (entry.isFile()) {
      count += 1;
    }
  }
  return count;
}

main();
