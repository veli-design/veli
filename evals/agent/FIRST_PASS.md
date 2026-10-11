# Agent eval first pass

Live agent runs for tasks `04`, `08`, `11`, and `12`. Artifacts are under
`evals/agent/runs/` (gitignored).

The harness now uses three conditions: `baseline`, `discovery`, and
`metadata`. An `intent` condition that installed a packaged TanStack skill
was also run on this pass. It added nothing over `metadata`, so the condition
and the skill were removed. Its row below is historical only.

Totals combine mechanical (`0`–`1`) with judgment/2 (`0`–`1`), so a task
total runs `0`–`2`.

## Results

Scores after the scorer fix described below:

| Condition | Tasks | Mechanical | Judgment | Typecheck |
| --------- | ----- | ---------- | -------- | --------- |
| baseline  | 4     | 1.000      | 2        | 1.00      |
| discovery | 4     | 1.000      | 2        | 1.00      |
| metadata  | 4     | 1.000      | 2        | 1.00      |
| intent    | 4     | 1.000      | 2        | 1.00      |

Every run scored the maximum total of `2`.

Approaches differed even though scores did not:

| Task             | baseline                         | discovery                        | metadata                         | intent                              |
| ---------------- | -------------------------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| `04-tabs-table`  | `Table.Header` static parts      | named `TableHeader` parts        | named `TableHeader` parts        | named `TableHeader` parts           |
| `08-files`       | `DropzoneField`                  | compound `Dropzone` parts        | `DropzoneField`                  | `DropzoneField` with `onFileReject` |
| `11-range`       | refused, notes only              | refused + `RangeCalendar`        | refused + `RangeCalendar`        | refused, notes only                 |
| `12-radio-group` | `FieldLabel` inside `RadioGroup` | `FieldLabel` inside `RadioGroup` | `FieldLabel` inside `RadioGroup` | `FieldLabel` inside `RadioGroup`    |

## Scorer fix

The first scoring showed `discovery` ahead (mechanical `1.000` against `0.897`
for baseline and `0.928` for metadata). That gap came from scorer bugs, not
agent behavior:

- `acceptedFileTypes` and `calendarButtonLabel` were forbidden everywhere.
  Both are public props (`DropzoneField` and `DatePicker`).
- Task `08` required the compound Dropzone parts. The Dropzone sidecar also
  approves `DropzoneField`.
- Task `04` required the literal `TableHeader`. `Table.Header` is a valid alias.

The scorer now accepts these. It still rejects `acceptedFileTypes` on
`<Dropzone>` itself, which is the stale flat API.

## What this shows

These four tasks do not separate the conditions. Agents with only the
installed types (`baseline`) did as well as agents with the full agent docs.
Possible reasons:

- The published type declarations are enough for these tasks.
- The tasks are too easy to need the guide or sidecars.
- A local subject read the monorepo docs. Local handoff cannot rule this out
  for `baseline`.

Judgment was written by a separate agent thread, not a human. That judge saw
condition names and compared runs across conditions. It gave `2` to every run,
including runs it noted had no rejection message or a missing field error.

## Next steps

- Add harder tasks where the docs carry information the types do not, such as
  limitations, avoid-when guidance, and composition rules.
- Run `baseline` in a workspace that cannot reach the monorepo.
- Judge runs blind: hide condition names, and judge one run at a time against
  the rubric.

Re-score with:

```bash
corepack pnpm eval:agent:matrix score
```
