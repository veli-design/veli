import { useEffect, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from '@storybook/test';
import { FieldLabel } from '@tradenetcorp/veli-ui/field';
import { useArgs } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

const englishRadioButtonText = {
  options: {
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
  },
  states: {
    mediumOff: 'Medium Off',
    mediumOn: 'Medium On',
    largeOff: 'Large Off',
    largeOn: 'Large On',
    extraLargeOff: 'Extra Large Off',
    extraLargeOn: 'Extra Large On',
    off: 'Off',
    on: 'On',
    md: 'MD',
    lg: 'LG',
    xl: 'XL',
    mdDisabled: 'MD Disabled',
    lgDisabled: 'LG Disabled',
    xlDisabled: 'XL Disabled',
  },
  text: {
    labelText: 'Label text',
    descriptionText: 'Description text',
    errorText: 'Error text',
  },
} as const;

const dhivehiRadioButtonText = {
  options: {
    option1: 'އޮޕްޝަން 1',
    option2: 'އޮޕްޝަން 2',
    option3: 'އޮޕްޝަން 3',
  },
  states: {
    mediumOff: 'މެދު އޮފް',
    mediumOn: 'މެދު އޮން',
    largeOff: 'ބޮޑު އޮފް',
    largeOn: 'ބޮޑު އޮން',
    extraLargeOff: 'އިތުރަށް ބޮޑު އޮފް',
    extraLargeOn: 'އިތުރަށް ބޮޑު އޮން',
    off: 'އޮފް',
    on: 'އޮން',
    md: 'އެމްޑީ',
    lg: 'އެލްޖީ',
    xl: 'އެކްސްއެލް',
    mdDisabled: 'އެމްޑީ ބޭނުންނުކުރެވޭ',
    lgDisabled: 'އެލްޖީ ބޭނުންނުކުރެވޭ',
    xlDisabled: 'އެކްސްއެލް ބޭނުންނުކުރެވޭ',
  },
  text: {
    labelText: 'ލޭބަލްގެ ލިޔުން',
    descriptionText: 'ތަފްޞީލު ލިޔުން',
    errorText: 'އެރަރ ޓެކްސްޓް',
  },
} as const;

const radioButtonText = {
  en: englishRadioButtonText,
  dv: dhivehiRadioButtonText,
} as const;

type RadioButtonText = (typeof radioButtonText)[keyof typeof radioButtonText];
type RadioButtonLanguage = keyof typeof radioButtonText;
type RadioStoryArgs = Omit<ComponentProps<typeof Radio>, 'value'> & {
  value?: ComponentProps<typeof Radio>['value'];
};

const radioButtonTextPairs = [
  [englishRadioButtonText.options.option1, dhivehiRadioButtonText.options.option1],
  [englishRadioButtonText.options.option2, dhivehiRadioButtonText.options.option2],
  [englishRadioButtonText.options.option3, dhivehiRadioButtonText.options.option3],
  [englishRadioButtonText.states.mediumOff, dhivehiRadioButtonText.states.mediumOff],
  [englishRadioButtonText.states.mediumOn, dhivehiRadioButtonText.states.mediumOn],
  [englishRadioButtonText.states.largeOff, dhivehiRadioButtonText.states.largeOff],
  [englishRadioButtonText.states.largeOn, dhivehiRadioButtonText.states.largeOn],
  [englishRadioButtonText.states.extraLargeOff, dhivehiRadioButtonText.states.extraLargeOff],
  [englishRadioButtonText.states.extraLargeOn, dhivehiRadioButtonText.states.extraLargeOn],
  [englishRadioButtonText.states.xl, dhivehiRadioButtonText.states.xl],
  [englishRadioButtonText.states.xlDisabled, dhivehiRadioButtonText.states.xlDisabled],
  [englishRadioButtonText.states.off, dhivehiRadioButtonText.states.off],
  [englishRadioButtonText.states.on, dhivehiRadioButtonText.states.on],
  [englishRadioButtonText.states.md, dhivehiRadioButtonText.states.md],
  [englishRadioButtonText.states.lg, dhivehiRadioButtonText.states.lg],
  [englishRadioButtonText.states.mdDisabled, dhivehiRadioButtonText.states.mdDisabled],
  [englishRadioButtonText.states.lgDisabled, dhivehiRadioButtonText.states.lgDisabled],
  [englishRadioButtonText.text.labelText, dhivehiRadioButtonText.text.labelText],
  [englishRadioButtonText.text.descriptionText, dhivehiRadioButtonText.text.descriptionText],
  [englishRadioButtonText.text.errorText, dhivehiRadioButtonText.text.errorText],
] as const;

const useRadioButtonLanguage = (): RadioButtonLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useRadioButtonText = (): RadioButtonText => {
  const language = useRadioButtonLanguage();

  return radioButtonText[language];
};

const getLocalizedRadioButtonText = (
  value: unknown,
  language: RadioButtonLanguage,
  fallback: string,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback;
  }

  const localizedPair = radioButtonTextPairs.find(
    ([englishText, dhivehiText]) => value === englishText || value === dhivehiText,
  );

  if (!localizedPair) {
    return value;
  }

  return language === 'dv' ? localizedPair[1] : localizedPair[0];
};

