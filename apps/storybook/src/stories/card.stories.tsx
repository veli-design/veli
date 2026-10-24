import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { DotsThreeIcon, InfoIcon } from '@phosphor-icons/react';
import { Alert } from '@veli-design/react/alert';
import { Avatar } from '@veli-design/react/avatar';
import { Badge } from '@veli-design/react/badge';
import { Button } from '@veli-design/react/button';
import { Card } from '@veli-design/react/card';
import { Input } from '@veli-design/react/input';
import { TextArea } from '@veli-design/react/textarea';
import { useVeliLanguage } from '@veli-design/react/provider';

type CardSpacing = NonNullable<ComponentProps<typeof Card>['spacing']>;
type CardElevation = NonNullable<ComponentProps<typeof Card>['elevation']>;

const cardSpacings: CardSpacing[] = ['sm', 'md', 'lg', 'xl'];
const cardElevations: CardElevation[] = ['none', 'xs', 'sm', 'md', 'lg'];

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function CardDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) {
        return;
      }

      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );

      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }

      collapsedControlGroups.forEach(collapseControlGroup);
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

const enCardText = {
  title: 'Permit application',
  description: 'Reference APP-4821 · Submitted 12 March',
  body: 'Document review is next. Typical turnaround is five working days after all files are received.',
  viewDetails: 'View details',
  continue: 'Continue',
  openMenu: 'Open menu',
  default: 'Default',
  spacingDescription: 'Padding and gap between sections.',
  spacingBody:
    'Name, hull number, and home port are required before you can submit this vessel registration.',
  // Interactive
  interactiveTitle: 'Vessel MV Horizon',
  interactiveDescription: 'Hull MH-1192 · Registered 4 January 2024',
  interactiveBody: 'View ownership, inspections, and permits linked to this vessel.',
  // Composition — profile
  applicantName: 'Aisha Mohamed',
  inReview: 'In review',
  message: 'Message',
  // Composition — form
  contactTitle: 'Contact details',
  contactDescription: 'How we reach you about this application.',
  emailLabel: 'Email',
  emailPlaceholder: 'name@example.com',
  phoneLabel: 'Phone',
  phonePlaceholder: '+960 7XX XXXX',
  notesLabel: 'Notes',
  notesPlaceholder: 'Anything the reviewer should know',
  save: 'Save',
  // Composition — alert inside card
  documentsTitle: 'Required documents',
  documentsDescription: 'Upload before your review appointment.',
  alertTitle: 'Two documents outstanding',
  alertDescription: 'Identity card and proof of address are still needed.',
  upload: 'Upload files',
} as const;

const dvCardText = {
  title: 'ހުއްދައަށް އެދޭ އެޕްލިކޭޝަން',
  description: 'ރެފަރެންސް APP-4821 · 12 މާރޗް ހުށަހެޅިފައި',
  body: 'ކުރިއަށް ޑޮކިއުމަންޓް ރިވިއު. ފައިލްތައް ލިބުމަށްފަހު އާންމުކޮށް 5 ވަރކިން ދުވަސް.',
  viewDetails: 'ތަފްސީލު ބައްލަވާ',
  continue: 'ކުރިއަށްގެންދަވާ',
  openMenu: 'މެނޫ ހުޅުވާ',
  default: 'އާދައިގެ',
  spacingDescription: 'ސެކްޝަންތަކުގެ ދެމެދުގައި ޕެޑިންގް އަދި ގެޕް.',
  spacingBody:
    'މި ވެސަލް ރަޖިސްޓްރޭޝަން ހުށަހަޅާން ކުރިން ނަން، ހަލް ނަންބަރު، އަދި ގެ ޕޯޓް ބޭނުންވެއެވެ.',
  interactiveTitle: 'ވެސަލް MV Horizon',
  interactiveDescription: 'ހަލް MH-1192 · 4 ޖަނަވަރީ 2024 ރަޖިސްޓަރކޮށްފައި',
  interactiveBody: 'މިލްކިއްޔާ، އިންސްޕެކްޝަން، އަދި މި ވެސަލްއާ ގުޅިފައިވާ ހުއްދަތައް ބައްލަވާ.',
  applicantName: 'ޢާއިޝާ މުޙައްމަދު',
  inReview: 'ރިވިއުގައި',
  message: 'މެސެޖް',
  contactTitle: 'ގުޅުންތައް',
  contactDescription: 'މި އެޕްލިކޭޝަން ގެންގުޅުން ހަމަޖެއްސުމަށް.',
  emailLabel: 'އީމެއިލް',
  emailPlaceholder: 'name@example.com',
  phoneLabel: 'ފޯން',
  phonePlaceholder: '+960 7XX XXXX',
  notesLabel: 'ނޯޓްސް',
  notesPlaceholder: 'ރިވިއުވަރަށް އެނގޭނެ އެއްޗެއް',
  save: 'ސޭވް',
  documentsTitle: 'ބޭނުންވާ ލިޔެކިޔުންތައް',
  documentsDescription: 'ރިވިއު އެޕޮއިންޓްމަންޓް ކުރިން އަޕްލޯޑްކުރައްވާ.',
  alertTitle: '2 ޑޮކިއުމަންޓް ބޭނުން',
  alertDescription: 'އައިޑީ ކާޑް އާއި އަޑްރެސް އަދިވެސް ނެތް.',
  upload: 'ފައިލް އަޕްލޯޑް',
} as const;

