// Parser tests complement, never replace, actual Pi execution.
export const VERIFICATION_CONTRACT = "pi-sdk-behavior-v2";
export const SDK_NAMES = ["@earendil-works/pi-agent-core", "@earendil-works/pi-ai",
  "@earendil-works/pi-coding-agent", "@earendil-works/pi-tui"];
export const UNHANDLED_ERROR_PATTERN = /UnhandledPromiseRejection|uncaught exception|shutdown error/i;
export const EXTENSION_LOAD_ERROR_PATTERN = /Failed to load extension|Error loading extension/i;

export function parseJsonLines(output) {
  return output.split(/\r?\n/).flatMap((line) => {
    if (!line.trim()) return [];
    try { return [JSON.parse(line)]; } catch { return []; }
  });
}

function assertion(id, expected, observed, passed) {
  return { id, expected, observed: JSON.stringify(observed), passed: passed === true };
}

export function behaviorAssertions(name, { responses, fullOutput, exit_code, expectedVersion }) {
  const status = responses.find((row) => row?.type === "extension_ui_request"
    && row.method === "setStatus" && row.statusKey === "template" && row.statusText === "Pi template loaded");
  const prompt = responses.find((row) => row?.type === "response" && row.command === "prompt");
  const notification = responses.find((row) => row?.type === "extension_ui_request" && row.method === "notify"
    && typeof row.message === "string" && row.message.startsWith("Pi extension template loaded."));
  const handled = prompt?.success === true && prompt.data?.disposition === "handled" && !!notification;
  if (name === "extension_load") {
    return [assertion("extension_registered", "Actual Pi emits the template session-start status", status ?? null, !!status)];
  }
  if (name === "happy_path") {
    return [assertion("feature_response", "Template input emits its notification and handled RPC response",
      { prompt: prompt ?? null, notification: notification ?? null }, handled)];
  }
  if (name === "error_path") {
    const parse = responses.find((row) => row?.type === "response" && row.command === "parse");
    return [assertion("handled_error", "Malformed RPC input returns success=false with a parse error",
      parse ?? null, parse?.success === false && typeof parse.error === "string" && parse.error.length > 0)];
  }
  if (name === "reload_cleanup") {
    return [
      assertion("reloaded_extension_registered", "The second isolated Pi host emits template session-start status", status ?? null, !!status),
      assertion("reloaded_feature_response", "The second host handles template input and emits the real feature notification",
        { prompt: prompt ?? null, notification: notification ?? null }, handled),
      assertion("clean_shutdown", "The actual host exits zero without unhandled/shutdown errors",
        { exit_code, errors: UNHANDLED_ERROR_PATTERN.test(fullOutput) }, exit_code === 0 && !UNHANDLED_ERROR_PATTERN.test(fullOutput)),
    ];
  }
  if (name === "host_shell") {
    return [assertion("native_shell_boundary", "Native host shell launches locally pinned Pi and returns its exact version",
      { exit_code, output: fullOutput.trim(), expectedVersion }, exit_code === 0 && fullOutput.trim() === expectedVersion)];
  }
  throw new Error(`Unknown smoke case: ${name}`);
}