const getLocalizedRadioButtonNode = (
  value: ReactNode,
  language: RadioButtonLanguage,
  fallback: string,
) => {
  if (typeof value !== 'string') {
    return value ?? fallback;
  }

  return getLocalizedRadioButtonText(value, language, fallback);
};

const meta = {
  title: 'Components/Radio',
  component: Radio,
  decorators: [
    (Story, context) => {
      const language: RadioButtonLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { children, description, errorMessage } = args;

      useEffect(() => {
        const nextArgs: Partial<Pick<RadioStoryArgs, 'children' | 'description' | 'errorMessage'>> =
          {};
        const text = radioButtonText[language];
        const localizedChildren = getLocalizedRadioButtonNode(
          children,
          language,
          text.options.option1,
        );
        const localizedDescription = getLocalizedRadioButtonNode(
          description,
          language,
          text.text.descriptionText,
        );
        const localizedErrorMessage = getLocalizedRadioButtonNode(
          errorMessage,
          language,
          text.text.errorText,
        );

        if (children !== undefined && children !== localizedChildren) {
          nextArgs.children = localizedChildren;
        }

        if (description !== undefined && description !== localizedDescription) {
          nextArgs.description = localizedDescription;
        }

        if (errorMessage !== undefined && errorMessage !== localizedErrorMessage) {
          nextArgs.errorMessage = localizedErrorMessage;
        }

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [children, description, errorMessage, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
    inputRef: { table: { disable: true } },
    value: { table: { disable: true } },
    size: {
      control: 'select',
      options: ['md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    isDisabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    isInvalid: {
      control: 'boolean',
      table: { category: 'State' },
    },
    children: {
      control: 'text',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      table: { category: 'Content' },
    },
    errorMessage: {
      control: 'text',
      table: { category: 'Content' },
    },
  },
  args: {
    size: 'md',
    isDisabled: false,
  },
} satisfies Meta<RadioStoryArgs>;

export default meta;
type Story = StoryObj<RadioStoryArgs>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    if (args.isDisabled) {
      await expect(radios[0]).toBeDisabled();
      return;
    }
    radios[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1]).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(radios[0]).toBeChecked();
    const label = radios[2].closest('label')!;
    const bounds = label.getBoundingClientRect();
    const pointer = {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      width: 1,
      height: 1,
      clientX: bounds.x + 1,
      clientY: bounds.y + 1,
    };
    fireEvent.pointerDown(label, pointer);
    fireEvent.pointerUp(label, pointer);
    fireEvent.click(label, { button: 0, detail: 1 });
    await expect(radios[2]).toBeChecked();
  },
  render: (args) => {
    const language = useRadioButtonLanguage();
    const text = radioButtonText[language];

    return (
      <RadioGroup defaultValue="option-1">
        <FieldLabel>{text.text.labelText}</FieldLabel>
        <Radio {...args} value="option-1">
          {getLocalizedRadioButtonNode(args.children, language, text.options.option1)}
        </Radio>
        <Radio {...args} value="option-2">
          {text.options.option2}
        </Radio>
        <Radio {...args} value="option-3">
          {text.options.option3}
        </Radio>
      </RadioGroup>
    );
  },
};

export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: 'Extra large radio size' });
    const radios = within(group).getAllByRole('radio');
    const label = radios[0].closest('label')!;
    const control = label.querySelector('[aria-hidden="true"] > span')!;
    const indicator = control.firstElementChild!;
    await expect(control.getBoundingClientRect().width).toBe(24);
    await expect(control.getBoundingClientRect().top - label.getBoundingClientRect().top).toBe(2);
    await expect(indicator.getBoundingClientRect().width).toBe(14);
    await userEvent.hover(label);
    await userEvent.pointer({ target: label, keys: '[MouseLeft>]' });
    await waitFor(() => {
      expect(getComputedStyle(control).borderTopWidth).toBe('4px');
      expect(indicator.getBoundingClientRect().width).toBe(10);
    });
    await userEvent.pointer({ target: label, keys: '[/MouseLeft]' });
    await userEvent.unhover(label);
    await expect(radios[0]).toBeChecked();
    radios[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(radios[1]).toBeChecked();
  },
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useRadioButtonText();

    return (
      <div className="flex flex-col gap-[20px]">
        <RadioGroup aria-label="Medium radio size" defaultValue="md-on">
          <Radio value="md-off" size="md">
            {text.states.mediumOff}
          </Radio>
          <Radio value="md-on" size="md">
            {text.states.mediumOn}
          </Radio>
        </RadioGroup>

        <RadioGroup aria-label="Large radio size" defaultValue="lg-on">
          <Radio value="lg-off" size="lg">
            {text.states.largeOff}
          </Radio>
          <Radio value="lg-on" size="lg">
            {text.states.largeOn}
          </Radio>
        </RadioGroup>
        <RadioGroup aria-label="Extra large radio size" defaultValue="xl-on">
          <Radio value="xl-off" size="xl">
            {text.states.extraLargeOff}
          </Radio>
          <Radio value="xl-on" size="xl">
            {text.states.extraLargeOn}
          </Radio>
        </RadioGroup>
      </div>
    );
  },
};

