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
  kicker: 'Documentation',
  title: 'Build with Veli',
  description:
    'Start with the foundations behind the system, then use the component references to build consistent and accessible public services.',
  documentTitle: 'Documentation | Veli Design System',
  documentDescription: 'Foundations and component documentation for the Veli Design System.',
  htmlPath: '/docs/',
  markdownPath: '/docs/index.md',
} as const;

export const foundationsOverview = {
  label: 'Foundations overview',
  kicker: 'Foundations',
  title: 'The decisions beneath every service',
  description:
    'Veli connects shared tokens, accessible components, and government service requirements into one design language.',
  documentTitle: 'Foundations | Veli Design System',
  documentDescription:
    'Principles, color, typography, spacing, motion, accessibility, language, and direction in Veli.',
  htmlPath: '/foundations/',
  markdownPath: '/foundations/index.md',
} as const;

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
    slug: 'principles',
    href: '/foundations/principles/',
    icon: '/images/foundation-icons/principles.png',
    iconWidth: 195,
    iconHeight: 195,
    description: 'The operating beliefs behind Veli: clarity, access, trust, and continuity.',
    status: 'Starter',
  },
  {
    title: 'Color',
    slug: 'color',
    href: '/foundations/color/',
    icon: '/images/foundation-icons/color.png',
    iconWidth: 191,
    iconHeight: 190,
    description:
      'Semantic light and dark palettes grounded in slate, blue, success, warning, and danger scales.',
    status: 'Available',
  },
  {
    title: 'Typography',
    slug: 'typography',
    href: '/foundations/typography/',
    icon: '/images/foundation-icons/typography.png',
    iconWidth: 256,
    iconHeight: 214,
    description:
      'Inter for Latin UI and Dhivehi font stacks for government services that need local language support.',
    status: 'Available',
  },
  {
    title: 'Spacing',
    slug: 'spacing',
    href: '/foundations/spacing/',
    icon: '/images/foundation-icons/spacing.png',
    iconWidth: 177,
    iconHeight: 177,
    description: 'A 4px baseline for predictable component rhythm and page composition.',
    status: 'Available',
  },
  {
    title: 'Motion',
    slug: 'motion',
    href: '/foundations/motion/',
    icon: '/images/foundation-icons/motion.png',
    iconWidth: 181,
    iconHeight: 182,
    description:
      'Subtle motion for orientation and feedback, always paired with reduced-motion behavior.',
    status: 'Starter',
  },
  {
    title: 'Accessibility',
    slug: 'accessibility',
    href: '/foundations/accessibility/',
    icon: '/images/foundation-icons/accessibility.png',
    iconWidth: 181,
    iconHeight: 183,
    description:
      'Keyboard, contrast, focus, semantics, and multilingual reading direction as baseline requirements.',
    status: 'Starter',
  },
  {
    title: 'Language & direction',
    slug: 'language-direction',
    href: '/foundations/language-direction/',
    icon: '/images/foundation-icons/language-direction.png',
    iconWidth: 262,
    iconHeight: 214,
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

export function getComponentGroupSlug(title: string) {
  return title.toLowerCase().replaceAll(' ', '-').replace('&', 'and');
}

export function getComponentMeta(slug: string) {
  return allComponents.find((item) => item.slug === slug);
}
