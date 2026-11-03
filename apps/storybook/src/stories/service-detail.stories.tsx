import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  ServiceDetail,
  ServiceDetailTable,
  type ServiceApply,
  type ServiceDetailProps,
} from '@tradenetcorp/veli-blocks/service-detail';
import {
  serviceDetailContent,
  serviceDetailSummaryOptions,
  serviceDetailFigmaContent,
} from '@tradenetcorp/veli-blocks/examples/service-detail-content';
import { ServiceDetailComposition } from '@tradenetcorp/veli-blocks/examples/service-detail-composition';
import { useVeliLanguage } from '@veli-design/react/provider';

function ServicePreview({
  mode = 'online',
  missing = false,
  ...args
}: Partial<ServiceDetailProps> & { mode?: ServiceApply['mode']; missing?: boolean }) {
  const { language } = useVeliLanguage();
  const [action, setAction] = useState('');
  const content = serviceDetailContent(language, mode, setAction);
  if (content.apply.mode === 'manual') {
    content.apply = {
      ...content.apply,
      forms: content.apply.forms.map(({ id, title, action }) => ({ id, title, action })),
    };
  }
  return (
    <>
      <p role="status" className="sr-only">
        {action ? `${action} — preview only; nothing was submitted or downloaded.` : ''}
      </p>
      <ServiceDetail
        {...content}
        {...(missing
          ? {
              description: undefined,
              provider: undefined,
              metadata: undefined,
              services: [],
              guideline: undefined,
              prerequisites: [],
              apply: {
                mode: 'online' as const,
                action: {
                  id: 'unavailable',
                  label: language === 'dv' ? 'ހުށަނުހެޅޭނެ' : 'Application unavailable',
                  isDisabled: true as const,
                  disabledReason:
                    language === 'dv'
                      ? 'ހުށަހެޅުމުގެ މަޢުލޫމާތު އަދި ލިބެން ނެތް.'
                      : 'Application information is not available yet.',
                },
              },
            }
          : {})}
        {...args}
      />
    </>
  );
}

const meta = {
  title: 'Blocks/Service detail',
  component: ServiceDetail,
  parameters: { layout: 'fullscreen', docs: { source: { type: 'code' } } },
  argTypes: {
    apply: { control: false },
    guideline: { control: false },
    labels: { control: false },
    renderLink: { control: false },
    onGuidelineOpenChange: { control: false },
    isGuidelineOpen: { control: false },
    defaultGuidelineOpen: { control: false },
  },
  render: (args) => <ServicePreview {...args} />,
} satisfies Meta<typeof ServiceDetail>;
export default meta;
// The wrapper supplies required display data and localized labels from the active provider.
type Story = StoryObj<Partial<ServiceDetailProps>>;
export const Default: Story = {};
export const Manual: Story = { render: (args) => <ServicePreview {...args} mode="manual" /> };
export const External: Story = { render: (args) => <ServicePreview {...args} mode="external" /> };
export const Mixed: Story = {
  name: 'Online + external platform',
  parameters: {
    docs: {
      description: {
        story:
          'Figma’s g·Services + external variant: begin online, then continue on a provider’s platform when the selected application requires it.',
      },
    },
  },
  render: (args) => <ServicePreview {...args} mode="mixed" />,
};

// The four Figma summary variants are independent combinations of these two interactions.
export const FeesShown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fees = canvas.getByRole('button', { name: /Show fees|ފީތައް ބައްލަވާ/ });
    await userEvent.click(fees);
    await expect(fees).toHaveAttribute('aria-expanded', 'true');
  },
};
export const ServicesExpanded: Story = {
  play: async ({ canvasElement }) => {
    const more = within(canvasElement).getByRole('button', { name: /^\+6 / });
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
  },
};
export const FeesAndServicesExpanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fees = canvas.getByRole('button', { name: /Show fees|ފީތައް ބައްލަވާ/ });
    await userEvent.click(fees);
    await userEvent.click(canvas.getByRole('button', { name: /^\+6 / }));
    await expect(fees).toHaveAttribute('aria-expanded', 'true');
  },
};
export const MissingData: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Unavailable application content: omit absent metadata and guidelines, and explain the disabled application action.',
      },
    },
  },
  render: (args) => <ServicePreview {...args} missing />,
};

