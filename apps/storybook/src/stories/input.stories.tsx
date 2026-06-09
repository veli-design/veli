import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@tradenetcorp/veli-ui/input';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import {
  ArrowRight,
  CalendarBlank,
  CaretDown,
  Info,
  MagnifyingGlass,
  WarningCircle,
} from 'phosphor-react';

const dhivehiFormText = {
  core: {
    label: 'ލޭބަލް',
    placeholder: 'ޕްލޭސްހޯލްޑަރ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަން އެކަނި',
    required: 'ފުރިހަމަކުރަންޖެހޭ',
    gridColumn: 'ގްރިޑް ކޮލަމް',
    constrained: 'ހަނިކުރެވިފައިވާ',
  },
  input: {
    enterValue: 'ވެލިއުއެއް ލިޔުއްވާ',
    disabledValue: 'ބޭނުންނުކުރެވޭ ވެލިއު',
    helperTextHidden: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
    usesRootWidth: 'ރޫޓް ވިޑްތު ބޭނުންކުރޭ',
    maxWidth: 'އެންމެ ފުޅާމިން',
  },
} as const;

const enFormText = {
  core: {
    label: 'Label',
    placeholder: 'Placeholder',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    invalidWithoutMessage: 'Invalid without message',
    disabled: 'Disabled',
    readOnly: 'Read only',
    required: 'Required',
    gridColumn: 'Grid column',
    constrained: 'Constrained',
  },
  input: {
    enterValue: 'Enter value',
    disabledValue: 'Disabled value',
    helperTextHidden: 'This helper text is hidden while invalid.',
    usesRootWidth: 'Uses the root width',
    maxWidth: 'Max width',
  },
} as const;

const localizedInputText = {
  en: enFormText,
  dv: dhivehiFormText,
} as const;

const useInputText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? localizedInputText.dv : localizedInputText.en;
};

const getLocalizedValue = (value: string | undefined, enValue: string, dvValue: string) => {
  if (!value) {
    return value;
  }

  if (value === enValue) {
    return dvValue;
  }

  return value;
};

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'url', 'tel'],
    },
    isDisabled: {
      control: 'boolean',
    },
    isReadOnly: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
    showRequiredIndicator: {
      control: 'boolean',
    },
  },
  args: {
    label: enFormText.core.label,
    placeholder: enFormText.core.placeholder,
    description: enFormText.core.helperText,
    type: 'text',
    showRequiredIndicator: true,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const text = useInputText();

    return (
      <div className="w-[320px]">
        <Input
          {...args}
          label={getLocalizedValue(args.label, enFormText.core.label, text.core.label)}
          placeholder={getLocalizedValue(
            args.placeholder,
            enFormText.core.placeholder,
            text.core.placeholder,
          )}
          description={getLocalizedValue(
            args.description,
            enFormText.core.helperText,
            text.core.helperText,
          )}
        />
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => {
    const text = useInputText();

    return (
      <div className="w-[320px]">
        <Input
          {...args}
          label={getLocalizedValue(args.label, enFormText.core.label, text.core.label)}
          placeholder={getLocalizedValue(
            args.placeholder,
            enFormText.core.placeholder,
            text.core.placeholder,
          )}
          description={getLocalizedValue(
            args.description,
            enFormText.core.helperText,
            text.core.helperText,
          )}
        />
      </div>
    );
  },
};

/**
 * Showcases all size variants of the Input component.
 */
export const Sizes: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Small (sm)
            </span>
            <Input
              size="sm"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <Input
              size="md"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <Input
              size="lg"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Outline
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Small (sm)
            </span>
            <Input
              size="sm"
              variant="outline"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <Input
              size="md"
              variant="outline"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <Input
              size="lg"
              variant="outline"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const RootClassName: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <Input
          className="w-full"
          label={text.core.gridColumn}
          placeholder={text.input.usesRootWidth}
          description={text.core.helperText}
        />
        <Input
          className="max-w-[240px]"
          label={text.core.constrained}
          placeholder={text.input.maxWidth}
          description={text.core.helperText}
        />
      </div>
    );
  },
};

export const FigmaExploration: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="w-[320px]">
        <Input
          label={text.core.label}
          labelSupplementary="(Optional)"
          isRequired
          labelIcon={<Info size={12} />}
          action="Action"
          placeholder={text.core.placeholder}
          description={text.core.helperText}
          startAddon={<MagnifyingGlass size={16} />}
          startContent={<CalendarBlank size={16} />}
          endContent={
            <span className="flex items-center gap-[4px]">
              <WarningCircle size={16} />
              <CaretDown size={16} />
            </span>
          }
          endAddon={<ArrowRight size={16} />}
        />
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          <Input
            label={text.core.default}
            placeholder={text.input.enterValue}
            description={text.core.helperText}
            startContent={<MagnifyingGlass size={16} />}
          />
          <Input
            label={text.core.invalid}
            placeholder={text.input.enterValue}
            isInvalid
            errorMessage="This field needs attention."
          />
          <Input
            label={text.core.invalidWithoutMessage}
            placeholder={text.input.enterValue}
            isInvalid
            description={text.input.helperTextHidden}
          />
          <Input
            label={text.core.disabled}
            placeholder={text.input.disabledValue}
            isDisabled
            startAddon={<MagnifyingGlass size={16} />}
            endAddon={<ArrowRight size={16} />}
          />
          <Input
            label={text.core.readOnly}
            defaultValue="Locked value"
            isReadOnly
            endContent={<CaretDown size={16} />}
          />
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Outline
          </span>
          <Input
            variant="outline"
            label={text.core.default}
            placeholder={text.input.enterValue}
            description={text.core.helperText}
            startContent={<MagnifyingGlass size={16} />}
          />
          <Input
            variant="outline"
            label={text.core.invalid}
            placeholder={text.input.enterValue}
            isInvalid
            errorMessage="This field needs attention."
          />
          <Input
            variant="outline"
            label={text.core.invalidWithoutMessage}
            placeholder={text.input.enterValue}
            isInvalid
            description={text.input.helperTextHidden}
          />
          <Input
            variant="outline"
            label={text.core.disabled}
            placeholder={text.input.disabledValue}
            isDisabled
            startAddon={<MagnifyingGlass size={16} />}
            endAddon={<ArrowRight size={16} />}
          />
          <Input
            variant="outline"
            label={text.core.readOnly}
            defaultValue="Locked value"
            isReadOnly
            endContent={<CaretDown size={16} />}
          />
        </div>
      </div>
    );
  },
};
