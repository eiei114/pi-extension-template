# Examples

This template ships examples for each Pi package resource type and several extension API patterns.

## Extension event handlers

`extensions/hello.ts` registers:

- `/template-hello`
- session lifecycle handlers (`session_start`, `before_agent_start`, `input`, `tool_call`, `tool_result`)
- a small session status indicator

Try it with:

```bash
pi -e .
```

Then run:

```txt
/template-hello YourName
?template
```

## Typed custom tool

`extensions/index.ts` registers:

- `/template-info`
- `template_greet` custom tool

The tool demonstrates:

- `defineTool()` with TypeBox object parameters
- a string enum schema via `StringEnum`
- shared logic imported from `lib/greeting.ts`
- TUI `renderCall` / `renderResult` via `Text`

## Agent Skill (package manifest)

`skills/example-skill/SKILL.md` demonstrates a minimal Agent Skill discovered from `package.json` (`pi.skills`).

Replace it with your real workflow instructions.

## Agent Skill (extension `resources_discover`)

`extensions/skill-bridge/` contributes `template-skill-bridge` at runtime:

- `index.ts` returns `skillPaths` from the `resources_discover` event
- `SKILL.md` lives beside the extension entrypoint

Commands:

```txt
/template-skill-info
/skill:template-skill-bridge
```

Use this pattern when a skill should ship with an extension instead of the top-level `skills/` directory.

## TUI component composition

`extensions/tui-dashboard.ts` demonstrates composing `@earendil-works/pi-tui` primitives:

- `Box` for padded, themed containers
- `Loader` for spinner-style progress feedback
- column-aligned tables built with shared `lib/format-table.ts` and rendered via `Text`

Command:

```txt
/template-dashboard
```

`pi-tui` does not ship a dedicated `Table` or `Spinner` component; this example uses `Loader` for spinners and a small table formatter for aligned columns.

## Multi-file extension layout

`extensions/package-layout/` demonstrates a subdirectory extension with local modules:

- `lib/config.ts` — typed configuration defaults
- `lib/stats.ts` — resource metadata helpers
- imports from package-wide `lib/format-table.ts`

Commands:

```txt
/template-layout
/template-layout-clear
```

## Prompt template

`prompts/example.md` demonstrates a tiny prompt template with one variable.

## Theme

`themes/example-theme.json` is a placeholder theme. Replace it or remove `themes/` if your package does not ship themes.

## Shared library helpers

| File | Purpose |
|---|---|
| `lib/greeting.ts` | Greeting helpers used by `template_greet` |
| `lib/format-table.ts` | Monospace table formatter for widgets and TUI examples |
