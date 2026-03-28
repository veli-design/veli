import { DotsThree, DownloadSimple, Gear, PencilSimple, Trash } from 'phosphor-react';
import { Button } from '@tradenetcorp/coral-ui/button';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from '@tradenetcorp/coral-ui/menu';

type MenuExampleDemo = 'basic' | 'sizes' | 'sections' | 'rich';

interface MenuExampleProps {
  demo: MenuExampleDemo;
}

export function MenuExample({ demo }: MenuExampleProps) {
  if (demo === 'basic') {
    return (
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
    );
  }

  if (demo === 'sizes') {
    return (
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
    );
  }

  if (demo === 'sections') {
    return (
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
    );
  }

  return (
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
  );
}
