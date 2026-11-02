// One contract table drives coverage, upstream configuration and boundary review.
// Every styling finding warns; the core also checks arbitrary values/shorthand.
export const marginClasses = [
  'm-*',
  'mx-*',
  'my-*',
  'mt-*',
  'mr-*',
  'mb-*',
  'ml-*',
  'ms-*',
  'me-*',
];
export const fillClasses = ['w-full', 'min-w-0'];
// Upstream no-arbitrary-values checks bracket syntax, but misses Tailwind v4's
// CSS-variable shorthand. Deny it through the existing core class contracts.
export const coreDeniedClasses = ['*-(*)'];
export const buttonClasses = [
  ...marginClasses,
  ...fillClasses,
  'self-start',
  'self-center',
  'self-end',
  'self-auto',
  'justify-self-start',
  'justify-self-center',
  'justify-self-end',
  'justify-self-auto',
  'order-*',
];
const contentClasses = [
  ...fillClasses,
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'flex-row',
  'flex-row-reverse',
  'flex-col',
  'flex-col-reverse',
  'flex-wrap',
  'flex-nowrap',
  'flex-wrap-reverse',
  'gap-*',
  'gap-x-*',
  'gap-y-*',
  'grid-cols-*',
  'grid-rows-*',
  'items-start',
  'items-center',
  'items-end',
  'items-stretch',
  'items-baseline',
  'justify-start',
  'justify-center',
  'justify-end',
  'justify-between',
  'justify-around',
  'justify-evenly',
];
const contract = (module, names, allow, guidance, coverage = 'classes') => ({
  module,
  names,
  allow,
  guidance,
  coverage,
});
const completeFields = [
  ['input', 'Input'],
  ['password-input', 'PasswordInput'],
  ['otp-input', 'OTPInput'],
  ['search', 'Search'],
  ['textarea', 'TextArea'],
  ['select', 'Select'],
  ['combobox', 'ComboBox'],
  ['date-field', 'DateField'],
  ['date-picker', 'DatePicker'],
];
const closed =
  'Use supported content, behavior and appearance props; direct styling requires review.';

