import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { Search } from '@tradenetcorp/veli-ui/search';
import { Form } from '@tradenetcorp/veli-ui/form';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const dhivehiSearchText = {
  label: 'ހޯދާ',
  placeholder: 'ހޯދާ',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
  disabledValue: 'ބޭނުންނުކުރެވޭ',
  lockedValue: 'ލޮކްޑް ވެލިއު',
  default: 'އާދައިގެ',
  filled: 'ލިޔެފައި',
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
  filled: 'Filled',
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

const withCategory = (category: string, entries: Record<string, object>) =>
  Object.fromEntries(
    Object.entries(entries).map(([key, entry]) => [key, { ...entry, table: { category } }]),
  );

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
    appearance: 'default',
    size: 'md',
    'aria-label': enSearchText.label,
    placeholder: enSearchText.placeholder,
    description: enSearchText.helperText,
    errorMessage: enSearchText.errorMessage,
  },
  argTypes: {
    ...withCategory('Appearance', {
      appearance: { control: 'select', options: ['default', 'outline'] },
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
    }),
    ...withCategory('Content', {
      label: { control: 'text' },
      'aria-label': { control: 'text' },
      placeholder: { control: 'text' },
      description: { control: 'text' },
      defaultValue: { control: 'text' },
      value: { control: false },
      onChange: { control: false },
      onSubmit: { control: false },
      onClear: { control: false },
    }),
    ...withCategory('State', {
      isDisabled: { control: 'boolean' },
      isReadOnly: { control: 'boolean' },
      isInvalid: { control: 'boolean' },
      isRequired: { control: 'boolean' },
      showRequiredIndicator: { control: 'boolean' },
      errorMessage: { control: 'text' },
      validate: { control: false },
      validationBehavior: { control: 'select', options: ['native', 'aria'] },
      autoFocus: { control: 'boolean' },
    }),
    ...withCategory('Native input', {
      name: { control: 'text' },
      form: { control: 'text' },
      autoCapitalize: { control: 'text' },
      autoComplete: { control: 'text' },
      autoCorrect: { control: 'text' },
      enterKeyHint: { control: 'text' },
      inputMode: { control: 'text' },
      maxLength: { control: 'number' },
      minLength: { control: 'number' },
      pattern: { control: 'text' },
      spellCheck: { control: 'boolean' },
    }),
    ...withCategory('Integration', {
      className: { control: 'text' },
      ref: { control: false },
      'aria-labelledby': { control: 'text' },
      'aria-describedby': { control: 'text' },
      onFocus: { control: false },
      onBlur: { control: false },
      onKeyDown: { control: false },
    }),
  },
} satisfies Meta<SearchStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const language = useSearchLanguage();

    return (
      <div key={`${language}:${args.defaultValue ?? ''}`} className="w-[320px] max-w-full">
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

function StoryMarker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider text-base-muted">{children}</p>;
}

function StatePreview({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <StoryMarker>{title}</StoryMarker>
      {children}
    </div>
  );
}

