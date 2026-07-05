import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Search } from '@tradenetcorp/veli-ui/search';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const dhivehiSearchText = {
  label: 'ހޯދާ',
  placeholder: 'ހޯދާ',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
  disabledValue: 'ބޭނުންނުކުރެވޭ',
  lockedValue: 'ލޮކްޑް ވެލިއު',
  default: 'އާދައިގެ',
  invalid: 'ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
  readOnly: 'ކިޔަން އެކަނި',
} as const;

const enSearchText = {
  label: 'Search',
  placeholder: 'Search',
  helperText: 'Helper text',
  errorMessage: 'This field needs attention.',
  disabledValue: 'Disabled',
  lockedValue: 'Locked value',
  default: 'Default',
  invalid: 'Invalid',
  disabled: 'Disabled',
  readOnly: 'Read only',
} as const;

const localizedSearchText = {
  en: enSearchText,
  dv: dhivehiSearchText,
} as const;

type SearchLanguage = keyof typeof localizedSearchText;

const useSearchLanguage = (): SearchLanguage => {
  const { direction } = useVeliLanguage();
  return direction === 'rtl' ? 'dv' : 'en';
};

const useSearchText = () => {
  const language = useSearchLanguage();
  return localizedSearchText[language];
};

const searchArgText = {
  'aria-label': {
    en: enSearchText.label,
    dv: dhivehiSearchText.label,
  },
  placeholder: {
    en: enSearchText.placeholder,
    dv: dhivehiSearchText.placeholder,
  },
  description: {
    en: enSearchText.helperText,
    dv: dhivehiSearchText.helperText,
  },
  errorMessage: {
    en: enSearchText.errorMessage,
    dv: dhivehiSearchText.errorMessage,
  },
  defaultValue: {
    en: enSearchText.lockedValue,
    dv: dhivehiSearchText.lockedValue,
  },
} as const;

type SearchArgTextKey = keyof typeof searchArgText;
type SearchStoryArgs = ComponentProps<typeof Search>;

const requiredSearchArgTextKeys = [
  'aria-label',
  'placeholder',
  'description',
  'errorMessage',
] as const satisfies readonly SearchArgTextKey[];

const optionalSearchArgTextKeys = ['defaultValue'] as const satisfies readonly SearchArgTextKey[];

const hiddenNativeSearchArgTypes = {
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

const getLocalizedSearchArgText = (
  key: SearchArgTextKey,
  value: unknown,
  language: SearchLanguage,
  options: { fallback?: boolean } = {},
) => {
  const fallback = options.fallback ?? true;

  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback ? searchArgText[key][language] : undefined;
  }

  const localizedValues: readonly string[] = Object.values(searchArgText[key]);

  if (localizedValues.includes(value)) {
    return searchArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/Search',
  component: Search,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: SearchLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        description,
        placeholder,
        errorMessage,
        defaultValue,
        'aria-label': ariaLabel,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<SearchArgTextKey, string>> = {};
        const currentArgs = {
          'aria-label': ariaLabel,
          description,
          placeholder,
          errorMessage,
          defaultValue,
        };

        requiredSearchArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedSearchArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        optionalSearchArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedSearchArgText(key, currentArgs[key], language, {
            fallback: false,
          });

          if (localizedValue !== undefined && currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [ariaLabel, defaultValue, description, errorMessage, language, placeholder, updateArgs]);

      return <Story />;
    },
  ],
  args: {
    variant: 'default',
    size: 'md',
    'aria-label': enSearchText.label,
    placeholder: enSearchText.placeholder,
    description: enSearchText.helperText,
    errorMessage: enSearchText.errorMessage,
  },
  argTypes: {
    'aria-label': { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'skeleton'],
    },
    skeletonVariant: {
      control: 'select',
      options: ['default', 'outline'],
      if: { arg: 'variant', eq: 'skeleton' },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    description: { control: 'text' },
    errorMessage: { control: 'text' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    ...hiddenNativeSearchArgTypes,
  },
} satisfies Meta<SearchStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const language = useSearchLanguage();

    return (
      <div className="w-[257px]">
        <Search
          {...args}
          aria-label={getLocalizedSearchArgText('aria-label', args['aria-label'], language)}
          placeholder={getLocalizedSearchArgText('placeholder', args.placeholder, language)}
          description={getLocalizedSearchArgText('description', args.description, language)}
          errorMessage={getLocalizedSearchArgText('errorMessage', args.errorMessage, language)}
          defaultValue={
            getLocalizedSearchArgText('defaultValue', args.defaultValue, language, {
              fallback: false,
            }) ?? args.defaultValue
          }
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[257px] flex-col gap-6">
        <Search size="sm" aria-label={text.label} placeholder={text.placeholder} />
        <Search size="md" aria-label={text.label} placeholder={text.placeholder} />
        <Search size="lg" aria-label={text.label} placeholder={text.placeholder} />
      </div>
    );
  },
};

export const Styles: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[257px] flex-col gap-6">
        <Search variant="default" aria-label={text.label} placeholder={text.placeholder} />
        <Search variant="outline" aria-label={text.label} placeholder={text.placeholder} />
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="grid w-[560px] grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <span className="type-caption-regular uppercase tracking-wider text-base-muted">
            Default
          </span>
          <Search
            aria-label={text.label}
            placeholder={text.placeholder}
            description={text.helperText}
          />
          <Search
            aria-label={text.invalid}
            placeholder={text.placeholder}
            isInvalid
            errorMessage={text.errorMessage}
          />
          <Search aria-label={text.disabled} placeholder={text.disabledValue} isDisabled />
          <Search aria-label={text.readOnly} defaultValue={text.lockedValue} isReadOnly />
          <Search variant="skeleton" />
        </div>
        <div className="flex flex-col gap-6">
          <span className="type-caption-regular uppercase tracking-wider text-base-muted">
            Outline
          </span>
          <Search
            variant="outline"
            aria-label={text.label}
            placeholder={text.placeholder}
            description={text.helperText}
          />
          <Search
            variant="outline"
            aria-label={text.invalid}
            placeholder={text.placeholder}
            isInvalid
            errorMessage={text.errorMessage}
          />
          <Search
            variant="outline"
            aria-label={text.disabled}
            placeholder={text.disabledValue}
            isDisabled
          />
          <Search
            variant="outline"
            aria-label={text.readOnly}
            defaultValue={text.lockedValue}
            isReadOnly
          />
          <Search variant="skeleton" skeletonVariant="outline" />
        </div>
      </div>
    );
  },
};

export const FigmaMatrix: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const text = useSearchText();
    const sizes = ['sm', 'md', 'lg'] as const;
    const variants = ['default', 'outline'] as const;

    return (
      <div className="flex flex-col gap-10">
        {variants.map((variant) => (
          <div key={variant} className="space-y-4">
            <p className="type-body-sm-medium capitalize text-base-emphasis">{variant}</p>
            <div className="flex flex-wrap gap-6">
              {sizes.map((size) => (
                <div key={size} className="w-[257px] space-y-3">
                  <p className="type-caption-regular text-base-subtle">{size}</p>
                  <Search
                    variant={variant}
                    size={size}
                    aria-label={text.label}
                    placeholder={text.placeholder}
                  />
                  <Search
                    variant={variant}
                    size={size}
                    aria-label={text.readOnly}
                    placeholder={text.placeholder}
                    defaultValue={text.lockedValue}
                    isReadOnly
                  />
                  <Search
                    variant={variant}
                    size={size}
                    aria-label={text.disabled}
                    placeholder={text.placeholder}
                    isDisabled
                  />
                  <Search variant="skeleton" skeletonVariant={variant} size={size} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
