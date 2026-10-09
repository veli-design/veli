import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  GearIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
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
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

type MenuPlaygroundItem = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  intent?: 'default' | 'danger';
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

type MenuKey = string | number;
type MenuSelection = 'all' | Set<MenuKey>;

const menuText = {
  en: {
    actions: 'Actions',
    menu: 'Menu',
    edit: 'Edit',
    export: 'Export',
    delete: 'Delete',
    editDetails: 'Edit Details',
    updateLabels: 'Update labels, metadata, and visibility.',
    createLocalCopy: 'Create a local copy for offline work.',
    permanentAction: 'This action is permanent.',
    lastAction: 'Last action',
    noneYet: 'None yet',
    selected: 'Selected',
    all: 'all',
    none: 'none',
    openMenu: 'Open Menu',
    file: 'File',
    rename: 'Rename',
    download: 'Download',
    settings: 'Settings',
    preferences: 'Preferences',
    removeFile: 'Remove File',
    openNestedMenu: 'Open Nested Menu',
    open: 'Open',
    exportAs: 'Export As',
    image: 'Image',
    pdf: 'PDF',
    docx: 'DOCX',
    png: 'PNG',
    svg: 'SVG',
    singleClosesOnSelect: 'Single (closes on select)',
    multipleStaysOpen: 'Multiple (stays open)',
    singleCloseOnSelectFalse: 'Single + closeOnSelect={false}',
    sortBy: 'Sort By',
    name: 'Name',
    dateModified: 'Date modified',
    size: 'Size',
    view: 'View',
    showFiles: 'Show files',
    showFolders: 'Show folders',
    showHiddenItems: 'Show hidden items',
    layout: 'Layout',
    list: 'List',
    grid: 'Grid',
    board: 'Board',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    account: 'Account',
    profile: 'Profile',
    billing: 'Billing',
    session: 'Session',
    signOut: 'Sign out',
    downloadCopy: 'Download Copy',
    requiresAdmin: 'Requires admin permissions.',
    shareExternally: 'Share Externally',
    deleteRecord: 'Delete Record',
  },
  dv: {
    actions: 'އެކްޝަންތައް',
    menu: 'މެނޫ',
    edit: 'އެޑިޓް',
    export: 'އެކްސްޕޯޓް',
    delete: 'ފުހެލާ',
    editDetails: 'ތަފްސީލު އެޑިޓްކުރޭ',
    updateLabels: 'ލޭބަލް، މެޓަޑޭޓާ، އަދި ފެންނަގޮތް އަޕްޑޭޓްކުރޭ.',
    createLocalCopy: 'އޮފްލައިން މަސައްކަތަށް ލޯކަލް ކޮޕީއެއް ހަދާ.',
    permanentAction: 'މި އެކްޝަން ދާއިމީއެވެ.',
    lastAction: 'ފަހުގެ އެކްޝަން',
    noneYet: 'އަދި ނެތް',
    selected: 'ޚިޔާރުކުރެވިފައި',
    all: 'ހުރިހާ',
    none: 'ނެތް',
    openMenu: 'މެނޫ ހުޅުވާ',
    file: 'ފައިލް',
    rename: 'ނަން ބަދަލުކުރޭ',
    download: 'ޑައުންލޯޑް',
    settings: 'ސެޓިންގްސް',
    preferences: 'ޕްރެފަރެންސް',
    removeFile: 'ފައިލް ފުހެލާ',
    openNestedMenu: 'ނެސްޓެޑް މެނޫ ހުޅުވާ',
    open: 'ހުޅުވާ',
    exportAs: 'ގޮތަކަށް އެކްސްޕޯޓްކުރޭ',
    image: 'އިމޭޖް',
    pdf: 'PDF',
    docx: 'DOCX',
    png: 'PNG',
    svg: 'SVG',
    singleClosesOnSelect: 'ސިންގަލް (ޚިޔާރުކުރާއިރު ބަންދުވޭ)',
    multipleStaysOpen: 'މަލްޓިޕަލް (ހުޅުވިފައި ހުރޭ)',
    singleCloseOnSelectFalse: 'ސިންގަލް + closeOnSelect={false}',
    sortBy: 'ސޯޓްކުރާ ގޮތް',
    name: 'ނަން',
    dateModified: 'ބަދަލުކުރި ތާރީޚް',
    size: 'ސައިޒް',
    view: 'ވިއު',
    showFiles: 'ފައިލްތައް ދައްކާ',
    showFolders: 'ފޯލްޑަރތައް ދައްކާ',
    showHiddenItems: 'ފޮރުވިފައިވާ އައިޓަމްތައް ދައްކާ',
    layout: 'ލޭއައުޓް',
    list: 'ލިސްޓް',
    grid: 'ގްރިޑް',
    board: 'ބޯޑް',
    small: 'ކުޑަ',
    medium: 'މެޑިއަމް',
    large: 'ބޮޑު',
    account: 'އެކައުންޓް',
    profile: 'ޕްރޮފައިލް',
    billing: 'ބިލިންގް',
    session: 'ސެޝަން',
    signOut: 'ސައިން އައުޓް',
    downloadCopy: 'ކޮޕީ ޑައުންލޯޑްކުރޭ',
    requiresAdmin: 'އެޑްމިން ހުއްދަ ބޭނުންވެއެވެ.',
    shareExternally: 'ބޭރަށް ޝެއަރކުރޭ',
    deleteRecord: 'ރެކޯޑް ފުހެލާ',
  },
} as const;

