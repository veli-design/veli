import Color from 'colorjs.io';

export const META = 'org.veli';
const tiers = new Set(['primitives', 'brand', 'semantics', 'components']);
const groups = new Set([
  'blur',
  'breakpoints',
  'color',
  'container',
  'font-weight',
  'font',
  'leading',
  'radius',
  'spacing',
  'text',
  'type-metrics',
  'tracking',
  'ease',
  'duration',
  'delay',
]);
export const slug = (value) =>
  String(value)
    .replace(/semi\s*bold/gi, 'semibold')
    .replace(/reguar/gi, 'regular')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
const alias = (value) => typeof value === 'string' && /^\{[^}]+\}$/.test(value);
export function entries(tree, path = [], out = []) {
  if (!tree || typeof tree !== 'object') return out;
  if ('$value' in tree) out.push([path.join('.'), tree]);
  for (const [key, child] of Object.entries(tree))
    if (!key.startsWith('$')) entries(child, [...path, key], out);
  return out;
}
function insert(tree, path, value) {
  let group = tree;
  for (const key of path.slice(0, -1)) group = group[key] ??= {};
  if (group[path.at(-1)]) throw new Error(`Token naming collision: ${path.join('.')}`);
  group[path.at(-1)] = value;
}
function pathFor(path) {
  const parts = path.split('.');
  if (parts[0] === 'color' && tiers.has(parts[1])) parts.splice(1, 1);
  if (parts[0] === 'Color-styles') parts.splice(0, 1, 'color', 'styles');
  if (parts[0] === 'Typography-styles')
    parts.splice(
      0,
      2,
      'typography',
      parts[1] === 'Type' ? 'en' : parts[1] === 'Dhivehi' ? 'dv' : `auxiliary-${slug(parts[1])}`,
    );
  if (parts[0] === 'Effect-styles') parts.splice(0, 2, 'shadow');
  return parts.map((part) =>
    part === 'highContrast'
      ? 'high-contrast'
      : part === 'DEFAULT'
        ? 'default'
        : /^\d+,\d+$/.test(part)
          ? part.replace(',', '_')
          : slug(part),
  );
}
export function typeClass(path, token) {
  const authored = token.$description?.match(/Tailwind:\s*(type-[a-z0-9-]+)/i)?.[1];
  if (authored) return authored;
  return `type-${path.split('.').slice(2).join('-')}`;
}
function dimension(value, label) {
  if (alias(value)) return value;
  const result =
    typeof value === 'number'
      ? { value, unit: 'px' }
      : typeof value === 'string'
        ? (() => {
            const m = /^(-?\d+(?:\.\d+)?)(px|rem)$/.exec(value);
            return m && { value: Number(m[1]), unit: m[2] };
          })()
        : value;
  if (!result || !Number.isFinite(result.value) || !['px', 'rem'].includes(result.unit))
    throw new Error(`${label}: expected a px/rem dimension`);
  return result;
}
function structuredColor(value, description, mode, label, requireAuthored = true) {
  if (alias(value)) return value;
  const pattern = new RegExp(`OKLCH\\s+${mode}\\s*:\\s*(oklch\\([^)]*\\))`, 'i');
  const authored = description?.match(pattern)?.[1];
  const fallback = new Color(value);
  let color;
  if (authored) {
    color = new Color(authored);
    const [l, c, h] = color.to('oklch').coords;
    if (
      ![l, c].every(Number.isFinite) ||
      l < 0 ||
      l > 1 ||
      c < 0 ||
      (h !== null && !Number.isFinite(h)) ||
      color.alpha < 0 ||
      color.alpha > 1
    )
      throw new Error(`${label} ${mode}: invalid authored OKLCH`);
    const rgb = color.to('srgb').coords.map((v) => Math.min(1, Math.max(0, v)));
    if (
      rgb.some((v, i) => Math.abs(v - fallback.to('srgb').coords[i]) > 2 / 255) ||
      Math.abs(color.alpha - fallback.alpha) > 1 / 255
    )
      throw new Error(`${label} ${mode}: authored OKLCH disagrees with Figma fallback`);
  } else {
    const rgb = fallback.to('srgb').coords;
    if (requireAuthored && Math.max(...rgb) - Math.min(...rgb) > 1e-8)
      throw new Error(`${label} ${mode}: missing OKLCH ${mode.toLowerCase()} description`);
    if (description && /OKLCH/i.test(description))
      throw new Error(`${label} ${mode}: malformed OKLCH description`);
    color = fallback.to('oklch');
  }
  const [l, c, h] = color.to('oklch').coords;
  return {
    colorSpace: 'oklch',
    components: [
      Math.min(1, Math.max(0, Number(l.toPrecision(15)))),
      Number(c.toPrecision(15)),
      h ?? 0,
    ],
    alpha: color.alpha,
  };
}

