import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Input } from '@veli-design/react/input';
import { useVeliLanguage } from '@veli-design/react/provider';
import { TextArea } from '@veli-design/react/textarea';
import { Card } from '@veli-design/react/card';

const cardDocsText = {
  en: {
    permitApplication: 'Permit application',
    requiredDocuments: 'Track progress and required documents.',
    reviewMessage: 'Your application is under review. We will notify you when a decision is ready.',
    viewDetails: 'View details',
    continue: 'Continue',
    defaultElevation: 'Default',
    spacingToggleLabel: 'Card spacing',
    contactTitle: 'Contact details',
    contactDescription: 'How we reach you about this application.',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'Phone',
    phonePlaceholder: '+960 7XX XXXX',
    notesLabel: 'Notes',
    notesPlaceholder: 'Anything the reviewer should know',
    save: 'Save',
  },
  dv: {
    permitApplication: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
    requiredDocuments: 'ޕްރޮގްރެސް އާއި ބޭނުންވާ ލިޔެކިޔުންތައް ޓްރެކްކުރައްވާ.',
    reviewMessage: 'ތިޔަ އެޕްލިކޭޝަން ދަނީ ރިވިއުކުރެވެމުންނެވެ. ގޮތެއް ނިމުމުން އަންގާނަން.',
    viewDetails: 'ތަފްސީލު ބައްލަވާ',
    continue: 'ކުރިއަށްގެންދަވާ',
    defaultElevation: 'އާދައިގެ',
    spacingToggleLabel: 'ކާރޑް ސްޕޭސިންގް',
    contactTitle: 'ގުޅުންތައް',
    contactDescription: 'މި އެޕްލިކޭޝަން ގެންގުޅުން ހަމަޖެއްސުމަށް.',
    emailLabel: 'އީމެއިލް',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'ފޯން',
    phonePlaceholder: '+960 7XX XXXX',
    notesLabel: 'ނޯޓްސް',
    notesPlaceholder: 'ރިވިއުވަރަށް އެނގޭނެ އެއްޗެއް',
    save: 'ސޭވް',
  },
} as const;

const useCardDocsText = () => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? cardDocsText.dv : cardDocsText.en;
};

export function CardUsageDemo() {
  const text = useCardDocsText();

  return (
    <Card className="w-full max-w-md">
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

export function CardElevationsDemo() {
  const text = useCardDocsText();
  const elevations = ['none', 'xs', 'sm', 'md', 'lg'] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {elevations.map((elevation) => (
        <Card key={elevation} elevation={elevation} spacing="sm">
          <Card.Header>
            <Card.Title>{elevation === 'xs' ? text.defaultElevation : elevation}</Card.Title>
          </Card.Header>
          <Card.Content>{elevation}</Card.Content>
        </Card>
      ))}
    </div>
  );
}

export function CardSpacingDemo() {
  const text = useCardDocsText();
  const spacings = ['sm', 'md', 'lg', 'xl'] as const;
  const [spacing, setSpacing] = useState<(typeof spacings)[number]>('md');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex flex-wrap justify-center gap-1"
        role="group"
        aria-label={text.spacingToggleLabel}
      >
        {spacings.map((value) => {
          const selected = spacing === value;

          return (
            <Button
              key={value}
              size="sm"
              intent={selected ? 'primary' : 'secondary'}
              appearance={selected ? 'fill' : 'transparent'}
              aria-pressed={selected}
              onPress={() => setSpacing(value)}
            >
              {value === 'md' ? text.defaultElevation : value}
            </Button>
          );
        })}
      </div>
      <Card className="w-full max-w-md" spacing={spacing} elevation="xs">
        <Card.Header>
          <Card.Title>{text.permitApplication}</Card.Title>
          <Card.Description>{text.requiredDocuments}</Card.Description>
        </Card.Header>
        <Card.Content>{text.reviewMessage}</Card.Content>
        <Card.Footer>
          <Button size="sm">{text.continue}</Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export function CardFormDemo() {
  const text = useCardDocsText();

  return (
    <Card className="w-full max-w-md">
      <Card.Header>
        <Card.Title>{text.contactTitle}</Card.Title>
        <Card.Description>{text.contactDescription}</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-3">
          <Input
            label={text.emailLabel}
            placeholder={text.emailPlaceholder}
            defaultValue="aisha.mohamed@example.com"
          />
          <Input label={text.phoneLabel} placeholder={text.phonePlaceholder} />
          <TextArea label={text.notesLabel} placeholder={text.notesPlaceholder} rows={3} />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button size="sm">{text.save}</Button>
      </Card.Footer>
    </Card>
  );
}
