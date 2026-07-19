export type ComponentItem = {
  title: string;
  slug: string;
  description: string;
};

export type ComponentGroup = {
  title: string;
  items: ComponentItem[];
};

export const proposals: ComponentItem[] = [
  {
    title: 'PD-442 Token Hierarchy Refactor',
    slug: 'pd-442-token-hierarchy-refactor',
    description:
      'Temporary proposal for a themeable primitive, brand, semantic, and component token hierarchy.',
  },
] as const;

export const externalResources = [
  {
    label: 'Figma',
    href: 'https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Design-System',
    icon: 'figma',
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
    href: '/foundations/#principles',
    description: 'The operating beliefs behind Veli: clarity, access, trust, and continuity.',
    status: 'Starter',
  },
  {
    title: 'Color',
    href: '/foundations/#color',
    description:
      'Semantic light and dark palettes grounded in slate, blue, success, warning, and danger scales.',
    status: 'Available',
  },
  {
    title: 'Typography',
    href: '/foundations/#typography',
    description:
      'Inter for Latin UI and Dhivehi font stacks for government services that need local language support.',
    status: 'Available',
  },
  {
    title: 'Spacing',
    href: '/foundations/#spacing',
    description: 'A 4px baseline for predictable component rhythm and page composition.',
    status: 'Available',
  },
  {
    title: 'Motion',
    href: '/foundations/#motion',
    description:
      'Subtle motion for orientation and feedback, always paired with reduced-motion behavior.',
    status: 'Starter',
  },
  {
    title: 'Accessibility',
    href: '/foundations/#accessibility',
    description:
      'Keyboard, contrast, focus, semantics, and multilingual reading direction as baseline requirements.',
    status: 'Starter',
  },
  {
    title: 'Language & direction',
    href: '/foundations/#language-direction',
    description:
      'Provider support for English, Dhivehi, LTR, RTL, and system color-scheme behavior.',
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

export function getComponentMeta(slug: string) {
  return allComponents.find((item) => item.slug === slug);
}