export const SupplementaryServiceSummaries: Story = {
  render: () => {
    const { language } = useVeliLanguage();
    return <ServicePreview summaryOptions={serviceDetailSummaryOptions(language)} />;
  },
};

export const ServiceChanges: Story = {
  name: 'Service Changes',
  parameters: {
    docs: {
      description: {
        story:
          'Service changes with expandable time and fee breakdowns. Use the language toolbar to switch between English/LTR and Dhivehi/RTL. English summary content follows the desktop design; Dhivehi content is illustrative placeholder copy, pending translation and design review.',
      },
    },
  },
  render: () => {
    const { language } = useVeliLanguage();
    return language === 'dv' ? (
      <ServicePreview summaryOptions={serviceDetailSummaryOptions('dv')} />
    ) : (
      <ServiceDetail {...serviceDetailFigmaContent()} />
    );
  },
};

export const CustomComposition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Consumer-owned availability and actions, plus an ordered guideline with multiline preparation, a fees table, core content and compact supplementary metadata cards (two, one or no values). Uses the same parts as the default wrapper. Dhivehi copy is illustrative, pending translation review.',
      },
    },
  },
  render: () => {
    const { language } = useVeliLanguage();
    return <ServiceDetailComposition key={language} language={language} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /Apply online|އޮންލައިން ހުށަހަޅާ/, exact: true }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      /Application selected|އެދުން ހުށަހެޅުން ހޮވިއްޖެ/,
    );
  },
};

export const Table: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Label/value table matching Figma 6607:116474 at 696px desktop width. English rows and amounts match the reference. Dhivehi copy is illustrative and pending translation review; narrow layouts are responsive adaptations.',
      },
    },
    controls: { disable: true },
  },
  render: () => {
    const { language } = useVeliLanguage();
    const rows = [
      ['register', 'Register a New Company', 'އާ ކުންފުންޏެއް ރަޖިސްޓްރީކުރުން'],
      ['directors', 'Change Directors', 'ޑިރެކްޓަރުން ބަދަލުކުރުން'],
      ['managing-director', 'Change Managing Director', 'މެނޭޖިންގ ޑިރެކްޓަރު ބަދަލުކުރުން'],
      ['secretary', 'Change Company Secretary', 'ކުންފުނީގެ ސެކްރެޓަރީ ބަދަލުކުރުން'],
      ['constitution', 'Amend Constitution', 'ޤަވާއިދު އިސްލާހުކުރުން'],
      ['name', 'Change Company Name', 'ކުންފުނީގެ ނަން ބަދަލުކުރުން'],
      ['type', 'Change Company Type', 'ކުންފުނީގެ ބާވަތް ބަދަލުކުރުން'],
      ['increase-capital', 'Increase Capital', 'ރައުސުލްމާލު އިތުރުކުރުން'],
      ['decrease-capital', 'Decrease Capital', 'ރައުސުލްމާލު ކުޑަކުރުން'],
    ];
    return (
      <div
        className="veli-service-detail-root"
        style={{ width: 'min(696px, calc(100vw - 32px))', display: 'block', padding: 0 }}
      >
        <ServiceDetailTable
          label={language === 'dv' ? 'އެޕްލިކޭޝަނުގެ ބާވަތުން ފީ' : 'Fees by application type'}
          items={rows.map(([id, en, dv], index) => ({
            id,
            label: language === 'dv' ? dv : en,
            value:
              language === 'dv'
                ? `${index === 0 ? '2,000' : '100'} ރުފިޔާ`
                : `MVR ${index === 0 ? '2,000' : '100'}`,
          }))}
        />
      </div>
    );
  },
};
