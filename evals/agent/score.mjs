import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const agentDir = fileURLToPath(new URL('.', import.meta.url));
const repoDir = fileURLToPath(new URL('../..', import.meta.url));

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function loadEvalConfig() {
  const prompts = await readJson(path.join(agentDir, 'prompts.json'));
  const uiPackage = await readJson(path.join(repoDir, 'packages/ui/package.json'));
  const allowedSlugs = new Set(
    Object.keys(uiPackage.exports)
      .filter((exportPath) => exportPath !== './manifest')
      .map((exportPath) => exportPath.slice(2)),
  );
  allowedSlugs.add('tailwind');
  return { prompts, allowedSlugs };
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md']);

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractVeliImports(source) {
  return [...source.matchAll(/from\s+['"]@tradenetcorp\/veli-ui(?:\/([a-z0-9-]+))?['"]/g)].map(
    (match) => match[1] ?? '',
  );
}

function hasBarrelImport(source) {
  return /from\s+['"]@tradenetcorp\/veli-ui['"]/.test(source);
}

function checkSnippets(source, snippets) {
  return snippets.filter((snippet) => !source.includes(snippet));
}

function presentSnippets(source, snippets) {
  return snippets.filter((snippet) => source.includes(snippet));
}

export function scoreSource({ task, source, allowedSlugs }) {
  const imports = extractVeliImports(source);
  const unknownImports = [...new Set(imports.filter((slug) => slug && !allowedSlugs.has(slug)))];
  const importedSlugs = [...new Set(imports.filter(Boolean))];
  const missingImports = (task.requireImports ?? []).filter(
    (slug) => !importedSlugs.includes(slug),
  );
  const forbiddenImports = (task.forbidImports ?? []).filter((slug) =>
    importedSlugs.includes(slug),
  );
  const missingSnippets = checkSnippets(source, task.requireSnippets ?? []);
  const forbiddenHits = presentSnippets(source, task.sharedForbidSnippets ?? []);
  const onClickHits = (source.match(/\sonClick=/g) ?? []).length;
  const hexColorHits = (
    source.match(/(?:bg|text|border)-\[[#0-9a-fA-F][^\]]*]|text-gray-|bg-gray-/g) ?? []
  ).length;
  const hasProvider = source.includes('VeliProvider');
  const refused =
    /not (?:currently )?supported|does not (?:export|include|provide)|no Veli range|RangeCalendar/i.test(
      source,
    );
  const inventedRange = /RangeDatePicker|DateRangePicker/.test(source);
  const acceptedRangeWorkaround =
    refused ||
    importedSlugs.includes('calendar') ||
    (importedSlugs.includes('date-picker') && !inventedRange);

  const checks = {
    allowlist: unknownImports.length === 0 && !hasBarrelImport(source),
    requiredImports: missingImports.length === 0,
    forbiddenImports: forbiddenImports.length === 0,
    requiredSnippets: missingSnippets.length === 0,
    forbiddenApis: forbiddenHits.length === 0 && onClickHits === 0,
    tokens: hexColorHits === 0,
    provider: !task.requireProvider || hasProvider,
    refusal: !task.expectRefusal || (acceptedRangeWorkaround && !inventedRange),
  };

  if (task.expectRefusal) {
    checks.requiredImports = true;
    checks.requiredSnippets = true;
  }

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    id: task.id,
    title: task.title,
    mechanical: Number((passed / total).toFixed(3)),
    checks,
    importedSlugs,
    unknownImports,
    missingImports,
    forbiddenImports,
    missingSnippets,
    forbiddenHits,
    onClickHits,
    hexColorHits,
    hasProvider,
    refused,
    hasBarrelImport: hasBarrelImport(source),
  };
}

export async function scoreDirectory(dir, task, allowedSlugs, sharedForbidSnippets) {
  const files = await collectFiles(dir);
  const source = (await Promise.all(files.map((filePath) => fs.readFile(filePath, 'utf8')))).join(
    '\n',
  );
  let judgment = null;

  try {
    const judgmentFile = await readJson(path.join(dir, 'judgment.json'));
    judgment = judgmentFile.score ?? null;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const result = scoreSource({
    task: { ...task, sharedForbidSnippets },
    source,
    allowedSlugs,
  });

  return {
    ...result,
    files: files.map((filePath) => path.relative(dir, filePath)),
    judgment,
    total:
      judgment == null ? result.mechanical : Number((result.mechanical + judgment / 2).toFixed(3)),
  };
}

function formatTable(results) {
  const header = '| Task | Mechanical | Judgment | Notes |';
  const divider = '| --- | --- | --- | --- |';
  const rows = results.map((result) => {
    const failures = Object.entries(result.checks)
      .filter(([, passed]) => !passed)
      .map(([name]) => name);
    return `| ${result.id} | ${result.mechanical} | ${result.judgment ?? '—'} | ${failures.join(', ') || 'pass'} |`;
  });
  return [header, divider, ...rows].join('\n');
}

export async function scoreRun(runDir) {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const entries = await fs.readdir(runDir, { withFileTypes: true });
  const taskDirs = entries.filter((entry) => entry.isDirectory());
  const results = [];

  if (taskDirs.length === 0) {
    throw new Error(`No task directories in ${runDir}`);
  }

  for (const entry of taskDirs) {
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
      ),
    );
  }

  return { runDir, results, table: formatTable(results) };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node evals/agent/score.mjs <run-directory>');
    process.exit(1);
  }

  const report = await scoreRun(path.resolve(target));
  console.log(report.table);
  console.log(JSON.stringify({ runDir: report.runDir, results: report.results }, null, 2));
}
