import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Avatar, type AvatarAppearance, type AvatarSize } from '@veli-design/react/avatar';
import { useVeliLanguage } from '@veli-design/react/provider';

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

const enAvatarText = {
  userAlt: 'User',
  agencyAlt: 'Agency',
  initials: 'MJ',
  initialsAlt: 'MJ',
  derivedInitials: 'Shiham Hussain',
  derivedAlt: 'Shiham Hussain',
  imageAlt: 'John Doe',
  fallbackInitials: 'John Doe',
} as const;

const dhivehiAvatarText = {
  userAlt: 'ޔޫޒަރ',
  agencyAlt: 'އެޖެންސީ',
  initials: 'MJ',
  initialsAlt: 'އެމްޖޭ',
  derivedInitials: 'Shiham Hussain',
  derivedAlt: 'ޝިހާމް ހުސައިން',
  imageAlt: 'ޖޯން ޑޯ',
  fallbackInitials: 'John Doe',
} as const;

const localizedAvatarText = {
  en: enAvatarText,
  dv: dhivehiAvatarText,
} as const;

type AvatarLanguage = keyof typeof localizedAvatarText;

const avatarArgText = {
  alt: {
    en: enAvatarText.userAlt,
    dv: dhivehiAvatarText.userAlt,
  },
  initials: {
    en: enAvatarText.derivedInitials,
    dv: dhivehiAvatarText.derivedInitials,
  },
} as const;

type AvatarArgTextKey = keyof typeof avatarArgText;
type AvatarStoryArgs = ComponentProps<typeof Avatar>;

const avatarArgTextKeys = Object.keys(avatarArgText) as AvatarArgTextKey[];

const useAvatarLanguage = (): AvatarLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useAvatarText = () => {
  const language = useAvatarLanguage();

  return localizedAvatarText[language];
};

const getLocalizedAvatarArgText = (
  key: AvatarArgTextKey,
  value: unknown,
  language: AvatarLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return avatarArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(avatarArgText[key]);

  if (localizedValues.includes(value)) {
    return avatarArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  decorators: [
    (Story, context) => {
      const language: AvatarLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { alt, initials } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<AvatarArgTextKey, string>> = {};
        const currentArgs = { alt, initials };

        avatarArgTextKeys.forEach((key) => {
          if (typeof currentArgs[key] !== 'string' || currentArgs[key]!.trim().length === 0) {
            return;
          }

          const localizedValue = getLocalizedAvatarArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [alt, initials, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
      include: ['appearance', 'size', 'type', 'src', 'initials', 'alt'],
    },
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
    },
    initials: {
      control: 'text',
    },
    alt: {
      control: 'text',
    },
    className: {
      table: { disable: true },
    },
  },
  args: {
    appearance: 'blue',
    size: '44',
    type: 'icon',
  },
} satisfies Meta<AvatarStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Avatar {...args} />,
};

export const Appearances: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[12px]">
      {appearances.map((appearance) => (
        <Avatar
          key={appearance}
          appearance={appearance}
          type="initials"
          initials="MV"
          alt={appearanceLabels[appearance]}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => {
    const text = useAvatarText();

    return (
      <div className="space-y-[24px]">
        <div className="space-y-[8px]">
          <p className="type-body-sm-medium text-base-emphasis">Icon</p>
          <div className="flex flex-wrap items-end gap-[12px]">
            {sizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-[8px]">
                <Avatar appearance="blue" size={size} type="icon" alt={text.userAlt} />
                <span className="type-caption-regular text-base-muted">{size}px</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-[8px]">
          <p className="type-body-sm-medium text-base-emphasis">Initials</p>
          <div className="flex flex-wrap items-end gap-[12px]">
            {sizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-[8px]">
                <Avatar
                  appearance="blue"
                  size={size}
                  type="initials"
                  initials={text.derivedInitials}
                  alt={text.derivedAlt}
                />
                <span className="type-caption-regular text-base-muted">{size}px</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const Image: Story = {
  args: {
    type: 'image',
    src: sampleImage,
    alt: enAvatarText.imageAlt,
    initials: enAvatarText.fallbackInitials,
  },
  render: (args) => {
    const language = useAvatarLanguage();
    const text = useAvatarText();

    return <Avatar key={language} {...args} alt={text.imageAlt} initials={text.fallbackInitials} />;
  },
};

export const ImageFallback: Story = {
  args: {
    type: 'image',
    src: 'https://example.invalid/avatar.jpg',
    alt: enAvatarText.imageAlt,
    initials: enAvatarText.fallbackInitials,
  },
  render: (args) => {
    const language = useAvatarLanguage();
    const text = useAvatarText();

    return <Avatar key={language} {...args} alt={text.imageAlt} initials={text.fallbackInitials} />;
  },
};

export const Initials: Story = {
  args: {
    type: 'initials',
    initials: enAvatarText.initials,
    alt: enAvatarText.initialsAlt,
  },
  render: (args) => {
    const language = useAvatarLanguage();
    const text = useAvatarText();

    return <Avatar key={language} {...args} initials={text.initials} alt={text.initialsAlt} />;
  },
};

export const DerivedInitials: Story = {
  args: {
    type: 'initials',
    initials: enAvatarText.derivedInitials,
    alt: enAvatarText.derivedAlt,
  },
  render: (args) => {
    const language = useAvatarLanguage();
    const text = useAvatarText();

    return (
      <Avatar key={language} {...args} initials={text.derivedInitials} alt={text.derivedAlt} />
    );
  },
};

export const AgencyIcon: Story = {
  args: {
    type: 'agencyIcon',
  },
  render: (args) => {
    const language = useAvatarLanguage();
    const text = useAvatarText();

    return <Avatar key={language} {...args} alt={text.agencyAlt} />;
  },
};
