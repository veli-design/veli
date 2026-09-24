import { gunzipSync } from 'node:zlib';
import {
  BlocksCatalog,
  parseCatalog,
  parseManifest,
  parseReceipt,
  safeRelativePath,
  sha256,
} from './contracts.js';

const MAX_ARCHIVE_BYTES = 10 * 1024 * 1024;
const MAX_UNPACKED_BYTES = 50 * 1024 * 1024;
export const WFA_URL = 'https://wfa.mindco.mv/';

export class AccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessError';
  }
}

export interface SourceArchive {
  manifest: ReturnType<typeof parseManifest>;
  receipt: ReturnType<typeof parseReceipt>;
  source: Map<string, Buffer>;
  readme?: string;
  changelog?: string;
}

function serviceHeaders(env: NodeJS.ProcessEnv): HeadersInit | undefined {
  const id = env.CF_ACCESS_CLIENT_ID;
  const secret = env.CF_ACCESS_CLIENT_SECRET;
  if (Boolean(id) !== Boolean(secret))
    throw new AccessError(
      'Set both CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET for non-interactive access.',
    );
  if (!id || !secret) return undefined;
  return { 'CF-Access-Client-Id': id, 'CF-Access-Client-Secret': secret };
}

const isAccessChallenge = (response: Response) => {
  const type = response.headers.get('content-type') ?? '';
  const location = response.headers.get('location') ?? '';
  return (
    [301, 302, 303, 307, 308, 401, 403].includes(response.status) ||
    location.includes('cdn-cgi/access') ||
    type.includes('text/html')
  );
};

export class VeliWebClient {
  constructor(
    readonly webUrl: string,
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {}

  async request(pathname: string): Promise<Response> {
    const url = new URL(pathname, this.webUrl + '/');
    if (url.origin !== new URL(this.webUrl).origin)
      throw new Error('Veli Web returned a cross-origin resource URL.');
    const service = serviceHeaders(this.env);
    const response = await fetch(url, { headers: service, redirect: 'manual' });
    if (service) {
      if (isAccessChallenge(response))
        throw new AccessError(
          'Veli Web rejected the injected service-token credentials. Ask DevOps to verify its Cloudflare Access Service Auth policy.',
        );
      return response;
    }
    if (!isAccessChallenge(response)) return response;
    throw new AccessError(
      `Veli Web access is missing or expired. Visit ${WFA_URL}, sign in, request access for an allowed duration (up to 24 hours), and provide a reason. Retry from the same network/IP after approval. In CI, inject CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET if DevOps has enabled Service Auth.`,
    );
  }

  async catalog(): Promise<BlocksCatalog> {
    const response = await this.request('/api/blocks/v1/catalog.json');
    if (!response.ok)
      throw new Error(`Veli Web returned HTTP ${response.status} for the Blocks catalog.`);
    try {
      return parseCatalog(await response.json());
    } catch (error) {
      throw new Error(`Veli Web returned an invalid Blocks catalog: ${(error as Error).message}`);
    }
  }

  async archive(url: string, expectedSha256: string): Promise<SourceArchive> {
    const response = await this.request(url);
    if (!response.ok)
      throw new Error(`Veli Web returned HTTP ${response.status} for the source archive.`);
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > MAX_ARCHIVE_BYTES) throw new Error('Source archive exceeds the size limit.');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_ARCHIVE_BYTES) throw new Error('Source archive exceeds the size limit.');
    if (sha256(bytes) !== expectedSha256)
      throw new Error('Source archive hash does not match the catalog.');
    return parseSourceArchive(bytes);
  }
}

export function parseSourceArchive(bytes: Buffer): SourceArchive {
  let tar: Buffer;
  try {
    tar = gunzipSync(bytes, { maxOutputLength: MAX_UNPACKED_BYTES });
  } catch {
    throw new Error('Source archive is not a valid bounded gzip archive.');
  }
  const entries = new Map<string, Buffer>();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const rawPath = header.subarray(0, 100).toString().replace(/\0.*$/s, '');
    const entryPath = safeRelativePath(rawPath);
    const type = String.fromCharCode(header[156] || 48);
    if (type !== '0' && type !== '\0')
      throw new Error(`Archive entry is not a regular file: ${entryPath}`);
    const sizeText = header.subarray(124, 136).toString().replace(/\0.*$/s, '').trim();
    const size = Number.parseInt(sizeText || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || size > MAX_UNPACKED_BYTES)
      throw new Error(`Invalid archive entry size: ${entryPath}`);
    const start = offset + 512;
    const end = start + size;
    if (end > tar.length) throw new Error(`Truncated archive entry: ${entryPath}`);
    if (entries.has(entryPath)) throw new Error(`Duplicate archive entry: ${entryPath}`);
    entries.set(entryPath, tar.subarray(start, end));
    offset = start + Math.ceil(size / 512) * 512;
  }
  const manifestBytes = entries.get('manifest.json');
  const receiptBytes = entries.get('receipt.json');
  if (!manifestBytes || !receiptBytes)
    throw new Error('Source archive lacks its manifest or receipt.');
  const manifest = parseManifest(JSON.parse(manifestBytes.toString('utf8')));
  const receipt = parseReceipt(JSON.parse(receiptBytes.toString('utf8')));
  if (receipt.id !== manifest.id || receipt.version !== manifest.version || receipt.dirty)
    throw new Error(
      'Source archive manifest and receipt do not identify a clean matching release.',
    );
  const manifestFiles = new Set(manifest.files);
  if (
    receipt.files.length !== manifest.files.length ||
    !receipt.files.every(({ path }) => manifestFiles.has(path))
  )
    throw new Error('Source archive receipt does not match the manifest file inventory.');
  const source = new Map<string, Buffer>();
  for (const file of manifest.files) {
    const content = entries.get(`source/${file}`);
    const expected = receipt.files.find((item) => item.path === file)?.sha256;
    if (!content || !expected || sha256(content) !== expected)
      throw new Error(`Source hash mismatch for ${file}.`);
    source.set(file, content);
  }
  const allowed = new Set([
    'manifest.json',
    'receipt.json',
    'README.md',
    'CHANGELOG.md',
    ...manifest.files.map((file) => `source/${file}`),
  ]);
  for (const name of entries.keys())
    if (!allowed.has(name)) throw new Error(`Unexpected archive entry: ${name}`);
  return {
    manifest,
    receipt,
    source,
    readme: entries.get('README.md')?.toString('utf8'),
    changelog: entries.get('CHANGELOG.md')?.toString('utf8'),
  };
}
