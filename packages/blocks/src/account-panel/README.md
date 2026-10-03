## Ownership and prerequisites

A profile card and account list in an anchored desktop dialog or mobile modal bottom sheet. This experimental block is portable, editable React source. The hosting application supplies identity data, selected account, translations, callbacks, and action state. It owns authentication, fetching, filtering, authorization, routing, persistence, analytics, and every network side effect.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and primitives. Use React 19 and Tailwind 4, and wrap the application in `VeliProvider` with its language and color scheme. See the [provider guide](/docs/provider/) for document direction and theme initialization. The tested dependency versions appear below.

## Installation

Configure access to Veli's restricted npm packages through your existing setup; keep credentials outside committed files. Initialize Blocks once, using your team's Veli Web URL, then install:

```sh
corepack pnpm dlx @tradenetcorp/veli init
corepack pnpm dlx @tradenetcorp/veli add account-panel
```

The CLI checks dependencies and copies `account-panel.tsx` into your configured Blocks directory. Import `AccountPanel` and its types directly from that working copy. Commit both the source and `.veli/blocks/account-panel/`, which retains the original source and receipt for updates.

Your stylesheet must import Tailwind and the Veli token and UI themes:

```css
@import 'tailwindcss';
@import '@tradenetcorp/veli-tokens/tailwind';
@import '@tradenetcorp/veli-ui/tailwind';
```

If the copied directory is outside Tailwind's automatically scanned tree, add an `@source` path relative to your stylesheet.

## API

`AccountPanel` is controlled. Supply `selectedAccount`, `labels`, `isOpen`, `onOpenChange`, and `signOut`. All visible and assistive copy comes from the host; there are no built-in product translations.

