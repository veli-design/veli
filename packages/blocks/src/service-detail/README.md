Experimental `0.8.0` copied-source block for service details, fees, prerequisites,
application options and guidelines. The props-based default preserves the existing
summary/card and guideline sheet. Composable parts let consumers arrange their own
fields, sections and actions. This block does not migrate either app.

## Core package baseline

Version 0.8.0 targets Veli React 0.18.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Installation

After a compatible catalog release, use `corepack pnpm dlx @veli-design/cli add
service-detail`. This local branch is unpublished. Import `ServiceDetail` from
`./components/blocks/service-detail/service-detail`; its CSS is imported by the source.
Keep all manifest files together. Decorative icons use the declared
`@phosphor-icons/react` dependency; no separate SVG files are required. Configure
Veli tokens/UI, Tailwind and its source scanning as for the other blocks. Load your
English and Dhivehi fonts. Import Veli token CSS globally before application CSS.
Register the full MV A Waheed character coverage, including digits and punctuation,
so localized values use its Figma glyphs rather than larger fallback numerals.

## Default or composed

Keep `<ServiceDetail {...existingProps} />` for the standard page. Its props and
exported data types remain supported; no consumer migration is required for this
refactor. The wrapper uses the same public parts shown below. Import parts from
that same copied `service-detail` entry, which also loads the existing styles.

```tsx
import {
  ServiceDetailRoot,
  ServiceDetailHeader,
  ServiceDetailCard,
  ServiceDetailContent,
  ServiceDetailSummary,
  ServiceDetailSummaryItem,
  ServiceDetailActions,
  ServiceDetailSection,
} from './components/blocks/service-detail/service-detail';

<ServiceDetailRoot>
  <ServiceDetailHeader title={title} description={description} />
  <ServiceDetailCard>
    <ServiceDetailSummary label="Service summary">
      <ServiceDetailSummaryItem label="Available places">
        <AvailabilityIndicator available={12} />
      </ServiceDetailSummaryItem>
      <ServiceDetailSummaryItem label="Processing time" icon={<ClockIcon />}>
        3 working days
      </ServiceDetailSummaryItem>
    </ServiceDetailSummary>
    <ServiceDetailContent>
      <ServiceDetailSection title="Before you start">{consumerContent}</ServiceDetailSection>
      <ServiceDetailActions label="Apply">
        <Button onPress={startApplication}>Apply online</Button>
        <Link href="/appointments">Book an appointment</Link>
      </ServiceDetailActions>
    </ServiceDetailContent>
  </ServiceDetailCard>
</ServiceDetailRoot>;
```

Use one `ServiceDetailContent` for the continuous raised surface below the summary.
It owns the background, padding and rounding. Sections and action groups provide
content and spacing inside it, so reordering them does not create stacked cards.

Composition follows DOM order. Supply headings in the correct order using
`headingLevel` on Header (default 1), Section (2), and Download (3). Root owns the
responsive grid and typography, not a `<main>` landmark. There is no service-model
context or implicit action handling. Tailwind source scanning must include the
copied files, as with other Veli blocks; new layout utilities use Veli's tokens.

