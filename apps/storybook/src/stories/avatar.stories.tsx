import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, type AvatarAppearance, type AvatarSize } from '@tradenetcorp/veli-ui/avatar';

const appearances: AvatarAppearance[] = [
  'blue',
  'neutral',
  'successGreen',
  'yellow',
  'orange',
  'pink',
  'indigo',
  'turquoise',
  'green',
  'lime',
];

const sizes: AvatarSize[] = ['60', '52', '44', '36', '28', '20', '16'];

const appearanceLabels: Record<AvatarAppearance, string> = {
  blue: 'Blue',
  neutral: 'Neutral',
  successGreen: 'Success Green',
  yellow: 'Yellow',
  orange: 'Orange',
  pink: 'Pink',
  indigo: 'Indigo',
  turquoise: 'Turquoise',
  green: 'Green',
  lime: 'Lime',
};

const sampleImage =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: {
      control: 'select',
      options: appearances,
    },
    size: {
      control: 'select',
      options: sizes,
    },
    type: {
      control: 'select',
      options: ['image', 'initials', 'icon', 'agencyIcon'],
    },
  },
  args: {
    appearance: 'blue',
    size: '60',
    type: 'icon',
    initials: 'MJ',
    alt: 'Avatar',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Avatar {...args} />,
};

export const Image: Story = {
  args: {
    type: 'image',
    src: sampleImage,
    alt: 'John Doe',
    initials: 'JD',
  },
  render: (args) => <Avatar {...args} />,
};

export const ImageFallback: Story = {
  args: {
    type: 'image',
    src: 'https://example.invalid/avatar.jpg',
    alt: 'John Doe',
    initials: 'JD',
  },
  render: (args) => <Avatar {...args} />,
};

export const Initials: Story = {
  args: {
    type: 'initials',
    initials: 'MJ',
    alt: 'MJ',
  },
  render: (args) => <Avatar {...args} />,
};

export const AgencyIcon: Story = {
  args: {
    type: 'agencyIcon',
    alt: 'Agency',
  },
  render: (args) => <Avatar {...args} />,
};

export const AllVariants: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="space-y-[32px]">
      {appearances.map((appearance) => (
        <section key={appearance} className="space-y-[12px]">
          <h3 className="type-body-sm-medium text-text-default-emphasis">
            {appearanceLabels[appearance]}
          </h3>

          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-[12px]">
              <thead>
                <tr className="type-body-sm-regular text-text-default-muted">
                  <th className="text-start font-medium">Type</th>
                  {sizes.map((size) => (
                    <th key={size} className="min-w-[60px] text-center font-medium">
                      {size}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="type-body-sm-regular text-text-default-default">Image</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar
                        appearance={appearance}
                        size={size}
                        type="image"
                        src={sampleImage}
                        alt="User"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="type-body-sm-regular text-text-default-default">Icon</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar appearance={appearance} size={size} type="icon" alt="User" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="type-body-sm-regular text-text-default-default">Agency Icon</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar appearance={appearance} size={size} type="agencyIcon" alt="Agency" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="type-body-sm-regular text-text-default-default">Initials</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar
                        appearance={appearance}
                        size={size}
                        type="initials"
                        initials="MJ"
                        alt="MJ"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  ),
};
