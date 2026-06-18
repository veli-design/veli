import { useEffect, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

const englishRadioButtonText = {
  options: {
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
    optionA: 'Option A',
    optionB: 'Option B',
    optionC: 'Option C',
  },
  states: {
    mediumOff: 'Medium Off',
    mediumOn: 'Medium On',
    largeOff: 'Large Off',
    largeOn: 'Large On',
    disabledOff: 'Disabled Off',
    disabledOn: 'Disabled On',
    off: 'Off',
    on: 'On',
    md: 'MD',
    lg: 'LG',
    mdDisabled: 'MD Disabled',
    lgDisabled: 'LG Disabled',
  },
  text: {
    labelText: 'Label text',
    descriptionText: 'Description text',
    errorText: 'Error text',
    acceptTerms: 'Accept terms and conditions',
    termsRequired: 'You must accept the terms to continue',
  },
} as const;

const dhivehiRadioButtonText = {
  options: {
    option1: 'އޮޕްޝަން 1',
    option2: 'އޮޕްޝަން 2',
    option3: 'އޮޕްޝަން 3',
    optionA: 'އޮޕްޝަން އޭ',
    optionB: 'އޮޕްޝަން ބީ',
    optionC: 'އޮޕްޝަން ސީ',
  },
  states: {
    mediumOff: 'މެދު އޮފް',
    mediumOn: 'މެދު އޮން',
    largeOff: 'ބޮޑު އޮފް',
    largeOn: 'ބޮޑު އޮން',
    disabledOff: 'ބޭނުންނުކުރެވޭ އޮފް',
    disabledOn: 'ބޭނުންނުކުރެވޭ އޮން',
    off: 'އޮފް',
    on: 'އޮން',
    md: 'އެމްޑީ',
    lg: 'އެލްޖީ',
    mdDisabled: 'އެމްޑީ ބޭނުންނުކުރެވޭ',
    lgDisabled: 'އެލްޖީ ބޭނުންނުކުރެވޭ',
  },
  text: {
    labelText: 'ލޭބަލްގެ ލިޔުން',
    descriptionText: 'ތަފްޞީލު ލިޔުން',
    errorText: 'އެރަރ ޓެކްސްޓް',
    acceptTerms: 'އުސޫލުތަކާއި ޝަރުތުތައް ގަބޫލުކުރަން',
    termsRequired: 'ކުރިއަށް ދިއުމަށްޓަކައި ޝަރުތުތައް ގަބޫލުކުރައްވަން ޖެހޭނެއެވެ.',
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
  [englishRadioButtonText.options.optionA, dhivehiRadioButtonText.options.optionA],
  [englishRadioButtonText.options.optionB, dhivehiRadioButtonText.options.optionB],
  [englishRadioButtonText.options.optionC, dhivehiRadioButtonText.options.optionC],
  [englishRadioButtonText.states.mediumOff, dhivehiRadioButtonText.states.mediumOff],
  [englishRadioButtonText.states.mediumOn, dhivehiRadioButtonText.states.mediumOn],
  [englishRadioButtonText.states.largeOff, dhivehiRadioButtonText.states.largeOff],
  [englishRadioButtonText.states.largeOn, dhivehiRadioButtonText.states.largeOn],
  [englishRadioButtonText.states.disabledOff, dhivehiRadioButtonText.states.disabledOff],
  [englishRadioButtonText.states.disabledOn, dhivehiRadioButtonText.states.disabledOn],
  [englishRadioButtonText.states.off, dhivehiRadioButtonText.states.off],
  [englishRadioButtonText.states.on, dhivehiRadioButtonText.states.on],
  [englishRadioButtonText.states.md, dhivehiRadioButtonText.states.md],
  [englishRadioButtonText.states.lg, dhivehiRadioButtonText.states.lg],
  [englishRadioButtonText.states.mdDisabled, dhivehiRadioButtonText.states.mdDisabled],
  [englishRadioButtonText.states.lgDisabled, dhivehiRadioButtonText.states.lgDisabled],
  [englishRadioButtonText.text.labelText, dhivehiRadioButtonText.text.labelText],
  [englishRadioButtonText.text.descriptionText, dhivehiRadioButtonText.text.descriptionText],
  [englishRadioButtonText.text.errorText, dhivehiRadioButtonText.text.errorText],
  [englishRadioButtonText.text.acceptTerms, dhivehiRadioButtonText.text.acceptTerms],
  [englishRadioButtonText.text.termsRequired, dhivehiRadioButtonText.text.termsRequired],
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
          text.text.acceptTerms,
        );
        const localizedDescription = getLocalizedRadioButtonNode(
          description,
          language,
          text.text.descriptionText,
        );
        const localizedErrorMessage = getLocalizedRadioButtonNode(
          errorMessage,
          language,
          text.text.termsRequired,
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
    size: {
      control: 'select',
      options: ['md', 'lg'],
    },
    isDisabled: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
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
  render: (args) => {
    const text = useRadioButtonText();

    return (
      <RadioGroup aria-label="Default radio group" defaultValue="option-1">
        <Radio {...args} value="option-1">
          {text.options.option1}
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
  parameters: {
    controls: {
      exclude: ['size', 'isDisabled'],
    },
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
      </div>
    );
  },
};

export const DescriptionAndError: Story = {
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
      </RadioGroup>
    );
  },
};

export const Invalid: Story = {
  args: {
    children: englishRadioButtonText.text.acceptTerms,
    isInvalid: true,
    errorMessage: englishRadioButtonText.text.termsRequired,
  },
  render: (args) => {
    const language = useRadioButtonLanguage();
    const text = radioButtonText[language];
    const { children, errorMessage, ...radioArgs } = args;

    return (
      <RadioGroup
        aria-label="Invalid radio example"
        defaultValue="terms"
        isInvalid={Boolean(args.isInvalid)}
      >
        <Radio
          {...radioArgs}
          value="terms"
          errorMessage={getLocalizedRadioButtonNode(
            errorMessage,
            language,
            text.text.termsRequired,
          )}
        >
          {getLocalizedRadioButtonNode(children, language, text.text.acceptTerms)}
        </Radio>
      </RadioGroup>
    );
  },
};

export const RootClassName: Story = {
  render: () => {
    const text = useRadioButtonText();

    return (
      <RadioGroup
        aria-label="Radio layout className example"
        className="grid grid-cols-3 gap-[16px]"
        defaultValue="a"
      >
        <Radio className="justify-center" value="a">
          {text.options.optionA}
        </Radio>
        <Radio className="justify-center" value="b">
          {text.options.optionB}
        </Radio>
        <Radio className="justify-center" value="c">
          {text.options.optionC}
        </Radio>
      </RadioGroup>
    );
  },
};

export const StatesAudit: Story = {
  parameters: {
    controls: {
      exclude: ['size', 'isDisabled'],
    },
  },
  render: () => {
    const text = useRadioButtonText();

    return (
      <div className="grid grid-cols-3 gap-[20px] items-start">
        <div />
        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.off}
        </div>
        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.on}
        </div>

        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.md}
        </div>
        <RadioGroup aria-label="Medium off state">
          <Radio value="md-off" size="md" />
        </RadioGroup>
        <RadioGroup aria-label="Medium on state" defaultValue="md-on">
          <Radio value="md-on" size="md" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.mdDisabled}
        </div>
        <RadioGroup aria-label="Medium disabled off state">
          <Radio value="md-off-disabled" size="md" isDisabled />
        </RadioGroup>
        <RadioGroup aria-label="Medium disabled on state" defaultValue="md-on-disabled">
          <Radio value="md-on-disabled" size="md" isDisabled />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.lg}
        </div>
        <RadioGroup aria-label="Large off state">
          <Radio value="lg-off" size="lg" />
        </RadioGroup>
        <RadioGroup aria-label="Large on state" defaultValue="lg-on">
          <Radio value="lg-on" size="lg" />
        </RadioGroup>

        <div className="text-[12px] font-bold uppercase text-text-default-muted">
          {text.states.lgDisabled}
        </div>
        <RadioGroup aria-label="Large disabled off state">
          <Radio value="lg-off-disabled" size="lg" isDisabled />
        </RadioGroup>
        <RadioGroup aria-label="Large disabled on state" defaultValue="lg-on-disabled">
          <Radio value="lg-on-disabled" size="lg" isDisabled />
        </RadioGroup>
      </div>
    );
  },
};
