import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Card } from '@tradenetcorp/veli-ui/card';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

type CardSpacing = NonNullable<ComponentProps<typeof Card>['spacing']>;
type CardElevation = NonNullable<ComponentProps<typeof Card>['elevation']>;

const cardSpacings: CardSpacing[] = ['sm', 'md', 'lg', 'xl'];
const cardElevations: CardElevation[] = ['none', 'xs', 'sm', 'md', 'lg'];

const cardText = {
  en: {
    permitApplication: 'Permit application',
    requiredDocuments: 'Track progress and required documents.',
    reviewMessage: 'Your application is under review. We will notify you when a decision is ready.',
    viewDetails: 'View details',
    continue: 'Continue',
    sameLayoutBeforeSlot: 'Same layout using the optional',
    sameLayoutAfterSlot: 'slot for the body region.',
    headerContentOnly: 'Header and content only — no footer required.',
    elevation: 'Elevation',
    surfaceWithShadowToken: (elevation: CardElevation) => `Surface with ${elevation} shadow token.`,
  },
  dv: {
    permitApplication: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
    requiredDocuments: 'ޕްރޮގްރެސް އާއި ބޭނުންވާ ލިޔެކިޔުންތައް ޓްރެކްކުރައްވާ.',
    reviewMessage: 'ތިޔަ އެޕްލިކޭޝަން ދަނީ ރިވިއުކުރެވެމުންނެވެ. ގޮތެއް ނިމުމުން އަންގާނަން.',
    viewDetails: 'ތަފްސީލު ބައްލަވާ',
    continue: 'ކުރިއަށްގެންދަވާ',
    sameLayoutBeforeSlot: 'ބޮޑީ ރީޖަންއަށް އިޚްތިޔާރީ',
    sameLayoutAfterSlot: 'ސްލޮޓް ބޭނުންކޮށްގެން ހަމަ މި ލޭއައުޓް.',
    headerContentOnly: 'ހަމައެކަނި ހެޑަރ އާއި ކޮންޓެންޓް — ފުޓަރއެއް ބޭނުމެއް ނުވޭ.',
    elevation: 'އެލިވޭޝަން',
    surfaceWithShadowToken: (elevation: CardElevation) => `${elevation} ޝެޑޯ ޓޯކަންއާއެކު ސަރފޭސް.`,
  },
} as const;

const useCardText = () => {
  const { direction } = useVeliLanguage();

  return cardText[direction === 'rtl' ? 'dv' : 'en'];
};

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    spacing: 'md',
    elevation: 'xs',
    interactive: false,
  },
  argTypes: {
    spacing: {
      control: 'select',
      options: cardSpacings,
    },
    elevation: {
      control: 'select',
      options: cardElevations,
    },
    interactive: {
      control: 'boolean',
    },
    children: {
      table: { disable: true },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ spacing, elevation, interactive }) => {
    const text = useCardText();

    return (
      <Card className="w-[420px]" spacing={spacing} elevation={elevation} interactive={interactive}>
        <Card.Header>
          <Card.Title>{text.permitApplication}</Card.Title>
          <Card.Description>{text.requiredDocuments}</Card.Description>
        </Card.Header>
        <Card.Content>{text.reviewMessage}</Card.Content>
        <Card.Footer>
          <Button intent="secondary" appearance="transparent" size="sm">
            {text.viewDetails}
          </Button>
          <Button size="sm">{text.continue}</Button>
        </Card.Footer>
      </Card>
    );
  },
};

export const ContentOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Header and footer are optional. Put body copy directly inside `Card`, or use `Card.Content` when you want a dedicated body slot.',
      },
    },
  },
  render: ({ spacing, elevation, interactive }) => {
    const text = useCardText();

    return (
      <div className="grid w-[420px] gap-4">
        <Card spacing={spacing} elevation={elevation} interactive={interactive}>
          {text.reviewMessage}
        </Card>
        <Card spacing={spacing} elevation={elevation} interactive={interactive}>
          <Card.Content>
            {text.sameLayoutBeforeSlot} <code>Card.Content</code> {text.sameLayoutAfterSlot}
          </Card.Content>
        </Card>
        <Card spacing={spacing} elevation={elevation} interactive={interactive}>
          <Card.Header>
            <Card.Title>{text.permitApplication}</Card.Title>
            <Card.Description>{text.requiredDocuments}</Card.Description>
          </Card.Header>
          <Card.Content>{text.headerContentOnly}</Card.Content>
        </Card>
      </div>
    );
  },
};

export const Elevations: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useCardText();

    return (
      <div className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cardElevations.map((elevation) => (
          <Card key={elevation} elevation={elevation} spacing="sm">
            <Card.Header>
              <Card.Title>
                {text.elevation} {elevation}
              </Card.Title>
            </Card.Header>
            <Card.Content>{text.surfaceWithShadowToken(elevation)}</Card.Content>
          </Card>
        ))}
      </div>
    );
  },
};
