import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { judgmentFromChecks } from './score.mjs';

const agentDir = fileURLToPath(new URL('.', import.meta.url));
const repoDir = fileURLToPath(new URL('../..', import.meta.url));
const CONDITIONS = ['baseline', 'discovery', 'metadata'];

const JUDGE_INSTRUCTIONS = `# Judge instructions

You judge one anonymous Veli eval run at a time.

## Rules

1. Read only the run folder you were given. Do not open other run folders.
2. Do not guess which condition produced the run. Judge the code and notes only.
3. Read \`TASK.md\` in the run folder. It lists the task, its goal, the checks, and
   the Veli component guidance that applies.
4. Answer every check with \`true\` or \`false\`. Quote the code or note line that
   supports the answer as \`evidence\`.
5. Answer \`false\` when the run does not show the behavior. Do not give credit for
   intent or for comments that describe missing code.
6. Set \`inventedApi\` to \`true\` if the run uses a Veli component, prop, variant,
   or token that the guidance and imports do not support.

## Output

Write \`verdict.json\` in the run folder:

\`\`\`json
{
  "checks": [{ "answer": true, "evidence": "<quoted line>" }],
  "inventedApi": false,
  "notes": "One or two sentences."
}
\`\`\`

The \`checks\` array must have one entry per check, in the same order as \`TASK.md\`.
`;

const SUBJECT_INSTRUCTIONS = `You are the subject agent for one Veli eval run.

## Rules

1. Work only in this project directory. Do not read, search, or open files outside it.
2. Do not open the Veli monorepo or any \`packages/ui\` tree outside this project.
3. Put new components in \`src/\`. Do not create a separate project.
4. Use only public Veli APIs. Do not invent components, props, or token names.
5. If the request is not supported, say so clearly. Write the explanation in \`notes.md\` in this project directory.
6. Follow \`EVAL_PROMPT.md\` in this directory. That file is your only task brief.

## Done

When you finish, stop. Return a short list of the files you changed.
`;

function usage() {
  console.error(`Usage:
  node evals/agent/matrix.mjs prepare [--root <dir>] [--force] [--bare]
  node evals/agent/matrix.mjs list [--all]
  node evals/agent/matrix.mjs start <condition> <task-id> [--root <dir>]
  node evals/agent/matrix.mjs collect <condition> <task-id> [--root <dir>]
  node evals/agent/matrix.mjs score [--root <dir>]
  node evals/agent/matrix.mjs judge [--root <dir>]
  node evals/agent/matrix.mjs judge-apply [--root <dir>]`);
  process.exit(1);
}

function parseArgs(argv) {
  const flags = new Set();
  const options = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') {
      options.root = argv[++i];
      continue;
    }
    if (arg.startsWith('--')) {
      flags.add(arg.slice(2));
      continue;
    }
    positionals.push(arg);
  }
  return { flags, options, positionals };
}

function defaultRoot() {
  return path.join(tmpdir(), 'veli-agent-eval');
}

function resolveRoot(options) {
  return path.resolve(options.root ?? defaultRoot());
}

function loadPrompts() {
  return JSON.parse(readFileSync(path.join(agentDir, 'prompts.json'), 'utf8'));
}

function findTask(taskId) {
  const { tasks } = loadPrompts();
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) {
    throw new Error(`Unknown task: ${taskId}`);
  }
  return task;
}

function fixtureDir(root, condition, bare = false) {
  return path.join(root, 'fixtures', bare ? `${condition}-bare` : condition);
}

function workDir(root, condition, taskId) {
  return path.join(root, 'work', condition, taskId);
}

function runDir(condition, taskId) {
  return path.join(agentDir, 'runs', condition, taskId);
}

function runNode(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`node ${args.join(' ')} exited ${code}`)),
    );
  });
}

async function prepareFixtures(root, force, includeBare) {
  mkdirSync(root, { recursive: true });
  const variants = includeBare ? [false, true] : [false];
  for (const condition of CONDITIONS) {
    for (const bare of variants) {
      const target = fixtureDir(root, condition, bare);
      if (existsSync(target)) {
        if (!force) {
          console.log(`Skip existing fixture: ${target}`);
          continue;
        }
        rmSync(target, { recursive: true, force: true });
      }
      console.log(`Preparing ${bare ? 'bare ' : ''}${condition} → ${target}`);
      const args = [path.join(agentDir, 'prepare.mjs'), condition, target];
      if (bare) args.push('--bare');
      await runNode(args, repoDir);
    }
  }
  console.log(`Fixtures ready under ${path.join(root, 'fixtures')}`);
}

function listCells(signalOnly) {
  const { tasks, signalTasks } = loadPrompts();
  const selected = signalOnly
    ? signalTasks.map((id) => {
        const task = tasks.find((entry) => entry.id === id);
        if (!task) throw new Error(`Missing signal task: ${id}`);
        return task;
      })
    : tasks;

  const cells = [];
  for (const condition of CONDITIONS) {
    for (const task of selected) {
      cells.push({ condition, taskId: task.id, title: task.title });
    }
  }
  return cells;
}

