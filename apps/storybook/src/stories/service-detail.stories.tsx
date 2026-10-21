import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  ServiceDetail,
  type ServiceApply,
  type ServiceDetailProps,
} from '@tradenetcorp/veli-blocks/service-detail';
import { serviceDetailContent } from '@tradenetcorp/veli-blocks/examples/service-detail-content';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

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
