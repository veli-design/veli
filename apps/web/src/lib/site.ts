export type ComponentItem = {
  title: string;
  slug: string;
  description: string;
};

export type ComponentGroup = {
  title: string;
  items: ComponentItem[];
};

export const docsOverview = {
  label: 'Components overview',
  title: 'Veli Components',
  description: 'Accessible building blocks for consistent, dependable public-service interfaces.',
  documentTitle: 'Documentation | Veli Design System',
  documentDescription: 'Foundations and component documentation for the Veli Design System.',
  htmlPath: '/docs/',
  markdownPath: '/docs/index.md',
} as const;

export const foundationsOverview = {
  label: 'Foundations overview',
  title: 'Veli Foundation',
  description:
    'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
  documentTitle: 'Foundations | Veli Design System',
  documentDescription:
    'Principles, color, typography, spacing, motion, accessibility, language, and direction in Veli.',
  htmlPath: '/foundations/',
  markdownPath: '/foundations/index.md',
} as const;

export type DocsNavigationItem = {
  title: string;
  href: string;
  description?: string;
};

export type DocsNavigationSection = {
  id: 'foundations' | 'components' | 'patterns' | 'ui-blocks';
  title: string;
  href: string;
  items: readonly DocsNavigationItem[];
};

export type ExternalResource = {
  label: 'Figma' | 'GitHub' | 'npm';
  icon: 'figma' | 'github' | 'package';
  href?: string;
  status?: 'coming-soon';
};

export const externalResources: readonly ExternalResource[] = [
  {
    label: 'Figma',
    icon: 'figma',
    status: 'coming-soon',
  },
  { label: 'GitHub', href: 'https://github.com/tradenetcorp/veli', icon: 'github' },
  {
    label: 'npm',
    href: 'https://www.npmjs.com/package/@tradenetcorp/veli-ui',
    icon: 'package',
  },
] as const;

export const foundations = [
  {
    title: 'Principles',
    slug: 'principles',
    href: '/foundations/principles/',
    icon: '/images/foundation-icons/principles.svg',
    iconDark: '/images/foundation-icons-dark/principles.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Starter',
  },
  {
    title: 'Color',
    slug: 'color',
    href: '/foundations/color/',
    icon: '/images/foundation-icons/color.svg',
    iconDark: '/images/foundation-icons-dark/color.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'Semantic light and dark palettes for hierarchy, interaction, status, and feedback.',
    status: 'Available',
  },
  {
    title: 'Typography',
    slug: 'typography',
    href: '/foundations/typography/',
    icon: '/images/foundation-icons/typography.svg',
    iconDark: '/images/foundation-icons-dark/typography.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Available',
  },
  {
    title: 'Spacing',
    slug: 'spacing',
    href: '/foundations/spacing/',
    icon: '/images/foundation-icons/spacing.svg',
    iconDark: '/images/foundation-icons-dark/spacing.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Available',
  },
  {
    title: 'Motion',
    slug: 'motion',
    href: '/foundations/motion/',
    icon: '/images/foundation-icons/motion.svg',
    iconDark: '/images/foundation-icons-dark/motion.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Starter',
  },
  {
    title: 'Accessibility',
    slug: 'accessibility',
    href: '/foundations/accessibility/',
    icon: '/images/foundation-icons/accessibility.svg',
    iconDark: '/images/foundation-icons-dark/accessibility.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Starter',
  },
  {
    title: 'Language & direction',
    slug: 'language-direction',
    href: '/foundations/language-direction/',
    icon: '/images/foundation-icons/language-direction.svg',
    iconDark: '/images/foundation-icons-dark/language-direction.svg',
    iconWidth: 48,
    iconHeight: 48,
    description:
      'The operating beliefs behind Veli—clarity, access, local context, and shared foundations.',
    status: 'Available',
  },
] as const;

