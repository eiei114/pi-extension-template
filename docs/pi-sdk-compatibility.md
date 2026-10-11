## Pi SDK 1.1.0 compatibility

This template is verified against the frozen Pi SDK wave:

- `@earendil-works/pi-agent-core`: `1.1.0`
- `@earendil-works/pi-ai`: `1.1.0`
- `@earendil-works/pi-coding-agent`: `1.1.0`
- `@earendil-works/pi-tui`: `1.1.0`

The packages remain peer dependencies with wildcard ranges; the frozen versions
are dev/test pins only. `StringEnum` from `pi-ai`, TypeBox schemas, explicit
extension entrypoints, `ctx.hasUI`, `prepareArguments`, and the current
`registerTool`/renderer lifecycle are supported by 1.1.0. No deprecated API
replacement was required for this template's extension surface.

Run `npm run smoke:pi` to execute the actual Pi 1.1.0 host in RPC mode and
exercise extension loading, handled and malformed input, process cleanup, and
the Windows/native host boundary. The machine-readable result is committed at
`docs/verification/pi-sdk-smoke.json`; the harness is executed by `npm run ci`.

The report uses `verification_contract=pi-sdk-behavior-v2`. Each case contains
named assertions and captured actual observations. Reload/cleanup parses a second
real Pi host's registration status, handled prompt response and feature notification,
plus clean exit; exit zero alone is insufficient. Parser regressions deliberately
omit each response to prove the harness fails closed. The host-shell case launches
the pinned local CLI through native PowerShell on Windows or `/bin/sh` on POSIX.
The harness resolves the CLI from the installed SDK manifest and checks actual
installed versions against exact dev/test pins, rather than trusting global `pi`.
It uses an isolated temporary agent directory and leaves global Pi settings intact.

The smoke uses an offline deterministic command path, so it does not make paid
model requests. It does not mock Pi's extension loader or lifecycle: the real
`pi` process loads the package and receives RPC input. Provider inference remains
outside this package's compatibility contract.
