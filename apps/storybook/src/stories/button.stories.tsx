import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { useArgs } from 'storybook/internal/preview-api';
import { Button, type ButtonProps } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Plus, Trash, DownloadSimple } from 'phosphor-react';
import { DirectionalArrow } from '../utils/directional-arrow';

const iconSizeMap = {
  xl: 20,
  lg: 20,
  md: 16,
  sm: 16,
  xs: 12,
} as const;

const buttonText = {
  en: {
    argsChildren: 'Button',
    primaryButton: 'Primary Button',
    leadingIcon: 'Leading Icon',
    trailingIcon: 'Trailing Icon',
    bothIcons: 'Both Icons',
    extraLargeButton: 'XL Button',
    largeButton: 'LG Button',
    mediumButton: 'MD Button',
    smallButton: 'SM Button',
    extraSmallButton: 'XS Button',
    savingChanges: 'Saving changes...',
    disabledAction: 'Disabled Action',
  },
  dv: {
    argsChildren: 'ބަޓަން',
    primaryButton: 'މައިގަނޑު ބަޓަން',
    leadingIcon: 'ކުރީގައި އައިކަން',
    trailingIcon: 'ފަހަތުގައި އައިކަން',
    bothIcons: 'ދެކޮޅުގައި އައިކަން',
    extraLargeButton: 'ވަރަށް ބޮޑު ބަޓަން',
    largeButton: 'ބޮޑު ބަޓަން',
    mediumButton: 'މެދު ބަޓަން',
    smallButton: 'ކުޑަ ބަޓަން',
    extraSmallButton: 'ވަރަށް ކުޑަ ބަޓަން',
    savingChanges: '...ބަދަލުތައް ސޭވްކުރަނީ',
    disabledAction: 'ބޭނުންނުކުރެވޭ އެކްޝަން',
  },
} as const;

const localizedButtonTextValues = Object.values(buttonText).flatMap((text) =>
  Object.values(text),
) as readonly string[];

const buttonTextKeys = Object.keys(buttonText.en) as Array<keyof typeof buttonText.en>;

const useButtonText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? buttonText.dv : buttonText.en;
};

function getLocalizedButtonText(value: string, language: keyof typeof buttonText) {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return buttonText[language].argsChildren;
  }

  const localizedKey = buttonTextKeys.find(
    (key) => buttonText.en[key] === value || buttonText.dv[key] === value,
  );

  if (!localizedKey) {
    return value;
  }

  return buttonText[language][localizedKey];
}

function resolveButtonText(children: React.ReactNode, fallback: string) {
  if (typeof children !== 'string') {
    return children ?? fallback;
  }

  const childText = children.trim();

  if (childText.length === 0) {
    return fallback;
  }

  if (localizedButtonTextValues.includes(childText) && childText !== fallback) {
    return fallback;
  }

  return children;
}

type PreviewArgs = ButtonProps & {
  leadingIcon?: boolean;
  trailingIcon?: boolean;
};

function renderPreviewButton(args: PreviewArgs, fallback?: string) {
  const { leadingIcon, trailingIcon, children, ...buttonProps } = args;
  const text = useButtonText();
  const size = buttonProps.size ?? 'md';
  const iconSize = iconSizeMap[size];
  const buttonChildren = resolveButtonText(children, fallback ?? text.argsChildren);
  const content = buttonProps.iconOnly ? (
    <Plus size={iconSize} weight="bold" />
  ) : (
    <>
      {leadingIcon ? <Plus size={iconSize} weight="bold" /> : null}
      {buttonChildren}
      {trailingIcon ? <DirectionalArrow size={iconSize} weight="bold" /> : null}
    </>
  );
  const derivedAriaLabel =
    buttonProps['aria-label'] ??
    (typeof buttonChildren === 'string' ? buttonChildren : text.argsChildren);

  if (buttonProps.iconOnly) {
    return (
      <Button {...buttonProps} aria-label={derivedAriaLabel}>
        {content}
      </Button>
    );
  }

  return (
    <Button {...buttonProps} aria-label={buttonProps['aria-label']}>
      {content}
    </Button>
  );
}