export const Sizes: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[320px] max-w-full flex-col gap-8">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex min-w-0 flex-col gap-6">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {appearance === 'default' ? 'Default' : 'Outline'}
            </span>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                  {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
                </span>
                <Search
                  appearance={appearance}
                  size={size}
                  aria-label={text.label}
                  placeholder={text.placeholder}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Appearances: Story = {
  render: () => {
    const text = useSearchText();

    return (
      <div className="flex w-[320px] max-w-full flex-col gap-6">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {appearance === 'default' ? 'Default' : 'Outline'}
            </span>
            <Search
              appearance={appearance}
              aria-label={text.label}
              placeholder={text.placeholder}
            />
          </div>
        ))}
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useSearchText();
    return (
      <div className="flex w-[320px] max-w-full flex-col gap-8">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-6">
            <StoryMarker>{appearance === 'default' ? 'Default' : 'Outline'}</StoryMarker>
            <StatePreview title={text.default}>
              <Search
                appearance={appearance}
                aria-label={text.label}
                placeholder={text.placeholder}
                description={text.helperText}
              />
            </StatePreview>
            <StatePreview title={text.invalid}>
              <Search
                appearance={appearance}
                aria-label={text.invalid}
                placeholder={text.placeholder}
                isInvalid
                errorMessage={text.errorMessage}
              />
            </StatePreview>
            <StatePreview title={text.disabled}>
              <Search
                appearance={appearance}
                aria-label={text.disabled}
                placeholder={text.disabledValue}
                isDisabled
              />
            </StatePreview>
            <StatePreview title={text.readOnly}>
              <Search
                appearance={appearance}
                aria-label={text.readOnly}
                defaultValue={text.lockedValue}
                isReadOnly
              />
            </StatePreview>
          </div>
        ))}
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => {
    const text = useSearchText();
    return (
      <div className="flex w-[320px] max-w-full flex-col gap-10">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="space-y-6">
            <StoryMarker>{appearance === 'default' ? 'Default' : 'Outline'}</StoryMarker>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="space-y-6">
                <StoryMarker>
                  {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
                </StoryMarker>
                <StatePreview title={text.default}>
                  <Search
                    appearance={appearance}
                    size={size}
                    aria-label={text.label}
                    placeholder={text.placeholder}
                  />
                </StatePreview>
                <StatePreview title={text.filled}>
                  <Search
                    appearance={appearance}
                    size={size}
                    aria-label={`${text.label} filled`}
                    defaultValue={text.lockedValue}
                  />
                </StatePreview>
                <StatePreview title={text.invalid}>
                  <Search
                    appearance={appearance}
                    size={size}
                    aria-label={text.invalid}
                    isInvalid
                    errorMessage={text.errorMessage}
                  />
                </StatePreview>
                <StatePreview title={text.readOnly}>
                  <Search
                    appearance={appearance}
                    size={size}
                    aria-label={text.readOnly}
                    defaultValue={text.lockedValue}
                    isReadOnly
                  />
                </StatePreview>
                <StatePreview title={text.disabled}>
                  <Search
                    appearance={appearance}
                    size={size}
                    aria-label={text.disabled}
                    placeholder={text.placeholder}
                    isDisabled
                  />
                </StatePreview>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

function SearchInteractionExample() {
  const text = useSearchText();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Form
      className="flex w-[320px] max-w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('query')));
      }}
    >
      <Search
        aria-label="Uncontrolled query"
        name="query"
        appearance="outline"
        defaultValue="Veli"
        description={text.helperText}
        ref={inputRef}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        enterKeyHint="search"
        inputMode="search"
        minLength={2}
        maxLength={40}
        pattern=".*"
        spellCheck={false}
      />
      <Search aria-label="Controlled query" value={value} onChange={setValue} />
      <output data-testid="controlled-value">{value}</output>
      <Search aria-label="Disabled query" defaultValue="Disabled" isDisabled />
      <Search aria-label="Read-only query" defaultValue="Read only" isReadOnly />
      <Search
        aria-label="Invalid query"
        validationBehavior="aria"
        isInvalid
        description="Hidden helper"
        errorMessage={text.errorMessage}
      />
      <div className="flex gap-4">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
        <button type="button" onClick={() => inputRef.current?.focus()}>
          Focus via ref
        </button>
      </div>
      <output data-testid="submitted-value">{submitted}</output>
    </Form>
  );
}

