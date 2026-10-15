## Pi SDK 1.2.0 compatibility

The template is verified against the frozen Pi SDK wave:

- `@earendil-works/pi-agent-core`: `1.2.0`
- `@earendil-works/pi-ai`: `1.2.0`
- `@earendil-works/pi-coding-agent`: `1.2.0`
- `@earendil-works/pi-tui`: `1.2.0`

These are exact dev/test pins only. Public peer dependency ranges remain `*`.
The `StringEnum` and TypeBox schemas, explicit extension entrypoints,
`ctx.hasUI`, `prepareArguments`, `registerTool`, tool renderers, and lifecycle
events used by this template typecheck and load on 1.2.0. The 1.2.0 release
notes do not deprecate or remove any of these APIs.

### 1.2.0 migration notes for downstream templates

The official [Pi v1.2.0 release notes](https://github.com/earendil-works/pi/releases/tag/v1.2.0)
change the `before_agent_start` event for extension-triggered runs:
`BeforeAgentStartEvent` is now a `messageType` union (`user` with `prompt` and
`images`; `custom` with `message` and no `prompt`). Downstream handlers that
read user-only fields should first check `event.messageType === "user"`.
This template only extends the shared `systemPrompt`, so no API migration is
needed here. The session is also busy while startup handlers run; `ctx.isIdle()`
is false and `sendUserMessage()` requires `deliverAs` in that window. The
template does not call either method there.

Pi 1.2.0 also publishes generated configuration schemas and validates startup
themes consistently with reloads. Extensions or themes that customize those
files should use the current [theme and settings guidance](https://github.com/earendil-works/pi/blob/v1.2.0/packages/coding-agent/docs/themes.md)
and schema URLs; the examples here do not rely on deprecated schema fields.

### Runtime verification

Run `npm run smoke:pi` to load the extension in the actual locally pinned Pi
host. `npm run ci` runs this harness as part of the required CI pipeline. The
committed result is `docs/verification/pi-sdk-smoke.json` and uses
`verification_contract=pi-sdk-behavior-v2`.

The harness asserts actual extension registration, the handled feature response,
a handled malformed-input error, a second actual Pi process's registration and
feature response plus clean shutdown, and the native host-shell boundary. The
native shell check launches the pinned CLI via PowerShell on Windows or `/bin/sh`
on POSIX. The harness resolves the CLI from the installed SDK manifest, checks
all four installed versions against exact pins, and uses an isolated temporary
agent directory without changing global Pi settings.

The feature path is deterministic and offline, so verification makes no paid
model requests. Pi's extension loader, host process, RPC handling, extension
lifecycle, and feature response are real rather than mocked; provider inference
is outside this compatibility contract. Contract regression tests also require
the reload case's second-process response fields and reject deliberately missing
or malformed responses.
