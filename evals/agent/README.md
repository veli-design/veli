# Veli agent eval

This eval measures whether coding agents set up and use Veli correctly.

The scorer unit tests run in `pnpm check`. The live agent runs do not.

## Terms

| Term             | Meaning                                               |
| ---------------- | ----------------------------------------------------- |
| Condition        | How much Veli agent documentation the agent can see   |
| Task             | One prompt from `prompts.json`                        |
| Fixture          | A throwaway Vite app with packed Veli packages        |
| Run              | One agent conversation for one condition and one task |
| Mechanical score | Automatic checks (`0`–`1`)                            |
| Judgment         | Checklist score from a blind judge (`0`–`2`)          |
| Total            | Mechanical score + judgment ÷ 2 (`0`–`2`)             |
| Signal task      | A task where only the docs state the correct rule     |

## Conditions

Use the same task prompt with each condition preamble.

| Condition   | Preamble                  | What the agent can see                                     |
| ----------- | ------------------------- | ---------------------------------------------------------- |
| `baseline`  | `conditions/baseline.md`  | Installed packages and types only. Agent docs are removed. |
| `discovery` | `conditions/discovery.md` | Full package. No lookup order.                             |
| `metadata`  | `conditions/metadata.md`  | Full package with the lookup order in the preamble.        |

Start a new agent conversation for each run. Do not reuse chat history across tasks.

## Scores

- Mechanical score: `0`–`1` from the applicable automatic checks.
- Judgment: `0`–`2` from the yes/no checks in each task's `judgeChecks`.
- Total: mechanical + judgment ÷ 2. The range is `0`–`2`.

Judgment is 2 × (yes answers ÷ checks), rounded to two decimals. If the run
uses an invented Veli API, judgment is `0`.

## Signal set

The first pass (`04`, `08`, `11`, `12`) gave the same score for all conditions.
The installed types alone were enough. See `FIRST_PASS.md`.

The signal set tests rules that only the docs state. The types allow each
mistake:

| Task              | Documented rule                                     |
| ----------------- | --------------------------------------------------- |
| `15-form-setting` | Use Checkbox, not Switch, for a submitted boolean   |
| `16-undo-toast`   | Keep a toast with an action open (no short timeout) |
| `17-help-link`    | Do not put a link in a Tooltip or `infoTooltip`     |
| `18-tile-links`   | Card `interactive` is visual only. Use a real link  |
| `19-sticky-table` | `stickyHeader` needs a bounded scroll container     |
| `20-loading-form` | Skeleton is decorative. Announce loading separately |

Run these six tasks under all three conditions. That is 18 runs.

`SCORER_CHECK.md` holds hand-written runs that check the scorer only. It is not
evidence about agent behavior. `samples/` holds a pass and a fail sample for each
signal task.

## Local handoff

To reduce repetition, a parent Cursor agent can drive the matrix with
[`ORCHESTRATOR.md`](./ORCHESTRATOR.md) and `evals/agent/matrix.mjs`.

The parent stays in this repository. Each subject is a fresh Task subagent.
The subject edits a work copy outside the repository. The subject receives only
`EVAL_PROMPT.md` and `SUBJECT_INSTRUCTIONS.md`.

```bash
corepack pnpm eval:agent:matrix prepare
corepack pnpm eval:agent:matrix list
corepack pnpm eval:agent:matrix start metadata 15-form-setting
# parent launches one fresh Task against the printed workDir
corepack pnpm eval:agent:matrix collect metadata 15-form-setting
corepack pnpm eval:agent:matrix judge
# parent launches one fresh judge Task per anonymous run
corepack pnpm eval:agent:matrix judge-apply
corepack pnpm eval:agent:matrix score
```

`list` shows the signal set. Add `--all` for all tasks.

For the full set, run `prepare --bare` so `01-setup` starts from a bare fixture.

Local Task subagents still share the parent workspace. If a subject opens
`packages/ui` in this monorepo, the `baseline` run is invalid. Follow
`ORCHESTRATOR.md`. Do not send that file to subjects.

A model writes judgment through the blind judge. A human checks a sample of
those judgments and writes the results file.

The manual procedure below is the source of truth for a single human-run cell.

## Procedure

### 1. Prepare one fixture for each condition

Run these commands from the Veli repository root. Write the fixtures **outside**
this repository.

```bash
node evals/agent/prepare.mjs baseline  /tmp/veli-eval-baseline
node evals/agent/prepare.mjs discovery /tmp/veli-eval-discovery
node evals/agent/prepare.mjs metadata  /tmp/veli-eval-metadata
```

