import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import type { ComponentProps } from 'react';
import { Link } from '@tradenetcorp/veli-ui/link';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { DownloadSimple, Plus } from 'phosphor-react';
import { DirectionalArrow } from '../utils/directional-arrow';

const linkText = {
  en: {
    argsChildren: 'Link Label',
    defaultLink: 'Default Link',
    extraSmall: 'Extra Small',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra Large',
    plain: 'Plain',
    hoverUnderline: 'Hover Underline',
    alwaysUnderline: 'Always Underline',
    defaultHeader: 'Default',
    secondaryHeader: 'Secondary',
    linkLabel: 'Link',
    stateDefaultLabel: 'Default',
    stateHoverLabel: 'Hover',
    statePressedLabel: 'Pressed',
    stateDisabledLabel: 'Disabled',
    disabledIconLabel: 'Disabled Icon',
    stateDefaultLink: 'Default Link',
    stateHoverLink: 'Hover State',
    statePressedLink: 'Pressed State',
    stateDisabledLink: 'Disabled Link',
    stateDisabledText: 'Disabled',
    leadingIcon: 'Leading Icon',
    trailingIcon: 'Trailing Icon',
    bothIcons: 'Both Icons',
    smallPrefix: 'Small text with an ',
    bodyPrefix: 'Body text with an ',
    largePrefix: 'Large text with an ',
    inheritedLink: 'inherited link',
    iconsLabel: (value: number) => `${value}px icons`,
    labelIcons: (value: string) => `${value} icons`,
  },
  dv: {
    argsChildren: 'ލިންކުގެ ލިޔުން',
    defaultLink: 'އާދައިގެ ލިންކް',
    extraSmall: 'ވަރަށް ކުޑަ',
    small: 'ކުޑަ',
    medium: 'މެދު',
    large: 'ބޮޑު',
    extraLarge: 'ވަރަށް ބޮޑު',
    plain: 'ސާދާ',
    hoverUnderline: 'ހޯވަރ',
    alwaysUnderline: 'އަބަދުވެސް ރޮނގުދަމާފައި',
    defaultHeader: 'އާދައިގެ',
    secondaryHeader: 'ދެވަނަ',
    linkLabel: 'ލިންކް',
    stateDefaultLabel: 'އާދައިގެ',
    stateHoverLabel: 'ހޯވަރ',
    statePressedLabel: 'ފިތާލާފައި',
    stateDisabledLabel: 'ބޭނުންނުކުރެވޭ',
    disabledIconLabel: 'ބޭނުންނުކުރެވޭ އައިކަން',
    stateDefaultLink: 'އާދައިގެ ލިންކް',
    stateHoverLink: 'ހޯވަރ',
    statePressedLink: 'ފިތާލާފައި',
    stateDisabledLink: 'ބޭނުންނުކުރެވޭ ލިންކް',
    stateDisabledText: 'ބޭނުންނުކުރެވޭ',
    leadingIcon: 'ކުރީގައި އައިކަން',
    trailingIcon: 'ފަހަތުގައި އައިކަން',
    bothIcons: 'ދެކޮޅުގައި އައިކަން',
    smallPrefix: 'ވާރުތަވާ ލިންކަކާއެކު އިންނަ ކުޑަ ލިޔުމެއް ',
    bodyPrefix: 'ވާރުތަވާ ލިންކަކާއެކު އިންނަ މައިގަނޑު ލިޔުމެއް ',
    largePrefix: 'ވާރުތަވާ ލިންކަކާއެކު އިންނަ ބޮޑު ލިޔުމެއް ',
    inheritedLink: 'ވާރުތަވާ ލިންކް',
    iconsLabel: (value: number) => `${value} އައިކޮން`,
    labelIcons: (value: string) => `${value} އައިކޮން`,
  },
} as const;

type LinkText = (typeof linkText)[keyof typeof linkText];

const useLinkText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? linkText.dv : linkText.en;
};

