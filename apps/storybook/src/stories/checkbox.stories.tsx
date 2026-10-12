import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { expect, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { Checkbox, CheckboxGroup } from '@tradenetcorp/veli-ui/checkbox';
import { FieldLabel } from '@tradenetcorp/veli-ui/field';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const englishCheckboxText = {
  checkboxLabel: 'Checkbox label',
  off: 'Off',
  on: 'On',
  indeterminate: 'Indeterminate',
  labelText: 'Label text',
  indentedItem: 'Indented item',
  gridItem: 'Grid item',
  channels: 'Notification channels',
  email: 'Email',
  sms: 'SMS',
  push: 'Push notifications',
} as const;

const englishValidationText = {
  acceptTermsAndConditions: 'Accept terms and conditions',
  termsRequiredError: 'You must accept the terms to continue',
  descriptionText: 'Description text',
  errorText: 'Error text',
} as const;

const dhivehiCheckboxText = {
  checkboxLabel: 'ޗެކްބޮކްސް ލޭބަލް',
  off: 'އޮފް',
  on: 'އޮން',
  indeterminate: 'އިންޑިޓަރމިނޭޓް',
  labelText: 'ލޭބަލްގެ ލިޔުން',
  indentedItem: 'އިންޑެންޓްކުރެވިފައިވާ އައިޓަމް',
  gridItem: 'ގްރިޑް އައިޓަމް',
  channels: 'އެންގުމުގެ ވަސީލަތްތައް',
  email: 'އީމެއިލް',
  sms: 'އެސް އެމް އެސް',
  push: 'ޕުޝް އެންގުން',
} as const;

const dhivehiValidationText = {
  acceptTermsAndConditions: 'އުސޫލުތަކާއި ޝަރުތުތައް ގަބޫލުކުރަން',
  termsRequiredError: 'ކުރިއަށް ދިއުމަށްޓަކައި ޝަރުތުތައް ގަބޫލުކުރައްވަން ޖެހޭނެއެވެ.',
  descriptionText: 'ތަފްޞީލު ލިޔުން',
  errorText: 'އެރަރ ޓެކްސްޓް',
} as const;

const localizedCheckboxText = {
  en: { ...englishCheckboxText, ...englishValidationText },
  dv: { ...dhivehiCheckboxText, ...dhivehiValidationText },
} as const;

type CheckboxLanguage = keyof typeof localizedCheckboxText;
type CheckboxTextKey = keyof (typeof localizedCheckboxText)['en'];
type CheckboxArgTextKey = 'children' | 'description' | 'errorMessage';
type CheckboxStoryArgs = ComponentProps<typeof Checkbox>;

const checkboxTextKeys = Object.keys(localizedCheckboxText.en) as CheckboxTextKey[];

const useCheckboxLanguage = (): CheckboxLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useCheckboxText = () => {
  const language = useCheckboxLanguage();

  return localizedCheckboxText[language];
};

const getLocalizedCheckboxText = (
  value: unknown,
  language: CheckboxLanguage,
  fallbackKey?: CheckboxTextKey,
): ReactNode => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallbackKey ? localizedCheckboxText[language][fallbackKey] : (value as ReactNode);
  }

  const localizedKey = checkboxTextKeys.find(
    (key) => localizedCheckboxText.en[key] === value || localizedCheckboxText.dv[key] === value,
  );

  if (localizedKey) {
    return localizedCheckboxText[language][localizedKey];
  }

  return value as ReactNode;
};

function CheckboxPreview({ children, description, errorMessage, ...args }: CheckboxStoryArgs) {
  const language = useCheckboxLanguage();

  return (
    <Checkbox
      {...args}
      description={getLocalizedCheckboxText(description, language)}
      errorMessage={getLocalizedCheckboxText(errorMessage, language)}
    >
      {getLocalizedCheckboxText(children, language, 'checkboxLabel')}
    </Checkbox>
  );
}

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  render: (args) => <CheckboxPreview {...args} />,
  decorators: [
    (Story, context) => {
      const language: CheckboxLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { children, description, errorMessage } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<CheckboxArgTextKey, unknown>> = {};
        const currentArgs = { children, description, errorMessage };
        const localizedArgs = {
          children: getLocalizedCheckboxText(children, language, 'checkboxLabel'),
          description: getLocalizedCheckboxText(description, language),
          errorMessage: getLocalizedCheckboxText(errorMessage, language),
        };

        (Object.keys(localizedArgs) as CheckboxArgTextKey[]).forEach((key) => {
          if (currentArgs[key] !== localizedArgs[key]) {
            nextArgs[key] = localizedArgs[key];
          }
        });

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
    children: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['md', 'lg', 'xl'],
    },
    isIndeterminate: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
  },
  args: {
    children: englishCheckboxText.checkboxLabel,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function CheckboxStatesExample() {
  const text = useCheckboxText();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <Checkbox>{text.off}</Checkbox>
        <Checkbox defaultSelected>{text.on}</Checkbox>
        <Checkbox isIndeterminate>{text.indeterminate}</Checkbox>
      </div>
    </div>
  );
}

