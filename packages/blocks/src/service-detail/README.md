Experimental `0.4.0` copied-source block for service details, fees, prerequisites,
application options and guidelines. The default and only presentation preserves
Web2's approved summary/card and guideline sheet. A separate govmv article/sidebar
presentation requires product approval; this block does not migrate either app.

## Core package baseline

Version 0.4.0 targets Veli UI 0.17.x and tokens 0.10.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Installation

After an approved catalog release, use `corepack pnpm dlx @tradenetcorp/veli add
service-detail`. This local branch is unpublished. Import `ServiceDetail` from
`./components/blocks/service-detail/service-detail`; its CSS is imported by the source.
Keep all manifest files together, including the six relative SVG masks. Configure
Veli tokens/UI, Tailwind and its source scanning as for the other blocks. Load your
English and Dhivehi fonts. Import Veli token CSS globally before application CSS.
Register the full MV A Waheed character coverage, including digits and punctuation,
so localized values use its Figma glyphs rather than larger fallback numerals.

## Content and actions

`ServiceDetailProps` in `types.ts` is the full typed contract. Supply `title`, `apply`
and all `labels`. Optional `provider`, `metadata`, `services`, `prerequisites` and
`guideline` omit unavailable groups. Supply explicit localized missing-value text
when the product needs placeholders; the block invents no metadata or destinations.
Fees are formatted display values; it does not calculate amounts or currencies.
Service names wrap when no expansion action is needed; expandable lists retain the
collapsed Figma treatment and reveal all names on expansion, including long words.
The host owns its main landmark and service page heading hierarchy.

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

This experimental contract targets Veli UI 0.17 and tokens 0.10. Earlier core minor
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
