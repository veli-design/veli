import { Button } from '@veli-design/react/button';
import { Menu, MenuItem, MenuPopover, MenuSeparator, MenuTrigger } from '@veli-design/react/menu';
import { DownloadSimpleIcon, GearIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';

export function MenuUsageDemo() {
  return (
    <MenuTrigger>
      <Button intent="secondary" appearance="transparent">
        Actions
      </Button>
      <MenuPopover>
        <Menu>
          <MenuItem startIcon={<PencilSimpleIcon size={16} />}>Edit</MenuItem>
          <MenuItem startIcon={<DownloadSimpleIcon size={16} />} shortcut={['⌘', 'E']}>
            Export
          </MenuItem>
          <MenuSeparator />
          <MenuItem intent="danger" startIcon={<TrashIcon size={16} />}>
            Delete
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

export function MenuItemsDemo() {
  return (
    <MenuTrigger>
      <Button intent="secondary" appearance="transparent">
        Open menu
      </Button>
      <MenuPopover className="max-w-xs">
        <Menu>
          <MenuItem
            startIcon={<PencilSimpleIcon size={16} />}
            description="Update labels and visibility."
            shortcut={['⌘', 'E']}
          >
            Edit details
          </MenuItem>
          <MenuItem startIcon={<GearIcon size={16} />}>Advanced</MenuItem>
          <MenuSeparator />
          <MenuItem intent="danger" startIcon={<TrashIcon size={16} />} shortcut="Del">
            Remove file
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}
