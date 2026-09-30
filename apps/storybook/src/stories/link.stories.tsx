import { useEffect, useRef, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { Link } from '@tradenetcorp/veli-ui/link';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Plus } from 'phosphor-react';
import { DirectionalArrow } from '../utils/directional-arrow';

const linkText = {
  en: {
    label: 'Continue',
    default: 'Default',
    secondary: 'Secondary',
    none: 'None',
    hover: 'On hover',
    always: 'Always',
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    hovered: 'Hovered',
    pressed: 'Pressed',
    focus: 'Keyboard focus',
    disabled: 'Disabled',
    prefix: 'Read the ',
    inline: 'guidance for completing your application and providing supporting information',
    suffix: ' before continuing.',
    current: 'Current account',
    unavailable: 'Unavailable account',
    focusLink: 'Focus current link',
    destination: 'Account destination',
  },
  dv: {
    label: 'ކުރިއަށް',
    default: 'އާދައިގެ',
    secondary: 'ދެވަނަ',
    none: 'ރޮނގެއް ނެތް',
    hover: 'ހޯވަރ',
    always: 'އަބަދުވެސް',
    sm: 'ކުޑަ',
    md: 'މެދު',
    lg: 'ބޮޑު',
    hovered: 'ހޯވަރ',
    pressed: 'ފިތާލާފައި',
    focus: 'ކީބޯޑު ފޯކަސް',
    disabled: 'ބޭނުންނުކުރެވޭ',
    prefix: 'ކުރިއަށް ދިއުމުގެ ކުރިން ',
    inline: 'އެދުން ފުރިހަމަކުރުމާއި ބޭނުންވާ މަޢުލޫމާތު ހުށަހެޅުމުގެ އިރުޝާދު',
    suffix: ' ކިޔާލައްވާ.',
    current: 'މިހާރުގެ އެކައުންޓު',
    unavailable: 'ބޭނުންނުކުރެވޭ އެކައުންޓު',
    focusLink: 'ލިންކަށް ފޯކަސް ކުރައްވާ',
    destination: 'އެކައުންޓު',
  },
} as const;

function useLinkText() {
  const { language } = useVeliLanguage();
  return linkText[language === 'dv' ? 'dv' : 'en'];
}

function LinkDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let frame = 0;
    let attempts = 0;
    const groups = ['Content', 'State'];
    const collapseGroups = () => {
      const rows = groups.map((group) =>
        document.querySelector(
          'tr[title^="Hide ' + group + ' item"], tr[title^="Show ' + group + ' item"]',
        ),
      );
      if (rows.some((row) => !row) && attempts++ < 40) {
        frame = requestAnimationFrame(collapseGroups);
        return;
      }
      rows.forEach((row) => {
        if (row?.getAttribute('title')?.startsWith('Hide ')) {
          row.querySelector<HTMLElement>('[tabindex="0"]')?.click();
        }
      });
    };
    collapseGroups();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <DocsContainer {...props} />;
}

type LinkStoryArgs = ComponentProps<typeof Link> & {
  leadingIcon: boolean;
  trailingIcon: boolean;
};

function LinkDefault({ leadingIcon, trailingIcon, children, ...args }: LinkStoryArgs) {
  return (
    <span className="type-body-md-regular">
      <Link {...args}>
        {(state) => (
          <>
            {leadingIcon && <Plus weight="bold" aria-hidden="true" />}
            {typeof children === 'function' ? children(state) : children}
            {trailingIcon && <DirectionalArrow weight="bold" aria-hidden="true" />}
          </>
        )}
      </Link>
    </span>
  );
}

