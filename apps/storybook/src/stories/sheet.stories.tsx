import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@veli-design/react/divider';
import { Button } from '@veli-design/react/button';
import { FieldLabel } from '@veli-design/react/field';
import { Radio, RadioGroup } from '@veli-design/react/radio';
import { Sheet, type SheetProps } from '@veli-design/react/sheet';
import {
  ApplicationSummary,
  PreparationGuide,
  sheetExampleCopy,
  useSheetExampleCopy,
} from './sheet-example-content';

type ExampleArgs = SheetProps & {
  title: string;
  description?: string;
  showHandle: boolean;
  showFooter: boolean;
  showHeaderAction: boolean;
};
type Example = 'summary' | 'filters' | 'guide';

function ExampleSheet({
  showFooter,
  showHeaderAction,
  showHandle,
  title,
  description,
  example = 'summary',
  onApply,
  ...args
}: ExampleArgs & { example?: Example; onApply?: (value: string) => void }) {
  const text = useSheetExampleCopy();
  const [filter, setFilter] = useState('all');
  const content = text[example];
  const heading =
    !title?.trim() || title.trim() === sheetExampleCopy.en[example].title
      ? content.title
      : title.trim();
  const supportingText =
    description === sheetExampleCopy.en[example].description ? content.description : description;
  return (
    <Sheet {...args}>
      {showHandle && <Sheet.Handle />}
      <Sheet.Header>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Sheet.Title>{heading}</Sheet.Title>
          {supportingText && <Sheet.Description>{supportingText}</Sheet.Description>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showHeaderAction && example === 'filters' && (
            <Button
              intent="secondary"
              appearance="ghost"
              size="sm"
              onPress={() => setFilter('all')}
            >
              {text.reset}
            </Button>
          )}
          <Sheet.Close />
        </div>
      </Sheet.Header>
      <Divider />
      <Sheet.Body>
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
      </Sheet.Body>
      {showFooter && (
        <Sheet.Footer>
          <Divider className="mb-2" />
          <Button
            slot="close"
            onPress={example === 'filters' ? () => onApply?.(filter) : undefined}
          >
            {example === 'filters' ? text.apply : example === 'guide' ? text.back : text.done}
          </Button>
        </Sheet.Footer>
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

// Static usage samples intentionally omit the demo layout and localized copy.
function basicUsage(
  props: string,
  content = '<p>Your application summary goes here.</p>',
  title = 'Application summary',
  footer?: string,
) {
  return `import { Button } from '@veli-design/react/button';
import { Divider } from '@veli-design/react/divider';
import { Sheet } from '@veli-design/react/sheet';

<Sheet.Trigger>
  <Button>Open sheet</Button>
  <Sheet ${props}>
    <Sheet.Handle />
    <Sheet.Header>
      <Sheet.Title>${title}</Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
    <Divider />
    <Sheet.Body>
      ${content}
    </Sheet.Body>${
      footer
        ? `
    <Sheet.Footer>
      <Divider className="mb-2" />
      ${footer}
    </Sheet.Footer>`
        : ''
    }
  </Sheet>
</Sheet.Trigger>`;
}

function filterUsage(props: string, showReset = false) {
  return `import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Divider } from '@veli-design/react/divider';
import { FieldLabel } from '@veli-design/react/field';
import { Radio, RadioGroup } from '@veli-design/react/radio';
import { Sheet } from '@veli-design/react/sheet';

export function ServiceFilters() {
  const [filter, setFilter] = useState('all');
  const [applied, setApplied] = useState('all');

  return (
    <>
      <Sheet.Trigger>
        <Button>Filter services</Button>
        <Sheet ${props}>
          <Sheet.Handle />
          <Sheet.Header>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Sheet.Title>Filter services</Sheet.Title>${
                showReset
                  ? `
              <Sheet.Description>Choose which services to show.</Sheet.Description>`
                  : ''
              }
            </div>
            <div className="flex shrink-0 items-center gap-2">${
              showReset
                ? `
              <Button intent="secondary" appearance="ghost" size="sm" onPress={() => setFilter('all')}>Reset</Button>`
                : ''
            }
              <Sheet.Close />
            </div>
          </Sheet.Header>
          <Divider />
          <Sheet.Body>
            <RadioGroup value={filter} onChange={setFilter}>
              <FieldLabel>Service category</FieldLabel>
              <Radio value="all">All services</Radio>
              <Radio value="selected">A service category</Radio>
            </RadioGroup>
          </Sheet.Body>
          <Sheet.Footer>
            <Divider className="mb-2" />
            <Button slot="close" onPress={() => setApplied(filter)}>Apply filters</Button>
          </Sheet.Footer>
        </Sheet>
      </Sheet.Trigger>
      <p role="status">Showing: {applied === 'all' ? 'All services' : 'A service category'}</p>
    </>
  );
}`;
}

const meta = {
  title: 'Components/Sheet',
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
      source: {
        type: 'code',
        language: 'tsx',
        code: basicUsage('position="bottom" size="md"'),
      },
      description: {
        component:
          'Small, fictional service tasks that explain the Sheet props: preview an application, filter a service search, or read preparation guidance. Change one prop at a time in Controls. All actions stay local. Use the Veli toolbar for language and theme; preview at mobile width to see the handle. Code samples are static usage examples with illustrative content; Controls update the preview, not the samples.',
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
      description:
        'Example toggle: renders Sheet.Handle below the lg breakpoint. Not a Sheet prop.',
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
    isDismissable: {
      control: 'boolean',
      description:
        'Allow Escape, backdrop and swipe dismissal. Composed close actions remain available.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    title: {
      control: 'text',
      description:
        'Example text for Sheet.Title. Default text follows the language toolbar. Not a Sheet prop.',
      table: { category: 'Example content' },
    },
    description: {
      control: 'text',
      description: 'Example text for Sheet.Description. Clear it to hide. Not a Sheet prop.',
      table: { category: 'Example content' },
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
    className: { control: false, table: { category: 'Styling' } },
    overlayClassName: { control: false, table: { category: 'Styling' } },
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
  args: {
    position: 'end',
    size: 'sm',
    showFooter: true,
    title: sheetExampleCopy.en.filters.title,
  },
  render: (args) => <BasicExample {...args} example="filters" />,
  parameters: {
    controls: { include: ['position'] },
    docs: {
      source: { code: filterUsage('position="end" size="sm"') },
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
      source: { code: basicUsage('size="lg"') },
      description: {
        story:
          'The same four application details reflow as width changes. Sm suits a quick summary, md a focused task, and lg gives related fields room side by side. Full is available for broader workflows; use Height with size full to see wider guidance. Size always means width, independently of height.',
      },
    },
  },
};
export const Height: Story = {
  args: {
    height: 'viewport',
    showFooter: true,
    title: sheetExampleCopy.en.guide.title,
  },
  render: (args) => <BasicExample {...args} example="guide" />,
  parameters: {
    controls: { include: ['height', 'size', 'showHandle'] },
    docs: {
      source: {
        code: basicUsage(
          'height="viewport"',
          '<p>Your preparation guidance goes here.</p>',
          'Preparation guide',
          '<Button slot="close">Back</Button>',
        ),
      },
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
      source: { code: filterUsage('size="sm" isDismissable={false}') },
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
    controls: {
      include: ['title', 'description', 'showFooter', 'showHeaderAction'],
    },
    docs: {
      source: {
        code: filterUsage('', true),
      },
      description: {
        story:
          'Header action: Reset clears the draft selection. Footer: Apply filters updates the local summary and closes. Toggle each slot and edit the title/description to see their roles. The toggles are story helpers, not Sheet props.',
      },
    },
  },
};
