import { buttonClasses, coreDeniedClasses } from './veli-contracts.mjs';
import { veliStyling } from './veli-styling.mjs';

// Repository-local composition allowances. Never copy these into consumer config.
// Each preserves the core contract and adds only reviewed, literal class names.
export const compositionExceptions = [
  {
    file: 'apps/storybook/src/tests/button.tsx',
    name: 'Button class-forwarding regression inputs',
    status: 'approved-test',
    classes: ['h-8', 'size-8', 'w-16'],
    reason:
      'existing assertions intentionally verify 32px custom/icon dimensions and a constrained 64px pending width; these are regression inputs, not consumer guidance.',
  },
  {
    file: 'packages/blocks/src/account-panel/account-panel.tsx',
    name: 'AccountPanel open-state indicator',
    status: 'approved-pattern',
    classes: ['ring-2', 'ring-border-focus', 'ring-offset-2', 'ring-offset-bg-surface-raised'],
    reason:
      'documented persistent open-state ring, not a dimension change or replacement for keyboard focus.',
  },
  {
    file: 'packages/blocks/src/notification-tray/notification-tray.tsx',
    name: 'Notification unread decoration',
    status: 'temporary-pattern-review',
    classes: ['relative', 'overflow-visible'],
    reason:
      'preserve existing unread decoration pending clipping/ripple/RTL comparison. relative is redundant; no general overflow permission.',
  },
  {
    file: 'packages/blocks/src/service-detail/service-detail.tsx',
    name: 'Service detail full-width action hook',
    status: 'reviewed-contract-alias',
    classes: ['veli-service-detail-start-button'],
    reason:
      'reviewed CSS sets root width:100% (the existing w-full allowance) and sizes an app-owned trailing-icon span. Re-review changes to this CSS hook; it grants no general appearance permission.',
  },
  {
    file: 'packages/blocks/src/service-detail/guideline-sheet.tsx',
    name: 'Service detail floating contents trigger',
    status: 'temporary-pattern-review',
    classes: ['veli-service-detail-mobile-toc-button'],
    reason:
      'preserve the existing mobile contents trigger and keyboard/popover behavior. Reviewed CSS hides it on desktop and adds mobile positioning, z-index and drop shadows; dimensions remain owned by size=lg/iconOnly. Shadow treatment is explicit migration debt pending a supported floating-action pattern, not a general Button allowance.',
  },
  {
    file: 'apps/web/src/components/DocsSearch.tsx',
    name: 'Documentation command launcher',
    status: 'temporary-pattern-review',
    classes: ['docs-search-trigger'],
    reason:
      'preserve current launcher until a supported treatment is decided. Custom CSS was manually reviewed; its token usage does not grant general permission.',
  },
];

export const compositionConfigs = compositionExceptions.map((exception) => ({
  name: `veli/exception/${exception.name}`,
  files: [exception.file],
  rules: {
    'shadcn/no-restyle': [
      'warn',
      {
        ...veliStyling.rules['shadcn/no-restyle'][1],
        contracts: [
          ...veliStyling.rules['shadcn/no-restyle'][1].contracts,
          {
            pattern: '^Button$',
            allow: [...buttonClasses, ...exception.classes],
            deny: coreDeniedClasses,
          },
        ],
      },
    ],
  },
}));
