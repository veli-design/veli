#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts';
import { Command } from 'commander';
import semver from 'semver';
import { AccessError, VeliWebClient } from './client.js';
import {
  defaultBlocksDir,
  normalizeBlocksDir,
  normalizeWebUrl,
  readConfig,
  writeConfig,
  type VeliConfig,
} from './config.js';
import { dependencyPlan, installDependencies } from './dependencies.js';
import {
  blockState,
  installBlock,
  installedBlocks,
  preflightInstall,
  restoreBlock,
  type InstalledBlock,
} from './project.js';
import { abortUpdate, continueUpdate, hasPendingUpdate, updateBlock } from './update.js';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

interface GlobalOptions {
  cwd: string;
  webUrl?: string;
  json?: boolean;
  color?: boolean;
}

const program = new Command()
  .name('veli')
  .description('Install and manage application-owned Veli Blocks.')
  .version(packageJson.version)
  .option('-c, --cwd <path>', 'application directory', process.cwd())
  .option('--web-url <url>', 'override the configured Veli Web origin')
  .option('--json', 'write machine-readable JSON')
  .option('--no-color', 'disable color output');

const globalOptions = (command: Command) => command.optsWithGlobals() as GlobalOptions;
const cwdFor = (command: Command) => path.resolve(globalOptions(command).cwd);

program.hook('preAction', (_, command) => {
  if (globalOptions(command).color === false) process.env.NO_COLOR = '1';
});

function emit(command: Command, value: unknown, message?: string) {
  if (globalOptions(command).json) console.log(JSON.stringify(value, null, 2));
  else if (message) log.info(message);
}

function cancelled(value: unknown): value is symbol {
  if (!isCancel(value)) return false;
  cancel('Operation cancelled.');
  process.exitCode = 130;
  return true;
}

async function projectConfig(command: Command): Promise<{ cwd: string; config: VeliConfig }> {
  const cwd = cwdFor(command);
  const config = await readConfig(cwd);
  const override = globalOptions(command).webUrl ?? process.env.VELI_WEB_URL;
  if (override) config.webUrl = normalizeWebUrl(override);
  return { cwd, config };
}

async function clientFor(command: Command) {
  const { cwd, config } = await projectConfig(command);
  return { cwd, config, client: new VeliWebClient(config.webUrl) };
}

async function authClientFor(command: Command) {
  const cwd = cwdFor(command);
  const override = globalOptions(command).webUrl ?? process.env.VELI_WEB_URL;
  if (override) {
    const webUrl = normalizeWebUrl(override);
    return { cwd, webUrl, client: new VeliWebClient(webUrl) };
  }
  const config = await readConfig(cwd);
  return { cwd, webUrl: config.webUrl, client: new VeliWebClient(config.webUrl) };
}

async function ensurePackage(cwd: string) {
  try {
    await access(path.join(cwd, 'package.json'));
  } catch {
    throw new Error(`No package.json found in ${cwd}. Use --cwd to select an application package.`);
  }
}

async function pickIds<
  T extends { manifest: { id: string; title: string; description: string; version: string } },
>(values: T[], message: string): Promise<string[]> {
  if (!process.stdin.isTTY)
    throw new Error('Specify one or more block IDs in non-interactive mode.');
  const selected = await multiselect({
    message,
    required: true,
    options: values.map(({ manifest }) => ({
      value: manifest.id,
      label: `${manifest.title} (${manifest.version})`,
      hint: manifest.description,
    })),
  });
  if (cancelled(selected)) return [];
  return selected as string[];
}

program
  .command('init')
  .description('initialize Veli Blocks in an application')
  .option('--blocks-dir <path>', 'directory containing block folders')
  .action(async (options, command) => {
    const cwd = cwdFor(command);
    await ensurePackage(cwd);
    let webUrl = globalOptions(command).webUrl ?? process.env.VELI_WEB_URL;
    if (!webUrl) {
      if (!process.stdin.isTTY)
        throw new Error('Provide --web-url or VELI_WEB_URL in non-interactive mode.');
      const answer = await text({
        message: 'Veli Web URL',
        placeholder: 'https://veli.example.com',
      });
      if (cancelled(answer)) return;
      webUrl = answer;
    }
    const inferred = await defaultBlocksDir(cwd);
    let blocksDir = options.blocksDir as string | undefined;
    if (!blocksDir && process.stdin.isTTY) {
      const answer = await text({
        message: 'Where should Veli Blocks be installed?',
        initialValue: inferred,
      });
      if (cancelled(answer)) return;
      blocksDir = answer;
    }
    blocksDir ??= inferred;
    const config: VeliConfig = {
      schemaVersion: 1,
      webUrl: normalizeWebUrl(webUrl),
      blocksDir: normalizeBlocksDir(cwd, blocksDir),
    };
    const client = new VeliWebClient(config.webUrl);
    try {
      await client.catalog();
    } catch (error) {
      if (!(error instanceof AccessError) || !process.stdin.isTTY) throw error;
      const answer = await confirm({ message: 'Authenticate with Cloudflare Access now?' });
      if (cancelled(answer) || !answer) return;
      await client.login();
      await client.catalog();
    }
    await writeConfig(cwd, config);
    emit(
      command,
      config,
      `Initialized Veli Blocks in ${path.relative(process.cwd(), cwd) || '.'}.`,
    );
  });

