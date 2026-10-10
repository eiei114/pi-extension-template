import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Keep Bun input in a file: Windows shim/batch launchers reject multiline --eval argv.
const packageJson = await Bun.file("package.json").json();
const api = new Proxy({}, { get: () => () => undefined });
for (const entrypoint of packageJson.pi.extensions) {
  const module = await import(pathToFileURL(resolve(process.cwd(), entrypoint)).href);
  if (typeof module.default !== "function") {
    throw new Error(`${entrypoint} must export a default Pi extension loader function; got ${typeof module.default}`);
  }
  module.default(api);
}
