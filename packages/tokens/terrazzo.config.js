import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '@terrazzo/plugin-tailwind';

export default defineConfig({
  tokens: './.cache/design.tokens.normalized.json',
  outDir: './dist',

  plugins: [
    css({
      filename: 'tokens.css',
      variablePrefix: 'veli',
    }),
    tailwind({
      filename: 'tailwind-theme.css', // Must be .css for Tailwind v4!
      theme: {
        color: ['color.*'],
        shadow: ['shadow.*'],
        ease: ['ease.*'],
        duration: ['duration.*'],
        delay: ['delay.*'],
        font: ['font.*'],
        text: ['text.*'],
        leading: ['leading.*'],
        tracking: ['tracking.*'],
        'font-weight': ['font-weight.*'],
      },
      // Keep govmv light/dark modes inert for now; they need separate theme outputs later.
      modeVariants: [{ variant: 'dark', mode: 'Dark' }],
    }),
  ],
});
