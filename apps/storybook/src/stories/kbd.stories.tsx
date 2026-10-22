import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ArrowFatUpIcon, CommandIcon, OptionIcon } from '@phosphor-icons/react';
import { Kbd, KbdGroup, type KbdVariant } from '@tradenetcorp/veli-ui/kbd';
import { Menu, MenuItem } from '@tradenetcorp/veli-ui/menu';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const variants: KbdVariant[] = ['default', 'inverted'];

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'A',
    variant: 'default',
    lang: 'en',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
    },
    children: {
      control: 'text',
    },
    lang: {
      control: 'text',
      description:
        'Native language tag for Latin labels. Keep en in Dhivehi interfaces; Dhivehi key typography is unsupported.',
    },
    dir: { control: 'select', options: [undefined, 'ltr', 'rtl'] },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  render: () => (
    <KbdGroup dir="ltr" aria-label="Command Shift Option A B C">
      <Kbd>
        <CommandIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>
        <ArrowFatUpIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>
        <OptionIcon aria-hidden weight="regular" />
      </Kbd>
      <Kbd>A</Kbd>
      <Kbd>B</Kbd>
      <Kbd>C</Kbd>
    </KbdGroup>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <KbdGroup key={variant} variant={variant} dir="ltr" aria-label="Command Shift Option A B C">
          <Kbd>
            <CommandIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>
            <ArrowFatUpIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>
            <OptionIcon aria-hidden weight="regular" />
          </Kbd>
          <Kbd>A</Kbd>
          <Kbd>B</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      ))}
    </div>
  ),
};

export const TextKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <KbdGroup dir="ltr">
        <Kbd>E</Kbd>
      </KbdGroup>
      <KbdGroup dir="ltr">
        <Kbd>Del</Kbd>
      </KbdGroup>
      <KbdGroup dir="ltr">
        <Kbd>Ctrl</Kbd>
        <Kbd>C</Kbd>
      </KbdGroup>
    </div>
  ),
};

export const SingleKey: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Kbd>Enter</Kbd>
      <Kbd aria-label="Command key">
        <CommandIcon aria-hidden weight="regular" />
      </Kbd>
    </div>
  ),
};

/** Native attributes and explicit key overrides are part of the public API. */
export const Composition: Story = {
  render: () => (
    <div className="flex max-w-full flex-wrap items-center gap-6">
      <Kbd title="Page Down key">Page Down</Kbd>
      <KbdGroup variant="inverted" dir="ltr" aria-label="Control Shift K">
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd variant="default">K</Kbd>
      </KbdGroup>
      <KbdGroup dir="ltr" aria-label="Command K, then Enter">
        <Kbd>
          <CommandIcon aria-hidden weight="regular" />
        </Kbd>
        <Kbd>K</Kbd>
        <span aria-hidden>→</span>
        <Kbd className="px-2">Enter</Kbd>
      </KbdGroup>
    </div>
  ),
};

/** Run with the provider toolbar in EN/DV and light/dark/system. */
export const LayoutContract: Story = {
  render: () => (
    <div className="flex max-w-full flex-wrap items-center gap-6">
      <Kbd data-testid="single-key">A</Kbd>
      <Kbd title="Page Down key">Page Down</Kbd>
      <KbdGroup dir="ltr" aria-label="Command Shift K">
        <Kbd>
          <CommandIcon aria-hidden weight="regular" />
        </Kbd>
        <Kbd>
          <ArrowFatUpIcon aria-hidden weight="regular" />
        </Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup variant="inverted" dir="ltr" aria-label="Control K">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const key = canvas.getByTestId('single-key');
    const style = getComputedStyle(key);
    await expect(key.tagName).toBe('KBD');
    await expect(key).toHaveAttribute('lang', 'en');
    await expect(key).not.toHaveAttribute('tabindex');
    await expect(key.getBoundingClientRect().height).toBe(20);
    await expect(key.getBoundingClientRect().width).toBe(20);
    await expect(style.lineHeight).toBe('16px');
    await expect(style.fontSize).toBe('12px');
    await expect(style.letterSpacing).toBe('0.18px');
    await expect(style.padding).toBe('2px 4px');
    await expect(style.borderRadius).toBe('4px');
    await expect(style.whiteSpace).toBe('nowrap');
    await expect(style.fontFamily).toContain('Inter');
    const group = canvas.getByRole('group', { name: 'Command Shift K' });
    const keys = Array.from(group.querySelectorAll('kbd'));
    for (let i = 1; i < keys.length; i += 1) {
      await expect(
        keys[i].getBoundingClientRect().left - keys[i - 1].getBoundingClientRect().right,
      ).toBe(2);
    }
    await expect(group.querySelectorAll('svg[aria-hidden="true"]').length).toBe(2);
  },
};

function KbdInMenuPreview() {
  const { language } = useVeliLanguage();
  const text =
    language === 'dv'
      ? { actions: 'އެކްޝަންތައް', edit: 'އެޑިޓް', open: 'ހުޅުވާ', remove: 'ފުހެލާ' }
      : { actions: 'Actions', edit: 'Edit', open: 'Open', remove: 'Delete' };
  return (
    <div className="grid w-[min(56rem,calc(100vw-2rem))] grid-cols-1 gap-6 md:grid-cols-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="min-w-0 space-y-3">
          <p className="type-body-sm-medium text-base-emphasis">{size}</p>
          <div className="rounded-xl border-[0.5px] border-base-muted bg-menu-bg p-1 shadow-md">
            <Menu aria-label={`${text.actions} (${size})`}>
              <MenuItem id="edit" size={size} shortcut={['Ctrl', 'E']} textValue={text.edit}>
                {text.edit}
              </MenuItem>
              <MenuItem
                id="open"
                size={size}
                textValue={text.open}
                shortcut={
                  <KbdGroup dir="ltr" aria-label="Command K">
                    <Kbd>
                      <CommandIcon aria-hidden weight="regular" />
                    </Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                }
              >
                {text.open}
              </MenuItem>
              <MenuItem
                id="delete"
                size={size}
                shortcut="Del"
                intent="danger"
                isDisabled
                textValue={text.remove}
              >
                {text.remove}
              </MenuItem>
            </Menu>
          </div>
        </div>
      ))}
    </div>
  );
}

/** MenuItem's string/array shortcut API and explicit KbdGroup composition. */
export const InMenu: Story = {
  name: 'In Menu',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Latin Kbd labels inside Menu at every item size. Edit uses the array shortcut API, Open composes an icon key with KbdGroup, and Delete shows disabled shortcut styling. Use the provider toolbar to compare surrounding UI languages and themes; key labels remain Latin.',
      },
    },
  },
  render: () => <KbdInMenuPreview />,
};
