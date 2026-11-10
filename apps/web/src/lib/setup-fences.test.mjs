import test from 'node:test';
import { applySetupFences } from './setup-fences.mjs';

test('setup fences match their owners and banned snippets stay off the site', () => {
  applySetupFences({ write: false });
});
