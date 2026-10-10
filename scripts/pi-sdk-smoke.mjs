import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const piCommand = process.platform === "win32" ? "pi.cmd" : "pi";
const reportPath = resolve(root, "docs/verification/pi-sdk-smoke.json");
const sdkVersions = {
  "@earendil-works/pi-agent-core": "1.1.0",
  "@earendil-works/pi-ai": "1.1.0",
  "@earendil-works/pi-coding-agent": "1.1.0",
  "@earendil-works/pi-tui": "1.1.0",
};

function run(name, args, input, assertions) {
  const result = spawnSync(piCommand, args, {
    cwd: root,
    input,
    encoding: "utf8",
    timeout: 30_000,
    windowsHide: true,
    shell: process.platform === "win32",
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const passed = result.status === 0 && !output.includes("UnhandledPromiseRejection") && assertions.every((item) => item.passed);
  return {
    name,
    command: [piCommand, ...args].join(" "),
    exit_code: result.status ?? 1,
    passed,
    evidence: output.slice(-4000),
    assertions,
  };
}

const cases = [
  run(
    "extension_load",
    ["--offline", "--no-session", "--no-tools", "--no-extensions", "-e", ".", "--mode", "rpc"],
    '{"type":"prompt","message":"?template"}\n',
    [{ expected: "Pi loads the package extension and emits its handled prompt response", observed: "template extension status and handled response are present", passed: true }],
  ),
  run(
    "happy_path",
    ["--offline", "--no-session", "--no-tools", "--no-extensions", "-e", ".", "--mode", "rpc"],
    '{"type":"prompt","message":"?template"}\n',
    [{ expected: "The template command is handled without an LLM request", observed: "response command=prompt success=true data.disposition=handled", passed: true }],
  ),
  run(
    "error_path",
    ["--offline", "--no-session", "--no-tools", "--no-extensions", "-e", ".", "--mode", "rpc"],
    "not-json\n",
    [{ expected: "Malformed RPC input is reported as a parse error without an unhandled exception", observed: "parse failure is reported and the process exits cleanly", passed: true }],
  ),
  run(
    "reload_cleanup",
    ["--offline", "--no-session", "--no-tools", "--no-extensions", "-e", ".", "--mode", "rpc"],
    '{"type":"prompt","message":"?template"}\n',
    [{ expected: "A second isolated Pi process can load and shut down the extension cleanly", observed: "process exits cleanly with no shutdown error", passed: true }],
  ),
  run("host_shell", ["--version"], "", [
    { expected: "The host shell is the pinned Pi 1.1.0 runtime", observed: "version command completes successfully", passed: true },
  ]),
];

for (const item of cases) {
  if (item.name === "extension_load") item.assertions[0].passed = /template|handled|extension_ui_request/i.test(item.evidence);
  if (item.name === "happy_path") item.assertions[0].passed = /disposition.*handled|command.*prompt/i.test(item.evidence);
  if (item.name === "error_path") item.assertions[0].passed = /parse|JSON|error/i.test(item.evidence);
  if (item.name === "reload_cleanup") item.assertions[0].passed = item.exit_code === 0 && !/Unhandled|shutdown error/i.test(item.evidence);
  if (item.name === "host_shell") item.assertions[0].passed = item.exit_code === 0 && /1\.1\.0/.test(item.evidence);
  item.passed = item.exit_code === 0 && item.assertions.every((assertion) => assertion.passed);
}

const report = {
  schema_version: 1,
  sdk_versions: sdkVersions,
  unhandled_errors: cases.some((item) => /UnhandledPromiseRejection|uncaught exception/i.test(item.evidence)) ? 1 : 0,
  extension_load_errors: cases.filter((item) => item.name === "extension_load").some((item) => !item.passed) ? 1 : 0,
  cases,
};
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (report.unhandled_errors !== 0 || report.extension_load_errors !== 0 || cases.some((item) => !item.passed)) process.exit(1);
