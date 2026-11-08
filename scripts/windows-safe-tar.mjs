import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Prefer Windows bsdtar on win32. GNU tar treats absolute `C:` paths as remote hosts.
const windowsTar = 'C:\\Windows\\System32\\tar.exe';
const tarBinary = process.platform === 'win32' && existsSync(windowsTar) ? windowsTar : 'tar';

export function tarSync(args, options = {}) {
  const result = execFileSync(tarBinary, args, options);
  // Windows tar emits CRLF in text listings.
  if (typeof result === 'string') return result.replace(/\r/g, '');
  return result;
}
