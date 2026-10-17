import { entries, META } from './normalize.mjs';
export const variableName = (token) => `--veli-${token.id.replace(/[._]/g, '-')}`;
export const subVariableName = (name, field) => `${name}-${field}`;
const namespaces = {
  blur: 'blur',
  breakpoints: 'breakpoint',
  container: 'container',
  font: 'font',
  'font-weight': 'font-weight',
  leading: 'leading',
  radius: 'radius',
  spacing: 'spacing',
  tracking: 'tracking',
  shadow: 'shadow',
  ease: 'ease',
  duration: 'duration',
  delay: 'delay',
};
// Generic text sizes use English regular styles; type-* owns language switching.
const textStyles = {
  xs: 'caption.regular',
  sm: 'body.sm.regular',
  base: 'body.md.regular',
  lg: 'body.lg.regular',
  xl: 'subtitle.regular',
  '2xl': 'title.2.regular',
  '3xl': 'title.1.regular',
  '4xl': 'heading.4.regular',
  '5xl': 'heading.3.regular',
  '6xl': 'heading.2.regular',
  '7xl': 'heading.1.regular',
  '8xl': 'display.md.regular',
  '9xl': 'display.lg.regular',
};
const fields = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'];
function typographyDeclarations(token, useSansFamily = false) {
  return fields
    .map((field) =>
      field === 'font-family' && useSansFamily
        ? '  font-family: var(--veli-font-sans);'
        : `  ${field}: var(${subVariableName(variableName(token), field)});`,
    )
    .join('\n');
}
function dhivehiTarget(token) {
  const source = token.$extensions[META].source.split('.').slice(2);
  const category = source[0].toLowerCase();
  const weight = source.at(-1).toLowerCase() === 'regular' ? 'regular' : 'medium';
  if (category === 'Display'.toLowerCase())
    return `typography.dv.display.${source[1] === 'lg' ? '1' : '2'}.${source.at(-1).toLowerCase() === 'bold' ? 'bold' : 'medium'}`;
  if (['heading', 'title'].includes(category))
    return `typography.dv.${category}.${source[1]}.medium`;
  if (category === 'subtitle') return 'typography.dv.subtitle.medium';
  if (category === 'body') return `typography.dv.body.${source[1]}.${weight}`;
  if (category.startsWith('caption')) return `typography.dv.caption.${weight}`;
  return undefined;
}

