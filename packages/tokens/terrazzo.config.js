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
        // Map your DTCG tokens to Tailwind theme
        // Using glob patterns to match your actual token structure
        color: ['color.*'], // matches color.gray.*, color.blue.*, etc.
        fontFamily: {
          sans: 'typography.font-stack.San-serif',
          mono: 'typography.font-stack.Monospace',
        },
        fontSize: ['typography.type-scale.*'],
        // Uncomment and add other mappings as needed:
        // spacing: ['Base Size.*'],
        // borderRadius: ['borderRadius.*'],
        // boxShadow: ['shadow.*'],
      },
      // Dark mode support - your tokens have Light/Dark modes!
      modeVariants: [{ variant: 'dark', mode: 'Dark' }],
    }),
  ],
});
