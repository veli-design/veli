import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { Selection } from 'react-aria-components';
import { CaretRight, DotsThree, DownloadSimple, Gear, PencilSimple, Trash } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@tradenetcorp/veli-ui/menu';

type MenuPlaygroundItem = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  sentiment?: 'default' | 'danger';
  selected?: boolean;
  disabled?: boolean;
};

type MenuPlaygroundArgs = {
  triggerLabel: string;
  itemSize: 'sm' | 'md' | 'lg';
  showDescriptions: boolean;
  showShortcuts: boolean;
  items: MenuPlaygroundItem[];
};

const DEFAULT_PLAYGROUND_ITEMS: MenuPlaygroundItem[] = [
  {
    id: 'edit',
    label: 'Edit Details',
    description: 'Update labels, metadata, and visibility.',
    shortcut: 'E',
    selected: true,
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Create a local copy for offline work.',
    shortcut: 'D',
  },
  {
    id: 'delete',
    label: 'Delete',
    description: 'This action is permanent.',
    shortcut: 'Del',
    sentiment: 'danger',
  },
];

const meta: Meta = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default action menu with a Veli-themed popover and tokenized item states.
 */
export const Basic: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" style="transparent" size="sm">
        Actions
        <DotsThree size={16} weight="bold" />
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem startIcon={<PencilSimple size={16} />}>Edit</MenuItem>
          <MenuItem startIcon={<DownloadSimple size={16} />}>Export</MenuItem>
          <MenuSeparator />
          <MenuItem sentiment="danger" startIcon={<Trash size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};

/**
 * Live-editable menu playground for design iteration.
 * Modify `items` JSON and size controls to experiment quickly.
 */
