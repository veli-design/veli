import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const agentDir = fileURLToPath(new URL('.', import.meta.url));
const repoDir = fileURLToPath(new URL('../..', import.meta.url));

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const PROSE_EXTENSIONS = new Set(['.md', '.txt']);
const NON_COMPONENT_EXPORTS = new Set([
  './package.json',
  './tailwind',
  './manifest',
  './theme-script',
  './form',
]);

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export function judgmentFromChecks(answers, inventedApi) {
  if (inventedApi || answers.length === 0) return 0;
  const yes = answers.filter(Boolean).length;
  return Number(((2 * yes) / answers.length).toFixed(2));
}

export async function loadEvalConfig() {
  const prompts = await readJson(path.join(agentDir, 'prompts.json'));
  const uiPackage = await readJson(path.join(repoDir, 'packages/react/package.json'));
  const allowedSlugs = new Set(
    Object.keys(uiPackage.exports)
      .filter((exportPath) => !NON_COMPONENT_EXPORTS.has(exportPath))
      .map((exportPath) => exportPath.slice(2)),
  );
  allowedSlugs.add('tailwind');
  allowedSlugs.add('form');
  allowedSlugs.add('theme-script');
  return { prompts, allowedSlugs };
}

async function collectFiles(dir, extensions) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, extensions)));
      continue;
    }
    if (entry.name === 'judgment.json' || entry.name === 'package.json') continue;
    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractVeliImports(source) {
  return [...source.matchAll(/from\s+['"]@veli-design\/react(?:\/([a-z0-9-]+))?['"]/g)].map(
    (match) => match[1] ?? '',
  );
}

function hasBarrelImport(source) {
  return /from\s+['"]@veli-design\/react['"]/.test(source);
}

function checkSnippets(source, snippets) {
  return snippets.filter((snippet) => !source.includes(snippet));
}

function presentSnippets(source, snippets) {
  return snippets.filter((snippet) => source.includes(snippet));
}

function checkPatterns(source, patterns) {
  return patterns.filter((pattern) => !new RegExp(pattern).test(source));
}

function countComponentUsage(source, name) {
  const importCount = [...source.matchAll(new RegExp(`\\b${name}\\b(?=\\s*[,}])`, 'g'))].length;
  const jsxCount = [...source.matchAll(new RegExp(`<${name}\\b`, 'g'))].length;
  return Math.max(importCount > 0 ? 1 : 0, jsxCount);
}

function hasInventedComponent(source, names) {
  return names.some((name) => {
    const importHit = new RegExp(
      String.raw`import\s*{[^}]*\b${name}\b[^}]*}\s*from\s*['"]@veli-design/react(?:/|['"])`,
    ).test(source);
    const jsxHit = new RegExp(`<${name}\\b`).test(source);
    return importHit || jsxHit;
  });
}

function countHexColorHits(source) {
  const classHits = (
    source.match(
      /(?:bg|text|border|ring|fill|stroke)-(?:\[#[0-9a-fA-F]{3,8}\]|gray-\d{2,3}|slate-\d{2,3}|zinc-\d{2,3}|neutral-\d{2,3}|stone-\d{2,3}|red-\d{2,3}|orange-\d{2,3}|amber-\d{2,3}|yellow-\d{2,3}|lime-\d{2,3}|green-\d{2,3}|emerald-\d{2,3}|teal-\d{2,3}|cyan-\d{2,3}|sky-\d{2,3}|blue-\d{2,3}|indigo-\d{2,3}|violet-\d{2,3}|purple-\d{2,3}|fuchsia-\d{2,3}|pink-\d{2,3}|rose-\d{2,3})/g,
    ) ?? []
  ).length;
  const styleHits = (source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length;
  return classHits + styleHits;
}

function packageSatisfies(requirePackages, packageJsonSource) {
  if (!requirePackages?.length) return true;
  if (!packageJsonSource) return false;
  let manifest;
  try {
    manifest = JSON.parse(packageJsonSource);
  } catch {
    return false;
  }
  const deps = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
  };
  return requirePackages.every((name) => Boolean(deps[name]));
}

export function scoreSource({ task, codeSource, proseSource, allowedSlugs, packageJsonSource }) {
  const imports = extractVeliImports(codeSource);
  const unknownImports = [...new Set(imports.filter((slug) => slug && !allowedSlugs.has(slug)))];
  const importedSlugs = [...new Set(imports.filter(Boolean))];
  const missingImports = (task.requireImports ?? []).filter(
    (slug) => !importedSlugs.includes(slug),
  );
  const forbiddenImports = (task.forbidImports ?? []).filter((slug) =>
    importedSlugs.includes(slug),
  );
  const missingSnippets = checkSnippets(codeSource, task.requireSnippets ?? []);
  const missingPatterns = checkPatterns(codeSource, task.requirePatterns ?? []);
  const forbiddenPatterns = (task.forbidPatterns ?? []).filter((pattern) =>
    new RegExp(pattern).test(codeSource),
  );
  const forbiddenHits = presentSnippets(codeSource, task.sharedForbidSnippets ?? []).filter(
    (snippet) => !['RangeDatePicker', 'DateRangePicker'].includes(snippet),
  );
  const onClickHits = (codeSource.match(/\sonClick=/g) ?? []).length;
  const hexColorHits = countHexColorHits(codeSource);
  const hasProvider = codeSource.includes('VeliProvider');
  const refused =
    /not (?:currently )?supported|does not (?:export|include|provide)|no Veli range|RangeCalendar/i.test(
      `${codeSource}\n${proseSource}`,
    );
  const inventedRange = hasInventedComponent(codeSource, ['RangeDatePicker', 'DateRangePicker']);
  const datePickerUses = countComponentUsage(codeSource, 'DatePicker');
  const hasRangeCalendar = importedSlugs.includes('calendar') && /RangeCalendar/.test(codeSource);
  const acceptedRangeWorkaround =
    refused || hasRangeCalendar || (datePickerUses >= 2 && !inventedRange);
  const packagesOk = packageSatisfies(task.requirePackages, packageJsonSource);
  const acceptedImportsOk =
    !task.acceptedImports?.length ||
    refused ||
    task.acceptedImports.some((slug) => importedSlugs.includes(slug));

  /** @type {Record<string, boolean | null>} */
  const checks = {
    allowlist: unknownImports.length === 0 && !hasBarrelImport(codeSource),
    requiredImports: task.requireImports?.length ? missingImports.length === 0 : null,
    forbiddenImports: task.forbidImports?.length ? forbiddenImports.length === 0 : null,
    requiredSnippets:
      task.requireSnippets?.length || task.requirePatterns?.length
        ? missingSnippets.length === 0 && missingPatterns.length === 0
        : null,
    forbiddenApis:
      forbiddenHits.length === 0 && onClickHits === 0 && forbiddenPatterns.length === 0,
    tokens: hexColorHits === 0,
    provider: task.requireProvider ? hasProvider : null,
    packages: task.requirePackages?.length ? packagesOk : null,
    refusal: task.expectRefusal
      ? acceptedRangeWorkaround && !inventedRange && acceptedImportsOk
      : null,
  };

  if (task.expectRefusal) {
    checks.requiredImports = null;
    checks.requiredSnippets = null;
  }

  const expectsCode = Boolean(
    task.requireImports?.length ||
    task.requireSnippets?.length ||
    task.requirePatterns?.length ||
    task.requirePackages?.length ||
    task.requireProvider,
  );
  const hasCode = codeSource.trim().length > 0;
  const hasProse = proseSource.trim().length > 0;
  if (expectsCode) {
    checks.hasCode = hasCode;
  } else if (task.expectRefusal) {
    checks.hasCode = hasCode || hasProse;
  }

  const applicable = Object.entries(checks).filter(([, value]) => value !== null);
  const passed = applicable.filter(([, value]) => value).length;
  const total = applicable.length;
  const emptyWhenRequired =
    (expectsCode && !hasCode) || (task.expectRefusal && !hasCode && !hasProse);
  const mechanical = emptyWhenRequired ? 0 : total === 0 ? 0 : Number((passed / total).toFixed(3));

  return {
    id: task.id,
    title: task.title,
    mechanical,
    checks,
    importedSlugs,
    unknownImports,
    missingImports,
    forbiddenImports,
    missingSnippets,
    missingPatterns,
    forbiddenPatterns,
    forbiddenHits,
    onClickHits,
    hexColorHits,
    hasProvider,
    refused,
    inventedRange,
    hasBarrelImport: hasBarrelImport(codeSource),
    packagesOk,
  };
}

async function runTypecheck(taskDir, fixtureDir) {
  if (!fixtureDir) return null;
  const typecheckRoot = path.join(fixtureDir, '.eval-typecheck');
  await fs.rm(typecheckRoot, { recursive: true, force: true });
  const targetDir = path.join(typecheckRoot, path.basename(taskDir));
  await fs.mkdir(targetDir, { recursive: true });

  const codeFiles = await collectFiles(taskDir, CODE_EXTENSIONS);
  if (codeFiles.length === 0) {
    return null;
  }
  for (const filePath of codeFiles) {
    const relative = path.relative(taskDir, filePath);
    const destination = path.join(targetDir, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(filePath, destination);
  }

  return await new Promise((resolve) => {
    const tscEntry = path.join(fixtureDir, 'node_modules', 'typescript', 'bin', 'tsc');
    const child = spawn(process.execPath, [tscEntry, '--noEmit', '-p', 'tsconfig.json'], {
      cwd: fixtureDir,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', () => resolve({ passed: false, output: 'failed to start tsc' }));
    child.on('exit', (code) => {
      resolve({
        passed: code === 0,
        output: `${stdout}${stderr}`.trim(),
      });
    });
  });
}

export async function scoreDirectory(
  dir,
  task,
  allowedSlugs,
  sharedForbidSnippets,
  { fixtureDir } = {},
) {
  const codeFiles = await collectFiles(dir, CODE_EXTENSIONS);
  const proseFiles = await collectFiles(dir, PROSE_EXTENSIONS);
  const codeSource = (
    await Promise.all(codeFiles.map((filePath) => fs.readFile(filePath, 'utf8')))
  ).join('\n');
  const proseSource = (
    await Promise.all(proseFiles.map((filePath) => fs.readFile(filePath, 'utf8')))
  ).join('\n');

  let packageJsonSource = null;
  try {
    packageJsonSource = await fs.readFile(path.join(dir, 'package.json'), 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let judgment = null;
  let judgeSource = null;
  try {
    const judgmentFile = await readJson(path.join(dir, 'judgment.json'));
    judgment = judgmentFile.score ?? null;
    judgeSource = judgmentFile.judge ?? 'unspecified';
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const result = scoreSource({
    task: { ...task, sharedForbidSnippets },
    codeSource,
    proseSource,
    allowedSlugs,
    packageJsonSource,
  });

  const typecheck = await runTypecheck(dir, fixtureDir);
  if (typecheck) {
    result.checks.typecheck = typecheck.passed;
    const applicable = Object.entries(result.checks).filter(([, value]) => value !== null);
    const passed = applicable.filter(([, value]) => value).length;
    result.mechanical =
      applicable.length === 0 ? 0 : Number((passed / applicable.length).toFixed(3));
    result.typecheck = typecheck;
  } else {
    result.typecheck = null;
  }

  return {
    ...result,
    files: [...codeFiles, ...proseFiles].map((filePath) => path.relative(dir, filePath)),
    judgment,
    judgeSource,
    total:
      judgment == null ? result.mechanical : Number((result.mechanical + judgment / 2).toFixed(3)),
  };
}

function formatTable(results) {
  const header = '| Task | Mechanical | Judgment | Total | Notes |';
  const divider = '| --- | --- | --- | --- | --- |';
  const rows = results.map((result) => {
    const failures = Object.entries(result.checks)
      .filter(([, passed]) => passed === false)
      .map(([name]) => name);
    return `| ${result.id} | ${result.mechanical} | ${result.judgment ?? '—'} | ${result.total} | ${failures.join(', ') || 'pass'} |`;
  });
  return [header, divider, ...rows].join('\n');
}

function summarizeCondition(condition, results) {
  const mechanical =
    results.reduce((sum, result) => sum + result.mechanical, 0) / Math.max(results.length, 1);
  const judgments = results.filter((result) => result.judgment != null);
  const judgment =
    judgments.length === 0
      ? null
      : judgments.reduce((sum, result) => sum + result.judgment, 0) / judgments.length;
  const typechecks = results.filter((result) => result.typecheck);
  const typecheckPassRate =
    typechecks.length === 0
      ? null
      : typechecks.filter((result) => result.typecheck.passed).length / typechecks.length;
  return {
    condition,
    tasks: results.length,
    mechanical: Number(mechanical.toFixed(3)),
    judgment: judgment == null ? null : Number(judgment.toFixed(3)),
    typecheckPassRate: typecheckPassRate == null ? null : Number(typecheckPassRate.toFixed(3)),
  };
}

function formatSummary(summaries) {
  const header = '| Condition | Tasks | Mechanical | Judgment | Typecheck |';
  const divider = '| --- | --- | --- | --- | --- |';
  const rows = summaries.map((summary) => {
    return `| ${summary.condition} | ${summary.tasks} | ${summary.mechanical} | ${summary.judgment ?? '—'} | ${summary.typecheckPassRate ?? '—'} |`;
  });
  return [header, divider, ...rows].join('\n');
}

async function isConditionRunDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const taskDirs = entries.filter((entry) => entry.isDirectory());
  if (taskDirs.length === 0) return false;
  const { prompts } = await loadEvalConfig();
  return taskDirs.every((entry) => prompts.tasks.some((task) => task.id === entry.name));
}

export async function scoreRun(runDir, { fixtureDir } = {}) {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const entries = await fs.readdir(runDir, { withFileTypes: true });
  const childDirs = entries.filter((entry) => entry.isDirectory());

  if (childDirs.length === 0) {
    throw new Error(`No task directories in ${runDir}`);
  }

  const looksLikeAggregate = !(await isConditionRunDir(runDir));
  if (looksLikeAggregate) {
    const summaries = [];
    const reports = [];
    for (const entry of childDirs) {
      const conditionDir = path.join(runDir, entry.name);
      if (!(await isConditionRunDir(conditionDir))) continue;
      const report = await scoreRun(conditionDir, { fixtureDir });
      reports.push(report);
      summaries.push(summarizeCondition(entry.name, report.results));
    }
    if (summaries.length === 0) {
      throw new Error(`No condition run directories in ${runDir}`);
    }
    return {
      runDir,
      results: reports.flatMap((report) => report.results),
      summaries,
      table: reports
        .map((report) => `## ${path.basename(report.runDir)}\n${report.table}`)
        .join('\n\n'),
      summaryTable: formatSummary(summaries),
    };
  }

  const results = [];
  for (const entry of childDirs) {
    const task = prompts.tasks.find((item) => item.id === entry.name);
    if (!task) {
      throw new Error(`Unknown task directory ${entry.name}`);
    }
    results.push(
      await scoreDirectory(
        path.join(runDir, entry.name),
        task,
        allowedSlugs,
        prompts.sharedForbidSnippets,
        { fixtureDir },
      ),
    );
  }

  return {
    runDir,
    results,
    summaries: [summarizeCondition(path.basename(runDir), results)],
    table: formatTable(results),
    summaryTable: formatSummary([summarizeCondition(path.basename(runDir), results)]),
  };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node evals/agent/score.mjs <run-directory> [--fixture <dir>]');
    console.error('Totals combine mechanical (0-1) with judgment/2 (0-1), so total runs 0-2.');
    process.exit(1);
  }

  const fixtureFlag = process.argv.indexOf('--fixture');
  const fixtureDir = fixtureFlag >= 0 ? path.resolve(process.argv[fixtureFlag + 1]) : undefined;
  const report = await scoreRun(path.resolve(target), { fixtureDir });
  if (report.summaryTable) {
    console.log(report.summaryTable);
    console.log('');
  }
  console.log(report.table);
  console.log(
    JSON.stringify(
      { runDir: report.runDir, summaries: report.summaries, results: report.results },
      null,
      2,
    ),
  );
}
