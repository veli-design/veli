import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { expect, userEvent, within } from '@storybook/test';
import { Divider } from '@veli-design/react/divider';
import { useVeliLanguage } from '@veli-design/react/provider';

const dividerVariants = ['subtle', 'muted', 'strong', 'emphasis'] as const;

const storyPanelClassName =
  'w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-base-subtle bg-surface-raised p-4';

const dividerText = {
  en: {
    orContinueWith: 'Or continue with',
    text: 'text',
    or: 'Or',
    permitInformation: 'Permit information',
    showMore: 'Show more information',
    showLess: 'Show less information',
    additionalInformation: 'Additional information about this section is now available.',
    hiddenInformation: 'Expand to read additional information.',
    dividerDescription:
      'Use horizontal dividers to separate related content blocks without introducing extra hierarchy.',
    sections: {
      one: 'Section one',
      two: 'Section two',
      three: 'Section three',
    },
    tabs: {
      summary: 'Summary',
      documents: 'Documents',
      status: 'Status',
    },
  },
  dv: {
    orContinueWith: 'ނުވަތަ ކުރިއަށްދާނީ',
    text: 'ލިޔުން',
    or: 'ނުވަތަ',
    permitInformation: 'ހުއްދައިގެ މަޢުލޫމާތު',
    showMore: 'އިތުރު މަޢުލޫމާތު ދައްކާ',
    showLess: 'މަޢުލޫމާތު ކުޑަކުރައްވާ',
    additionalInformation: 'މި ބައިގެ އިތުރު މަޢުލޫމާތު މިހާރު ލިބިފައިވޭ.',
    hiddenInformation: 'އިތުރު މަޢުލޫމާތު ކިޔުމަށް އެކްސްޕެންޑް ކުރައްވާ.',
    dividerDescription:
      'އިތުރު ހައިރާކީއެއް ނުގެނެސް ގުޅުންހުރި ބައިތައް ވަކިކުރުމަށް ހޮރިޒޮންޓަލް ޑިވައިޑަރ ބޭނުންކުރައްވާ.',
    sections: {
      one: 'ސެކްޝަން އެކެއް',
      two: 'ސެކްޝަން ދޭއް',
      three: 'ސެކްޝަން ތިނެއް',
    },
    tabs: {
      summary: 'ޚުލާޞާ',
      documents: 'ލިޔެކިޔުންތައް',
      status: 'ސްޓޭޓަސް',
    },
  },
} as const;

type DividerLanguage = keyof typeof dividerText;

const dividerArgText = {
  orContinueWith: {
    en: dividerText.en.orContinueWith,
    dv: dividerText.dv.orContinueWith,
  },
  text: {
    en: dividerText.en.text,
    dv: dividerText.dv.text,
  },
  or: {
    en: dividerText.en.or,
    dv: dividerText.dv.or,
  },
} as const;

type DividerArgTextKey = keyof typeof dividerArgText;

const dividerArgTextKeys = Object.keys(dividerArgText) as DividerArgTextKey[];

const useDividerLanguage = (): DividerLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useDividerText = () => {
  const language = useDividerLanguage();

  return dividerText[language];
};

const getLocalizedDividerArgText = (value: unknown, language: DividerLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return value;
  }

  const matchingKey = dividerArgTextKeys.find((key) => {
    const localizedValues: readonly string[] = Object.values(dividerArgText[key]);

    return localizedValues.includes(value);
  });

  return matchingKey ? dividerArgText[matchingKey][language] : value;
};