| Part                                     | Props and content                                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ServiceDetailRoot`, `ServiceDetailCard` | `children`, `id?`, `className?`.                                                                                                                                                                                     |
| `ServiceDetailHeader`                    | `title`, inline `description?` and `provider?`, `headingLevel?`; children add badges/status or other content.                                                                                                        |
| `ServiceDetailSummary`                   | Accessible `label`, optional `variant` (`default` or `compact`); children render SummaryItems, including maps and fragments.                                                                                         |
| `ServiceDetailSummaryItem`               | `label`, decorative `icon?`, `information?: { label, content }`, `span?: 'single' \| 'full'`, `startRow?`; children supply the value.                                                                                |
| `ServiceDetailContent`                   | `children`, `id?`, `className?`; one shared raised surface for sections, actions, notices and downloads.                                                                                                             |
| `ServiceDetailActions`                   | Accessible `label`, children for branding and actions. Place inside Content.                                                                                                                                         |
| `ServiceDetailSection`                   | `title`, `headingLevel?`, children. Place inside Content; no separate background or rounding.                                                                                                                        |
| `ServiceDetailDownload`                  | `title`, inline `metadata?`, `headingLevel?`, `hideTitle?` (false); children supply actions and optional guidelines.                                                                                                 |
| `ServiceDetailGuideline`                 | `guideline`, `labels: ServiceDetailGuidelineLabels`, `isOpen?`, `defaultOpen?`, `onOpenChange?`, `dialogClassName?`, `overlayClassName?`.                                                                            |
| `ServiceDetailApplyingInformation`       | `title`, non-interactive inline `trigger`, `closeLabel`, arbitrary dialog children, `dialogClassName?`, `overlayClassName?`. The part provides the trigger button, information icon, named dialog and close control. |

Layout parts also accept `id` and `className`. Optional information content remains
non-interactive for tooltip compatibility. Custom summary children may contain
controls: the part never silently wraps them in a button.

For an expandable item, provide `disclosure` with either:

- `{ triggerStyle: 'value', value: '3 working days', content: <Breakdown /> }`:
  value and caret form the trigger; omit children. The value is a string to avoid
  nesting interactive controls inside the trigger.
- `{ triggerStyle: 'text', showLabel: 'Show details', hideLabel: 'Hide details',
content: <Breakdown /> }`: children remain the summary value alongside a separate
  text-and-caret trigger.

Each disclosure starts collapsed and owns its state. Omit `disclosure` when there
are no details. Its content can be a description list, rich text or consumer UI;
Veli does not inspect it. Strings retain mixed-script isolation; consumer elements
own their own language/direction semantics. `ServiceDetailGuideline` keeps the
existing document/TOC, summary and copy-link contract, with only its own labels
required. Existing full label dictionaries also work.

See `examples/service-detail-composition.tsx` and Storybook **Custom Composition**
for arbitrary fields, a custom control, reordered sections, downloads and dialog
content. The web demo's **Custom composition** option runs the same example.

## Content and actions

`ServiceDetailProps` in `types.ts` is the full typed contract. Supply `title`, `apply`
and all `labels`. Optional `provider`, `metadata`, `services`, `prerequisites` and
`guideline` omit unavailable groups. Supply explicit localized missing-value text
when the product needs placeholders; the block invents no metadata or destinations.
Fees are formatted display values; it does not calculate amounts or currencies.
Service names wrap when no expansion action is needed; expandable lists retain the
collapsed Figma treatment and reveal all names on expansion, including long words.
This is a page-level block: it renders `title` as the page's `<h1>` and owns its
internal heading levels. The host supplies the surrounding `<main>` landmark and
should not add a second page title above the block.

`apply.mode` is `online`, `mixed`, `external` or `manual`. Online/mixed/external
accept an optional action. Each action has an ID, visible label and either a URL,
callback, or `isDisabled: true`; a disabled reason is rendered and associated.
`appearance` selects the supported Veli Button appearance; use `transparent` for
a secondary download. Optional `trailingIcon` is decorative caller-owned content,
such as an external-platform arrow. `target`, `rel` and `renderLink` are caller choices. Use Veli's router provider or
`renderLink` for framework links. No route, external-window policy, authentication,
tracking capability, workflow promises or storage is inferred from the mode.
Platform branding is a caller-owned React node. `information` supplies the exact
applying dialog title and ordered steps; `notice` supplies approved alert copy.
The platform trigger takes its accessible name from its visible apply/platform
label; `information.title` supplies the additional accessible description.

Manual `forms` are individual downloadable forms with titles, optional file
metadata, action and per-form guideline. Download-all and submission contacts are
host actions/content. External services do not accept forms. Govmv's inspected
Document relation has no per-form guideline field: its adapter must leave it absent
until authoritative content exists. No CMS migration is included. No claim is made
that all g-services workflows are resolved.

## Guidelines, summaries and routing

Supply `guideline.content.sections` with unique stable IDs, optional section titles
and rendered bodies, or `content.body` for one rendered document without a TOC.
The host renders/sanitizes Lexical/Tiptap/HTML; no editor, CMS or parser is included.
Do not repeat a section's supplied title in its body. Rich content uses scoped prose
styles; adapters must verify their renderer classes in real applications.
Section headings have a 16px body gap. Set `headingSpacing: 'compact'` on an
introductory section to use the designed 12px gap, without matching its text or ID.
`updatedText` is already formatted/localized. Optional `summary` accepts content,
pending/error state and an `onRequest` callback; hosts fetch and parse summaries.
Optional `onCopyLink` owns URL creation and clipboard access. Rejection announces
the supplied failure label. Veli never accesses location, history or clipboard.
Known-empty documents (empty sections, null/boolean/whitespace bodies, empty arrays
or fragments) use `guidelineUnavailable` without opening a blank sheet. Sections
with known-empty bodies are omitted from the document and TOC. A summary with no
content, pending/error state or request callback has no summary action. Requestable
summaries show `summaryPending` until the host supplies content or an error. Numeric
zero is valid content. Opaque host components/renderers must normalize their own
empty output; the block does not execute or inspect them.

Use `isGuidelineOpen`/`onGuidelineOpenChange` to connect hash/Back behavior in the
host, or `defaultGuidelineOpen` for local state. Each opening resets TOC, summary
and copy state. TOC selections remain active at terminal sections until manual
wheel/touch/pointer/scroll-key input resumes position tracking. No trailing spacer
is added to force the final heading to the top.
Manual scrolling at the native end selects the last section, including input that
does not change the scroll position because the boundary is already reached.
Below 768px, the 48px-inset sheet uses the floating TOC button and dismissible panel
from Figma 8118:6055/6887. Choosing a link closes the panel; Escape closes the panel
before the sheet. Hosts supply its localized name through `guidelineContents`.

## Providers, styling and accessibility

Use `VeliProvider` for EN/DV, direction and theme; app-owned translations are
mandatory. No consumer-specific provider/backend is needed. Portals receive Veli
language, direction, resolved theme and a dark class. The scroll viewport stays LTR
for a physical-right native scrollbar while content follows the provider direction.
The header and desktop TOC stay stationary. CSS uses only `veli-service-detail-` selectors and
keyframes. `className`, `dialogClassName` and `overlayClassName` scope host overrides.
The host controls fonts, theme persistence, locale routing and safe-area shells.

React Aria owns focus trapping/return, Escape/outside dismissal and scroll lock.
Dialog contents mount on the client, including an initially open guideline; closed
summary content renders on the server.
The guideline-only authored motion is 450ms enter/350ms exit with
`cubic-bezier(.65,0,.35,1)`, full-height travel and reduced-motion fade only. These
are approved feature constants, not canonical Veli motion tokens. Applying motion
remains separate. Native scrollbar appearance belongs to browser/OS.

## Consumer boundary and limitations

Web2 keeps fetching/model mapping, Next routes, draft/session/auth guards, Tiptap,
clipboard/hash policy and assets. Govmv keeps CMS-first/OneGov resolution,
tenancy/drafts, Lexical/Tiptap, locale dictionaries, document resolution, submission
contacts and its summary worker. A small client adapter supplies callbacks from
server-fetched display data; functions are not serialized across an RSC boundary.
Do not pass API/auth/CMS models into the block.

This experimental contract targets Veli React 0.18 and tokens 0.11. Earlier core minor
lines retain their previously published block archives; migrating an application
to this baseline requires consumer testing.
The deferred C1 hydration/useId issue remains unresolved and is outside this task.
Ordinary fixture SSR checks do not establish its resolution. The user reopened the
mobile guideline comparison with updated frames 8118:6055/6887; those now define
the mobile sheet and TOC. The existing mobile service-card frames were also checked.
D1–D9 design/content qualifications from the extraction plan remain open, including
scrims, fixed measurements, missing state/dark references and production content.
No production migrations, submissions, downloads, summary calls or publication.

## Examples and validation

See `examples/service-detail-next.tsx` for a client adapter and
`examples/service-detail-content.tsx` for disposable EN/DV display fixtures.
The docs demo and Storybook use this canonical source, fictional service data and
local feedback callbacks. They do not navigate to submission sites or download forms.
Storybook covers all four apply types and the four combinations of fees/services
expansion; the web demo exposes the apply types in its service-example selector. Release/test evidence and
exact versions are recorded in the local PD-1149 implementation report; manifest
`testedDependencies` lists only versions actually exercised.

### Supplementary-service summaries

Keep existing `metadata.applicationTime`, `processingTime`, `feeSummary`, `fees`, and
`labels` inputs. Optionally pass `summaryOptions.applicationTime` and
`summaryOptions.processingTime` with `details: [{ id, label, value }]`.
Each non-empty list gets an independent, initially collapsed caret control. Fees
use their existing text trigger and now expand directly beneath the fee value.
Empty lists show only the summary. Time details require the corresponding summary
value. Lists have one level; IDs must be unique within each list.

All five summary fields accept `summaryOptions[field].icon` (a decorative React
node; `null` removes the icon) and `.information: { label, content }`. The label
names the information button; use a localized, descriptive phrase. Information
content must be non-interactive. The large secondary Veli tooltip opens on hover
or keyboard focus and is associated through `aria-describedby`. Clicking, tapping,
or pressing Enter/Space opens a compact, named Veli popover with the same content
and appearance instead. React Aria manages popover focus, Escape/outside dismissal
and focus return. The hover tooltip is disabled while the popover is open. Existing
dialog overrides continue to apply only to the applying-information and guideline
surfaces.

See `serviceDetailSummaryOptions` in the shared examples and the Supplementary
Service Summaries story for EN/DV examples. Consumers own translations, fetching,
CMS mappings, fee/time formatting and summary calculations. Mobile uses the
existing single-column layout; this is an implementation choice, not an approved
mobile design. No govmv-web or Web2 integration is included in this repository.

The Desktop English Figma Reference story uses the exact summary sample from
Figma 9224:74489 for visual review. It does not assert parity for the surrounding
page, mobile, or Dhivehi, for which this reference supplies no matching design.
The collapsed fee action reads “Show fees” per the confirmed product decision,
correcting the reference's inconsistent “Hide fees” label in collapsed states.

### Guideline summary state

The host owns summary fetching and updates `guideline.summary` after `onRequest`.
The callback is a request notification; the block does not await it or catch request
errors. Handle those in the consumer and update the props.

Display precedence is loading (`isPending`), then a non-blank `error`, then
`content`. Loading hides stale errors/content; errors hide stale content. A
requestable summary without content or an error shows the loading placeholder
until the host supplies a result. Only the loading state sets `aria-busy`.

## Supplementary guideline integration

Keep the existing wrapper for its standard page, or compose the exported parts
without changing the copied source. These parts are imported from
`./components/blocks/service-detail/service-detail`, not from `@veli-design/react`.
Continue using the public Veli UI/token packages and the installation steps above.
The 0.8.0 block remains unreleased until its catalog is published.

`ServiceDetailSummary` accepts `variant="compact"` for a standalone tinted
metadata card inside a guideline. It uses the same SummaryItems, with 16px vertical
and 24px horizontal padding and a 16px radius. The default page summary is unchanged.
Do not wrap the compact summary in another ServiceDetailCard.

```tsx
const fields = [
  {
    id: 'fee',
    label: labels.fees,
    value: formattedFee,
    icon: <HandCoinsIcon weight="fill" className="veli-service-detail-meta-art" />,
  },
  {
    id: 'processing',
    label: labels.processingTime,
    value: formattedProcessingTime,
    icon: <HourglassMediumIcon weight="fill" className="veli-service-detail-meta-art" />,
  },
].filter((field) => field.value != null);

