import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { useArgs } from 'storybook/internal/preview-api';
import { VeliProvider, useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Switch } from '@tradenetcorp/veli-ui/switch';

const englishSwitchText = {
  notifications: 'Notifications',
  default: 'Default',
  subtle: 'Subtle',
  off: 'Off',
  on: 'On',
  small: 'Small (sm)',
  medium: 'Medium (md)',
  large: 'Large (lg)',
  indentedItem: 'Indented item',
  gridItem: 'Grid item',
  active: 'Active',
  disabled: 'Disabled',
  switch: 'Switch',
} as const;

const dhivehiSwitchText = {
  notifications: 'ނޯޓިފިކޭޝަންސް',
  default: 'އާދައިގެ',
  subtle: 'ލުއި',
  off: 'އޮފް',
  on: 'އޮން',
  small: 'ކުޑަ (sm)',
  medium: 'މެދު (md)',
  large: 'ބޮޑު (lg)',
  indentedItem: 'އިންޑެންޓްކުރެވިފައިވާ އައިޓަމް',
  gridItem: 'ގްރިޑް އައިޓަމް',
  active: 'އެކްޓިވް',
  disabled: 'ބޭނުންނުކުރެވޭ',
  switch: 'ސްވިޗް',
} as const;

const localizedSwitchText = {
  en: englishSwitchText,
  dv: dhivehiSwitchText,
} as const;

type SwitchLanguage = keyof typeof localizedSwitchText;
type SwitchTextKey = keyof typeof englishSwitchText;
type SwitchStoryArgs = ComponentProps<typeof Switch>;

const switchTextKeys = Object.keys(englishSwitchText) as SwitchTextKey[];

const useSwitchLanguage = (): SwitchLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useSwitchText = () => localizedSwitchText[useSwitchLanguage()];

const getLocalizedSwitchText = (
  value: ReactNode,
  language: SwitchLanguage,
  fallbackKey: SwitchTextKey,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return value ?? localizedSwitchText[language][fallbackKey];
  }

  const localizedKey = switchTextKeys.find(
    (key) => localizedSwitchText.en[key] === value || localizedSwitchText.dv[key] === value,
  );

  return localizedKey ? localizedSwitchText[language][localizedKey] : value;
};

function SwitchPreview({ children, ...args }: SwitchStoryArgs) {
  const language = useSwitchLanguage();

  return <Switch {...args}>{getLocalizedSwitchText(children, language, 'notifications')}</Switch>;
}

type UpdateStoryArgs = ReturnType<typeof useArgs>[1];

function SwitchArgsLanguageSync({
  value,
  updateArgs,
}: {
  value: ReactNode;
  updateArgs: UpdateStoryArgs;
}) {
  const language = useSwitchLanguage();

  useEffect(() => {
    const localizedChildren = getLocalizedSwitchText(value, language, 'notifications');

    if (value !== localizedChildren) {
      updateArgs?.({ children: localizedChildren });
    }
  }, [language, updateArgs, value]);

  return null;
}

/**
 * A switch allows a user to turn a setting on or off.
 * Built with `react-aria-components` for maximum accessibility.
 */
const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  render: (args) => <SwitchPreview {...args} />,
  decorators: [
    (Story) => {
      const [args, updateArgs] = useArgs();

      return (
        <>
          <SwitchArgsLanguageSync value={args.children} updateArgs={updateArgs} />
          <Story />
        </>
      );
    },
  ],
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
    },
    appearance: {
      control: 'select',
      options: ['default', 'subtle'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isSelected: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    children: englishSwitchText.notifications,
  },
};

/**
 * Default (outlined off) vs subtle (filled off) visual variants.
 */
function SwitchVariantsExample() {
  const text = useSwitchText();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          {text.default}
        </span>
        <div className="flex items-center gap-4">
          <Switch appearance="default">{text.off}</Switch>
          <Switch appearance="default" defaultSelected>
            {text.on}
          </Switch>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          {text.subtle}
        </span>
        <div className="flex items-center gap-4">
          <Switch appearance="subtle">{text.off}</Switch>
          <Switch appearance="subtle" defaultSelected>
            {text.on}
          </Switch>
        </div>
      </div>
    </div>
  );
}