const meta = {
  title: 'Components/Divider',
  component: Divider,
  decorators: [
    (Story, context) => {
      const language: DividerLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { text } = args;

      useEffect(() => {
        const localizedText = getLocalizedDividerArgText(text, language);

        if (text !== localizedText) {
          updateArgs?.({ text: localizedText });
        }
      }, [language, text, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    orientation: 'horizontal',
    appearance: 'subtle',
    text: dividerText.en.orContinueWith,
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    appearance: {
      control: 'select',
      options: dividerVariants,
    },
    text: {
      control: 'text',
      if: { arg: 'orientation', eq: 'horizontal' },
    },
    showIcon: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className={storyPanelClassName}>
      <Divider {...args} />
    </div>
  ),
};

export const Default: Story = {
  args: {
    text: undefined,
  },
  render: (args) => {
    const text = useDividerText();

    return (
      <div className={storyPanelClassName}>
        <div className="space-y-3">
          <p className="type-body-sm-medium text-base-emphasis">{text.permitInformation}</p>
          <Divider {...args} />
          <p className="type-body-sm-regular text-base">{text.dividerDescription}</p>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('separator')).toBeVisible();
  },
};

export const WithText: Story = {
  args: {
    text: dividerText.en.orContinueWith,
    appearance: 'subtle',
  },
  render: (args) => (
    <div className={storyPanelClassName}>
      <Divider {...args} />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => {
    const text = useDividerText();

    return (
      <div className={`${storyPanelClassName} space-y-4`}>
        <Divider text={text.orContinueWith} showIcon />
        <Divider text={text.orContinueWith} showIcon appearance="emphasis" />
      </div>
    );
  },
};

export const Expandable: Story = {
  render: () => {
    const text = useDividerText();
    const [expanded, setExpanded] = useState(false);

    return (
      <div className={storyPanelClassName}>
        <div className="space-y-3">
          <p className="type-body-sm-medium text-base-emphasis">{text.permitInformation}</p>
          <p className="type-body-sm-regular text-base">{text.hiddenInformation}</p>
          <div id="divider-additional-information" hidden={!expanded}>
            <p className="type-body-sm-regular text-base">{text.additionalInformation}</p>
          </div>
          <Divider
            text={expanded ? text.showLess : text.showMore}
            showIcon
            appearance="muted"
            aria-label={expanded ? text.showLess : text.showMore}
            aria-expanded={expanded}
            aria-controls="divider-additional-information"
            onClick={() => setExpanded((current) => !current)}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const additionalInformation = canvas.getByText(/Additional information|މި ބައިގެ އިތުރު/);

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(additionalInformation).not.toBeVisible();
    await expect(button.querySelector('svg')).toBeInTheDocument();
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(additionalInformation).toBeVisible();
    await expect(button.querySelector('svg')).toHaveClass('rotate-180');

    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(additionalInformation).not.toBeVisible();
    await expect(button.querySelector('svg')).not.toHaveClass('rotate-180');

    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(additionalInformation).toBeVisible();
    await expect(button.querySelector('svg')).toHaveClass('rotate-180');
  },
};

export const TextVariants: Story = {
  render: () => {
    const text = useDividerText();

    return (
      <div className={`${storyPanelClassName} space-y-4`}>
        {dividerVariants.map((appearance) => (
          <Divider key={appearance} appearance={appearance} text={text.text} />
        ))}
      </div>
    );
  },
};

export const LineVariants: Story = {
  render: () => (
    <div className={`${storyPanelClassName} space-y-4`}>
      {dividerVariants.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-caption-12-medium text-base-muted capitalize">{appearance}</p>
          <Divider appearance={appearance} />
        </div>
      ))}
    </div>
  ),
};

export const Orientations: Story = {
  render: () => {
    const text = useDividerText();

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={storyPanelClassName}>
          <div className="space-y-3">
            <p className="type-body-sm-medium text-base-emphasis">Horizontal</p>
            <div className="space-y-2.5 type-body-sm-regular text-base">
              <p>{text.sections.one}</p>
              <Divider />
              <p>{text.sections.two}</p>
              <Divider appearance="emphasis" text={text.or} />
              <p>{text.sections.three}</p>
            </div>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className="space-y-3">
            <p className="type-body-sm-medium text-base-emphasis">Vertical</p>
            <div className="flex items-center justify-between text-base">
              <span>{text.tabs.summary}</span>
              <Divider orientation="vertical" />
              <span>{text.tabs.documents}</span>
              <Divider orientation="vertical" appearance="emphasis" />
              <span>{text.tabs.status}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
