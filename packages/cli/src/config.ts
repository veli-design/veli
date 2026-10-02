import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

export interface VeliConfig {
  schemaVersion: 1;
  webUrl: string;
  blocksDir: string;
}

export const configPath = (cwd: string) => path.join(cwd, '.veli', 'config.json');

export function normalizeWebUrl(input: string): string {
  const url = new URL(input);
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
    throw new Error('Veli Web must use HTTPS (HTTP is allowed only for localhost).');
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/$/, '');
}

export function normalizeBlocksDir(cwd: string, input: string): string {
  const normalized = input.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '');
  if (!normalized || normalized.startsWith('/') || normalized.split('/').includes('..'))
    throw new Error('Blocks directory must be a project-relative path.');
  if (normalized === '.veli' || normalized.startsWith('.veli/'))
    throw new Error('The .veli directory is reserved for Veli configuration and baselines.');
  const resolved = path.resolve(cwd, normalized);
  if (resolved !== cwd && !resolved.startsWith(cwd + path.sep))
    throw new Error('Blocks directory must stay inside the project.');
  return normalized;
}

export async function defaultBlocksDir(cwd: string): Promise<string> {
  try {
    await access(path.join(cwd, 'src'), constants.F_OK);
    return 'src/components/blocks';
  } catch {
    return 'components/blocks';
  }
}

export async function readConfig(cwd: string): Promise<VeliConfig> {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(configPath(cwd), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      throw new Error('Veli Blocks is not initialized. Run `veli init` first.');
    throw error;
  }
  if (
    typeof value !== 'object' ||
    value === null ||
    (value as VeliConfig).schemaVersion !== 1 ||
    typeof (value as VeliConfig).webUrl !== 'string' ||
    typeof (value as VeliConfig).blocksDir !== 'string'
  )
    throw new Error('Invalid .veli/config.json.');
  return {
    schemaVersion: 1,
    webUrl: normalizeWebUrl((value as VeliConfig).webUrl),
    blocksDir: normalizeBlocksDir(cwd, (value as VeliConfig).blocksDir),
  };
}

export async function writeConfig(cwd: string, config: VeliConfig): Promise<void> {
  await mkdir(path.dirname(configPath(cwd)), { recursive: true });
  try {
    await writeFile(configPath(cwd), JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      throw new Error('Veli Blocks is already initialized in this project.');
    throw error;
  }
}
