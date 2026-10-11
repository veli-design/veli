import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Button, type ButtonProps } from '@tradenetcorp/veli-ui/button';
import { VeliProvider, useVeliLanguage, useVeliColorScheme } from '@tradenetcorp/veli-ui/provider';
import { PlusIcon } from '@phosphor-icons/react';
import { DirectionalArrow } from '../utils/directional-arrow';
import {
  verifyButtonRegressions,
  verifyButtonLinkRegressions,
  verifyButtonRouterComposition,
  verifyButtonLinkFocusContext,
} from '../tests/button';

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
    await verifyButtonLinkRegressions(canvasElement);
  },
};

const navigationText = {
  en: {
    title: 'Link buttons',
    available: 'Available',
    disabled: 'Disabled',
    loading: 'Loading',
    iconOnly: 'Icon only',
    openLink: 'Open Link',
    account: 'Account',
    routingTitle: 'Client routing',
    currentRoute: 'Current route',
    home: 'Home',
    settings: 'Settings',
  },
  dv: {
    title: 'ލިންކް ބަޓަންތައް',
    available: 'ބޭނުންކުރެވޭ',
    disabled: 'ބޭނުންނުކުރެވޭ',
    loading: 'ލޯޑުވަނީ',
    iconOnly: 'އައިކަން އެކަނި',
    openLink: 'ލިންކް ހުޅުވާ',
    account: 'އެކައުންޓު',
    routingTitle: 'ޞަފްޙާތަކާ ދެމެދު ދިއުން',
    currentRoute: 'މިހާރުގެ ރޫޓު',
    home: 'މައި ޞަފްޙާ',
    settings: 'ސެޓިންގްސް',
  },
} as const;

function ButtonNavigation() {
  const { language } = useVeliLanguage();
  const text = navigationText[language];
  const examples = [
    { id: 'available', title: text.available },
    { id: 'disabled', title: text.disabled },
    { id: 'loading', title: text.loading },
    { id: 'icon-only', title: text.iconOnly },
  ];

  return (
    <div className="w-[min(42rem,calc(100vw-2rem))] space-y-6">
      <header className="space-y-2">
        <h2 className="type-subtitle-medium">{text.title}</h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {examples.map(({ id, title }) => (
          <section
            key={id}
            aria-labelledby={`button-link-${id}`}
            className="space-y-3 rounded-xl border border-base-subtle p-4"
          >
            <h3 id={`button-link-${id}`} className="type-body-md-medium">
              {title}
            </h3>
            {id === 'icon-only' ? (
              <Button
                as="a"
                href="https://www.mindco.mv/"
                target="_blank"
                rel="noopener noreferrer"
                iconOnly
                aria-label={text.openLink}
              >
                <DirectionalArrow aria-hidden="true" size={16} />
              </Button>
            ) : (
              <Button
                as="a"
                href="https://www.mindco.mv/"
                target="_blank"
                rel="noopener noreferrer"
                isDisabled={id === 'disabled'}
                isLoading={id === 'loading'}
              >
                {text.openLink}
              </Button>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export const Navigation: Story = {
  name: 'Link buttons',
  parameters: exampleParameters,
  render: () => <ButtonNavigation />,
};

function ButtonClientRouting() {
  const { language } = useVeliLanguage();
  const { colorScheme } = useVeliColorScheme();
  const text = navigationText[language];
  const routes = [
    { href: '#home', label: text.home },
    { href: '#account', label: text.account },
    { href: '#settings', label: text.settings },
  ];
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash;
    return routes.some(({ href }) => href === hash) ? hash : '#home';
  });
  const currentPage = routes.find(({ href }) => href === route)?.label;

  return (
    <div className="w-[min(42rem,calc(100vw-2rem))] space-y-6">
      <header className="space-y-2">
        <h2 className="type-subtitle-medium">{text.routingTitle}</h2>
      </header>
      <VeliProvider language={language} colorScheme={colorScheme} navigate={setRoute}>
        <nav aria-label={text.routingTitle} className="flex flex-wrap gap-3">
          {routes.map(({ href, label }) => (
            <Button
              key={href}
              as="a"
              href={href}
              appearance={route === href ? 'fill' : 'ghost'}
              aria-current={route === href ? 'page' : undefined}
            >
              {label}
            </Button>
          ))}
        </nav>
        <section
          id={route.slice(1)}
          aria-labelledby="button-route-heading"
          className="mt-4 space-y-3 rounded-xl border border-base-subtle p-4"
        >
          <h3 id="button-route-heading" className="type-subtitle-medium">
            {currentPage}
          </h3>
          <p role="status" className="type-body-sm-regular">
            {text.currentRoute}:{' '}
            <code dir="ltr" className="inline-block">
              {route}
            </code>
          </p>
        </section>
      </VeliProvider>
    </div>
  );
}

export const ClientRouting: Story = {
  parameters: exampleParameters,
  render: () => <ButtonClientRouting />,
  play: async ({ canvasElement }) => {
    await verifyButtonRouterComposition(canvasElement);
    await verifyButtonLinkFocusContext(canvasElement);
  },
};