type MenuLanguage = keyof typeof menuText;
type MenuText = (typeof menuText)[MenuLanguage];

const menuArgText = {
  triggerLabel: {
    en: menuText.en.menu,
    dv: menuText.dv.menu,
  },
} as const;

type MenuArgTextKey = keyof typeof menuArgText;

const menuArgTextKeys = Object.keys(menuArgText) as MenuArgTextKey[];

const defaultPlaygroundItemConfigs = [
  {
    id: 'edit',
    shortcut: 'E',
    selected: true,
  },
  {
    id: 'export',
    shortcut: 'D',
  },
  {
    id: 'delete',
    shortcut: 'Del',
    intent: 'danger',
  },
] as const satisfies readonly Omit<MenuPlaygroundItem, 'label' | 'description'>[];

const playgroundItemText = {
  edit: {
    label: {
      en: menuText.en.editDetails,
      dv: menuText.dv.editDetails,
    },
    description: {
      en: menuText.en.updateLabels,
      dv: menuText.dv.updateLabels,
    },
  },
  export: {
    label: {
      en: menuText.en.export,
      dv: menuText.dv.export,
    },
    description: {
      en: menuText.en.createLocalCopy,
      dv: menuText.dv.createLocalCopy,
    },
  },
  delete: {
    label: {
      en: menuText.en.delete,
      dv: menuText.dv.delete,
    },
    description: {
      en: menuText.en.permanentAction,
      dv: menuText.dv.permanentAction,
    },
  },
} as const;

type PlaygroundItemId = keyof typeof playgroundItemText;

const isPlaygroundItemId = (value: string): value is PlaygroundItemId =>
  value in playgroundItemText;

const useMenuLanguage = (): MenuLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useMenuText = () => {
  const language = useMenuLanguage();

  return menuText[language];
};

const getLocalizedMenuArgText = (key: MenuArgTextKey, value: unknown, language: MenuLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return menuArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(menuArgText[key]);

  if (localizedValues.includes(value)) {
    return menuArgText[key][language];
  }

  return value;
};

const getLocalizedPlaygroundItemText = (
  id: string,
  field: 'label' | 'description',
  value: unknown,
  language: MenuLanguage,
) => {
  if (!isPlaygroundItemId(id)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return field === 'label' ? playgroundItemText[id][field][language] : value;
  }

  const localizedValues: readonly string[] = Object.values(playgroundItemText[id][field]);

  if (localizedValues.includes(value)) {
    return playgroundItemText[id][field][language];
  }

  return value;
};

const createDefaultPlaygroundItems = (language: MenuLanguage): MenuPlaygroundItem[] =>
  defaultPlaygroundItemConfigs.map((item) => {
    const id = item.id;

    return {
      ...item,
      label: playgroundItemText[id].label[language],
      description: playgroundItemText[id].description[language],
    };
  });

const getLocalizedPlaygroundItems = (
  items: unknown,
  language: MenuLanguage,
): MenuPlaygroundItem[] | undefined => {
  if (!Array.isArray(items)) {
    return undefined;
  }

  return items.map((item) => {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string') {
      return item as MenuPlaygroundItem;
    }

    const label = getLocalizedPlaygroundItemText(item.id, 'label', item.label, language);
    const description = getLocalizedPlaygroundItemText(
      item.id,
      'description',
      item.description,
      language,
    );

    return {
      ...item,
      label,
      description,
    } as MenuPlaygroundItem;
  });
};

