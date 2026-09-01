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
        spacing: ['spacing.*'],
        radius: ['radius.*'],
        blur: ['blur.*'],
        // DTCG collection is plural; Tailwind v4 expects --breakpoint-*
        breakpoint: ['breakpoints.*'],
        container: ['container.*'],
      },
      // Light/Dark are the teal/green Veli defaults. Keep Blue Light/Dark inert for now.
      modeVariants: [{ variant: 'dark', mode: 'Dark' }],
    }),
  ],
});