const auth = program.command('auth').description('manage Cloudflare Access authentication');
auth
  .command('login')
  .description('authenticate with Cloudflare Access')
  .action(async (_, command) => {
    const { client } = await authClientFor(command);
    await client.login();
    await client.catalog();
    emit(command, { authenticated: true }, 'Authenticated with Veli Web.');
  });
auth
  .command('status')
  .description('verify catalog access')
  .action(async (_, command) => {
    const { webUrl, client } = await authClientFor(command);
    const catalog = await client.catalog();
    emit(
      command,
      { authenticated: true, webUrl, blocks: catalog.blocks.length },
      `Veli Web is accessible (${catalog.blocks.length} block${catalog.blocks.length === 1 ? '' : 's'}).`,
    );
  });

program
  .command('list')
  .description('list available Veli Blocks')
  .action(async (_, command) => {
    const { client } = await clientFor(command);
    const catalog = await client.catalog();
    if (globalOptions(command).json) emit(command, catalog.blocks);
    else
      for (const { manifest } of catalog.blocks)
        log.message(
          `${manifest.id.padEnd(22)} ${manifest.version.padEnd(9)} ${manifest.status} — ${manifest.description}`,
        );
  });

program
  .command('info [id]')
  .description('inspect a Veli Block')
  .action(async (id: string | undefined, _, command) => {
    const { client } = await clientFor(command);
    const catalog = await client.catalog();
    if (!id) {
      const chosen = await pickIds(catalog.blocks, 'Choose a block to inspect');
      id = chosen[0];
    }
    const block = catalog.blocks.find(({ manifest }) => manifest.id === id);
    if (!block) throw new Error(`Unknown block: ${id}`);
    emit(
      command,
      block,
      `${block.manifest.title} ${block.manifest.version} (${block.manifest.status})\n${block.manifest.description}\nDependencies: ${Object.entries(
        { ...block.manifest.dependencies, ...block.manifest.setupDependencies },
      )
        .map(([name, range]) => `${name}@${range}`)
        .join(', ')}`,
    );
  });

program
  .command('add [ids...]')
  .description('add one or more Veli Blocks')
  .option('-y, --yes', 'accept confirmations')
  .option('--overwrite', 'replace an existing destination')
  .option('--dry-run', 'preview without changing files')
  .option('--no-install', 'do not install missing npm dependencies')
  .action(async (ids: string[], options, command) => {
    const { cwd, config, client } = await clientFor(command);
    await ensurePackage(cwd);
    const catalog = await client.catalog();
    if (!ids.length) ids = await pickIds(catalog.blocks, 'Choose blocks to add');
    const selected = ids.map((id) => {
      const block = catalog.blocks.find(({ manifest }) => manifest.id === id);
      if (!block) throw new Error(`Unknown block: ${id}`);
      return block;
    });
    const archives = [];
    const task = spinner();
    if (!globalOptions(command).json) task.start('Downloading and verifying source');
    for (const block of selected) {
      const version = block.versions.find((item) => item.version === block.manifest.version)!;
      archives.push(await client.archive(version.archiveUrl, version.archiveSha256));
    }
    if (!globalOptions(command).json) task.stop('Verified canonical source');
    const required = Object.assign(
      {},
      ...archives.map(({ manifest }) => ({
        ...manifest.dependencies,
        ...manifest.setupDependencies,
      })),
    );
    const dependencies = await dependencyPlan(cwd, required);
    for (const archive of archives)
      await preflightInstall(cwd, config.blocksDir, archive, options.overwrite);
    if (options.dryRun) {
      emit(
        command,
        { blocks: ids, destination: config.blocksDir, dependencies },
        `Would add: ${ids.join(', ')}`,
      );
      return;
    }
    if (dependencies.incompatible.length)
      log.warn(
        `Existing dependency ranges need review:\n${dependencies.incompatible.map(({ name, current, required }) => `  ${name}: ${current} (block expects ${required})`).join('\n')}`,
      );
    if (!options.yes && !process.stdin.isTTY)
      throw new Error('Use --yes for non-interactive installation.');
    if (!options.yes) {
      const answer = await confirm({ message: `Add ${ids.join(', ')} to ${config.blocksDir}?` });
      if (cancelled(answer) || !answer) return;
    }
    for (const archive of archives)
      await installBlock(cwd, config.blocksDir, archive, options.overwrite);
    if (options.install && dependencies.missing.length) {
      let install = Boolean(options.yes);
      if (!options.yes) {
        const answer = await confirm({ message: `Install ${dependencies.missing.join(', ')}?` });
        if (cancelled(answer)) return;
        install = Boolean(answer);
      }
      if (install) await installDependencies(cwd, dependencies.missing);
    }
    emit(command, { added: ids, dependencies }, `Added ${ids.join(', ')}.`);
  });

