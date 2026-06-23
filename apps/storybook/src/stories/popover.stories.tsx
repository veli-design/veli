import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Funnel, Info, Sparkle, User } from 'phosphor-react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { Checkbox } from '@tradenetcorp/veli-ui/checkbox';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@tradenetcorp/veli-ui/popover';

type PopoverIntent = NonNullable<ComponentProps<typeof Popover>['intent']>;
type PopoverPlacement = NonNullable<ComponentProps<typeof Popover>['placement']>;

type PopoverPositionVariant = {
  label: string;
  placement: PopoverPlacement;
  showArrow?: boolean;
};

/** Matches the Figma Popover component set position rows. */
const POPOVER_POSITION_ROWS: PopoverPositionVariant[][] = [
  [
    { label: 'Top Left', placement: 'top left' },
    { label: 'Top Center', placement: 'top' },
    { label: 'Top Right', placement: 'top right' },
    { label: 'Right Top', placement: 'right top' },
    { label: 'Right Center', placement: 'right' },
  ],
  [
    { label: 'Right Bottom', placement: 'right bottom' },
    { label: 'Bottom Right', placement: 'bottom right' },
    { label: 'Bottom Center', placement: 'bottom' },
    { label: 'Bottom Left', placement: 'bottom left' },
    { label: 'Left Bottom', placement: 'left bottom' },
  ],
  [
    { label: 'Left Center', placement: 'left' },
    { label: 'Left Top', placement: 'left top' },
    { label: 'Disable', placement: 'top', showArrow: false },
  ],
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

function footerButtonIntent(intent: PopoverIntent): ComponentProps<typeof Button>['intent'] {
  return intent === 'primary' ? 'secondary' : 'primary';
}

type PopoverStoryArgs = Pick<ComponentProps<typeof Popover>, 'intent' | 'showArrow' | 'placement'>;

const englishPopoverText = {
  closePopover: 'Close popover',
  dashboard: 'Dashboard',
  reports: 'Reports',
  settings: 'Settings',
  teamRequests: 'Team requests',
  apiRateLimit: 'API rate limit',
  requestsResetInfo: 'Requests reset every hour based on your plan.',
  playground: {
    trigger: 'Open popover',
    title: 'Header Title',
    body: 'This popover uses Veli popover tokens and enter/exit animations. Adjust intent, placement, and arrow in the controls.',
    label: 'Label',
    previous: 'Previous',
    next: 'Next',
  },
  onboardingTip: {
    trigger: 'Analytics',
    title: 'Analytics is here',
    body: 'Track trends, compare periods, and export insights — all from the new Analytics tab.',
    confirm: 'Got it',
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
  contextualHelp: {
    triggerAriaLabel: 'Learn more about rate limits',
    title: 'Rate limits',
    body: 'Free plans include 1,000 requests per hour. Upgrade to Pro for 10,000 requests and burst capacity for traffic spikes.',
    viewPlans: 'View plans',
  },
} as const;

const dhivehiPopoverText = {
  closePopover: 'ޕޮޕްއޯވަރ ބަންދުކުރައްވާ',
  dashboard: 'ޑޭޝްބޯޑް',
  reports: 'ރިޕޯޓުތައް',
  settings: 'ސެޓިންގްސް',
  teamRequests: 'ޓީމުގެ ރިކުއެސްޓްތައް',
  apiRateLimit: 'އޭޕީއައި ރޭޓް ލިމިޓް',
  requestsResetInfo: 'ޕްލޭނަށް ބިނާކޮށް ކޮންމެ ގަޑިއިރަކު ރިކުއެސްޓްތައް ރީސެޓްވާނެއެވެ.',
  playground: {
    trigger: 'ޕޮޕްއޯވަރ ހުޅުވާ',
    title: 'ހެޑަރ ޓައިޓަލް',
    body: 'މި ޕޮޕްއޯވަރ ބޭނުންކުރަނީ ވެލި ޕޮޕްއޯވަރ ޓޯކަންތަކާއި އެންޓަރ/އެގްޒިޓް އެނިމޭޝަންސްއެވެ. ކޮންޓްރޯލްސް އިން އިންޓެންޓް، ޕްލޭސްމަންޓް އަދި އެރޯ ބަދަލުކުރައްވާ.',
    label: 'ލޭބަލް',
    previous: 'ފަހަތަށް',
    next: 'ކުރިއަށް',
  },
  onboardingTip: {
    trigger: 'އެނަލިޓިކްސް',
    title: 'އެނަލިޓިކްސް މިހާރު ލިބޭނެ',
    body: 'ޓްރެންޑްސް ޓްރެކްކޮށް، މުއްދަތުތައް އަޅާކިޔާ، އަދި އިންސައިޓްސް އެކްސްޕޯޓް ކުރައްވާ — މި ހުރިހާ ކަމެއް އައު އެނަލިޓިކްސް ޓެބުން ކުރެވޭނެއެވެ.',
    confirm: 'އެނގިއްޖެ',
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
  contextualHelp: {
    triggerAriaLabel: 'ރޭޓް ލިމިޓްތަކާ ބެހޭގޮތުން އިތުރަށް ހޯދާ',
    title: 'ރޭޓް ލިމިޓްތައް',
    body: 'ހިލޭ ޕްލޭންތަކުގައި ގަޑިއިރަކު 1,000 ރިކުއެސްޓް ހިމެނެއެވެ. 10,000 ރިކުއެސްޓާއި ޓްރެފިކް ސްޕައިކްތަކަށް ބަރސްޓް ކެޕޭސިޓީ ހޯދުމަށް ޕްރޯއަށް އަޕްގްރޭޑް ކުރައްވާ.',
    viewPlans: 'ޕްލޭންތައް ބައްލަވާލައްވާ',
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
              icon={<User size={16} aria-hidden />}
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
      <span className="text-center text-[10px] font-medium uppercase tracking-wide text-text-default-muted">
        {label}
      </span>
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

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-16 bg-bg-surface-base p-8">
      <p className="type-body-sm-regular text-text-default-muted">
        Click <strong className="text-text-default-default">Open</strong> on any anchor to preview
        that position. Only one popover is shown at a time.
      </p>
      {POPOVER_INTENTS.map((intent) => (
        <section key={intent} className="flex flex-col gap-8">
          <h2 className="type-title-2-bold capitalize text-text-default-high-contrast">{intent}</h2>
          <div className="flex flex-col gap-10">
            {POPOVER_POSITION_ROWS.map((row, rowIndex) => (
              <div
                key={`${intent}-row-${rowIndex}`}
                className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:grid-cols-5"
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
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Floating panel anchored to a trigger, styled with Veli popover tokens and exposed through the Veli UI API. Use with `PopoverTrigger`, `PopoverDialog`, and optional `PopoverHeader`, `PopoverContent`, and `PopoverFooter` for focus management and accessibility.',
      },
    },
  },
  argTypes: {
    showArrow: {
      control: 'boolean',
    },
    intent: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    placement: {
      control: 'select',
      options: [...POPOVER_PLACEMENTS],
    },
  },
  args: {
    showArrow: true,
    intent: 'tertiary',
    placement: 'top',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const { intent: storyIntent, ...popoverArgs } = args as PopoverStoryArgs;
    const intent: PopoverIntent = storyIntent ?? 'tertiary';
    const text = usePopoverText();

    return (
      <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-base p-8">
        <PopoverTrigger>
          <Button intent="secondary">{text.playground.trigger}</Button>
          <Popover {...popoverArgs} intent={intent} className="w-[274px]">
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title={text.playground.title}
                    icon={<User aria-hidden />}
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
};

/**
 * Full variant matrix from Figma: Primary, Secondary, and Tertiary intents across all
 * position options, including the arrow-disabled state.
 */
export const Variants: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => <PopoverVariantsMatrix />,
};

export const OnboardingTip: Story = {
  name: 'Onboarding tip',
  render: () => {
    const text = usePopoverText();

    return (
      <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-base p-8">
        <div className="flex items-center gap-2 rounded-xl border border-border-default-subtle bg-bg-surface-raised p-2 shadow-sm">
          <Button intent="secondary" appearance="ghost" size="sm">
            {text.dashboard}
          </Button>
          <Button intent="secondary" appearance="ghost" size="sm">
            {text.reports}
          </Button>
          <PopoverTrigger>
            <Button intent="primary" size="sm">
              {text.onboardingTip.trigger}
            </Button>
            <Popover intent="primary" placement="bottom" className="w-[280px]">
              <PopoverDialog>
                {({ close }) => (
                  <>
                    <PopoverHeader
                      title={text.onboardingTip.title}
                      icon={<Sparkle size={16} aria-hidden />}
                      onClose={close}
                      closeButtonLabel={text.closePopover}
                    />
                    <PopoverContent>
                      <p className="type-body-sm-regular">{text.onboardingTip.body}</p>
                    </PopoverContent>
                    <PopoverFooter>
                      <Button intent="secondary" size="xs" onPress={close}>
                        {text.onboardingTip.confirm}
                      </Button>
                    </PopoverFooter>
                  </>
                )}
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
          <Button intent="secondary" appearance="ghost" size="sm">
            {text.settings}
          </Button>
        </div>
      </div>
    );
  },
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
    <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-base p-8">
      <div className="flex w-full max-w-md items-center justify-between rounded-xl gap-3 border border-border-default-subtle bg-bg-surface-raised px-4 py-3">
        <p className="type-body-sm-medium text-text-default-strong">{text.teamRequests}</p>
        <PopoverTrigger>
          <Button intent="secondary" size="sm" aria-label={text.filterPanel.triggerAriaLabel}>
            <Funnel size={16} aria-hidden />
            {text.filterPanel.trigger}
            {activeCount > 0 ? (
              <Badge counter appearance="emphasis" intent="pink" size="sm" count={activeCount} />
            ) : null}
          </Button>
          <Popover intent="tertiary" placement="bottom end" className="w-[260px]">
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title={text.filterPanel.title}
                    icon={<Funnel size={16} aria-hidden />}
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

export const ContextualHelp: Story = {
  name: 'Contextual help',
  render: () => {
    const text = usePopoverText();

    return (
      <div className="flex min-h-[320px] items-center justify-center bg-bg-surface-base p-8">
        <div className="w-full max-w-sm rounded-xl border border-border-default-subtle bg-bg-surface-raised p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="type-body-sm-medium text-text-default-strong">{text.apiRateLimit}</p>
              <p className="type-caption-regular text-text-default-muted">
                {text.requestsResetInfo}
              </p>
            </div>
            <PopoverTrigger>
              <Button
                intent="secondary"
                appearance="ghost"
                size="xs"
                iconOnly
                aria-label={text.contextualHelp.triggerAriaLabel}
              >
                <Info size={16} aria-hidden />
              </Button>
              <Popover intent="secondary" placement="left top" className="w-[260px]">
                <PopoverDialog>
                  {({ close }) => (
                    <>
                      <PopoverHeader
                        title={text.contextualHelp.title}
                        icon={<Info size={16} aria-hidden />}
                        onClose={close}
                        closeButtonLabel={text.closePopover}
                      />
                      <PopoverContent>
                        <p className="type-body-sm-regular">{text.contextualHelp.body}</p>
                      </PopoverContent>
                      <PopoverFooter>
                        <Button intent="primary" size="xs" onPress={close}>
                          {text.contextualHelp.viewPlans}
                        </Button>
                      </PopoverFooter>
                    </>
                  )}
                </PopoverDialog>
              </Popover>
            </PopoverTrigger>
          </div>
        </div>
      </div>
    );
  },
};