export const componentGroups: ComponentGroup[] = [
  {
    title: 'Actions & navigation',
    items: [
      {
        title: 'Button',
        slug: 'button',
        description: 'Primary, secondary, danger, icon-only, and loading actions.',
      },
      {
        title: 'Link',
        slug: 'link',
        description: 'Accessible links with icon and typography inheritance guidance.',
      },
      {
        title: 'Breadcrumbs',
        slug: 'breadcrumbs',
        description: 'Hierarchical navigation for deep service surfaces.',
      },
      {
        title: 'Pagination',
        slug: 'pagination',
        description: 'Page navigation with compact and explicit variants.',
      },
      {
        title: 'Menu',
        slug: 'menu',
        description: 'Popover list of actions with icons, shortcuts, and submenus.',
      },
      {
        title: 'Tabs',
        slug: 'tabs',
        description: 'Inline tabbed sections with optional overflow menu.',
      },
      {
        title: 'PageTab',
        slug: 'page-tab',
        description: 'Page-level tab navigation for top-level sections.',
      },
    ],
  },
  {
    title: 'Forms',
    items: [
      {
        title: 'Input',
        slug: 'input',
        description: 'Text fields with description, validation, and token styling.',
      },
      {
        title: 'TextArea',
        slug: 'textarea',
        description: 'Multi-line input with character counter and resize control.',
      },
      {
        title: 'PasswordInput',
        slug: 'password-input',
        description: 'Password entry with visibility toggle and requirement checklist.',
      },
      {
        title: 'Search',
        slug: 'search',
        description: 'Search field with leading icon and shared field shell.',
      },
      {
        title: 'Dropzone',
        slug: 'dropzone',
        description: 'Drag-and-drop and browse-to-upload file target.',
      },
      {
        title: 'Select',
        slug: 'select',
        description: 'Accessible select menus for structured choices.',
      },
      {
        title: 'ComboBox',
        slug: 'combobox',
        description: 'Searchable selection with grouped options.',
      },
      {
        title: 'Checkbox',
        slug: 'checkbox',
        description: 'Boolean and indeterminate selection states.',
      },
      {
        title: 'Radio',
        slug: 'radio',
        description: 'Single-choice groups with semantic geometry.',
      },
      {
        title: 'Switch',
        slug: 'switch',
        description: 'Binary settings with clear selected and disabled states.',
      },
    ],
  },
  {
    title: 'Date & time',
    items: [
      { title: 'Calendar', slug: 'calendar', description: 'Standalone date selection surface.' },
      { title: 'DateField', slug: 'date-field', description: 'Segment-based date entry.' },
      {
        title: 'DatePicker',
        slug: 'date-picker',
        description: 'Date field plus calendar popover composition.',
      },
    ],
  },
  {
    title: 'Structure & feedback',
    items: [
      {
        title: 'Accordion',
        slug: 'accordion',
        description: 'Collapsible disclosure group for progressive content.',
      },
      {
        title: 'Avatar',
        slug: 'avatar',
        description: 'Person, agency, or service representation with initials, icon, or image.',
      },
      {
        title: 'Badge',
        slug: 'badge',
        description: 'Status and counter indicator with semantic intents.',
      },
      {
        title: 'Card',
        slug: 'card',
        description: 'Raised surface container with header, content, and footer slots.',
      },
      {
        title: 'Alert',
        slug: 'alert',
        description: 'Inline status banners with semantic intents and dismiss actions.',
      },
      {
        title: 'Divider',
        slug: 'divider',
        description: 'Content separation for page and component layouts.',
      },
      {
        title: 'Skeleton',
        slug: 'skeleton',
        description: 'Generic loading placeholder for composing loading states.',
      },
      {
        title: 'Kbd',
        slug: 'kbd',
        description: 'Keyboard key and shortcut display for affordances.',
      },
      {
        title: 'Modal',
        slug: 'modal',
        description: 'Dialog surfaces with dismissal and sizing guidance.',
      },
      {
        title: 'Table',
        slug: 'table',
        description: 'Sortable, selectable data tables with Veli styling.',
      },
      { title: 'Tags', slug: 'tags', description: 'Tag groups for compact categorization.' },
      {
        title: 'Toast',
        slug: 'toast',
        description: 'Temporary notifications via a shared toast queue.',
      },
      {
        title: 'Tooltip',
        slug: 'tooltip',
        description: 'Hover and focus help with sizes and tones.',
      },
      {
        title: 'VeliProvider',
        slug: 'provider',
        description: 'Language, direction, and color-scheme runtime contract.',
      },
    ],
  },
] as const;

export const allComponents = componentGroups.flatMap((group) => group.items);

export const patterns = [
  {
    title: 'Forms',
    slug: 'forms',
    href: '/patterns/forms/',
    description: 'Recipes for React Hook Form, TanStack Form, and schema-driven renderers.',
  },
] as const;

export function getComponentGroupSlug(title: string) {
  return title.toLowerCase().replaceAll(' ', '-').replace('&', 'and');
}

/**
 * The single source of truth for every documentation navigation surface.
 * Overview entries deliberately live alongside child pages so filtering and
 * active states behave identically on desktop and mobile.
 */
export const docsSections: readonly DocsNavigationSection[] = [
  {
    id: 'foundations',
    title: 'Foundation',
    href: '/foundations/',
    items: [
      { title: 'Overview', href: '/foundations/' },
      ...foundations.map((item) => ({
        title: item.title === 'Language & direction' ? 'Language & Direction' : item.title,
        href: item.href,
        description: item.description,
      })),
    ],
  },
  {
    id: 'components',
    title: 'Components',
    href: '/docs/',
    items: [
      { title: 'Overview', href: '/docs/' },
      ...allComponents.map((item) => ({
        title: item.title,
        href: `/docs/${item.slug}/`,
        description: item.description,
      })),
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    href: '/patterns/',
    items: [
      { title: 'Overview', href: '/patterns/' },
      ...patterns.map((item) => ({
        title: item.title,
        href: item.href,
        description: item.description,
      })),
    ],
  },
  {
    id: 'ui-blocks',
    title: 'UI Blocks',
    href: '/ui-blocks/',
    items: [{ title: 'Overview', href: '/ui-blocks/' }],
  },
];

export function getComponentMeta(slug: string) {
  return allComponents.find((item) => item.slug === slug);
}