program
  .command('status [ids...]')
  .description('show installed state and available updates')
  .option('--check', 'exit unsuccessfully when an update or integrity issue exists')
  .action(async (ids: string[], options, command) => {
    const { cwd, client } = await clientFor(command);
    const [installed, catalog] = await Promise.all([installedBlocks(cwd), client.catalog()]);
    const unknown = ids.filter((id) => !installed.some((block) => block.id === id));
    if (unknown.length) throw new Error(`Not installed: ${unknown.join(', ')}`);
    const selected = ids.length ? installed.filter(({ id }) => ids.includes(id)) : installed;
    const rows = [];
    for (const block of selected) {
      const state = await blockState(block);
      const latest = catalog.blocks.find(({ manifest }) => manifest.id === block.id)?.manifest
        .version;
      rows.push({
        id: block.id,
        installed: block.receipt.version,
        latest,
        updateAvailable: Boolean(latest && semver.gt(latest, block.receipt.version)),
        baselineValid: state.baselineValid,
        customized: state.customized,
        missing: state.missing,
        pendingUpdate: await hasPendingUpdate(cwd, block.id),
      });
    }
    if (globalOptions(command).json) emit(command, rows);
    else if (!rows.length) log.info('No Veli Blocks are installed.');
    else
      for (const row of rows)
        log.message(
          `${row.id}: ${row.installed}${row.latest && row.latest !== row.installed ? ` → ${row.latest}` : ''} · ${row.baselineValid ? `${row.customized.length} customized` : 'invalid baseline'}${row.pendingUpdate ? ' · update pending' : ''}`,
        );
    if (
      options.check &&
      rows.some(
        (row) =>
          row.updateAvailable || !row.baselineValid || row.missing.length || row.pendingUpdate,
      )
    )
      process.exitCode = 1;
  });

program
  .command('update [ids...]')
  .description('merge upstream Veli Block updates')
  .option('-y, --yes', 'accept confirmations')
  .option('--dry-run', 'preview without changing files')
  .option('--continue <id>', 'finish a conflicted update')
  .option('--abort <id>', 'roll back a conflicted update')
  .option('--no-install', 'do not install missing npm dependencies')
  .action(async (ids: string[], options, command) => {
    const { cwd, client } = await clientFor(command);
    const installed = await installedBlocks(cwd);
    const findInstalled = (id: string): InstalledBlock => {
      const block = installed.find((item) => item.id === id);
      if (!block) throw new Error(`${id} is not installed.`);
      return block;
    };
    if (options.continue) {
      await continueUpdate(cwd, findInstalled(options.continue));
      emit(command, { continued: options.continue }, `Completed the ${options.continue} update.`);
      return;
    }
    if (options.abort) {
      await abortUpdate(cwd, findInstalled(options.abort));
      emit(command, { aborted: options.abort }, `Rolled back the ${options.abort} update.`);
      return;
    }
    const catalog = await client.catalog();
    const outdated = installed.filter((block) => {
      const latest = catalog.blocks.find(({ manifest }) => manifest.id === block.id)?.manifest
        .version;
      return latest && semver.gt(latest, block.receipt.version);
    });
    if (!ids.length && !outdated.length) {
      emit(
        command,
        { current: installed.map(({ id }) => id) },
        'All installed Veli Blocks are current.',
      );
      return;
    }
    if (!ids.length) ids = await pickIds(outdated, 'Choose blocks to update');
    const results = [];
    for (const id of ids) {
      const installedBlock = findInstalled(id);
      if (await hasPendingUpdate(cwd, id))
        throw new Error(`${id} has an unfinished update. Continue or abort it first.`);
      const catalogBlock = catalog.blocks.find(({ manifest }) => manifest.id === id);
      if (!catalogBlock) throw new Error(`${id} is no longer in the catalog.`);
      if (!semver.gt(catalogBlock.manifest.version, installedBlock.receipt.version)) {
        results.push({ id, current: installedBlock.receipt.version });
        continue;
      }
      const version = catalogBlock.versions.find(
        (item) => item.version === catalogBlock.manifest.version,
      )!;
      const archive = await client.archive(version.archiveUrl, version.archiveSha256);
      if (options.dryRun) {
        results.push({ id, from: installedBlock.receipt.version, to: archive.receipt.version });
        continue;
      }
      if (!options.yes) {
        if (!process.stdin.isTTY) throw new Error('Use --yes for non-interactive updates.');
        const answer = await confirm({
          message: `Update ${id} from ${installedBlock.receipt.version} to ${archive.receipt.version}?`,
        });
        if (cancelled(answer) || !answer) continue;
      }
      const result = await updateBlock(cwd, installedBlock, archive);
      results.push({
        id,
        from: installedBlock.receipt.version,
        to: archive.receipt.version,
        ...result,
      });
      const dependencies = await dependencyPlan(cwd, {
        ...archive.manifest.dependencies,
        ...archive.manifest.setupDependencies,
      });
      if (options.install && dependencies.missing.length) {
        let install = Boolean(options.yes);
        if (!options.yes) {
          const answer = await confirm({ message: `Install ${dependencies.missing.join(', ')}?` });
          if (!cancelled(answer)) install = Boolean(answer);
        }
        if (install) await installDependencies(cwd, dependencies.missing);
      }
      if (result.conflicts.length)
        log.warn(
          `${id} has conflicts in ${result.conflicts.join(', ')}. Resolve them, then run veli update --continue ${id}; use --abort ${id} to roll back.`,
        );
    }
    emit(command, results, options.dryRun ? 'Update preview complete.' : 'Update complete.');
  });

