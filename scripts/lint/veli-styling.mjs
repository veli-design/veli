import { plugin as shadcn } from '@shadcn/lint';

import { contractFor, coreNames, upstreamContracts } from './veli-contracts.mjs';

const importPattern = '^@tradenetcorp/veli-ui/[^/]+$';

function jsxName(tag) {
  const parts = [];
  while (tag.type === 'JSXMemberExpression') {
    parts.unshift(tag.property.name);
    tag = tag.object;
  }
  return tag.type === 'JSXIdentifier' ? { root: tag.name, parts } : null;
}

function bindingOf(context, node, name) {
  let scope = context.sourceCode.getScope(node);
  while (scope && !scope.set.has(name)) scope = scope.upper;
  return scope?.set.get(name);
}

function unwrapType(node) {
  while (
    node &&
    ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion'].includes(
      node.type,
    )
  )
    node = node.expression;
  return node;
}

// @shadcn/lint 0.2.3 tracks import names without lexical JSX bindings. Keep its
// class analysis intact, but skip attribute sites whose Veli import is shadowed.
function withLexicalImports(rule) {
  return {
    ...rule,
    create(context) {
      const visitors = rule.create(context);
      const imports = new Set(
        context.sourceCode.ast.body.flatMap((node) =>
          node.type === 'ImportDeclaration' && new RegExp(importPattern).test(node.source.value)
            ? node.specifiers.map((specifier) => specifier.local.name)
            : [],
        ),
      );
      for (const type of ['JSXAttribute', 'JSXSpreadAttribute']) {
        const visit = visitors[type];
        if (!visit) continue;
        visitors[type] = (node) => {
          const name = jsxName(node.parent.name);
          if (
            name &&
            imports.has(name.root) &&
            bindingOf(context, node, name.root)?.defs[0]?.type !== 'ImportBinding'
          )
            return;
          return visit(node);
        };
      }
      return visitors;
    },
  };
}

const scopedShadcn = {
  ...shadcn,
  rules: {
    ...shadcn.rules,
    'no-restyle': withLexicalImports(shadcn.rules['no-restyle']),
    'no-arbitrary-values': withLexicalImports(shadcn.rules['no-arbitrary-values']),
  },
};

// Resolve direct named/namespace imports and compound parts, respecting shadowing.
// Import graph and class-value analysis remain upstream's responsibility.
function contractComponent(context, opening) {
  const tag = jsxName(opening.name);
  if (!tag) return null;
  const definition = bindingOf(context, opening, tag.root)?.defs[0];
  if (definition?.type !== 'ImportBinding') return null;
  const specifier = definition.node;
  const imported = specifier.imported?.name ?? specifier.imported?.value;
  const name =
    specifier.type === 'ImportNamespaceSpecifier'
      ? tag.parts.join('')
      : specifier.type === 'ImportSpecifier' && `${imported}${tag.parts.join('')}`;
  const contract = contractFor.get(name);
  return contract && definition.parent.source.value === `@tradenetcorp/veli-ui/${contract.module}`
    ? name
    : null;
}

const reviewBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    docs: { description: 'Request review for styling paths not covered by class contracts.' },
    messages: {
      internal:
        '{{prop}} on {{component}} styles internals. Root width/margin allowances do not apply; use supported props or record a reviewed exception.',
      style:
        'Review inline style and CSS variables against the {{component}} contract; prefer supported Veli APIs.',
      icon: 'Review className on an icon-only Button: preserve its defined dimensions. Only outer margins and placement may change.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const component = contractComponent(context, node);
        if (!component) return;
        const attributes = node.attributes.filter((attr) => attr.type === 'JSXAttribute');
        const iconOnly = attributes.some(
          (attr) =>
            attr.name.name === 'iconOnly' &&
            !(
              attr.value?.type === 'JSXExpressionContainer' &&
              unwrapType(attr.value.expression).value === false
            ),
        );
        for (const attr of attributes) {
          const prop = attr.name.name;
          // Empty literals and explicit null/undefined have no styling effect.
          const value = unwrapType(
            attr.value?.type === 'JSXExpressionContainer' ? attr.value.expression : attr.value,
          );
          if (
            (value?.type === 'Literal' && (value.value == null || value.value === '')) ||
            (value?.type === 'Identifier' &&
              value.name === 'undefined' &&
              !bindingOf(context, value, 'undefined')?.defs.length)
          )
            continue;
          const messageId =
            prop === 'style'
              ? 'style'
              : /ClassName$/.test(prop) || prop === 'classNames'
                ? 'internal'
                : component === 'Button' && iconOnly && prop === 'className'
                  ? 'icon'
                  : null;
          if (messageId) context.report({ node: attr, messageId, data: { prop, component } });
        }
      },
    };
  },
};

// Copy this module AND veli-contracts.mjs into an opt-in consumer.
// Run separately from any existing lint invocation using --max-warnings 0.
export const veliStyling = {
  name: 'veli/component-contracts',
  files: ['**/*.{jsx,tsx}'],
  plugins: {
    shadcn: scopedShadcn,
    'shadcn-review': scopedShadcn,
    veli: { rules: { 'review-styling-boundaries': reviewBoundaries } },
  },
  settings: {
    shadcn: {
      componentImports: [importPattern],
      note: 'PD-809 contract. See docs/VELI_STYLING.md for enforcement levels and reviewed exceptions.',
    },
  },
  rules: {
    'shadcn/no-restyle': ['error', { allow: ['*'], contracts: upstreamContracts('error') }],
    'shadcn/no-arbitrary-values': [
      'error',
      {
        allow: ['*'],
        contracts: [{ pattern: `^(${coreNames.join('|')})$`, allow: [] }],
      },
    ],
    // ESLint-native alias allows different severities for the remaining matrix.
    'shadcn-review/no-restyle': ['warn', { allow: ['*'], contracts: upstreamContracts('warn') }],
    'veli/review-styling-boundaries': 'warn',
  },
};
