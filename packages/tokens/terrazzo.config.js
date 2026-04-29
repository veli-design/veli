import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '@terrazzo/plugin-tailwind';

export default defineConfig({
  tokens: './src/design.tokens.json',
  outDir: './dist',

  plugins: [
    css({
      filename: 'tokens.css',
      variablePrefix: 'coral',
    }),
    tailwind({
      filename: 'tailwind-theme.css', // Must be .css for Tailwind v4!
      theme: {
        color: ['color.*'],
        fontFamily: {
          sans: 'font.sans',
          mono: 'font.mono',
        },
        text: ['text.*'],
      },
      // Dark mode support - your tokens have Light/Dark modes!
      modeVariants: [{ variant: 'dark', mode: 'Dark' }],
    }),
  ],
});
