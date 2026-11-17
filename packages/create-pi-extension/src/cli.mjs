#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { cwd } from "node:process";
import { collectProjectOptions } from "./prompts.mjs";
import {
  assertOutputDirectoryAvailable,
  cleanupBootstrapDocs,
  resolveOutputDirectory,
  runPostSetup,
  scaffoldProject,
} from "./scaffold.mjs";
import { getGitConfig, parsePackageArg, resolveOwnerSlug } from "./utils.mjs";

function printHelp(write = console.log) {
  write(`Usage: create-pi-extension [options] <package-name>

Scaffold a new Pi extension project.

Examples:
  bunx create-pi-extension my-pi-package
  bunx create-pi-extension @my-scope/my-pi-tool

Options:
  -v, --version                       Print the CLI version
  -y, --yes                           Use defaults without prompts
  -h, --help                          Show this help

Environment:
  CREATE_PI_EXTENSION_YES=1           Use defaults without prompts
  CREATE_PI_EXTENSION_SKIP_POST_SETUP=1   Skip git init and bun install
`);
}

async function main() {
  let packageNameArg;
  let showHelp = false;
  let showVersion = false;
  let useDefaults = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else if (arg === "-v" || arg === "--version") {
      showVersion = true;
    } else if (arg === "-y" || arg === "--yes") {
      useDefaults = true;
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      printHelp(console.error);
      process.exitCode = 1;
      return;
    } else if (packageNameArg === undefined) {
      packageNameArg = arg;
    } else {
      console.error(`Unexpected argument: ${arg}`);
      printHelp(console.error);
      process.exitCode = 1;
      return;
    }
  }

  if (showVersion) {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    console.log(packageJson.version);
    return;
  }

  if (showHelp || !packageNameArg) {
    printHelp();
    if (!showHelp) {
      process.exitCode = 1;
    }
    return;
  }

  if (useDefaults) {
    process.env.CREATE_PI_EXTENSION_YES = "1";
  }

  const { packageName, directoryName } = parsePackageArg(packageNameArg);
  const outputDir = resolveOutputDirectory(cwd(), directoryName);
  assertOutputDirectoryAvailable(outputDir);

  const ownerSlug = resolveOwnerSlug("your-name");

  const defaults = {
    displayName: directoryName,
    description: `Pi package ${packageName}`,
    author:
      process.env.CREATE_PI_EXTENSION_AUTHOR?.trim() ||
      getGitConfig("user.name") ||
      "Pi Developer",
    owner: ownerSlug,
    ownerRepo: `${ownerSlug}/${directoryName}`,
    licenseYear: new Date().getFullYear(),
  };

  const options = await collectProjectOptions({
    packageName,
    directoryName,
    defaults,
  });

  scaffoldProject(outputDir, options);
  const removedDocs = cleanupBootstrapDocs(outputDir);
  runPostSetup(outputDir);

  if (removedDocs.length > 0) {
    console.log("\nRemoved bootstrap docs:");
    for (const doc of removedDocs) {
      console.log(`  - ${doc}`);
    }
  }

  console.log("\nNext steps:");
  console.log(`  1. Enter the project directory: cd ${directoryName}`);
  console.log("  2. Edit extensions/");
  console.log("  3. Run bun run ci");
  console.log("  4. Try pi -e .");
  console.log(`\nCreated ${packageName} at ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
