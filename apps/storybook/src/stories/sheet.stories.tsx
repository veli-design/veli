import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { FieldLabel } from '@tradenetcorp/veli-ui/field';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';
import { Sheet, type SheetProps } from '@tradenetcorp/veli-ui/sheet';
import {
  ApplicationSummary,
  PreparationGuide,
  sheetExampleCopy,
  useSheetExampleCopy,
} from './sheet-example-content';

type ExampleArgs = SheetProps & {
  showFooter: boolean;
  showHeaderAction: boolean;
};
type Example = 'summary' | 'filters' | 'guide';

function ExampleSheet({
  showFooter,
  showHeaderAction,
  example = 'summary',
  onApply,
  ...args
}: ExampleArgs & { example?: Example; onApply?: (value: string) => void }) {
  const text = useSheetExampleCopy();
  const [filter, setFilter] = useState('all');
  const content = text[example];
  return (
    <Sheet
      {...args}
      title={
        !args.title?.trim() || args.title.trim() === sheetExampleCopy.en[example].title
          ? content.title
          : args.title.trim()
      }
      description={
        args.description === sheetExampleCopy.en[example].description
          ? content.description
          : args.description
      }
      headerActions={
        showHeaderAction && example === 'filters' ? (
          <Button intent="secondary" appearance="ghost" size="sm" onPress={() => setFilter('all')}>
            {text.reset}
          </Button>
        ) : undefined
      }
      footer={
        showFooter ? (
          <Button
            slot="close"
            onPress={example === 'filters' ? () => onApply?.(filter) : undefined}
          >
            {example === 'filters' ? text.apply : example === 'guide' ? text.back : text.done}
          </Button>
        ) : undefined
      }
    >
      {example === 'filters' ? (
        <RadioGroup value={filter} onChange={setFilter}>
          <FieldLabel>{text.filters.label}</FieldLabel>
          {text.filters.options.map((option) => (
            <Radio key={option.id} value={option.id} size="lg">
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      ) : example === 'guide' ? (
        <PreparationGuide />
      ) : (
        <ApplicationSummary />
      )}
    </Sheet>
  );
}

function BasicExample({
  isOpen,
  defaultOpen,
  onOpenChange,
  example = 'summary',
  ...args
}: ExampleArgs & { example?: Example }) {
  const text = useSheetExampleCopy();
  const content = text[example];
  const [applied, setApplied] = useState('all');
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-base p-6">
      <div className="flex w-full max-w-md flex-col items-start gap-4">
        <p className="type-caption-medium text-base-muted">{text.example}</p>
        <h1 className="type-title-2-semibold text-base-strong">{content.context}</h1>
        <p className="type-body-md-regular text-base-muted">{content.hint}</p>
        <Sheet.Trigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          <Button>{content.open}</Button>
          <ExampleSheet {...args} example={example} onApply={setApplied} />
        </Sheet.Trigger>
        {example === 'filters' && (
          <p role="status" className="type-body-sm-regular text-base-muted">
            {text.showing}: {text.filters.options.find((option) => option.id === applied)?.label}
          </p>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Sheets',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: [
        'position',
        'size',
        'height',
        'showHandle',
        'isDismissable',
        'title',
        'description',
      ],
    },
    docs: {
      description: {
        component:
          'Small, fictional service tasks that explain the Sheet props: preview an application, filter a service search, or read preparation guidance. Change one prop at a time in Controls. All actions stay local. Use the Veli toolbar for language and theme; preview at mobile width to see the handle.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['bottom', 'start', 'end'],
      description: 'Edge of the viewport. Start/end mirror in RTL.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description:
        'Width in every placement: sm for short actions, md for forms, lg for richer content, full for the available width. Side sheets retain a spacing-8 backdrop rail.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    height: {
      control: 'select',
      options: ['content', 'viewport'],
      if: { arg: 'position', eq: 'bottom' },
      description: 'Fit the content or use a tall bottom sheet. Side drawers fill the height.',
      table: { category: 'Layout', defaultValue: { summary: 'content' } },
    },
    showHandle: {
      control: 'boolean',
      if: { arg: 'position', eq: 'bottom' },
      description: 'Show the grabber below the lg breakpoint. Hiding it does not disable swiping.',
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
    isDismissable: {
      control: 'boolean',
      description: 'Allow Escape, backdrop and swipe dismissal. The close button always works.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    title: {
      control: 'text',
      description: 'Visible dialog title. Default example text follows the language toolbar.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Optional text below the title. Clear it to hide.',
      table: { category: 'Content' },
    },
    showFooter: {
      control: 'boolean',
      description:
        'Example toggle: shows Apply filters in the footer. Applies the selection locally and closes. Not a Sheet prop.',
      table: { category: 'Example content' },
    },
    showHeaderAction: {
      control: 'boolean',
      description: 'Example toggle: shows a working Reset action in the header. Not a Sheet prop.',
      table: { category: 'Example content' },
    },
    isOpen: {
      control: 'boolean',
      description: 'Controlled open state. Pair with onOpenChange to keep state in sync.',
      table: { category: 'State' },
    },
    defaultOpen: {
      control: false,
      description: 'Initial uncontrolled state on Sheet.Trigger. Use isOpen for live changes.',
      table: { category: 'State' },
    },
    onOpenChange: {
      control: false,
      description: 'Receives the next open state.',
      table: { category: 'State' },
    },
    children: {
      control: false,
      description:
        'Short task content: an application summary, a service filter, or preparation guidance.',
      table: { category: 'Content' },
    },
    footer: {
      control: false,
      description: 'Optional fixed footer. Demonstrated in Content Slots.',
      table: { category: 'Content' },
    },
    headerActions: {
      control: false,
      description: 'Optional actions beside the title. Demonstrated in Content Slots.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
    overlayClassName: { control: false, table: { category: 'Styling' } },
    contentClassName: { control: false, table: { category: 'Styling' } },
  },
  args: {
    position: 'bottom',
    size: 'md',
    height: 'content',
    showHandle: true,
    isDismissable: true,
    title: sheetExampleCopy.en.summary.title,
    description: '',
    children: null,
    showFooter: false,
    showHeaderAction: false,
  },
  render: (args) => <BasicExample {...args} />,
} satisfies Meta<ExampleArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Placement: Story = {
  args: { position: 'end', size: 'sm', showFooter: true, title: sheetExampleCopy.en.filters.title },
  render: (args) => <BasicExample {...args} example="filters" />,
  parameters: {
    controls: { include: ['position'] },
    docs: {
      description: {
        story:
          'A short service-category filter suits a bottom sheet on mobile or an end drawer beside search results. Change position to compare; start/end mirror in Dhivehi. Apply filters updates the local result summary.',
      },
    },
  },
};
export const Width: Story = {
  args: { size: 'lg' },
  parameters: {
    controls: { include: ['size', 'position'] },
    docs: {
      description: {
        story:
          'The same four application details reflow as width changes. Sm suits a quick summary, md a focused task, and lg gives related fields room side by side. Full is available for broader workflows; use Height with size full to see wider guidance. Size always means width, independently of height.',
      },
    },
  },
};
export const Height: Story = {
  args: { height: 'viewport', showFooter: true, title: sheetExampleCopy.en.guide.title },
  render: (args) => <BasicExample {...args} example="guide" />,
  parameters: {
    controls: { include: ['height', 'size', 'showHandle'] },
    docs: {
      description: {
        story:
          'Read a three-part preparation guide. Content height fits the guide up to the viewport limit; viewport height gives longer reading a stable surface. Normally the body scrolls with actions outside it. When space is constrained, the whole dialog scrolls so the content and return action remain reachable.',
      },
    },
  },
};
export const Dismissal: Story = {
  args: {
    isDismissable: false,
    size: 'sm',
    showFooter: true,
    title: sheetExampleCopy.en.filters.title,
  },
  render: (args) => <BasicExample {...args} example="filters" />,
  parameters: {
    controls: { include: ['isDismissable'] },
    docs: {
      description: {
        story:
          'Try a filter selection with isDismissable=false: Escape, backdrop and swipe do not close the sheet, but Apply filters and the close button do. This prop does not save edits or provide an unsaved-changes confirmation.',
      },
    },
  },
};
export const ContentSlots: Story = {
  args: {
    title: sheetExampleCopy.en.filters.title,
    description: sheetExampleCopy.en.filters.description,
    showFooter: true,
    showHeaderAction: true,
  },
  render: (args) => <BasicExample {...args} example="filters" />,
  parameters: {
    controls: { include: ['title', 'description', 'showFooter', 'showHeaderAction'] },
    docs: {
      description: {
        story:
          'Header action: Reset clears the draft selection. Footer: Apply filters updates the local summary and closes. Toggle each slot and edit the title/description to see their roles. The toggles are story helpers, not Sheet props.',
      },
    },
  },
};