Do not put a fixture inside this repository. If the fixture is inside the repo,
the agent can open `packages/ui` and read the agent docs. That breaks
`baseline`.

What each prepare step does:

- `baseline` packs UI without `agent/` and `AGENT_GUIDE.md`.
- All fixtures include `react-hook-form` and `react-router` for later tasks.

Bare fixtures are for task `01-setup` only. Veli stays in `vendor/` and is not
installed. `src/styles.css` imports Tailwind only:

```bash
node evals/agent/prepare.mjs metadata /tmp/veli-eval-metadata-bare --bare
```

### 2. Run one task

Do these steps for each condition and each task.

#### 2.1 Make a clean work copy

Keep the prepared fixture clean. Copy it before each run:

```bash
rm -rf /tmp/veli-run
cp -R /tmp/veli-eval-metadata /tmp/veli-run
```

Replace `metadata` with the condition you are running.

- `/tmp/veli-eval-metadata` stays clean for the next run.
- `/tmp/veli-run` is the disposable project for this conversation.

#### 2.2 Start the agent on the work copy

Open a new agent conversation.

Point the agent at `/tmp/veli-run` as the project root. Do not point it at the
Veli monorepo.

#### 2.3 Paste only the allowed text

Paste, in one message:

1. The full contents of `evals/agent/conditions/<condition>.md`
2. Only the task `prompt` from `evals/agent/prompts.json`

Do not paste `goal`, `requireImports`, snippets, or scoring rules.

Do not tell the agent which Veli APIs to use.

If the agent asks a question that would reveal the answer, do not answer it.
Note that fact when you write judgment.

#### 2.4 Save the run

When the agent finishes:

1. Create `evals/agent/runs/<condition>/<task-id>/`.
2. Copy the whole `src/` folder from `/tmp/veli-run` into that folder as `src/`.
3. For `01-setup`, also copy `package.json`.
4. If the agent answered mainly in prose, for example a refusal, also save
   `notes.md` in that folder.

Then delete `/tmp/veli-run`. Start the next run with a new copy.

### 3. Score the mechanical checks

The agent output lives under `evals/agent/runs/`.

The `--fixture` path is not the dirty work copy. It is a clean installed app
that TypeScript uses to resolve Veli packages. Any non-bare prepared fixture
works. Example:

```bash
corepack pnpm eval:agent evals/agent/runs --fixture /tmp/veli-eval-discovery
```

This command:

1. Reads each saved run under `evals/agent/runs/`
2. Runs the mechanical checks on that code
3. Copies the run code into the fixture and runs `tsc --noEmit`

Score one condition only if you want a smaller report:

```bash
corepack pnpm eval:agent evals/agent/runs/baseline --fixture /tmp/veli-eval-discovery
```

### 4. Add judgment with the blind judge

Do not judge runs in the same thread that ran or compared them.

1. Build the judge packets:

   ```bash
   corepack pnpm eval:agent:matrix judge
   ```

   This copies each run to `judge/runs/run-NNN/` under the eval root, in random
   order. The folder names do not show the condition. Each folder gets a
   `TASK.md` with the task, the yes/no checks, and the Veli guidance for the
   components in the task. The key from run ID to condition goes to
   `judge-key.json`, outside the judge folder.

2. For each run folder, start a new agent conversation. Give it only
   `judge/JUDGE_INSTRUCTIONS.md` and that one run folder. Do not give it the key.
   The judge writes `verdict.json` in the run folder.

3. Apply the verdicts:

   ```bash
   corepack pnpm eval:agent:matrix judge-apply
   ```

   This writes `judgment.json` in each run folder under `evals/agent/runs/`,
   with `"judge": "model"`, each answer, and its quoted evidence.

4. Spot-check. Read at least one run per task, and every run where the
   conditions disagree. If you change an answer, set `"judge": "human"` in that
   `judgment.json` and update `score`.

You can also write `judgment.json` by hand. Use the same `score` range (`0`–`2`)
and set `"judge": "human"`.

Run the score command again. The report then includes totals.

### 5. Record the results

Write the live results in a results file, for example `SIGNAL_PASS.md`. State
the judge model and how many judgments a human checked.

Keep `SCORER_CHECK.md` and `FIRST_PASS.md` unchanged.

## Full set

After the signal set, run the remaining tasks the same way.

Use a bare fixture only for `01-setup`.

Use the same agent product, model, and settings for every run in one comparison.

## Drift guard

When you change `packages/ui/src/<id>.tsx`, update
`packages/ui/agent/components/<id>.json` in the same pull request if the public
API guidance changes.

CI warns through `scripts/check-agent-sidecar-drift.mjs`.
