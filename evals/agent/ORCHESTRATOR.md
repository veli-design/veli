# Local handoff orchestrator

This file is for the **parent** agent only.

Do not send this file to a subject agent.
Do not send `prompts.json` goals, import lists, or scoring rules to a subject.
Do not write `judgment.json` yourself. You saw the conditions, so you are not
blind. Use the judge steps below.

## Isolation limit

Local Task subagents share the parent workspace. They can still open the Veli
monorepo if they ignore the forbid rule. For `baseline`, that ruins the run.

If a subject opens `packages/ui` or other monorepo agent docs, mark that run
invalid and run the cell again.

## Steps

### 1. Prepare fixtures once

From the Veli repository root:

```bash
corepack pnpm eval:agent:matrix prepare
```

Use `--force` only when you must rebuild the fixtures.

For the full set, add `--bare`. That also prepares bare fixtures for tasks
marked `"fixture": "bare"` (currently `01-setup`). `start` picks the bare
fixture for those tasks:

```bash
corepack pnpm eval:agent:matrix prepare --bare
```

Optional custom root:

```bash
corepack pnpm eval:agent:matrix prepare --root /tmp/veli-agent-eval
```

### 2. List the cells

Signal set (18 cells):

```bash
corepack pnpm eval:agent:matrix list
```

Full set:

```bash
corepack pnpm eval:agent:matrix list --all
```

### 3. Run each cell

For each `condition` and `task-id` from the list:

#### 3.1 Start the work copy

```bash
corepack pnpm eval:agent:matrix start <condition> <task-id>
```

Read the JSON output. Note `workDir`.

#### 3.2 Launch one fresh subject

Launch one `generalPurpose` Task.

Rules for the parent:

- Do not resume a subject. One Task equals one cell.
- Run at most two Tasks at the same time.
- Do not attach this file, `README.md`, `SCORER_CHECK.md`, or `prompts.json`.
- Do not tell the subject which Veli APIs to use.

Use this Task prompt. Replace the placeholders:

```text
You are the subject agent for one Veli eval run.

Work only in this absolute directory:
<WORK_DIR>

Read and follow:
1. <WORK_DIR>/SUBJECT_INSTRUCTIONS.md
2. <WORK_DIR>/EVAL_PROMPT.md

Hard rules:
- Do not read, search, or open files outside <WORK_DIR>.
- Do not open the Veli monorepo at <MONOREPO_FORBIDDEN>.
- Put new components in src/.
- If the request is not supported, write the explanation in notes.md in <WORK_DIR>.

When you finish, stop. Return a short list of the files you changed.
```

`<MONOREPO_FORBIDDEN>` is the `monorepoForbidden` value from `start`.

#### 3.3 Collect the run

After the Task returns:

```bash
corepack pnpm eval:agent:matrix collect <condition> <task-id>
```

Then start the next cell.

### 4. Judge blind

After all cells:

```bash
corepack pnpm eval:agent:matrix judge
```

Read the JSON output. It lists `instructions` and one path per run in `runs`.
Do not read `keyPath`. Do not open the run folders yourself.

For each run path, launch one fresh `generalPurpose` Task:

- One Task equals one run. Do not resume a judge.
- Run at most two judge Tasks at the same time.
- Do not tell the judge the condition, the task ID, or other runs' results.

Use this Task prompt. Replace the placeholders:

```text
You are a judge for one anonymous Veli eval run.

Read and follow <INSTRUCTIONS>.
Judge only this run folder:
<RUN_DIR>

Do not read, search, or open files outside <RUN_DIR> and <INSTRUCTIONS>.
Write verdict.json in <RUN_DIR>, then stop.
```

Then apply the verdicts:

```bash
corepack pnpm eval:agent:matrix judge-apply
```

If it reports `missing` run IDs, launch a judge Task for each missing run, then
run `judge-apply` again.

### 5. Score

```bash
corepack pnpm eval:agent:matrix score
```

### 6. Stop

Tell the human:

1. Spot-check the model judgments. Read at least one run per task and every run
   where the conditions disagree.
2. Write the live results in a results file, for example `SIGNAL_PASS.md`.
3. Leave `SCORER_CHECK.md` and `FIRST_PASS.md` unchanged.

Do not change judgment scores yourself.
