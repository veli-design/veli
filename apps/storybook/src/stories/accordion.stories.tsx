import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@tradenetcorp/veli-ui/accordion';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const storyPanelClassName =
  'w-[calc(100vw-2rem)] max-w-[640px] rounded-2xl border border-base-subtle bg-surface-raised p-4';

const storyGridClassName =
  'grid w-[calc(100vw-2rem)] max-w-[960px] grid-cols-1 gap-8 md:grid-cols-2';

const storyGridPanelClassName =
  'w-full rounded-2xl border border-base-subtle bg-surface-raised p-4';

type AccordionText = {
  headings: {
    overview: string;
    documents: string;
    history: string;
  };
  content: {
    overviewDesc: string;
    documentsDesc: string;
    historyDesc: string;
  };
};

const enAccordionText = {
  headings: {
    overview: 'Overview',
    documents: 'Documents',
    history: 'History',
  },
  content: {
    overviewDesc:
      'Review the permit status, submission date, and assigned reviewer before making changes.',
    documentsDesc:
      'Upload supporting files such as identification, proof of address, and payment receipts.',
    historyDesc: 'Track every update, comment, and status change recorded for this application.',
  },
} as const;

const dhivehiAccordionText = {
  headings: {
    overview: 'ޚުލާޞާ',
    documents: 'ލިޔެކިޔުންތައް',
    history: 'ހިސްޓްރީ',
  },
  content: {
    overviewDesc:
      'ބަދަލެއް ގެނައުމުގެ ކުރިން، ހުއްދައިގެ ސްޓޭޓަސް، ހުށަހެޅި ތާރީޚު، އަދި މައްސަލަ ހަވާލުކުރެވިފައިވާ ރިވިއުވަރ ޗެކްކުރައްވާ.',
    documentsDesc:
      'ކާކުކަން އަންގައިދޭ ލިޔުމާއި، އެޑްރެސް އަންގައިދޭ ލިޔުން، އަދި ފައިސާ ދެއްކިކަމުގެ ރަސީދު ފަދަ ގުޅޭ ލިޔެކިޔުންތައް އަޕްލޯޑްކުރައްވާ.',
    historyDesc:
      'މި އެޕްލިކޭޝަނާ ގުޅިގެން ރެކޯޑުކުރެވިފައިވާ ކޮންމެ އަޕްޑޭޓަކާއި، ކޮމެންޓެއް އަދި ސްޓޭޓަސްއަށް އައިސްފައިވާ ބަދަލުތައް ބައްލަވާލައްވާ.',
  },
} as const;

const localizedAccordionText = {
  en: enAccordionText,
  dv: dhivehiAccordionText,
} as const;

const useAccordionText = () => {
  const { direction } = useVeliLanguage();

  return localizedAccordionText[direction === 'rtl' ? 'dv' : 'en'];
};

const getAccordionItems = (text: AccordionText) => [
  {
    id: 'overview',
    label: text.headings.overview,
    content: text.content.overviewDesc,
  },
  {
    id: 'documents',
    label: text.headings.documents,
    content: text.content.documentsDesc,
  },
  {
    id: 'history',
    label: text.headings.history,
    content: text.content.historyDesc,
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const text = useAccordionText();

    return (
      <div className={storyPanelClassName}>
        <Accordion defaultExpandedKeys={['overview']} items={getAccordionItems(text)} />
      </div>
    );
  },
};

export const MultipleExpanded: Story = {
  render: () => {
    const text = useAccordionText();

    return (
      <div className={storyPanelClassName}>
        <Accordion
          allowsMultipleExpanded
          defaultExpandedKeys={['overview', 'documents']}
          items={getAccordionItems(text)}
        />
      </div>
    );
  },
};

export const Compound: Story = {
  render: () => {
    const text = useAccordionText();
    const accordionItems = getAccordionItems(text);

    return (
      <div className={storyPanelClassName}>
        <Accordion defaultExpandedKeys={['overview']}>
          <AccordionItem id="overview">
            <AccordionHeader>{accordionItems[0].label}</AccordionHeader>
            <AccordionPanel>{accordionItems[0].content}</AccordionPanel>
          </AccordionItem>
          <AccordionItem id="documents">
            <AccordionHeader>{accordionItems[1].label}</AccordionHeader>
            <AccordionPanel>{accordionItems[1].content}</AccordionPanel>
          </AccordionItem>
          <AccordionItem id="history" isDisabled>
            <AccordionHeader>{accordionItems[2].label}</AccordionHeader>
            <AccordionPanel>{accordionItems[2].content}</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useAccordionText();

    return (
      <div className={storyGridClassName}>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Medium (md)
          </span>
          <div className={storyGridPanelClassName}>
            <Accordion
              size="md"
              defaultExpandedKeys={['overview']}
              items={getAccordionItems(text)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Large (lg)
          </span>
          <div className={storyGridPanelClassName}>
            <Accordion
              size="lg"
              defaultExpandedKeys={['overview']}
              items={getAccordionItems(text)}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const Alignment: Story = {
  render: () => {
    const text = useAccordionText();

    return (
      <div className={storyGridClassName}>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">Left</span>
          <div className={storyGridPanelClassName}>
            <Accordion
              alignment="left"
              defaultExpandedKeys={['overview']}
              items={getAccordionItems(text)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">Right</span>
          <div className={storyGridPanelClassName}>
            <Accordion
              alignment="right"
              defaultExpandedKeys={['overview']}
              items={getAccordionItems(text)}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const Flushed: Story = {
  render: () => {
    const [flushed, setFlushed] = useState(false);
    const text = useAccordionText();

    return (
      <div className="flex w-[calc(100vw-2rem)] max-w-[640px] flex-col gap-4">
        <Button size="sm" intent="secondary" onPress={() => setFlushed((value) => !value)}>
          {flushed ? 'Turn flushed off' : 'Turn flushed on'}
        </Button>
        <div className={storyPanelClassName}>
          <Accordion
            flushed={flushed}
            defaultExpandedKeys={['overview']}
            items={getAccordionItems(text)}
          />
        </div>
      </div>
    );
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className={storyGridClassName}>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Medium (md)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion isSkeleton size="md" alignment="left" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
          Large (lg)
        </span>
        <div className={storyGridPanelClassName}>
          <Accordion isSkeleton size="lg" alignment="right" />
        </div>
      </div>
    </div>
  ),
};