const linkSizeExamples = (text: LinkText) =>
  [
    { className: 'type-caption-12-regular', label: text.extraSmall, size: 'sm' },
    { className: 'type-body-sm-regular', label: text.small, size: 'sm' },
    { className: 'type-body-md-regular', label: text.medium, size: 'md' },
    { className: 'type-body-lg-regular', label: text.large, size: 'lg' },
    { className: 'type-subtitle-regular', label: text.extraLarge, size: 'lg' },
  ] as const;

const meta = {
  title: 'Components/Link',
  component: Link,
  decorators: [
    (Story, context) => {
      const language = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const children = typeof args.children === 'string' ? args.children : '';
      const localizedChildren =
        language === 'dv' ? linkText.dv.argsChildren : linkText.en.argsChildren;
      const previousLocalizedChildren =
        language === 'dv' ? linkText.en.argsChildren : linkText.dv.argsChildren;

      useEffect(() => {
        if (children.trim() === '' || children === previousLocalizedChildren) {
          updateArgs?.({ children: localizedChildren });
        }
      }, [children, language, localizedChildren, previousLocalizedChildren, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    underline: {
      control: 'select',
      options: ['none', 'hover', 'always'],
    },
    isDisabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
  args: {
    children: linkText.en.argsChildren,
    intent: 'default',
    size: 'md',
    underline: 'hover',
    href: '#',
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

const resolveLinkChildren = (
  args: Partial<Pick<ComponentProps<typeof Link>, 'children'>>,
  fallback: string,
) => {
  if (typeof args.children === 'string') {
    const childText = args.children.trim();

    if (childText.length === 0) {
      return fallback;
    }

    if (childText === linkText.en.argsChildren && childText !== fallback) {
      return fallback;
    }

    if (childText === linkText.dv.argsChildren && childText !== fallback) {
      return fallback;
    }

    return childText;
  }

  return fallback;
};

/**
 * The default link style, typically used for navigation and inline references.
 */
export const Default: Story = {
  render: (args) => {
    const text = useLinkText();
    const linkTextValue = resolveLinkChildren(args, text.argsChildren);

    return <Link {...args}>{linkTextValue}</Link>;
  },
};

/**
 * A comprehensive view of all link variants and underlining options.
 * Useful for auditing visual consistency across the design system.
 */
export const AllVariants: Story = {
  render: (args) => {
    const text = useLinkText();
    const linkTextValue = resolveLinkChildren(args, text.linkLabel);

    return (
      <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
        <div />
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
          {text.plain}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
          {text.hoverUnderline}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
          {text.alwaysUnderline}
        </div>

        <div className="text-sm font-medium">{text.defaultHeader}</div>
        <div className="flex justify-center">
          <Link intent="default" underline="none">
            {linkTextValue}
          </Link>
        </div>
        <div className="flex justify-center">
          <Link intent="default" underline="hover">
            {linkTextValue}
          </Link>
        </div>
        <div className="flex justify-center">
          <Link intent="default" underline="always">
            {linkTextValue}
          </Link>
        </div>

        <div className="text-sm font-medium">{text.secondaryHeader}</div>
        <div className="flex justify-center">
          <Link intent="secondary" underline="none">
            {linkTextValue}
          </Link>
        </div>
        <div className="flex justify-center">
          <Link intent="secondary" underline="hover">
            {linkTextValue}
          </Link>
        </div>
        <div className="flex justify-center">
          <Link intent="secondary" underline="always">
            {linkTextValue}
          </Link>
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates the interactive and non-interactive states of the Link component.
 * Uses forced state props to visually audit designs without manual interaction.
 */
export const StatesAudit: Story = {
  render: () => {
    const text = useLinkText();

    return (
      <div className="flex items-center gap-16">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
            {text.stateDefaultLabel}
          </span>
          <Link href="#">{text.stateDefaultLink}</Link>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
            {text.stateHoverLabel}
          </span>
          <Link href="#" isHovered={true}>
            {text.stateHoverLink}
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
            {text.statePressedLabel}
          </span>
          <Link href="#" isPressed={true}>
            {text.statePressedLink}
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
            {text.stateDisabledLabel}
          </span>
          <Link href="#" isDisabled={true}>
            {text.stateDisabledLink}
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
            {text.disabledIconLabel}
          </span>
          <Link href="#" isDisabled={true}>
            {text.stateDisabledText}
            <DirectionalArrow weight="bold" />
          </Link>
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates common icon placement patterns. Icons inherit their size from the link's `size` prop.
 */
export const WithIcons: Story = {
  render: (args) => {
    const text = useLinkText();
    const leadingIconText = resolveLinkChildren(args, text.leadingIcon);
    const trailingIconText = resolveLinkChildren(args, text.trailingIcon);
    const bothIconsText = resolveLinkChildren(args, text.bothIcons);

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-16">
          <Link {...args}>
            <Plus weight="bold" />
            {leadingIconText}
          </Link>
          <Link {...args}>
            {trailingIconText}
            <DirectionalArrow weight="bold" />
          </Link>
          <Link {...args}>
            <DownloadSimple weight="bold" />
            {bothIconsText}
            <DirectionalArrow weight="bold" />
          </Link>
        </div>
      </div>
    );
  },
};

/**
 * The `size` prop sets default icon dimensions via `[&_svg]` classes.
 * Typography still inherits from the surrounding context.
 */
export const ComponentSizes: Story = {
  render: (args) => {
    const text = useLinkText();
    const linkTextValue = resolveLinkChildren(args, text.linkLabel);

    return (
      <div className="flex flex-col gap-6 type-body-md-regular">
        {(
          [
            { size: 'sm', label: text.small, iconSize: 16 },
            { size: 'md', label: text.medium, iconSize: 16 },
            { size: 'lg', label: text.large, iconSize: 20 },
          ] as const
        ).map(({ size, label, iconSize }) => (
          <div key={size} className="flex items-center gap-6">
            <span className="w-20 text-text-default-muted">{label}</span>
            <Link {...args} size={size}>
              <Plus weight="bold" />
              {label} {linkTextValue}
              <DirectionalArrow weight="bold" />
            </Link>
            <span className="text-xs text-text-default-muted italic">
              {text.iconsLabel(iconSize)}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Links inherit typography from their surrounding context.
 * Icon sizes should match the parent typography scale.
 */
export const Sizes: Story = {
  render: (args) => {
    const text = useLinkText();
    const linkTextValue = resolveLinkChildren(args, text.linkLabel);

    return (
      <div className="flex flex-col gap-6">
        {linkSizeExamples(text).map(({ className, label, size }) => (
          <div key={label} className="flex items-center gap-6">
            <span className={`${className} w-28 text-text-default-muted`}>{label}</span>
            <span className={className}>
              <Link {...args} size={size}>
                <Plus weight="bold" />
                {label} {linkTextValue}
                <DirectionalArrow weight="bold" />
              </Link>
            </span>
            <span className="text-xs text-text-default-muted italic">{text.labelIcons(size)}</span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Links inherit typography when embedded inline within body copy.
 */
export const InheritedTypography: Story = {
  render: (args) => {
    const text = useLinkText();
    const linkTextValue = resolveLinkChildren(args, text.inheritedLink);

    return (
      <div className="flex flex-col gap-4">
        <p className="type-caption-12-regular">
          {text.smallPrefix}
          <Link {...args} size="sm">
            <Plus weight="bold" />
            {linkTextValue}
          </Link>
        </p>
        <p className="type-body-md-regular">
          {text.bodyPrefix}
          <Link {...args} size="md">
            {linkTextValue}
            <DirectionalArrow weight="bold" />
          </Link>
        </p>
        <p className="type-subtitle-regular">
          {text.largePrefix}
          <Link {...args} size="lg">
            <Plus weight="bold" />
            {linkTextValue}
          </Link>
        </p>
      </div>
    );
  },
};
