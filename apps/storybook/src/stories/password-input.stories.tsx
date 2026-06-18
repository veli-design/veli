import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { PasswordInput, defaultPasswordRequirements } from '@tradenetcorp/veli-ui/password-input';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const enPasswordText = {
  label: 'Label',
  optional: 'Optional',
  placeholder: 'Enter Password',
  helperText: 'Helper text',
  errorMessage: 'This field needs attention.',
  passwordMatch: 'Password match',
  passwordMismatch: 'Password do not match',
  newPassword: 'New password',
  confirmPassword: 'Confirm password',
  default: 'Default',
  invalid: 'Invalid',
  disabled: 'Disabled',
  readOnly: 'Read only',
  required: 'Required',
} as const;

const dvPasswordText = {
  label: 'ލޭބަލް',
  optional: 'އިޚްތިޔާރީ',
  placeholder: 'ޕާސްވޯޑް ލިޔުއްވާ',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
  passwordMatch: 'ޕާސްވޯޑް ހަމަވެއްޖެ',
  passwordMismatch: 'ޕާސްވޯޑް ހަމަނުވެ',
  newPassword: 'އާ ޕާސްވޯޑް',
  confirmPassword: 'ޕާސްވޯޑް ޔަގީންކުރާ',
  default: 'އާދައިގެ',
  invalid: 'ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
  readOnly: 'ކިޔަން އެކަނި',
  required: 'ފުރިހަމަކުރަންޖެހޭ',
} as const;

const localizedPasswordText = {
  en: enPasswordText,
  dv: dvPasswordText,
} as const;

type PasswordLanguage = keyof typeof localizedPasswordText;

const usePasswordLanguage = (): PasswordLanguage => {
  const { direction } = useVeliLanguage();
  return direction === 'rtl' ? 'dv' : 'en';
};

const usePasswordText = () => {
  const language = usePasswordLanguage();
  return localizedPasswordText[language];
};

const passwordArgText = {
  label: {
    en: enPasswordText.label,
    dv: dvPasswordText.label,
  },
  placeholder: {
    en: enPasswordText.placeholder,
    dv: dvPasswordText.placeholder,
  },
  description: {
    en: enPasswordText.helperText,
    dv: dvPasswordText.helperText,
  },
  errorMessage: {
    en: enPasswordText.errorMessage,
    dv: dvPasswordText.errorMessage,
  },
} as const;

type PasswordArgTextKey = keyof typeof passwordArgText;
type PasswordStoryArgs = ComponentProps<typeof PasswordInput> & {
  showOptional: boolean;
};

const passwordArgTextKeys = Object.keys(passwordArgText) as PasswordArgTextKey[];

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: PasswordLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { description, label, placeholder, errorMessage } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<PasswordArgTextKey, string>> = {};
        const currentArgs = { description, label, placeholder, errorMessage };

        passwordArgTextKeys.forEach((key) => {
          const localizedValue = passwordArgText[key][language];
          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [description, label, placeholder, errorMessage, language, updateArgs]);

      return <Story />;
    },
  ],
  argTypes: {
    showOptional: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'skeleton'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    requirements: { control: 'boolean' },
    showRequirementsWhenEmpty: { control: 'boolean' },
    isSuccess: { control: 'boolean' },
    feedbackTone: {
      control: 'select',
      options: ['success', 'danger'],
    },
  },
  args: {
    label: enPasswordText.label,
    placeholder: enPasswordText.placeholder,
    description: enPasswordText.helperText,
    errorMessage: enPasswordText.errorMessage,
    showOptional: false,
    isRequired: true,
    showRequiredIndicator: true,
    requirements: false,
    showRequirementsWhenEmpty: false,
    isSuccess: false,
    feedbackTone: 'danger',
  },
} satisfies Meta<PasswordStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = usePasswordLanguage();
    const { showOptional, ...inputArgs } = args;

    return (
      <div className="w-[320px]">
        <PasswordInput
          {...inputArgs}
          label={passwordArgText.label[language]}
          labelSupplementary={showOptional ? localizedPasswordText[language].optional : undefined}
          placeholder={passwordArgText.placeholder[language]}
          description={passwordArgText.description[language]}
          errorMessage={passwordArgText.errorMessage[language]}
        />
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: Default.render,
};

export const Sizes: Story = {
  render: () => {
    const text = usePasswordText();

    return (
      <div className="flex w-[320px] flex-col gap-8">
        <PasswordInput size="sm" label={text.label} isRequired placeholder={text.placeholder} />
        <PasswordInput size="md" label={text.label} isRequired placeholder={text.placeholder} />
        <PasswordInput size="lg" label={text.label} isRequired placeholder={text.placeholder} />
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = usePasswordText();

    return (
      <div className="flex w-[320px] flex-col gap-8">
        <PasswordInput
          label={text.default}
          placeholder={text.placeholder}
          description={text.helperText}
        />
        <PasswordInput
          label={text.invalid}
          defaultValue="secret-password"
          isInvalid
          errorMessage={text.errorMessage}
        />
        <PasswordInput
          label={text.confirmPassword}
          defaultValue="secret-password"
          isInvalid
          feedbackMessage={text.passwordMismatch}
          feedbackTone="danger"
        />
        <PasswordInput
          label={text.confirmPassword}
          defaultValue="secret-password"
          feedbackMessage={text.passwordMatch}
          feedbackTone="success"
          isSuccess
        />
        <PasswordInput label={text.disabled} placeholder={text.placeholder} isDisabled />
        <PasswordInput label={text.readOnly} defaultValue="secret-password" isReadOnly />
      </div>
    );
  },
};

export const NewPasswordSetup: Story = {
  render: () => {
    const text = usePasswordText();
    const [password, setPassword] = useState('Pass1!');

    return (
      <div className="w-[320px]">
        <PasswordInput
          label={text.newPassword}
          isRequired
          value={password}
          onChange={setPassword}
          requirements={defaultPasswordRequirements}
        />
      </div>
    );
  },
};

export const PasswordMatchFlow: Story = {
  render: () => {
    const text = usePasswordText();
    const [password, setPassword] = useState('SecretPass1!');
    const [confirmPassword, setConfirmPassword] = useState('SecretPass1!');
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    return (
      <div className="flex w-[320px] flex-col gap-6">
        <PasswordInput
          label={text.newPassword}
          isRequired
          value={password}
          onChange={setPassword}
          requirements={defaultPasswordRequirements}
        />
        <PasswordInput
          label={text.confirmPassword}
          isRequired
          value={confirmPassword}
          onChange={setConfirmPassword}
          isInvalid={confirmPassword.length > 0 && !passwordsMatch}
          isSuccess={passwordsMatch}
          feedbackMessage={
            confirmPassword.length > 0
              ? passwordsMatch
                ? text.passwordMatch
                : text.passwordMismatch
              : undefined
          }
          feedbackTone={passwordsMatch ? 'success' : 'danger'}
        />
      </div>
    );
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-8">
      <PasswordInput variant="skeleton" size="sm" label="Label" description="Helper text" />
      <PasswordInput variant="skeleton" size="md" label="Label" description="Helper text" />
      <PasswordInput variant="skeleton" size="lg" label="Label" description="Helper text" />
    </div>
  ),
};
