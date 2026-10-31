import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@veli-design/react/button';
import { LoadingText } from '@veli-design/react/loading-text';
import { Spinner } from '@veli-design/react/spinner';
import { useVeliLanguage } from '@veli-design/react/provider';

const panelClassName =
  'flex min-w-0 flex-col gap-6 rounded-2xl border border-base-subtle bg-surface-raised p-6';

function LoadingShowcase() {
  const { language } = useVeliLanguage();
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
      <section className={panelClassName}>
        <h2 className="type-body-sm-semibold text-base-strong">General spinner</h2>
        <div className="flex min-h-24 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </section>
      <section className={panelClassName}>
        <h2 className="type-body-sm-semibold text-base-strong">Pending button</h2>
        <div className="flex min-h-24 items-center justify-center">
          <Button
            isPending
            loadingIndicator={<Spinner variant="button" size="sm" aria-hidden="true" />}
          >
            {language === 'dv' ? 'ރައްކާކުރަނީ' : 'Save changes'}
          </Button>
        </div>
      </section>
      <section className={panelClassName}>
        <h2 className="type-body-sm-semibold text-base-strong">Settling text</h2>
        <div className="type-body-sm-regular flex min-h-24 items-center justify-center">
          <LoadingText>
            {language === 'dv' ? 'ކިޔާލެވިފައި ކަމަށް ބަދަލުކުރަނީ' : 'Marking all as read'}
          </LoadingText>
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Components/Loading',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex justify-center">
        <Story />
      </div>
    ),
  ],
  render: () => <LoadingShowcase />,
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {};
