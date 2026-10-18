import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { DownloadSimpleIcon, GearIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
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

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function MenuDocsContainer(props: DocsContainerProps) {
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

const menuText = {
  en: {
    actions: 'Actions',
    edit: 'Edit',
    export: 'Export',
    delete: 'Delete',
    editDetails: 'Edit details',
    updateLabels: 'Update labels and visibility.',
    createLocalCopy: 'Create a local copy for offline work.',
    permanentAction: 'This action is permanent.',
    openMenu: 'Open menu',
    file: 'File',
    rename: 'Rename',
    download: 'Download',
    settings: 'Settings',
    preferences: 'Preferences',
    removeFile: 'Remove file',
    openNestedMenu: 'Open nested menu',
    open: 'Open',
    exportAs: 'Export as',
    image: 'Image',
    pdf: 'PDF',
    docx: 'DOCX',
    png: 'PNG',
    svg: 'SVG',
    sortBy: 'Sort by',
    name: 'Name',
    dateModified: 'Date modified',
    size: 'Size',
    view: 'View',
    showFiles: 'Show files',
    showFolders: 'Show folders',
    showHiddenItems: 'Show hidden items',
    selected: 'Selected',
    all: 'all',
    none: 'none',
    single: 'Single',
    multiple: 'Multiple',
    account: 'Account',
    profile: 'Profile',
    billing: 'Billing',
    session: 'Session',
    signOut: 'Sign out',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    defaultState: 'Default',
    disabledState: 'Disabled',
    danger: 'Danger',
    advanced: 'Advanced',
    secondaryText: 'Secondary text or helper text.',
  },
  dv: {
    actions: 'އެކްޝަންތައް',
    edit: 'އެޑިޓް',
    export: 'އެކްސްޕޯޓް',
    delete: 'ފުހެލާ',
    editDetails: 'ތަފްސީލު އެޑިޓްކުރޭ',
    updateLabels: 'ލޭބަލް އަދި ފެންނަގޮތް އަޕްޑޭޓްކުރޭ.',
    createLocalCopy: 'އޮފްލައިން މަސައްކަތަށް ލޯކަލް ކޮޕީއެއް ހަދާ.',
    permanentAction: 'މި އެކްޝަން ދާއިމީއެވެ.',
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
    sortBy: 'ސޯޓްކުރާ ގޮތް',
    name: 'ނަން',
    dateModified: 'ބަދަލުކުރި ތާރީޚް',
    size: 'ސައިޒް',
    view: 'ވިއު',
    showFiles: 'ފައިލްތައް ދައްކާ',
    showFolders: 'ފޯލްޑަރތައް ދައްކާ',
    showHiddenItems: 'ފޮރުވިފައިވާ އައިޓަމްތައް ދައްކާ',
    selected: 'ޚިޔާރުކުރެވިފައި',
    all: 'ހުރިހާ',
    none: 'ނެތް',
    single: 'ސިންގަލް',
    multiple: 'މަލްޓިޕަލް',
    account: 'އެކައުންޓް',
    profile: 'ޕްރޮފައިލް',
    billing: 'ބިލިންގް',
    session: 'ސެޝަން',
    signOut: 'ސައިން އައުޓް',
    small: 'ކުޑަ',
    medium: 'މެޑިއަމް',
    large: 'ބޮޑު',
    defaultState: 'Default',
    disabledState: 'Disabled',
    danger: 'Danger',
    advanced: 'އެޑްވާންސްޑް',
    secondaryText: 'ސެކަންޑަރީ ލިޔުން.',
  },
} as const;

type MenuLanguage = keyof typeof menuText;
type MenuText = (typeof menuText)[MenuLanguage];
type MenuKey = string | number;
type MenuSelection = 'all' | Set<MenuKey>;

type MenuStoryArgs = {
  triggerLabel: string;
  size: 'sm' | 'md' | 'lg';
  intent: 'default' | 'danger';
  label: string;
  description: string;
  shortcut: string;
  showDescription: boolean;
  showShortcut: boolean;
  showStartIcon: boolean;
  selectionMode: 'none' | 'single' | 'multiple';
  isDisabled: boolean;
  closeOnSelect: boolean;
  // Hidden autodocs props from `component: MenuItem`
  className?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  id?: string;
  textValue?: string;
  href?: string;
};

const menuArgText = {
  triggerLabel: {
    en: menuText.en.actions,
    dv: menuText.dv.actions,
  },
  label: {
    en: menuText.en.editDetails,
    dv: menuText.dv.editDetails,
  },
  description: {
    en: menuText.en.updateLabels,
    dv: menuText.dv.updateLabels,
  },
} as const;

type MenuArgTextKey = keyof typeof menuArgText;

const menuArgTextKeys = Object.keys(menuArgText) as MenuArgTextKey[];

const useMenuLanguage = (): MenuLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useMenuText = () => {
  const language = useMenuLanguage();

  return menuText[language];
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

const menuSurfaceClassName =
  'min-w-48 w-max rounded-xl border-[0.5px] border-base-muted bg-menu-bg p-1 text-base-default shadow-md';

function StaticMenuSurface({ children }: { children: ReactNode }) {
  return <div className={menuSurfaceClassName}>{children}</div>;
}

const meta = {
  title: 'Components/Menu',
  component: MenuItem,
  decorators: [
    (Story, context) => {
      const language: MenuLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { triggerLabel, label, description } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<MenuArgTextKey, string>> = {};
        const currentArgs = { triggerLabel, label, description };

        menuArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedMenuArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [description, label, language, triggerLabel, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: MenuDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
      },
      intent: {
        control: 'select',
        options: ['default', 'danger'],
      },
    }),
    ...withArgCategory('Label', {
      triggerLabel: {
        control: 'text',
      },
      label: {
        control: 'text',
      },
    }),
    ...withArgCategory('Content', {
      description: {
        control: 'text',
      },
      shortcut: {
        control: 'text',
      },
      showDescription: {
        control: 'boolean',
      },
      showShortcut: {
        control: 'boolean',
      },
      showStartIcon: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('State', {
      selectionMode: {
        control: 'select',
        options: ['none', 'single', 'multiple'],
      },
      isDisabled: {
        control: 'boolean',
      },
      closeOnSelect: {
        control: 'boolean',
      },
    }),
    className: { table: { disable: true } },
    startIcon: { control: false, table: { disable: true } },
    endIcon: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    id: { table: { disable: true } },
    textValue: { table: { disable: true } },
    href: { table: { disable: true } },
  },
  args: {
    triggerLabel: menuText.en.actions,
    size: 'md',
    intent: 'default',
    label: menuText.en.editDetails,
    description: menuText.en.updateLabels,
    shortcut: 'E',
    showDescription: false,
    showShortcut: false,
    showStartIcon: true,
    selectionMode: 'none',
    isDisabled: false,
    closeOnSelect: true,
  },
} satisfies Meta<MenuStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultMenuPreview(args: MenuStoryArgs) {
  const language = useMenuLanguage();
  const text = menuText[language];
  const triggerLabel = getLocalizedMenuArgText('triggerLabel', args.triggerLabel, language);
  const label = getLocalizedMenuArgText('label', args.label, language);
  const description = getLocalizedMenuArgText('description', args.description, language);
  const [selectedKeys, setSelectedKeys] = useState<MenuSelection>(() => new Set());
  const selectionEnabled = args.selectionMode !== 'none';
  const itemLabels = {
    primary: label,
    export: text.export,
    delete: text.delete,
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {triggerLabel}
        </Button>
        <MenuPopover>
          <Menu
            selectionMode={args.selectionMode}
            selectedKeys={selectionEnabled ? selectedKeys : undefined}
            onSelectionChange={selectionEnabled ? setSelectedKeys : undefined}
          >
            <MenuItem
              id="primary"
              size={args.size}
              intent={args.intent}
              isDisabled={args.isDisabled}
              closeOnSelect={args.closeOnSelect}
              description={args.showDescription ? description : undefined}
              shortcut={args.showShortcut ? args.shortcut || undefined : undefined}
              startIcon={args.showStartIcon ? <PencilSimpleIcon size={16} /> : undefined}
            >
              {label}
            </MenuItem>
            <MenuItem id="export" size={args.size} startIcon={<DownloadSimpleIcon size={16} />}>
              {text.export}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              id="delete"
              size={args.size}
              intent="danger"
              startIcon={<TrashIcon size={16} />}
            >
              {text.delete}
            </MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
      {selectionEnabled ? (
        <p className="type-caption-regular text-base-muted">
          {text.selected}:{' '}
          <span className="type-caption-medium">
            {formatSelection(selectedKeys, itemLabels, text)}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: (args) => {
    const language = useMenuLanguage();

    return <DefaultMenuPreview key={`${language}:${args.selectionMode}`} {...args} />;
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useMenuText();

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <MenuTrigger key={size}>
            <Button intent="secondary" appearance="transparent" size="sm">
              {size === 'sm' ? text.small : size === 'md' ? text.medium : text.large}
            </Button>
            <MenuPopover>
              <Menu>
                <MenuSection title={text.account} size={size}>
                  <MenuItem size={size}>{text.profile}</MenuItem>
                  <MenuItem size={size}>{text.billing}</MenuItem>
                </MenuSection>
                <MenuSeparator />
                <MenuSection title={text.session} size={size}>
                  <MenuItem size={size}>{text.signOut}</MenuItem>
                </MenuSection>
              </Menu>
            </MenuPopover>
          </MenuTrigger>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const text = useMenuText();
    const sizes = ['sm', 'md', 'lg'] as const;
    const states = [
      { id: 'default', label: text.defaultState, intent: 'default' as const },
      { id: 'disabled', label: text.disabledState, intent: 'default' as const, disabled: true },
      { id: 'danger', label: text.danger, intent: 'danger' as const },
    ] as const;

    return (
      <div className="grid w-[min(72rem,calc(100vw-2rem))] grid-cols-1 gap-8 lg:grid-cols-3">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-4">
            <p className="type-body-sm-medium text-base-emphasis">{size}</p>
            <StaticMenuSurface>
              <Menu aria-label={`${size} states`}>
                {states.map((state) => (
                  <MenuItem
                    key={state.id}
                    id={`${size}-${state.id}`}
                    size={size}
                    intent={state.intent}
                    startIcon={
                      state.intent === 'danger' ? (
                        <TrashIcon size={16} />
                      ) : (
                        <PencilSimpleIcon size={16} />
                      )
                    }
                    description={text.secondaryText}
                    shortcut={state.intent === 'danger' ? 'Del' : 'E'}
                    isDisabled={'disabled' in state ? state.disabled : undefined}
                  >
                    {state.label}
                  </MenuItem>
                ))}
              </Menu>
            </StaticMenuSurface>
          </div>
        ))}
      </div>
    );
  },
};

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

export const Selection: Story = {
  render: () => {
    const text = useMenuText();
    const [singleSelected, setSingleSelected] = useState<MenuSelection>(new Set(['name']));
    const [multipleSelected, setMultipleSelected] = useState<MenuSelection>(
      new Set(['files', 'folders']),
    );
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

    return (
      <div className="grid w-[min(32rem,calc(100vw-2rem))] grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <p className="type-caption-medium text-base">{text.single}</p>
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
          <p className="type-caption-medium text-base">{text.multiple}</p>
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
      </div>
    );
  },
};

export const Submenus: Story = {
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
              <MenuItem id="export">{text.exportAs}</MenuItem>
              <MenuPopover>
                <Menu>
                  <MenuItem id="pdf">{text.pdf}</MenuItem>
                  <MenuItem id="docx">{text.docx}</MenuItem>
                  <MenuSubmenuTrigger>
                    <MenuItem id="image">{text.image}</MenuItem>
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

export const RichItems: Story = {
  render: () => {
    const text = useMenuText();

    return (
      <MenuTrigger>
        <Button intent="secondary" appearance="transparent" size="sm">
          {text.actions}
        </Button>
        <MenuPopover className="max-w-xs">
          <Menu>
            <MenuItem
              startIcon={<PencilSimpleIcon size={16} />}
              description={text.updateLabels}
              shortcut={['⌘', 'E']}
            >
              {text.editDetails}
            </MenuItem>
            <MenuItem
              startIcon={<DownloadSimpleIcon size={16} />}
              description={text.createLocalCopy}
              shortcut="D"
            >
              {text.download}
            </MenuItem>
            <MenuItem startIcon={<GearIcon size={16} />}>{text.advanced}</MenuItem>
            <MenuSeparator />
            <MenuItem
              intent="danger"
              startIcon={<TrashIcon size={16} />}
              description={text.permanentAction}
              shortcut="Del"
            >
              {text.removeFile}
            </MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
  },
};