export const Interactions: Story = {
  render: () => <SearchInteractionExample />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const query = canvas.getByRole('searchbox', { name: 'Uncontrolled query' }) as HTMLInputElement;
    const controlled = canvas.getByRole('searchbox', { name: 'Controlled query' });
    const clearLabel = globals.language === 'dv' ? 'ހޯދުން ފޮހެލާ' : 'Clear search';
    const shell = query.parentElement!;
    await userEvent.click(canvas.getByRole('button', { name: 'Focus via ref' }));
    await expect(query).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: clearLabel }));
    await expect(query).toHaveValue('');
    await expect(query).toHaveFocus();
    await userEvent.type(query, 'services');
    await userEvent.tab();
    await expect(within(shell).getByRole('button', { name: clearLabel })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(query).toHaveValue('');
    await expect(query).toHaveFocus();
    await expect(canvas.getByTestId('submitted-value')).toBeEmptyDOMElement();
    await userEvent.type(query, 'services');
    await userEvent.click(canvas.getByRole('button', { name: /^Submit$/ }));
    await expect(canvas.getByTestId('submitted-value')).toHaveTextContent('services');
    await userEvent.click(canvas.getByRole('button', { name: /^Reset$/ }));
    await expect(query).toHaveValue('Veli');
    await userEvent.type(controlled, 'docs');
    await expect(canvas.getByTestId('controlled-value')).toHaveTextContent('docs');
    await userEvent.click(
      within(controlled.parentElement!).getByRole('button', { name: clearLabel }),
    );
    await expect(controlled).toHaveValue('');
    await expect(controlled).toHaveFocus();
    await expect(canvas.getByTestId('controlled-value')).toBeEmptyDOMElement();
    await userEvent.type(controlled, 'reset me');
    await userEvent.click(canvas.getByRole('button', { name: /^Reset$/ }));
    await expect(controlled).toHaveValue('');
    await expect(canvas.getByTestId('controlled-value')).toBeEmptyDOMElement();
    for (const name of ['Disabled query', 'Read-only query']) {
      const field = canvas.getByRole('searchbox', { name }) as HTMLInputElement;
      await expect(within(field.parentElement!).queryByRole('button')).toBeNull();
      await userEvent.type(field, 'change');
      await expect(field).toHaveValue(name === 'Disabled query' ? 'Disabled' : 'Read only');
    }
    const invalid = canvas.getByRole('searchbox', { name: 'Invalid query' });
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.queryByText('Hidden helper')).toBeNull();
    await expect(invalid).toHaveAccessibleDescription(
      globals.language === 'dv' ? dhivehiSearchText.errorMessage : enSearchText.errorMessage,
    );
    await expect(query).toHaveAccessibleDescription(
      globals.language === 'dv' ? dhivehiSearchText.helperText : enSearchText.helperText,
    );
    await expect(query).toHaveAttribute('maxlength', '40');
    await expect(query).toHaveAttribute('minlength', '2');
    await expect(query).toHaveAttribute('inputmode', 'search');
    await expect(query).toHaveAttribute('enterkeyhint', 'search');
    await userEvent.clear(query);
    await userEvent.click(canvas.getByRole('button', { name: 'Focus via ref' }));
    // Move focus outside, then compare content coordinates across pointer states.
    await userEvent.click(canvas.getByRole('button', { name: /^Reset$/ }));
    await userEvent.clear(query);
    await userEvent.click(canvas.getByRole('button', { name: /^Submit$/ }));
    await userEvent.unhover(shell);
    const rect = () => [
      shell.getBoundingClientRect().width,
      shell.getBoundingClientRect().height,
      query.getBoundingClientRect().x,
      query.getBoundingClientRect().width,
    ];
    const rest = rect();
    await userEvent.hover(shell);
    await expect(rect()).toEqual(rest);
    await userEvent.click(shell);
    await expect(query).toHaveFocus();
    await expect(rect()).toEqual(rest);
    await userEvent.tab();
    canvasElement.dataset.searchInteractions = 'passed';
  },
};

function SearchFormValidationExample() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Form
      validationBehavior="native"
      className="w-[320px] max-w-full space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Search
        label="Search services"
        name="required-query"
        isRequired
        minLength={3}
        pattern="[A-Za-z]+"
        validate={(query) => (query.length < 3 || query === 'blocked' ? 'Try another query' : null)}
        errorMessage="Enter at least three letters and avoid blocked queries."
      />
      <button type="submit">Search</button>
      <output data-testid="validation-submit">{submitted ? 'Submitted' : 'Not submitted'}</output>
    </Form>
  );
}

export const FormValidation: Story = {
  render: () => <SearchFormValidationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const query = canvas.getByRole('searchbox', { name: 'Search services' });
    const submit = canvas.getByRole('button', { name: /^Search$/ });
    await expect(query).toHaveAttribute('required');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('validation-submit')).toHaveTextContent('Not submitted');
    await expect(query).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(query, 'ab');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('validation-submit')).toHaveTextContent('Not submitted');
    await userEvent.clear(query);
    await userEvent.type(query, 'blocked');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('validation-submit')).toHaveTextContent('Not submitted');
    await userEvent.clear(query);
    await userEvent.type(query, '123');
    await userEvent.click(submit);
    await expect(canvas.getByTestId('validation-submit')).toHaveTextContent('Not submitted');
    await expect(query).toHaveAttribute('aria-invalid', 'true');
    await userEvent.clear(query);
    await userEvent.type(query, 'services');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('validation-submit')).toHaveTextContent('Submitted');
    canvasElement.dataset.searchValidation = 'passed';
  },
};

