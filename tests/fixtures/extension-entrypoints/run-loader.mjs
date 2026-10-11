import { spawnSync } from "node:child_process";

export function runBunLoader({ cwd, loader, executable = "bun", env = process.env, platform = process.platform }) {
  const options = { cwd, env, encoding: "utf8", timeout: 15000, maxBuffer: 1024 * 1024, windowsHide: true };
  if (platform !== "win32") return spawnSync(executable, [loader], options);
  // Node cannot execute a Windows .cmd/.bat shim with execFile/CreateProcess.
  // Keep the shell command fixed/quoted; reject expansion characters in paths.
  for (const value of [executable, loader]) {
    if (typeof value !== "string" || !value || /["%!\r\n]/.test(value)) throw new Error("Unsafe Windows Bun launch path");
  }
  return spawnSync(`"${executable}" "${loader}"`, { ...options, shell: true });
}
