import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { FunnelIcon, InfoIcon, UserIcon } from '@phosphor-icons/react';
import { Badge } from '@veli-design/react/badge';
import { Button } from '@veli-design/react/button';
import { Checkbox } from '@veli-design/react/checkbox';
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@veli-design/react/popover';

type PopoverIntent = NonNullable<ComponentProps<typeof Popover>['intent']>;
type PopoverPlacement = NonNullable<ComponentProps<typeof Popover>['placement']>;

type PopoverPositionVariant = {
  label: string;
  placement: PopoverPlacement;
  showArrow?: boolean;
};

/** Matches the rows of the Figma Popover component set. */
const POPOVER_POSITION_ROWS: PopoverPositionVariant[][] = [
  [
    { label: 'top left', placement: 'top left' },
    { label: 'top', placement: 'top' },
    { label: 'top right', placement: 'top right' },
  ],
  [
    { label: 'bottom left', placement: 'bottom left' },
    { label: 'bottom', placement: 'bottom' },
    { label: 'bottom right', placement: 'bottom right' },
  ],
  [
    { label: 'left top', placement: 'left top' },
    { label: 'left', placement: 'left' },
    { label: 'left bottom', placement: 'left bottom' },
  ],
  [
    { label: 'right top', placement: 'right top' },
    { label: 'right', placement: 'right' },
    { label: 'right bottom', placement: 'right bottom' },
  ],
  [{ label: 'bottom, showArrow={false}', placement: 'bottom', showArrow: false }],
];

const POPOVER_INTENTS: PopoverIntent[] = ['primary', 'secondary', 'tertiary'];

