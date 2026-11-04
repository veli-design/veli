## Core package baseline

Version 0.9.0 targets Veli React 0.19.x and tokens 0.11.x. Install the applicable new core versions
before adding or updating this application-owned source. The approved typography
metrics and subtle-button colors can change wrapping and element height. Previous
block archives retain their existing requirements.

## Ownership and prerequisites

A profile card and account list in an anchored desktop dialog or mobile modal bottom sheet. This experimental block is portable, editable React source. The hosting application supplies identity data, selected account, translations, callbacks, and action state. It owns authentication, fetching, filtering, authorization, routing, persistence, analytics, and every network side effect.

Follow the [Veli setup guide](/docs/) for package access, Tailwind, fonts and primitives. Use React 19 and Tailwind 4, and wrap the application in `VeliProvider` with its language and color scheme. See the [provider guide](/docs/provider/) for document direction and theme initialization. The tested dependency versions appear below.

## Installation

Install the public npm packages and configure the compatible Blocks registry URL. Initialize Blocks once, using the compatible Veli Web URL, then install:

```sh
corepack pnpm dlx @veli-design/cli init
corepack pnpm dlx @veli-design/cli add account-panel
```

The CLI checks dependencies and copies `account-panel.tsx` into your configured Blocks directory. Import `AccountPanel` and its types directly from that working copy. Commit both the source and `.veli/blocks/account-panel/`, which retains the original source and receipt for updates.

Your stylesheet must import Tailwind and the Veli token and UI themes:

```css
@import 'tailwindcss';
@import '@veli-design/tokens/tailwind';
@import '@veli-design/react/tailwind';
```

If the copied directory is outside Tailwind's automatically scanned tree, add an `@source` path relative to your stylesheet.

## API

`AccountPanel` is controlled. Supply `selectedAccount`, `labels`, `isOpen`, `onOpenChange`, `onAccountSelect`, and `signOut`. All visible and assistive copy comes from the host; there are no built-in product translations.