export const States: Story = {
  render: () => <CheckboxStatesExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await expect(boxes[0]).not.toBeChecked();
    boxes[0].focus();
    await userEvent.keyboard(' ');
    await expect(boxes[0]).toBeChecked();
    const checkedLabel = boxes[1].closest('label')!.querySelector('[id]')!;
    await userEvent.click(checkedLabel);
    await expect(boxes[1]).not.toBeChecked();
    await userEvent.click(checkedLabel);
    await expect(boxes[1]).toBeChecked();
    await expect(boxes[2]).toHaveProperty('indeterminate', true);
  },
};

function CheckboxSizesExample() {
  const text = useCheckboxText();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Medium (md)
        </span>
        <div className="flex flex-wrap items-center gap-8">
          <Checkbox size="md">{text.off}</Checkbox>
          <Checkbox size="md" defaultSelected>
            {text.on}
          </Checkbox>
          <Checkbox size="md" isIndeterminate>
            {text.indeterminate}
          </Checkbox>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Large (lg)
        </span>
        <div className="flex flex-wrap items-center gap-8">
          <Checkbox size="lg">{text.off}</Checkbox>
          <Checkbox size="lg" defaultSelected>
            {text.on}
          </Checkbox>
          <Checkbox size="lg" isIndeterminate>
            {text.indeterminate}
          </Checkbox>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Extra large (xl)
        </span>
        <div className="flex flex-wrap items-center gap-8">
          <Checkbox size="xl">{text.off}</Checkbox>
          <Checkbox size="xl" defaultSelected>
            {text.on}
          </Checkbox>
          <Checkbox size="xl" isIndeterminate>
            {text.indeterminate}
          </Checkbox>
        </div>
      </div>
    </div>
  );
}

export const Sizes: Story = {
  render: () => <CheckboxSizesExample />,
};

function CheckboxDescriptionAndErrorExample() {
  const text = useCheckboxText();

  return (
    <div className="flex flex-col gap-8">
      <Checkbox description={text.descriptionText}>{text.labelText}</Checkbox>
      <Checkbox isInvalid errorMessage={text.errorText}>
        {text.labelText}
      </Checkbox>
      <Checkbox isInvalid description={text.descriptionText} errorMessage={text.errorText}>
        {text.labelText}
      </Checkbox>
      <Checkbox
        size="lg"
        isInvalid
        description={text.descriptionText}
        errorMessage={text.errorText}
      >
        {text.labelText}
      </Checkbox>
      <Checkbox
        size="xl"
        isInvalid
        description={text.descriptionText}
        errorMessage={text.errorText}
      >
        {text.labelText}
      </Checkbox>
    </div>
  );
}

