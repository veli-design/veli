// Temporary bootstrap may never replace a site already handed to recurring delivery.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export async function assertBootstrapActive(api) {
  for (const [path, key] of [
    ['/releases', null],
    ['/actions/artifacts', 'artifacts'],
  ]) {
    let complete = false;
    for (let page = 1; page <= 20; page++) {
      const body = await api(`${path}?per_page=100&page=${page}`);
      const items = key ? body[key] : body;
      assert.ok(Array.isArray(items), 'Incomplete bootstrap retirement evidence');
      for (const item of items) {
        const retired = key
          ? /^site-deployed-[a-f0-9]{40}(?:-recovery-[1-9][0-9]*)?$/.test(item.name ?? '')
          : (item.assets ?? []).some((a) => a.name === 'publication.json');
        assert.ok(
          !retired,
          'Bootstrap deployment retired: recurring publication or site delivery evidence exists; use reviewed snapshot recovery',
        );
      }
      if (items.length < 100) {
        complete = true;
        break;
      }
    }
    assert.ok(complete, 'Incomplete bootstrap retirement evidence');
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repository = process.env.GITHUB_REPOSITORY;
  assert.match(repository ?? '', /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  const token = process.env.GITHUB_TOKEN;
  assert.ok(token, 'Missing read-only repository token');
  await assertBootstrapActive(async (path) => {
    const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    assert.equal(response.status, 200, `Bootstrap retirement read failed: HTTP ${response.status}`);
    return response.json();
  });
}