/** Explicit exporter boundary; outputs only standard DTCG values plus namespaced metadata. */
export function normalize(figma, motion) {
  const source = structuredClone(figma);
  for (const [group, values] of Object.entries(motion))
    source[group] = { ...values, ...source[group] };
  const raw = new Map(entries(source));
  const names = new Map(
    [...raw]
      .filter(([id]) => !id.startsWith('_docs.'))
      .map(([id]) => [
        id,
        [
          ...pathFor(id),
          ...(Object.keys(raw.get(id)).some((key) => !key.startsWith('$')) ? ['default'] : []),
        ].join('.'),
      ]),
  );
  const rewrite = (value) => {
    if (alias(value)) {
      let target = value.slice(1, -1);
      target =
        {
          'colors.fg.border.focus': 'color.semantics.border.focus',
          'colors.bg.surface.surface-raised': 'color.semantics.bg.surface.raised',
        }[target] ?? target;
      const name = names.get(target);
      if (!name) throw new Error(`Unresolved Figma alias: ${value}`);
      return `{${name}}`;
    }
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewrite(child)]));
    return value;
  };
  const resolveRaw = (value, seen = new Set()) => {
    if (!alias(value)) return value;
    const key = value.slice(1, -1);
    if (seen.has(key)) throw new Error(`Alias cycle: ${key}`);
    const token = raw.get(key);
    if (!token) throw new Error(`Unknown source alias: ${key}`);
    return resolveRaw(token.$value, new Set([...seen, key]));
  };
  const sansFamily = raw.has('font.sans') ? resolveRaw(raw.get('font.sans').$value) : undefined;
  const result = {
    $extensions: {
      [META]: {
        format: '2025.10',
        modes: ['Light', 'Dark'],
        excluded: ['_docs'],
        exporter: source.$extensions?.['tokens-bruecke-meta'],
      },
    },
  };
  for (const [id, original] of raw) {
    if (id.startsWith('_docs.')) continue;
    const path = names.get(id).split('.');
    if (
      !groups.has(id.split('.')[0]) &&
      !['Typography-styles', 'Grid-styles', 'Effect-styles', 'Color-styles'].includes(
        id.split('.')[0],
      )
    )
      throw new Error(`Unclassified source token: ${id}`);
    const metadata = { source: id, ...original.$extensions };
    delete metadata.mode;
    const token = {
      $type: original.$type,
      $value: original.$value,
      ...(original.$description ? { $description: original.$description } : {}),
      $extensions: { [META]: metadata },
    };
    if (id.startsWith('Grid-styles.')) {
      const name = slug(id.split('.')[1]);
      for (const [field, value] of Object.entries(original.$value))
        insert(result, ['grid', name, slug(field)], {
          $type: field === 'columnCount' ? 'number' : 'dimension',
          $value: field === 'columnCount' ? value : dimension(value, id),
          $extensions: { [META]: { source: id, composition: `grid-style-${name}` } },
        });
      continue;
    }
    if (token.$type === 'color') {
      token.$value = structuredColor(
        original.$value,
        original.$description,
        'Light',
        id,
        !id.startsWith('Color-styles.'),
      );
      metadata.authoredColors = Object.fromEntries(
        [
          ...(original.$description?.matchAll(/OKLCH\s+(light|dark)\s*:\s*(oklch\([^)]*\))/gi) ??
            []),
        ].map((match) => [match[1].toLowerCase(), match[2]]),
      );
      const modes = original.$extensions?.mode ?? {};
      if (Object.keys(modes).some((key) => !['Light', 'Dark'].includes(key)))
        throw new Error(`${id}: unsupported color mode`);
      if (modes.Dark !== undefined)
        token.$extensions.mode = {
          Dark: structuredColor(modes.Dark, original.$description, 'Dark', id),
        };
    } else if (id.startsWith('font-weight.')) {
      token.$type = 'fontWeight';
      const weight = resolveRaw(original.$value);
      if (id === 'font-weight.dhivehi-regular' && weight === 'Regular') {
        // Figma uses a font style name here; CSS needs the equivalent numeric weight.
        token.$value = '{font-weight.regular}';
        metadata.figmaStyleName = weight;
      } else if (Number.isFinite(weight?.value)) token.$value = weight.value;
      else throw new Error(`${id}: unsupported font weight ${JSON.stringify(weight)}`);
    } else if (id.startsWith('font.')) {
      token.$type = 'fontFamily';
      if (id.startsWith('font.dhivehi-')) {
        const regular = resolveRaw(raw.get('font.dhivehi-regular')?.$value);
        if (typeof regular !== 'string') throw new Error('Missing Dhivehi regular font');
        const family = resolveRaw(original.$value);
        token.$value = [...new Set([family, regular]), 'sans-serif'];
      }
    } else if (id.startsWith('leading.') && !/^leading\.\d+$/.test(id)) {
      token.$type = 'number';
      token.$value = resolveRaw(original.$value).value / 100;
    } else if (id.startsWith('tracking.')) {
      const intended = original.$description?.match(
        /Intended Figma letter-spacing value:\s*(-?[\d.]+)em/,
      );
      const value = resolveRaw(original.$value);
      const ratio = intended
        ? Number(intended[1])
        : value.unit === '%'
          ? value.value / 100
          : value.value / 16;
      token.$value = { value: ratio * 16, unit: 'px' };
      metadata.cssValue = `${ratio}em`;
    } else if (token.$type === 'dimension') {
      token.$value = dimension(token.$value, id);
    } else if (token.$type === 'duration') {
      if (typeof token.$value === 'string') {
        const match = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(token.$value);
        if (!match) throw new Error(`${id}: invalid duration`);
        token.$value = { value: Number(match[1]), unit: match[2] };
      }
    } else if (id === 'ease.linear') {
      token.$type = 'cubicBezier';
      token.$value = [0, 0, 1, 1];
      metadata.cssValue = 'linear';
    } else if (token.$type === 'typography') {
      const value = original.$value;
      const size = dimension(value.fontSize, id);
      const literalSize = dimension(resolveRaw(value.fontSize), id);
      const line = alias(value.lineHeight) ? value.lineHeight : resolveRaw(value.lineHeight);
      const tracking = alias(value.letterSpacing)
        ? value.letterSpacing
        : resolveRaw(value.letterSpacing);
      const ratio =
        typeof tracking === 'string' && tracking.endsWith('%')
          ? Number.parseFloat(tracking) / 100
          : undefined;
      token.$value = {
        fontFamily: value.fontFamily,
        fontWeight: value.fontWeight,
        fontSize: size,
        lineHeight: alias(line)
          ? line
          : typeof line === 'string' && line.endsWith('%')
            ? Number.parseFloat(line) / 100
            : dimension(line, id).value / literalSize.value,
        letterSpacing: alias(tracking)
          ? tracking
          : ratio !== undefined
            ? { value: ratio * literalSize.value, unit: literalSize.unit }
            : dimension(tracking, id),
      };
      if (path[1] === 'dv' && value.fontStyle === '{font-weight.dhivehi-regular}') {
        if (value.fontWeight !== 400)
          throw new Error(`${id}: Dhivehi Regular style must have numeric weight 400`);
        token.$value.fontWeight = '{font-weight.dhivehi-regular}';
      }
      metadata.style = Object.fromEntries(
        Object.entries(value).filter(([key]) => !(key in token.$value)),
      );
      if (ratio !== undefined) metadata.letterSpacing = `${ratio}em`;
      metadata.utility = typeClass(path.join('.'), original);
      metadata.language = path[1] === 'dv' ? 'dv' : 'en';
    } else if (
      !['shadow', 'cubicBezier', 'fontWeight', 'fontFamily', 'number'].includes(token.$type)
    )
      throw new Error(`${id}: unsupported type ${token.$type}`);
    token.$value = rewrite(token.$value);
    if (token.$extensions.mode) token.$extensions.mode = rewrite(token.$extensions.mode);
    if (token.$type === 'typography') {
      // Keep older literal-family exports linked to the shared English font token.
      if (path[1] === 'en' && resolveRaw(original.$value.fontFamily) === sansFamily)
        token.$value.fontFamily = '{font.sans}';
    }
    // Non-DTCG exporter details are metadata and must not retain unresolved aliases.
    metadata.style = metadata.style
      ? Object.fromEntries(
          Object.entries(metadata.style).map(([key, value]) => [
            key,
            alias(value)
              ? resolveRaw(
                  value === '{typography.font-weight.regular}' ? '{font-weight.regular}' : value,
                )
              : value,
          ]),
        )
      : undefined;
    insert(result, path, token);
  }
  for (const [name, target] of Object.entries({
    dhivehi: 'dhivehi-regular',
    'dhivehi-faseyha': 'dhivehi-regular',
    'dhivehi-waheed': 'dhivehi-medium',
    'dhivehi-aaamu': 'dhivehi-bold',
  }))
    insert(result, ['font', name], {
      $type: 'fontFamily',
      $value: `{font.${target}}`,
      $extensions: { [META]: { derived: 'Legacy Dhivehi font alias' } },
    });
  return result;
}