export const Labels: Story = {
  render: () => {
    const text = useSearchText();
    return (
      <div className="grid w-[320px] max-w-full gap-6">
        <Search label={text.label} size="sm" description={text.helperText} />
        <Search label={text.label} isRequired description={text.helperText} />
        <Search
          label={text.label}
          appearance="outline"
          size="lg"
          isRequired
          showRequiredIndicator={false}
        />
        <Search label={text.disabled} isDisabled />
        <Search label={text.invalid} isInvalid errorMessage={text.errorMessage} />
      </div>
    );
  },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const text = globals.language === 'dv' ? dhivehiSearchText : enSearchText;
    const inputs = canvas.getAllByRole('searchbox', { name: text.label });
    await expect(inputs).toHaveLength(3);
    await expect(inputs[0]).toHaveAccessibleDescription(text.helperText);
    await expect(inputs[1]).toHaveAttribute('required');
    await expect(inputs[2]).toHaveAttribute('required');
    await expect(canvas.getAllByText('*')).toHaveLength(1);
    await expect(canvas.getByRole('searchbox', { name: text.invalid })).toHaveAccessibleDescription(
      text.errorMessage,
    );
    canvasElement.dataset.searchLabels = 'passed';
  },
};

function SearchEventsExample() {
  const [submitted, setSubmitted] = useState('');
  const [clears, setClears] = useState(0);
  return (
    <div className="w-[320px] max-w-full space-y-4">
      <Search
        label="Search documents"
        defaultValue="Veli"
        onSubmit={setSubmitted}
        onClear={() => setClears((count) => count + 1)}
      />
      <p className="type-caption-regular text-base-muted">
        Press Enter to submit a query. Use Escape or the clear button to clear it.
      </p>
      <div className="space-y-2 type-body-sm-regular text-base-default">
        <p>
          Last submitted query:{' '}
          <output data-testid="search-submitted">{submitted || 'None yet'}</output>
        </p>
        <p>
          Clear events: <output data-testid="search-clears">{clears}</output>
        </p>
      </div>
    </div>
  );
}

export const SearchEvents: Story = {
  render: () => <SearchEventsExample />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const query = canvas.getByRole('searchbox', { name: 'Search documents' });
    await userEvent.click(query);
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('search-submitted')).toHaveTextContent('Veli');
    await userEvent.keyboard('{Escape}');
    await expect(query).toHaveValue('');
    await expect(query).toHaveFocus();
    await expect(canvas.getByTestId('search-clears')).toHaveTextContent('1');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByTestId('search-clears')).toHaveTextContent('1');
    await userEvent.type(query, 'docs');
    await userEvent.click(
      canvas.getByRole('button', {
        name: globals.language === 'dv' ? 'ހޯދުން ފޮހެލާ' : 'Clear search',
      }),
    );
    await expect(query).toHaveValue('');
    await expect(query).toHaveFocus();
    await expect(canvas.getByTestId('search-clears')).toHaveTextContent('2');
    canvasElement.dataset.searchEvents = 'passed';
  },
};

export const FormServerErrors: Story = {
  render: () => (
    <Form
      className="w-[320px] max-w-full"
      validationErrors={{ query: 'Enter a supported service name.' }}
    >
      <Search
        label="Search services"
        name="query"
        isRequired
        description="Search by service name."
      />
    </Form>
  ),
  play: async ({ canvasElement }) => {
    const query = within(canvasElement).getByRole('searchbox', { name: 'Search services' });
    await expect(query).toHaveAttribute('aria-required', 'true');
    await expect(query).not.toHaveAttribute('required');
    await expect(query).toHaveAttribute('aria-invalid', 'true');
    await expect(query).toHaveAccessibleDescription('Enter a supported service name.');
    canvasElement.dataset.searchServerErrors = 'passed';
  },
};
