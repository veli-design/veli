import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Search } from '@tradenetcorp/veli-ui/search';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const dhivehiSearchText = {
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
} as const;

type SearchArgTextKey = keyof typeof searchArgText;

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
      const { description, placeholder, errorMessage } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<SearchArgTextKey, string>> = {};
        const currentArgs = { description, placeholder, errorMessage };

        (Object.keys(searchArgText) as SearchArgTextKey[]).forEach((key) => {
          const value = currentArgs[key];
          const localizedValue = searchArgText[key][language];

          if (typeof value !== 'string' || value.trim().length === 0) {
            if (value !== localizedValue) {
              nextArgs[key] = localizedValue;
            }
            return;
          }

          const localizedValues: readonly string[] = Object.values(searchArgText[key]);
          const resolvedValue = localizedValues.includes(value) ? localizedValue : value;

          if (value !== resolvedValue) {
            nextArgs[key] = resolvedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs(nextArgs);
        }
      }, [description, errorMessage, language, placeholder, updateArgs]);

      return <Story />;
    },
  ],
  args: {
    variant: 'default',
    size: 'md',
    placeholder: enSearchText.placeholder,
  },
  argTypes: {
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
  },
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-[257px]">
      <Search {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[257px] flex-col gap-6">
        <Search size="sm" placeholder={text.placeholder} />
        <Search size="md" placeholder={text.placeholder} />
        <Search size="lg" placeholder={text.placeholder} />
      </div>
    );
  },
};

export const Styles: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[257px] flex-col gap-6">
        <Search variant="default" placeholder={text.placeholder} />
        <Search variant="outline" placeholder={text.placeholder} />
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
          <span className="type-caption-regular uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          <Search placeholder={text.placeholder} description={text.helperText} />
          <Search placeholder={text.placeholder} isInvalid errorMessage={text.errorMessage} />
          <Search placeholder={text.disabledValue} isDisabled />
          <Search defaultValue={text.lockedValue} isReadOnly />
          <Search variant="skeleton" />
        </div>
        <div className="flex flex-col gap-6">
          <span className="type-caption-regular uppercase tracking-wider text-text-default-muted">
            Outline
          </span>
          <Search variant="outline" placeholder={text.placeholder} description={text.helperText} />
          <Search
            variant="outline"
            placeholder={text.placeholder}
            isInvalid
            errorMessage={text.errorMessage}
          />
          <Search variant="outline" placeholder={text.disabledValue} isDisabled />
          <Search variant="outline" defaultValue={text.lockedValue} isReadOnly />
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
            <p className="type-body-sm-medium capitalize text-text-default-emphasis">{variant}</p>
            <div className="flex flex-wrap gap-6">
              {sizes.map((size) => (
                <div key={size} className="w-[257px] space-y-3">
                  <p className="type-caption-regular text-text-default-subtle">{size}</p>
                  <Search variant={variant} size={size} placeholder={text.placeholder} />
                  <Search
                    variant={variant}
                    size={size}
                    placeholder={text.placeholder}
                    defaultValue={text.lockedValue}
                    isReadOnly
                  />
                  <Search variant={variant} size={size} placeholder={text.placeholder} isDisabled />
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
