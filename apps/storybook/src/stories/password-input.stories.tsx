import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { PasswordInput, defaultPasswordRequirements } from '@tradenetcorp/veli-ui/password-input';
import type {
  PasswordRequirement,
  PasswordRequirementId,
} from '@tradenetcorp/veli-ui/password-input';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const collapsedControlGroups = ['Content', 'State', 'Password-specific'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function PasswordInputDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) {
        return;
      }

      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );

      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }

      collapsedControlGroups.forEach(collapseControlGroup);
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

const dhivehiFormText = {
  core: {
    label: 'ލޭބަލް',
    optional: 'އިޚްތިޔާރީ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަން އެކަނި',
    required: 'ފުރިހަމަކުރަންޖެހޭ',
  },
  password: {
    placeholder: 'ޕާސްވޯޑް ލިޔުއްވާ',
    infoTip: 'މި ފީލްޑަށް ބޭނުންވާ މަޢުލޫމާތު ބަލާ ލިޔުއްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
    passwordMatch: 'ޕާސްވޯޑް ދިމާވޭ',
    passwordMismatch: 'ޕާސްވޯޑް ދިމާނުވޭ',
    newPassword: 'އާ ޕާސްވޯޑް',
    confirmPassword: 'ޕާސްވޯޑް ޔަގީންކުރޭ',
  },
} as const;

const enFormText = {
  core: {
    label: 'Label',
    optional: 'Optional',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    disabled: 'Disabled',
    readOnly: 'Read only',
    required: 'Required',
  },
  password: {
    placeholder: 'Enter Password',
    infoTip: 'Use this field for the requested supporting information.',
    infoTipLabel: 'More information',
    errorMessage: 'This field needs attention.',
    passwordMatch: 'Password match',
    passwordMismatch: 'Password do not match',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
  },
} as const;

const localizedPasswordText = {
  en: enFormText,
  dv: dhivehiFormText,
} as const;

type PasswordLanguage = keyof typeof localizedPasswordText;

const dhivehiPasswordRequirements = {
  minLength: '8+ އަކުރު',
  lowercase: 'ކުޑަ އަކުރެއް',
  uppercase: 'ބޮޑު އަކުރެއް',
  number: 'ނަންބަރެއް',
  specialCharacter: 'ޚާއްޞަ ކެރެކްޓަރެއް',
} as const satisfies Record<PasswordRequirementId, string>;

const localizedPasswordRequirements = {
  en: defaultPasswordRequirements,
  dv: defaultPasswordRequirements.map((requirement) => ({
    ...requirement,
    label: dhivehiPasswordRequirements[requirement.id],
  })),
} satisfies Record<PasswordLanguage, PasswordRequirement[]>;

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
    en: enFormText.core.label,
    dv: dhivehiFormText.core.label,
  },
  placeholder: {
    en: enFormText.password.placeholder,
    dv: dhivehiFormText.password.placeholder,
  },
  description: {
    en: enFormText.core.helperText,
    dv: dhivehiFormText.core.helperText,
  },
  errorMessage: {
    en: enFormText.password.errorMessage,
    dv: dhivehiFormText.password.errorMessage,
  },
} as const;

type PasswordArgTextKey = keyof typeof passwordArgText;
type PasswordStoryArgs = ComponentProps<typeof PasswordInput>;

const passwordArgTextKeys = Object.keys(passwordArgText) as PasswordArgTextKey[];

const getPasswordPreviewKey = (
  language: PasswordLanguage,
  defaultValue: PasswordStoryArgs['defaultValue'],
) => `${language}:${typeof defaultValue === 'string' ? defaultValue : ''}`;