/** Emit the Tailwind adapter from Terrazzo's validated graph, never by editing CSS. */
export default function veliAdapter(canonical) {
  const sansTypography = new Set(
    entries(canonical.typography?.en)
      .filter(([, token]) => token.$value.fontFamily === '{font.sans}')
      .map(([id]) => `typography.en.${id}`),
  );
  return {
    name: 'veli-adapter',
    enforce: 'post',
    build({ tokens, getTransforms, outputFile }) {
      const declarations = new Map();
      const add = (name, value) => {
        if (declarations.has(name) && declarations.get(name) !== value)
          throw new Error(`Tailwind mapping collision: ${name}`);
        declarations.set(name, value);
      };
      // Tailwind's fractional and arbitrary spacing utilities use this scale unit.
      add('--spacing', 'var(--veli-spacing-1)');
      const utilities = [];
      const transforms = new Map(
        getTransforms({ format: 'css', mode: '.' }).map((t) => [t.token.id, t]),
      );
      for (const token of Object.values(tokens)) {
        const css = transforms.get(token.id);
        if (!css && token.id !== 'font.sans')
          throw new Error(`Missing canonical CSS transform: ${token.id}`);
        const [group, ...path] = token.id.split('.');
        const suffix = path.join('-');
        const reference = `var(${variableName(token)})`;
        if (group === 'color') {
          add(`--color-${suffix}`, reference);
          if (suffix.endsWith('-default')) add(`--color-${suffix.slice(0, -8)}`, reference);
          if (path[0] === 'status' && path[1] === 'caution')
            add(`--color-${suffix.replace('status-caution-', 'status-cautious-')}`, reference);
          const properties =
            {
              bg: ['background-color'],
              text: ['text-color'],
              border: ['border-color', 'ring-color', 'outline-color'],
            }[path[0]] ?? [];
          for (const property of properties) {
            const name = path.slice(1).join('-');
            add(`--${property}-${name}`, reference);
            const shorthand = name.endsWith('-default') ? name.slice(0, -8) : undefined;
            // Reserve text size names: legacy text-color aliases win Tailwind resolution.
            if (shorthand && !(property === 'text-color' && textStyles[shorthand]))
              add(`--${property}-${shorthand}`, reference);
          }
        } else if (group === 'text') {
          const styleId = `typography.en.${textStyles[path[0]]}`;
          const style = tokens[styleId];
          if (!style || !['font-size', 'line-height'].includes(path[1]))
            throw new Error(`Missing English text counterpart for ${token.id}: ${styleId}`);
          const styleVariable = variableName(style);
          add(
            `--text-${path[0]}${path[1] === 'line-height' ? '--line-height' : ''}`,
            `var(${subVariableName(styleVariable, path[1])})`,
          );
          if (path[1] === 'font-size')
            add(
              `--text-${path[0]}--letter-spacing`,
              `var(${subVariableName(styleVariable, 'letter-spacing')})`,
            );
        } else if (namespaces[group]) {
          const name = `--${namespaces[group]}-${suffix}`;
          add(name, ['breakpoints', 'container'].includes(group) ? css.value : reference);
          if (group === 'radius' && suffix === 'default') {
            add('--radius', reference);
            add('--radius-md', reference);
          }
          if (['duration', 'delay'].includes(group))
            utilities.push(
              `@utility ${group}-${suffix} {\n  transition-${group}: ${reference};\n  animation-${group}: ${reference};\n}`,
            );
          if (group === 'ease')
            utilities.push(
              `@utility ease-${suffix} {\n  transition-timing-function: ${reference};\n  animation-timing-function: ${reference};\n}`,
            );
        } else if (group === 'typography') {
          const metadata = token.$extensions[META];
          const utility =
            metadata.language === 'dv' ? `type-dv-${path.slice(1).join('-')}` : metadata.utility;
          let body = typographyDeclarations(token, sansTypography.has(token.id));
          if (path[0] === 'en') {
            const target = dhivehiTarget(token);
            if (!target || !tokens[target])
              throw new Error(`Missing Dhivehi counterpart for ${token.id}: ${target}`);
            body += `\n  &:lang(dv) {\n${typographyDeclarations(tokens[target])
              .split('\n')
              .map((line) => `  ${line}`)
              .join('\n')}\n  }`;
          }
          utilities.push(`@utility ${utility} {\n${body}\n}`);
        } else if (group !== 'grid') throw new Error(`Unmapped Tailwind token: ${token.id}`);
      }
      for (const name of Object.keys(canonical.grid))
        utilities.push(
          `@utility grid-style-${name} {\n  display: grid;\n  grid-template-columns: repeat(var(--veli-grid-${name}-columncount), minmax(0, 1fr));\n  column-gap: var(--veli-grid-${name}-columngap);\n  padding-inline: var(--veli-grid-${name}-columnmargin);\n}`,
        );
      const utilityNames = utilities.map((rule) => rule.match(/^@utility ([^ ]+)/)[1]);
      if (new Set(utilityNames).size !== utilityNames.length)
        throw new Error('Duplicate generated utility names');
      outputFile(
        'tailwind-theme.css',
        `/* Generated from canonical Veli tokens. */\n@import './tokens.css';\n@custom-variant dark (&:where(.dark, .dark *));\n\n@theme inline static {\n${[...declarations].map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}\n\n${utilities.join('\n\n')}\n`,
      );
      outputFile('tokens.json', `${JSON.stringify(canonical, null, 2)}\n`);
      outputFile(
        'motion.tokens.json',
        `${JSON.stringify(Object.fromEntries(['ease', 'duration', 'delay'].map((group) => [group, canonical[group]])), null, 2)}\n`,
      );
      outputFile(
        'coverage.json',
        `${JSON.stringify({ tokens: Object.keys(tokens).length, css: transforms.size, themeVariables: declarations.size, utilities: utilityNames }, null, 2)}\n`,
      );
    },
  };
}