const meta = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const children = args.children;
      useEffect(() => {
        if (
          typeof children === 'string' &&
          (children === linkText.en.label || children === linkText.dv.label)
        ) {
          const localized = linkText[language].label;
          if (children !== localized) updateArgs({ children: localized });
        }
      }, [children, language, updateArgs]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: { sort: 'none', exclude: /^on[A-Z]/ },
    docs: {
      container: LinkDocsContainer,
      description: {
        component:
          'A navigation link that inherits all surrounding typography when size is omitted. An explicit sm, md, or lg applies the corresponding medium body preset for English or Dhivehi. Icons are 16px by default and for sm/md, or 20px for lg. Compose icons through children; use render for compatible router links. className and style overrides are not supported.\n\n' +
          'React Aria callbacks pass through: onPress, onPressStart, onPressEnd, onPressUp, onPressChange, onHoverStart, onHoverEnd, onHoverChange, onFocus, onBlur, onFocusChange, onKeyDown, and onKeyUp. States tests keyboard and pointer callbacks; Routing demonstrates refs, render, and function children. Callbacks and function-valued props are not editable controls.',
      },
    },
  },
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary'],
      table: { category: 'Appearance' },
    },
    size: {
      control: { type: 'select', labels: { undefined: 'Inherit (no size)' } },
      options: [undefined, 'sm', 'md', 'lg'],
      description:
        'Omit to inherit typography. sm/md/lg apply medium body presets and 16/16/20px icons.',
      table: { category: 'Appearance', defaultValue: { summary: 'Omitted (inherit)' } },
    },
    underline: {
      control: 'select',
      options: ['none', 'hover', 'always'],
      table: { category: 'Appearance' },
    },
    children: {
      control: 'text',
      description: 'Content, or a function of React Aria link state (see Routing).',
      table: { category: 'Content' },
    },
    leadingIcon: {
      control: 'boolean',
      description: 'Story-only icon composition control.',
      table: { category: 'Content' },
    },
    trailingIcon: {
      control: 'boolean',
      description: 'Story-only icon composition control.',
      table: { category: 'Content' },
    },
    href: { control: 'text', table: { category: 'Navigation' } },
    target: { control: 'select', options: ['_self', '_blank'], table: { category: 'Navigation' } },
    rel: { control: 'text', table: { category: 'Navigation' } },
    hrefLang: { control: 'text', table: { category: 'Navigation' } },
    ping: { control: 'text', table: { category: 'Navigation' } },
    referrerPolicy: {
      control: 'select',
      options: [undefined, 'no-referrer', 'same-origin', 'strict-origin-when-cross-origin'],
      table: { category: 'Navigation' },
    },
    'aria-label': { control: 'text', table: { category: 'Content' } },
    'aria-labelledby': { control: 'text', table: { category: 'Content' } },
    'aria-describedby': { control: 'text', table: { category: 'Content' } },
    id: { control: 'text', table: { category: 'Content' } },
    slot: { control: 'text', table: { category: 'Content' } },
    routerOptions: {
      control: false,
      description: 'Options for a configured React Aria router provider.',
      table: { category: 'Navigation' },
    },
    download: {
      control: 'boolean',
      description: 'Also accepts a suggested filename.',
      table: { category: 'Navigation' },
    },
    'aria-current': {
      control: 'select',
      options: [undefined, 'page', 'step', 'location', 'date', 'time', true, false],
      table: { category: 'Navigation' },
    },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    isHovered: {
      control: 'boolean',
      description: 'Visual override; render-prop state still reflects real interaction.',
      table: { category: 'State' },
    },
    isPressed: {
      control: 'boolean',
      description: 'Visual override; does not trigger onPress.',
      table: { category: 'State' },
    },
    isFocusVisible: {
      control: 'boolean',
      description: 'Adds the focus indicator; false never hides keyboard focus.',
      table: { category: 'State' },
    },
    autoFocus: { control: 'boolean', table: { category: 'State' } },
    ref: {
      control: false,
      description: 'Forwarded to React Aria. Demonstrated in Routing.',
      table: { category: 'Navigation' },
    },
    render: {
      control: false,
      description: 'Custom renderer; preserve disabled fallback and supplied props.',
      table: { category: 'Navigation' },
    },
  },
  args: {
    children: linkText.en.label,
    href: '#link-destination',
    intent: 'default',
    size: undefined,
    underline: 'none',
    isDisabled: false,
    leadingIcon: false,
    trailingIcon: false,
  },
} satisfies Meta<LinkStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <LinkDefault {...args} /> };
export const Secondary: Story = { args: { intent: 'secondary' }, render: Default.render };

