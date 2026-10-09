import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Button, type ButtonProps } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { PlusIcon } from '@phosphor-icons/react';
import { DirectionalArrow } from '../utils/directional-arrow';
import { verifyButtonRegressions } from '../tests/button';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const iconSizeMap = { xs: 12, sm: 16, md: 16, lg: 20, xl: 20 } as const;
const appearances = ['fill', 'transparent', 'ghost'] as const;
const intents = ['primary', 'secondary', 'danger', 'accent'] as const;

const buttonText = {
  en: {
    label: 'Continue',
    add: 'Add item',
    disabled: 'Unavailable',
    loading: 'Loading',
    pending: 'Pending',
  },
  dv: {
    label: 'ކުރިއަށް',
    add: 'އެއްކުރޭ',
    disabled: 'ބޭނުންނުކުރެވޭ',
    loading: 'ލޯޑުވަނީ',
    pending: 'އިންތިޒާރުކުރަނީ',
  },
} as const;

function useButtonText() {
  const { direction } = useVeliLanguage();
  return buttonText[direction === 'rtl' ? 'dv' : 'en'];
}

type PreviewArgs = ButtonProps & {
  leadingIcon?: boolean;
  trailingIcon?: boolean;
};

function PlaygroundButton({ leadingIcon, trailingIcon, children, ...props }: PreviewArgs) {
  const text = useButtonText();
  const iconSize = iconSizeMap[props.size ?? 'md'];
  const label =
    children === buttonText.en.label || children === buttonText.dv.label
      ? text.label
      : (children ?? text.label);

  if (props.iconOnly) {
    return (
      <Button {...props} aria-label={props['aria-label'] || text.add}>
        <PlusIcon aria-hidden="true" size={iconSize} weight="bold" />
      </Button>
    );
  }

  return (
    <Button {...props}>
      {leadingIcon && <PlusIcon aria-hidden="true" size={iconSize} weight="bold" />}
      {label}
      {trailingIcon && <DirectionalArrow aria-hidden="true" size={iconSize} weight="bold" />}
    </Button>
  );
}

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [name, { ...argType, table: { category } }]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const meta = {
  title: 'Components/Button',
  component: Button,
  render: (args) => <PlaygroundButton {...args} />,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
      include: [
        'intent',
        'appearance',
        'size',
        'iconOnly',
        'children',
        'isDisabled',
        'isLoading',
        'isPending',
        'aria-label',
        'aria-describedby',
        'aria-busy',
        'onPress',
        'onFocus',
        'onBlur',
        'leadingIcon',
        'trailingIcon',
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      intent: { control: 'select', options: intents },
      appearance: {
        control: 'select',
        options: appearances,
        if: { arg: 'intent', neq: 'accent' },
        description: 'Accent supports fill only.',
      },
      size: { control: 'select', options: sizes },
      iconOnly: { control: 'boolean' },
    }),
    ...withArgCategory('Content', {
      children: { control: 'text', description: 'A label and optional icon elements.' },
    }),
    ...withArgCategory('State', {
      isDisabled: { control: 'boolean' },
      isLoading: { control: 'boolean' },
      isPending: { control: 'boolean', description: 'Uses the same loading treatment.' },
    }),
    ...withArgCategory('Accessibility', {
      'aria-label': { control: 'text' },
      'aria-describedby': { control: 'text' },
      'aria-busy': { control: 'boolean' },
    }),
    ...withArgCategory('Events', {
      onPress: { action: 'pressed', control: false },
      onFocus: { action: 'focused', control: false },
      onBlur: { action: 'blurred', control: false },
    }),
    ...withArgCategory('Demo icons', {
      leadingIcon: { control: 'boolean', description: 'Story control, not a Button prop.' },
      trailingIcon: { control: 'boolean', description: 'Story control, not a Button prop.' },
    }),
    className: { control: false, table: { disable: true } },
    ref: { control: false, table: { disable: true } },
    render: { control: false, table: { disable: true } },
    slot: { control: false, table: { disable: true } },
    type: { control: false, table: { disable: true } },
    name: { control: false, table: { disable: true } },
    value: { control: false, table: { disable: true } },
  },
  args: {
    children: buttonText.en.label,
    intent: 'primary',
    appearance: 'fill',
    size: 'md',
    iconOnly: false,
    isDisabled: false,
    isLoading: false,
    isPending: false,
    leadingIcon: false,
    trailingIcon: false,
  },
} satisfies Meta<PreviewArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// These examples own their props; changing playground controls must not imply otherwise.
const exampleParameters = { controls: { disable: true }, actions: { disable: true } };

