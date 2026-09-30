import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, type ComponentProps } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Switch } from '@tradenetcorp/veli-ui/switch';

const localizedText = {
  en: {
    notifications: 'Notifications',
    default: 'Default',
    subtle: 'Subtle',
    off: 'Off',
    on: 'On',
    disabledOff: 'Disabled off',
    disabledOn: 'Disabled on',
    readOnlyOff: 'Read only off',
    readOnlyOn: 'Read only on',
  },
  dv: {
    notifications: 'ނޯޓިފިކޭޝަންސް',
    default: 'އާދައިގެ',
    subtle: 'ލުއި',
    off: 'އޮފް',
    on: 'އޮން',
    disabledOff: 'ބޭނުންނުކުރެވޭ — އޮފް',
    disabledOn: 'ބޭނުންނުކުރެވޭ — އޮން',
    readOnlyOff: 'ކިޔަން އެކަނި — އޮފް',
    readOnlyOn: 'ކިޔަން އެކަނި — އޮން',
  },
} as const;

function useSwitchText() {
  const { direction } = useVeliLanguage();
  return localizedText[direction === 'rtl' ? 'dv' : 'en'];
}

type SwitchStoryArgs = ComponentProps<typeof Switch>;

async function pressSwitch(input: HTMLElement) {
  const label = input.closest('label')!;
  const bounds = label.getBoundingClientRect();
  // React Aria treats userEvent's zero-size pointers as virtual clicks.
  const pointer = {
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
    width: 1,
    height: 1,
    pressure: 0.5,
    clientX: bounds.x + bounds.width / 2,
    clientY: bounds.y + bounds.height / 2,
  };
  fireEvent.pointerDown(label, pointer);
  fireEvent.pointerUp(label, pointer);
  fireEvent.click(label, { button: 0, detail: 1 });
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  decorators: [
    (Story) => {
      const text = useSwitchText();
      const [args, updateArgs] = useArgs<SwitchStoryArgs>();
      useEffect(() => {
        if (
          args.children === localizedText.en.notifications ||
          args.children === localizedText.dv.notifications
        ) {
          if (args.children !== text.notifications) {
            updateArgs({ children: text.notifications });
          }
        }
      }, [args.children, text.notifications, updateArgs]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
      include: ['appearance', 'size', 'children', 'isSelected', 'isDisabled', 'isReadOnly'],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: {
      control: 'select',
      options: ['default', 'subtle'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: { category: 'Appearance' },
    },
    children: { control: 'text', table: { category: 'Label' } },
    isSelected: { control: 'boolean', table: { category: 'State' } },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    isReadOnly: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    appearance: 'default',
    size: 'md',
    children: localizedText.en.notifications,
    isSelected: false,
    isDisabled: false,
    isReadOnly: false,
  },
} satisfies Meta<SwitchStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs<SwitchStoryArgs>();
    return (
      <Switch
        {...args}
        onChange={(selected) => {
          updateArgs({ isSelected: selected });
          args.onChange?.(selected);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('switch');
    const label = input.closest('label')!;
    const user = userEvent.setup();
    await expect(input).toHaveAccessibleName();
    await user.hover(label);
    await expect(label).toHaveAttribute('data-hovered');
    await user.unhover(label);
    input.focus();
    await user.keyboard('[Space>]');
    await expect(label).toHaveAttribute('data-pressed');
    await user.keyboard('[/Space]');
    await waitFor(() => expect(label).not.toHaveAttribute('data-pressed'));
    // Native keyboard activation is checked separately in browser QA.
    const selected = (input as HTMLInputElement).checked;
    await pressSwitch(input);
    await waitFor(() => expect((input as HTMLInputElement).checked).toBe(!selected));
    await pressSwitch(input);
    await waitFor(() => expect((input as HTMLInputElement).checked).toBe(selected));
  },
};

export const Subtle: Story = {
  args: { appearance: 'subtle' },
  render: Default.render,
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: function SwitchSizes() {
    const text = useSwitchText();
    return (
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        {(['default', 'subtle'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-6">
            <span className="type-body-sm-medium text-base-muted">{text[appearance]}</span>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="flex flex-col gap-3">
                <span className="type-caption-regular text-base-muted">{size}</span>
                <div className="flex flex-wrap items-center gap-4">
                  <Switch appearance={appearance} size={size}>
                    {text.off}
                  </Switch>
                  <Switch appearance={appearance} size={size} defaultSelected>
                    {text.on}
                  </Switch>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: function SwitchStates() {
    const text = useSwitchText();
    return (
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        {(['default', 'subtle'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-4">
            <span className="type-body-sm-medium text-base-muted">{text[appearance]}</span>
            <Switch appearance={appearance}>{text.off}</Switch>
            <Switch appearance={appearance} defaultSelected>
              {text.on}
            </Switch>
            <Switch appearance={appearance} isDisabled>
              {text.disabledOff}
            </Switch>
            <Switch appearance={appearance} isDisabled defaultSelected>
              {text.disabledOn}
            </Switch>
            <Switch appearance={appearance} isReadOnly>
              {text.readOnlyOff}
            </Switch>
            <Switch appearance={appearance} isReadOnly defaultSelected>
              {text.readOnlyOn}
            </Switch>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const inputs = within(canvasElement).getAllByRole('switch') as HTMLInputElement[];
    for (const input of inputs) {
      const selected = input.checked;
      const readOnly = input.closest('label')?.hasAttribute('data-readonly');
      await pressSwitch(input);
      await waitFor(() =>
        expect(input.checked).toBe(input.disabled || readOnly ? selected : !selected),
      );
      if (!input.disabled && !readOnly) {
        await pressSwitch(input);
        await waitFor(() => expect(input.checked).toBe(selected));
      }
    }
  },
};