export const DescriptionAndError: Story = {
  render: () => <CheckboxDescriptionAndErrorExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    const ids = [...canvasElement.querySelectorAll('[id]')].map((node) => node.id);
    await expect(new Set(ids).size).toBe(ids.length);
    for (const box of boxes) {
      await expect(box).toHaveAccessibleName(
        box.closest('label')!.querySelector('[id]')!.textContent!,
      );
      const describedBy = (box.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
      await expect(describedBy.length).toBeGreaterThan(0);
      for (const id of describedBy) {
        await expect(canvasElement.querySelector(`[id="${id}"]`)).toBeInTheDocument();
      }
    }
    await expect(boxes[2].getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
    await expect(canvas.getAllByRole('alert')).toHaveLength(4);
  },
};

export const Invalid: Story = {
  args: {
    children: englishValidationText.acceptTermsAndConditions,
    isInvalid: true,
    errorMessage: englishValidationText.termsRequiredError,
  },
};

function CheckboxRootClassNameExample() {
  const text = useCheckboxText();

  return (
    <div className="grid gap-[12px]">
      <Checkbox className="ml-[24px]">{text.indentedItem}</Checkbox>
      <Checkbox className="justify-self-start">{text.gridItem}</Checkbox>
    </div>
  );
}

export const RootClassName: Story = {
  render: () => <CheckboxRootClassNameExample />,
};

function CheckboxStatesAuditExample() {
  const text = useCheckboxText();

  return (
    <div className="grid max-w-[100vw] gap-8 overflow-auto">
      {(['md', 'lg', 'xl'] as const).map((size) => (
        <section key={size} className="grid grid-cols-4 items-start gap-5">
          <span className="text-xs font-bold uppercase text-base-muted">{size}</span>
          <span className="text-xs text-base-muted">{text.off}</span>
          <span className="text-xs text-base-muted">{text.on}</span>
          <span className="text-xs text-base-muted">{text.indeterminate}</span>
          <span>Default</span>
          <Checkbox size={size} description={text.descriptionText}>
            {text.off}
          </Checkbox>
          <Checkbox size={size} defaultSelected description={text.descriptionText}>
            {text.on}
          </Checkbox>
          <Checkbox size={size} isIndeterminate description={text.descriptionText}>
            {text.indeterminate}
          </Checkbox>
          <span>Disabled</span>
          <Checkbox size={size} isDisabled description={text.descriptionText}>
            {text.off}
          </Checkbox>
          <Checkbox size={size} defaultSelected isDisabled description={text.descriptionText}>
            {text.on}
          </Checkbox>
          <Checkbox size={size} isIndeterminate isDisabled description={text.descriptionText}>
            {text.indeterminate}
          </Checkbox>
          <span>Invalid</span>
          <Checkbox
            size={size}
            isInvalid
            description={text.descriptionText}
            errorMessage={text.errorText}
          >
            {text.off}
          </Checkbox>
          <Checkbox
            size={size}
            defaultSelected
            isInvalid
            description={text.descriptionText}
            errorMessage={text.errorText}
          >
            {text.on}
          </Checkbox>
          <Checkbox
            size={size}
            isIndeterminate
            isInvalid
            description={text.descriptionText}
            errorMessage={text.errorText}
          >
            {text.indeterminate}
          </Checkbox>
        </section>
      ))}
    </div>
  );
}

export const StatesAudit: Story = {
  render: () => <CheckboxStatesAuditExample />,
  parameters: { layout: 'padded' },
};

function CheckboxGroupExample() {
  const text = useCheckboxText();
  const [value, setValue] = useState<string[]>(['email']);

  return (
    <div className="grid max-w-[280px] gap-8">
      <CheckboxGroup value={value} onChange={setValue} description={text.descriptionText}>
        <FieldLabel>{text.channels}</FieldLabel>
        <Checkbox value="email">{text.email}</Checkbox>
        <Checkbox value="sms">{text.sms}</Checkbox>
        <Checkbox value="push">{text.push}</Checkbox>
      </CheckboxGroup>
      <CheckboxGroup aria-label={text.channels} isRequired isInvalid errorMessage={text.errorText}>
        <Checkbox value="email">{text.email}</Checkbox>
        <Checkbox value="sms">{text.sms}</Checkbox>
      </CheckboxGroup>
    </div>
  );
}

export const Groups: Story = {
  render: () => <CheckboxGroupExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const groups = canvas.getAllByRole('group');
    await expect(groups).toHaveLength(2);
    await expect(groups[0]).toHaveAccessibleName();
    const email = within(groups[0]).getByRole('checkbox', { name: /Email|އީމެއިލް/ });
    await expect(email).toBeChecked();
    await userEvent.click(email);
    await expect(email).not.toBeChecked();
    await userEvent.click(email);
    await expect(email).toBeChecked();
    await expect(groups[1]).toHaveAttribute('data-invalid', 'true');
    await expect(within(groups[1]).getByRole('alert')).toHaveTextContent(/Error text|އެރަރ/);
  },
};

export const ReadOnlyAndRequired: Story = {
  render: () => {
    const text = useCheckboxText();
    return (
      <div className="grid gap-4">
        <Checkbox isReadOnly defaultSelected>
          {text.on}
        </Checkbox>
        <Checkbox isRequired>{text.off}</Checkbox>
        <Checkbox aria-label={text.checkboxLabel} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await userEvent.click(boxes[0].closest('label')!);
    await expect(boxes[0]).toBeChecked();
    await expect(boxes[1]).toHaveAttribute('required');
    await expect(boxes[2]).toHaveAccessibleName('Checkbox label');
  },
};

export const NarrowLayout: Story = {
  render: () => {
    const text = useCheckboxText();
    return (
      <div className="w-[220px] max-w-full">
        <Checkbox
          size="xl"
          isInvalid
          description={text.descriptionText}
          errorMessage={text.errorText}
        >
          {text.acceptTermsAndConditions}
        </Checkbox>
      </div>
    );
  },
  parameters: { layout: 'centered' },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    const label = checkbox.closest('label')!;
    const visibleLabel = label.querySelector<HTMLElement>(
      `#${CSS.escape(checkbox.getAttribute('aria-labelledby')!)}`,
    )!;
    const controlSlot = visibleLabel.previousElementSibling!;
    const firstLineHeight = parseFloat(getComputedStyle(visibleLabel).lineHeight);

    await expect(visibleLabel.getBoundingClientRect().height).toBeGreaterThan(
      firstLineHeight * 1.5,
    );
    await expect(
      Math.abs(controlSlot.getBoundingClientRect().top - visibleLabel.getBoundingClientRect().top),
    ).toBeLessThan(1);
  },
};