| Prop                          | Contract                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectedAccount`             | `AccountPanelAccount` for the profile and avatar trigger. The host updates it after selection succeeds.                                                                                                             |
| `accountGroups`               | Ordered `{ id, label?, accounts }` groups. Empty groups are omitted and nonempty groups have separators. The host filters accounts, excludes the selected account, and supplies stable unique group/account IDs.    |
| `onAccountSelect`             | Required `(id: string) => void`. The host performs switching and updates the selected account after success.                                                                                                        |
| `labels`                      | Required localized `trigger`, `dialog`, `close`, `otherAccounts`, `loading` and `pending` strings.                                                                                                                  |
| `isOpen`, `onOpenChange`      | Required overlay state and change callback. Actions do not automatically close the panel. The host can close it on navigation or successful completion.                                                             |
| `isDisabled`                  | Disables the avatar trigger, for example while another shell overlay is active.                                                                                                                                     |
| `isLoading`, `error`          | Announced loading/error presentation. Loading replaces additional accounts with three skeleton rows while retaining the profile and sign-out; loading and failed empty results suppress the delegation empty state. |
| `signOut`                     | Required `AccountPanelAction`; the host owns logout and session-cache updates.                                                                                                                                      |
| `accountManagement`           | Optional action, displayed regardless of the additional-account count.                                                                                                                                              |
| `emptyState`                  | Optional `{ title, description?, action? }`, displayed only when there are no additional accounts and no loading/error.                                                                                             |
| `appearance`                  | Optional desktop-only `{ label, value, options, onChange }`; options have `{ id, label, icon? }`. Values and translated labels are host-owned.                                                                      |
| `className`, `panelClassName` | Customize the trigger wrapper and overlay surface. Preserve focus indicators, readable contrast, scrolling, and responsive constraints.                                                                             |

`AccountPanelAccount` requires `id` and `displayName`. Optional presentation fields are `secondaryText`, `avatar: { src?, initials? }`, `badge`, `badgeIntent`, `lang`, and `dir` (`ltr`, `rtl`, `auto`). The default badge intent is `info`; the host can choose another public Veli Badge intent, such as `neutral` for a delegated-user badge. Content defaults to automatic text direction. The avatar falls back from a failed image to initials, using Veli Avatar's locale-aware formatting. Supply initials when the host needs a specific abbreviation.

Accounts and actions accept `isPending`. Pending actions communicate their state and prevent duplicate invocation. An action requires `label` and `onPress: () => void`. Present account switching, sign-out and other action failures through the consumer's toast or notification UI; accounts and actions do not accept an `error` prop. The panel-level `error` is reserved for account-list retrieval failures.

Use optional `secondaryTextLang` and `secondaryTextDir` when the subtitle has a different language or direction from the name. For Latin emails, supply `secondaryTextLang: 'en'` and `secondaryTextDir: 'ltr'` to retain English typography in Dhivehi mode: 16px/24px in the profile and 14px/20px in account rows. Profile emails stay centered and RTL row emails stay right-aligned. Omit these fields for translated subtitles such as team-account labels; they inherit the account language/direction.

Account-list retrieval errors use Veli Alert with `intent="danger"`, `appearance="subtle"` and `live="alert"`. The block uses the primitive's standard presentation without Tailwind overrides.

Action buttons show Veli Button's built-in pending spinner without a visible progress caption below them. Pending account rows replace their avatar image or initials with the same spinner icon in a 44px circle using the neutral avatar background. Names and secondary text remain visible; the avatar returns when pending ends without shifting the row. Spinner animation stops under reduced motion. The Avatar primitive is unchanged. Localized pending statuses remain available to screen readers without taking up layout space.

Callbacks are notifications, not promise handlers. Handle rejection, pending state, retries, selected-account updates, and navigation in your adapter. The executable adapter calls a host-supplied `onActionError(message)` on failure; connect it to your application's toast queue. The block never infers business rules or updates identity records.

## Host adapter pattern

The executable example below maps generic identity records to display data and keeps asynchronous operations in the application adapter. Its English labels are demonstration content; translate them in production.

For govmv-web, keep `useFrontendSession`, tenant filtering, and `useCopy` in the application. Map `tenant_uuid` to `id`, `tenant_name` to `displayName`, `tenant_photo` to `avatar.src`, and the appropriate translated subtitle to `secondaryText`. Map the current tenant to `selectedAccount`; supply the translated primary-user badge only when it matches the primary person. Build ordered personal/business groups in the adapter using the existing filtering policy; Veli sees only generic groups.

Wire the existing `session.selectTenant` through `onAccountSelect`. Hosts must supply account switching for any additional accounts they expose; filter out accounts that cannot be selected. Keep `logoutSession(markSessionSignedOut)` in the sign-out callback. The host resolves the configured delegation/account URL and opens it from the empty-state action; the block accepts no service-specific URL or navigation policy. Map theme preference to `appearance.value` and wire the app's preference setter to `onChange`. The mobile navigation's external theme control stays app-owned.

Mount this block only in the signed-in branch of the header adapter. Preserve the existing signed-out sign-in control and loading/likely-signed-in placeholders outside it. Coordinate `isOpen` and trigger disabling with the rest of the shell. Govmv-web adoption and real identity regression tests are tracked separately in PD-988.

## Accessibility and responsive behavior

The default Tailwind `sm` boundary is 640 CSS pixels. At and above it, the panel is 389px wide (constrained by the available viewport) and uses Veli Popover's default React Aria focus containment and outside dismissal. Below it, a custom bottom sheet is built directly with React Aria `ModalOverlay`, `Modal`, and `Dialog`. React Aria provides contained focus, restoration, background scroll protection, and scrim dismissal. The block authors the sheet surface and gestures without overriding Veli Modal internals; it can migrate to a Veli sheet primitive when one becomes available. Supply optional 16px appearance icons from your host icon library. The desktop appearance selector is omitted from the mobile layout.

The trigger exposes its dialog state and localized accessible name, with a persistent focus-token ring while open. Both panel surfaces use `surface-raised` in light and dark modes. Escape, outside/scrim press, and mobile grabber drag dismiss through `onOpenChange`; keyboard users also have a mobile close button. Focus returns to the trigger. Changing between mobile and desktop closes an open panel; the trigger and its avatar remain mounted. Closed overlays are removed from the keyboard and accessibility trees.

The mobile scrim matches Veli Modal: hard black at 60% opacity with uniform 6px backdrop blur in both themes. This designer-approved treatment uses `bg-black/60` and `backdrop-blur-[6px]` directly; it does not add a design token.

Drag starts only on the grabber. A downward drag exceeding 35% of sheet height, or more than 40 pixels at over 0.11 pixels/ms, dismisses it. Cancelled gestures reset without dismissing. Scrollable accounts and pinned sign-out remain independently usable. The sheet respects safe areas and a maximum height of 85svh; desktop content is constrained to the viewport. Its top corners use the 32px radius token. The notch starts 8px below the sheet top and is 4px high, followed by 24px to the active profile container (36px total). The headless close button is positioned outside normal layout flow and appears only on keyboard-visible focus, so pointer opening keeps it hidden and keyboard focus does not shift content. Sheet opening uses `duration-slow` and closing uses `duration-normal`, both with non-spring `ease-out`; drag dismissal continues from the released offset. The sheet background, notch, profile, and pinned footer move together on the headless Modal surface, so dragging cannot expose a stationary panel background above the content. CSS transitions handle the token-based motion; no additional motion dependency is required. Skeleton pulsing and sheet transitions stop under reduced motion.

Names and secondary text truncate visually while retaining their full accessible text. Host-provided language/direction metadata and logical layout support mixed English/LTR and Dhivehi/RTL. Loading, pending, and error meanings include text rather than relying on color. Motion respects reduced-motion preferences. Keep the default `sm` breakpoint when adopting, or update both the media query and responsive utilities in your copy.

The profile name and secondary text stay centered beneath the avatar in both LTR and RTL layouts. Account-row text aligns right in RTL. The Storybook language toolbar translates the sample accounts, labels, theme options and state messages into Dhivehi while preserving email addresses. Use its theme and language controls on any Account Panel story; there are no separate Dark or Dhivehi stories. Production translations remain host-owned.

Account rows use a custom React Aria button for their avatar/text layout, rather than overriding Veli Button's internal structure. Hover and pressing use `bg-neutral-alpha-200`, matching notification rows, with no scaling or ripple. Secondary text uses `text-base-muted`, as specified in Figma. Keyboard focus remains visible, and pending rows retain their names and cannot invoke selection again. Profile/account actions continue to use the public Veli Button; the custom sheet dismissal control uses a headless React Aria button.

The appearance control moves a single background pill between the selected options using Veli's `duration-slow` (350ms) and a damped variant of `ease-spring`: `cubic-bezier(0.34, 1.2, 0.64, 1)`. This retains a small bounce while limiting overshoot on the longer Light/Auto movement. It follows logical RTL order and updates immediately when reduced motion is requested. Theme application still belongs to the host.

Appearance option labels use `type-body-sm-regular` in Dhivehi (MV Faseyha, weight 400) and `type-body-sm-medium` in English. This keeps Dhivehi options lighter without changing the shared typography tokens.

Validate your surrounding header, routes, translations, fonts, screen readers and devices during adoption. Automated consumer checks cover keyboard/focus, dismissal, gestures, hydration, reflow, RTL, themes and reduced motion.

## Migration to 0.2.0

`onAccountSelect` is now required and additional accounts always render as actionable rows. Provide a real host callback and omit accounts the host cannot switch to; do not supply a no-op callback as a display-only replacement. Remove `isDisabled` and `error` from account/action objects, `isDisabled` from `appearance` and its options, and `labels.disabled`. The top-level trigger `isDisabled` remains supported for header-overlay coordination. Keep pending/error handling in your adapter, including guarding overlapping asynchronous operations when needed, and show action failures through consumer toasts. Retain panel-level `error` only for account-list retrieval failures.

## Customization and updates

Edit your installed source and adapter to fit the host. Keep authentication and routing outside the reusable presentation. Send reusable interaction fixes upstream.

1. Run `veli status` and read the new changelog and dependency requirements.
2. Run `veli update account-panel` for a three-way merge against the saved original.
3. Resolve labelled conflicts and run `veli update --continue account-panel`, or `veli update --abort account-panel` to restore your copy.
4. Re-run application validation and commit the working source and updated `.veli` baseline together.

Version 0.4.0 uses `@phosphor-icons/react` for its icons. Add `@phosphor-icons/react@^2.1.10` as a direct dependency when upgrading the copied source. Review whether your application still needs its legacy icon dependency before removing it.

Version 0.4.1 removes inline baseline spacing from the outer panel and shared avatar wrappers. The 44px trigger fits headers using `flex items-center` alongside 44px menu and search controls; profile and account-row avatars also retain their exact footprint. No adapter API changes or positional offsets are needed.

For the GOV.MV follow-up (PD-1045 / PD-988), publish the canonical block snapshot first, then run `veli update account-panel` in govmv-web and commit the updated editable source and `.veli/blocks/account-panel/` receipt together. Review the intervening dependency and API changes when upgrading from 0.2.1. Recheck the real authenticated header at 390 × 844 and desktop sizes, including themes, RTL, focus/dismissal and avatar image/fallback behavior. Keep identity and preference handling in the host adapter; the Veli consumer fixture does not replace that integration acceptance.

Receipts contain source commit and SHA-256 hashes. A `dirty` receipt identifies a local preview rather than a released source snapshot. Updating a Veli npm package does not update copied block source.

## Non-goals

The block does not discover sessions, sign users in, call an identity provider, implement account switching or logout, filter/authorize tenants, navigate, persist preferences, or send analytics. It contains no govmv-web, OneGov, Ory, Next.js, environment-variable or service-client imports. It introduces no registry, CLI capability, or npm package.

## Visual references

The account-panel presentation follows the supplied gov.mv Figma specs: [desktop panel](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21044), [desktop account states](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21192), [corrected desktop footer](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21193), [desktop without delegated accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1412-21274), [mobile accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1424-27102), and [mobile without delegated accounts](https://www.figma.com/design/UJmgh6ihn8EsMuOnwEJrOn/gov.mv?node-id=1424-27283). Profile photos and organization imagery remain host data. The mobile close control becomes visible on keyboard-visible focus, preserving the compact pointer layout while offering a named dismissal action.

Token authority: [Veli Design System](https://www.figma.com/design/4h7LJTwcIvXiwx5a1hQJqk/Veli-Design-System?node-id=1940-872). The Account Panel surface, text, neutral interaction colors, typography, radii, and small shadow were compared with its current variables and styles in both color modes for PD-1008; no token rebuild was needed.

The sheet structure follows [React Aria’s gesture-driven sheet example](https://react-aria.adobe.com/examples/sheet), adapted to Veli’s approved geometry, handle-only dragging, and non-spring motion. It preserves the host page layout rather than adopting the example’s page scaling or inertia.
