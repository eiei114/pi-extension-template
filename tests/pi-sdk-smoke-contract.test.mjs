import assert from "node:assert/strict";
import test from "node:test";
import { behaviorAssertions, parseJsonLines, VERIFICATION_CONTRACT } from "../scripts/pi-sdk-smoke-contract.mjs";

const status = { type: "extension_ui_request", method: "setStatus", statusKey: "template", statusText: "Pi template loaded" };
const prompt = { type: "response", command: "prompt", success: true, data: { disposition: "handled" } };
const notification = { type: "extension_ui_request", method: "notify", message: "Pi extension template loaded. Try commands." };
const observed = (responses = [status, prompt, notification], fullOutput = "", exit_code = 0) =>
  ({ responses, fullOutput, exit_code, expectedVersion: "1.1.0" });

test("behavior contract ID and LF/CRLF JSON parsing", () => {
  assert.equal(VERIFICATION_CONTRACT, "pi-sdk-behavior-v2");
  assert.deepEqual(parseJsonLines(`not-json\r\n${JSON.stringify(prompt)}\n\n`), [prompt]);
});

test("reload requires actual second-host status AND feature response, not merely exit zero", () => {
  const good = behaviorAssertions("reload_cleanup", observed());
  assert.deepEqual(good.map((a) => a.id), ["reloaded_extension_registered", "reloaded_feature_response", "clean_shutdown"]);
  assert.ok(good.every((a) => a.passed));
  for (const responses of [[], [prompt, notification], [status], [status, prompt], [status, notification]]) {
    assert.ok(behaviorAssertions("reload_cleanup", observed(responses)).some((a) => !a.passed));
  }
});

test("unhandled, failed, or wrong feature responses fail", () => {
  for (const bad of [{ ...prompt, success: false }, { ...prompt, data: { disposition: "queued" } }, { ...prompt, command: "other" }]) {
    assert.equal(behaviorAssertions("happy_path", observed([status, bad, notification]))[0].passed, false);
    assert.equal(behaviorAssertions("reload_cleanup", observed([status, bad, notification]))[1].passed, false);
  }
});

test("registration status must belong to actual template extension", () => {
  for (const bad of [{ ...status, statusKey: "other" }, { ...status, statusText: "failed" }]) {
    assert.equal(behaviorAssertions("extension_load", observed([bad]))[0].passed, false);
  }
});

test("cleanup requires exit zero AND no runtime/shutdown errors", () => {
  for (const [output, code] of [["shutdown error", 0], ["UnhandledPromiseRejection", 0], ["", 1]]) {
    assert.equal(behaviorAssertions("reload_cleanup", observed(undefined, output, code))[2].passed, false);
  }
});

test("malformed input requires observed handled parse error", () => {
  const error = { type: "response", command: "parse", success: false, error: "Invalid JSON" };
  assert.equal(behaviorAssertions("error_path", observed([error]))[0].passed, true);
  for (const responses of [[], [{ ...error, success: true }], [{ ...error, error: "" }]]) {
    assert.equal(behaviorAssertions("error_path", observed(responses))[0].passed, false);
  }
});

test("native shell returns exact pinned version, not substring/exit alone", () => {
  assert.equal(behaviorAssertions("host_shell", observed([], "1.1.0\r\n"))[0].passed, true);
  for (const value of ["", "11.1.0", "1.1.0 but error", "1.0.0"]) {
    assert.equal(behaviorAssertions("host_shell", observed([], value))[0].passed, false);
  }
});
