// Strict contract for these two owned workflow files, not a general YAML interpreter.
function triggerBlock(content) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line === "on:");
  if (start < 0) throw new Error("Expected explicit multiline on: trigger mapping");
  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && !line.startsWith(" ") && !line.startsWith("#")) break;
    if (line.trim() && !line.trimStart().startsWith("#")) block.push(line);
  }
  return block;
}

export function assertReleaseTriggerContract(release, publish) {
  const manual = triggerBlock(release);
  if (manual.join("\n") !== "  workflow_dispatch:") throw new Error("Release must be explicit workflow_dispatch only");
  if (!release.includes("if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'")) {
    throw new Error("Manual release must be limited to selected main");
  }
  const block = triggerBlock(publish);
  const events = block.filter((line) => /^ {2}\S/.test(line)).map((line) => line.trim());
  if (JSON.stringify(events) !== JSON.stringify(["push:", "release:", "workflow_dispatch:"])) {
    throw new Error("Publish may only use tag push, published release, or explicit dispatch");
  }
  const push = block.slice(1, block.findIndex((line) => line === "  release:"));
  if (JSON.stringify(push) !== JSON.stringify(["    tags:", "      - 'v*.*.*'"])) {
    throw new Error("Publish push must contain only version tags, never main branches/paths");
  }
}
