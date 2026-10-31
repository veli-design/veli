import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { addons } from 'storybook/internal/preview-api';
import { useVeliLanguage } from '@veli-design/react/provider';
import { PreviewBanner } from '@tradenetcorp/veli-blocks/preview-banner';
import { providerSwitcherUpdatedEvent } from '../../.storybook/custom-addons/provider/shared';

function BannerStory({
  language = 'en',
  status = 'draft',
}: {
  language?: string;
  status?: 'draft' | 'published';
}) {
  const { language: providerLanguage } = useVeliLanguage();

  useEffect(() => {
    if (language !== 'en' && language !== 'dv') return;
    addons.getChannel().emit(providerSwitcherUpdatedEvent, { language });
  }, [language]);

  const isDv = providerLanguage === 'dv';
  const title = isDv ? 'ޕްރިވިއު' : 'Preview';
  const draftMessage = isDv
    ? 'މިއީ ޝާއިއުނުކުރެވިފައިވާ ކޮންޓެންޓެއް.'
    : 'Only editors can see this version';
  const publishedMessage = 'This is the live version';
  const statusLabel = status === 'published' ? 'Published' : isDv ? 'ޑްރާފްޓް' : 'Draft';
  const action = isDv ? 'ޕްރިވިއުން ނިކުންނާ' : 'Exit preview';
  const body = 'Floating preview banner with a scroll spacer so content stays above the banner.';

  return (
    <div
      lang={providerLanguage}
      dir={isDv ? 'rtl' : 'ltr'}
      className="bg-surface-raised min-h-[120vh]"
    >
      <main className="p-6">
        <p className="type-body-md-regular text-text-base">{body}</p>
        <div className="h-[80vh]" aria-hidden />
      </main>
      <PreviewBanner
        notices={[
          {
            id: 'draft-mode',
            title,
            message: status === 'published' ? publishedMessage : draftMessage,
            previewStatus: status,
            statusLabel,
            action: { href: '#', label: action },
          },
        ]}
      />
    </div>
  );
}

const meta = {
  title: 'Blocks/Preview banner',
  component: BannerStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BannerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {};

export const Published: Story = {
  args: { status: 'published' },
};