function startCell(root, condition, taskId) {
  if (!CONDITIONS.includes(condition)) {
    throw new Error(`Unknown condition: ${condition}`);
  }
  const task = findTask(taskId);
  const bare = task.fixture === 'bare';
  const source = fixtureDir(root, condition, bare);
  if (!existsSync(source)) {
    throw new Error(
      `Missing ${bare ? 'bare ' : ''}fixture for ${condition}. Run: node evals/agent/matrix.mjs prepare${bare ? ' --bare' : ''}`,
    );
  }

  const work = workDir(root, condition, taskId);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(path.dirname(work), { recursive: true });
  cpSync(source, work, { recursive: true });

  const preamble = readFileSync(
    path.join(agentDir, 'conditions', `${condition}.md`),
    'utf8',
  ).trim();
  const evalPrompt = `${preamble}\n\n## Task\n\n${task.prompt.trim()}\n`;
  writeFileSync(path.join(work, 'EVAL_PROMPT.md'), evalPrompt);
  writeFileSync(path.join(work, 'SUBJECT_INSTRUCTIONS.md'), SUBJECT_INSTRUCTIONS);

  console.log(
    JSON.stringify(
      {
        condition,
        taskId,
        bare,
        workDir: work,
        evalPrompt: path.join(work, 'EVAL_PROMPT.md'),
        subjectInstructions: path.join(work, 'SUBJECT_INSTRUCTIONS.md'),
        monorepoForbidden: repoDir,
      },
      null,
      2,
    ),
  );
}

function collectCell(root, condition, taskId) {
  if (!CONDITIONS.includes(condition)) {
    throw new Error(`Unknown condition: ${condition}`);
  }
  findTask(taskId);
  const work = workDir(root, condition, taskId);
  if (!existsSync(work)) {
    throw new Error(`Missing work copy: ${work}. Run start first.`);
  }

  const dest = runDir(condition, taskId);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });

  const srcDir = path.join(work, 'src');
  if (!existsSync(srcDir)) {
    throw new Error(`Work copy has no src/: ${work}`);
  }
  cpSync(srcDir, path.join(dest, 'src'), { recursive: true });

  if (taskId === '01-setup') {
    const packageJson = path.join(work, 'package.json');
    if (existsSync(packageJson)) {
      cpSync(packageJson, path.join(dest, 'package.json'));
    }
  }

  for (const notesName of ['notes.md', path.join('src', 'notes.md')]) {
    const notesPath = path.join(work, notesName);
    if (existsSync(notesPath)) {
      cpSync(notesPath, path.join(dest, 'notes.md'));
      break;
    }
  }

  console.log(
    JSON.stringify(
      {
        condition,
        taskId,
        runDir: dest,
      },
      null,
      2,
    ),
  );
}