const formatSelection = (
  selection: MenuSelection,
  labels: Record<string, string>,
  text: Pick<MenuText, 'all' | 'none'>,
) => {
  if (selection === 'all') {
    return text.all;
  }

  const selectedLabels = [...selection].map((key) => labels[String(key)] ?? String(key));

  return selectedLabels.join(', ') || text.none;
};

const formatPlaygroundSelection = (
  selection: MenuSelection,
  items: MenuPlaygroundItem[],
  text: Pick<MenuText, 'all' | 'none'>,
) => {
  const labels = Object.fromEntries(items.map((item) => [item.id, item.label]));

  return formatSelection(selection, labels, text);
};

function SubmenuCaret() {
  const { direction } = useVeliLanguage();
  const CaretIcon = direction === 'rtl' ? CaretLeftIcon : CaretRightIcon;

  return <CaretIcon size={14} />;
}

const meta: Meta = {
  title: 'Components/Menu',
  component: Menu,
  decorators: [
    (Story, context) => {
      const language: MenuLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { items, triggerLabel } = args;

      useEffect(() => {
        const nextArgs: Partial<MenuPlaygroundArgs> = {};

        menuArgTextKeys.forEach((key) => {
          const currentValue = args[key];

          if (currentValue === undefined) {
            return;
          }

          const localizedValue = getLocalizedMenuArgText(key, currentValue, language);

          if (currentValue !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (items !== undefined) {
          const localizedItems = getLocalizedPlaygroundItems(items, language);

          if (localizedItems && localizedItems !== items) {
            const hasChanges = localizedItems.some((item, index) => {
              const currentItem = Array.isArray(items) ? items[index] : undefined;

              return (
                currentItem?.label !== item.label || currentItem?.description !== item.description
              );
            });

            if (hasChanges) {
              nextArgs.items = localizedItems;
            }
          }
        }

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [args, items, language, triggerLabel, updateArgs]);

      return <Story />;
    },
  ],
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
  render: () => {
    const text = useMenuText();

    return (
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.actions}
          <DotsThreeIcon size={16} weight="bold" />
        </Button>
        <MenuPopover>
          <Menu>
            <MenuItem startIcon={<PencilSimpleIcon size={16} />}>{text.edit}</MenuItem>
            <MenuItem startIcon={<DownloadSimpleIcon size={16} />}>{text.export}</MenuItem>
            <MenuSeparator />
            <MenuItem intent="danger" startIcon={<TrashIcon size={16} />}>
              {text.delete}
            </MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
  },
};

/**
 * Live-editable menu playground for design iteration.
 * Modify `items` JSON and size controls to experiment quickly.
 */
export const Default: Story = {
  args: {
    triggerLabel: menuText.en.menu,
    itemSize: 'md',
    showDescriptions: true,
    showShortcuts: true,
    items: createDefaultPlaygroundItems('en'),
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
    const language = useMenuLanguage();
    const text = menuText[language];
    const [lastAction, setLastAction] = useState<string | null>(null);

    const defaultItems = useMemo(() => createDefaultPlaygroundItems(language), [language]);

    const safeItems = useMemo(() => {
      if (!Array.isArray(args.items) || args.items.length === 0) {
        return defaultItems;
      }

      return getLocalizedPlaygroundItems(args.items, language) ?? defaultItems;
    }, [args.items, defaultItems, language]);

    const [selectedKeys, setSelectedKeys] = useState<MenuSelection>(
      () => new Set(safeItems.filter((item) => item.selected).map((item) => item.id)),
    );

    const itemLabels = useMemo(
      () => Object.fromEntries(safeItems.map((item) => [item.id, item.label])),
      [safeItems],
    );

    return (
      <div className="flex flex-col items-start gap-3">
        <MenuTrigger>
          <Button intent="secondary" appearance="transparent" size="sm">
            {getLocalizedMenuArgText('triggerLabel', args.triggerLabel, language)}
            <DotsThreeIcon size={16} weight="bold" />
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
                  intent={item.intent ?? 'default'}
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
        <p className="type-caption-regular text-base-muted">
          {text.lastAction}:{' '}
          <span className="type-caption-medium">
            {lastAction ? (itemLabels[lastAction] ?? lastAction) : text.noneYet}
          </span>
        </p>
        <p className="type-caption-regular text-base-muted">
          {text.selected}:{' '}
          <span className="type-caption-medium">
            {formatPlaygroundSelection(selectedKeys, safeItems, text)}
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
  render: () => {
    const text = useMenuText();

    return (
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.openMenu}
        </Button>
        <MenuPopover>
          <Menu>
            <MenuSection title={text.file}>
              <MenuItem startIcon={<PencilSimpleIcon size={16} />}>{text.rename}</MenuItem>
              <MenuItem startIcon={<DownloadSimpleIcon size={16} />}>{text.download}</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title={text.settings}>
              <MenuItem startIcon={<GearIcon size={16} />}>{text.preferences}</MenuItem>
              <MenuItem intent="danger" startIcon={<TrashIcon size={16} />}>
                {text.removeFile}
              </MenuItem>
            </MenuSection>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
  },
};

/**
 * Nested subitems variation for multi-level actions.
 */
export const WithSubitems: Story = {
  render: () => {
    const text = useMenuText();

    return (
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.openNestedMenu}
        </Button>
        <MenuPopover>
          <Menu>
            <MenuItem id="open">{text.open}</MenuItem>

            <MenuSubmenuTrigger>
              <MenuItem id="export" endIcon={<SubmenuCaret />}>
                {text.exportAs}
              </MenuItem>
              <MenuPopover>
                <Menu>
                  <MenuItem id="pdf">{text.pdf}</MenuItem>
                  <MenuItem id="docx">{text.docx}</MenuItem>

                  <MenuSubmenuTrigger>
                    <MenuItem id="image" endIcon={<SubmenuCaret />}>
                      {text.image}
                    </MenuItem>
                    <MenuPopover>
                      <Menu>
                        <MenuItem id="png">{text.png}</MenuItem>
                        <MenuItem id="svg">{text.svg}</MenuItem>
                      </Menu>
                    </MenuPopover>
                  </MenuSubmenuTrigger>
                </Menu>
              </MenuPopover>
            </MenuSubmenuTrigger>

            <MenuSeparator />
            <MenuItem id="delete" intent="danger" startIcon={<TrashIcon size={16} />}>
              {text.delete}
            </MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
  },
};

/**
 * Default and danger sentiments for neutral and destructive menu actions.
 */
export const Sentiment: Story = {
  render: () => {
    const text = useMenuText();

    return (
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.actions}
        </Button>
        <MenuPopover>
          <Menu>
            <MenuItem id="rename" startIcon={<PencilSimpleIcon size={16} />}>
              {text.rename}
            </MenuItem>
            <MenuItem id="download" startIcon={<DownloadSimpleIcon size={16} />}>
              {text.download}
            </MenuItem>
            <MenuSeparator />
            <MenuItem id="delete" intent="danger" startIcon={<TrashIcon size={16} />}>
              {text.delete}
            </MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
  },
};

/**
 * Selection via React Aria `selectionMode` and `selectedKeys`.
 * Single select closes on pick by default; multiple select and `closeOnSelect={false}` keep the menu open.
 */
export const Checked: Story = {
  render: () => {
    const text = useMenuText();
    const [singleSelected, setSingleSelected] = useState<MenuSelection>(new Set(['name']));
    const [multipleSelected, setMultipleSelected] = useState<MenuSelection>(
      new Set(['files', 'folders']),
    );
    const [persistentSelected, setPersistentSelected] = useState<MenuSelection>(new Set(['list']));
    const sortLabels = {
      name: text.name,
      date: text.dateModified,
      size: text.size,
    };
    const viewLabels = {
      files: text.showFiles,
      folders: text.showFolders,
      hidden: text.showHiddenItems,
    };
    const layoutLabels = {
      list: text.list,
      grid: text.grid,
      board: text.board,
    };

    return (
      <div className="grid w-[min(48rem,calc(100vw-2rem))] grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <p className="type-caption-medium text-base">{text.singleClosesOnSelect}</p>
          <MenuTrigger>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.sortBy}
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="single"
                selectedKeys={singleSelected}
                onSelectionChange={setSingleSelected}
              >
                <MenuItem id="name">{text.name}</MenuItem>
                <MenuItem id="date">{text.dateModified}</MenuItem>
                <MenuItem id="size">{text.size}</MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="w-full min-w-0 truncate type-caption-regular text-base-muted">
            {text.selected}:{' '}
            <span className="type-caption-medium">
              {formatSelection(singleSelected, sortLabels, text)}
            </span>
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2">
          <p className="type-caption-medium text-base">{text.multipleStaysOpen}</p>
          <MenuTrigger>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.view}
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="multiple"
                selectedKeys={multipleSelected}
                onSelectionChange={setMultipleSelected}
              >
                <MenuItem id="files">{text.showFiles}</MenuItem>
                <MenuItem id="folders">{text.showFolders}</MenuItem>
                <MenuItem id="hidden">{text.showHiddenItems}</MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="w-full min-w-0 truncate type-caption-regular text-base-muted">
            {text.selected}:{' '}
            <span className="type-caption-medium">
              {formatSelection(multipleSelected, viewLabels, text)}
            </span>
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2">
          <p className="type-caption-medium text-base">{text.singleCloseOnSelectFalse}</p>
          <MenuTrigger>
            <Button intent="secondary" appearance="transparent" size="sm">
              {text.layout}
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="single"
                selectedKeys={persistentSelected}
                onSelectionChange={setPersistentSelected}
              >
                <MenuItem id="list" closeOnSelect={false}>
                  {text.list}
                </MenuItem>
                <MenuItem id="grid" closeOnSelect={false}>
                  {text.grid}
                </MenuItem>
                <MenuItem id="board" closeOnSelect={false}>
                  {text.board}
                </MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <p className="w-full min-w-0 truncate type-caption-regular text-base-muted">
            {text.selected}:{' '}
            <span className="type-caption-medium">
              {formatSelection(persistentSelected, layoutLabels, text)}
            </span>
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
  render: () => {
    const text = useMenuText();

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MenuTrigger>
          <Button intent="secondary" appearance="transparent" size="sm">
            {text.small}
          </Button>
          <MenuPopover>
            <Menu>
              <MenuSection title={text.account} size="sm">
                <MenuItem size="sm">{text.profile}</MenuItem>
                <MenuItem size="sm">{text.billing}</MenuItem>
              </MenuSection>
              <MenuSeparator />
              <MenuSection title={text.session} size="sm">
                <MenuItem size="sm">{text.signOut}</MenuItem>
              </MenuSection>
            </Menu>
          </MenuPopover>
        </MenuTrigger>

        <MenuTrigger>
          <Button intent="secondary" appearance="transparent" size="sm">
            {text.medium}
          </Button>
          <MenuPopover>
            <Menu>
              <MenuSection title={text.account} size="md">
                <MenuItem size="md">{text.profile}</MenuItem>
                <MenuItem size="md">{text.billing}</MenuItem>
              </MenuSection>
              <MenuSeparator />
              <MenuSection title={text.session} size="md">
                <MenuItem size="md">{text.signOut}</MenuItem>
              </MenuSection>
            </Menu>
          </MenuPopover>
        </MenuTrigger>

        <MenuTrigger>
          <Button intent="secondary" appearance="transparent" size="sm">
            {text.large}
          </Button>
          <MenuPopover>
            <Menu>
              <MenuSection title={text.account} size="lg">
                <MenuItem size="lg">{text.profile}</MenuItem>
                <MenuItem size="lg">{text.billing}</MenuItem>
              </MenuSection>
              <MenuSeparator />
              <MenuSection title={text.session} size="lg">
                <MenuItem size="lg">{text.signOut}</MenuItem>
              </MenuSection>
            </Menu>
          </MenuPopover>
        </MenuTrigger>
      </div>
    );
  },
};

/**
 * Rich item content for enterprise workflows: icon + description + shortcut.
 * Pass `className` (e.g. `max-w-xs`) to cap popover width when content is long.
 */
export const RichItems: Story = {
  render: () => {
    const text = useMenuText();
    const sizeLabels = {
      sm: text.small,
      md: text.medium,
      lg: text.large,
    };

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <MenuTrigger key={size}>
            <Button intent="secondary" appearance="transparent" size="sm">
              {sizeLabels[size]}
            </Button>
            <MenuPopover className="max-w-xs">
              <Menu>
                <MenuItem
                  size={size}
                  startIcon={<PencilSimpleIcon size={16} />}
                  description={text.updateLabels}
                  shortcut="E"
                >
                  {text.editDetails}
                </MenuItem>
                <MenuItem
                  size={size}
                  startIcon={<DownloadSimpleIcon size={16} />}
                  description={text.createLocalCopy}
                  shortcut="D"
                >
                  {text.downloadCopy}
                </MenuItem>
                <MenuItem
                  size={size}
                  isDisabled
                  startIcon={<GearIcon size={16} />}
                  description={text.requiresAdmin}
                  shortcut="S"
                >
                  {text.shareExternally}
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  size={size}
                  intent="danger"
                  startIcon={<TrashIcon size={16} />}
                  description={text.permanentAction}
                  shortcut="Del"
                >
                  {text.deleteRecord}
                </MenuItem>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
        ))}
      </div>
    );
  },
};
