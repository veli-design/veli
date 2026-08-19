import manifest from '@tradenetcorp/veli-ui/manifest';

export type ComponentItem = {
  title: string;
  slug: string;
  description: string;
};

export type ComponentGroup = {
  id: string;
  title: string;
  items: ComponentItem[];
};

export const externalResources = [
  {
    label: 'Figma',
    href: 'https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Design-System',
    icon: 'figma',
  },
  { label: 'GitHub', href: 'https://github.com/tradenetcorp/veli', icon: 'github' },
  {
    label: 'Package',
    href: 'https://github.com/tradenetcorp/veli/pkgs/npm/veli-ui',
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

export const componentGroups: ComponentGroup[] = manifest.groups.map((group) => ({
  id: group.id,
  title: group.title,
  items: group.components.map((component) => ({
    title: component.name,
    slug: component.id,
    description: component.summary,
  })),
}));

export const allComponents = componentGroups.flatMap((group) => group.items);

export function getComponentMeta(slug: string) {
  return allComponents.find((item) => item.slug === slug);
}
