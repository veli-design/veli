# Agent eval scorer check

This is a check of the scorer, not an agent eval. No coding agent produced
these runs. They were written by hand during the harness fix:

- `baseline` runs contain known failure modes: flat Dropzone props, an invented
  range picker, and `label` on `RadioGroup`
- `discovery` and `metadata` runs contain known-correct solutions

The runs cover tasks `04`, `08`, `11`, and `12`, and predate the
self-contained prompt wording. Totals combine mechanical (`0`–`1`) with
judgment/2 (`0`–`1`), so a task total runs `0`–`2`.

| Condition | Tasks | Mechanical | Judgment | Typecheck |
| --------- | ----- | ---------- | -------- | --------- |
| baseline  | 4     | 0.573      | 0        | 0.25      |
| discovery | 4     | 1.000      | 2        | 1.00      |
| metadata  | 4     | 1.000      | 2        | 1.00      |

## Baseline

| Task           | Mechanical | Judgment | Total | Notes                                                       |
| -------------- | ---------- | -------- | ----- | ----------------------------------------------------------- |
| 04-tabs-table  | 0.625      | 0        | 0.625 | requiredImports, forbiddenImports, requiredSnippets         |
| 08-files       | 0.571      | 0        | 0.571 | requiredSnippets, forbiddenApis, typecheck                  |
| 11-range       | 0.667      | 0        | 0.667 | refusal, typecheck                                          |
| 12-radio-group | 0.429      | 0        | 0.429 | requiredImports, requiredSnippets, forbiddenApis, typecheck |

## Discovery / metadata

| Task           | Mechanical | Judgment | Total |
| -------------- | ---------- | -------- | ----- |
| 04-tabs-table  | 1          | 2        | 2     |
| 08-files       | 1          | 2        | 2     |
| 11-range       | 1          | 2        | 2     |
| 12-radio-group | 1          | 2        | 2     |

## What this shows

The scorer gives every known-good run full marks and marks down every
known-bad run. Typecheck fails three of the four baseline runs; the `04`
baseline uses valid but wrong components, so only the import and snippet
checks catch it.

This check says nothing about whether agents find and follow the Veli docs.
Live runs answer that; record their results in `FIRST_PASS.md`.

Run artifacts live under `evals/agent/runs/` (gitignored). Re-score with:

```bash
node evals/agent/score.mjs evals/agent/runs --fixture /tmp/veli-eval-discovery
```
