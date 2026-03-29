import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  CaretRight,
  DotsThree,
  DownloadSimple,
  Gear,
  PencilSimple,
  Trash,
} from 'phosphor-react';
import { Button } from '@tradenetcorp/coral-ui/button';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@tradenetcorp/coral-ui/menu';

type MenuPlaygroundItem = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type MenuPlaygroundArgs = {
  triggerLabel: string;
  panelSize: 'sm' | 'md' | 'lg';
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
    tone: 'danger',
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
 * Default action menu with a Coral-themed popover and tokenized item states.
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
          <MenuItem tone="danger" startIcon={<Trash size={16} />}>
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
    panelSize: 'md',
    itemSize: 'md',
    showDescriptions: true,
    showShortcuts: true,
    items: DEFAULT_PLAYGROUND_ITEMS,
  },
  argTypes: {
    triggerLabel: { control: 'text' },
    panelSize: { control: 'select', options: ['sm', 'md', 'lg'] },
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

    return (
      <div className="flex flex-col items-start gap-3">
        <MenuTrigger>
          <Button variant="secondary" style="transparent" size="sm">
            {args.triggerLabel}
            <DotsThree size={16} weight="bold" />
          </Button>
          <MenuPopover size={args.panelSize}>
            <Menu onAction={(key) => setLastAction(String(key))}>
              {safeItems.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  size={args.itemSize}
                  tone={item.tone ?? 'default'}
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
        <p className="text-xs text-fg-text-default-muted">
          Last action: <span className="font-medium">{lastAction}</span>
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
            <MenuItem tone="danger" startIcon={<Trash size={16} />}>
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
            <MenuPopover size="sm">
              <Menu>
                <MenuItem id="pdf">PDF</MenuItem>
                <MenuItem id="docx">DOCX</MenuItem>

                <MenuSubmenuTrigger>
                  <MenuItem id="image" endIcon={<CaretRight size={14} />}>
                    Image
                  </MenuItem>
                  <MenuPopover size="sm">
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
          <MenuItem id="delete" tone="danger" startIcon={<Trash size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};

/**
 * Item sizes can be tuned to fit dense toolbars or spacious touch targets.
 */
export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Small
        </Button>
        <MenuPopover size="sm">
          <Menu>
            <MenuItem size="sm">Profile</MenuItem>
            <MenuItem size="sm">Billing</MenuItem>
            <MenuItem size="sm">Sign out</MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>

      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Medium
        </Button>
        <MenuPopover size="md">
          <Menu>
            <MenuItem size="md">Profile</MenuItem>
            <MenuItem size="md">Billing</MenuItem>
            <MenuItem size="md">Sign out</MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>

      <MenuTrigger>
        <Button variant="secondary" style="transparent" size="sm">
          Large
        </Button>
        <MenuPopover size="lg">
          <Menu>
            <MenuItem size="lg">Profile</MenuItem>
            <MenuItem size="lg">Billing</MenuItem>
            <MenuItem size="lg">Sign out</MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    </div>
  ),
};

/**
 * Rich item content for enterprise workflows: icon + description + shortcut.
 */
export const RichItems: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="secondary" style="transparent" size="sm">
        Quick Actions
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem
            startIcon={<PencilSimple size={16} />}
            description="Update labels, metadata, and visibility."
            shortcut="E"
          >
            Edit Details
          </MenuItem>
          <MenuItem
            startIcon={<DownloadSimple size={16} />}
            description="Create a local copy for offline work."
            shortcut="D"
          >
            Download Copy
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            tone="danger"
            startIcon={<Trash size={16} />}
            description="This action is permanent."
            shortcut="Del"
          >
            Delete Record
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  ),
};
