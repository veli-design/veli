import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert } from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';

const tokens = JSON.parse(
  readFileSync(new URL('../../tokens/src/design.tokens.json', import.meta.url), 'utf8'),
);
const theme = readFileSync(
  new URL('../../tokens/dist/tailwind-theme.css', import.meta.url),
  'utf8',
);
const intents = {
  neutral: 'sage',
  info: 'blue',
  positive: 'emerald',
  cautious: 'yellow',
  warning: 'orange',
  danger: 'red',
};

test('all 30 Alert aliases match the revised Figma Light/Dark bindings', () => {
  let count = 0;
  for (const [intent, hue] of Object.entries(intents)) {
    for (const [appearance, expected] of Object.entries({
      light: { bg: [300, 300], icon: [800, 800] },
      highContrast: {
        bg: intent === 'neutral' ? [1100, 1200] : [800, 1000],
        foreground: [100, 100],
        description: [200, 200],
      },
    })) {
      for (const [slot, [light, dark]] of Object.entries(expected)) {
        const token = tokens.color.components.alert[appearance][intent][slot];
        assert.equal(token.$value, `{color.primitives.${hue}.${light}}`);
        assert.deepEqual(token.$extensions.mode, {
          Light: `{color.primitives.${hue}.${light}}`,
          Dark: `{color.primitives.${hue}.${dark}}`,
        });
        assert.ok(
          theme.includes(
            `--color-alert-${appearance === 'highContrast' ? 'high-contrast' : appearance}-${intent}-${slot}:`,
          ),
        );
        count++;
      }
    }
  }
  assert.equal(count, 30);
});

test('the rendered 36 variants only reference generated colour utilities', () => {
  const variables = new Set(
    Array.from(theme.matchAll(/--color-([a-z0-9-]+):/g), (match) => match[1]),
  );
  const skip = new Set(['transparent', 'current', 'inherit', 'white', 'black', 'start']);
  for (const intent of Object.keys(intents))
    for (const appearance of ['light', 'highContrast'])
      for (const layout of ['default', 'stacked', 'compact']) {
        const html = renderToStaticMarkup(
          h(
            Alert,
            { intent, appearance, layout, leadingIcon: h('svg') },
            h(Alert.Title, {}, 'Review'),
            h(Alert.Description, {}, 'Details'),
            h(
              Alert.Actions,
              {},
              h(Button, { intent: 'secondary', appearance: 'ghost', size: 'sm' }, 'Later'),
            ),
            h(Alert.CloseButton),
          ),
        );
        const classes = Array.from(html.matchAll(/class="([^"]*)"/g), (match) => match[1]).join(
          ' ',
        );
        for (const match of classes.matchAll(
          /(?<![A-Za-z0-9-[,])(text|bg|border)-([a-z][a-z0-9-]*)(?![A-Za-z0-9[\]-])/g,
        )) {
          const value = match[2];
          if (skip.has(value)) continue;
          assert.ok(
            variables.has(value) ||
              theme.includes(
                `--${{ text: 'text-color', bg: 'background-color', border: 'border-color' }[match[1]]}-${value}:`,
              ),
            `${intent}/${appearance}/${layout}: ${match[0]}`,
          );
        }
      }
});
