import tseslint from 'typescript-eslint';
import base from './eslint.config.mjs';
import { veliStyling } from './scripts/lint/veli-styling.mjs';
import { compositionConfigs } from './scripts/lint/veli-exceptions.mjs';

export default [
  // Reuse repository ignores without enabling its blocking quality rules.
  base[0],
  { ignores: ['**/.storybook/**'] },
  // Register the existing plugins so their source directives remain valid.
  // Their quality rules stay in the normal lint command.
  { plugins: Object.assign({}, ...base.map((config) => config.plugins ?? {})) },
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  { files: ['**/*.{jsx,tsx}'], languageOptions: { parser: tseslint.parser } },
  veliStyling,
  ...compositionConfigs,
  // Veli owns its implementation. Application-owned Blocks are consumers.
  {
    files: ['packages/react/**'],
    rules: Object.fromEntries(Object.keys(veliStyling.rules).map((rule) => [rule, 'off'])),
  },
];
