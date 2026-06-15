import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, type ComponentProps } from 'react';
import { useArgs } from 'storybook/internal/preview-api';
import { Checkbox } from '@tradenetcorp/veli-ui/checkbox';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const englishCheckboxText = {
  checkboxLabel: 'Checkbox label',
  off: 'Off',
  on: 'On',
  indeterminate: 'Indeterminate',
  labelText: 'Label text',
  indentedItem: 'Indented item',
  gridItem: 'Grid item',
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
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallbackKey ? localizedCheckboxText[language][fallbackKey] : value;
  }

  const localizedKey = checkboxTextKeys.find(
    (key) => localizedCheckboxText.en[key] === value || localizedCheckboxText.dv[key] === value,
  );

  if (localizedKey) {
    return localizedCheckboxText[language][localizedKey];
  }

  return value;
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
      options: ['md', 'lg'],
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
};

function CheckboxSizesExample() {
  const text = useCheckboxText();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Medium (md)
        </span>
        <div className="flex items-center gap-8">
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
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large (lg)
        </span>
        <div className="flex items-center gap-8">
          <Checkbox size="lg">{text.off}</Checkbox>
          <Checkbox size="lg" defaultSelected>
            {text.on}
          </Checkbox>
          <Checkbox size="lg" isIndeterminate>
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
    </div>
  );
}

export const DescriptionAndError: Story = {
  render: () => <CheckboxDescriptionAndErrorExample />,
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
    <div className="grid grid-cols-4 gap-[20px] items-start">
      <div />
      <div className="text-[12px] font-bold uppercase text-text-default-muted">{text.off}</div>
      <div className="text-[12px] font-bold uppercase text-text-default-muted">{text.on}</div>
      <div className="text-[12px] font-bold uppercase text-text-default-muted">
        {text.indeterminate}
      </div>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">Default</div>
      <Checkbox />
      <Checkbox defaultSelected />
      <Checkbox isIndeterminate />

      <div className="text-[12px] font-bold uppercase text-text-default-muted">Disabled</div>
      <Checkbox isDisabled />
      <Checkbox defaultSelected isDisabled />
      <Checkbox isIndeterminate isDisabled />
    </div>
  );
}

export const StatesAudit: Story = {
  render: () => <CheckboxStatesAuditExample />,
};
