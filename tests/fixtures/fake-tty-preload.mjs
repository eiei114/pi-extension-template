// Test fixture preloaded via `node --import` to simulate an interactive
// terminal for the create-pi-extension CLI child process.
//
// `isInteractive()` in packages/create-pi-extension/src/utils.mjs reads
// process.stdin.isTTY and process.stdout.isTTY. Pipes report no isTTY, so a
// plain piped child process cannot exercise the "prompt suppressed on a real
// terminal" contract. This preload marks both streams as TTYs so the CLI
// takes the interactive path unless --yes/-y (or CREATE_PI_EXTENSION_YES=1)
// suppresses prompts. Used with a timeout: a broken flag hangs on a prompt
// and the test fails instead of passing silently.
for (const stream of [process.stdin, process.stdout, process.stderr]) {
  if (stream && stream.isTTY === undefined) {
    Object.defineProperty(stream, "isTTY", { value: true, configurable: true });
  }
}
// clack prompts call stdin.setRawMode(true); a real TTY supports it, pipes do not.
if (typeof process.stdin.setRawMode !== "function") {
  process.stdin.setRawMode = () => process.stdin;
}