export const Variants: Story = {
  render: () => <SwitchVariantsExample />,
};

/**
 * Showcases all size variants of the Switch component.
 */
function SwitchSizesExample() {
  const text = useSwitchText();

  return (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          {text.default}
        </span>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.small}
          </span>
          <div className="flex items-center gap-4">
            <Switch size="sm">{text.off}</Switch>
            <Switch size="sm" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.medium}
          </span>
          <div className="flex items-center gap-4">
            <Switch size="md">{text.off}</Switch>
            <Switch size="md" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.large}
          </span>
          <div className="flex items-center gap-4">
            <Switch size="lg">{text.off}</Switch>
            <Switch size="lg" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          {text.subtle}
        </span>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.small}
          </span>
          <div className="flex items-center gap-4">
            <Switch appearance="subtle" size="sm">
              {text.off}
            </Switch>
            <Switch appearance="subtle" size="sm" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.medium}
          </span>
          <div className="flex items-center gap-4">
            <Switch appearance="subtle" size="md">
              {text.off}
            </Switch>
            <Switch appearance="subtle" size="md" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.large}
          </span>
          <div className="flex items-center gap-4">
            <Switch appearance="subtle" size="lg">
              {text.off}
            </Switch>
            <Switch appearance="subtle" size="lg" defaultSelected>
              {text.on}
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Sizes: Story = {
  render: () => <SwitchSizesExample />,
};

function SwitchRootClassNameExample() {
  const text = useSwitchText();

  return (
    <div className="grid gap-[12px]">
      <Switch className="ml-[24px]">{text.indentedItem}</Switch>
      <Switch className="justify-self-start" defaultSelected>
        {text.gridItem}
      </Switch>
    </div>
  );
}

export const RootClassName: Story = {
  render: () => <SwitchRootClassNameExample />,
};

export const Directional: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <VeliProvider language="en">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">LTR</span>
          <div className="flex items-center gap-4">
            <Switch>{englishSwitchText.off}</Switch>
            <Switch defaultSelected>{englishSwitchText.on}</Switch>
          </div>
        </div>
      </VeliProvider>
      <VeliProvider language="dv">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">RTL</span>
          <div className="flex items-center gap-4">
            <Switch>{dhivehiSwitchText.off}</Switch>
            <Switch defaultSelected>{dhivehiSwitchText.on}</Switch>
          </div>
        </div>
      </VeliProvider>
    </div>
  ),
};

/**
 * Demonstrates the interactive and non-interactive states of the Switch component.
 */
function SwitchStatesAuditExample() {
  const text = useSwitchText();

  return (
    <div className="flex flex-col gap-8">
      {(['default', 'subtle'] as const).map((appearance) => (
        <div key={appearance} className="flex flex-col gap-6">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text[appearance]}
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold text-base-muted">{text.off}</span>
            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-base-muted">
                  {text.active}
                </span>
                <Switch appearance={appearance}>{text.switch}</Switch>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-base-muted">
                  {text.disabled}
                </span>
                <Switch appearance={appearance} isDisabled>
                  {text.switch}
                </Switch>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold text-base-muted">{text.on}</span>
            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-base-muted">
                  {text.active}
                </span>
                <Switch appearance={appearance} defaultSelected>
                  {text.switch}
                </Switch>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-base-muted">
                  {text.disabled}
                </span>
                <Switch appearance={appearance} defaultSelected isDisabled>
                  {text.switch}
                </Switch>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const StatesAudit: Story = {
  render: () => <SwitchStatesAuditExample />,
};

/**
 * A simple example showing how to use the Switch with a label.
 */
export const WithLabel: Story = {
  args: {
    children: englishSwitchText.notifications,
    defaultSelected: true,
  },
};