export const Playground: Story = {};

export const Variants: Story = {
  parameters: exampleParameters,
  render: function Variants() {
    const text = useButtonText();
    return (
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {intents.map((intent) => (
          <div key={intent} className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-base-muted">{intent}</span>
            <div className="flex flex-wrap items-center gap-3">
              {intent === 'accent' ? (
                <Button intent="accent" appearance="fill">
                  {text.label}
                </Button>
              ) : (
                appearances.map((appearance) => (
                  <Button key={appearance} intent={intent} appearance={appearance}>
                    {text.label}
                  </Button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const SizesAndIcons: Story = {
  parameters: exampleParameters,
  render: function SizesAndIcons() {
    const text = useButtonText();
    return (
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {sizes.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            <span className="w-6 text-sm text-base-muted">{size}</span>
            <Button size={size}>{text.label}</Button>
            <Button size={size} intent="secondary">
              <PlusIcon aria-hidden="true" size={iconSizeMap[size]} weight="bold" />
              {text.label}
              <DirectionalArrow aria-hidden="true" size={iconSizeMap[size]} weight="bold" />
            </Button>
            <Button size={size} iconOnly aria-label={text.add}>
              <PlusIcon aria-hidden="true" size={iconSizeMap[size]} weight="bold" />
            </Button>
          </div>
        ))}
      </div>
    );
  },
};

function ButtonStates({ onPress }: Pick<ButtonProps, 'onPress'>) {
  const text = useButtonText();

  return (
    <div className="flex max-w-2xl flex-wrap items-center gap-3">
      <Button onPress={onPress}>{text.label}</Button>
      <Button isDisabled onPress={onPress}>
        {text.disabled}
      </Button>
      <Button isLoading onPress={onPress}>
        {text.loading}
      </Button>
      <Button isPending onPress={onPress}>
        {text.pending}
      </Button>
      <Button iconOnly isLoading aria-label={text.add} onPress={onPress}>
        <PlusIcon aria-hidden="true" size={16} weight="bold" />
      </Button>
    </div>
  );
}

export const States: Story = {
  parameters: exampleParameters,
  args: { onPress: fn() },
  render: ({ onPress }) => <ButtonStates onPress={onPress} />,
  play: async ({ args, canvasElement, globals }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const text = buttonText[globals.language === 'dv' ? 'dv' : 'en'];
    const action = canvas.getByRole('button', { name: text.label });
    const disabled = canvas.getByRole('button', { name: text.disabled });
    const loading = canvas.getByRole('button', { name: text.loading });
    const pending = canvas.getByRole('button', { name: text.pending });

    action.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('[Space>]');
    await expect(action).toHaveAttribute('data-pressed');
    // The label inherits the button's scale instead of cancelling it with an inverse scale.
    await expect(getComputedStyle(canvas.getByText(text.label, { exact: true })).scale).toBe(
      'none',
    );
    await user.keyboard('[/Space]');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
    await expect(disabled).toBeDisabled();
    action.focus();
    await user.tab();
    await expect(loading).toHaveFocus();

    for (const button of [loading, pending]) {
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      await user.click(button);
      await user.keyboard('{Enter}');
    }
    await expect(args.onPress).toHaveBeenCalledTimes(2);
    pending.blur();
    await verifyButtonRegressions(canvasElement);
  },
};
