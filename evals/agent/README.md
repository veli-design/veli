# Veli agent eval

Measures whether coding agents can set up and implement Veli correctly.
This is not part of `pnpm check` beyond the scorer's own unit tests.

## Conditions

Use the **same task prompt** under one condition preamble:

| Condition  | Preamble                 | What the agent can see                    |
| ---------- | ------------------------ | ----------------------------------------- |
| `baseline` | `conditions/baseline.md` | Installed packages and types only         |
| `metadata` | `conditions/metadata.md` | README, `AGENT_GUIDE.md`, `agent/`        |
| `intent`   | `conditions/intent.md`   | Same as metadata, plus the packaged skill |

Start a **new agent conversation per task**. Do not carry context across tasks.

## Run a task

1. Open a throwaway React + Tailwind v4 app. Install `@tradenetcorp/veli-ui` and
   `@tradenetcorp/veli-tokens` from **this checkout** (`pnpm pack` or a workspace
   link) so the eval matches the agent artifacts here. After those files ship, a
   published version that includes `AGENT_GUIDE.md` and `agent/` is also valid.
2. Paste the condition preamble, then only the task `prompt` from `prompts.json`.
   Do not paste `goal`, imports, or scoring rules.
3. Save every generated file into `evals/agent/runs/<condition>/<task-id>/`.
4. Score:

```bash
corepack pnpm eval:agent evals/agent/runs/baseline
```

The scorer fills mechanical checks only. Add a `judgment` integer `0`, `1`, or `2` in each task's `judgment.json`:

```json
{ "score": 2, "notes": "Button for create, Link for help." }
```

- `2` — right component and interactions
- `1` — valid Veli, wrong component or missing a11y
- `0` — invented API, broken setup, or ignored a documented limitation

## Highest-signal first pass

Score tasks `04-tabs-table`, `08-files`, and `11-range` before the full set.
These catch data-driven Tabs, compound Dropzone, and invented range pickers.
