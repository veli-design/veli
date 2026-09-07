import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { DotsThree } from 'phosphor-react';
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
    contentOnlyBody: 'Payment received for fishing permit renewal.',
    contentSlotBody: 'Status updates will show up here as the review moves along.',
    headerContentOnly: 'Submitted on 12 March. Waiting for document review.',
    elevation: 'Elevation',
    surfaceWithShadowToken: (elevation: CardElevation) => `${elevation} shadow`,
    spacing: 'Spacing',
    spacingDescription: (spacing: CardSpacing) => `${spacing} padding`,
    staticCard: 'Summary',
    staticDescription: 'Read-only card with no hover state.',
    interactiveCard: 'Open details',
    interactiveDescription: 'Hover or press to see the interactive state.',
    openMenu: 'Open menu',
    titleOnly: 'Fishing permit',
    titleOnlyBody: 'Licence #FP-2048 is active until December.',
    actionOnly: 'Quick actions',
    actionOnlyBody: 'Header with an action control and no title.',
    emptySlots: 'Document checklist',
    emptySlotsBody: 'Identity card and proof of address uploaded.',
  },
  dv: {
    permitApplication: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
    requiredDocuments: 'ޕްރޮގްރެސް އާއި ބޭނުންވާ ލިޔެކިޔުންތައް ޓްރެކްކުރައްވާ.',
    reviewMessage: 'ތިޔަ އެޕްލިކޭޝަން ދަނީ ރިވިއުކުރެވެމުންނެވެ. ގޮތެއް ނިމުމުން އަންގާނަން.',
    viewDetails: 'ތަފްސީލު ބައްލަވާ',
    continue: 'ކުރިއަށްގެންދަވާ',
    contentOnlyBody: 'މަސްވެރިކަމުގެ ހުއްދަ ރިނިއުއަލްގެ ފައިސާ ލިބިއްޖެ.',
    contentSlotBody: 'ރިވިއު ކުރިއަށްދާއިރު ސްޓޭޓަސް އަޕްޑޭޓް މިތަނުގައި ފެންނާނެ.',
    headerContentOnly: '12 މާރޗް ހުށަހެޅިފައި. ޑޮކިއުމަންޓް ރިވިއުއަށް އިންޒާރުވެލެއްވުން.',
    elevation: 'އެލިވޭޝަން',
    surfaceWithShadowToken: (elevation: CardElevation) => `${elevation} ޝެޑޯ`,
    spacing: 'ސްޕޭސިންގް',
    spacingDescription: (spacing: CardSpacing) => `${spacing} ޕެޑިންގް`,
    staticCard: 'ޚުލާސާ',
    staticDescription: 'ހޯވަރ ސްޓޭޓެއް ނެތް ރީޑް-އޮންލީ ކާރޑް.',
    interactiveCard: 'ތަފްސީލު ހުޅުވާ',
    interactiveDescription: 'އިންޓަރެކްޓިވް ސްޓޭޓް ބައްލަވާނީ ހޯވަރ ނުވަތަ ޕްރެސް ކުރައްވާ.',
    openMenu: 'މެނޫ ހުޅުވާ',
    titleOnly: 'މަސްވެރިކަމުގެ ހުއްދަ',
    titleOnlyBody: 'ލައިސަން #FP-2048 ޑިސެމްބަރުން ހުއްޓެވެ.',
    actionOnly: 'އެކްޝަން',
    actionOnlyBody: 'ޓައިޓަލެއް ނެތް ހެޑަރ އެކްޝަން.',
    emptySlots: 'ޑޮކިއުމަންޓް ލިސްޓް',
    emptySlotsBody: 'އައިޑީ ކާޑް އާއި އަޑްރެސް އަޕްލޯޑްކޮށްފައި.',
  },
} as const;

const useCardText = () => {
  const { direction } = useVeliLanguage();

  return cardText[direction === 'rtl' ? 'dv' : 'en'];
};