program
  .command('restore [ids...]')
  .description('restore working source from the installed baseline')
  .option('-y, --yes', 'accept confirmation')
  .option('--dry-run', 'preview without changing files')
  .action(async (ids: string[], options, command) => {
    const { cwd } = await projectConfig(command);
    const installed = await installedBlocks(cwd);
    if (!ids.length)
      ids = await pickIds(
        installed.map((block) => ({
          manifest: { ...block.manifest, description: block.targetDir },
        })),
        'Choose blocks to restore',
      );
    const selected = ids.map((id) => {
      const block = installed.find((item) => item.id === id);
      if (!block) throw new Error(`${id} is not installed.`);
      return block;
    });
    for (const block of selected)
      if (await hasPendingUpdate(cwd, block.id))
        throw new Error(
          `${block.id} has an unfinished update. Continue or abort it before restoring.`,
        );
    if (options.dryRun) {
      emit(command, { restore: ids }, `Would restore: ${ids.join(', ')}`);
      return;
    }
    if (!options.yes) {
      if (!process.stdin.isTTY) throw new Error('Use --yes for non-interactive restore.');
      const answer = await confirm({ message: `Discard customizations in ${ids.join(', ')}?` });
      if (cancelled(answer) || !answer) return;
    }
    for (const block of selected) await restoreBlock(block);
    emit(command, { restored: ids }, `Restored ${ids.join(', ')}.`);
  });

program
  .command('doctor')
  .description('validate Veli Blocks configuration and installations')
  .action(async (_, command) => {
    const { cwd, config, client } = await clientFor(command);
    await ensurePackage(cwd);
    const catalog = await client.catalog();
    const installed = await installedBlocks(cwd);
    const checks = [];
    for (const block of installed) checks.push({ id: block.id, ...(await blockState(block)) });
    const healthy = checks.every(({ baselineValid, missing }) => baselineValid && !missing.length);
    emit(
      command,
      { healthy, config, catalogBlocks: catalog.blocks.length, installed: checks },
      healthy ? 'Veli Blocks configuration is healthy.' : 'Veli Blocks needs attention.',
    );
    if (!healthy) process.exitCode = 1;
  });

async function main() {
  process.on('SIGINT', () => process.exit(130));
  process.on('SIGTERM', () => process.exit(143));
  if (process.argv.length === 2 && process.stdin.isTTY) {
    intro('Veli Blocks');
    const action = await select({
      message: 'What would you like to do?',
      options: [
        { value: 'add', label: 'Browse and add blocks' },
        { value: 'status', label: 'Check installed blocks' },
        { value: 'update', label: 'Update blocks' },
        { value: 'restore', label: 'Restore a baseline' },
        { value: 'doctor', label: 'Run diagnostics' },
      ],
    });
    if (cancelled(action)) return;
    process.argv.push(action as string);
  }
  await program.parseAsync(process.argv);
  if (process.stdin.isTTY && process.argv.length > 2 && !process.exitCode) outro('Done');
}

main().catch((error) => {
  if (process.env.VELI_DEBUG) console.error(error);
  else log.error(error instanceof AccessError ? error.message : (error as Error).message);
  process.exitCode = 1;
});