export const DescriptionAndError: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    const ids = [...canvasElement.querySelectorAll('[id]')].map((node) => node.id);
    await expect(new Set(ids).size).toBe(ids.length);
    const descriptions = radios.map((radio) =>
      (radio.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent)
        .filter(Boolean)
        .join(' '),
    );
    await expect(descriptions[0]).toContain(
      canvasElement.querySelector('label span[id$="description"]')!.textContent!,
    );
    await expect(radios[0]).toHaveAccessibleName(
      radios[0].closest('label')!.querySelector('[id$="label"]')!.textContent!,
    );
    await expect(descriptions[1]).toContain(
      canvasElement.querySelector('label span[id$="error"]')!.textContent!,
    );
    await expect(radios[0].getAttribute('aria-describedby')).not.toBe(
      radios[1].getAttribute('aria-describedby'),
    );
  },
  render: () => {
    const text = useRadioButtonText();

    return (
      <RadioGroup
        aria-label="Radio description and error examples"
        className="gap-8"
        defaultValue="selected"
        isInvalid
      >
        <Radio value="description" description={text.text.descriptionText}>
          {text.text.labelText}
        </Radio>
        <Radio value="error" isInvalid errorMessage={text.text.errorText}>
          {text.text.labelText}
        </Radio>
        <Radio
          value="selected"
          isInvalid
          description={text.text.descriptionText}
          errorMessage={text.text.errorText}
        >
          {text.text.labelText}
        </Radio>
        <Radio
          value="lg"
          size="lg"
          isInvalid
          description={text.text.descriptionText}
          errorMessage={text.text.errorText}
        >
          {text.text.labelText}
        </Radio>
        <Radio
          value="xl"
          size="xl"
          isInvalid
          description={text.text.descriptionText}
          errorMessage={text.text.errorText}
        >
          {text.text.labelText}
        </Radio>
      </RadioGroup>
    );
  },
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useRadioButtonText();

    return (
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-5">
        <div />
        <div className="text-[12px] font-bold uppercase text-base-muted">{text.states.off}</div>
        <div className="text-[12px] font-bold uppercase text-base-muted">{text.states.on}</div>

        <div className="text-[12px] font-bold uppercase text-base-muted">{text.states.md}</div>
        <RadioGroup aria-label="Medium off state">
          <Radio value="md-off" size="md" aria-label="md-off" />
        </RadioGroup>
        <RadioGroup aria-label="Medium on state" defaultValue="md-on">
          <Radio value="md-on" size="md" aria-label="md-on" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-base-muted">
          {text.states.mdDisabled}
        </div>
        <RadioGroup aria-label="Medium disabled off state">
          <Radio value="md-off-disabled" size="md" isDisabled aria-label="md-off-disabled" />
        </RadioGroup>
        <RadioGroup aria-label="Medium disabled on state" defaultValue="md-on-disabled">
          <Radio value="md-on-disabled" size="md" isDisabled aria-label="md-on-disabled" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-base-muted">{text.states.lg}</div>
        <RadioGroup aria-label="Large off state">
          <Radio value="lg-off" size="lg" aria-label="lg-off" />
        </RadioGroup>
        <RadioGroup aria-label="Large on state" defaultValue="lg-on">
          <Radio value="lg-on" size="lg" aria-label="lg-on" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-base-muted">
          {text.states.lgDisabled}
        </div>
        <RadioGroup aria-label="Large disabled off state">
          <Radio value="lg-off-disabled" size="lg" isDisabled aria-label="lg-off-disabled" />
        </RadioGroup>
        <RadioGroup aria-label="Large disabled on state" defaultValue="lg-on-disabled">
          <Radio value="lg-on-disabled" size="lg" isDisabled aria-label="lg-on-disabled" />
        </RadioGroup>
        <div className="text-[12px] font-bold uppercase text-base-muted">{text.states.xl}</div>
        <RadioGroup aria-label="Extra large off state">
          <Radio value="xl-off" size="xl" aria-label="xl-off" />
        </RadioGroup>
        <RadioGroup aria-label="Extra large on state" defaultValue="xl-on">
          <Radio value="xl-on" size="xl" aria-label="xl-on" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-base-muted">
          {text.states.xlDisabled}
        </div>
        <RadioGroup aria-label="Extra large disabled off state">
          <Radio value="xl-off-disabled" size="xl" isDisabled aria-label="xl-off-disabled" />
        </RadioGroup>
        <RadioGroup aria-label="Extra large disabled on state" defaultValue="xl-on-disabled">
          <Radio value="xl-on-disabled" size="xl" isDisabled aria-label="xl-on-disabled" />
        </RadioGroup>
      </div>
    );
  },
};