export const veliContracts = [
  contract(
    'button',
    ['Button'],
    buttonClasses,
    'Use size, intent and appearance. Parent gap/alignment controls outer layout; icon-only dimensions stay within Veli.',
    'classes-and-arbitrary-values',
  ),
  ...completeFields.map(([module, name]) =>
    contract(
      module,
      [name],
      fillClasses,
      'Only complete-field width may change. Put placement on a parent and preserve label/control/help/error spacing. TextArea rows/minHeight/maxHeight remain supported.',
      'classes-and-arbitrary-values',
    ),
  ),
  contract(
    'checkbox',
    ['Checkbox', 'CheckboxGroup'],
    fillClasses,
    'Keep control size, label spacing and states within Veli; arrange groups through surrounding layout.',
  ),
  contract(
    'radio',
    ['Radio', 'RadioGroup'],
    fillClasses,
    'Radio cards need a reviewed pattern. Keep control size, label spacing and states within Veli.',
  ),
  contract(
    'switch',
    ['Switch'],
    fillClasses,
    'Use supported size/appearance/state props and surrounding layout.',
  ),
  // Current className is on the root enclosing label, dropzone and messages.
  contract(
    'dropzone',
    ['DropzoneField'],
    fillClasses,
    'Only complete-field width may change; other layout belongs on a parent.',
  ),
  contract(
    'dropzone',
    ['Dropzone'],
    [...marginClasses, ...fillClasses],
    'Use size/orientation/progress APIs; preserve drop-area treatment.',
  ),
  contract(
    'dropzone',
    ['DropzoneList', 'DropzoneItem'],
    fillClasses,
    'Only list/item width may change; preserve previews, progress and controls.',
  ),
  contract(
    'dropzone',
    ['DropzoneTrigger', 'DropzoneClear'],
    buttonClasses,
    'Follow Button allowances; wrappers remain advisory until separately audited.',
  ),
  contract(
    'dropzone',
    [
      'DropzoneArea',
      'DropzoneItemPreview',
      'DropzoneItemMetadata',
      'DropzoneItemProgress',
      'DropzoneItemDelete',
    ],
    [],
    closed,
  ),
  contract(
    'badge',
    ['Badge'],
    [...marginClasses, 'shrink-0'],
    'Use size/intent/appearance; review badge positioning as a composition.',
  ),
  contract(
    'avatar',
    ['Avatar'],
    [...marginClasses, 'shrink-0'],
    'Use supported size, shape and content APIs.',
  ),
  contract(
    'kbd',
    ['Kbd', 'KbdGroup'],
    marginClasses,
    'Preserve key sizing and group spacing; use existing component APIs.',
  ),
  contract(
    'card',
    ['Card'],
    [...marginClasses, ...fillClasses],
    'Use spacing/elevation props for the surface and padding.',
  ),
  contract(
    'alert',
    ['Alert'],
    [...marginClasses, ...fillClasses],
    'Use intent/appearance/layout props for the surface and spacing.',
  ),
  contract(
    'card',
    ['CardContent'],
    contentClasses,
    'Arrange app-owned content; preserve Veli padding, typography and appearance.',
  ),
  contract(
    'modal',
    ['ModalContent'],
    contentClasses,
    'Arrange app-owned content; preserve Veli padding, typography and appearance.',
  ),
  contract(
    'popover',
    ['PopoverContent'],
    contentClasses,
    'Arrange app-owned content; preserve Veli padding, typography and appearance.',
  ),
  contract('card', ['CardHeader', 'CardTitle', 'CardDescription', 'CardFooter'], [], closed),
  contract('alert', ['AlertTitle', 'AlertDescription', 'AlertCloseButton'], [], closed),
  contract(
    'alert',
    ['AlertActions'],
    ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'flex-wrap'],
    'Preserve the action gap and Button styling.',
  ),
  contract(
    'modal',
    ['Modal', 'ModalHeader', 'ModalTitle', 'ModalDescription', 'ModalFooter', 'ModalCloseButton'],
    [],
    'Use Modal size/behavior/content APIs. Surface, backdrop and scrolling changes require review.',
  ),
  contract('popover', ['PopoverHeader', 'PopoverFooter'], [], closed),
  contract(
    'accordion',
    ['Accordion'],
    [...marginClasses, ...fillClasses],
    'Use supported props; arrange app-owned children inside panels.',
  ),
  contract(
    'accordion',
    ['AccordionItem', 'AccordionHeader', 'AccordionPanel'],
    [],
    'Internal trigger/panel props require their own review; root allowances do not transfer.',
  ),
  contract(
    'tabs',
    ['Tabs'],
    [...marginClasses, ...fillClasses],
    'Use supported props; internal tab styling and panel slots require separate review.',
  ),
  contract('tabs', ['TabsOverflow'], [], closed),
  contract(
    'breadcrumbs',
    ['Breadcrumbs'],
    [...marginClasses, ...fillClasses],
    'Preserve individual links, separators and controls.',
  ),
  contract('breadcrumbs', ['BreadcrumbBackLink', 'Breadcrumb', 'BreadcrumbOverflow'], [], closed),
  contract(
    'pagination',
    ['Pagination'],
    [...marginClasses, ...fillClasses],
    'Use existing APIs; alignment depends on the variant and requires review.',
  ),
  contract(
    'link',
    ['Link'],
    [],
    'Use supported props and parent layout; Link exposes neither className nor style.',
  ),
  contract(
    'calendar',
    ['Calendar', 'RangeCalendar'],
    marginClasses,
    'Preserve calendar dimensions, cells and grid styling.',
  ),
  contract('calendar', ['CalendarHeader', 'CalendarGridHeader'], [], closed),
  contract('tags', ['TagGroup'], fillClasses, 'List wrapping/gaps require separate slot review.'),
  contract(
    'tags',
    ['Tag'],
    [],
    'Use size/content/state APIs; put spacing between tags on the list.',
  ),
  contract(
    'table',
    ['Table'],
    ['w-full'],
    'className targets the inner table. Put outer layout on its container.',
  ),
  contract(
    'table',
    ['TableResizableContainer'],
    [...marginClasses, ...fillClasses],
    'Preserve frame appearance and resize behavior.',
  ),
  contract(
    'table',
    ['TableColumn', 'TableCell'],
    ['text-start', 'text-center', 'text-end', 'whitespace-normal', 'whitespace-nowrap'],
    'Use column sizing APIs and child elements for complex content; preserve padding, typography and states.',
  ),
  contract('table', ['TableHeader', 'TableBody', 'TableRow', 'TableColumnResizer'], [], closed),
  contract(
    'popover',
    ['Popover', 'PopoverDialog'],
    [],
    'Portal width/viewport/scroll constraints need explicit review; no general positioning, z-index or motion allowance.',
  ),
  contract(
    'tooltip',
    ['Tooltip'],
    [],
    'Use existing APIs. Portal sizing changes need explicit review.',
  ),
  contract(
    'menu',
    ['MenuPopover', 'Menu'],
    [],
    'Portal sizing/scroll changes need explicit review; preserve appearance, positioning and motion.',
  ),
  contract('menu', ['MenuItem', 'MenuSection', 'MenuSeparator'], [], closed),
  contract('select', ['SelectItem', 'SelectSection'], [], closed),
  contract('combobox', ['ComboBoxItem', 'ComboBoxSection'], [], closed),
  contract(
    'skeleton',
    ['Skeleton'],
    [
      'w-*',
      'min-w-*',
      'max-w-*',
      'h-*',
      'min-h-*',
      'max-h-*',
      'size-*',
      'aspect-*',
      'rounded',
      'rounded-*',
    ],
    'Match loading-content dimensions and radius, including arbitrary dimensions when needed; preserve color and animation.',
  ),
  // Orientation-dependent length cannot be expressed by upstream name contracts.
  contract(
    'divider',
    ['Divider'],
    marginClasses,
    'Length changes require orientation/interactive-variant review; preserve color and thickness.',
  ),
  contract(
    'toast',
    [
      'ToastRegion',
      'Toast',
      'ToastContent',
      'ToastActions',
      'ToastTimeoutProgress',
      'ToastCloseButton',
    ],
    [],
    'Use Toast placement/appearance/content APIs; direct styling needs review.',
  ),
];

export const contractFor = new Map(
  veliContracts.flatMap((entry) => entry.names.map((name) => [name, entry])),
);
export const coreNames = veliContracts
  .filter((entry) => entry.coverage === 'classes-and-arbitrary-values')
  .flatMap((entry) => entry.names);

export function upstreamContracts() {
  return veliContracts.map((entry) => ({
    pattern: `^(${entry.names.join('|')})$`,
    allow: entry.allow,
    ...(entry.coverage === 'classes-and-arbitrary-values' ? { deny: coreDeniedClasses } : {}),
    message: `"{{className}}" on {{component}} needs review. ${entry.guidance}`,
  }));
}