function CardCompoundExample({
  spacing,
  elevation,
  interactive,
  onClick,
}: {
  spacing?: CardSpacing;
  elevation?: CardElevation;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const text = useCardText();

  return (
    <Card
      className="w-[420px]"
      spacing={spacing}
      elevation={elevation}
      interactive={interactive}
      onClick={onClick}
    >
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
}

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

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adjust elevation, spacing, and interactive. Switch language and theme from the toolbar.',
      },
    },
  },
  render: ({ spacing, elevation, interactive }) => (
    <CardCompoundExample spacing={spacing} elevation={elevation} interactive={interactive} />
  ),
};

export const Default: Story = {
  render: ({ spacing, elevation, interactive }) => (
    <CardCompoundExample spacing={spacing} elevation={elevation} interactive={interactive} />
  ),
};

export const ContentOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Cards can be body-only, use Card.Content, or skip the footer.',
      },
    },
  },
  render: ({ spacing, elevation, interactive }) => {
    const text = useCardText();

    return (
      <div className="grid w-[420px] gap-4">
        <Card spacing={spacing} elevation={elevation} interactive={interactive}>
          {text.contentOnlyBody}
        </Card>
        <Card spacing={spacing} elevation={elevation} interactive={interactive}>
          <Card.Content>{text.contentSlotBody}</Card.Content>
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
    docs: {
      description: {
        story: 'Shadow levels from none to lg. Try light and dark from the toolbar.',
      },
    },
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

export const Spacing: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const text = useCardText();

    return (
      <div className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardSpacings.map((spacing) => (
          <Card key={spacing} spacing={spacing} elevation="xs">
            <Card.Header>
              <Card.Title>
                {text.spacing} {spacing}
              </Card.Title>
            </Card.Header>
            <Card.Content>{text.spacingDescription(spacing)}</Card.Content>
          </Card>
        ))}
      </div>
    );
  },
};

export const Interactive: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'interactive adds hover and press feedback. Make the card focusable yourself if the whole surface should be clickable.',
      },
    },
  },
  render: () => {
    const text = useCardText();

    return (
      <div className="grid w-[900px] gap-4 sm:grid-cols-2">
        <Card elevation="xs" spacing="md">
          <Card.Header>
            <Card.Title>{text.staticCard}</Card.Title>
            <Card.Description>{text.staticDescription}</Card.Description>
          </Card.Header>
          <Card.Content>{text.reviewMessage}</Card.Content>
        </Card>
        <Card
          elevation="lg"
          spacing="md"
          interactive
          onClick={() => {
            // Demo only. Add keyboard support if the card itself is the control.
          }}
        >
          <Card.Header>
            <Card.Title>{text.interactiveCard}</Card.Title>
            <Card.Description>{text.interactiveDescription}</Card.Description>
          </Card.Header>
          <Card.Content>{text.reviewMessage}</Card.Content>
        </Card>
      </div>
    );
  },
};

export const HeaderAction: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: ({ spacing, elevation }) => {
    const text = useCardText();

    return (
      <Card className="w-[420px]" spacing={spacing} elevation={elevation}>
        <Card.Header
          action={
            <Button
              intent="secondary"
              appearance="transparent"
              size="sm"
              iconOnly
              aria-label={text.openMenu}
            >
              <DotsThree size={16} weight="bold" />
            </Button>
          }
        >
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

export const EdgeCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Title without description, action-only header, and empty description or footer slots.',
      },
    },
  },
  render: () => {
    const text = useCardText();

    return (
      <div className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card spacing="sm" elevation="xs">
          <Card.Header>
            <Card.Title>{text.titleOnly}</Card.Title>
          </Card.Header>
          <Card.Content>{text.titleOnlyBody}</Card.Content>
        </Card>
        <Card spacing="sm" elevation="xs">
          <Card.Header
            action={
              <Button
                intent="secondary"
                appearance="transparent"
                size="sm"
                iconOnly
                aria-label={text.openMenu}
              >
                <DotsThree size={16} weight="bold" />
              </Button>
            }
          >
            {null}
          </Card.Header>
          <Card.Content>{text.actionOnlyBody}</Card.Content>
        </Card>
        <Card spacing="sm" elevation="xs">
          <Card.Header>
            <Card.Title>{text.emptySlots}</Card.Title>
            <Card.Description>{''}</Card.Description>
          </Card.Header>
          <Card.Content>{text.emptySlotsBody}</Card.Content>
          <Card.Footer>{''}</Card.Footer>
        </Card>
      </div>
    );
  },
};