const POPOVER_PLACEMENTS = [
  'bottom',
  'bottom left',
  'bottom right',
  'bottom start',
  'bottom end',
  'top',
  'top left',
  'top right',
  'top start',
  'top end',
  'left',
  'left top',
  'left bottom',
  'start',
  'start top',
  'start bottom',
  'right',
  'right top',
  'right bottom',
  'end',
  'end top',
  'end bottom',
] as const;

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function PopoverDocsContainer(props: DocsContainerProps) {
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

function footerButtonIntent(intent: PopoverIntent): ComponentProps<typeof Button>['intent'] {
  return intent === 'primary' ? 'secondary' : 'primary';
}

const englishPopoverText = {
  closePopover: 'Close popover',
  teamRequests: 'Team requests',
  playground: {
    trigger: 'Open popover',
    title: 'Header Title',
    body: 'Interactive content beside the control that opened it.',
    label: 'Label',
    previous: 'Previous',
    next: 'Next',
  },
  filterPanel: {
    triggerAriaLabel: 'Open filters',
    trigger: 'Filters',
    title: 'Filters',
    activeOnly: 'Active only',
    assignedToMe: 'Assigned to me',
    overdue: 'Overdue',
    clear: 'Clear',
    apply: 'Apply',
  },
  compositions: {
    full: 'Full',
    headerOnly: 'Header only',
    bodyOnly: 'Body only',
    footerOnly: 'Footer only',
    noDividers: 'No dividers',
    customHeader: 'Custom header',
    title: 'Shipment status',
    body: 'Your shipment cleared customs and is on the way to Malé.',
    bodyLabel: 'Shipment details',
    status: 'In transit',
    done: 'Done',
  },
  controlled: {
    trigger: 'Account details',
    title: 'Account details',
    body: 'This popover opens and closes from React state.',
    external: 'Toggle from outside',
    state: 'Open state',
    open: 'Open',
    closed: 'Closed',
  },
  longContent: {
    trigger: 'Release notes',
    title: 'Release notes',
    item: 'Improvement',
  },
  intents: {
    primary: 'Primary',
    secondary: 'Secondary',
    tertiary: 'Default',
  },
} as const;

const dhivehiPopoverText = {
  closePopover: 'ޕޮޕްއޯވަރ ބަންދުކުރައްވާ',
  teamRequests: 'ޓީމުގެ ރިކުއެސްޓްތައް',
  playground: {
    trigger: 'ޕޮޕްއޯވަރ ހުޅުވާ',
    title: 'ހެޑަރ ޓައިޓަލް',
    body: 'ކޮންޓްރޯލް އާއި ގުޅިފައިވާ އިންޓަރއެކްޓިވް ކޮންޓެންޓެވެ.',
    label: 'ލޭބަލް',
    previous: 'ފަހަތަށް',
    next: 'ކުރިއަށް',
  },
  filterPanel: {
    triggerAriaLabel: 'ފިލްޓަރުތައް ހުޅުވާ',
    trigger: 'ފިލްޓަރސް',
    title: 'ފިލްޓަރސް',
    activeOnly: 'ހަމައެކަނި އެކްޓިވް',
    assignedToMe: 'އަޅުގަނޑާ ހަވާލުކުރެވިފައިވާ',
    overdue: 'މުއްދަތު ހަމަވެފައިވާ',
    clear: 'ކްލިއަރ',
    apply: 'އެޕްލައި',
  },
  compositions: {
    full: 'ފުރިހަމަ',
    headerOnly: 'ހެޑަރ އެކަނި',
    bodyOnly: 'ބޮޑީ އެކަނި',
    footerOnly: 'ފޫޓަރ އެކަނި',
    noDividers: 'ޑިވައިޑަރ ނެތް',
    customHeader: 'ކަސްޓަމް ހެޑަރ',
    title: 'ޝިޕްމަންޓްގެ ހާލަތު',
    body: 'ތިބާގެ ޝިޕްމަންޓް ކަސްޓަމްސް އިން ފާސްވެ، މާލެއަށް އަންނަނީ.',
    bodyLabel: 'ޝިޕްމަންޓްގެ ތަފްޞީލު',
    status: 'މަގުމަތީގައި',
    done: 'ނިމުނީ',
  },
  controlled: {
    trigger: 'އެކައުންޓްގެ ތަފްޞީލު',
    title: 'އެކައުންޓްގެ ތަފްޞީލު',
    body: 'މި ޕޮޕްއޯވަރ ހުޅުވައި ބަންދުކުރަނީ ރިއެކްޓް ސްޓޭޓުންނެވެ.',
    external: 'ބޭރުން ބަދަލުކުރައްވާ',
    state: 'ހުޅުވިފައިވާ ހާލަތު',
    open: 'ހުޅުވިފައި',
    closed: 'ބަންދުކޮށްފައި',
  },
  longContent: {
    trigger: 'ރިލީސް ނޯޓްސް',
    title: 'ރިލީސް ނޯޓްސް',
    item: 'ރަނގަޅުކުރުން',
  },
  intents: {
    primary: 'ޕްރައިމަރީ',
    secondary: 'ސެކަންޑަރީ',
    tertiary: 'އާދައިގެ',
  },
} as const;

const localizedPopoverText = {
  en: englishPopoverText,
  dv: dhivehiPopoverText,
} as const;

type PopoverLanguage = keyof typeof localizedPopoverText;

const usePopoverLanguage = (): PopoverLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const usePopoverText = () => {
  const language = usePopoverLanguage();

  return localizedPopoverText[language];
};

type PopoverStoryArgs = Pick<
  ComponentProps<typeof Popover>,
  | 'intent'
  | 'showArrow'
  | 'placement'
  | 'offset'
  | 'crossOffset'
  | 'shouldFlip'
  | 'arrowBoundaryOffset'
  | 'containerPadding'
  | 'isNonModal'
  | 'isKeyboardDismissDisabled'
>;

function FigmaPopover({
  intent,
  placement,
  showArrow = true,
}: {
  intent: PopoverIntent;
  placement: PopoverPlacement;
  showArrow?: boolean;
}) {
  const actionIntent = footerButtonIntent(intent);
  const text = usePopoverText();

  return (
    <Popover
      intent={intent}
      placement={placement}
      showArrow={showArrow}
      shouldFlip={false}
      className="w-[274px]"
    >
      <PopoverDialog>
        {({ close }) => (
          <>
            <PopoverHeader
              title={text.playground.title}
              icon={<UserIcon size={16} aria-hidden />}
              onClose={close}
              closeButtonLabel={text.closePopover}
            />
            <PopoverContent className="min-h-[120px]">{null}</PopoverContent>
            <PopoverFooter label={text.playground.label}>
              <Button intent={actionIntent} size="xs">
                {text.playground.previous}
              </Button>
              <Button intent={actionIntent} size="xs">
                {text.playground.next}
              </Button>
            </PopoverFooter>
          </>
        )}
      </PopoverDialog>
    </Popover>
  );
}

function PopoverVariantCell({
  intent,
  label,
  placement,
  showArrow = true,
  isOpen,
  onOpenChange,
}: PopoverPositionVariant & {
  intent: PopoverIntent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const text = usePopoverText();

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-center font-mono text-xs text-base-muted">{label}</span>
      <div className="flex min-h-[300px] w-full min-w-[300px] items-center justify-center">
        <PopoverTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
          <Button intent="secondary" size="xs">
            {text.playground.trigger}
          </Button>
          <FigmaPopover intent={intent} placement={placement} showArrow={showArrow} />
        </PopoverTrigger>
      </div>
    </div>
  );
}

function PopoverVariantsMatrix() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const text = usePopoverText();

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-16 bg-surface-base p-8">
      {POPOVER_INTENTS.map((intent) => (
        <section key={intent} className="flex flex-col gap-8">
          <h2 className="type-title-2-bold text-base-high-contrast">
            {intent === 'tertiary' ? text.intents.tertiary : text.intents[intent]}
          </h2>
          <div className="flex flex-col gap-10">
            {POPOVER_POSITION_ROWS.map((row, rowIndex) => (
              <div
                key={`${intent}-row-${rowIndex}`}
                className="grid grid-cols-1 gap-10 sm:grid-cols-3"
              >
                {row.map((variant) => {
                  const variantKey = `${intent}-${variant.label}`;

                  return (
                    <PopoverVariantCell
                      key={variantKey}
                      intent={intent}
                      isOpen={openKey === variantKey}
                      onOpenChange={(open) => setOpenKey(open ? variantKey : null)}
                      {...variant}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: PopoverDocsContainer,
    },
  },
  argTypes: {
    ...withArgCategory('Appearance', {
      intent: {
        control: 'select',
        options: POPOVER_INTENTS,
      },
      showArrow: {
        control: 'boolean',
      },
      placement: {
        control: 'select',
        options: [...POPOVER_PLACEMENTS],
      },
    }),
    ...withArgCategory('Content', {
      offset: {
        control: { type: 'number', min: 0, step: 1 },
      },
      crossOffset: {
        control: { type: 'number', step: 1 },
      },
      arrowBoundaryOffset: {
        control: { type: 'number', min: 0, step: 1 },
      },
      containerPadding: {
        control: { type: 'number', min: 0, step: 1 },
      },
    }),
    ...withArgCategory('State', {
      shouldFlip: {
        control: 'boolean',
      },
      isNonModal: {
        control: 'boolean',
      },
      isKeyboardDismissDisabled: {
        control: 'boolean',
      },
    }),
    ref: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    children: { table: { disable: true } },
    triggerRef: { table: { disable: true } },
    lang: { table: { disable: true } },
    dir: { table: { disable: true } },
  },
  args: {
    intent: 'tertiary',
    showArrow: true,
    placement: 'bottom',
    shouldFlip: true,
    isNonModal: false,
    isKeyboardDismissDisabled: false,
  },
} satisfies Meta<PopoverStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const intent: PopoverIntent = args.intent ?? 'tertiary';
    const text = usePopoverText();

    return (
      <div className="flex min-h-[320px] items-center justify-center bg-surface-base p-8">
        <PopoverTrigger>
          <Button intent="secondary">{text.playground.trigger}</Button>
          <Popover {...args} intent={intent} className="w-[274px]">
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title={text.playground.title}
                    icon={<UserIcon aria-hidden />}
                    onClose={close}
                    closeButtonLabel={text.closePopover}
                  />
                  <PopoverContent>
                    <p className="type-body-sm-regular">{text.playground.body}</p>
                  </PopoverContent>
                  <PopoverFooter label={text.playground.label}>
                    <Button intent={footerButtonIntent(intent)} size="xs">
                      {text.playground.previous}
                    </Button>
                    <Button intent={footerButtonIntent(intent)} size="xs">
                      {text.playground.next}
                    </Button>
                  </PopoverFooter>
                </>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
    );
  },
  play: async ({ canvasElement, globals }) => {
    const text = globals.language === 'dv' ? dhivehiPopoverText : englishPopoverText;
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: text.playground.trigger });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: text.playground.title });
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: text.closePopover }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Intents: Story = {
  render: () => {
    const text = usePopoverText();

    return (
      <div className="flex min-h-[320px] flex-wrap items-center justify-center gap-6 bg-surface-base p-8">
        {POPOVER_INTENTS.map((intent) => (
          <PopoverTrigger key={intent}>
            <Button intent="secondary" size="sm">
              {intent === 'tertiary' ? text.intents.tertiary : text.intents[intent]}
            </Button>
            <Popover intent={intent} placement="bottom" className="w-[274px]">
              <PopoverDialog>
                {({ close }) => (
                  <>
                    <PopoverHeader
                      title={text.playground.title}
                      icon={<InfoIcon aria-hidden />}
                      onClose={close}
                      closeButtonLabel={text.closePopover}
                    />
                    <PopoverContent>
                      <p className="type-body-sm-regular">{text.playground.body}</p>
                    </PopoverContent>
                    <PopoverFooter label={text.playground.label}>
                      <Button intent={footerButtonIntent(intent)} size="xs">
                        {text.playground.previous}
                      </Button>
                      <Button intent={footerButtonIntent(intent)} size="xs" onPress={close}>
                        {text.playground.next}
                      </Button>
                    </PopoverFooter>
                  </>
                )}
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
        ))}
      </div>
    );
  },
};

export const Placements: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => <PopoverVariantsMatrix />,
};

const FILTER_OPTIONS = [
  { id: 'active', textKey: 'activeOnly' },
  { id: 'assigned', textKey: 'assignedToMe' },
  { id: 'overdue', textKey: 'overdue' },
] as const;

function FilterPanelExample() {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    active: true,
    assigned: false,
    overdue: false,
  });

  const activeCount = Object.values(filters).filter(Boolean).length;
  const text = usePopoverText();

  return (
    <div className="flex min-h-[320px] items-center justify-center bg-surface-base p-8">
      <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-base-subtle bg-surface-raised px-4 py-3">
        <p className="type-body-sm-medium text-base-strong">{text.teamRequests}</p>
        <PopoverTrigger>
          <Button intent="secondary" size="sm" aria-label={text.filterPanel.triggerAriaLabel}>
            <FunnelIcon size={16} aria-hidden />
            {text.filterPanel.trigger}
            {activeCount > 0 ? (
              <Badge counter appearance="emphasis" intent="magenta" size="sm" count={activeCount} />
            ) : null}
          </Button>
          <Popover intent="tertiary" placement="bottom end" className="w-[260px]">
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title={text.filterPanel.title}
                    icon={<FunnelIcon size={16} aria-hidden />}
                    onClose={close}
                    closeButtonLabel={text.closePopover}
                  />
                  <PopoverContent className="flex flex-col gap-3 py-2">
                    {FILTER_OPTIONS.map((option) => (
                      <Checkbox
                        key={option.id}
                        isSelected={filters[option.id]}
                        onChange={(selected) =>
                          setFilters((current) => ({ ...current, [option.id]: selected }))
                        }
                      >
                        {text.filterPanel[option.textKey]}
                      </Checkbox>
                    ))}
                  </PopoverContent>
                  <PopoverFooter>
                    <Button
                      intent="secondary"
                      appearance="ghost"
                      size="xs"
                      onPress={() => setFilters({ active: false, assigned: false, overdue: false })}
                    >
                      {text.filterPanel.clear}
                    </Button>
                    <Button intent="primary" size="xs" onPress={close}>
                      {text.filterPanel.apply}
                    </Button>
                  </PopoverFooter>
                </>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
    </div>
  );
}