| Prop                          | Contract                                                                                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectedAccount`             | `AccountPanelAccount` for the profile and avatar trigger. The host updates it after selection succeeds.                                                                                                          |
| `accountGroups`               | Ordered `{ id, label?, accounts }` groups. Empty groups are omitted and nonempty groups have separators. The host filters accounts, excludes the selected account, and supplies stable unique group/account IDs. |
| `onAccountSelect`             | Optional `(id: string) => void`. When omitted, rows are display-only list items.                                                                                                                                 |
| `labels`                      | Required localized `trigger`, `dialog`, `close`, `otherAccounts`, `loading`, `pending`, and `disabled` strings.                                                                                                  |
| `isOpen`, `onOpenChange`      | Required overlay state and change callback. Actions do not automatically close the panel. The host can close it on navigation or successful completion.                                                          |
| `isDisabled`                  | Disables the avatar trigger, for example while another shell overlay is active.                                                                                                                                  |
| `isLoading`, `error`          | Announced loading/error presentation. Existing accounts remain visible; loading and failed empty results suppress the delegation empty state.                                                                    |
| `signOut`                     | Required `AccountPanelAction`; the host owns logout and session-cache updates.                                                                                                                                   |
| `accountManagement`           | Optional action, displayed regardless of the additional-account count.                                                                                                                                           |
| `emptyState`                  | Optional `{ title, description?, action? }`, displayed only when there are no additional accounts and no loading/error.                                                                                          |
| `appearance`                  | Optional desktop-only `{ label, value, options, onChange, isDisabled? }`; options have `{ id, label, icon?, isDisabled? }`. Values and translated labels are host-owned.                                         |
| `className`, `panelClassName` | Customize the trigger wrapper and overlay surface. Preserve focus indicators, readable contrast, scrolling, and responsive constraints.                                                                          |

`AccountPanelAccount` requires `id` and `displayName`. Optional presentation fields are `secondaryText`, `avatar: { src?, initials? }`, `badge`, `badgeIntent`, `lang`, and `dir` (`ltr`, `rtl`, `auto`). The default badge intent is `info`; the host can choose another public Veli Badge intent, such as `neutral` for a delegated-user badge. Content defaults to automatic text direction. The avatar falls back from a failed image to initials, using Veli Avatar's locale-aware formatting. Supply initials when the host needs a specific abbreviation.

Accounts and actions accept `isPending`, `isDisabled`, and localized `error`. Pending actions show a spinner and text and prevent duplicate invocation; disabled actions show explanatory text. Errors are announced and associated with their action. An action requires `label` and `onPress: () => void`.

Callbacks are notifications, not promise handlers. Handle rejection, pending state, retries, selected-account updates, and navigation in your adapter. Clear errors in the host when appropriate. The block never infers business rules or updates identity records.

## Host adapter pattern

The executable example below maps generic identity records to display data and keeps asynchronous operations in the application adapter. Its English labels are demonstration content; translate them in production.

For govmv-web, keep `useFrontendSession`, tenant filtering, and `useCopy` in the application. Map `tenant_uuid` to `id`, `tenant_name` to `displayName`, `tenant_photo` to `avatar.src`, and the appropriate translated subtitle to `secondaryText`. Map the current tenant to `selectedAccount`; supply the translated primary-user badge only when it matches the primary person. Build ordered personal/business groups in the adapter using the existing filtering policy; Veli sees only generic groups.

Wire the existing `session.selectTenant` through `onAccountSelect`. If switching is unavailable in another host, omit the callback. Keep `logoutSession(markSessionSignedOut)` in the sign-out callback. The host resolves the configured delegation/account URL and opens it from the empty-state action; the block accepts no service-specific URL or navigation policy. Map theme preference to `appearance.value` and wire the app's preference setter to `onChange`. The mobile navigation's external theme control stays app-owned.

Mount this block only in the signed-in branch of the header adapter. Preserve the existing signed-out sign-in control and loading/likely-signed-in placeholders outside it. Coordinate `isOpen` and trigger disabling with the rest of the shell. Govmv-web adoption and real identity regression tests are tracked separately in PD-988.

## Accessibility and responsive behavior

The default Tailwind `sm` boundary is 640 CSS pixels. At and above it, the panel is 389px wide (constrained by the available viewport) and uses Veli Popover's default React Aria focus containment and outside dismissal. Below it, a portalled Veli Modal provides a bottom sheet, contained focus, background scroll protection, and scrim dismissal. Supply optional 16px appearance icons from your host icon library. The desktop appearance selector is omitted from the mobile layout.

The trigger exposes its dialog state and localized accessible name. Escape, outside/scrim press, and mobile grabber drag dismiss through `onOpenChange`; keyboard users also have a mobile close button. Focus returns to the trigger. Changing between mobile and desktop closes an open panel; the trigger and its avatar remain mounted. Closed overlays are removed from the keyboard and accessibility trees.

Drag starts only on the grabber. A downward drag exceeding 35% of sheet height, or more than 40 pixels at over 0.11 pixels/ms, dismisses it. Cancelled gestures reset without dismissing. Scrollable accounts and pinned sign-out remain independently usable. The sheet respects safe areas and a maximum height of 85svh; desktop content is constrained to the viewport.

Names and secondary text truncate visually while retaining their full accessible text. Host-provided language/direction metadata and logical layout support mixed English/LTR and Dhivehi/RTL. Loading, pending, disabled, and error meanings include text rather than relying on color. Motion respects reduced-motion preferences. Keep the default `sm` breakpoint when adopting, or update both the media query and responsive utilities in your copy.

Validate your surrounding header, routes, translations, fonts, screen readers and devices during adoption. Automated consumer checks cover keyboard/focus, dismissal, gestures, hydration, reflow, RTL, themes and reduced motion.

## Customization and updates

Edit your installed source and adapter to fit the host. Keep authentication and routing outside the reusable presentation. Send reusable interaction fixes upstream.

1. Run `veli status` and read the new changelog and dependency requirements.
2. Run `veli update account-panel` for a three-way merge against the saved original.
3. Resolve labelled conflicts and run `veli update --continue account-panel`, or `veli update --abort account-panel` to restore your copy.
4. Re-run application validation and commit the working source and updated `.veli` baseline together.

Receipts contain source commit and SHA-256 hashes. A `dirty` receipt identifies a local preview rather than a released source snapshot. Updating a Veli npm package does not update copied block source.

## Non-goals

The block does not discover sessions, sign users in, call an identity provider, implement account switching or logout, filter/authorize tenants, navigate, persist preferences, or send analytics. It contains no govmv-web, OneGov, Ory, Next.js, environment-variable or service-client imports. It introduces no registry, CLI capability, or npm package.

## Visual references

The account-panel presentation follows the supplied gov.mv Figma specs: [desktop panel](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21044), [desktop account states](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21192), [desktop without delegated accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21274), [mobile accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1424-27102), and [mobile without delegated accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1424-27283). Profile photos and organization imagery remain host data. The mobile close control becomes visible on keyboard focus, preserving the compact pointer layout while offering a named dismissal action.
