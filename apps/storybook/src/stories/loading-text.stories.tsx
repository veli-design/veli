import type { Meta, StoryObj } from '@storybook/react';
import { LoadingText } from '@veli-design/react/loading-text';
import { useVeliLanguage } from '@veli-design/react/provider';

const meta = {
  title: 'Components/Loading text',
  component: LoadingText,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Marking all as read' },
  argTypes: { children: { control: 'text' }, className: { control: 'text' } },
  render: function Render(args) {
    const { direction } = useVeliLanguage();
    return (
      <div className="type-body-sm-regular rounded-2xl bg-surface-raised p-6">
        <LoadingText {...args}>
          {direction === 'rtl' && args.children === 'Marking all as read'
            ? 'ކިޔާލެވިފައި ކަމަށް ބަދަލުކުރަނީ'
            : args.children}
        </LoadingText>
      </div>
    );
  },
} satisfies Meta<typeof LoadingText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