export const FilterPanel: Story = {
  name: 'Filter panel',
  render: () => <FilterPanelExample />,
};

function CompositionCell({
  label,
  dialogLabel,
  children,
}: {
  label: string;
  dialogLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="type-caption-medium text-base-muted">{label}</span>
      <PopoverTrigger>
        <Button intent="secondary" size="sm">
          {label}
        </Button>
        <Popover placement="bottom" className="w-[274px]">
          <PopoverDialog aria-label={dialogLabel}>{children}</PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

function CustomHeaderComposition() {
  const text = usePopoverText();
  const titleId = useId();

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="type-caption-medium text-base-muted">{text.compositions.customHeader}</span>
      <PopoverTrigger>
        <Button intent="secondary" size="sm">
          {text.compositions.customHeader}
        </Button>
        <Popover placement="bottom" className="w-[274px]">
          <PopoverDialog aria-labelledby={titleId}>
            {({ close }) => (
              <>
                <PopoverHeader onClose={close} closeButtonLabel={text.closePopover}>
                  <p id={titleId} className="min-w-0 flex-1 type-body-sm-medium text-base-strong">
                    {text.compositions.title}
                  </p>
                  <Badge intent="brand" size="sm">
                    {text.compositions.status}
                  </Badge>
                </PopoverHeader>
                <PopoverContent>
                  <p className="type-body-sm-regular">{text.compositions.body}</p>
                </PopoverContent>
              </>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

export const Compositions: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const text = usePopoverText();
    const body = (
      <PopoverContent>
        <p className="type-body-sm-regular">{text.compositions.body}</p>
      </PopoverContent>
    );
    const actions = (
      <Button intent="primary" size="xs">
        {text.compositions.done}
      </Button>
    );

    return (
      <div className="grid min-h-[360px] grid-cols-2 items-start gap-8 bg-surface-base p-8 sm:grid-cols-3 lg:grid-cols-6">
        <CompositionCell label={text.compositions.full}>
          <PopoverHeader title={text.compositions.title} icon={<InfoIcon aria-hidden />} />
          {body}
          <PopoverFooter label={text.playground.label}>{actions}</PopoverFooter>
        </CompositionCell>
        <CompositionCell label={text.compositions.headerOnly}>
          <PopoverHeader title={text.compositions.title} icon={<InfoIcon aria-hidden />} />
          {body}
        </CompositionCell>
        <CompositionCell
          label={text.compositions.bodyOnly}
          dialogLabel={text.compositions.bodyLabel}
        >
          {body}
        </CompositionCell>
        <CompositionCell
          label={text.compositions.footerOnly}
          dialogLabel={text.compositions.bodyLabel}
        >
          {body}
          <PopoverFooter label={text.playground.label}>{actions}</PopoverFooter>
        </CompositionCell>
        <CompositionCell label={text.compositions.noDividers}>
          <PopoverHeader title={text.compositions.title} showDivider={false} />
          <PopoverContent className="py-0">
            <p className="type-body-sm-regular">{text.compositions.body}</p>
          </PopoverContent>
          <PopoverFooter showDivider={false}>{actions}</PopoverFooter>
        </CompositionCell>
        <CustomHeaderComposition />
      </div>
    );
  },
};

function ControlledExample() {
  const [isOpen, setOpen] = useState(false);
  const text = usePopoverText();

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 bg-surface-base p-8">
      <div className="flex items-center gap-3">
        <Button
          intent="secondary"
          appearance="transparent"
          size="sm"
          onPress={() => setOpen((open) => !open)}
        >
          {text.controlled.external}
        </Button>
        <p className="type-body-sm-regular text-base-muted" aria-live="polite">
          {text.controlled.state}: {isOpen ? text.controlled.open : text.controlled.closed}
        </p>
      </div>
      <PopoverTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button intent="secondary">{text.controlled.trigger}</Button>
        <Popover intent="secondary" placement="bottom" className="w-[274px]">
          <PopoverDialog>
            {({ close }) => (
              <>
                <PopoverHeader
                  title={text.controlled.title}
                  icon={<UserIcon aria-hidden />}
                  onClose={close}
                  closeButtonLabel={text.closePopover}
                />
                <PopoverContent>
                  <p className="type-body-sm-regular">{text.controlled.body}</p>
                </PopoverContent>
              </>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const LongContent: Story = {
  name: 'Long content',
  render: () => {
    const text = usePopoverText();

    return (
      <div className="flex min-h-[420px] items-center justify-center bg-surface-base p-8">
        <PopoverTrigger>
          <Button intent="secondary">{text.longContent.trigger}</Button>
          <Popover placement="bottom" className="flex max-h-[320px] w-[274px] flex-col">
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title={text.longContent.title}
                    onClose={close}
                    closeButtonLabel={text.closePopover}
                  />
                  <PopoverContent className="overflow-y-auto" tabIndex={0}>
                    <ul className="flex list-disc flex-col gap-2 ps-4 type-body-sm-regular">
                      {Array.from({ length: 16 }, (_, index) => (
                        <li key={index}>
                          {text.longContent.item} {index + 1}
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                  <PopoverFooter>
                    <Button intent="primary" size="xs" onPress={close}>
                      {text.compositions.done}
                    </Button>
                  </PopoverFooter>
                </>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
    );
  },
};

const LOGICAL_PLACEMENTS: PopoverPlacement[] = [
  'start',
  'start top',
  'end',
  'end bottom',
  'top start',
  'bottom end',
];

/** Keep flip off, but park the trigger where a 220px panel still fits. */
function logicalTriggerStageClassName(placement: PopoverPlacement) {
  const opensTowardStart =
    placement === 'start' ||
    placement.startsWith('start ') ||
    placement.endsWith(' start') ||
    placement.includes(' start ');
  const opensTowardEnd =
    placement === 'end' ||
    placement.startsWith('end ') ||
    placement.endsWith(' end') ||
    placement.includes(' end ');

  if (opensTowardStart) {
    return 'flex min-h-[360px] w-full min-w-[320px] items-center justify-end pe-2';
  }

  if (opensTowardEnd) {
    return 'flex min-h-[360px] w-full min-w-[320px] items-center justify-start ps-2';
  }

  return 'flex min-h-[360px] w-full min-w-[320px] items-center justify-center';
}

export const LogicalPlacements: Story = {
  name: 'Logical placements',
  parameters: { layout: 'padded' },
  render: () => {
    const text = usePopoverText();
    const [openPlacement, setOpenPlacement] = useState<PopoverPlacement | null>(null);

    return (
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-10 bg-surface-base p-8 sm:grid-cols-2">
        {LOGICAL_PLACEMENTS.map((placement) => (
          <div key={placement} className="flex flex-col items-center gap-3">
            <code className="type-caption-regular text-base-muted">{placement}</code>
            <div className={logicalTriggerStageClassName(placement)}>
              <PopoverTrigger
                isOpen={openPlacement === placement}
                onOpenChange={(open) => setOpenPlacement(open ? placement : null)}
              >
                <Button intent="secondary" size="xs">
                  {text.playground.trigger}
                </Button>
                <Popover placement={placement} shouldFlip={false} className="w-[220px]">
                  <PopoverDialog>
                    {({ close }) => (
                      <>
                        <PopoverHeader
                          title={text.playground.title}
                          onClose={close}
                          closeButtonLabel={text.closePopover}
                        />
                        <PopoverContent>
                          <p className="type-body-sm-regular">{text.compositions.body}</p>
                        </PopoverContent>
                      </>
                    )}
                  </PopoverDialog>
                </Popover>
              </PopoverTrigger>
            </div>
          </div>
        ))}
      </div>
    );
  },
};