export const Default: Story = {
  args: {
    triggerLabel: 'Menu',
    itemSize: 'md',
    showDescriptions: true,
    showShortcuts: true,
    items: DEFAULT_PLAYGROUND_ITEMS,
  },
  argTypes: {
    triggerLabel: { control: 'text' },
    itemSize: { control: 'select', options: ['sm', 'md', 'lg'] },
    showDescriptions: { control: 'boolean' },
    showShortcuts: { control: 'boolean' },
    items: { control: 'object' },
  },
  render: (rawArgs) => {
    const args = rawArgs as MenuPlaygroundArgs;
    const [lastAction, setLastAction] = useState<string>('None yet');

    const safeItems = useMemo(() => {
      if (!Array.isArray(args.items) || args.items.length === 0) {
        return DEFAULT_PLAYGROUND_ITEMS;
      }
      return args.items;
    }, [args.items]);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(
      () => new Set(safeItems.filter((item) => item.selected).map((item) => item.id)),
    );

    return (
      <div className="flex flex-col items-start gap-3">
        <MenuTrigger>
          <Button variant="secondary" style="transparent" size="sm">
            {args.triggerLabel}
            <DotsThree size={16} weight="bold" />
          </Button>
          <MenuPopover>
            <Menu
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              onAction={(key) => setLastAction(String(key))}
            >
              {safeItems.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  size={args.itemSize}
                  sentiment={item.sentiment ?? 'default'}
                  description={args.showDescriptions ? item.description : undefined}
                  shortcut={args.showShortcuts ? item.shortcut : undefined}
                  isDisabled={item.disabled}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </MenuPopover>
        </MenuTrigger>
        <p className="text-xs text-text-default-muted">
          Last action: <span className="font-medium">{lastAction}</span>
        </p>
        <p className="text-xs text-text-default-muted">
          Selected:{' '}
          <span className="font-medium">
            {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ') || 'none'}
          </span>
        </p>
      </div>
    );
  },
};

/**
 * Demonstrates grouped content with section headers and visual separators.
 */
export const Sections: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" style="transparent" size="sm">
        Open Menu
      </Button>
      <MenuPopover>
        <Menu>
          <MenuSection title="File">
            <MenuItem startIcon={<PencilSimple size={16} />}>Rename</MenuItem>
            <MenuItem startIcon={<DownloadSimple size={16} />}>Download</MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuSection title="Settings">
            <MenuItem startIcon={<Gear size={16} />}>Preferences</MenuItem>
            <MenuItem sentiment="danger" startIcon={<Trash size={16} />}>
              Remove File
            </MenuItem>
          </MenuSection>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};

/**
 * Nested subitems variation for multi-level actions.
 */
export const WithSubitems: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" style="transparent" size="sm">
        Open Nested Menu
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem id="open">Open</MenuItem>

          <MenuSubmenuTrigger>
            <MenuItem id="export" endIcon={<CaretRight size={14} />}>
              Export As
            </MenuItem>
            <MenuPopover>
              <Menu>
                <MenuItem id="pdf">PDF</MenuItem>
                <MenuItem id="docx">DOCX</MenuItem>

                <MenuSubmenuTrigger>
                  <MenuItem id="image" endIcon={<CaretRight size={14} />}>
                    Image
                  </MenuItem>
                  <MenuPopover>
                    <Menu>
                      <MenuItem id="png">PNG</MenuItem>
                      <MenuItem id="svg">SVG</MenuItem>
                    </Menu>
                  </MenuPopover>
                </MenuSubmenuTrigger>
              </Menu>
            </MenuPopover>
          </MenuSubmenuTrigger>

          <MenuSeparator />
          <MenuItem id="delete" sentiment="danger" startIcon={<Trash size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};

/**
 * Default and danger sentiments for neutral and destructive menu actions.
 */
export const Sentiment: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" style="transparent" size="sm">
        Actions
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem id="rename" startIcon={<PencilSimple size={16} />}>
            Rename
          </MenuItem>
          <MenuItem id="download" startIcon={<DownloadSimple size={16} />}>
            Download
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="delete" sentiment="danger" startIcon={<Trash size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};

/**
 * Selection via React Aria `selectionMode` and `selectedKeys`.
 * Single select closes on pick by default; multiple select and `closeOnSelect={false}` keep the menu open.
 */
export const Checked: Story = {
  render: () => {
    const [singleSelected, setSingleSelected] = useState<Selection>(new Set(['name']));
    const [multipleSelected, setMultipleSelected] = useState<Selection>(
      new Set(['files', 'folders']),
    );
    const [persistentSelected, setPersistentSelected] = useState<Selection>(new Set(['list']));

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium text-text-default-default">Single (closes on select)</p>
          <MenuTrigger>
            <Button variant="secondary" style="transparent" size="sm">
              Sort By
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="single"
                selectedKeys={singleSelected}
                onSelectionChange={setSingleSelected}
              >
                <MenuItem id="name">Name</MenuItem>
                <MenuItem id="date">Date modified</MenuItem>
                <MenuItem id="size">Size</MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="text-xs text-text-default-muted">
            Selected: <span className="font-medium">{[...singleSelected].join(', ')}</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium text-text-default-default">Multiple (stays open)</p>
          <MenuTrigger>
            <Button variant="secondary" style="transparent" size="sm">
              View
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="multiple"
                selectedKeys={multipleSelected}
                onSelectionChange={setMultipleSelected}
              >
                <MenuItem id="files">Show files</MenuItem>
                <MenuItem id="folders">Show folders</MenuItem>
                <MenuItem id="hidden">Show hidden items</MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="text-xs text-text-default-muted">
            Selected:{' '}
            <span className="font-medium">{[...multipleSelected].join(', ') || 'none'}</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium text-text-default-default">
            Single + closeOnSelect={false}
          </p>
          <MenuTrigger>
            <Button variant="secondary" style="transparent" size="sm">
              Layout
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="single"
                selectedKeys={persistentSelected}
                onSelectionChange={setPersistentSelected}
              >
                <MenuItem id="list" closeOnSelect={false}>
                  List
                </MenuItem>
                <MenuItem id="grid" closeOnSelect={false}>
                  Grid
                </MenuItem>
                <MenuItem id="board" closeOnSelect={false}>
                  Board
                </MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="text-xs text-text-default-muted">
            Selected: <span className="font-medium">{[...persistentSelected].join(', ')}</span>
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Item sizes can be tuned to fit dense toolbars or spacious touch targets.
 * Section headers and dividers scale with each size variant.
 */
export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Small
        </Button>
        <MenuPopover>
          <Menu>
            <MenuSection title="Account" size="sm">
              <MenuItem size="sm">Profile</MenuItem>
              <MenuItem size="sm">Billing</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title="Session" size="sm">
              <MenuItem size="sm">Sign out</MenuItem>
            </MenuSection>
          </Menu>
        </MenuPopover>
      </MenuTrigger>

      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Medium
        </Button>
        <MenuPopover>
          <Menu>
            <MenuSection title="Account" size="md">
              <MenuItem size="md">Profile</MenuItem>
              <MenuItem size="md">Billing</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title="Session" size="md">
              <MenuItem size="md">Sign out</MenuItem>
            </MenuSection>
          </Menu>
        </MenuPopover>
      </MenuTrigger>

      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Large
        </Button>
        <MenuPopover>
          <Menu>
            <MenuSection title="Account" size="lg">
              <MenuItem size="lg">Profile</MenuItem>
              <MenuItem size="lg">Billing</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title="Session" size="lg">
              <MenuItem size="lg">Sign out</MenuItem>
            </MenuSection>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    </div>
  ),
};

/**
 * Rich item content for enterprise workflows: icon + description + shortcut.
 * Pass `className` (e.g. `max-w-xs`) to cap popover width when content is long.
 */
export const RichItems: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <MenuTrigger key={size}>
          <Button variant="secondary" style="transparent" size="sm">
            {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
          </Button>
          <MenuPopover className="max-w-xs">
            <Menu>
              <MenuItem
                size={size}
                startIcon={<PencilSimple size={16} />}
                description="Update labels, metadata, and visibility."
                shortcut="E"
              >
                Edit Details
              </MenuItem>
              <MenuItem
                size={size}
                startIcon={<DownloadSimple size={16} />}
                description="Create a local copy for offline work."
                shortcut="D"
              >
                Download Copy
              </MenuItem>
              <MenuItem
                size={size}
                isDisabled
                startIcon={<Gear size={16} />}
                description="Requires admin permissions."
                shortcut="S"
              >
                Share Externally
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                size={size}
                sentiment="danger"
                startIcon={<Trash size={16} />}
                description="This action is permanent."
                shortcut="Del"
              >
                Delete Record
              </MenuItem>
            </Menu>
          </MenuPopover>
        </MenuTrigger>
      ))}
    </div>
  ),
};
