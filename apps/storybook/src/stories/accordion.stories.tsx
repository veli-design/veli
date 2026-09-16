import { expect, userEvent, within } from '@storybook/test';
import { Plus } from 'phosphor-react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  type AccordionProps,
} from '@tradenetcorp/veli-ui/accordion';
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
  states: { expanded: 'Expanded', collapsed: 'Collapsed', disabled: 'Disabled' },
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
  states: { expanded: 'ހުޅުވިފައި', collapsed: 'ލެއްޕިފައި', disabled: 'ބޭނުންނުކުރެވޭ' },
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

type AccordionStoryArgs = AccordionProps & {
  item1Header?: string;
  item1Content?: string;
  item2Header?: string;
  item2Content?: string;
  item3Header?: string;
  item3Content?: string;
};

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'], table: { category: 'Appearance' } },
    alignment: {
      control: 'select',
      options: ['left', 'right'],
      table: { category: 'Appearance' },
      description: 'left: trailing indicator; right: leading indicator. Both follow direction.',
    },
    flushed: { control: 'boolean', table: { category: 'Appearance' } },
    item1Header: { name: 'Item 1 header', control: 'text', table: { category: 'Content' } },
    item1Content: { name: 'Item 1 content', control: 'text', table: { category: 'Content' } },
    item2Header: { name: 'Item 2 header', control: 'text', table: { category: 'Content' } },
    item2Content: { name: 'Item 2 content', control: 'text', table: { category: 'Content' } },
    item3Header: { name: 'Item 3 header', control: 'text', table: { category: 'Content' } },
    item3Content: { name: 'Item 3 content', control: 'text', table: { category: 'Content' } },
    items: { table: { disable: true } },
    children: { table: { disable: true } },
    allowsMultipleExpanded: { control: 'boolean', table: { category: 'State' } },
    isDisabled: { control: 'boolean', table: { category: 'State' } },
    defaultExpandedKeys: { control: 'object', table: { category: 'State' } },
    expandedKeys: { control: false, table: { category: 'State' } },
    onExpandedChange: { action: 'expandedChange', table: { category: 'State' } },
    className: { control: 'text', table: { category: 'Styling' } },
    itemClassName: { control: 'text', table: { category: 'Styling' } },
    triggerClassName: { control: 'text', table: { category: 'Styling' } },
    panelClassName: { control: 'text', table: { category: 'Styling' } },
  },
  args: {
    item1Header: enAccordionText.headings.overview,
    item1Content: enAccordionText.content.overviewDesc,
    item2Header: enAccordionText.headings.documents,
    item2Content: enAccordionText.content.documentsDesc,
    item3Header: enAccordionText.headings.history,
    item3Content: enAccordionText.content.historyDesc,
    size: 'md',
    alignment: 'left',
    flushed: false,
    isDisabled: false,
    allowsMultipleExpanded: false,
    defaultExpandedKeys: ['overview'],
  },
  tags: ['autodocs'],
} satisfies Meta<AccordionStoryArgs>;

export default meta;
type Story = StoryObj<AccordionStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const text = useAccordionText();
    const {
      item1Header,
      item1Content,
      item2Header,
      item2Content,
      item3Header,
      item3Content,
      ...accordionArgs
    } = args;
    const headers = [item1Header, item2Header, item3Header];
    const content = [item1Content, item2Content, item3Content];
    const defaults = getAccordionItems(enAccordionText);
    const items = getAccordionItems(text).map((item, index) => ({
      ...item,
      label: headers[index] === defaults[index].label ? item.label : (headers[index] ?? item.label),
      content:
        content[index] === defaults[index].content
          ? item.content
          : (content[index] ?? item.content),
    }));

    return (
      <div className={storyPanelClassName}>
        <Accordion
          key={JSON.stringify(args.defaultExpandedKeys)}
          {...accordionArgs}
          items={accordionArgs.items ?? items}
        />
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

export const States: Story = {
  render: () => {
    const text = useAccordionText();
    const accordionItems = getAccordionItems(text);

    return (
      <div className={storyPanelClassName}>
        <Accordion defaultExpandedKeys={['overview']}>
          {accordionItems.slice(0, 2).map((item) => (
            <AccordionItem key={item.id} id={item.id}>
              {({ isExpanded }) => (
                <>
                  <AccordionHeader>
                    {isExpanded ? text.states.expanded : text.states.collapsed}
                  </AccordionHeader>
                  <AccordionPanel>{item.content}</AccordionPanel>
                </>
              )}
            </AccordionItem>
          ))}
          <AccordionItem id="history" isDisabled>
            <AccordionHeader>{text.states.disabled}</AccordionHeader>
            <AccordionPanel>{accordionItems[2].content}</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    buttons[0].focus();
    await userEvent.keyboard('{Enter}');
    await expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
    await expect(buttons[1]).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    await expect(buttons[2]).toBeDisabled();
    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    buttons[0].blur();
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
  args: { flushed: true },
  render: Default.render,
};

export const CustomIndicator: Story = {
  render: () => {
    const text = useAccordionText();
    return (
      <div className={storyPanelClassName}>
        <Accordion defaultExpandedKeys={['overview']} alignment="right">
          {getAccordionItems(text).map((item) => (
            <AccordionItem key={item.id} id={item.id}>
              {({ isExpanded }) => (
                <>
                  <AccordionHeader
                    level={2}
                    icon={<Plus size={16} className={isExpanded ? 'rotate-45' : undefined} />}
                  >
                    {item.label}
                  </AccordionHeader>
                  <AccordionPanel>{item.content}</AccordionPanel>
                </>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  },
};