const localizedCardText = {
  en: enCardText,
  dv: dvCardText,
} as const;

type CardLanguage = keyof typeof localizedCardText;

const cardArgText = {
  title: {
    en: enCardText.title,
    dv: dvCardText.title,
  },
  description: {
    en: enCardText.description,
    dv: dvCardText.description,
  },
  body: {
    en: enCardText.body,
    dv: dvCardText.body,
  },
} as const;

type CardArgTextKey = keyof typeof cardArgText;

type CardStoryArgs = ComponentProps<typeof Card> & {
  title: string;
  description: string;
  body: string;
  showDescription: boolean;
  showFooter: boolean;
  showHeaderAction: boolean;
};

const cardArgTextKeys = Object.keys(cardArgText) as CardArgTextKey[];

const useCardLanguage = (): CardLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useCardText = () => {
  const language = useCardLanguage();

  return localizedCardText[language];
};

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [
      name,
      {
        ...argType,
        table: {
          ...('table' in argType && argType.table && typeof argType.table === 'object'
            ? argType.table
            : {}),
          category,
        },
      },
    ]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const getLocalizedCardArgText = (key: CardArgTextKey, value: unknown, language: CardLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return cardArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(cardArgText[key]);

  if (localizedValues.includes(value)) {
    return cardArgText[key][language];
  }

  return value;
};

const hiddenHtmlCardArgTypes = {
  about: { table: { disable: true } },
  accessKey: { table: { disable: true } },
  autoFocus: { table: { disable: true } },
  contentEditable: { table: { disable: true } },
  contextMenu: { table: { disable: true } },
  dangerouslySetInnerHTML: { table: { disable: true } },
  datatype: { table: { disable: true } },
  defaultChecked: { table: { disable: true } },
  defaultValue: { table: { disable: true } },
  dir: { table: { disable: true } },
  draggable: { table: { disable: true } },
  hidden: { table: { disable: true } },
  id: { table: { disable: true } },
  inlist: { table: { disable: true } },
  inputMode: { table: { disable: true } },
  is: { table: { disable: true } },
  itemID: { table: { disable: true } },
  itemProp: { table: { disable: true } },
  itemRef: { table: { disable: true } },
  itemScope: { table: { disable: true } },
  itemType: { table: { disable: true } },
  lang: { table: { disable: true } },
  nonce: { table: { disable: true } },
  placeholder: { table: { disable: true } },
  prefix: { table: { disable: true } },
  property: { table: { disable: true } },
  radioGroup: { table: { disable: true } },
  resource: { table: { disable: true } },
  results: { table: { disable: true } },
  role: { table: { disable: true } },
  security: { table: { disable: true } },
  slot: { table: { disable: true } },
  spellCheck: { table: { disable: true } },
  style: { table: { disable: true } },
  suppressContentEditableWarning: { table: { disable: true } },
  suppressHydrationWarning: { table: { disable: true } },
  tabIndex: { table: { disable: true } },
  translate: { table: { disable: true } },
  typeof: { table: { disable: true } },
  unselectable: { table: { disable: true } },
  vocab: { table: { disable: true } },
} as const;