const meta = {
  title: 'Components/Button',
  component: Button,
  render: (args: PreviewArgs) => renderPreviewButton(args),
  decorators: [
    (Story, context) => {
      const language = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const children = typeof args.children === 'string' ? args.children : '';
      const localizedChildren = getLocalizedButtonText(children, language);

      React.useEffect(() => {
        if (children !== localizedChildren) {
          updateArgs?.({ children: localizedChildren });
        }
      }, [children, localizedChildren, updateArgs]);

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
      options: ['primary', 'secondary', 'danger', 'accent'],
    },
    appearance: {
      control: 'select',
      options: ['fill', 'transparent', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    isLoading: {
      control: 'boolean',
    },
    iconOnly: {
      control: 'boolean',
    },
    leadingIcon: {
      control: 'boolean',
    },
    trailingIcon: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  args: {
    children: buttonText.en.argsChildren,
    intent: 'primary',
    appearance: 'fill',
    size: 'md',
    iconOnly: false,
    leadingIcon: false,
    trailingIcon: false,
  },
} satisfies Meta<PreviewArgs>;

export default meta;
type Story = StoryObj<PreviewArgs>;

/**
 * The default button style used for most actions.
 */
export const Primary: Story = {
  render: (args: PreviewArgs) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.primaryButton);
  },
  args: {
    children: buttonText.en.primaryButton,
  },
};

/**
 * A comprehensive view of all button variants and styles.
 * Useful for auditing visual consistency across the design system.
 */
export const AllVariants: Story = {
  render: () => {
    const text = useButtonText();

    return (
      <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
        <div />
        <div className="text-xs font-bold uppercase tracking-wider text-base-muted">Fill</div>
        <div className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Transparent
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-base-muted">Ghost</div>

        <div className="text-sm font-medium">Primary</div>
        <Button intent="primary" appearance="fill">
          {text.argsChildren}
        </Button>
        <Button intent="primary" appearance="transparent">
          {text.argsChildren}
        </Button>
        <Button intent="primary" appearance="ghost">
          {text.argsChildren}
        </Button>

        <div className="text-sm font-medium">Secondary</div>
        <Button intent="secondary" appearance="fill">
          {text.argsChildren}
        </Button>
        <Button intent="secondary" appearance="transparent">
          {text.argsChildren}
        </Button>
        <Button intent="secondary" appearance="ghost">
          {text.argsChildren}
        </Button>

        <div className="text-sm font-medium">Danger</div>
        <Button intent="danger" appearance="fill">
          {text.argsChildren}
        </Button>
        <Button intent="danger" appearance="transparent">
          {text.argsChildren}
        </Button>
        <Button intent="danger" appearance="ghost">
          {text.argsChildren}
        </Button>

        <div className="text-sm font-medium">Accent</div>
        <Button intent="accent" appearance="fill">
          {text.argsChildren}
        </Button>
        <div className="text-xs text-base-muted">Fill only</div>
        <div className="text-xs text-base-muted">Fill only</div>
      </div>
    );
  },
};

/**
 * Demonstrates common icon placement patterns with correct Figma sizing:
 * XL/LG: 20px, MD/SM: 16px, XS: 12px.
 */
export const WithIcons: Story = {
  render: (args: PreviewArgs) => {
    const text = useButtonText();
    const size = iconSizeMap[args.size as keyof typeof iconSizeMap] || 16;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button {...args}>
            <Plus size={size} weight="bold" />
            {text.leadingIcon}
          </Button>
          <Button {...args}>
            {text.trailingIcon}
            <DirectionalArrow size={size} weight="bold" />
          </Button>
          <Button {...args}>
            <DownloadSimple size={size} weight="bold" />
            {text.bothIcons}
            <DirectionalArrow size={size} weight="bold" />
          </Button>
        </div>
        <div className="text-xs text-base-muted italic">
          Icon size for current {args.size} scale: {size}px
        </div>
      </div>
    );
  },
};

/**
 * Icon-only buttons keep the existing intent, appearance, and size system,
 * while switching to a square footprint. Provide an accessible label.
 */
export const IconOnly: Story = {
  render: (args: PreviewArgs) => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button {...args} size="xl" iconOnly aria-label="Add item">
        <Plus size={24} weight="bold" />
      </Button>
      <Button
        {...args}
        intent="secondary"
        appearance="transparent"
        size="lg"
        iconOnly
        aria-label="Download file"
      >
        <DownloadSimple size={20} weight="bold" />
      </Button>
      <Button
        {...args}
        intent="danger"
        appearance="ghost"
        size="md"
        iconOnly
        aria-label="Delete item"
      >
        <Trash size={16} weight="bold" />
      </Button>
      <Button
        {...args}
        intent="primary"
        appearance="fill"
        size="sm"
        iconOnly
        isLoading
        aria-label="Saving"
      >
        <Plus size={16} weight="bold" />
      </Button>
    </div>
  ),
};

/**
 * All supported sizes shown side-by-side with correctly sized icons.
 */
export const Sizes: Story = {
  render: (args: PreviewArgs) => {
    const text = useButtonText();

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4 flex-wrap">
          <Button {...args} size="xl">
            <Plus size={20} weight="bold" /> {text.extraLargeButton}
          </Button>
          <Button {...args} size="lg">
            <Plus size={20} weight="bold" /> {text.largeButton}
          </Button>
          <Button {...args} size="md">
            <Plus size={16} weight="bold" /> {text.mediumButton}
          </Button>
          <Button {...args} size="sm">
            <Plus size={16} weight="bold" /> {text.smallButton}
          </Button>
          <Button {...args} size="xs">
            <Plus size={12} weight="bold" /> {text.extraSmallButton}
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Displays a loading spinner while preserving the button's dimensions.
 */
export const Loading: Story = {
  render: (args: PreviewArgs) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.savingChanges);
  },
  args: {
    isLoading: true,
    children: buttonText.en.savingChanges,
  },
};

/**
 * Standard disabled state. Prevents all user interaction.
 */
export const Disabled: Story = {
  render: (args: PreviewArgs) => {
    const text = useButtonText();

    return renderPreviewButton(args, text.disabledAction);
  },
  args: {
    isDisabled: true,
    children: buttonText.en.disabledAction,
  },
};