const hiddenNativePasswordArgTypes = {
  autoCapitalize: { control: false, table: { disable: true } },
  autoComplete: { control: false, table: { disable: true } },
  autoCorrect: { control: false, table: { disable: true } },
  enterKeyHint: { control: false, table: { disable: true } },
  inputMode: { control: false, table: { disable: true } },
  maxLength: { control: false, table: { disable: true } },
  minLength: { control: false, table: { disable: true } },
  pattern: { control: false, table: { disable: true } },
  spellCheck: { control: false, table: { disable: true } },
} as const;

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [
      name,
      {
        ...argType,
        table: {
          ...('table' in argType && argType.table && typeof argType.table === 'object'
            ? argType.table
            : {}),
          category,
        },
      },
    ]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const getLocalizedPasswordArgText = (
  key: PasswordArgTextKey,
  value: unknown,
  language: PasswordLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return passwordArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(passwordArgText[key]);

  if (localizedValues.includes(value)) {
    return passwordArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  decorators: [
    (Story, context) => {
      const language: PasswordLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { description, label, placeholder, errorMessage } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<PasswordArgTextKey, string>> = {};
        const currentArgs = {
          description,
          label,
          placeholder,
          errorMessage,
        };

        passwordArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedPasswordArgText(key, currentArgs[key], language);

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
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: PasswordInputDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      appearance: {
        control: 'select',
        options: ['default', 'outline'],
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
      },
    }),
    ...withArgCategory('Label', {
      label: {
        control: 'text',
      },
    }),
    ...withArgCategory('Content', {
      placeholder: {
        control: 'text',
      },
      defaultValue: {
        control: 'text',
      },
      description: {
        control: 'text',
      },
    }),
    ...withArgCategory('State', {
      isRequired: {
        control: 'boolean',
      },
      showRequiredIndicator: {
        control: 'boolean',
      },
      isInvalid: {
        control: 'boolean',
      },
      errorMessage: {
        control: 'text',
      },
      isDisabled: {
        control: 'boolean',
      },
      isReadOnly: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('Password-specific', {
      requirements: {
        control: 'boolean',
      },
      showRequirementsWhenEmpty: {
        control: 'boolean',
      },
      isSuccess: {
        control: 'boolean',
      },
      feedbackMessage: {
        control: 'text',
      },
      feedbackTone: {
        control: 'select',
        options: ['success', 'danger'],
      },
      showVisibilityToggle: {
        control: 'boolean',
      },
      defaultRevealed: {
        control: 'boolean',
      },
      isRevealed: {
        control: 'boolean',
      },
    }),
    ref: { table: { disable: true } },
    className: { table: { disable: true } },
    labelIcon: { control: false, table: { disable: true } },
    action: { control: false, table: { disable: true } },
    startAddon: { control: false, table: { disable: true } },
    startContent: { control: false, table: { disable: true } },
    onRevealedChange: { control: false, table: { disable: true } },
    ...hiddenNativePasswordArgTypes,
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: enFormText.core.label,
    placeholder: enFormText.password.placeholder,
    defaultValue: '',
    description: enFormText.core.helperText,
    isRequired: true,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: enFormText.password.errorMessage,
    isDisabled: false,
    isReadOnly: false,
    requirements: false,
    showRequirementsWhenEmpty: false,
    isSuccess: false,
    feedbackTone: 'danger',
    showVisibilityToggle: true,
    defaultRevealed: false,
  },
} satisfies Meta<PasswordStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = usePasswordLanguage();

    return (
      <div key={getPasswordPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <PasswordInput
          {...args}
          label={getLocalizedPasswordArgText('label', args.label, language)}
          placeholder={getLocalizedPasswordArgText('placeholder', args.placeholder, language)}
          description={getLocalizedPasswordArgText('description', args.description, language)}
          errorMessage={getLocalizedPasswordArgText('errorMessage', args.errorMessage, language)}
        />
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    appearance: 'outline',
  },
  render: Default.render,
};

export const Sizes: Story = {
  render: () => {
    const language = usePasswordLanguage();
    const text = usePasswordText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Default
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <PasswordInput
                size={size}
                label={text.core.label}
                placeholder={text.password.placeholder}
                description={text.core.helperText}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Outline
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <PasswordInput
                size={size}
                appearance="outline"
                label={text.core.label}
                placeholder={text.password.placeholder}
                description={text.core.helperText}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = usePasswordLanguage();
    const text = usePasswordText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-4">
          <PasswordInput
            label={text.core.default}
            placeholder={text.password.placeholder}
            description={text.core.helperText}
          />
          <PasswordInput
            label={text.core.invalid}
            defaultValue="secret-password"
            isInvalid
            errorMessage={text.password.errorMessage}
          />
          <PasswordInput
            label={text.core.disabled}
            placeholder={text.password.placeholder}
            description={text.core.helperText}
            isDisabled
          />
          <PasswordInput
            label={text.core.readOnly}
            defaultValue="secret-password"
            description={text.core.helperText}
            isReadOnly
          />
        </div>
        <div className="flex flex-col gap-4">
          <PasswordInput
            appearance="outline"
            label={text.core.default}
            placeholder={text.password.placeholder}
            description={text.core.helperText}
          />
          <PasswordInput
            appearance="outline"
            label={text.core.invalid}
            defaultValue="secret-password"
            isInvalid
            errorMessage={text.password.errorMessage}
          />
          <PasswordInput
            appearance="outline"
            label={text.core.disabled}
            placeholder={text.password.placeholder}
            description={text.core.helperText}
            isDisabled
          />
          <PasswordInput
            appearance="outline"
            label={text.core.readOnly}
            defaultValue="secret-password"
            description={text.core.helperText}
            isReadOnly
          />
        </div>
      </div>
    );
  },
};

export const Required: Story = {
  args: {
    isRequired: true,
  },
  render: Default.render,
};

export const Requirements: Story = {
  render: () => {
    const text = usePasswordText();
    const language = usePasswordLanguage();
    const [password, setPassword] = useState('Pass1!');

    return (
      <div key={language} className="w-[320px]">
        <PasswordInput
          label={text.password.newPassword}
          isRequired
          value={password}
          onChange={setPassword}
          requirements={localizedPasswordRequirements[language]}
        />
      </div>
    );
  },
};

export const MatchMismatch: Story = {
  render: () => {
    const text = usePasswordText();
    const language = usePasswordLanguage();
    const [password, setPassword] = useState('SecretPass1!');
    const [confirmPassword, setConfirmPassword] = useState('SecretPass1!');
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    return (
      <div key={language} className="flex w-[320px] flex-col gap-6">
        <PasswordInput
          label={text.password.newPassword}
          isRequired
          value={password}
          onChange={setPassword}
          requirements={localizedPasswordRequirements[language]}
        />
        <PasswordInput
          label={text.password.confirmPassword}
          isRequired
          value={confirmPassword}
          onChange={setConfirmPassword}
          isInvalid={confirmPassword.length > 0 && !passwordsMatch}
          isSuccess={passwordsMatch}
          feedbackMessage={
            confirmPassword.length > 0
              ? passwordsMatch
                ? text.password.passwordMatch
                : text.password.passwordMismatch
              : undefined
          }
          feedbackTone={passwordsMatch ? 'success' : 'danger'}
        />
      </div>
    );
  },
};

export const Revealed: Story = {
  args: {
    defaultValue: 'SecretPass1!',
    defaultRevealed: true,
  },
  render: Default.render,
};