const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    (Story, context) => {
      const language: CardLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { title, description, body } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<CardArgTextKey, string>> = {};
        const currentArgs = { title, description, body };

        cardArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedCardArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [title, description, body, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
      exclude: /^(on[A-Z]|aria-|data-)/,
    },
    docs: {
      container: CardDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      elevation: {
        control: 'select',
        options: cardElevations,
      },
      spacing: {
        control: 'select',
        options: cardSpacings,
      },
    }),
    ...withArgCategory('Content', {
      title: {
        control: 'text',
      },
      description: {
        control: 'text',
      },
      body: {
        control: 'text',
      },
      showDescription: {
        control: 'boolean',
      },
      showFooter: {
        control: 'boolean',
      },
      showHeaderAction: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('State', {
      interactive: {
        control: 'boolean',
      },
    }),
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
    ...hiddenHtmlCardArgTypes,
  },
  args: {
    elevation: 'xs',
    spacing: 'md',
    interactive: false,
    title: '',
    description: '',
    body: '',
    showDescription: true,
    showFooter: true,
    showHeaderAction: false,
  },
} satisfies Meta<CardStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useCardLanguage();
    const text = useCardText();
    const {
      title,
      description,
      body,
      showDescription,
      showFooter,
      showHeaderAction,
      elevation,
      spacing,
      interactive,
    } = args;

    return (
      <Card
        key={language}
        className="w-[420px]"
        elevation={elevation}
        spacing={spacing}
        interactive={interactive}
      >
        <Card.Header
          action={
            showHeaderAction ? (
              <Button
                intent="secondary"
                appearance="transparent"
                size="sm"
                iconOnly
                aria-label={text.openMenu}
              >
                <DotsThreeIcon size={16} weight="bold" />
              </Button>
            ) : undefined
          }
        >
          <Card.Title>{getLocalizedCardArgText('title', title, language)}</Card.Title>
          {showDescription ? (
            <Card.Description>
              {getLocalizedCardArgText('description', description, language)}
            </Card.Description>
          ) : null}
        </Card.Header>
        <Card.Content>{getLocalizedCardArgText('body', body, language)}</Card.Content>
        {showFooter ? (
          <Card.Footer>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.viewDetails}
            </Button>
            <Button size="sm">{text.continue}</Button>
          </Card.Footer>
        ) : null}
      </Card>
    );
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
  },
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const language = useCardLanguage();
    const text = useCardText();

    return (
      <Card key={language} className="w-[420px]" elevation="xs" spacing="md" interactive>
        <Card.Header>
          <Card.Title>{text.interactiveTitle}</Card.Title>
          <Card.Description>{text.interactiveDescription}</Card.Description>
        </Card.Header>
        <Card.Content>{text.interactiveBody}</Card.Content>
      </Card>
    );
  },
};

export const Elevations: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const language = useCardLanguage();
    const text = useCardText();

    return (
      <div
        key={language}
        className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {cardElevations.map((elevation) => (
          <Card key={elevation} elevation={elevation} spacing="sm">
            <Card.Header>
              <Card.Title>{elevation === 'xs' ? text.default : elevation}</Card.Title>
            </Card.Header>
            <Card.Content>{elevation}</Card.Content>
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
    const language = useCardLanguage();
    const text = useCardText();

    return (
      <div key={language} className="grid w-[900px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardSpacings.map((spacing) => (
          <Card key={spacing} spacing={spacing} elevation="xs">
            <Card.Header>
              <Card.Title>{spacing === 'md' ? text.default : spacing}</Card.Title>
              <Card.Description>{text.spacingDescription}</Card.Description>
            </Card.Header>
            <Card.Content>{text.spacingBody}</Card.Content>
            <Card.Footer>
              <Button size="sm">{text.continue}</Button>
            </Card.Footer>
          </Card>
        ))}
      </div>
    );
  },
};

export const Composition: Story = {
  parameters: {
    controls: { disable: true },
    layout: 'padded',
  },
  render: () => {
    const language = useCardLanguage();
    const text = useCardText();

    return (
      <div
        key={language}
        className="grid w-[960px] gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start"
      >
        <Card spacing="md" elevation="xs">
          <Card.Header>
            <div className="flex w-full items-start gap-3">
              <Avatar type="initials" initials={text.applicantName} size="44" appearance="teal" />
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <Card.Title>{text.applicantName}</Card.Title>
                <Badge size="sm" intent="info" appearance="subtle" className="w-fit">
                  {text.inReview}
                </Badge>
              </div>
              <Button
                intent="secondary"
                appearance="transparent"
                size="sm"
                iconOnly
                aria-label={text.openMenu}
              >
                <DotsThreeIcon size={16} weight="bold" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content>{text.body}</Card.Content>
          <Card.Footer>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.message}
            </Button>
            <Button size="sm">{text.viewDetails}</Button>
          </Card.Footer>
        </Card>

        <Card spacing="md" elevation="xs">
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

        <Card spacing="md" elevation="xs">
          <Card.Header>
            <Card.Title>{text.documentsTitle}</Card.Title>
            <Card.Description>{text.documentsDescription}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Alert intent="cautious" leadingIcon={<InfoIcon size={20} weight="fill" />}>
              <Alert.Title>{text.alertTitle}</Alert.Title>
              <Alert.Description>{text.alertDescription}</Alert.Description>
            </Alert>
          </Card.Content>
          <Card.Footer>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.viewDetails}
            </Button>
            <Button size="sm">{text.upload}</Button>
          </Card.Footer>
        </Card>
      </div>
    );
  },
};