async function scoreRuns(root) {
  const discovery = fixtureDir(root, 'discovery');
  const metadata = fixtureDir(root, 'metadata');
  const fixture = existsSync(discovery) ? discovery : metadata;
  if (!existsSync(fixture)) {
    throw new Error(`Missing typecheck fixture under ${path.join(root, 'fixtures')}. Run prepare.`);
  }
  const runs = path.join(agentDir, 'runs');
  if (!existsSync(runs)) {
    throw new Error(`No runs directory at ${runs}`);
  }
  await runNode([path.join(agentDir, 'score.mjs'), runs, '--fixture', fixture], repoDir);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sidecarGuidance(task) {
  const slugs = [
    ...new Set([
      ...(task.requireImports ?? []),
      ...(task.forbidImports ?? []),
      ...(task.acceptedImports ?? []),
    ]),
  ];
  return slugs
    .map((slug) => {
      const sidecarPath = path.join(repoDir, 'packages/ui/agent/components', `${slug}.json`);
      if (!existsSync(sidecarPath)) return null;
      const sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'));
      const lines = [
        ...(sidecar.avoidWhen ?? []).map(
          (entry) => `- Avoid: ${entry.situation} ${entry.guidance}`,
        ),
        ...(sidecar.limitations ?? []).map((entry) => `- Limitation: ${entry}`),
        ...(sidecar.approvedPatterns ?? []).map((entry) => `- Pattern: ${entry}`),
        ...(sidecar.accessibility ?? []).map((entry) => `- Accessibility: ${entry}`),
      ];
      return `### ${slug}\n\n${lines.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function collectRunCells() {
  const runsRoot = path.join(agentDir, 'runs');
  if (!existsSync(runsRoot)) throw new Error(`No runs directory at ${runsRoot}`);
  const { tasks } = loadPrompts();
  const cells = [];
  for (const condition of CONDITIONS) {
    const conditionDir = path.join(runsRoot, condition);
    if (!existsSync(conditionDir)) continue;
    for (const taskDir of readdirSync(conditionDir, { withFileTypes: true })) {
      const task = tasks.find((entry) => entry.id === taskDir.name);
      if (taskDir.isDirectory() && task) {
        cells.push({ condition, task });
      }
    }
  }
  return cells;
}

function buildJudgePackets(root) {
  const judgeDir = path.join(root, 'judge');
  const keyPath = path.join(root, 'judge-key.json');
  rmSync(judgeDir, { recursive: true, force: true });
  mkdirSync(path.join(judgeDir, 'runs'), { recursive: true });
  writeFileSync(path.join(judgeDir, 'JUDGE_INSTRUCTIONS.md'), JUDGE_INSTRUCTIONS);

  const key = {};
  const cells = shuffle(collectRunCells());
  cells.forEach(({ condition, task }, index) => {
    const runId = `run-${String(index + 1).padStart(3, '0')}`;
    const source = runDir(condition, task.id);
    const target = path.join(judgeDir, 'runs', runId);
    cpSync(source, target, {
      recursive: true,
      filter: (file) => !['judgment.json', 'verdict.json'].includes(path.basename(file)),
    });
    const checkList = task.judgeChecks.map((check, i) => `${i + 1}. ${check}`).join('\n');
    writeFileSync(
      path.join(target, 'TASK.md'),
      `# Task\n\n${task.prompt}\n\n## Goal\n\n${task.goal}\n\n## Checks\n\n${checkList}\n\n## Veli guidance\n\n${sidecarGuidance(task)}\n`,
    );
    key[runId] = { condition, taskId: task.id };
  });

  writeFileSync(keyPath, `${JSON.stringify(key, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        judgeDir,
        instructions: path.join(judgeDir, 'JUDGE_INSTRUCTIONS.md'),
        runs: Object.keys(key).map((runId) => path.join(judgeDir, 'runs', runId)),
        keyPath,
      },
      null,
      2,
    ),
  );
}

function applyVerdicts(root) {
  const judgeDir = path.join(root, 'judge');
  const keyPath = path.join(root, 'judge-key.json');
  if (!existsSync(keyPath)) throw new Error(`Missing ${keyPath}. Run judge first.`);
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  const { tasks } = loadPrompts();
  const missing = [];
  const applied = [];

  for (const [runId, { condition, taskId }] of Object.entries(key)) {
    const verdictPath = path.join(judgeDir, 'runs', runId, 'verdict.json');
    if (!existsSync(verdictPath)) {
      missing.push(runId);
      continue;
    }
    const task = tasks.find((entry) => entry.id === taskId);
    const verdict = JSON.parse(readFileSync(verdictPath, 'utf8'));
    if (!Array.isArray(verdict.checks) || verdict.checks.length !== task.judgeChecks.length) {
      throw new Error(
        `${runId}: expected ${task.judgeChecks.length} check answers, got ${verdict.checks?.length ?? 0}`,
      );
    }
    const answers = verdict.checks.map((entry) => entry.answer === true);
    const judgment = {
      score: judgmentFromChecks(answers, verdict.inventedApi === true),
      judge: 'model',
      blind: true,
      inventedApi: verdict.inventedApi === true,
      checks: task.judgeChecks.map((question, i) => ({
        question,
        answer: answers[i],
        evidence: verdict.checks[i].evidence ?? '',
      })),
      notes: verdict.notes ?? '',
    };
    writeFileSync(
      path.join(runDir(condition, taskId), 'judgment.json'),
      `${JSON.stringify(judgment, null, 2)}\n`,
    );
    applied.push({ runId, condition, taskId, score: judgment.score });
  }

  console.log(JSON.stringify({ applied, missing }, null, 2));
  if (missing.length) process.exitCode = 1;
}

const { flags, options, positionals } = parseArgs(process.argv.slice(2));
const [command, ...rest] = positionals;
if (!command) usage();

const root = resolveRoot(options);

try {
  switch (command) {
    case 'prepare':
      await prepareFixtures(root, flags.has('force'), flags.has('bare'));
      break;
    case 'list': {
      const signalOnly = !flags.has('all');
      const cells = listCells(signalOnly);
      for (const cell of cells) {
        console.log(`${cell.condition}\t${cell.taskId}\t${cell.title}`);
      }
      console.error(`${cells.length} cells (${signalOnly ? 'signal' : 'all'})`);
      break;
    }
    case 'judge':
      buildJudgePackets(root);
      break;
    case 'judge-apply':
      applyVerdicts(root);
      break;
    case 'start': {
      const [condition, taskId] = rest;
      if (!condition || !taskId) usage();
      startCell(root, condition, taskId);
      break;
    }
    case 'collect': {
      const [condition, taskId] = rest;
      if (!condition || !taskId) usage();
      collectCell(root, condition, taskId);
      break;
    }
    case 'score':
      await scoreRuns(root);
      break;
    default:
      usage();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