const metadata = fields.length ? (
  <ServiceDetailSummary variant="compact" label={supplementaryTitle}>
    {fields.map((field) => (
      <ServiceDetailSummaryItem
        key={field.id}
        label={field.label}
        icon={field.icon}
        span={fields.length === 1 ? 'full' : 'single'}
      >
        {field.value}
      </ServiceDetailSummaryItem>
    ))}
  </ServiceDetailSummary>
) : null;
```

The host supplies localized, already formatted values; missing data is `null` or
`undefined`, not inferred as Free or Instant. Keep explicit zero values. One value
uses the full row; two values share desktop columns and stack below 768px. The
single-value/mobile arrangement is an implementation convention, not a separately
approved Figma frame. The desktop reference is Figma `6607:116507`.

Build `guideline.content.sections` in the desired order:

1. Preparation/checklist, preserving existing core preparation content.
2. A generated supplementary fees table.
3. Remaining core sections in authored order.
4. Each supplementary section: set its `title`, then put `metadata` before its
   guideline body. Do not repeat the title in the body.

The sheet and TOC preserve this supplied order; known-empty sections are omitted,
untitled sections do not create TOC entries, and `content.body` has no generated TOC.
Use stable section IDs, not translated heading text, when adapting CMS content.
Veli does not group, deduplicate, fetch or calculate content. The consumer owns
filtering unfinished draft checklist rows and any CMS item limits or migrations.

The default `prerequisites` string array preserves newlines within each item.
For a consumer-rendered checklist inside the sheet, use
`<ul className="veli-service-detail-prerequisites">` with one `<li>` per item, or
provide your own equivalent multiline styling. Newlines do not create extra items.

See the shared Custom Composition example for the complete ordered sheet and
zero/one/two-value cards, with EN/DV placeholder copy. Use Storybook's language and
theme controls and narrow viewport to review RTL, dark and mobile presentation.
Dhivehi copy still needs translation review. No govmv or Web2 app migration is
performed by this block change.
