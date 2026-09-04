import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, type AvatarAppearance, type AvatarSize } from '@tradenetcorp/veli-ui/avatar';

const appearances: AvatarAppearance[] = [
  'blue',
  'neutral',
  'emerald',
  'yellow',
  'orange',
  'magenta',
  'indigo',
  'teal',
  'green',
  'lime',
];

const sizes: AvatarSize[] = ['60', '52', '44', '36', '28', '20', '16'];

const appearanceLabels: Record<AvatarAppearance, string> = {
  blue: 'Blue',
  neutral: 'Neutral',
  emerald: 'Emerald',
  yellow: 'Yellow',
  orange: 'Orange',
  magenta: 'Magenta',
  indigo: 'Indigo',
  teal: 'Teal',
  green: 'Green',
  lime: 'Lime',
};

const sampleImage =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80';

const languageToolbarNote =
  'Switch the Storybook language toolbar to Dhivehi / RTL to verify Thaana initials mapping and vertical alignment.';

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
    src: {
      control: 'text',
      description: 'Image URL. When set and loadable, image content takes priority over type.',
    },
    alt: {
      control: 'text',
      description:
        'Accessible name for all content types. Falls back to initials text, then User or Agency.',
    },
    initials: {
      control: 'text',
      description: 'Accepts initials or a full name and formats the visible initials.',
    },
  },
  args: {
    appearance: 'blue',
    size: '44',
    type: 'icon',
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
    initials: 'John Doe',
  },
  parameters: {
    docs: {
      description: {
        story: 'When the image fails to load, Avatar falls back to initials when provided.',
      },
    },
  },
  render: (args) => <Avatar {...args} />,
};

export const Initials: Story = {
  args: {
    type: 'initials',
    initials: 'MJ',
    alt: 'MJ',
  },
  parameters: {
    docs: {
      description: {
        story: languageToolbarNote,
      },
    },
  },
  render: (args) => <Avatar {...args} />,
};

export const DerivedInitials: Story = {
  args: {
    type: 'initials',
    initials: 'Shiham Hussain',
    alt: 'Shiham Hussain',
  },
  parameters: {
    docs: {
      description: {
        story: `${languageToolbarNote} Digraphs such as SH map to Thaana letters in Dhivehi mode.`,
      },
    },
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

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Fixed pixel diameters from the design system. Responsive layout is consumer-controlled.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-end gap-[12px]">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-[8px]">
          <Avatar appearance="blue" size={size} type="icon" alt="User" />
          <span className="type-caption-regular text-base-muted">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const SingleInitialSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Sizes 16 and 20 render a single initial. Larger sizes use two glyphs from a multi-word name.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-end gap-[16px]">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-[8px]">
          <Avatar
            appearance="blue"
            size={size}
            type="initials"
            initials="Shiham Hussain"
            alt="Shiham Hussain"
          />
          <span className="type-caption-regular text-base-muted">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass a meaningful alt for every content type. Image uses a visible img; icon and initials use a screen-reader-only img.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Avatar type="image" src={sampleImage} alt="Aishath Mariyam" size="52" />
      <Avatar type="initials" initials="Aishath Mariyam" alt="Aishath Mariyam" size="52" />
      <Avatar type="icon" alt="User profile" size="52" />
      <Avatar type="agencyIcon" alt="Ministry of Tourism" size="52" />
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: `${languageToolbarNote} Theme and surface toolbars also apply to this matrix.`,
      },
    },
  },
  render: () => (
    <div className="space-y-[32px]">
      {appearances.map((appearance) => (
        <section key={appearance} className="space-y-[12px]">
          <h3 className="type-body-sm-medium text-base-emphasis">{appearanceLabels[appearance]}</h3>

          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-[12px]">
              <thead>
                <tr className="type-body-sm-regular text-base-muted">
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
                  <td className="type-body-sm-regular text-base">Image</td>
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
                  <td className="type-body-sm-regular text-base">Icon</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar appearance={appearance} size={size} type="icon" alt="User" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="type-body-sm-regular text-base">Agency Icon</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar appearance={appearance} size={size} type="agencyIcon" alt="Agency" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="type-body-sm-regular text-base">Initials</td>
                  {sizes.map((size) => (
                    <td key={size} className="text-center">
                      <Avatar
                        appearance={appearance}
                        size={size}
                        type="initials"
                        initials="Shiham Hussain"
                        alt="Shiham Hussain"
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
