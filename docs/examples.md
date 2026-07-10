# Examples

This template ships one minimal example for each Pi package resource type.

Scaffold a new project to get a copy of these examples:

```bash
bunx create-pi-extension my-pi-package
```

Then try the examples in your scaffolded project with `pi -e .`.

For a full walkthrough, see the [README](../README.md).

## Extension

`extensions/hello.ts` registers:

- `/template-hello`
- a small session status indicator

Try it with:

```bash
pi -e .
```

Then run:

```txt
/template-hello YourName
```

## Agent Skill

`skills/example-skill/SKILL.md` demonstrates a minimal Agent Skill. Its
frontmatter uses the required `name` and `description` fields plus the optional
`license` field, following the Agent Skills spec that Pi validates against
(see `docs/skills.md`).

Replace it with your real workflow instructions.

## Prompt template

`prompts/example.md` demonstrates a tiny prompt template with one positional
argument (`/example <topic>`). Pi expands templates with `$1`, `$@`, and
`${1:-default}` — it does not support Mustache-style `{{var}}` placeholders.

## Theme

`themes/example-theme.json` ships a complete, loadable dark theme as a starting
point. Pi requires every theme to define all 51 color tokens, so edit the
palette in place rather than trimming tokens. Remove `themes/` (and the
`pi.themes` manifest entry) if your package does not ship themes.

## Typed custom tool

`extensions/index.ts` registers:

- `/template-info`
- `template_greet` custom tool

The tool demonstrates:

- TypeBox object parameters
- a string enum schema via `StringEnum`
- shared logic imported from `lib/greeting.ts`