export const Underlines: Story = {
  render: () => {
    const text = useLinkText();
    return (
      <div className="grid max-w-full gap-6 sm:grid-cols-2 type-body-md-medium">
        {(['default', 'secondary'] as const).map((intent) => (
          <div key={intent} className="flex flex-col items-start gap-4">
            <span className="text-xs uppercase tracking-wider text-base-muted">{text[intent]}</span>
            {(['none', 'hover', 'always'] as const).map((underline) => (
              <Link key={underline} href="#link-destination" intent={intent} underline={underline}>
                {text[underline]}
              </Link>
            ))}
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    const hoverLink = links[1];
    await userEvent.hover(hoverLink);
    await expect(hoverLink).toHaveAttribute('data-hovered');
    await expect(getComputedStyle(hoverLink).textDecorationLine).toBe('underline');
    await userEvent.unhover(hoverLink);
    await expect(getComputedStyle(hoverLink).textDecorationLine).toBe('none');
    await expect(getComputedStyle(links[2]).textDecorationLine).toBe('underline');
  },
};

export const SizesAndIcons: Story = {
  render: () => {
    const text = useLinkText();
    return (
      <div className="flex max-w-full flex-col gap-8">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-base-muted">
              {text[size]} ({size})
            </span>
            <div className="flex flex-wrap items-center gap-6 type-body-lg-bold">
              <Link href="#link-destination" size={size}>
                {text.label}
              </Link>
              <Link href="#link-destination" size={size}>
                <Plus weight="bold" aria-hidden="true" />
                {text.label}
              </Link>
              <Link href="#link-destination" size={size}>
                {text.label}
                <DirectionalArrow weight="bold" aria-hidden="true" />
              </Link>
              <Link href="#link-destination" size={size}>
                <Plus weight="bold" aria-hidden="true" />
                {text.label}
                <DirectionalArrow weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement, globals }) => {
    await document.fonts.ready;
    const isDhivehi = globals.language === 'dv';
    const links = within(canvasElement).getAllByRole('link');
    for (const [index, link] of links.entries()) {
      const sizeIndex = Math.floor(index / 4);
      const style = getComputedStyle(link);
      await expect(style.fontSize).toBe(
        `${(isDhivehi ? [17, 19, 21] : [14, 16, 18])[sizeIndex]}px`,
      );
      await expect(style.fontWeight).toBe(isDhivehi ? '700' : '500');
      await expect(style.fontFamily).toContain(isDhivehi ? 'MV A Waheed' : 'Inter');
      for (const icon of link.querySelectorAll('svg')) {
        await expect(getComputedStyle(icon).width).toBe(sizeIndex === 2 ? '20px' : '16px');
      }
    }
  },
};

export const States: Story = {
  args: { onPress: fn(), onFocus: fn() },
  render: ({ onPress, onFocus }) => {
    const text = useLinkText();
    return (
      <div className="grid max-w-full gap-6 sm:grid-cols-2 type-body-md-medium">
        {(['default', 'secondary'] as const).map((intent) => (
          <div key={intent} className="flex flex-col items-start gap-4">
            <span className="text-xs uppercase tracking-wider text-base-muted">{text[intent]}</span>
            <Link
              href="#link-destination"
              intent={intent}
              isFocusVisible={false}
              onPress={onPress}
              onFocus={onFocus}
            >
              {text.label}
            </Link>
            <Link href="#link-destination" intent={intent} isHovered>
              {text.hovered}
            </Link>
            <Link href="#link-destination" intent={intent} isPressed>
              {text.pressed}
            </Link>
            <Link href="#link-destination" intent={intent} isFocusVisible>
              {text.focus}
            </Link>
            <Link
              href="#link-destination"
              intent={intent}
              isDisabled
              isHovered
              isPressed
              onPress={onPress}
            >
              {text.disabled}
              <DirectionalArrow weight="bold" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    await document.fonts.ready;
    const user = userEvent.setup();
    const links = within(canvasElement).getAllByRole('link');
    const first = links[0];
    const initialBounds = first.getBoundingClientRect();
    await user.tab();
    first.focus();
    await expect(first).toHaveAttribute('data-focus-visible');
    await expect(first.getBoundingClientRect().width).toBe(initialBounds.width);
    await expect(first.getBoundingClientRect().height).toBe(initialBounds.height);
    if (window.matchMedia('(forced-colors: active)').matches) {
      await expect(getComputedStyle(first).outlineStyle).toBe('solid');
    } else {
      await expect(getComputedStyle(first).boxShadow).not.toBe('none');
    }
    await user.keyboard('[Enter>]');
    await expect(first).toHaveAttribute('data-pressed');
    await expect(first).toHaveAttribute('data-focus-visible');
    await user.keyboard('[/Enter]');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await expect(args.onFocus).toHaveBeenCalled();
    const bounds = first.getBoundingClientRect();
    await user.pointer({
      target: first,
      keys: '[MouseLeft>]',
      coords: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
    });
    await expect(first).toHaveAttribute('data-pressed');
    await user.pointer({ keys: '[/MouseLeft]' });
    await expect(args.onPress).toHaveBeenCalledTimes(2);
    for (const disabled of [links[4], links[9]]) {
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');
      await expect(disabled.tagName).toBe('SPAN');
      await expect(disabled).not.toHaveAttribute('data-hovered');
      await expect(disabled.tabIndex).toBe(-1);
      disabled.click();
    }
    await expect(args.onPress).toHaveBeenCalledTimes(2);
    links[3].focus();
    await user.tab();
    await expect(links[5]).toHaveFocus();
    links[5].blur();
  },
};

export const InheritedTypography: Story = {
  render: () => {
    const text = useLinkText();
    return (
      <div className="w-full max-w-sm space-y-6">
        {['type-caption-regular', 'type-body-md-regular', 'type-body-lg-bold'].map((type) => (
          <p key={type} className={type}>
            {text.prefix}
            <Link href="#link-destination" underline="always">
              {text.inline}
            </Link>
            {text.suffix}
          </p>
        ))}
        <p className="type-body-md-medium">
          <Link href="#link-destination" underline="always">
            <Plus aria-hidden="true" weight="bold" />
            {text.inline}
            <DirectionalArrow aria-hidden="true" weight="bold" />
          </Link>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link');
    for (const link of links.slice(0, 3)) {
      await expect(getComputedStyle(link).display).toBe('inline');
      const actual = getComputedStyle(link);
      const parent = getComputedStyle(link.parentElement!);
      for (const property of [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
      ] as const) {
        await expect(actual[property]).toBe(parent[property]);
      }
    }
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

function RoutingExample({ onPress }: Pick<LinkStoryArgs, 'onPress'>) {
  const text = useLinkText();
  const ref = useRef<HTMLAnchorElement>(null);
  const render: ComponentProps<typeof Link>['render'] = (props, state) =>
    state.isDisabled || !('href' in props) ? (
      <span {...props} />
    ) : (
      <a {...props} data-router-link="true">
        {props.children}
      </a>
    );
  return (
    <div className="flex max-w-sm flex-col items-start gap-6 type-body-md-medium">
      <Link
        ref={ref}
        href="#link-destination"
        aria-current="page"
        render={render}
        onPress={onPress}
      >
        {({ isCurrent }) => (isCurrent ? text.current : text.label)}
      </Link>
      <Link href="#link-destination" isDisabled render={render} onPress={onPress}>
        {text.unavailable}
      </Link>
      <Button intent="secondary" onPress={() => ref.current?.focus()}>
        {text.focusLink}
      </Button>
      <p id="link-destination" className="type-body-md-regular">
        {text.destination}
      </p>
    </div>
  );
}

export const Routing: Story = {
  args: { onPress: fn() },
  render: (args) => <RoutingExample onPress={args.onPress} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const [current, disabled] = canvas.getAllByRole('link');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toHaveAttribute('data-router-link', 'true');
    await expect(disabled.tagName).toBe('SPAN');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByRole('button'));
    await expect(current).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
  },
};
