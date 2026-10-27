import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const runtime = createRequire(resolve(process.argv[2], 'package.json'));
const playwright = runtime('@playwright/test');
const result = {
  packageVersion: runtime('@playwright/test/package.json').version,
  node: process.version,
  architecture: process.arch,
  browsers: [],
};
assert.equal(result.packageVersion, '1.58.2');
for (const name of ['chromium', 'firefox', 'webkit']) {
  const browser = await playwright[name].launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      '<html dir="rtl"><body><button>Browser provisioning probe</button></body></html>',
    );
    await page.getByRole('button', { name: 'Browser provisioning probe' }).click();
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    result.browsers.push({
      name,
      version: browser.version(),
      executable: playwright[name].executablePath(),
    });
  } finally {
    await browser.close();
  }
}
writeFileSync(process.argv[3], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
